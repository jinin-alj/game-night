import { z } from "zod";

export const groupNameSchema = z
  .string()
  .trim()
  .min(1, { error: "Give the group a name." })
  .max(60, { error: "Use 60 characters or fewer." });

// Codes use 10 characters from ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (no I, O, 0 or 1).
export const inviteCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-HJ-NP-Z2-9]{10}$/, {
    error: "Invite codes are 10 letters and numbers.",
  });

export const idSchema = z.uuid();
