import Container from "@/components/Container";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { createAccount } from "@/services/loginServices";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const toast = useToast();
  const router = useRouter();

  return (
    <Container>
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
              value={email.trim()}
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
              value={password.trim()}
              onChangeText={setPassword}
              placeholder="Enter Password"
            />
          </Input>
          <Text size="lg" className="ml-3 mt-5">
            Confirm Password
          </Text>
          <Input className="ml-3 mr-5">
            <InputField
              value={confirmPassword.trim()}
              onChangeText={setConfirmPassword}
              placeholder="Enter Password"
            />
          </Input>
          <Button
            variant="solid"
            size="xl"
            action="secondary"
            className="mt-5 mb-5 bg-[#6FA8DC]"
            onPress={() => {
              createAccount(email, password, confirmPassword).then(() => { 
                router.replace("/(tabs)/profile");
                showSuccessToast(toast, "Welcome to Kova!")
              }).catch(error => {
                console.log(error);
                showErrorToast(toast, error.message);
              })
            }}
          >
            <ButtonText className="text-white">Register For Account</ButtonText>
          </Button>
        </VStack>
      </Card>
    </Container>
  );
}
