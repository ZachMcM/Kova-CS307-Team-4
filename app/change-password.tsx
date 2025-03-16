import Container from "@/components/Container";
import { useSession } from "@/components/SessionContext";
import {
    Button,
    ButtonText
} from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Link, LinkText } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Icon, ChevronLeftIcon } from '@/components/ui/icon';
import { HStack } from "@/components/ui/hstack";

export default function changePasswordScreen() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [verifyNewPassword, setVerifyNewPassword] = useState("");

    const toast = useToast();
    const router = useRouter();
    const { updateEmail, updatePassword } = useSession();

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
                <ButtonText>Cancel Password Change</ButtonText>
                </HStack>
            </Button>
            <Card variant="ghost" className="p-10 mb-50">
                <VStack space="sm" className="mb-50">
                    <Heading size="4xl">Change Password</Heading>
                    <Text size="lg">Change the Password For Your Kova Account</Text>
                </VStack>
            </Card>
            <Card variant="outline" className="m-[25px]">
                <VStack space="sm">
                    <Text size="lg" className="ml-3 mt-5">
                        Old Password
                    </Text>
                    <Input className="ml-3 mr-5">
                        <InputField
                            value={oldPassword.trim()}
                            onChangeText={setOldPassword}
                            placeholder="Enter Old Password"
                        />
                    </Input>
                </VStack>
                <VStack space="sm">
                    <Text size="lg" className="ml-3 mt-5">
                        New Password
                    </Text>
                    <Input className="ml-3 mr-5">
                        <InputField
                            value={newPassword.trim()}
                            onChangeText={setNewPassword}
                            placeholder="Enter New Password"
                        />
                    </Input>
                </VStack>
                <VStack space="sm">
                    <Text size="lg" className="ml-3 mt-5">
                        Verify New Password
                    </Text>
                    <Input className="ml-3 mr-5">
                        <InputField
                            value={verifyNewPassword.trim()}
                            onChangeText={setVerifyNewPassword}
                            placeholder="Enter New Password"
                            type="password"
                        />
                    </Input>
                    <Button
                        variant="solid"
                        size="xl"
                        action="kova"
                        className="mt-5 mb-5 bg-red-500"
                        onPress={() => {
                            /*signInUser(email, password)
                                .then((credentials: boolean) => {
                                    if (credentials) {
                                        showSuccessToast(toast, "Welcome Back to Kova")
                                        router.replace("/(tabs)");
                                        setSessionLoading(false);
                                    } else {
                                        showSuccessToast(toast, "OTP sign in success, redirecting to password reset");
                                        setSessionLoading(false);
                                        router.replace("/settings");
                                    }
                                })
                                .catch((error) => {
                                    console.log(error);
                                    showErrorToast(toast, error.message);
                                });*/
                        }}
                    >
                        <ButtonText className="text-white">Change Password</ButtonText>
                    </Button>
                </VStack>
            </Card>
        </Container>
    );
}