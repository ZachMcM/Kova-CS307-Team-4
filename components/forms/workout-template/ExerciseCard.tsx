import { useSession } from "@/components/SessionContext";
import Tag from "@/components/Tag";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { AlertCircleIcon, CloseIcon, Icon, InfoIcon } from "@/components/ui/icon";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from "@/components/ui/modal";
import { Pressable } from "@/components/ui/pressable";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import {
  addFavorite,
  isExerciseFavorited,
  removeFavorite,
} from "@/services/exerciseServices";
import { showErrorToast } from "@/services/toastServices";
import { Tables } from "@/types/database.types";
import { ExtendedExercise } from "@/types/extended-types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function ExerciseCard({
  exercise,
}: {
  exercise: ExtendedExercise;
}) {
  const { session } = useSession();
  const { data: favorited, isPending: isFavoritedPending } = useQuery({
    queryKey: ["is-favorited", { id: exercise.id }],
    queryFn: async () => {
      const favorited = await isExerciseFavorited(
        session?.user.user_metadata.profileId,
        exercise.id
      );
      return favorited;
    },
  });

  const [detailsModal, setDetailsModal] = useState(false);

  return (
    <Card variant="outline">
      <VStack space="md">
        <HStack className="items-center justify-between">
          <Heading size="md">{exercise.name}</Heading>
          <HStack space="md" className="justify-center">
            {isFavoritedPending ? (
              <Spinner />
            ) : (
              favorited != undefined && (
                <Favorite exercise={exercise} initFavorited={favorited} />
              )
            )}
            <Pressable onPress={() => setDetailsModal(true)}>
              <Icon as={InfoIcon} size="xl" />
            </Pressable>
          </HStack>
        </HStack>
        <Box className="flex flex-row flex-wrap gap-2">
          {exercise.tags.map((tag: Tables<"tag">) => (
            <Tag key={tag.id} tag={tag} />
          ))}
        </Box>
      </VStack>
      <Modal
        isOpen={detailsModal}
        onClose={() => setDetailsModal(false)}
        size="md"
        closeOnOverlayClick
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Details</Heading>
            <ModalCloseButton>
              <Icon
                as={CloseIcon}
                className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
              />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text size="md" className="text-typography-700">
              {exercise.details}
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
}

function Favorite({
  initFavorited,
  exercise,
}: {
  initFavorited: boolean;
  exercise: ExtendedExercise;
}) {
  const { session } = useSession();

  const [favorited, setFavorited] = useState(initFavorited);

  const toast = useToast();
  const queryClient = useQueryClient();

  const { mutate: unfavorite } = useMutation({
    mutationFn: async () => {
      await removeFavorite(session?.user.user_metadata.profileId, exercise.id);
    },
    onError: (err) => {
      showErrorToast(toast, err.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["is-favorited", { id: exercise.id }],
      });
      queryClient.invalidateQueries({
        queryKey: ["favorite-exercises"],
      });
    },
  });

  const { mutate: favorite } = useMutation({
    mutationFn: async () => {
      await addFavorite(session?.user.user_metadata.profileId, exercise.id);
    },
    onError: (err) => {
      showErrorToast(toast, err.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["is-favorited", { id: exercise.id }],
      });
      queryClient.invalidateQueries({
        queryKey: ["favorite-exercises"],
      });
    },
  });

  function handlePress() {
    if (favorited) {
      setFavorited(false);
      unfavorite();
    } else {
      setFavorited(true);
      favorite();
    }
  }

  return (
    <Pressable onPress={handlePress}>
      <Ionicons
        color="#6fa8dc"
        name={favorited ? "bookmark" : "bookmark-outline"}
        size={24}
      />
    </Pressable>
  );
}
