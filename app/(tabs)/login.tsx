import { Card } from "@/components/ui/card";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import Container from "@/components/Container";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { Link, LinkText } from "@/components/ui/link";



export default function HomeScreen() {
  const router = useRouter();
  return (
    <Container>
      <Card variant="ghost" className="p-10 mb-50">
          <VStack space="sm" className="mb-50">
            <Heading size="4xl">Sign In</Heading>
            <Text size="lg">Sign Into Your Kova Account</Text>
          </VStack>
      </Card>
      <Card variant="outline" className="m-[25px]">
        <VStack space="sm">
          <Text size="lg" className="ml-3 mt-5">Email</Text>
          <Input className="ml-3 mr-5">
            <InputField placeholder="Enter Email" />
        </Input>
        </VStack>
        <VStack space="sm">
          <Text size="lg" className="ml-3 mt-5">Password</Text>
          <Input className="ml-3 mr-5">
            <InputField placeholder="Enter Password" />
        </Input>
        <Button variant="solid" size="xl" action="secondary" className="mt-5 mb-5 bg-[#6FA8DC]"
          onPress={() => router.replace("/(tabs)/workout")}
          > {/* TODO implement button routing and login features */}
          <ButtonText className="text-white">Sign In</ButtonText>
        </Button>
          <Link>  {/* TODO actually add this link to a new page */} 
            <LinkText>Forgot Password?</LinkText>
            {/* TODO ask abt LinkText error */}
          </Link>
        </VStack>
      </Card>
      <VStack space="sm">
        <Heading className="text-center">New To Kova?</Heading>
        <Button size="xl" className="ml-[38px] mr-[38px] bg-[#6FA8DC]"
        onPress={() => router.replace("/(tabs)/groups")}
        >
          <ButtonText className="text-white">Register for Account</ButtonText>
        </Button>
      </VStack>
    </Container>
  );
}
