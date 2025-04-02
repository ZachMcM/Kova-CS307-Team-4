import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";
import { Link } from "./ui/link";
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectContent, SelectItem } from "./ui/select";
import { Icon, ChevronDownIcon, ChevronRightIcon } from "./ui/icon";
import { View } from "./ui/view"
import { Pressable } from "./ui/pressable"
import { useRouter } from "expo-router";

export default function SettingsCard({ setting }: {setting: any }) {
  const router = useRouter();

  console.log(setting);
  if (setting.type == "banner") {
    console.log("Banner")
    return (
      <Card variant="outline" className="rounded-none bg-gray-200 border-0">
        <Heading size = "xl">{setting.attribute}</Heading>
      </Card>
    );
  }
  else if (setting.type == "redirect") {
    console.log("Banner")
    return (
      <Card variant="outline" className="rounded-none border-l-0 border-r-0 border-t-0">
        <View className = "flex-row justify-end">
          <Text size = "md">{setting.attribute}</Text>
          <Pressable onPress = {() => router.replace(setting.content/*"/unit-tests"*/)} className = "mt-1 ml-auto">
            <Icon as={ChevronRightIcon}></Icon>
          </Pressable>
        </View>
      </Card>
    );
  }
  else if (setting.type == "privacy-tri") {
    console.log("Privacy Tri")
    return (
      <Card variant="outline" className="rounded-none border-l-0 border-r-0 border-t-0">
        <View className = "flex-row justify-end">
          <Text size = "md" className = "mt-2">{setting.attribute}</Text>
          <Select className = "w-40 ml-auto">
            <SelectTrigger variant = "outline" size = "md">
              <SelectInput placeholder = "Select privacy"></SelectInput>
              <SelectIcon className = "mr-3" as = {ChevronDownIcon}></SelectIcon>
            </SelectTrigger>
            <SelectPortal>
              <SelectContent>
                <SelectItem label="No one" value="none" />
                <SelectItem label="Friends" value="limit" />
                <SelectItem label="Anyone" value="free" />
              </SelectContent>
            </SelectPortal>
          </Select>
        </View>
      </Card>
    );
  }
}
