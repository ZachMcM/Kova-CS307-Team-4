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
import { followerTests, socialInformationTests } from '@/services/unitTestServices';

export default function SettingsScreen() {
  const router = useRouter();
  const [currTest, setCurrTest] = useState("");
  const [correctTests, setCorrectTests] = useState(0);
  const [testOutput, setTestOutput] = useState("");
  const [testPending, setTestPending] = useState(false);

  // FYI to add a test copy this entry, change the id, implement a function in unitTestServices.ts
  // totalTests is the amount of times the test will run the function (params needs to be the same length)
  // if you need multiple params for tests, pass them in as arrays

  // You must return a string that contains 'SUCCESS' or 'FAILURE' somewhere. This string will be displayed on the ui.

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
    }
  ]

  const runTest = async (test: any) => {
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

