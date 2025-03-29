import StaticContainer from "@/components/StaticContainer";
import { useRouter, useLocalSearchParams } from "expo-router";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "react-native";
import { ChevronLeftIcon, Icon } from "@/components/ui/icon";
import { getPostDetailsById } from "@/services/postServices";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PostCard from "@/components/PostCard";
import { supabase } from "@/lib/supabase";

export default function PostsView() {
    // Grab local params
    const { postId } = useLocalSearchParams();

    const router = useRouter();

    const [post, setPost] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPostAndProfile = async () => {
            try {
                setLoading(true);

                const { data: postData, error: postError } = await supabase.from("posts").select("*").eq("id", postId).single();
                if (postError) throw postError;

                setPost(postData);
        
                if (postData?.profileId) {
                    const { data: profileData, error: profileError } = await supabase.from("profiles").select("*").eq("id", postData.profileId).single();
                    if (profileError) throw profileError;

                    setProfile(profileData);
                }
            } 
            catch (err: any) {
                setError(err.message);
            } 
            finally {
                setLoading(false);
            }
        };
    
        fetchPostAndProfile();
    }, [postId]);
    return (
        <StaticContainer className = "flex px-6 py-16">
            <VStack>
                <Pressable onPress = {() => router.replace("/feed")}>
                    <HStack>
                        <Icon as = {ChevronLeftIcon} className = "h-8 w-8"></Icon>
                        <Text size = "2xl" className = "font-bold">Feed</Text>
                    </HStack>
                </Pressable>
            </VStack>
        </StaticContainer>
    );
}