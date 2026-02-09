
export interface Rule {
  id: string;
  category: string;
  title: string;
  description: string;
  punishment: string;
  abbreviations: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  event: string;
  type: 'meeting' | 'deadline' | 'update' | 'work' | 'other';
}

export interface UserLog {
  nickname: string;
  lastVisit: string;
}
