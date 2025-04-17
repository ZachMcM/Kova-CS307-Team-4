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


export default function TutorialPostScreen() {

  const workoutData = {
    duration: "55 minutes",
    calories: "320 kcal",
    exercises: [{
      name: "Bench Press",
      sets: 3,
      reps: 12,
      weight: `100 lbs`
    },
    {
      name: "Dumbbell Step-Ups",
      sets: 3,
      reps: 15,
      weight: `25 lbs`
    },
    {
      name: "Pull Ups",
      sets: 2,
      reps: 20,
      weight: `0 lbs`
    },
    {
      name: "Front Squat",
      sets: 4,
      reps: 10,
      weight: `145 lbs`
    }],
    templateId: null, // Store template ID if present
  }

  const mySteps: TourStep[] = [
    {
      render: ({next, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>Title and Description</Text>
            <Text className="text-wrap mb-4">Add a title and description to your post here.</Text>
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
            <Text style={styles.stepTitle}>Post Workout Data</Text>
            <Text className="text-wrap mb-4">After you finish a workout, you will be directed here to post it. You can see a breakdown of your workout in this section.</Text>
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
            <Text style={styles.stepTitle}>Posts Without Workouts</Text>
            <Text className="text-wrap mb-4">Not every post needs a workout. From the bottom bar, you can create a post without an associated workout, or after a workout, you can choose to keep your workout data private.</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); }} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => {next(); scrollMore(400);}} action='kova'>
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
            <Text style={styles.stepTitle}>Additional Posting Options</Text>
            <Text className="text-wrap mb-4">Be sure to add some friends, pictures, and a location for your post. You can also choose to include a weight in which will be stored in your profile's weigh ins.</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); scrollMore(-400);}} action='kova'>
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
      render: ({previous, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>Make Your Post</Text>
            <Text className="text-wrap mb-4">Click this button to make your post! Be sure to choose which privacy setting you want before posting it using the privacy buttons.</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); }} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => { stop(); router.replace("/tutorial/tutorial-feed"); }} action='kova'>
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
                <Heading size="xl" className="mb-3">This is your post page</Heading>
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

        <View style={postStyles.header}>
          <Text style={postStyles.headerTitle} size="xl" bold>
            Create Post
          </Text>
        </View>

        <VStack space="md" style={postStyles.formContainer}>
        <AttachStep index={0}>
          <VStack>
          <VStack space="xs">
            <Text size="sm" bold>
              Title
            </Text>
            <Input variant="outline">
              <InputField
                placeholder="Enter a title for your post"
              />
            </Input>
          </VStack>

          <VStack space="xs">
            <Text size="sm" bold>
              Description
            </Text>
            <Textarea>
              <TextareaInput
                placeholder="Share details about your workout..."
              />
            </Textarea>
          </VStack>
          </VStack>
          </AttachStep>

          <VStack space="xs">
            <HStack style={postStyles.toggleContainer} space="md">
              <Text size="sm" bold>
                Include Workout Data
              </Text>
              <AttachStep index={2}>
              <Switch
                value={true}
                size="md"
              />
              </AttachStep>
            </HStack>
          </VStack>

          <AttachStep index={1}>
          <VStack>
          <SummaryWorkoutData workoutData={workoutData}></SummaryWorkoutData>
          </VStack>
          </AttachStep>

          <AttachStep index={3}>
          <VStack>
          <VStack space="xs">
            <HStack style={postStyles.toggleContainer} space="md">
              <Text size="sm" bold>
                Tag Friends
              </Text>
              <Button
                size="sm"
                variant="outline"
              >
                <Text>{"Select Friends"}</Text>
              </Button>
            </HStack>
            
          </VStack>
          <VStack space="xs">
            <Text size="sm" bold>
              Pictures
            </Text>
            <ScrollView horizontal>
              <HStack space="md">
                <Button
                  variant="outline"
                  size="sm"
                  style={{ width: 70, height: 70, borderRadius: 8 }}
                >
                  <ButtonIcon as={AddIcon}></ButtonIcon>
                </Button>
              </HStack>
            </ScrollView>
          </VStack>
          <VStack space="xs">
            <Text size="sm" bold>
              Location
            </Text>
            <Input variant="outline">
              <InputField
                placeholder="Add location (optional)"
              />
            </Input>
          </VStack>
          <VStack space="xs">
            <HStack space="sm">
              <Text size="sm" className="mt-2 mr-28" bold>
                Weigh-in (optional)
              </Text>
              <Input variant="outline" className="w-20">
                <InputField
                  placeholder=""
                  value={""}
                  keyboardType="numeric"
                  className="text-center"
                />
              </Input>
              <Text className="mt-2">lbs</Text>
            </HStack>
          </VStack>
          </VStack>
          </AttachStep>

          <AttachStep index={4}>
          <VStack>
          <VStack space="xs">
            <Text size="sm" className="mb-1" bold>
              Post Privacy
            </Text>
            <RadioGroup value={"PRIVATE"}>
              <HStack space="md">
                <Radio value="PRIVATE" isInvalid={false} isDisabled={false}>
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon}></RadioIcon>
                  </RadioIndicator>
                  <RadioLabel>Private</RadioLabel>
                </Radio>
                <Radio value="FOLLOWERS" isInvalid={false} isDisabled={false}>
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon}></RadioIcon>
                  </RadioIndicator>
                  <RadioLabel>Followers</RadioLabel>
                </Radio>
                <Radio value="FRIENDS" isInvalid={false} isDisabled={false}>
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon}></RadioIcon>
                  </RadioIndicator>
                  <RadioLabel>Friends</RadioLabel>
                </Radio>
                <Radio value="PUBLIC" isInvalid={false} isDisabled={false}>
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon}></RadioIcon>
                  </RadioIndicator>
                  <RadioLabel>Public</RadioLabel>
                </Radio>
              </HStack>
            </RadioGroup>
                <Text size="xs" style={postStyles.privacyHint}>
                  Private posts are only visible to you
                </Text>
          </VStack>

          <Button
            size="lg"
            action="kova"
            variant="solid"
            style={postStyles.submitButton}
          >
            <Text style={postStyles.buttonText} bold>
              {"Post Workout"}
            </Text>
          </Button>
          </VStack>
          </AttachStep>

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
