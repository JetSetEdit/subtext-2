import type { WarningCategory } from "@/lib/types";

export const TAXONOMY: Record<
  WarningCategory,
  { label: string; description: string }
> = {
  violence: {
    label: "Violence",
    description: "Physical harm, fighting, or graphic injury",
  },
  sexual_content: {
    label: "Sexual content",
    description: "Sexual themes, situations, or references",
  },
  abuse: {
    label: "Abuse",
    description: "Emotional, physical, or domestic abuse themes",
  },
  self_harm_suicide: {
    label: "Self-harm / suicide",
    description: "Self-injury, suicidal ideation, or death by suicide",
  },
  substance: {
    label: "Substance use",
    description: "Alcohol, drugs, or addiction themes",
  },
  discrimination: {
    label: "Discrimination",
    description: "Racism, homophobia, or other prejudice themes",
  },
  language: {
    label: "Strong language",
    description: "Profanity or offensive language",
  },
};

export const VALID_CATEGORIES = Object.keys(TAXONOMY) as WarningCategory[];

export function isValidCategory(value: string): value is WarningCategory {
  return VALID_CATEGORIES.includes(value as WarningCategory);
}
