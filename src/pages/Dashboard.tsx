import { useMemo, useState, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { todayStr, formatDate } from '../lib/utils';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data, reorderTasks, saveJournal } = useStore();
  const today = todayStr();
  const dragItem = useRef<string | null>(null);
  const dragOver = useRef<string | null>(null);

  const todayTasks = useMemo(
    () => data.tasks.filter(t => t.date === today).sort((a, b) => a.sortOrder - b.sortOrder),
    [data.tasks, today]
  );

  const inProgress = todayTasks.filter(t => t.status === 'in_progress');
  const todo = todayTasks.filter(t => t.status === 'todo');
  const done = todayTasks.filter(t => t.status === 'done');
  const completionRate = todayTasks.length ? Math.round((done.length / todayTasks.length) * 100) : 0;

  // Journal
  const journal = data.journalEntries.find(j => j.date === today);
  const [showJournal, setShowJournal] = useState(false);
  const [journalDone, setJournalDone] = useState(journal?.done ?? '');
  const [journalBlockers, setJournalBlockers] = useState(journal?.blockers ?? '');
  const [journalPlan, setJournalPlan] = useState(journal?.plan ?? '');

  const handleSaveJournal = () => {
    saveJournal(today, journalDone, journalBlockers, journalPlan);
  };

  // Drag-and-drop
  const handleDragStart = (id: string) => { dragItem.current = id; };
  const handleDragEnter = (id: string) => { dragOver.current = id; };
  const handleDragEnd = () => {
    if (dragItem.current && dragOver.current && dragItem.current !== dragOver.current) {
      const ids = todayTasks.map(t => t.id);
      const fromIdx = ids.indexOf(dragItem.current);
      const toIdx = ids.indexOf(dragOver.current);
      if (fromIdx >= 0 && toIdx >= 0) {
        ids.splice(fromIdx, 1);
        ids.splice(toIdx, 0, dragItem.current);
        reorderTasks(today, ids);
      }
    }
    dragItem.current = null;
    dragOver.current = null;
  };

  const renderTaskList = (tasks: ReturnType<typeof todayTasks.filter>) =>
    tasks.map(t => (
      <div
        key={t.id}
        draggable
        onDragStart={() => handleDragStart(t.id)}
        onDragEnter={() => handleDragEnter(t.id)}
        onDragEnd={handleDragEnd}
        onDragOver={e => e.preventDefault()}
      >
        <TaskCard task={t} projects={data.projects} dragHandleProps={{}} />
      </div>
    ));

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">{format(new Date(), 'EEEE')}</p>
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
          <div className="space-y-2">{renderTaskList(inProgress)}</div>
        </section>
      )}

      {/* Todo */}
      {todo.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
            To Do ({todo.length})
          </h2>
          <div className="space-y-2">{renderTaskList(todo)}</div>
        </section>
      )}

      {/* Done */}
      {done.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-success)] mb-2">
            Done ({done.length})
          </h2>
          <div className="space-y-2">{renderTaskList(done)}</div>
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

      {/* Daily Journal / Standup */}
      <section>
        <button
          onClick={() => setShowJournal(!showJournal)}
          className="flex items-center gap-2 text-sm font-semibold mb-3"
        >
          <span className={`transition-transform ${showJournal ? 'rotate-90' : ''}`}>▶</span>
          Daily Journal
          {journal && <span className="text-[10px] text-[var(--color-success)] font-normal">saved</span>}
        </button>
        {showJournal && (
          <div className="fade-in space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">What I did today</label>
              <textarea
                value={journalDone}
                onChange={e => setJournalDone(e.target.value)}
                rows={3}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none"
                placeholder="Completed the auth flow, reviewed PRs..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Blockers</label>
              <textarea
                value={journalBlockers}
                onChange={e => setJournalBlockers(e.target.value)}
                rows={2}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none"
                placeholder="Waiting on API docs, CI is broken..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Plan for tomorrow</label>
              <textarea
                value={journalPlan}
                onChange={e => setJournalPlan(e.target.value)}
                rows={2}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none"
                placeholder="Start on the dashboard, fix the deploy..."
              />
            </div>
            <button
              onClick={handleSaveJournal}
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium"
            >
              Save Journal
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
