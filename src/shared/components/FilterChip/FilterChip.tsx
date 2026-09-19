import { Pressable, Text, View } from "react-native";

export default function FilterChip({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={6}
      className={`flex-row items-center rounded-md border pl-2.5 pr-3 py-1 active:opacity-70 ${checked ? "bg-blue-50 border-blue-600" : "bg-white border-gray-300"}`}
    >
      <View
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${checked ? "bg-blue-600" : "bg-gray-300"}`}
      />
      <Text
        className={`text-xs font-medium ${checked ? "text-blue-700" : "text-gray-700"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
