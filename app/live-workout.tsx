import Container from "@/components/Container";
import { LiveWorkoutProvider } from "@/components/forms/live-workout/LiveWorkoutContext";
import LiveWorkoutForm from "@/components/forms/live-workout/LiveWorkoutForm";
import { getWorkout } from "@/services/asyncStorageServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "expo-router";

export default function LiveWorkout() {
  const { data: workout, isPending } = useQuery({
    queryFn: async () => {
      const workout = await getWorkout();
      return workout;
    },
    queryKey: ["live-workout"],
  });
  
  return (
    <Container>
      {/* TODO determine what loading state should look like */}
      {isPending ? (
        // TODO Show some loading state
        <></>
      ) : workout ? (
        <LiveWorkoutProvider initWorkout={workout}>
          <LiveWorkoutForm />
        </LiveWorkoutProvider>
      ) : (
        <Redirect href="/" />
      )}
    </Container>
  );
}
