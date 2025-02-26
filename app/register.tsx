import Container from "@/components/Container";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import {
  getLoginState,
  registerAccount,
} from "@/services/asyncStorageServices";
import { showErrorToast } from "@/services/toastServices";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const toast = useToast();

  const router = useRouter();
  const { data: login_state } = useQuery({
    queryKey: ["logged-in"],
    queryFn: async () => {
      const state = await getLoginState();
      return state;
    },
  });

  const { mutate: register } = useMutation({
    mutationFn: async () => {
      if (password === confirmPassword) {
        const state = await registerAccount(email, password);
      } else {
        throw new Error("Password and Confirm Password do not match");
      }
    },
    onSuccess: () => {
      router.replace("/(tabs)/profile");
    },
    onError: (e) => {
      console.log(e);
      showErrorToast(toast, e.message);
    },
  });

  return (
    <Container>
      {login_state === "true" ? <Redirect href={"/"}></Redirect> : <></>}
      <Card variant="ghost" className="p-10 mb-50">
        <VStack space="sm" className="mb-50">
          <Heading size="4xl">Account Registration</Heading>
          <Text size="lg">Register for Kova</Text>
        </VStack>
      </Card>
      <Card variant="outline" className="m-[25px]">
        <VStack space="sm">
          <Text size="lg" className="ml-3 mt-5">
            Email
          </Text>
          <Input className="ml-3 mr-5">
            <InputField
              value={email}
              onChangeText={setEmail}
              placeholder="Enter Email"
            />
          </Input>
        </VStack>
        <VStack space="sm">
          <Text size="lg" className="ml-3 mt-5">
            Password
          </Text>
          <Input className="ml-3 mr-5">
            <InputField
              value={password}
              onChangeText={setPassword}
              placeholder="Enter Password"
            />
          </Input>
          <Text size="lg" className="ml-3 mt-5">
            Confirm Password
          </Text>
          <Input className="ml-3 mr-5">
            <InputField
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Enter Password"
            />
          </Input>
          <Button
            variant="solid"
            size="xl"
            action="secondary"
            className="mt-5 mb-5 bg-[#6FA8DC]"
            onPress={() => register()}
          >
            {/* TODO implement button routing and login features */}
            <ButtonText className="text-white">Register For Account</ButtonText>
          </Button>
        </VStack>
      </Card>
    </Container>
  );
}
