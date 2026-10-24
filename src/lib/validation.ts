import { z } from "zod";

export const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email").max(255);
export const passwordSchema = z.string().min(8, "Use at least 8 characters").max(72);

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Password is required") });
export const signupSchema = z
  .object({ email: emailSchema, password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) out[String(i.path[0])] ??= i.message;
  return out;
}
