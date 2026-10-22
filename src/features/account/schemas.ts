import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .pipe(z.email({ error: "Enter a valid email address." }));

// No minimum length of our own: Supabase's password rules decide.
const passwordField = z.string().min(1, { error: "Enter your password." });

export const signUpSchema = z.object({
  email: emailField,
  password: passwordField,
  displayName: z
    .string()
    .trim()
    .max(40, { error: "Use 40 characters or fewer." }),
});

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, { error: "Enter a name." })
  .max(40, { error: "Use 40 characters or fewer." });

export const logInSchema = z.object({
  email: emailField,
  password: passwordField,
});
