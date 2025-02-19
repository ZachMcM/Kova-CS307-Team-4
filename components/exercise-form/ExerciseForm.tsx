import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { AddIcon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { ExerciseData } from "@/types/exercise-data";
import RepWeightTracker from "./RepWeightTracker";

// exercise form to be used in live workout and template creation functions to update where data is stored are passed

// TODO replace any with exercise type generated by supabase
export default function ExerciseForm({
  name,
  id,
  exercises,
  editWeight,
  editReps,
  addSet,
  removeSet,
}: {
  name: string;
  id: string;
  exercises: ExerciseData[];
  editWeight: (id: string, setIndex: number, newWeight: string) => void;
  editReps: (id: string, setIndex: number, newReps: string) => void;
  removeSet: (id: string, setIndex: number) => void;
  addSet: (id: string) => void;
}) {
  return (
    <VStack space="xl">
      <Heading className="text-[#6FA8DC]">{name}</Heading>
      <VStack space="sm">
        <Box className="flex flex-row justify-between items-center">
          <Box className="w-8 h-6 flex flex-col justify-center items-center">
            <Heading size="sm">Set</Heading>
          </Box>
          <Box className="w-14 h-6 flex flex-col justify-center items-center">
            <Heading size="sm">lbs</Heading>
          </Box>
          <Box className="w-14 h-6 flex flex-col justify-center items-center">
            <Heading size="sm">Reps</Heading>
          </Box>
        </Box>
        {exercises &&
          exercises
            .find((exercise) => exercise.info.id == id)
            ?.sets.map((set, i) => (
              // TODO implement editing weight, reps, removing sets
              <RepWeightTracker
                key={id + i}
                setIndex={i}
                editReps={editReps}
                editWeight={editWeight}
                exercise_id={id}
              />
            ))}
      </VStack>
      <Button
        variant="solid"
        action="secondary"
        size="xs"
        onPress={() => addSet(id)}
      >
        <ButtonText>Add Set</ButtonText>
        <ButtonIcon as={AddIcon} />
      </Button>
    </VStack>
  );
}
