import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

export const authTokenResponseSchema = z.object({
  token: z.string(),
  user: authUserSchema,
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>;
