import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#151821',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#090a0f',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'TaskFlow Dashboard',
        }}
      />
    </Stack>
  );
}
