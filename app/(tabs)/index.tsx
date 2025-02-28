import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // Redirect to the feed screen
  return <Redirect href="/(tabs)/feed" />;
}
