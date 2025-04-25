import Container from "@/components/Container";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Icon, ChevronLeftIcon } from '@/components/ui/icon';
import { HStack } from "@/components/ui/hstack";
import { useSession } from "@/components/SessionContext";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const toast = useToast();
  const router = useRouter();
  const { createAccount, setSessionLoading, sessionLoading, showTutorial } = useSession();

  return (
    <Container>
      <Button
        variant = "outline"
        size = "md"
        action = "primary"
        onPress={() => router.replace("/login")}
        className = "p-3">
        <HStack>
        <Icon as={ChevronLeftIcon} className="mt-0"></Icon>
        <ButtonText>Back to Login</ButtonText>
        </HStack>
    </Button>
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
            Username
          </Text>
          <Input className="ml-3 mr-5">
            <InputField
              value={username.trim()}
              onChangeText={setUsername}
              placeholder="Enter Username"
            />
          </Input>
        </VStack>
        <VStack space="sm">
          <Text size="lg" className="ml-3 mt-5">
            Display Name
          </Text>
          <Input className="ml-3 mr-5">
            <InputField
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter Display Name: John Kova"
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
              type="password"
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
              type="password"
            />
          </Input>
          <Button
            variant="solid"
            size="xl"
            action="kova"
            className="mt-5 mb-5"
            onPress={() => {
              setSessionLoading(true)
              createAccount(email, password, confirmPassword, username, displayName).then((signUpData) => { 
                router.replace("/tutorial/tutorial-profile");
                setSessionLoading(false)
                showSuccessToast(toast, "Welcome to Kova!")
              }).catch(error => {
                console.log(error);
                setSessionLoading(false)
                showErrorToast(toast, error.message);
              })
            }}
          >
            <ButtonText className="text-white">Register For Account</ButtonText>
            {sessionLoading && <ButtonSpinner color="#FFF" />}
          </Button>
          
          <Text className="text-center my-2">OR</Text>
          
          <Button
            variant="outline"
            size="xl"
            className="mb-3"
            onPress={() => {
              // Google registration functionality will be added later
            }}
          >
            <HStack space="sm" className="items-center justify-center">
              <ButtonText>Register with Google</ButtonText>
            </HStack>
          </Button>
        </VStack>
      </Card>
    </Container>
  );
}
