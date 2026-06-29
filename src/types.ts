export interface TaskProfile {
  deadline: string; // absolute time/date string
  taskType: 'presentation' | 'essay' | 'report' | 'code' | 'meeting_prep' | 'general';
  effortLevel: 'low' | 'medium' | 'high';
  currentProgress: 'none' | 'partial' | 'almost_done';
  dependencies: 'solo' | 'group';
  toneSignals: {
    panicLevel: 'low' | 'medium' | 'high';
    stakesContext: string;
  };
  originalInput: string;
}

export interface MissionAssessment {
  completionProbability: number; // 0 to 100
  timeRemaining: string; // e.g., "5 hours 20 min"
  recommendedStrategy: 'FIGHT' | 'NEGOTIATE';
  reasoning: string;
  details: {
    estimatedOutputCount: string; // e.g., "10-12 slides", "4-5 pages"
    challenges: string[];
    actionItems: string[];
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // Date string
  end: string; // Date string
  classification: 'critical' | 'skippable' | 'deferrable' | 'clutch_work';
  actionTaken?: 'keep' | 'cancel' | 'postpone' | 'added';
  originalEvent?: any;
}

export interface EmailDraft {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  associatedEventId?: string;
  type: 'apology' | 'extension_request';
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface BootstrapOutput {
  title: string;
  type: TaskProfile['taskType'];
  outline: {
    section: string;
    description: string;
    bullets: string[];
    expandMarker?: string; // "[EXPAND THIS]"
  }[];
  additionalInfo?: string;
  sources: { title: string; url: string }[];
}

export interface StuckChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface Debrief {
  id: string;
  taskTitle: string;
  date: string;
  success: boolean;
  whatHappened: string;
  rootCause: string;
  preventiveAction: {
    suggestion: string;
    actionButtonLabel: string;
    calendarEventToSchedule: {
      title: string;
      durationMinutes: number;
    };
  };
}

export interface AmbientDeadlines {
  id: string;
  title: string;
  dueTime: string;
  effortLevel: 'low' | 'medium' | 'high';
  timeUntil: string;
  workspaceCreated: boolean;
}

export interface CompletedSession {
  id: string;
  mode: 'crisis' | 'plan' | 'review';
  taskDescription: string;
  date: string;
  completionProbability: number;
  strategy: 'FIGHT' | 'DAMAGE CONTROL';
  outcome: 'Success' | 'Aborted';
  debriefData: Debrief;
}

