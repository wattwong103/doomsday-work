import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AppData, Task, Project, WeeklyGoal, AppSettings } from '../types';
import * as store from '../lib/store';
import { syncWithDropbox } from '../lib/dropbox';
import { generateId, todayStr, randomColor } from '../lib/utils';

interface StoreContextType {
  data: AppData;
  // Tasks
  addTask: (title: string, projectId?: string | null, date?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  // Projects
  addProject: (name: string, description?: string, color?: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  // Weekly goals
  addWeeklyGoal: (weekStart: string, goal: string) => void;
  updateWeeklyGoal: (id: string, updates: Partial<WeeklyGoal>) => void;
  deleteWeeklyGoal: (id: string) => void;
  toggleWeeklyGoal: (id: string) => void;
  // Settings & sync
  updateSettings: (updates: Partial<AppSettings>) => void;
  exportData: () => void;
  importData: (json: string) => boolean;
  triggerSync: () => Promise<void>;
  syncing: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(store.loadData);
  const [syncing, setSyncing] = useState(false);

  const persist = useCallback((updater: (d: AppData) => AppData) => {
    setData(prev => {
      const next = updater(prev);
      store.saveData(next);
      return next;
    });
  }, []);

  // Auto-sync with Dropbox on data change (debounced)
  useEffect(() => {
    if (!data.settings.dropboxToken) return;
    const timer = setTimeout(() => {
      syncWithDropbox(data.settings.dropboxToken!, data).catch(() => {});
    }, 5000);
    return () => clearTimeout(timer);
  }, [data]);

  const addTask = useCallback((title: string, projectId: string | null = null, date?: string) => {
    const task: Task = {
      id: generateId(),
      title,
      status: 'todo',
      projectId,
      date: date || todayStr(),
      notes: '',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    persist(d => store.addTask(d, task));
  }, [persist]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    persist(d => store.updateTask(d, id, updates));
  }, [persist]);

  const deleteTask = useCallback((id: string) => {
    persist(d => store.deleteTask(d, id));
  }, [persist]);

  const toggleTask = useCallback((id: string) => {
    persist(d => {
      const task = d.tasks.find(t => t.id === id);
      if (!task) return d;
      const newStatus = task.status === 'done' ? 'todo' : 'done';
      return store.updateTask(d, id, {
        status: newStatus,
        completedAt: newStatus === 'done' ? new Date().toISOString() : null,
      });
    });
  }, [persist]);

  const addProject = useCallback((name: string, description = '', color?: string) => {
    const project: Project = {
      id: generateId(),
      name,
      color: color || randomColor(),
      description,
      createdAt: new Date().toISOString(),
    };
    persist(d => store.addProject(d, project));
  }, [persist]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    persist(d => store.updateProject(d, id, updates));
  }, [persist]);

  const deleteProject = useCallback((id: string) => {
    persist(d => store.deleteProject(d, id));
  }, [persist]);

  const addWeeklyGoal = useCallback((weekStart: string, goal: string) => {
    const g: WeeklyGoal = { id: generateId(), weekStart, goal, completed: false };
    persist(d => store.addWeeklyGoal(d, g));
  }, [persist]);

  const updateWeeklyGoal = useCallback((id: string, updates: Partial<WeeklyGoal>) => {
    persist(d => store.updateWeeklyGoal(d, id, updates));
  }, [persist]);

  const deleteWeeklyGoal = useCallback((id: string) => {
    persist(d => store.deleteWeeklyGoal(d, id));
  }, [persist]);

  const toggleWeeklyGoal = useCallback((id: string) => {
    persist(d => {
      const g = d.weeklyGoals.find(g => g.id === id);
      if (!g) return d;
      return store.updateWeeklyGoal(d, id, { completed: !g.completed });
    });
  }, [persist]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    persist(d => store.updateSettings(d, updates));
  }, [persist]);

  const exportData = useCallback(() => {
    const json = store.exportToJSON(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doomsday-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback((json: string): boolean => {
    const imported = store.importFromJSON(json);
    if (!imported) return false;
    const merged = store.mergeData(data, imported);
    store.saveData(merged);
    setData(merged);
    return true;
  }, [data]);

  const triggerSync = useCallback(async () => {
    if (!data.settings.dropboxToken) return;
    setSyncing(true);
    try {
      const merged = await syncWithDropbox(data.settings.dropboxToken, data);
      store.saveData(merged);
      setData(merged);
    } finally {
      setSyncing(false);
    }
  }, [data]);

  return (
    <StoreContext.Provider
      value={{
        data, addTask, updateTask, deleteTask, toggleTask,
        addProject, updateProject, deleteProject,
        addWeeklyGoal, updateWeeklyGoal, deleteWeeklyGoal, toggleWeeklyGoal,
        updateSettings, exportData, importData, triggerSync, syncing,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
