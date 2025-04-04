import Container from "@/components/Container";
import { useSession } from "@/components/SessionContext";
import {
    Button,
    ButtonText
} from "@/components/ui/button";
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

export default function changeUsernameScreen() {
    const [verifyPassword, setVerifyPassword] = useState("");
    const [newUsername, setNewUsername] = useState("");

    const toast = useToast();
    const router = useRouter();
    const { updateUsername } = useSession();

    return (
        <Container>
            <Button
                variant = "outline"
                size = "md"
                action = "primary"
                onPress={() => router.replace("/settings")}
                className = "p-3">
                <HStack>
                <Icon as={ChevronLeftIcon} className="mt-0"></Icon>
                <ButtonText>Cancel Username Change</ButtonText>
                </HStack>
            </Button>
            <Card variant="ghost" className="p-10 mb-50">
                <VStack space="sm" className="mb-50">
                    <Heading size="4xl">Change Username</Heading>
                    <Text size="lg">Change the Username For Your Kova Account</Text>
                </VStack>
            </Card>
            <Card variant="outline" className="m-[25px]">
                <VStack space="sm">
                    <Text size="lg" className="ml-3 mt-5">
                        Verify Password
                    </Text>
                    <Input className="ml-3 mr-5">
                        <InputField
                            value={verifyPassword.trim()}
                            onChangeText={setVerifyPassword}
                            placeholder="Enter Account Password"
                            type="password"
                        />
                    </Input>
                </VStack>
                <VStack space="sm">
                    <Text size="lg" className="ml-3 mt-5">
                        New Username
                    </Text>
                    <Input className="ml-3 mr-5">
                        <InputField
                            value={newUsername.trim()}
                            onChangeText={setNewUsername}
                            placeholder="Enter New Username"
                        />
                    </Input>
                    <Button
                        variant="solid"
                        size="xl"
                        action="kova"
                        className="mt-5 mb-5 bg-red-500"
                        onPress={() => {
                            updateUsername(verifyPassword, newUsername)
                                .then(() => {
                                    showSuccessToast(toast, "Successfully changed username")
                                    router.replace("/settings")
                                }).catch((error) => {
                                    console.log(error)
                                    showErrorToast(toast, error.message)
                                })
                        }}
                    >
                        <ButtonText className="text-white">Change Username</ButtonText>
                    </Button>
                </VStack>
            </Card>
        </Container>
    );
}