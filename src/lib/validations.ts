import { z } from "zod"

/** POST /api/agents/[agentId]/run */
export const agentRunSchema = z.object({
  message: z.string().min(1).max(10000),
  projectId: z.string().uuid(),
  runId: z.string().uuid().optional(),
  isArtifactRequest: z.boolean().optional(),
})

/** POST /api/artifacts */
export const artifactCreateSchema = z.object({
  projectId: z.string().uuid(),
  agentCode: z.string().min(1).max(50),
  runId: z.string().uuid().optional(),
  title: z.string().min(1).max(500),
  type: z.string().min(1).max(100).optional(),
  contentMd: z.string().min(1).max(500000),
  contentJson: z.record(z.string(), z.unknown()).optional(),
})

/** POST /api/payments/create */
export const paymentCreateSchema = z.object({
  plan: z.enum(["starter", "pro", "premium"]),
})
