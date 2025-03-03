import { ScrollView } from 'react-native';
import { getWorkout } from "@/services/asyncStorageServices";
import { useQuery } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import Container from '@/components/Container';
import { isUserInSession, signOutUser } from '@/services/loginServices';
import { showErrorToast } from '@/services/toastServices';
import { useToast } from '@/components/ui/toast';


export default function HomeScreen() {
  const router = useRouter();
  const toast = useToast();
  const { data: login_state } = useQuery({
    queryKey: ["login_state"],
    queryFn: async () => {
      const state = await isUserInSession();
      return state;
    }
  })

  return (
    <ScrollView>
      { login_state ? (<Redirect href={"/login"}></Redirect>) : (<></>)}
      <Container>
        <VStack className='mt-30'>
          <Button onPress={() => {
            signOutUser().then(() => { router.replace("/login") }).catch(error => {
              console.log(error);
              showErrorToast(toast, error.message);
            });
          }}>
            <ButtonText>
              Temporary Sign out Button
            </ButtonText>
          </Button>
        </VStack>
      </Container>
    </ScrollView>
  );
}
