import { Tables } from "@/types/database.types";
import { Box } from "./ui/box";
import { Text } from "./ui/text";

export default function Tag({ tag }: { tag: Tables<'tag'> }) {
  return (
    <Box className="p-2 rounded-md bg-secondary-500 w-fit">
      <Text className="capitalize text-xs font-medium text-typography-1">
        {tag.name}
      </Text>
    </Box>
  );
}

export function TagString({ tag }: { tag: string }) {
  return (
    <Box className="p-2 rounded-md bg-secondary-500 w-fit">
      <Text className="capitalize text-xs font-medium text-typography-1">
        {tag}
      </Text>
    </Box>
  );
}
