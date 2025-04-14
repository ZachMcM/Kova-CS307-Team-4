import StaticContainer from "@/components/StaticContainer";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Icon,
  MenuIcon,
  TrashIcon,
  CheckCircleIcon,
  CircleIcon,
  AlertCircleIcon,
  EditIcon,
  CloseIcon,
} from "@/components/ui/icon";
import { useRouter } from "expo-router";
import {
  getProfile,
  updateProfile,
  isProfileFollowed,
  isProfileFollowing,
  followUser,
  unfollowUser,
  uploadProfilePicture,
  privacies,
  getProfilePrivacies,
} from "@/services/profileServices";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { getProfileAccess, Profile } from "@/types/profile-types";
import { supabase } from "@/lib/supabase";
import { ReactNode, useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import {
  showErrorToast,
  showSuccessToast,
  showFollowToast,
} from "@/services/toastServices";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import * as ImagePicker from "expo-image-picker";
import { Badge, BadgeText, BadgeIcon } from "@/components/ui/badge";
import { View, StyleSheet } from "react-native";
import {
  RadioGroup,
  Radio,
  RadioIndicator,
  RadioIcon,
  RadioLabel,
} from "@/components/ui/radio";
import { useSession } from "@/components/SessionContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ProfileActivities } from "@/components/ProfileActivities";
import { Post } from "./feed";
import { useNavigation } from "@react-navigation/native";
import { getWeightEntries } from "@/services/weightServices";
import Container from "@/components/Container";
import { getAllGroups, getUserGroups } from "@/services/groupServices";
import GroupCard from "@/components/GroupCard";
import FavoriteExercises from "@/components/FavoriteExercises";
import { GroupOverview } from "@/types/extended-types";
import { Card } from "@/components/ui/card";
import {
  AttachStep,
  SpotlightTourProvider,
  TourStep,
  flip,
  offset,
  shift,
  useSpotlightTour,
} from "react-native-spotlight-tour";
import { Popover, PopoverArrow, PopoverBackdrop, PopoverBody, PopoverContent } from "@/components/ui/popover";
import { Modal, ModalBackdrop, ModalCloseButton, ModalContent, ModalHeader, ModalBody } from "@/components/ui/modal";

export default function ProfileScreen() {

  const demoProfile = {  //Every empty string is an unused element for this tutorial page
    id: "",
    user_id: "",
    username: "jkova",
    name: "John Kova",
    avatar: "",
    private: "",
    friends: 13,
    following: 25,
    followers: 1000,
    age: 21,
    gender: "Male",
    weight: 280,
    location: "Purdue University, West Lafayette",
    goal: "Becoming the strongest man on the block",
    bio: "The entire world shall know the name John Kova. Tremble from my almighty power.",
    achievement: "Benching 350 lbs",
    privacy_settings: "",
  } as Profile;

  const groups = [{
    groupId: "",
    icon: "",
    goal: "Achieve a fraction of his majesty's power",
    title: "John Kova Cult",
  },
  {
    groupId: "",
    icon: "",
    goal: "Breaking Benches",
    title: "Jesse, we need to lift. I am the one who benches.",
  }] as GroupOverview[];

  const mySteps: TourStep[] = [
    {
      // Configuration for first step
      floatingProps: {
        middleware: [offset(10), shift(), flip()],
        placement: "bottom",
      },
      render: ({ next, previous }) => (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>This is your profile page</Text>
            <View style={styles.buttonContainer}>
            <Button onPress={previous} action='kova'>
              <ButtonText size='lg'>Previous</ButtonText>
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={next} action='kova'>
              <ButtonText size='lg'>Next</ButtonText>
            </Button>
          </View>
        </View>
      )
    },
    {
      // Configuration for second step
      render: ({previous, stop}) => {
        // Using the hook inside the step component
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>This is the bottom bar</Text>
            <Text className="text-wrap mb-4">Here, you can navigate between your profile, group page, feed, create a new post, or start a workout</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={previous} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={stop} action='kova'>
                <ButtonText size='lg'>Stop</ButtonText>
              </Button>
            </View>
          </View>
        );
      }
    }
  ];

  const [renderPopover, setRenderPopover] = useState(false);

  useEffect(() => {
    // Short timeout to ensure component is fully mounted
    const timer = setTimeout(() => {
      setRenderPopover(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (

    <SpotlightTourProvider
      steps={mySteps}
      overlayColor="gray"
      overlayOpacity={0.7}
      floatingProps={{
        middleware: [offset(5), shift(), flip()],
        placement: "bottom",
      }}
    >
      {({ start }) => (
        <Container className="flex px-6 py-16">
          {/* <Button onPress={start} action='kova'>
            <ButtonText>Start Tour</ButtonText>
          </Button> */}


            <Modal
              isOpen={renderPopover}
              onClose={() => setRenderPopover(false)}
              size="md"
              closeOnOverlayClick
            >
            <ModalBackdrop />
            <ModalContent>
              <ModalHeader className="justify-center">
                <Heading size="xl">Welcome to the Kova Tutorial</Heading>
              </ModalHeader>
              <ModalBody>
                <Button action="kova" onPress={() => {start(); setRenderPopover(false);}}>
                  <ButtonText size="md">
                    Start Kova Tutorial!
                  </ButtonText>
                </Button>
              </ModalBody>
            </ModalContent>
          </Modal>

            <VStack space="3xl">
              <Box className="border-b border-gray-300 pb-2">
                <VStack space="lg">
                  <AttachStep index={0}>
                  <HStack space="md">
                    <Avatar className="bg-indigo-600 mt-1" size="xl">
                      <AvatarFallbackText className="text-white">
                        {demoProfile.name}
                      </AvatarFallbackText>
                    </Avatar>
                    <VStack space="xs">
                      <VStack>
                        <HStack className="text-wrap">
                          <Heading size="xl" className="mb-0 h-8 w-56">
                            {demoProfile.name}
                          </Heading>
                        </HStack>
                        <Text size="sm">@{demoProfile.username}</Text>
                      </VStack>
                      <HStack space="2xl">
                        <VStack>
                          <Heading size="lg" className="text-center">
                            {demoProfile.friends}
                          </Heading>
                          <Text size="sm" className="text-center">
                            friends
                          </Text>
                        </VStack>
                        <VStack>
                          <Heading size="lg" className="text-center">
                            {demoProfile.followers}
                          </Heading>
                          <Text size="sm" className="text-center">
                            followers
                          </Text>
                        </VStack>
                        <VStack>
                          <Heading size="lg" className="text-center">
                            {demoProfile.following}
                          </Heading>
                          <Text size="sm" className="text-center">
                            following
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                    <Button
                      className="w-0 h-0"
                    >
                      <Icon
                        as={MenuIcon}
                        size="xl"
                        className="mt-8 ml-8 w-8 h-8"
                      ></Icon>
                    </Button>
                  </HStack>
                  </AttachStep>
                  <VStack>
                    <Box className="border border-gray-300 rounded p-2 mt-2">
                      <HStack className="text-wrap">
                        <Heading size="md" className="mr-1">
                          🎂:
                        </Heading>
                        <View className="w-11/12">
                          <Heading size="md">{demoProfile.age}</Heading>
                        </View>
                      </HStack>
                      <HStack className="text-wrap">
                        <Heading size="md" className="mr-1">
                          🚻:
                        </Heading>
                        <View className="w-11/12">
                          <Heading size="md">{demoProfile.gender}</Heading>
                        </View>
                      </HStack>
                      <HStack className="text-wrap">
                        <Heading size="md" className="mr-1">
                          ⚖️:
                        </Heading>
                        <View className="w-11/12">
                          <Heading size="md">{demoProfile.weight}</Heading>
                        </View>
                      </HStack>
                      <HStack className="text-wrap">
                        <Heading size="md" className="mr-1">
                          📍:
                        </Heading>
                        <View className="w-11/12">
                          <Heading size="md">{demoProfile.location}</Heading>
                        </View>
                      </HStack>
                      <HStack className="text-wrap">
                        <Heading size="md" className="mr-1">
                          🏆:
                        </Heading>
                        <View className="w-11/12">
                          <Heading size="md">{demoProfile.achievement}</Heading>
                        </View>
                      </HStack>
                      <HStack className="text-wrap">
                        <Heading size="md" className="mr-1">
                          🎯:
                        </Heading>
                        <View className="w-11/12">
                          <Heading size="md">{demoProfile.goal}</Heading>
                        </View>
                      </HStack>
                      <Text className="mt-2">{demoProfile.bio}</Text>
                    </Box>
                  </VStack>
                  <VStack space="md">
                    <Button
                      size="lg"
                      variant="outline"
                      action="primary"
                      className="border-[#6FA8DC]"
                    >
                      <ButtonText className="text-[#6FA8DC]">
                        Edit Profile
                      </ButtonText>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      action="primary"
                      className="border-[#6FA8DC]"
                    >
                      <ButtonText className="text-[#6FA8DC]">
                        Weight Tracking
                      </ButtonText>
                    </Button>
                  </VStack>
                </VStack>
              </Box>
              <VStack space="sm">
                <Heading>Your Groups</Heading>
                <VStack space="md">
                  {groups.map((group) => (    //inlining group component for the tutorial
                    <Card key={group.title} variant="outline">
                      <HStack space="2xl">
                        <Avatar className="bg-indigo-600" size="md">
                          <AvatarFallbackText className="text-white">{group.title[0]}</AvatarFallbackText>
                        </Avatar>
                        <VStack>
                          <Heading size="md">{group.title}</Heading>
                          <Text>{group.goal}</Text>
                        </VStack>
                      </HStack>
                    </Card>
                  ))}
                </VStack>
              </VStack>
              {/* {profile && id === session?.user.id && (
          <>
            <FavoriteExercises />
          </>
        )} THIS IS IN A LATER TUTORIAL */}
            </VStack>
            <AttachStep index={1}>
              <Card className="py-24">
              <Text>Bottom Bar</Text>
              </Card>
            </AttachStep>
          </Container>
      )}
    </SpotlightTourProvider>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    maxWidth: 300,
  },
  section: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSpacer: {
    width: 10,
  }
});
