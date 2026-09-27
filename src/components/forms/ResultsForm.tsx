import { onlineManager } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect } from "react";
import { View } from "react-native";

import { DEFAULT_TEAM, DEFAULT_URL_CODE } from "@/shared/constants";
import { rootStore } from "@/store/root.store";
import { useIconColors } from "@/shared/theme";

import Autocomplete from "@/shared/components/Autocomplete/Autocomplete";
import { Item } from "@/shared/components/Autocomplete/Autocomplete.types";
import FilterChip from "@/shared/components/FilterChip/FilterChip";
import IconButton from "@/shared/components/IconButton/IconButton";
import LinkToEvent from "@/shared/components/LinkToEvent/LinkToEvent";
import TextInput from "@/shared/components/TextInput/TextInput";
import { Event } from "@/shared/types/events";
import { EventTemplate } from "./EventTemplate";

// Веб-версия чистила ввод через DOMPurify (защита от innerXSS в браузере) — в RN текст никогда
// не интерпретируется как HTML, санитайз не нужен (см. plans/migration-plan.md, маппинг зависимостей).
export default observer(function ResultsForm() {
  const formStore = rootStore.formStore;
  const teamsStore = rootStore.teamsStore;
  const disciplinesStore = rootStore.disciplinesStore;
  const eventsStore = rootStore.eventsStore;
  const iconColors = useIconColors();
  const command = formStore.command as Item | null;
  const names = formStore.names;
  const { isCommandFilterEnabled, isNamesFilterEnabled, isOnlyOnline } =
    formStore;

  useEffect(() => {
    const loadGroups = () => {
      const currentEvent = eventsStore.events?.find(
        (event) => event.link === formStore.code,
      );
      disciplinesStore.fetchGroups(formStore.code, currentEvent?.name);
    };

    loadGroups();

    // Группы грузятся мимо React Query, поэтому сами не перезапросятся, когда вернётся сеть
    return onlineManager.subscribe((online) => {
      console.log(
        "[debug] onlineManager:",
        online,
        "groupsData null:",
        disciplinesStore.groupsData === null,
        "loading:",
        disciplinesStore.isGroupsLoading,
      );
      if (
        online &&
        disciplinesStore.groupsData === null &&
        !disciplinesStore.isGroupsLoading
      ) {
        loadGroups();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formStore.code]);

  const handleUrlChange = useCallback((value: Item | null) => {
    formStore.setCode(typeof value === "string" ? value : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCommandChange = useCallback((value: Item | null) => {
    formStore.setCommand(typeof value === "string" ? value : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNamesChange = useCallback((value: string) => {
    formStore.setNames(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterModeToggle = (
    <IconButton
      icon={isNamesFilterEnabled ? "users" : "flag"}
      label={
        isNamesFilterEnabled
          ? "Искать по команде"
          : "Искать по фамилиям скалолазов"
      }
      color={iconColors.accent}
      onPress={() => formStore.setIsNamesFilterEnabled(!isNamesFilterEnabled)}
    />
  );

  return (
    <View className="gap-4">
      <Autocomplete
        value={formStore.code}
        onChange={handleUrlChange}
        placeholder="2602vrn"
        data={eventsStore.events as unknown as Item[]}
        label="код соревнований"
        dataLabel={DEFAULT_URL_CODE}
        property="link"
        isLoading={eventsStore.isEventsLoading}
        labelAction={
          disciplinesStore.groupsData ? (
            <LinkToEvent code={formStore.code} />
          ) : null
        }
        renderItem={(item: Item, value: Item | null) =>
          EventTemplate(item as unknown as Event, value as string | null)
        }
      />

      {isNamesFilterEnabled ? (
        <TextInput
          value={names}
          onChange={handleNamesChange}
          placeholder="Петров, Иванов"
          label="скалолазы"
          dataLabel="Петров, Иванов"
          labelAction={filterModeToggle}
        />
      ) : (
        <Autocomplete
          value={command}
          onChange={handleCommandChange}
          placeholder={DEFAULT_TEAM}
          data={teamsStore.teams as Item[]}
          isLoading={teamsStore.isTeamsLoading}
          label="команда"
          dataLabel={DEFAULT_TEAM}
          labelAction={filterModeToggle}
        />
      )}

      {/* -my-2.5 py-2.5: у чипов зона нажатия 48dp (hitSlop) должна лежать внутри родителя, иначе Android её обрезает */}
      <View className="flex-row flex-wrap gap-2 -my-2.5 py-2.5">
        <FilterChip
          checked={isCommandFilterEnabled}
          onToggle={() =>
            formStore.setIsCommandFilterEnabled(!isCommandFilterEnabled)
          }
          label="только команда"
        />
        <FilterChip
          checked={isOnlyOnline}
          onToggle={() => formStore.setIsOnlyOnline(!isOnlyOnline)}
          label="только онлайн"
        />
      </View>
    </View>
  );
});
