import { Card } from "../ui/card";
import { Skeleton, SkeletonText } from "../ui/skeleton";
import { VStack } from "../ui/vstack";

export default function TemplateCardSkeleton() {
  return (
    <Card variant="outline" className="p-6">
      <VStack space="xl">
        <VStack space="md">
          <SkeletonText className="h-3"/>
          <SkeletonText className="h-2 w-1/2" />
        </VStack>
        <Skeleton className="h-10" />
      </VStack>
    </Card>
  );
}
