import { useState } from 'react';
import type { Task, Project } from '../types';
import { useStore } from '../hooks/useStore';

interface Props {
  task: Task;
  projects: Project[];
  showDate?: boolean;
}

export default function TaskCard({ task, projects, showDate }: Props) {
  const { toggleTask, updateTask, deleteTask } = useStore();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [expanded, setExpanded] = useState(false);

  const project = projects.find(p => p.id === task.projectId);

  const handleSave = () => {
    updateTask(task.id, { title, notes });
    setEditing(false);
  };

  return (
    <div className="fade-in group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
            task.status === 'done'
              ? 'border-[var(--color-success)] bg-[var(--color-success)] text-white'
              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
          }`}
        >
          {task.status === 'done' && <span className="text-xs">✓</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                autoFocus
              />
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes..."
                rows={2}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="text-xs px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white">Save</button>
                <button onClick={() => setEditing(false)} className="text-xs px-3 py-1 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => setExpanded(!expanded)} className="text-left w-full">
                <span className={`text-sm ${task.status === 'done' ? 'line-through text-[var(--color-text-secondary)]' : ''}`}>
                  {task.title}
                </span>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {project && (
                    <span
                      className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name}
                    </span>
                  )}
                  {showDate && (
                    <span className="text-[10px] text-[var(--color-text-secondary)]">{task.date}</span>
                  )}
                  {task.notes && !expanded && (
                    <span className="text-[10px] text-[var(--color-text-secondary)]">📝</span>
                  )}
                </div>
              </button>
              {expanded && task.notes && (
                <p className="mt-2 text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap">{task.notes}</p>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                if (task.status !== 'done') {
                  updateTask(task.id, { status: task.status === 'in_progress' ? 'todo' : 'in_progress' });
                }
              }}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                task.status === 'in_progress'
                  ? 'text-[var(--color-primary)] bg-blue-50 dark:bg-blue-950'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'
              }`}
              title="Toggle in-progress"
            >
              ▶
            </button>
            <button
              onClick={() => setEditing(true)}
              className="text-xs px-1.5 py-0.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              ✎
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-xs px-1.5 py-0.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-danger)]"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
