import { ScrollView } from 'react-native';
import { getLoginState } from '@/services/asyncStorageServices';
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "expo-router";

export default function HomeScreen() {
  const { data: login_data } = useQuery({
    queryFn: async () => {
      const state = await getLoginState();
      return state;
    },
    queryKey: ["logged-in"]
  })
  return (
   <ScrollView>
      {(login_data==="false") ? (
        <Redirect href={"/(tabs)/login"}></Redirect>
      ) : (<> </>)} 
   </ScrollView> //TODO make home screen HTML when user is logged in
  );
}
