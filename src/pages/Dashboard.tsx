import { useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { todayStr, formatDate } from '../lib/utils';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data } = useStore();
  const today = todayStr();

  const todayTasks = useMemo(
    () => data.tasks.filter(t => t.date === today),
    [data.tasks, today]
  );

  const inProgress = todayTasks.filter(t => t.status === 'in_progress');
  const todo = todayTasks.filter(t => t.status === 'todo');
  const done = todayTasks.filter(t => t.status === 'done');

  const completionRate = todayTasks.length
    ? Math.round((done.length / todayTasks.length) * 100)
    : 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {format(new Date(), 'EEEE')}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{formatDate(today)}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3 text-center">
          <p className="text-2xl font-bold">{todayTasks.length}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Total</p>
        </div>
        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3 text-center">
          <p className="text-2xl font-bold text-[var(--color-success)]">{done.length}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Done</p>
        </div>
        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3 text-center">
          <p className="text-2xl font-bold text-[var(--color-primary)]">{completionRate}%</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Complete</p>
        </div>
      </div>

      {/* Add task */}
      <TaskForm date={today} />

      {/* In Progress */}
      {inProgress.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] mb-2">
            In Progress ({inProgress.length})
          </h2>
          <div className="space-y-2">
            {inProgress.map(t => (
              <TaskCard key={t.id} task={t} projects={data.projects} />
            ))}
          </div>
        </section>
      )}

      {/* Todo */}
      {todo.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
            To Do ({todo.length})
          </h2>
          <div className="space-y-2">
            {todo.map(t => (
              <TaskCard key={t.id} task={t} projects={data.projects} />
            ))}
          </div>
        </section>
      )}

      {/* Done */}
      {done.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-success)] mb-2">
            Done ({done.length})
          </h2>
          <div className="space-y-2">
            {done.map(t => (
              <TaskCard key={t.id} task={t} projects={data.projects} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {todayTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">☀️</p>
          <p className="text-[var(--color-text-secondary)]">No tasks for today yet</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Add one above to get started</p>
        </div>
      )}
    </div>
  );
}
