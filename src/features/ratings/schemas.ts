import { z } from "zod";

const scoreError = "Pick a rating from 1 to 10.";

export const scoreSchema = z.coerce
  .number({ error: scoreError })
  .int({ error: scoreError })
  .min(1, { error: scoreError })
  .max(10, { error: scoreError });
