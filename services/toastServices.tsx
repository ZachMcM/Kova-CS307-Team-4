import { HStack } from "@/components/ui/hstack";
import { HelpCircleIcon, Icon } from "@/components/ui/icon";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";

export type UseToast = ReturnType<typeof useToast>;

export const showErrorToast = (toast: UseToast, error: string) => {
  toast.show({
    id: Math.random().toString(),
    placement: "top",
    duration: 3000,
    render: ({ id }) => {
      const uniqueToastId = "toast-" + id;
      return (
        <Toast
          action="error"
          variant="outline"
          nativeID={uniqueToastId}
          className="p-4 gap-6 border-error-500 w-full shadow-hard-5 max-w-[443px] flex-row justify-between"
        >
          <HStack space="md">
            <Icon as={HelpCircleIcon} className="stroke-error-500 mt-0.5" />
            <VStack space="xs">
              <ToastTitle className="font-semibold text-error-500">
                Error!
              </ToastTitle>
              <ToastDescription size="sm">
                {error}
              </ToastDescription>
            </VStack>
          </HStack>
        </Toast>
      );
    },
  });
};
