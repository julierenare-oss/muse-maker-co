import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listSkills, skillsRequest } from "@/lib/skills";
import { useAuthStore } from "@/lib/auth";
import { toast } from "sonner";
import { useState } from "react";

export function useSkills() {
  const token = useAuthStore(s => s.token);
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["skills", token], queryFn: listSkills, retry: false });
  const [busy, setBusy] = useState(false);
  const refresh = () => client.invalidateQueries({ queryKey: ["skills"] });
  const mutate = async (body: Record<string, unknown>) => {
    setBusy(true);
    try { await skillsRequest(body); await refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Не удалось сохранить"); throw error; }
    finally { setBusy(false); }
  };
  return { ...query, busy, mutate, refresh };
}