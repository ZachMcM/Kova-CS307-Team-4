import CompetitionCard from "@/components/CompetitionCard";
import Container from "@/components/Container";
import { useSession } from "@/components/SessionContext";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getUserCompetitions } from "@/services/competitionServices";
import { useQuery } from "@tanstack/react-query";

export default function Competitions() {
  const { session } = useSession();

  const { data: competitions, isPending } = useQuery({
    queryKey: ["competitions"],
    queryFn: async () => {
      const competitions = await getUserCompetitions(
        session?.user.user_metadata.profileId
      );
      return competitions;
    },
  });

  return (
    <Container>
      <VStack space="2xl">
        <VStack space="sm">
          <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
            Competitions
          </Heading>
          <Text>View all your competitions</Text>
        </VStack>
        {isPending ? (
          <Spinner />
        ) : (
          competitions?.map((competition) => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))
        )}
      </VStack>
    </Container>
  );  
}
