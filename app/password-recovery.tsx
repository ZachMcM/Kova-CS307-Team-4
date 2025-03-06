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
import { Icon, ChevronLeftIcon } from '@/components/ui/icon';
import { HStack } from "@/components/ui/hstack";


export default function PasswordRecoveryScreen() {
    const [RecoveryEmail, setEmail] = useState("");

    const toast = useToast();
    const router = useRouter();

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
        <Heading size="4xl">Password Recovery</Heading>
        <Text size="lg">Send an email to reset your password</Text>
      </VStack>
    </Card>
    <Card variant="outline" className="m-[25px]">
      <VStack space="sm">
        <Text size="lg" className="ml-3 mt-5">
          Recovery Email
        </Text>
        <Input className="ml-3 mr-5">
          <InputField
            value={RecoveryEmail.trim()}
            onChangeText={setEmail}
            placeholder="Enter Recovery Email"
          />
        </Input>
        <Button
          variant="solid"
          size="xl"
          action="kova"
          className="mt-5 mb-5"
          onPress={() => {
            showSuccessToast(toast, "Password recovery not yet implemented, redirecting to login");
            router.replace("/login");
          }}
        >
          <ButtonText className="text-white">Send Password Recovery</ButtonText>
        </Button>
      </VStack>
    </Card>
  </Container>
  );
}