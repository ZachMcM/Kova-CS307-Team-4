import { KeyboardAvoidingView, ScrollView, View } from "react-native";

export default function Container({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string
}) {
  return (
    <KeyboardAvoidingView behavior="padding" className="flex flex-1">
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className={className ? className : "flex px-6 py-24"}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
