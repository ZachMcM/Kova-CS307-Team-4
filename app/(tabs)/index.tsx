import { useSession } from '@/components/SessionContext';
import { supabase } from '@/lib/supabase';
import { Redirect } from "expo-router";
import { useEffect, useState } from 'react';
import { Text } from "@/components/ui/text";


export default function IndexScreen() {
  // Redirect to the feed screen if logged in, to login page otherwise
  const { session } = useSession();
  const [showTutorial, setShowTutorial] = useState<Boolean | null>(null);

  const s2 = async () => {
    if (session) {
      await supabase
      .from('profile')
      .select("show_tutorial")
      .eq('userId', session.user.id)
      .then(({data: tutorialData}) => {
        if (tutorialData) setShowTutorial(tutorialData[0].show_tutorial);
      });
    } else {
      setShowTutorial(false);
    }
  }

  useEffect(() => {
    s2();
  }, [])

  return showTutorial == null ? (<><Text>Loading</Text></>) : (
    session == null ? (
      <Redirect href={"/login"}></Redirect>
    ) : (showTutorial ? (
        <Redirect href={"/tutorial/tutorial-profile"}></Redirect>
      ) : (<Redirect href="/(tabs)/feed" />)
    )
  );
}
