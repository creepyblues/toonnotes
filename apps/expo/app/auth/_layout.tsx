/**
 * Auth Layout
 *
 * Stack navigator for auth screens.
 * No header, simple stack for login and callback flows.
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="callback" />
    </Stack>
  );
}
