import { Card } from "./ui/card";
import { Heading } from "./ui/heading";

export default function SettingsCard({ setting }: {setting: any }) {
  return (
    <Card variant="outline" className="p-6">
      <Heading>{setting.attribute}</Heading>
    </Card>
  );
}
