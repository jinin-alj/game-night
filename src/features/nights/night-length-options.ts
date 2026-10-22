import type { SelectOption } from "@/components/SelectField";
import { formatDuration } from "@/lib/dates";
import {
  MAX_NIGHT_MINUTES,
  MIN_NIGHT_MINUTES,
  NIGHT_MINUTES_STEP,
} from "./limits";

export const nightLengthOptions: SelectOption[] = [];
for (
  let minutes = MIN_NIGHT_MINUTES;
  minutes <= MAX_NIGHT_MINUTES;
  minutes += NIGHT_MINUTES_STEP
) {
  nightLengthOptions.push({
    value: String(minutes),
    label: formatDuration(minutes),
  });
}
