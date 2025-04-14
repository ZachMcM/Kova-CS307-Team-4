import { Card } from "./ui/card";
import { VStack } from "./ui/vstack";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { CheckCircleIcon, CircleIcon, Icon } from "./ui/icon";
import { Progress, ProgressFilledTrack } from "./ui/progress";
import { Text } from "./ui/text";
import { formatDate } from "./CommentCard";


export default function GoalCard ({goal}: {goal: any}) {
  console.log(goal);

  return (
    <Card variant="outline" className="p-6">
      <VStack>
        <HStack className = "items-center justify-between mb-1">
          <Heading>{goal.reps} x {goal.exercise} @ {goal.weight}</Heading>
          {goal.progress == 100 ? (
            <Icon as={CheckCircleIcon} size="lg" className="ml-2 text-[#6FA8DC]" />
          ) : (
            <Icon as={CircleIcon} size="lg" className="ml-2 text-[#6FA8DC]" />
          )}
        </HStack>
        <HStack className = "items-center justify-between mb-1">
          <Text>Set on: {formatDate(goal.created)}</Text>
          <Text>{goal.progress}%</Text>
        </HStack>
        <Progress value = {goal.progress} size = "md" orientation = "horizontal">
          <ProgressFilledTrack></ProgressFilledTrack>
        </Progress>
      </VStack>
    </Card>
  );
}
