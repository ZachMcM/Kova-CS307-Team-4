import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from '@/components/ui/vstack';
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon, CircleIcon, ChevronLeftIcon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { privacies, updateProfilePrivacies, getProfilePrivacies } from "@/services/profileServices";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { RadioGroup, Radio, RadioIndicator, RadioIcon, RadioLabel } from "@/components/ui/radio"
import { useSession } from "@/components/SessionContext";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Container from "@/components/Container";
import { Card } from "@/components/ui/card";

export default function PrivacyEditingScreen() {
    const router = useRouter();
    const toast = useToast();
    const { session } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [friendsFollowingPrivacy, setFriendsFollowingPrivacy] = useState("");
    const [agePrivacy, setAgePrivacy] = useState("");
    const [weightPrivacy, setWeightPrivacy] = useState("");
    const [locationPrivacy, setLocationPrivacy] = useState("");
    const [goalPrivacy, setGoalPrivacy] = useState("");
    const [bioPrivacy, setBioPrivacy] = useState("");
    const [achievementPrivacy, setAchievementPrivacy] = useState("");
    const [genderPrivacy, setGenderPrivacy] = useState("");
    const [postsPrivacy, setPostsPrivacy] = useState("");
    const [preset, setPreset] = useState("");

    async function get_privacy_data(id: string) {
        const privacy = await getProfilePrivacies(id).catch((error) => {
            setError(error.message); 
            setLoading(false);
            return error.message;
        });
        setFriendsFollowingPrivacy(privacy["friends_following"]);
        setAgePrivacy(privacy["age"]);
        setWeightPrivacy(privacy["weight"]);
        setLocationPrivacy(privacy["location"]);
        setGoalPrivacy(privacy["goal"]);
        setBioPrivacy(privacy["bio"]);
        setAchievementPrivacy(privacy["achievement"]);
        setGenderPrivacy(privacy["gender"]);
        setPostsPrivacy(privacy["posts"]);
        setLoading(false);
        return privacy
    }

    useEffect(() => {
        get_privacy_data(session?.user.id!);
    }, [])

    if (loading) {
        return <Text>Loading</Text>
    }
    if (error) {
        return <Text>Error: {error}</Text>
    }

    const setAllPrivacies = (privacyPreset: string) => {
        setFriendsFollowingPrivacy(privacyPreset);
        setAgePrivacy(privacyPreset);
        setWeightPrivacy(privacyPreset);
        setLocationPrivacy(privacyPreset);
        setGoalPrivacy(privacyPreset);
        setBioPrivacy(privacyPreset);
        setAchievementPrivacy(privacyPreset);
        setGenderPrivacy(privacyPreset);
        setPostsPrivacy(privacyPreset);
    }


    const incrementPrivacy = (state: string, state_function: React.Dispatch<any>) => {
        if (state === "PUBLIC") {
            state_function("FRIENDS");
        } else if (state === "FRIENDS") {
            state_function("PRIVATE");
        } else if (state === "PRIVATE") {
            state_function("PUBLIC");
        }
        setPreset("")
    }
    
    const getPrivacyIcon = (state: string) => {
        if (state === "PUBLIC") {
            return <MaterialIcons name="remove-red-eye" size={24} color="black" />
        } else if (state === "FRIENDS") {
            return <MaterialIcons name="people" size={24} color="black" />;
        } else {
            return <MaterialIcons name="private-connectivity" size={24} className="m-0" color="black" />
        }
    }

    const saveChanges = async () => {
        await updateProfilePrivacies(session?.user.id!, {
            'friends_following': friendsFollowingPrivacy,
            'age': agePrivacy,
            'weight': weightPrivacy,
            'location': locationPrivacy,
            'goal': goalPrivacy,
            'bio': bioPrivacy,
            'achievement': achievementPrivacy,
            'gender': genderPrivacy,
            'posts': postsPrivacy,
        } as privacies).then(() => {
                        showSuccessToast(toast, "Successfully updated privacy settings");
                        router.replace(`/profiles/${session?.user.id}`);
                      })
                      .catch(() => {
                        showErrorToast(toast, "Error, could not update privacy settings at this time");
                       });
    }

    return (
    <Container>
      <Button
        variant = "outline"
        size = "md"
        action = "primary"
        onPress={() => router.replace(`/profiles/${session?.user.id}`)}
        className = "p-3">
        <HStack>
        <Icon as={ChevronLeftIcon} className="mt-0"></Icon>
        <ButtonText>Back to Profile</ButtonText>
        </HStack>
    </Button>
      <Card variant="ghost" className="p-10 mb-50">
        <VStack space="sm" className="mb-50">
          <Heading size="4xl">Privacy Editing</Heading>
          <Text size="lg">Edit your profile visibility</Text>
        </VStack>
      </Card>
      <HStack>
        <Text size = "md" className = "mr-4">🔒 Privacy Presets</Text>
        <RadioGroup value={preset} onChange={setPreset}>
            <HStack space = "lg">
            <Radio value = "PRIVATE" isInvalid = {false} isDisabled = {false} onTouchEnd={() => {setAllPrivacies("PRIVATE")}}>
                <RadioIndicator>
                <RadioIcon as = {CircleIcon}></RadioIcon>
                </RadioIndicator>
                <RadioLabel>Private</RadioLabel>
            </Radio>
            <Radio value = "FRIENDS" isInvalid = {false} isDisabled = {false} onTouchEnd={() => {setAllPrivacies("FRIENDS")}}>
                <RadioIndicator>
                <RadioIcon as = {CircleIcon}></RadioIcon>
                </RadioIndicator>
                <RadioLabel>Friends</RadioLabel>
            </Radio>
            <Radio value = "PUBLIC" isInvalid = {false} isDisabled = {false} onTouchEnd={() => {setAllPrivacies("PUBLIC")}}>
                <RadioIndicator>
                <RadioIcon as = {CircleIcon}></RadioIcon>
                </RadioIndicator>
                <RadioLabel>Public</RadioLabel>
            </Radio>
            </HStack>
        </RadioGroup>
      </HStack>
      <Card variant="ghost" className="ml-[20px] mr-[20px]">
        <HStack space="md">
            <Heading>
                <MaterialIcons name="remove-red-eye" size={24} color="black" />
                <Text>: Public</Text>
            </Heading>
            <Heading>
                <MaterialIcons name="people" size={24} color="black" />
                <Text>: Friends Only</Text>
            </Heading>
            <Heading>
                <MaterialIcons name="private-connectivity" size={24} className="m-0" color="black" />
                <Text>: Private</Text>
            </Heading>
        </HStack>
        </Card>
      <Card variant="outline" className="mr-[20px] ml-[20px]">
        <VStack space="md">
        <HStack>
          <Text size = "xl" className = "mr-4 bg">🤝Friends & Following Privacy</Text>
          <Button size="xs" className={friendsFollowingPrivacy === "PUBLIC" ? "rounded-full bg-teal-300" : (
            friendsFollowingPrivacy === "FRIENDS" ? "rounded-full bg-green-600" : "rounded-full bg-orange-400"
          )} onPress={() => {incrementPrivacy(friendsFollowingPrivacy, setFriendsFollowingPrivacy)}}>
            {getPrivacyIcon(friendsFollowingPrivacy)}
          </Button>
        </HStack>
        <HStack>
          <Text size = "xl" className = "mr-4 bg">🏋️Posts Privacy</Text>
          <Button size="xs" className={postsPrivacy === "PUBLIC" ? "rounded-full bg-teal-300" : (
            postsPrivacy === "FRIENDS" ? "rounded-full bg-green-600" : "rounded-full bg-orange-400"
          )} onPress={() => {incrementPrivacy(postsPrivacy, setPostsPrivacy)}}>
            {getPrivacyIcon(postsPrivacy)}
          </Button>
        </HStack>
        <HStack>
          <Text size = "xl" className = "mr-4 bg">🕯️Age Privacy</Text>
          <Button size="xs" className={agePrivacy === "PUBLIC" ? "rounded-full bg-teal-300" : (
            agePrivacy === "FRIENDS" ? "rounded-full bg-green-600" : "rounded-full bg-orange-400"
          )} onPress={() => {incrementPrivacy(agePrivacy, setAgePrivacy)}}>
            {getPrivacyIcon(agePrivacy)}
          </Button>
        </HStack>
        <HStack>
          <Text size = "xl" className = "mr-4 bg">🟡Gender Privacy</Text>
          <Button size="xs" className={genderPrivacy === "PUBLIC" ? "rounded-full bg-teal-300" : (
            genderPrivacy === "FRIENDS" ? "rounded-full bg-green-600" : "rounded-full bg-orange-400"
          )} onPress={() => {incrementPrivacy(genderPrivacy, setGenderPrivacy)}}>
            {getPrivacyIcon(genderPrivacy)}
          </Button>
        </HStack>
        <HStack>
          <Text size = "xl" className = "mr-4 bg">💪Weight Privacy</Text>
          <Button size="xs" className={weightPrivacy === "PUBLIC" ? "rounded-full bg-teal-300" : (
            weightPrivacy === "FRIENDS" ? "rounded-full bg-green-600" : "rounded-full bg-orange-400"
          )} onPress={() => {incrementPrivacy(weightPrivacy, setWeightPrivacy)}}>
            {getPrivacyIcon(weightPrivacy)}
          </Button>
        </HStack>
        <HStack>
          <Text size = "xl" className = "mr-4 bg">📍Location Privacy</Text>
          <Button size="xs" className={locationPrivacy === "PUBLIC" ? "rounded-full bg-teal-300" : (
            locationPrivacy === "FRIENDS" ? "rounded-full bg-green-600" : "rounded-full bg-orange-400"
          )} onPress={() => {incrementPrivacy(locationPrivacy, setLocationPrivacy)}}>
            {getPrivacyIcon(locationPrivacy)}
          </Button>
        </HStack>
        <HStack>
          <Text size = "xl" className = "mr-4 bg">🏆Achievement Privacy</Text>
          <Button size="xs" className={achievementPrivacy === "PUBLIC" ? "rounded-full bg-teal-300" : (
            achievementPrivacy === "FRIENDS" ? "rounded-full bg-green-600" : "rounded-full bg-orange-400"
          )} onPress={() => {incrementPrivacy(achievementPrivacy, setAchievementPrivacy)}}>
            {getPrivacyIcon(achievementPrivacy)}
          </Button>
        </HStack>
        <HStack>
          <Text size = "xl" className = "mr-4 bg">🎯Goal Privacy</Text>
          <Button size="xs" className={goalPrivacy === "PUBLIC" ? "rounded-full bg-teal-300" : (
            goalPrivacy === "FRIENDS" ? "rounded-full bg-green-600" : "rounded-full bg-orange-400"
          )} onPress={() => {incrementPrivacy(goalPrivacy, setGoalPrivacy)}}>
            {getPrivacyIcon(goalPrivacy)}
          </Button>
        </HStack>
        <HStack>
          <Text size = "xl" className = "mr-4 bg">📝Bio Privacy</Text>
          <Button size="xs" className={bioPrivacy === "PUBLIC" ? "rounded-full bg-teal-300" : (
            bioPrivacy === "FRIENDS" ? "rounded-full bg-green-600" : "rounded-full bg-orange-400"
          )} onPress={() => {incrementPrivacy(bioPrivacy, setBioPrivacy)}}>
            {getPrivacyIcon(bioPrivacy)}
          </Button>
        </HStack>
        <Button
            variant="solid"
            size="xl"
            action="kova"
            className="mt-5 mb-5"
            onPress={saveChanges}
          >
            <ButtonText className="text-white">Save Changes</ButtonText>
          </Button>
        </VStack>
      </Card>
      {/* <VStack>
          <Button
            variant="solid"
            size="xl"
            action="kova"
            className="mt-5 mb-5"
            onPress={() => {}}
          >
            <ButtonText className="text-white">Preview Public Profile</ButtonText>
          </Button>
          <Button
            variant="solid"
            size="xl"
            action="kova"
            className="mt-5 mb-5"
            onPress={() => {}}
          >
            <ButtonText className="text-white">Preview Friends-Only Profile</ButtonText>
          </Button>
        </VStack> TODO maybe this another time*/}
    </Container>
    )

}