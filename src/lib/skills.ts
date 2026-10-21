import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "./auth";

export interface Skill {
  id: string;
  name: string;
  description: string;
  instructions: string;
  source: "service" | "user";
  scope: "global" | "space";
  visibility: "private" | "project";
  enabled: boolean;
  owner_id: string | null;
  space_id: string | null;
}
export interface SkillSpace { id: string; name: string; owner_id: string }
export interface SkillsData {
  skills: Skill[];
  spaces: SkillSpace[];
  userId: string;
  selections: { skill_id: string; context_id: string; enabled: boolean }[];
  accountMembers: { user_id: string; label: string }[];
  members: { space_id: string; user_id: string }[];
}

export async function skillsRequest<T>(body: Record<string, unknown>): Promise<T> {
  const token = useAuthStore.getState().token;
  const { data, error } = await supabase.functions.invoke("skills", {
    body,
    headers: token ? { "x-external-token": token } : {},
  });
  if (error) {
    let message = "Не удалось загрузить Skills. Попробуйте ещё раз.";
    if (error.context instanceof Response) {
      const response = await error.context.json().catch(() => null);
      if (typeof response?.error === "string") message = response.error;
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data?.data as T;
}

export const listSkills = () => skillsRequest<SkillsData>({ action: "list" });

export async function importSkill(file: File, scope: string, visibility: string, spaceId: string | null) {
  if (file.size > 5 * 1024 * 1024) throw new Error("Максимальный размер файла — 5 МБ");
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return skillsRequest({ action: "create", filename: file.name, file: btoa(binary), scope, visibility, spaceId });
}

export function skillSelected(data: SkillsData, skill: Skill, spaceId?: string) {
  return data.selections.some(s => s.skill_id === skill.id && s.enabled &&
    (s.context_id === (spaceId || "__global__") || (skill.scope === "global" && s.context_id === "__global__")));
}

export async function promptWithSkills(prompt: string, spaceId?: string, signal?: AbortSignal) {
  if (!useAuthStore.getState().token) return prompt;
  const instructions = await skillsRequest<{ name: string; instructions: string }[]>({ action: "instructions", spaceId: spaceId || null });
  signal?.throwIfAborted();
  if (!instructions.length) return prompt;
  return `${instructions.map(s => `[Skill: ${s.name}]\n${s.instructions}`).join("\n\n")}\n\n[Запрос пользователя]\n${prompt}`;
}