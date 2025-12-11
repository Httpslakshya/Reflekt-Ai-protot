export enum AppView {
  PROMPT = 'PROMPT',
  MESSAGE = 'MESSAGE',
  OPTIONS = 'OPTIONS',
  FEEDBACK = 'FEEDBACK'
}

export enum PromptMode {
  LIGHT = 'LIGHT',
  NORMAL = 'NORMAL',
  DETAILED = 'DETAILED'
}

export enum ToneType {
  PROFESSIONAL = 'PROFESSIONAL',
  CASUAL = 'CASUAL',
  POLITE = 'POLITE',
  FUNNY = 'FUNNY',
  SOCIAL = 'SOCIAL'
}

export interface AITool {
  id: string;
  name: string;
  icon: string; // Emoji
  subtitle: string;
  url: string;
  intentPrior: Record<string, number>; // Capability score per intent
}

export interface ToolStats {
  uses: number;
  totalRating: number;
  avgRating: number;
}

export interface FeedbackPendingItem {
  promptHash: string;
  toolId: string;
  intent: string;
  timestamp: number;
  needsAction?: boolean;
}

export type GeminiToneResponse = Record<ToneType, string>;
