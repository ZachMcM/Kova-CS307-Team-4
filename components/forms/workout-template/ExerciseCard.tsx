import Tag from "@/components/Tag";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { Tables } from "@/types/database.types";
import { ExtendedExercise } from "@/types/extended-types";

export default function ExerciseCard({ exercise }: { exercise: ExtendedExercise }) {

  return (
    <Card variant="outline">
    <VStack space="md">
      <Heading size="md">{exercise.name}</Heading>
      <Box className="flex flex-row flex-wrap gap-2">
        {exercise.tags.map((tag: Tables<"tag">) => (
          <Tag key={tag.id} tag={tag} />
        ))}
      </Box>
    </VStack>
  </Card>
  )
}