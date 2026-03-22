export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  projectId: string | null;
  date: string; // YYYY-MM-DD
  notes: string;
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

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'dashboard' | 'weekly' | 'projects';
  dropboxToken: string | null;
}

export interface AppData {
  tasks: Task[];
  projects: Project[];
  weeklyGoals: WeeklyGoal[];
  settings: AppSettings;
  exportedAt: string;
  version: number;
}
