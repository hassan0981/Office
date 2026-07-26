import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from 'expo-router';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  createdAt: string;
  userId: string;
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form/Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState(''); // Text input for date

  // Setup Logout button in Header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Task')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setTasks(data || []);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const handleToggleStatus = async (task: Task) => {
    const statusOrder: Record<Task['status'], Task['status']> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO',
    };
    const nextStatus = statusOrder[task.status];

    // Optimistic UI update
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, status: nextStatus } : t)));

    const { error } = await supabase
      .from('Task')
      .update({ status: nextStatus })
      .eq('id', task.id);

    if (error) {
      Alert.alert('Error', 'Failed to update task status');
      // Rollback
      setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, status: task.status } : t)));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          // Optimistic UI update
          const originalTasks = [...tasks];
          setTasks(prev => prev.filter(t => t.id !== taskId));

          const { error } = await supabase
            .from('Task')
            .delete()
            .eq('id', taskId);

          if (error) {
            Alert.alert('Error', 'Failed to delete task');
            setTasks(originalTasks); // Rollback
          }
        },
      },
    ]);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskStatus('TODO');
    setTaskPriority('MEDIUM');
    setTaskDueDate('');
    setModalVisible(true);
  };

  const openEditModal = (task: Task) => {
    setIsEditing(true);
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setModalVisible(true);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Validation Error', 'Task title is required');
      return;
    }

    let parsedDueDate = null;
    if (taskDueDate.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(taskDueDate.trim())) {
        Alert.alert('Validation Error', 'Due date must be in YYYY-MM-DD format');
        return;
      }
      parsedDueDate = new Date(taskDueDate.trim()).toISOString();
    }

    setLoading(true);
    setModalVisible(false);

    try {
      if (isEditing && editingTaskId) {
        const { error } = await supabase
          .from('Task')
          .update({
            title: taskTitle.trim(),
            description: taskDescription.trim() || null,
            status: taskStatus,
            priority: taskPriority,
            dueDate: parsedDueDate,
          })
          .eq('id', editingTaskId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('Task').insert({
          title: taskTitle.trim(),
          description: taskDescription.trim() || null,
          status: taskStatus,
          priority: taskPriority,
          dueDate: parsedDueDate,
          userId: user?.id,
        });

        if (error) throw error;
      }

      fetchTasks();
    } catch (err: any) {
      Alert.alert('Error saving task', err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const setDueDatePreset = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    setTaskDueDate(d.toISOString().split('T')[0]);
  };

  // Filtered tasks logic
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'DONE':
        return '#10b981'; // Green
      case 'IN_PROGRESS':
        return '#3b82f6'; // Blue
      default:
        return '#f59e0b'; // Yellow/Orange
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'HIGH':
        return '#ef4444'; // Red
      case 'MEDIUM':
        return '#f59e0b'; // Orange
      default:
        return '#10b981'; // Green
    }
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {/* Status Filters */}
          <Text style={styles.filterSectionLabel}>Status:</Text>
          {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterTab, statusFilter === status && styles.activeFilterTab]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.filterTabText, statusFilter === status && styles.activeFilterTabText]}>
                {status.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {/* Priority Filters */}
          <Text style={styles.filterSectionLabel}>Priority:</Text>
          {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map(priority => (
            <TouchableOpacity
              key={priority}
              style={[styles.filterTab, priorityFilter === priority && styles.activeFilterTab]}
              onPress={() => setPriorityFilter(priority)}
            >
              <Text style={[styles.filterTabText, priorityFilter === priority && styles.activeFilterTabText]}>
                {priority}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tasks List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No tasks found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <View style={styles.cardHeader}>
                <TouchableOpacity
                  style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]}
                  onPress={() => handleToggleStatus(item)}
                >
                  <Text style={styles.statusIndicatorText}>
                    {item.status === 'DONE' ? '✓' : item.status === 'IN_PROGRESS' ? '▶' : '○'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <Text
                    style={[
                      styles.taskTitle,
                      item.status === 'DONE' && styles.taskTitleDone,
                    ]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  {item.description && (
                    <Text style={styles.taskDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.badgesContainer}>
                  <View style={[styles.badge, { borderColor: getPriorityColor(item.priority) }]}>
                    <Text style={[styles.badgeText, { color: getPriorityColor(item.priority) }]}>
                      {item.priority}
                    </Text>
                  </View>
                  {item.dueDate && (
                    <View style={styles.dueDateBadge}>
                      <Text style={styles.dueDateText}>📅 {formatDueDate(item.dueDate)}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.actionIconButton}
                    onPress={() => openEditModal(item)}
                  >
                    <Text style={styles.editActionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIconButton}
                    onPress={() => handleDeleteTask(item.id)}
                  >
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add / Edit Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Task' : 'Add New Task'}</Text>
            <ScrollView style={styles.modalForm}>
              <Text style={styles.modalLabel}>Task Title *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter title"
                placeholderTextColor="#6b7280"
                value={taskTitle}
                onChangeText={setTaskTitle}
              />

              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Enter description"
                placeholderTextColor="#6b7280"
                value={taskDescription}
                onChangeText={setTaskDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.modalLabel}>Status</Text>
              <View style={styles.selectorRow}>
                {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.selectorButton,
                      taskStatus === status && { backgroundColor: getStatusColor(status) },
                    ]}
                    onPress={() => setTaskStatus(status)}
                  >
                    <Text
                      style={[
                        styles.selectorButtonText,
                        taskStatus === status && styles.activeSelectorText,
                      ]}
                    >
                      {status.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Priority</Text>
              <View style={styles.selectorRow}>
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.selectorButton,
                      taskPriority === priority && { backgroundColor: getPriorityColor(priority) },
                    ]}
                    onPress={() => setTaskPriority(priority)}
                  >
                    <Text
                      style={[
                        styles.selectorButtonText,
                        taskPriority === priority && styles.activeSelectorText,
                      ]}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Due Date (YYYY-MM-DD, Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 2026-08-15"
                placeholderTextColor="#6b7280"
                value={taskDueDate}
                onChangeText={setTaskDueDate}
                autoCapitalize="none"
              />

              <View style={styles.presetRow}>
                <TouchableOpacity style={styles.presetButton} onPress={() => setDueDatePreset(0)}>
                  <Text style={styles.presetButtonText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => setDueDatePreset(1)}>
                  <Text style={styles.presetButtonText}>Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.presetButton} onPress={() => setDueDatePreset(7)}>
                  <Text style={styles.presetButtonText}>1 Week</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.presetButton, { backgroundColor: '#374151' }]}
                  onPress={() => setTaskDueDate('')}
                >
                  <Text style={styles.presetButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBtnCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSave]}
                  onPress={handleSaveTask}
                >
                  <Text style={styles.modalBtnSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090a0f',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#374151',
    marginRight: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#151821',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#242936',
  },
  filtersContainer: {
    paddingVertical: 6,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  filterSectionLabel: {
    color: '#9ca3af',
    alignSelf: 'center',
    marginRight: 8,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#151821',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#242936',
  },
  activeFilterTab: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterTabText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: '#151821',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#242936',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  statusIndicatorText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  titleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  taskDesc: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#242936',
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  dueDateBadge: {
    backgroundColor: '#1f2430',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dueDateText: {
    color: '#9ca3af',
    fontSize: 11,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionIconButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 12,
  },
  editActionText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 13,
  },
  deleteActionText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#3b82f6',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 32,
    marginTop: -2,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#151821',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#242936',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalForm: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#1f2430',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2d3446',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectorButton: {
    flex: 1,
    backgroundColor: '#1f2430',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2d3446',
  },
  selectorButtonText: {
    color: '#9ca3af',
    fontWeight: 'bold',
    fontSize: 13,
  },
  activeSelectorText: {
    color: '#fff',
  },
  presetRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  presetButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 4,
  },
  presetButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalBtnCancel: {
    backgroundColor: '#27272a',
  },
  modalBtnCancelText: {
    color: '#d4d4d8',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBtnSave: {
    backgroundColor: '#3b82f6',
  },
  modalBtnSaveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
