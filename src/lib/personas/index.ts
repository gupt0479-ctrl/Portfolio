import { CEO_BLOCK } from "./ceo";
import { FRIEND_BLOCK } from "./friend";
import { RECRUITER_BLOCK } from "./recruiter";
import { WEIRDO_BLOCK } from "./weirdo";

export const PERSONAS = ["recruiter", "friend", "weirdo", "ceo"] as const;
export type Persona = (typeof PERSONAS)[number];

const PERSONA_BLOCKS: Record<Persona, string> = {
  recruiter: RECRUITER_BLOCK,
  friend: FRIEND_BLOCK,
  weirdo: WEIRDO_BLOCK,
  ceo: CEO_BLOCK,
};

export function getPersonaBlock(persona: Persona): string {
  return PERSONA_BLOCKS[persona];
}
