import { ScrollView, View } from "react-native";

export default function Container({ children }: { children?: React.ReactNode }) {
  return (
    <View className="flex flex-1 bg-white">
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="flex px-10 py-28">
          {children}
        </View>
      </ScrollView>
    </View>
  )
}