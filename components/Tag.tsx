import { Box } from "./ui/box";
import { Text } from "./ui/text";

// TODO replace any with tag type
export default function Tag({ tag }: { tag: any }) {
  return (
    <Box className="p-2 rounded-md bg-secondary-500 w-fit">
      <Text className="capitalize text-xs font-medium text-typography-1">
        {tag.name}
      </Text>
    </Box>
  );
}
