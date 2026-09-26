import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().trim().toLowerCase().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const deleteProfileSchema = z.object({
  emailConfirmation: z
    .string()
    .min(1, "Enter your email address.")
    .trim()
    .toLowerCase()
    .email("Enter a valid email address."),
});

export type DeleteProfileInput = z.infer<typeof deleteProfileSchema>;
