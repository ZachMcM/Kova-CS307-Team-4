import { useSession } from '@/components/SessionContext';
import { Redirect } from "expo-router";


export default function IndexScreen() {
  // Redirect to the feed screen if logged in, to login page otherwise
  const { session } = useSession();
  return session == null ? (<Redirect href={"/login"}></Redirect>) : <Redirect href="/(tabs)/feed"/>;
  //return session == null ? (<Redirect href={"/tutorial"}></Redirect>) : <Redirect href="/tutorial"/>;
}
