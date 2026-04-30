import { useState } from 'react';
import type { Priority, RecurringTask } from '../types';
import { useStore } from '../hooks/useStore';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Recurring() {
  const { data, addRecurringTask, updateRecurringTask, deleteRecurringTask } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<RecurringTask['frequency']>('daily');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [priority, setPriority] = useState<Priority>('none');
  const [project, setProject] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    addRecurringTask(
      title.trim(),
      frequency,
      project || null,
      priority,
      [],
      frequency === 'weekly' ? dayOfWeek : undefined,
    );
    setTitle('');
    setFrequency('daily');
    setPriority('none');
    setProject('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recurring Tasks</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium"
        >
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      <p className="text-sm text-[var(--color-text-secondary)]">
        These tasks are automatically created each day based on their schedule.
      </p>

      {showForm && (
        <div className="fade-in rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value as RecurringTask['frequency'])}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
            >
              <option value="daily">Every day</option>
              <option value="weekdays">Weekdays only</option>
              <option value="weekly">Weekly</option>
            </select>
            {frequency === 'weekly' && (
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(Number(e.target.value))}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
              >
                {DAYS.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            )}
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
            >
              <option value="none">No priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            {data.projects.length > 0 && (
              <select
                value={project}
                onChange={e => setProject(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] outline-none"
              >
                <option value="">No project</option>
                {data.projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium"
          >
            Create
          </button>
        </div>
      )}

      <div className="space-y-2">
        {data.recurringTasks.map(rt => {
          const proj = data.projects.find(p => p.id === rt.projectId);
          return (
            <div
              key={rt.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 group"
            >
              <button
                onClick={() => updateRecurringTask(rt.id, { active: !rt.active })}
                className={`h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${
                  rt.active
                    ? 'border-[var(--color-success)] bg-[var(--color-success)] text-white'
                    : 'border-[var(--color-border)]'
                }`}
              >
                {rt.active && <span className="text-xs">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!rt.active ? 'line-through text-[var(--color-text-secondary)]' : ''}`}>
                  {rt.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
                    {rt.frequency === 'daily' ? 'Every day' : rt.frequency === 'weekdays' ? 'Weekdays' : `Every ${DAYS[rt.dayOfWeek ?? 1]}`}
                  </span>
                  {rt.priority !== 'none' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
                      {rt.priority}
                    </span>
                  )}
                  {proj && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: proj.color }}>
                      {proj.name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteRecurringTask(rt.id)}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {data.recurringTasks.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🔄</p>
          <p className="text-[var(--color-text-secondary)]">No recurring tasks</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Create tasks that auto-repeat daily or weekly</p>
        </div>
      )}
    </div>
  );
}
