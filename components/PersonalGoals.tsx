import { useState } from "react";
import { Alert, AlertIcon, AlertText } from "./ui/alert";
import { Heading } from "./ui/heading";
import { InfoIcon } from "./ui/icon";
import { VStack } from "./ui/vstack";
import GoalCard from "./GoalCard";

export default function PersonalGoals({goals} : {goals: string}) {
  console.log("User goals:", goals);

  const stringifiedGoals = JSON.stringify(goals);
  
  const [userGoals, setUserGoals] = useState<any[]>(() => {
    try {
      return JSON.parse(stringifiedGoals);
    }
    catch (error) {
      console.error("Error parsing user goals:", error);
      return [];
    }
  });

  return (
    <VStack space="md">
      <Heading size="2xl">Personal Goals</Heading>
      {userGoals ? (
        <VStack space="md">
          {userGoals.map((goal) => (
              <GoalCard key={goal.exercise + goal.reps + goal.weight} goal={goal} />
            ))}
        </VStack>
      ) : (
        <Alert action="muted" variant="solid">
          <AlertIcon as={InfoIcon} />
          <AlertText>No personal goals</AlertText>
        </Alert>
      )}
    </VStack>
  );
}
