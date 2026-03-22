import type { AppData, Task, Project, WeeklyGoal, AppSettings } from '../types';

const STORAGE_KEY = 'doomsday-work-data';

function defaultData(): AppData {
  return {
    tasks: [],
    projects: [],
    weeklyGoals: [],
    settings: { theme: 'system', defaultView: 'dashboard', dropboxToken: null },
    exportedAt: new Date().toISOString(),
    version: 1,
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    return { ...defaultData(), ...JSON.parse(raw) };
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  data.exportedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Task operations
export function addTask(data: AppData, task: Task): AppData {
  return { ...data, tasks: [...data.tasks, task] };
}

export function updateTask(data: AppData, id: string, updates: Partial<Task>): AppData {
  return {
    ...data,
    tasks: data.tasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
  };
}

export function deleteTask(data: AppData, id: string): AppData {
  return { ...data, tasks: data.tasks.filter(t => t.id !== id) };
}

// Project operations
export function addProject(data: AppData, project: Project): AppData {
  return { ...data, projects: [...data.projects, project] };
}

export function updateProject(data: AppData, id: string, updates: Partial<Project>): AppData {
  return {
    ...data,
    projects: data.projects.map(p => (p.id === id ? { ...p, ...updates } : p)),
  };
}

export function deleteProject(data: AppData, id: string): AppData {
  return {
    ...data,
    projects: data.projects.filter(p => p.id !== id),
    tasks: data.tasks.map(t => (t.projectId === id ? { ...t, projectId: null } : t)),
  };
}

// Weekly goal operations
export function addWeeklyGoal(data: AppData, goal: WeeklyGoal): AppData {
  return { ...data, weeklyGoals: [...data.weeklyGoals, goal] };
}

export function updateWeeklyGoal(data: AppData, id: string, updates: Partial<WeeklyGoal>): AppData {
  return {
    ...data,
    weeklyGoals: data.weeklyGoals.map(g => (g.id === id ? { ...g, ...updates } : g)),
  };
}

export function deleteWeeklyGoal(data: AppData, id: string): AppData {
  return { ...data, weeklyGoals: data.weeklyGoals.filter(g => g.id !== id) };
}

// Settings
export function updateSettings(data: AppData, updates: Partial<AppSettings>): AppData {
  return { ...data, settings: { ...data.settings, ...updates } };
}

// Export/Import
export function exportToJSON(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importFromJSON(json: string): AppData | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed.tasks && parsed.projects && parsed.weeklyGoals) {
      return { ...defaultData(), ...parsed };
    }
    return null;
  } catch {
    return null;
  }
}

export function mergeData(local: AppData, remote: AppData): AppData {
  const taskMap = new Map(local.tasks.map(t => [t.id, t]));
  for (const t of remote.tasks) {
    const existing = taskMap.get(t.id);
    if (!existing || t.createdAt > existing.createdAt) {
      taskMap.set(t.id, t);
    }
  }

  const projectMap = new Map(local.projects.map(p => [p.id, p]));
  for (const p of remote.projects) {
    if (!projectMap.has(p.id)) projectMap.set(p.id, p);
  }

  const goalMap = new Map(local.weeklyGoals.map(g => [g.id, g]));
  for (const g of remote.weeklyGoals) {
    if (!goalMap.has(g.id)) goalMap.set(g.id, g);
  }

  return {
    ...local,
    tasks: Array.from(taskMap.values()),
    projects: Array.from(projectMap.values()),
    weeklyGoals: Array.from(goalMap.values()),
  };
}
