import { KeyboardAvoidingView, ScrollView, View } from "react-native";

/*
 *  StaticContainer differs from Container as it does not include a ScrollView
 *  and therefore cannot be scrolled.
 */

export default function StaticContainer({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string
}) {
  return (
    <KeyboardAvoidingView behavior="padding" className="flex flex-1">
      {/* <ScrollView keyboardShouldPersistTaps="handled"> */}
      <View className={className ? className : "flex px-6 py-32"}>{children}</View>
      {/* </ScrollView> */}
    </KeyboardAvoidingView>
  );
}
