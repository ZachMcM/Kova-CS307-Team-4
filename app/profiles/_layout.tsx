import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="weight/index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 