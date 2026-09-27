import * as Linking from "expo-linking";

import { EXTERNAL_EVENT_BASE_URL } from "@/shared/constants";
import { sanitizeEventCode } from "@/shared/utils/forms.utils";
import { useIconColors } from "@/shared/theme";
import IconButton from "../IconButton/IconButton";

interface LinkToEventProps {
  code: string | null;
}

export default function LinkToEvent({ code }: LinkToEventProps) {
  const sanitizedCode = sanitizeEventCode(code);
  const iconColors = useIconColors();
  if (!sanitizedCode) return null;
  return (
    <IconButton
      icon="up-right-from-square"
      role="link"
      label="Открыть соревнование на сайте ФСР"
      color={iconColors.brand}
      onPress={() =>
        Linking.openURL(`${EXTERNAL_EVENT_BASE_URL}${sanitizedCode}/index.html`)
      }
    />
  );
}
