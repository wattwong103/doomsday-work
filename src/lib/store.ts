import type { AppData, Task, Project, WeeklyGoal, AppSettings, JournalEntry, RecurringTask } from '../types';

const STORAGE_KEY = 'doomsday-work-data';

function defaultData(): AppData {
  return {
    tasks: [],
    projects: [],
    weeklyGoals: [],
    journalEntries: [],
    recurringTasks: [],
    tags: [],
    settings: { theme: 'system', defaultView: 'dashboard', dropboxToken: null },
    exportedAt: new Date().toISOString(),
    version: 2,
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw);
    return migrateData({ ...defaultData(), ...parsed });
  } catch {
    return defaultData();
  }
}

function migrateData(data: AppData): AppData {
  data.tasks = data.tasks.map(t => ({
    ...t,
    priority: t.priority ?? ('none' as const),
    tags: t.tags ?? [],
    sortOrder: t.sortOrder ?? 0,
  }));
  if (!data.journalEntries) data.journalEntries = [];
  if (!data.recurringTasks) data.recurringTasks = [];
  if (!data.tags) data.tags = [];
  data.version = 2;
  return data;
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

export function reorderTasks(data: AppData, date: string, orderedIds: string[]): AppData {
  const updated = data.tasks.map(t => {
    if (t.date !== date) return t;
    const idx = orderedIds.indexOf(t.id);
    return idx >= 0 ? { ...t, sortOrder: idx } : t;
  });
  return { ...data, tasks: updated };
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

// Journal operations
export function upsertJournal(data: AppData, entry: JournalEntry): AppData {
  const exists = data.journalEntries.find(j => j.date === entry.date);
  if (exists) {
    return {
      ...data,
      journalEntries: data.journalEntries.map(j =>
        j.date === entry.date ? { ...j, ...entry } : j
      ),
    };
  }
  return { ...data, journalEntries: [...data.journalEntries, entry] };
}

// Recurring task operations
export function addRecurringTask(data: AppData, rt: RecurringTask): AppData {
  return { ...data, recurringTasks: [...data.recurringTasks, rt] };
}

export function updateRecurringTask(data: AppData, id: string, updates: Partial<RecurringTask>): AppData {
  return {
    ...data,
    recurringTasks: data.recurringTasks.map(r => (r.id === id ? { ...r, ...updates } : r)),
  };
}

export function deleteRecurringTask(data: AppData, id: string): AppData {
  return { ...data, recurringTasks: data.recurringTasks.filter(r => r.id !== id) };
}

// Tags
export function addTag(data: AppData, tag: string): AppData {
  if (data.tags.includes(tag)) return data;
  return { ...data, tags: [...data.tags, tag] };
}

export function deleteTag(data: AppData, tag: string): AppData {
  return {
    ...data,
    tags: data.tags.filter(t => t !== tag),
    tasks: data.tasks.map(t => ({ ...t, tags: t.tags.filter(tg => tg !== tag) })),
  };
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
      return migrateData({ ...defaultData(), ...parsed });
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

  const journalMap = new Map(local.journalEntries.map(j => [j.date, j]));
  for (const j of remote.journalEntries) {
    if (!journalMap.has(j.date)) journalMap.set(j.date, j);
  }

  const recurringMap = new Map(local.recurringTasks.map(r => [r.id, r]));
  for (const r of remote.recurringTasks) {
    if (!recurringMap.has(r.id)) recurringMap.set(r.id, r);
  }

  const tags = Array.from(new Set([...local.tags, ...remote.tags]));

  return {
    ...local,
    tasks: Array.from(taskMap.values()),
    projects: Array.from(projectMap.values()),
    weeklyGoals: Array.from(goalMap.values()),
    journalEntries: Array.from(journalMap.values()),
    recurringTasks: Array.from(recurringMap.values()),
    tags,
  };
}
