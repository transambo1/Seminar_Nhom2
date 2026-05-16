import { Redirect } from 'expo-router';

// Redirect root to login
export default function Index() {
  return <Redirect href="/login" />;
}
