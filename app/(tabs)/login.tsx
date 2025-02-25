import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { ScrollView } from "react-native";
import { Text } from "react-native";

export default function HomeScreen() {
  return (
   <ScrollView>
    <Center className="flex justify-center" m-500>
        <Box className="bg-primary-500 p-5">
            <Text>Test content</Text>
        </Box>
    </Center>
    </ScrollView>
  );
}
