import { Card } from "@/components/ui/card";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import Container from "@/components/Container";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Redirect, useRouter } from "expo-router";
import { Link, LinkText } from "@/components/ui/link";
import { useQuery } from "@tanstack/react-query";
import { getLoginState, loginUser } from "@/services/asyncStorageServices";

export default function RegisterScreen() {
  const router = useRouter();
  const { data: login_state } = useQuery({
    queryKey: ["logged-in"],
    queryFn: async () => {
      const state = await getLoginState();
      return state;
    },
  })

  return (
    
    <Container>
      {(login_state==="true") ? (
              <Redirect href={"/"}></Redirect>
            ) : (<> </>)} 

      <Card variant="ghost" className="p-10 mb-50">
          <VStack space="sm" className="mb-50">
            <Heading size="4xl">Account Registration</Heading>
            <Text size="lg">Register for Kova</Text>
          </VStack>
      </Card>
      <Card variant="outline" className="m-[25px]">
        <VStack space="sm">
          <Text size="lg" className="ml-3 mt-5">Email</Text>
          <Input className="ml-3 mr-5">
            <InputField id="email_input" placeholder="Enter Email" />
        </Input>
        </VStack>
        <VStack space="sm">
          <Text size="lg" className="ml-3 mt-5">Password</Text>
          <Input className="ml-3 mr-5">
            <InputField id="password_input" placeholder="Enter Password" />
        </Input>
        <Text size="lg" className="ml-3 mt-5">Confirm Password</Text>
          <Input className="ml-3 mr-5">
            <InputField id="password_input" placeholder="Enter Password" />
        </Input>
        <Button variant="solid" size="xl" action="secondary" className="mt-5 mb-5 bg-[#6FA8DC]"
          onPress={() => router.replace("/(tabs)/workout")}
          > {/* TODO implement button routing and login features */}
          <ButtonText className="text-white">Register For Account</ButtonText>
        </Button>
        </VStack>
      </Card>
    </Container>
  );
}
