import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import {
  Icon,
  ChevronLeftIcon,
  HelpCircleIcon,
  AddIcon,
  CloseIcon,
  CircleIcon,
} from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSession } from "@/components/SessionContext";
import { feedStyles } from "../feed";
import { useNavigation } from "@react-navigation/native";
import Container from "@/components/Container";
import { Card } from "@/components/ui/card";
import {
  AttachStep,
  SpotlightTourProvider,
  TourStep,
  flip,
  offset,
  shift,
} from "react-native-spotlight-tour";
import { TaggedFriend } from "@/components/WorkoutPost";
import { TutorialWorkoutPost } from "@/components/tutorial/TutorialWorkoutPost";
import { Profile } from "@/types/profile-types";
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody } from "@/components/ui/modal";
import { Heading } from "@/components/ui/heading";
import { postStyles, SummaryWorkoutData } from "@/components/WorkoutData";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "@/components/ui/image";
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from "@/components/ui/radio";
import TutorialGroupCard from "@/components/tutorial/TutorialGroupCard";
import { GroupOverview } from "@/types/extended-types";


export default function TutorialGroupScreen() {

  const g1 = {
    groupId: "g1",
    icon: "https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/tutorial/John%20Kova.jpeg",
    goal: "Achieve a fraction of his majesty's power",
    title: "John Kova Cult",
  }

  const groups = [
  {
    groupId: "g3",
    icon: "https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/tutorial/Walter.jpeg",
    goal: "Jesse, we need to lift. I am the one who benches.",
    title: "Breaking Benches",
  },
  {
    groupId: "g5",
    icon: "",
    goal: "Getting huge together.",
    title: "Bar Brothers"
  }] as GroupOverview[];

  const allGroups = [{
    groupId: "g1",
    icon: "https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/tutorial/John%20Kova.jpeg",
    goal: "Achieve a fraction of his majesty's power",
    title: "John Kova Cult",
  },
  {
    groupId: "g2",
    icon: "",
    goal: "Get together and lift after our kids soccer games!",
    title: "Soccer Mom Lifting Group",
  },
  {
    groupId: "g3",
    icon: "https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/tutorial/Walter.jpeg",
    goal: "Jesse, we need to lift. I am the one who benches.",
    title: "Breaking Benches",
  },
  {
    groupId: "g4",
    icon: "https://spntxjldrghjrhyhhncu.supabase.co/storage/v1/object/public/post-images/tutorial/Glad.jpeg",
    goal: "Achieve numerical lifting output to 10001000001 lbs",
    title: "Lifting Machines",
  },
  {
    groupId: "g5",
    icon: "",
    goal: "Getting huge together.",
    title: "Bar Brothers"
  }] as GroupOverview[];

  const mySteps: TourStep[] = [
    {
      render: ({next, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>View Groups</Text>
            <Text className="text-wrap mb-4">View groups you are a part of at the top of your page. Tap on them to view details about the group.</Text>
            </VStack>
              <Button onPress={() => {next(); }} action='kova'>
                <ButtonText size='lg'>Next</ButtonText>
              </Button>
            <Pressable onPress = {() => {stop(); router.replace(`/profiles/${session?.user.id}`); leaveTutorial();}} className = "pb-2 border-b border-gray-300 mt-4">
              <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
            </Pressable>
          </View>
        );
      }
    },
    {
      render: ({previous, next, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>Group Breakdown</Text>
            <Text className="text-wrap mb-4">Every group has a goal / bio, name, and members. Groups are also where competitions and collaborations are created and carried out.</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); }} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => {next();}} action='kova'>
                <ButtonText size='lg'>Next</ButtonText>
              </Button>
            </View>
            <Pressable onPress = {() => {stop(); router.replace(`/profiles/${session?.user.id}`); leaveTutorial();}} className = "pb-2 border-b border-gray-300 mt-4">
              <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
            </Pressable>
          </View>
        );
      }
    },
    {
      render: ({previous, next, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>Create Group</Text>
            <Text className="text-wrap mb-4">This button at the top of the groups page is how you start a group of your very own.</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); }} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => {next(); scrollMore(600);}} action='kova'>
                <ButtonText size='lg'>Next</ButtonText>
              </Button>
            </View>
            <Pressable onPress = {() => {stop(); router.replace(`/profiles/${session?.user.id}`); leaveTutorial();}} className = "pb-2 border-b border-gray-300 mt-4">
              <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
            </Pressable>
          </View>
        );
      }
    },
    {
      render: ({previous, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>All groups</Text>
            <Text className="text-wrap mb-4">Lower down, you'll be able to scroll down a list of all groups in Kova. Tap on one to see a detailed view of the group, where you can also join it.</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); scrollMore(-600);}} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => { stop(); router.replace("/tutorial/tutorial-workout"); }} action='kova'>
                <ButtonText size='lg'>Next</ButtonText>
              </Button>
            </View>
            <Pressable onPress = {() => {stop(); router.replace(`/profiles/${session?.user.id}`); leaveTutorial();}} className = "pb-2 border-b border-gray-300 mt-4">
              <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
            </Pressable>
          </View>
        );
      }
    },
  ];

  const [renderPopover, setRenderPopover] = useState(false);
  const scrollRef = useRef<ScrollView>(null)
  const [scrolly, setScrolly] = useState(0);

  const scrollMore = (y: number) => {
    scrollRef.current?.scrollTo({y: scrolly + y, animated: true})
    setScrolly(y + scrolly)
  }

  const router = useRouter();
  const navigation = useNavigation();
  const { session, showTutorial, updateShowTutorial} = useSession();

  const leaveTutorial = () => {
    updateShowTutorial(false);
    router.replace(`/profiles/${session?.user.id}`);
    setRenderPopover(false);
  }

  useEffect(() => {
    setScrolly(0);
    scrollMore(0);
    const timer = setTimeout(() => {
      setRenderPopover(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        {
          setScrolly(0);
          scrollMore(0);
          const timer = setTimeout(() => {
            setRenderPopover(true);
          }, 100);
          
          return () => clearTimeout(timer);
        }
      });
  
      return unsubscribe;
    }, [navigation]);     

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
      <ScrollView keyboardShouldPersistTaps="handled" style={feedStyles.scrollView} ref={scrollRef}>
        <Container>

            <Modal
              isOpen={renderPopover}
              onClose={() => setRenderPopover(false)} //TODO remove this later so users can't back out of tutorial
              size="md"
            >
            <ModalBackdrop />
            <ModalContent>
              <ModalHeader className="justify-center">
                <Heading size="xl" className="mb-3">This is your groups page</Heading>
              </ModalHeader>
              <ModalBody>
                <Button onPress={() => { start(); setRenderPopover(false); }} action='kova'>
                  <ButtonText size='lg'>Next</ButtonText>
                </Button>
                <Pressable onPress = {leaveTutorial} className = "pb-2 border-b border-gray-300 mt-4">
                  <Text size="lg"><Icon as = {ChevronLeftIcon} className = "h-3.5 w-4"></Icon>Leave Tutorial</Text>
                </Pressable>
              </ModalBody>
            </ModalContent>
          </Modal>

          <VStack space="2xl">
            <VStack>
              <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
                Groups
              </Heading>
              <Text>View all of your groups</Text>
            </VStack>
            <AttachStep index={2}>
            <Button
              size="xl"
              action="kova"
              variant="solid"
              className="ml-[38px] mr-[38px]"
            >
              <ButtonText className="text-white">Create Group</ButtonText>
            </Button>
            </AttachStep>
              <><Heading>Your Groups</Heading><VStack space="md">
                  <Input>
                    <InputField
                      placeholder="Search for one of your groups."
                    />
                  </Input>

                  <AttachStep index={0}>
                  <VStack>

                  
                    <Card variant="outline">
                      <HStack space="2xl">
                        <Avatar className="bg-indigo-600" size="md">
                          {g1.icon ? (
                            <AvatarImage source={{ uri: g1.icon }} />
                          ) : (
                            <AvatarFallbackText className="text-white">{g1.title[0]}</AvatarFallbackText>
                          )}
                        </Avatar>
                          <VStack className="flex-1">
                          <AttachStep index={1}>
                            <Heading className="flex-shrink flex-wrap" size="md">{g1.title}</Heading>
                          </AttachStep>
                            <Text className="flex-shrink flex-wrap">{g1.goal}</Text>
                          </VStack>
                      </HStack>
                    </Card>

                  {
                    groups
                      .map((group) => (
                      <TutorialGroupCard key={group.groupId} group={group} />
                    ))}
                  </VStack>
                  </AttachStep>

                </VStack><Heading>All Groups</Heading><VStack space="md">
                  <AttachStep index={3}>
                    <Input>
                      <InputField
                        placeholder="Search for a group to join."
                      />
                    </Input>
                  </AttachStep>
                    {allGroups
                      .map((group) => (
                        <TutorialGroupCard key={group.groupId} group={group} />
                      ))}
                </VStack></> 
          </VStack>

        </Container>
      </ScrollView>
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
    borderColor: "black",
    borderWidth: 1
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
  },
});
