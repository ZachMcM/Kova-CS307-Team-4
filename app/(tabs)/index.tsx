import { useSession } from '@/components/SessionContext';
import { supabase } from '@/lib/supabase';
import { Redirect } from "expo-router";
import { useEffect, useState } from 'react';
import { boolean } from 'zod';


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
        console.log(JSON.stringify(tutorialData));
        if (tutorialData) setShowTutorial(tutorialData[0].show_tutorial);
      });
    }
  }

  useEffect(() => {
    s2();
  }, [])

  return showTutorial == null ? (<></>) : (
    session == null ? (
      <Redirect href={"/login"}></Redirect>
    ) : (showTutorial ? (
        <Redirect href={"/tutorial/tutorial-profile"}></Redirect>
      ) : (<Redirect href="/(tabs)/feed" />)
    )
  );
}
