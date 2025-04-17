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
  EditIcon,
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
import TemplateCard from "@/components/TemplateCard";
import TutorialTemplateCard from "@/components/tutorial/TutorialTemplateCard";
import { Box } from "@/components/ui/box";


export default function TutorialWorkoutScreen() {

  const t1 = {
    name: "Leg Power Day",
    author: "jkova"
  }

  const t2 = {
    name: "More Core",
    author: "jkova"
  }

  const t3 = {
    name: "The John Kova Special",
    author: "jkova"
  }
  
  const t4 = {
    name: "Little Mac's Punch Out",
    author: "litlmacwii"
  }

  const mySteps: TourStep[] = [
    {
      render: ({next, stop}) => {
        return (
          <View style={styles.stepContainer}>
            <VStack>
            <Text style={styles.stepTitle}>See Workout Templates</Text>
            <Text className="text-wrap mb-4">You can see the displayed workout template here. To start your lift, tap "start workout".</Text>
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
            <Text style={styles.stepTitle}>Search For A Template</Text>
            <Text className="text-wrap mb-4">Made a bunch of templates and want to search for one? Type its name in the search bar to find it.</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); }} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => {next(); scrollMore(200);}} action='kova'>
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
            <Text style={styles.stepTitle}>Create a New Template</Text>
            <Text className="text-wrap mb-4">At the bottom of your workout page, you can tap this button to create a new template.</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); scrollMore(-200);}} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => {next(); }} action='kova'>
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
            <Text style={styles.stepTitle}>Edit a Template</Text>
            <Text className="text-wrap mb-4">Every template has an edit icon, allowing you to change it.</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous();}} action='kova'>
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
            <Text style={styles.stepTitle}>Template Authors</Text>
            <Text className="text-wrap mb-4">Not every template must be your own! You can copy templates from other user's posts and have them as your own. You can also edit the copied templates to better suit your needs.</Text>
            </VStack>
            <View style={styles.buttonContainer}>
              <Button onPress={() => {previous(); }} action='kova'>
                <ButtonText size='lg'>Previous</ButtonText>
              </Button>
              <View style={styles.buttonSpacer} />
              <Button onPress={() => { stop(); router.replace("/tutorial/tutorial-post"); }} action='kova'>
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
                <Heading size="xl" className="mb-3">This is your workout page</Heading>
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
            <VStack space="sm">
              <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
                Workout
              </Heading>
              <Text>Choose a workout template and start your workout</Text>
            </VStack>
            <AttachStep index={1}>
            <Input>
              <InputField
                placeholder="Search for a workout template"
              />
            </Input>
            </AttachStep>
            
            <AttachStep index={0}>
            <VStack>
            <TutorialTemplateCard key={t1.name} template={t1} />
            </VStack>

            </AttachStep>
            <TutorialTemplateCard key={t2.name} template={t2} />
            <TutorialTemplateCard key={t3.name} template={t3} />
            {/* <TutorialTemplateCard key={t4.name} template={t4} /> */}
            <Card variant="outline" className="p-6">
              <VStack space="md">
                <VStack space="sm">
                  <Box className="flex flex-row justify-between">
                    <Heading>{t4.name}</Heading>
                      <AttachStep index={3}>
                      <Icon size="xl" as={EditIcon} />
                      </AttachStep>
                  </Box>
                  <AttachStep index={4}>
                    <Text className="w-1/3">By: {t4.author}</Text>
                  </AttachStep>
                </VStack>
                <Button
                  size="lg"
                  variant="solid"
                  action="kova"
                >
                  <ButtonText>Start Workout</ButtonText>
                </Button>
              </VStack>
            </Card>

            <AttachStep index={2}>
            <Button
              variant="solid"
              size="lg"
              action="secondary"
            >
              <ButtonText>New Template</ButtonText>
              <Icon as={AddIcon} />
            </Button>
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
