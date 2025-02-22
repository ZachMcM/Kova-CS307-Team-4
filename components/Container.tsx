import { KeyboardAvoidingView, ScrollView, View } from "react-native";

export default function Container({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <KeyboardAvoidingView behavior="padding" className="flex flex-1 dark:bg-background-950 bg-background-0">
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="flex px-8 py-24">{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
