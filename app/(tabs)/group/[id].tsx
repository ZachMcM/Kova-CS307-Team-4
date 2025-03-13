import Container from "@/components/Container";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getGroup } from "@/services/groupServices";
import { ExtendedGroupWithCompetitions } from "@/types/extended-types";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";

export default function Group() {
  const { id } = useLocalSearchParams();

  const { data: group, isPending } = useQuery({
    queryKey: ["group", { id }],
    queryFn: async () => {
      const group = await getGroup(id as string);
      return group;
    },
  });

  return (
    // TODO work on this UI
    <Container>
      {
        isPending ? <Spinner/> : 
        <VStack space="md">
          <VStack>
            <Heading className="text-4xl lg:text-5xl xl:text-[56px]">{group?.title}</Heading>
            <Text>{group?.description}</Text>
          </VStack>
          {
            group?.competitions.map(comp => (
              <Link key={comp.id} href={{
                pathname: "/competition/[id]",
                params: { id: comp.id }
              }}>{comp.title}</Link>
            ))
          }
        </VStack>
      }
    </Container>
  );
}
