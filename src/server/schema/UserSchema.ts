import { SelectedEnum } from "@prisma/client";
import { z } from "zod";

export const selectedComps = z.nativeEnum(SelectedEnum);
export type selectedCompsEnum = z.infer<typeof selectedComps>;

const nullToUndefined = z.literal(null).transform(() => undefined);
const emptyStringToUndefined = z.literal("").transform(() => undefined);

export function asOptionalField<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional().or(nullToUndefined).or(emptyStringToUndefined);
}

export const onboardingSchema = z
  .object({
    name: z.string().optional(),
    USNEmail: z.string().email().endsWith("usn.no", {
      message: "Your email must be an USN email.",
    }),
    protusId: z
      .number({
        invalid_type_error: "Your ID should be between 24001 and 24100",
      })
      .gt(24000, { message: "Your ID must be greater than 24000" })
      .lt(24101, { message: "Your ID must be lower than 24101" })
      .int(),
    selectedComponents: z.array(z.string()),
    leaderboard: z.boolean(),
  })
  .transform((data) => ({
    ...data,
    name: data.leaderboard ? data.name : undefined,
  }))
  .refine(
    (data) => !data.leaderboard || (data.name ? data.name.length > 2 : false),
    {
      message: "Name must be at least three characters long",
      path: ["name"],
    }
  )
  .refine(
    (data) => !data.leaderboard || (data.name ? data.name.length < 15 : false),
    {
      message: "Name must be fewer than 15 characters",
      path: ["name"],
    }
  );

export const userPreferenceSchema = z
  .object({
    newSelectedComponents: z.array(selectedComps),
    leaderboard: z.boolean(),
    name: asOptionalField(z.string()),
  })
  .transform((data) => ({
    ...data,
    name: data.leaderboard ? data.name : undefined,
  }))
  .refine(
    (data) => !data.leaderboard || (data.name ? data.name.length > 2 : false),
    {
      message: "Name must be at least three characters long",
      path: ["name"],
    }
  )
  .refine(
    (data) => !data.leaderboard || (data.name ? data.name.length < 15 : false),
    {
      message: "Name must be fewer than 15 characters",
      path: ["name"],
    }
  );

export const toDoSchema = z.object({
  dueDate: z.date(),
  name: z.string(),
  userId: z.string(),
});

export type ToDoForm = z.infer<typeof toDoSchema>;
export type OnboardingForm = z.infer<typeof onboardingSchema>;
export type UserPreferenceForm = z.infer<typeof userPreferenceSchema>;
