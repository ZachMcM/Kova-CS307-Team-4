import { Box } from "./ui/box";
import { Card } from "./ui/card";
import { Text } from "./ui/text";

export default function Tag({ name }: { name: string }) {
  return (
    <Box className="p-2 rounded-md bg-background-50 w-fit">
      <Text className="capitalize text-xs font-medium text-typography-1">{name}</Text>
    </Box>
  )
}