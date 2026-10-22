import { z } from "zod";
import { isRealDate } from "@/lib/dates";
import {
  MAX_NIGHT_MINUTES,
  MIN_NIGHT_MINUTES,
  NIGHT_MINUTES_STEP,
  NIGHT_NAME_MAX_LENGTH,
} from "./limits";

const nightLengthError = "Choose between 30 minutes and 12 hours.";

export const createNightSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Give the night a name." })
    .max(NIGHT_NAME_MAX_LENGTH, { error: "Use 80 characters or fewer." }),
  nightDate: z.string().refine(isRealDate, { error: "Pick a valid date." }),
  availableMinutes: z.coerce
    .number({ error: nightLengthError })
    .int({ error: nightLengthError })
    .min(MIN_NIGHT_MINUTES, { error: nightLengthError })
    .max(MAX_NIGHT_MINUTES, { error: nightLengthError })
    .multipleOf(NIGHT_MINUTES_STEP, { error: nightLengthError }),
});

export const nightIdSchema = z.uuid();

export const guestNameSchema = z
  .string()
  .trim()
  .min(1, { error: "Enter the guest’s name." })
  .max(40, { error: "Use 40 characters or fewer." });

export const attendeeIdsSchema = z.array(z.uuid());
