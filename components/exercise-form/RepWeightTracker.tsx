import { SetData } from "@/types/exercise-data";
import { useEffect, useState } from "react";
import { TextInput } from "react-native";
import { Box } from "../ui/box";
import { Heading } from "../ui/heading";

export default function RepWeightTracker({
  exercise_id,
  editWeight,
  editReps,
  setIndex,
}: {
  exercise_id: string;
  editWeight: (id: string, setIndex: number, newWeight: string) => void;
  editReps: (id: string, setIndex: number, newReps: string) => void;
  setIndex: number;
}) {
  // we have to use our own state and update real values in useEffect
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  useEffect(() => {
    editReps(exercise_id, setIndex, reps);
    editWeight(exercise_id, setIndex, weight);
  }, [weight, reps]);

  return (
    <Box className="flex flex-row justify-between items-center">
      <Box className="rounded-md w-8 h-6 bg-secondary-500 flex flex-col justify-center items-center">
        <Heading size="sm">{setIndex + 1}</Heading>
      </Box>
      <Box className="rounded-md w-14 h-6 bg-secondary-500 flex flex-col justify-center items-center">
        <TextInput
          placeholder="0" 
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
      </Box>
      <Box className="rounded-md w-14 h-6 bg-secondary-500 flex flex-col justify-center items-center">
        <TextInput
          placeholder="0"
          value={reps}
          onChangeText={setReps}
          keyboardType="numeric"
        />
      </Box>
    </Box>
  );
}
