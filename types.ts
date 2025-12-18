
export interface Rule {
  id: string;
  category: string;
  title: string;
  description: string;
  punishment: string;
  abbreviations: string[];
  note?: string;
  updates?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
