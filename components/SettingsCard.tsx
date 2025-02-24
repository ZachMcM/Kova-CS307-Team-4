import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";
import { HStack } from "./ui/hstack";
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectContent, SelectItem } from "./ui/select";
import { ChevronDownIcon } from "./ui/icon";
import { View } from "./ui/view"

export default function SettingsCard({ setting }: {setting: any }) {
  if (setting.type = "privacy-tri") {
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
