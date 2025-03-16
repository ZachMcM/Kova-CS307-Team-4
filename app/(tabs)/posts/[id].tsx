import StaticContainer from "@/components/StaticContainer";
import { useRouter, useLocalSearchParams } from "expo-router";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "react-native";
import { ChevronLeftIcon, Icon } from "@/components/ui/icon";
import { getPostDetailsById } from "@/services/postServices";
import { useEffect } from "react";

export default function PostsView() {
    // Grab local params
    const { postId } = useLocalSearchParams();

    const router = useRouter();

    useEffect(async () => {
        if (!Array.isArray(postId)) {
            return await getPostDetailsById(postId);
        }
    }, [postData]);

    return (
        <StaticContainer className = "flex px-6 py-16">
            <VStack>
                <Pressable onPress = {() => router.replace("/feed")}>
                    <HStack>
                        <Icon as = {ChevronLeftIcon} className = "h-8 w-8"></Icon>
                        <Text size = "2xl" className = "font-bold">Feed</Text>
                    </HStack>
                </Pressable>
                <></>
            </VStack>
        </StaticContainer>
    );
}