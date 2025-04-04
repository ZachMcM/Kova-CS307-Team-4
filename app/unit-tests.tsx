import { VStack } from '@/components/ui/vstack';
import Container from "@/components/Container";
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { Icon, ChevronLeftIcon } from '@/components/ui/icon';
import { Heading } from "@/components/ui/heading";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { useState } from "react";
import { Text } from "@/components/ui/text"
import { Spinner } from "@/components/ui/spinner"

// Remember to import your tests from services
import { PasswordResetTestParams, passwordResetTests, commentTests, followerTests, LoginTestParams, loginTests, RegisterTestParams, registrationTests, socialInformationTests, testCounters } from '@/services/unitTestServices';
import { useSession } from '@/components/SessionContext';
import { ProfileActivities } from '@/components/ProfileActivities';

export default function SettingsScreen() {
  const router = useRouter();
  const [currTest, setCurrTest] = useState("");
  const [correctTests, setCorrectTests] = useState(0);
  const [testOutput, setTestOutput] = useState("");
  const [testPending, setTestPending] = useState(false);
  //const [ randNum, setRandNum ] = useState(Math.floor(Math.random() * (999_999_999 + 1)));
  const { signInUser, createAccount, updatePassword } = useSession();

  // FYI to add a test copy this entry, change the id, implement a function in unitTestServices.ts
  // totalTests is the amount of times the test will run the function (params needs to be the same length)
  // if you need multiple params for tests, pass them in as arrays

  // You must return a string that contains 'SUCCESS' or 'FAILURE' somewhere. This string will be displayed on the ui.

  // function randInt(max: number = 999_999_999) {
  //   //const ret_val = Math.floor(Math.random() * (max + 1))
  //   //setRandNum(ret_val)
  //   return Math.floor(Math.random() * (max + 1))
  // }

  const tests = [
    {
      id: "1",
      name: "Relations count tests",
      function: followerTests,
      params: [],
      totalTests: 10
    },
    {
      id: "2",
      name: "Modifying social information tests",
      function: socialInformationTests,
      params: [],
      totalTests: 50
    },
    {
      id: "3",
      name: "Login tests",
      function: loginTests,
      params: [
        {signInUser: signInUser, testCaseName: "Non-existent email", testEmail: "doesnotexist@doesnotexist.com", testPassword: "Aaa123", expectedError: "Invalid login credentials"},
        {signInUser: signInUser, testCaseName: "Invalid password", testEmail: "testuser@testuser.com", testPassword: "Aaa123456789", expectedError: "Invalid login credentials"},
        {signInUser: signInUser, testCaseName: "Email regex", testEmail: "' = X OR 'Y' = 'Y'", testPassword: "Aaa123456789", expectedError: "Please enter a valid email address"},
        {signInUser: signInUser, testCaseName: "Password Empty", testEmail: "testuser@testuser.com", testPassword: "", expectedError: "Password field cannot be empty"},
        {signInUser: signInUser, testCaseName: "Valid login", testEmail: "testuser@testuser.com", testPassword: "Aaa123", expectedError: null},
      ] as LoginTestParams[],
      totalTests: 5
    },
    {
      id: "4",
      name: "Registration tests",
      function: registrationTests,
      params: [
        {createAccount: createAccount, testCaseName: "Invalid email regex", addRandom: true, testEmail: "notvalidemail.com", testPassword: "Aaa123", testConfirmPassword: "Aaa123", testUsername: "unittester", testDisplayName: "unitTest Display Name", expectedError: "Please enter a valid email address"},
        {createAccount: createAccount, testCaseName: "Non-matching passwords", addRandom: true, testEmail: "unittester@test.com", testPassword: "Aaa1234", testConfirmPassword: "Aaa123", testUsername: "unittester", testDisplayName: "unitTest Display Name", expectedError: "Password and confirmed password\nmust match"},
        {createAccount: createAccount, testCaseName: "Blank username", addRandom: false, testEmail: "unittester@test.com", testPassword: "Aaa123", testConfirmPassword: "Aaa123", testUsername: "", testDisplayName: "unitTest Display Name", expectedError: "Username cannot be blank"},
        {createAccount: createAccount, testCaseName: "Username with spaces", addRandom: true, testEmail: "unittester@test.com", testPassword: "Aaa123", testConfirmPassword: "Aaa123", testUsername: "unit tester", testDisplayName: "unitTest Display Name", expectedError: "Username cannot include spaces"},
        {createAccount: createAccount, testCaseName: "Username already in use", addRandom: false, testEmail: "unittester@test.com", testPassword: "Aaa123", testConfirmPassword: "Aaa123", testUsername: "testuser", testDisplayName: "unitTest Display Name", expectedError: "Username is already in use"},
        {createAccount: createAccount, testCaseName: "Email already in use", addRandom: false, testEmail: "testuser@testuser.com", testPassword: "Aaa123", testConfirmPassword: "Aaa123", testUsername: "unittester", testDisplayName: "unitTest Display Name", expectedError: "This email address has already been taken, please use another address"},
        {createAccount: createAccount, testCaseName: "Password min requirements length", addRandom: true, testEmail: "unittester@test.com", testPassword: "Aaa12", testConfirmPassword: "Aaa12", testUsername: "unittester", testDisplayName: "unitTest Display Name", expectedError: "Password must be at least 6 characters\n and include a letter and number"},
        {createAccount: createAccount, testCaseName: "Password min requirements letter", addRandom: true, testEmail: "unittester@test.com", testPassword: "123456", testConfirmPassword: "123456", testUsername: "unittester", testDisplayName: "unitTest Display Name", expectedError: "Password must be at least 6 characters\n and include a letter and number"},
        {createAccount: createAccount, testCaseName: "Password min requirements number", addRandom: true, testEmail: "unittester@test.com", testPassword: "abcdef", testConfirmPassword: "abcdef", testUsername: "unittester", testDisplayName: "unitTest Display Name", expectedError: "Password must be at least 6 characters\n and include a letter and number"},
        {createAccount: createAccount, testCaseName: "Successful registration", addRandom: true, testEmail: "unittester@test.com", testPassword: "Aaa123", testConfirmPassword: "Aaa123", testUsername: "unittester", testDisplayName: "unitTest Display Name", expectedError: null},
      ] as RegisterTestParams[],
      totalTests: 10
    },
    {
      id: "5",
      name: "Counter tests",
      function: testCounters,
      params: [],
      totalTests: 1
    },
    {
      id: "6",
      name: "Creator tests",
      function: testCounters,
      params: [],
      totalTests: 1
    },
    {
      id: "7",
      name: "Scorer tests",
      function: testCounters,
      params: [],
      totalTests: 1
    },
    {
      id: "8",
      name: "Password Reset tests",
      function: passwordResetTests,
      params: [
        {signInUser, correctPassword: "aaa123", updatePassword, testCaseName: "Non-matching passwords", testEmail: "passwordtester@test.com", testOldPassword: "aaa123", testNewPassword: "aaa123", testVerifyPassword: "aaa1234", expectedError: "Password and confirmed password\nmust match"},
        {signInUser, correctPassword: "aaa123", updatePassword, testCaseName: "Old password incorrect", testEmail: "passwordtester@test.com", testOldPassword: "aaa1234124", testNewPassword: "aaa1234", testVerifyPassword: "aaa1234", expectedError: "Old Password is not correct"},
        {signInUser, correctPassword: "aaa123", updatePassword, testCaseName: "Same new and old password", testEmail: "passwordtester@test.com", testOldPassword: "aaa123", testNewPassword: "aaa123", testVerifyPassword: "aaa123", expectedError: "New password should be different from the old password."},
        {signInUser, correctPassword: "aaa123", updatePassword, testCaseName: "Same new and old password", testEmail: "passwordtester@test.com", testOldPassword: "aaa123", testNewPassword: "aaa1", testVerifyPassword: "aaa1", expectedError: "New Password must be at least 6 characters\n and include a letter and number"},
        {signInUser, correctPassword: "aaa123", updatePassword, testCaseName: "Successful password reset", testEmail: "passwordtester@test.com", testOldPassword: "aaa123", testNewPassword: "aaa123456A", testVerifyPassword: "aaa123456A", expectedError: null},
      ] as PasswordResetTestParams[],
      totalTests: 5
    },
    {
      if: "9",
      name: "Comments tests",
      function: commentTests,
      params: [],
      totalTests: 5
    }
  ]

  const runTest = async (test: any) => {
    console.log("run test")
    if (test) {
      setTestPending(true);
      let completeOutput = "";
      let completeTests = 0;
      setTestOutput("");
      setCurrTest(test.id);
      
      for (let i = 0; i < test.totalTests; i++) {
        const tempOutput = await test.function(test.params[i]);
        if (completeOutput !== "") {
          completeOutput += "\n\n" + tempOutput;
        }
        else {
          completeOutput = tempOutput;
        }

        if (tempOutput.includes("SUCCESS")) {
          completeTests++;
        }
      }
      setCorrectTests(completeTests);
      setTestOutput(completeOutput);
      setTestPending(false);
    }
  }

  return (
    <Container className = "flex px-6 py-16">
      <Pressable onPress={() => router.replace(`/settings`)}>
        <HStack className = "mb-4">
          <Icon as={ChevronLeftIcon} className = "h-10 w-10"></Icon>
          <Heading size="xl" className = "mt-1">Settings</Heading>
        </HStack>
      </Pressable>
      <VStack>
        {tests.map((test) => (
          <Box key = {test.id} className = "m-2 border rounded border-gray-300 p-2">
            <Heading className = "mb-2">{test.name}</Heading>
            <Button onPress = {() => runTest(test)}>
              <ButtonText>Run Test</ButtonText>
            </Button>
            { currTest === test.id && (
              <Box className = "text-wrap mt-4">
                { testPending ? (
                  <Spinner />
                ) : (
                  <Box>
                    <Text size = "lg" className = "ml-1">Tests Successful: {correctTests}/{test.totalTests}</Text>
                    <Text size = "lg" className = "ml-1">Output</Text>
                    <Text className = "m-1 border rounded">{testOutput}</Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        ))}
      </VStack>
    </Container>
  );
}

