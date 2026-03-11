import { z } from "zod";
import { EXPLAIN_STYLES, KNOWLEDGE_LEVELS } from "@/lib/constants";

export const explainHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const explainRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  style: z.enum(EXPLAIN_STYLES),
  level: z.enum(KNOWLEDGE_LEVELS),
  history: z.array(explainHistoryMessageSchema).default([]),
  conversationId: z.string().uuid().optional(),
});

export const quizGenerateSchema = z.object({
  keyword: z.string().min(1).max(200),
  count: z.enum(["5", "8", "10"]),
  categoryId: z.string().uuid().optional(),
});

export const quizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
});

export const quizQuestionsSchema = z.object({
  questions: z.array(quizQuestionSchema),
});

export const quizSubmitSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedIndex: z.number().int().min(0).max(3),
    }),
  ),
});

export const cardGenerateSchema = z.object({
  topic: z.string().min(1).max(200),
  categoryId: z.string().uuid().optional(),
});

export const cardPayloadSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1).max(120),
  content: z.string().min(1),
});

export const keyPointSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
});

export const documentAnalyzeRequestSchema = z.object({
  documentId: z.string().uuid(),
});

export const documentKeyPointsSchema = z.object({
  keyPoints: z.array(keyPointSchema).max(10),
});
