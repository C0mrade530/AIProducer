import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Проверяет, что пользователь имеет доступ к проекту
 * через membership в workspace проекта.
 *
 * Возвращает workspace_id если доступ есть, null если нет.
 */
export async function verifyProjectAccess(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<string | null> {
  const { data: project } = await supabase
    .from("projects")
    .select("workspace_id")
    .eq("id", projectId)
    .single()

  if (!project) return null

  const { data: member } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", userId)
    .single()

  return member ? project.workspace_id : null
}
