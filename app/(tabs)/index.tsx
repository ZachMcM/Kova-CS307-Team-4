import { ScrollView } from 'react-native';
import { getWorkout } from "@/services/asyncStorageServices";
import { getLoginState, logoutUser } from '@/services/asyncStorageServices';
import { useQuery } from "@tanstack/react-query";
import { Redirect, useRouter} from "expo-router";
import { Button } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import Container from '@/components/Container';


export default function HomeScreen() {
  const router = useRouter()
  const { data: login_data } = useQuery({
    queryFn: async () => {
      const state = await getLoginState();
      return state;
    },
    queryKey: ["logged-in"]
  })
  return (
   <ScrollView>
    {(login_data==="false") ? (<Redirect href={"/login"}></Redirect>) : (<> </>)}
      <Container>
        <VStack className='mt-30'>
          <Button onPress={() => {logoutUser(); router.replace("/login")}}>
          </Button>
        </VStack> 
      </Container>
   </ScrollView> //TODO make home screen HTML when user is logged in
  );
}
