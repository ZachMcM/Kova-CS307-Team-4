import { Card } from "./ui/card";
import { VStack } from "./ui/vstack";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { AlertCircleIcon, CheckIcon, Icon } from "./ui/icon";
import { Progress, ProgressFilledTrack } from "./ui/progress";


export default function GoalCard ({goal}: {goal: any}) {
  return (
    <Card variant="outline" className="p-6">
      <VStack>
        <HStack>
          <Heading>{goal.reps} x {goal.exercise} @ {goal.weight}</Heading>
          {goal.progress == 100 ? (
            <Icon as={CheckIcon} size="lg" className="ml-2" />
          ) : (
            <Icon as={AlertCircleIcon} size="lg" className="ml-2" />
          )}
        </HStack>
        <Progress value = {goal.progress} size = "md" orientation = "horizontal">
          <ProgressFilledTrack></ProgressFilledTrack>
        </Progress>
      </VStack>
    </Card>
  );
}
