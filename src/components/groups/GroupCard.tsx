import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { STATUSES } from "@/shared/constants";
import { useIconColors } from "@/shared/theme";
import { Group } from "@/shared/types";
import { rootStore } from "@/store/root.store";
import Table from "../tables/Table";
import StatusIcon from "./StatusIcon";

const STATUS_LABELS: Record<string, string> = {
  [STATUSES.ONLINE]: ", идёт сейчас",
  [STATUSES.PASSED]: ", завершена",
};

interface GroupCardProps {
  group: Group;
}

export default observer(function GroupCard({ group }: GroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const iconColors = useIconColors();
  const { isCommandFilterEnabled, code, command, isNamesFilterEnabled, names } =
    rootStore.formStore;

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (group.subgroups.length === 0) return "0";
    const onlineSubgroup = group.subgroups.find(
      (s) => s.status === STATUSES.ONLINE,
    );
    return onlineSubgroup
      ? onlineSubgroup.id
      : group.subgroups[group.subgroups.length - 1].id;
  });

  useEffect(() => {
    if (
      group.subgroups.length > 0 &&
      !group.subgroups.find((s) => s.id === activeTab)
    ) {
      setActiveTab(group.subgroups[0].id);
    }
  }, [group.subgroups, activeTab]);

  let isOnline: typeof STATUSES.ONLINE | null = null;
  const tabs = group.subgroups.map((subgroup) => {
    if (subgroup.status === STATUSES.ONLINE) isOnline = STATUSES.ONLINE;
    return { id: subgroup.id, label: subgroup.title, status: subgroup.status };
  });

  return (
    <View
      className={`bg-surface shadow-sm border p-4 ${isOnline ? "border-live-line" : "border-line-subtle"}`}
    >
      <Pressable
        className="flex-row items-center min-h-12 -my-2"
        onPress={() => setIsExpanded(!isExpanded)}
        accessibilityRole="button"
        accessibilityLabel={`${group.title}${isOnline ? ", идёт сейчас" : ""}`}
        accessibilityState={{ expanded: isExpanded }}
      >
        <StatusIcon status={isOnline} onlyOnline />
        <Text className="flex-1 text-title font-bold text-fg mr-2">
          {group.title}
        </Text>
        <View className="border border-line rounded-full w-8 h-8 items-center justify-center">
          <FontAwesome6
            name={isExpanded ? "chevron-up" : "chevron-down"}
            solid
            size={12}
            color={iconColors.muted}
          />
        </View>
      </Pressable>

      {isExpanded && (
        <View className="mt-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            // -my-2 + py-2: зона нажатия табов (hitSlop 8) лежит внутри ScrollView, раскладка не меняется
            className="-my-2"
            contentContainerClassName="gap-1 py-2"
            accessibilityRole="tablist"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  hitSlop={{ top: 8, bottom: 8 }}
                  accessibilityRole="tab"
                  accessibilityLabel={`${tab.label}${STATUS_LABELS[tab.status as string] ?? ""}`}
                  accessibilityState={{ selected: isActive }}
                  className={`flex-row items-center border-2 px-2 py-1 rounded-lg bg-surface-muted ${
                    isActive ? "border-accent" : "border-transparent"
                  }`}
                >
                  <StatusIcon status={tab.status} />
                  <Text
                    className={`text-body-sm font-medium ${isActive ? "text-fg" : "text-fg-muted"}`}
                  >
                    {/* Сокращение только визуальное: скринридеру остаётся полное название из accessibilityLabel */}
                    {tab.label.replace(/(к)валификация/gi, "$1вал.")}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Table
            subGroup={group.subgroups.find((s) => s.id === activeTab)}
            code={code}
            isCommandFilterEnabled={isCommandFilterEnabled}
            command={command}
            isNamesFilterEnabled={isNamesFilterEnabled}
            names={names}
          />
        </View>
      )}
    </View>
  );
});
