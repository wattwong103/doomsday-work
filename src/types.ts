export type Priority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  projectId: string | null;
  date: string; // YYYY-MM-DD
  notes: string;
  priority: Priority;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  completedAt: string | null;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description: string;
  createdAt: string;
}

export interface WeeklyGoal {
  id: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  goal: string;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  done: string;
  blockers: string;
  plan: string;
  createdAt: string;
}

export interface RecurringTask {
  id: string;
  title: string;
  projectId: string | null;
  priority: Priority;
  tags: string[];
  frequency: 'daily' | 'weekdays' | 'weekly';
  dayOfWeek?: number; // 0-6 for weekly (0=Sun)
  active: boolean;
  createdAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'dashboard' | 'weekly' | 'projects';
  dropboxToken: string | null;
}

export interface AppData {
  tasks: Task[];
  projects: Project[];
  weeklyGoals: WeeklyGoal[];
  journalEntries: JournalEntry[];
  recurringTasks: RecurringTask[];
  tags: string[];
  settings: AppSettings;
  exportedAt: string;
  version: number;
}
