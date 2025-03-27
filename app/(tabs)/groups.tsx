import Container from "@/components/Container";
import GroupCard from "@/components/GroupCard";
import { useSession } from "@/components/SessionContext";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getUserGroups } from "@/services/groupServices";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { session } = useSession();

  const { data: groups, isPending } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const groups = await getUserGroups(session?.user.user_metadata.profileId);
      return groups;
    },
  });

  const router = useRouter();

  return (
    // TODO work on this UI
    <Container>
      <VStack space="2xl">
        <VStack space="sm">
          <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
            Groups
          </Heading>
          <Text>View all of your groups</Text>
        </VStack>
        {isPending ? (
          <Spinner />
        ) : (
          <VStack space="md">
            {groups?.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
}
