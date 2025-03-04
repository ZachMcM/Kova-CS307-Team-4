import Container from "@/components/Container";
import { useSession } from "@/components/SessionContext";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Link, LinkText } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { showErrorToast } from "@/services/toastServices";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const toast = useToast();
  const router = useRouter();
  const { signInUser } = useSession();

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
              type="password"
            />
          </Input>
          <Button
            variant="solid"
            size="xl"
            action="secondary"
            className="mt-5 mb-5 bg-[#6FA8DC]"
            onPress={() => {
              signInUser(email, password). then(() => {
                router.replace("/(tabs)")
              }).catch(error => {
                  console.log(error);
                  showErrorToast(toast, error.message);
                })
            }}
          >
            <ButtonText className="text-white">Sign In</ButtonText>
          </Button>
          <Link onPress= {() => router.replace("/password-recovery")}>
            <LinkText>Forgot Password?</LinkText>
          </Link>
        </VStack>
      </Card>
      <VStack space="sm">
        <Heading className="text-center">New To Kova?</Heading>
        <Button
          size="xl"
          className="ml-[38px] mr-[38px] bg-[#6FA8DC]"
          onPress={() => router.replace("./register")}
        >
          <ButtonText className="text-white">Register for Account</ButtonText>
        </Button>
      </VStack>
    </Container>
  );
}
