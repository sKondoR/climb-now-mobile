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
      hitSlop={{ top: 11, bottom: 11, left: 4, right: 4 }}
      className={`flex-row items-center rounded-md border pl-2.5 pr-3 py-1 active:opacity-70 ${checked ? "bg-accent-soft border-accent" : "bg-surface border-line"}`}
    >
      <View
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${checked ? "bg-accent" : "bg-line"}`}
      />
      <Text
        className={`text-caption font-medium ${checked ? "text-accent-soft-fg" : "text-fg-muted"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
