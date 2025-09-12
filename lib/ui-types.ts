import type { GenerateReq, GenerateRes } from "./types";

// Request state management for UI components
export type RequestState =
  | { status: "idle" }
  | { status: "loading"; req: GenerateReq }
  | { status: "success"; req: GenerateReq; res: GenerateRes }
  | { status: "error"; req: GenerateReq; error: ApiError };

// Standardized API error shape
export interface ApiError {
  message: string;
  code?: "BAD_REQUEST" | "INTERNAL_ERROR" | "RATE_LIMITED" | string;
  issues?: unknown;
}
