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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogBackdrop,
} from "@/components/ui/alert-dialog";
import { Box } from "@/components/ui/box";

export default function deleteAccountScreen() {
    const [verifyPassword, setVerifyPassword] = useState("");
    const [showAlertDialog, setShowAlertDialog] = useState(false);
    const warningMessage = "This will remove your posts from Kova, delete your profile, and remove your account from all of your groups. This is permanent and cannot be undone.\nYour email and username will also be able to be used again."

    const toast = useToast();
    const router = useRouter();
    const { deleteAccount } = useSession();

    //!OTPSignIn removes the back button and Old Password text entry for OTP password reset logins
    return (
        <Container>
            <Button
                variant = "outline"
                size = "md"
                action = "primary"
                onPress={() => {
                    router.replace("/settings")
                }}
                className = "p-3">
                <HStack>
                  <Icon as={ChevronLeftIcon} className="mt-0"></Icon>
                  <ButtonText>Back to Profile Page</ButtonText>
                </HStack>
            </Button>
            <Card variant="ghost" className="p-10 mb-50">
                <VStack space="sm" className="mb-30">
                    <Heading size="4xl">Delete Account</Heading>
                    <Text size="lg">Delete your Kova Account</Text>
                </VStack>
                <VStack space="sm" className="mb-15">
                  <Card variant="outline" className="mt-10">
                    <Heading size="xl">Deleting your account is permanent!</Heading>
                    <Text size="lg" className="text-wrap">{warningMessage}</Text>
                  </Card>
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
                            placeholder="Enter Password"
                            type="password"
                        />
                    </Input>
                    <Button
                        variant="solid"
                        size="xl"
                        action="kova"
                        className="mt-5 mb-5 bg-red-500"
                        onPress={() => {
                          setShowAlertDialog(true);
                        }}
                    >
                        <ButtonText className="text-white">Delete Account</ButtonText>
                    </Button>
                </VStack>
                <AlertDialog isOpen={showAlertDialog} onClose={() => {setShowAlertDialog(false)}} size="md">
                  <AlertDialogBackdrop />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <Heading className="text-typography-950 font-semibold" underline={true} size="md">
                        Confirm Account Deletion
                      </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                      <Text size="sm">
                        Are you sure you want to delete your account? This action cannot be undone.
                      </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter className="">
                      <Button
                        variant="outline"
                        action="secondary"
                        onPress={() => {setShowAlertDialog(false)}}
                        size="sm"
                      >
                        <ButtonText>Cancel</ButtonText>
                      </Button>
                      <Button size="sm" variant="solid" className="bg-red-500" onPress={() => {
                        deleteAccount(verifyPassword)
                        .then(() => {
                            showSuccessToast(toast, "Successfully deleted Kova Account")
                            router.replace("/login")
                        }).catch((error) => {
                            showErrorToast(toast, error.message)
                        }).finally(() => {
                            setShowAlertDialog(false);
                        })
                      }}>
                        <ButtonText className="text-white">Delete</ButtonText>
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Card>
        </Container>
    );
}