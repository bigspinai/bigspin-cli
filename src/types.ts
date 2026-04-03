// API Response Envelopes

export interface ApiPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  processing_time_ms: number;
}

export interface ApiResponse<T> {
  data: T;
  processing_time_ms: number;
}

export interface ApiErrorBody {
  error: {
    message: string;
    type: string;
    code: number;
    param?: string;
    details?: Record<string, unknown>;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly type: string,
    public readonly statusCode: number,
    message: string,
    public readonly param?: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// GET endpoint responses (snake_case)

export interface ProjectSummary {
  id: string;
  name: string;
  transcript_count: number;
  latest_transcript_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends ProjectSummary {
  executive_summary: Record<string, unknown> | null;
}

export interface TranscriptSummary {
  id: string;
  name: string;
  model_name: string | null;
  language: string | null;
  source_system: string | null;
  external_id: string | null;
  external_user_id: string | null;
  metadata: Record<string, unknown> | null;
  turn_count: number;
  user_turn_count: number;
  assistant_turn_count: number;
  total_token_count: number;
  source_timestamp: string | null;
  created_at: string;
}

export interface TranscriptTurn {
  index: number;
  role: string;
  content: string;
  token_count: number;
  tool_calls?: Array<{
    name: string;
    args: Record<string, unknown>;
  }>;
}

export interface TranscriptDetail extends TranscriptSummary {
  turns: TranscriptTurn[];
  annotations: Record<string, string>;
}

export interface IssueQuote {
  text: string;
  transcript_id: string;
  speaker?: string;
}

export interface IssueCategoryBreakdown {
  category: string;
  count: number;
}

export interface Issue {
  rank: number;
  title: string;
  description: string;
  tags: string[];
  severity: string;
  flagged_count: number;
  quotes: IssueQuote[];
  why_it_matters: {
    user_impact: string;
    action_to_take: string;
  };
  category_breakdown: IssueCategoryBreakdown[];
  transcript_ids: string[];
}

// POST upload response (camelCase)

export interface UploadTranscriptResponse {
  success: boolean;
  data: {
    id: string;
    workspaceId: string;
    name: string;
    modelName: string | null;
    language: string | null;
    sourceSystem: string | null;
    externalId: string | null;
    externalUserId: string | null;
    sourceTimestamp: string | null;
    turnCount: number;
    userTurnCount: number;
    assistantTurnCount: number;
    totalTokenCount: number;
    userTokenCount: number;
    assistantTokenCount: number;
    createdAt: string;
    createdBy: string;
  };
  processing_time_ms: number;
}

// Upload request body (camelCase)

export interface UploadTranscriptRequest {
  name: string;
  modelName?: string;
  language?: string;
  sourceSystem?: string;
  externalId?: string;
  externalUserId?: string;
  metadata?: Record<string, unknown>;
  sourceTimestamp?: string;
  turns: Array<{
    role: 'user' | 'assistant' | 'system' | 'tool' | 'human_agent';
    content: string;
    toolCalls?: Array<{
      name: string;
      args: Record<string, unknown>;
    }>;
    toolResults?: Array<{
      name: string;
      result: unknown;
    }>;
    metadata?: Record<string, unknown>;
    createdAt?: string;
  }>;
}

// Config

export interface CliConfig {
  api_key?: string;
  base_url?: string;
}
