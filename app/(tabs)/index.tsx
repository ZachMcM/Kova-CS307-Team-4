import { ScrollView } from 'react-native';
import { getWorkout } from "@/services/asyncStorageServices";
import { useQuery } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import Container from '@/components/Container';
import { showErrorToast } from '@/services/toastServices';
import { useToast } from '@/components/ui/toast';
import { SessionProvider, useSession } from '@/components/SessionContext';


export default function IndexScreen() {
  // Redirect to the feed screen if logged in, to login page otherwise
  const { session } = useSession();
  return session == null ? (<Redirect href={"/login"}></Redirect>) : <Redirect href="/(tabs)/feed"/>;
}
