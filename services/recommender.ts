import { AITool, ToolStats } from "../types";

declare var chrome: any;

// Helper to safely get storage
const getLocalData = (key: string): Promise<any> => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
      chrome.storage.local.get([key], resolve);
    } else {
      const val = localStorage.getItem(key);
      resolve(val ? { [key]: JSON.parse(val) } : {});
    }
  });
};

// Helper to safely set storage
const setLocalData = (data: any): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
      chrome.storage.local.set(data, () => resolve());
    } else {
      Object.keys(data).forEach(k => localStorage.setItem(k, JSON.stringify(data[k])));
      resolve();
    }
  });
};

// Supported Tools
export const AVAILABLE_TOOLS: AITool[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '✨',
    subtitle: 'Great for reasoning',
    url: 'https://gemini.google.com/app',
    intentPrior: { coding: 0.5, creative: 0.8, explanation: 0.8, research: 0.6 }
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '🤖',
    subtitle: 'Versatile assistant',
    url: 'https://chatgpt.com',
    intentPrior: { coding: 0.8, creative: 0.7, explanation: 0.7, research: 0.4 }
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '🔍',
    subtitle: 'Real-time research',
    url: 'https://www.perplexity.ai',
    intentPrior: { coding: 0.4, creative: 0.3, explanation: 0.6, research: 0.9 }
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '🧠',
    subtitle: 'Nuanced writing',
    url: 'https://claude.ai',
    intentPrior: { coding: 0.9, creative: 0.8, explanation: 0.6, research: 0.4 }
  }
];

// Determine Intent
const detectIntent = (text: string): string => {
  const t = text.toLowerCase();
  if (t.includes('code') || t.includes('function') || t.includes('bug') || t.includes('script') || t.includes('react')) return 'coding';
  if (t.includes('poem') || t.includes('story') || t.includes('write') || t.includes('creative') || t.includes('caption')) return 'creative';
  if (t.includes('search') || t.includes('find') || t.includes('latest') || t.includes('news') || t.includes('source')) return 'research';
  return 'explanation';
};

// UCB Algorithm
const calculateUCB = (stats: ToolStats, totalImpressions: number, c: number = 1.414): number => {
  if (stats.uses === 0) return 100; // Force exploration
  const averageReward = stats.avgRating / 5.0; // Normalize 5-star to 0-1
  const exploration = Math.sqrt((2 * Math.log(totalImpressions)) / stats.uses);
  return averageReward + (c * exploration);
};

// Main Recommendation Function
export const getRecommendations = async (text: string): Promise<AITool[]> => {
  const intent = detectIntent(text);
  
  const result = await getLocalData('recommenderStats');
  const statsMap: Record<string, ToolStats> = result.recommenderStats || {};
  let totalImpressions = 0;

  // Initialize missing stats and count total
  AVAILABLE_TOOLS.forEach(tool => {
    if (!statsMap[tool.id]) {
      statsMap[tool.id] = { uses: 0, totalRating: 0, avgRating: 0 };
    }
    totalImpressions += statsMap[tool.id].uses;
  });

  // Calculate Scores
  const scoredTools = AVAILABLE_TOOLS.map(tool => {
    const ucbScore = calculateUCB(statsMap[tool.id], totalImpressions || 1);
    const prior = tool.intentPrior[intent] || 0.5;
    // Combine UCB with Capability Prior (Weighted sum)
    const finalScore = (ucbScore * 0.7) + (prior * 0.3); 
    
    return { ...tool, score: finalScore };
  });

  // Sort Descending
  scoredTools.sort((a, b) => b.score - a.score);

  // Return top 2
  return scoredTools.slice(0, 2);
};

// Track Usage (Click)
export const trackToolUsage = async (toolId: string, promptText: string, intent: string) => {
  // 1. Create hash for prompt identification
  const promptHash = btoa(encodeURIComponent(promptText)).substring(0, 20);

  // 2. Save pending feedback
  const pendingItem = {
    promptHash,
    toolId,
    intent,
    timestamp: Date.now()
  };

  const { pendingFeedback = {} } = await getLocalData('pendingFeedback');
  pendingFeedback[promptHash] = pendingItem;
  await setLocalData({ pendingFeedback });

  // 3. Set Alarm for 15 minutes (using 1 min for testing if needed, but req says 15-20)
  if (typeof chrome !== 'undefined' && chrome?.alarms) {
    chrome.alarms.create(`feedback-${promptHash}`, { delayInMinutes: 15 });
  }
};

// Update Stats (Feedback)
export const updateToolStats = async (toolId: string, rating: number) => {
  const { recommenderStats = {} } = await getLocalData('recommenderStats');
  
  const current: ToolStats = recommenderStats[toolId] || { uses: 0, totalRating: 0, avgRating: 0 };
  
  current.uses += 1;
  current.totalRating += rating;
  current.avgRating = current.totalRating / current.uses;
  
  recommenderStats[toolId] = current;
  await setLocalData({ recommenderStats });
};