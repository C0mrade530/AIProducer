"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ListTodo, Check, Clock, Circle } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: number
  due_at: string | null
  created_at: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (!workspace) return

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!project) return

    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", project.id)
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false })

    setTasks(data || [])
    setLoading(false)
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    const supabase = createClient()
    await supabase
      .from("tasks")
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", taskId)

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status, completed_at: status === "completed" ? new Date().toISOString() : null } : t
      )
    )
  }

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-success" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-primary" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const pending = tasks.filter((t) => t.status === "pending")
  const inProgress = tasks.filter((t) => t.status === "in_progress")
  const completed = tasks.filter((t) => t.status === "completed")

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ListTodo className="h-6 w-6 text-muted-foreground" />
        <h1 className="font-heading text-3xl font-bold">Задачи</h1>
        <Badge variant="muted" className="ml-2">
          {tasks.filter((t) => t.status !== "completed").length} активных
        </Badge>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListTodo className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Задачи появятся после работы с агентами
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* In Progress */}
          {inProgress.length > 0 && (
            <TaskSection title="В работе" tasks={inProgress} onStatusChange={updateTaskStatus} />
          )}

          {/* Pending */}
          {pending.length > 0 && (
            <TaskSection title="К выполнению" tasks={pending} onStatusChange={updateTaskStatus} />
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <TaskSection title="Выполнено" tasks={completed} onStatusChange={updateTaskStatus} />
          )}
        </div>
      )}
    </div>
  )
}

function TaskSection({
  title,
  tasks,
  onStatusChange,
}: {
  title: string
  tasks: Task[]
  onStatusChange: (id: string, status: string) => void
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 rounded-xl border p-4 hover:bg-muted/30 transition-colors"
          >
            <button
              onClick={() =>
                onStatusChange(
                  task.id,
                  task.status === "completed" ? "pending" : "completed"
                )
              }
              className="cursor-pointer shrink-0"
              aria-label={task.status === "completed" ? "Отметить невыполненным" : "Отметить выполненным"}
            >
              {task.status === "completed" ? (
                <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : "font-medium"}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
              )}
            </div>
            {task.due_at && (
              <span className="text-xs text-muted-foreground shrink-0">
                {new Date(task.due_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
