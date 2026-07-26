import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { invoke } from "@tauri-apps/api/core";
import {
  CheckSquare,
  LogOut,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  Layers,
  CheckCircle,
  Check,
} from "lucide-react";
import "./App.css";

// TS interface matching the Rust Task struct
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string; // "TODO" | "IN_PROGRESS" | "DONE"
  priority: string; // "LOW" | "MEDIUM" | "HIGH"
  dueDate: string | null;
  createdAt: string;
  userId: string;
}

// Supabase configuration loaded from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [view, setView] = useState<"login" | "signup" | "dashboard">("login");
  const [user, setUser] = useState<any>(null);
  
  // Auth Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [taskActionLoading, setTaskActionLoading] = useState(false);

  // Check auth session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setView("dashboard");
        fetchTasks(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setView("dashboard");
        fetchTasks(session.user.id);
      } else {
        setUser(null);
        setView("login");
        setTasks([]);
        setPendingCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Recalculate pending tasks using the Tauri Rust command
  const updatePendingCount = async (tasksList: Task[]) => {
    try {
      const count = await invoke("get_pending_task_count", { tasks: tasksList });
      setPendingCount(count as number);
    } catch (err) {
      console.error("Error invoking Rust command:", err);
    }
  };

  // Fetch tasks from Supabase
  const fetchTasks = async (userId: string) => {
    setLoadingTasks(true);
    try {
      const { data, error } = await supabase
        .from("Task")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false });

      if (error) throw error;
      const tasksList: Task[] = data || [];
      setTasks(tasksList);
      updatePendingCount(tasksList);
    } catch (err: any) {
      console.error("Error fetching tasks:", err.message);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Handle Authentication (Login)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
      setView("dashboard");
    } catch (err: any) {
      setAuthError(err.message || "Failed to log in");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Authentication (SignUp)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      if (error) throw error;
      
      // Auto-create User entry in database if needed, or prompt check email
      if (data.user) {
        // Supabase has triggers or code to upsert users, but write user to User table to be safe
        const userEmail = data.user.email || email;
        const userName = name || null;
        await supabase.from("User").upsert({
          id: data.user.id,
          email: userEmail,
          name: userName,
        });
        
        alert("Registration successful! Please check your email for confirmation (if enabled) or log in.");
        setView("login");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign up");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Create Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;
    setTaskActionLoading(true);

    try {
      const { data, error } = await supabase
        .from("Task")
        .insert({
          id: crypto.randomUUID(),
          title: newTaskTitle,
          description: newTaskDesc || null,
          priority: newTaskPriority,
          status: "TODO",
          dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
          userId: user.id,
          updatedAt: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const updatedTasks = [data[0], ...tasks];
        setTasks(updatedTasks);
        updatePendingCount(updatedTasks);
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskDueDate("");
      }
    } catch (err: any) {
      alert("Error adding task: " + err.message);
    } finally {
      setTaskActionLoading(false);
    }
  };

  // Toggle Task Completion via Checkbox
  const handleToggleCheckbox = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "DONE" ? "TODO" : "DONE";

    try {
      const { error } = await supabase
        .from("Task")
        .update({ 
          status: nextStatus,
          updatedAt: new Date().toISOString()
        })
        .eq("id", taskId);

      if (error) throw error;
      
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus } : t
      );
      setTasks(updatedTasks);
      updatePendingCount(updatedTasks);
    } catch (err: any) {
      alert("Error updating task: " + err.message);
    }
  };

  // Update Task Status via Dropdown Select
  const handleStatusChange = async (taskId: string, nextStatus: string) => {
    try {
      const { error } = await supabase
        .from("Task")
        .update({ 
          status: nextStatus,
          updatedAt: new Date().toISOString()
        })
        .eq("id", taskId);

      if (error) throw error;
      
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus } : t
      );
      setTasks(updatedTasks);
      updatePendingCount(updatedTasks);
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const { error } = await supabase.from("Task").delete().eq("id", taskId);
      if (error) throw error;

      const updatedTasks = tasks.filter((t) => t.id !== taskId);
      setTasks(updatedTasks);
      updatePendingCount(updatedTasks);
    } catch (err: any) {
      alert("Error deleting task: " + err.message);
    }
  };

  return (
    <div className="app-shell">
      {/* Auth Views */}
      {view === "login" && (
        <div className="auth-box fade-in">
          <div className="auth-logo">🕒</div>
          <h2>Sign In to TaskFlow</h2>
          <p className="auth-subtitle">Manage your tasks in a lightweight desktop shell</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {authError && <div className="error-banner">{authError}</div>}

            <button type="submit" className="btn-primary" disabled={authLoading}>
              {authLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <span onClick={() => { setView("signup"); setAuthError(""); }}>Sign Up</span>
          </p>
        </div>
      )}

      {view === "signup" && (
        <div className="auth-box fade-in">
          <div className="auth-logo">🕒</div>
          <h2>Create Desktop Account</h2>
          <p className="auth-subtitle">Sign up to sync your tasks with the Supabase database</p>
          
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Muhammad Hassan"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            {authError && <div className="error-banner">{authError}</div>}

            <button type="submit" className="btn-primary" disabled={authLoading}>
              {authLoading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <span onClick={() => { setView("login"); setAuthError(""); }}>Log In</span>
          </p>
        </div>
      )}

      {/* Dashboard View */}
      {view === "dashboard" && (
        <div className="dashboard-layout fade-in">
          {/* Top Bar */}
          <header className="navbar">
            <div className="nav-logo">
              <span className="logo-icon">🕒</span>
              <span className="logo-text">TaskFlow Desktop</span>
            </div>
            <div className="nav-actions">
              <span className="pending-badge">
                <AlertCircle size={14} /> {pendingCount} Pending Tasks
              </span>
              <span className="user-email">{user?.email}</span>
              <button className="btn-logout" onClick={handleLogout}>
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {/* Grid Layout for Form & List */}
          <div className="dashboard-content">
            <div className="main-grid">
              
              {/* Sidebar Task Creation */}
              <div className="sidebar-card">
                <h3>Add New Task</h3>
                <form onSubmit={handleAddTask}>
                  <div className="form-group">
                    <label>Task Title</label>
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="E.g., Review UI changes"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <textarea
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Add more details..."
                      rows={3}
                    />
                  </div>

                  <div className="form-group-row">
                    <div className="form-group flex-1">
                      <label>Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>

                    <div className="form-group flex-1">
                      <label>Due Date</label>
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-submit" disabled={taskActionLoading}>
                    <Plus size={16} /> {taskActionLoading ? "Adding..." : "Add Task"}
                  </button>
                </form>
              </div>

              {/* Task List Section */}
              <div className="task-list-container">
                <div className="list-header">
                  <h3>Your Tasks</h3>
                  <span className="total-label">{tasks.length} total</span>
                </div>

                {loadingTasks ? (
                  <div className="list-placeholder">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                  <div className="list-placeholder bg-cream-50">
                    <CheckSquare size={32} className="text-light" />
                    <p>No tasks found. Create one to get started!</p>
                  </div>
                ) : (
                  <div className="tasks-grid">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`task-item-card ${
                          task.status === "DONE" ? "status-done" : ""
                        }`}
                      >
                        <div className="task-checkbox-container">
                          <button
                            className={`task-checkbox ${task.status === "DONE" ? "checked" : ""}`}
                            onClick={() => handleToggleCheckbox(task.id, task.status)}
                            title={task.status === "DONE" ? "Mark incomplete" : "Mark complete"}
                          >
                            <Check size={12} strokeWidth={3} />
                          </button>
                        </div>
                        <div className="task-item-body">
                          <div className="task-item-header">
                            <h4 className="task-item-title">{task.title}</h4>
                            <span className={`p-badge ${task.priority.toLowerCase()}`}>
                              {task.priority}
                            </span>
                          </div>
                          {task.description && (
                            <p className="task-item-desc">{task.description}</p>
                          )}
                          <div className="task-item-meta">
                            {task.dueDate && (
                              <span className="meta-date">
                                <Calendar size={12} />
                                {new Date(task.dueDate).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                            <span className="meta-status">
                              <Layers size={12} /> {task.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                        <div className="task-item-actions">
                          <select
                            className={`status-select ${task.status.toLowerCase()}`}
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          >
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                          <button
                            className="btn-action-delete"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Delete Task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
