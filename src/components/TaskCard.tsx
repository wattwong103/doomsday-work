import { useState } from 'react';
import type { Task, Project, Priority } from '../types';
import { useStore } from '../hooks/useStore';

interface Props {
  task: Task;
  projects: Project[];
  showDate?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  none: { label: '', color: '', bg: '' },
  low: { label: 'Low', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-950' },
  medium: { label: 'Med', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-950' },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-950' },
  urgent: { label: '!!!', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-950' },
};

export default function TaskCard({ task, projects, showDate, dragHandleProps }: Props) {
  const { toggleTask, updateTask, deleteTask, data } = useStore();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [tagInput, setTagInput] = useState('');
  const [taskTags, setTaskTags] = useState<string[]>(task.tags);
  const [expanded, setExpanded] = useState(false);

  const project = projects.find(p => p.id === task.projectId);
  const pri = PRIORITY_CONFIG[task.priority];

  const handleSave = () => {
    updateTask(task.id, { title, notes, priority, tags: taskTags });
    setEditing(false);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (tag && !taskTags.includes(tag)) {
      setTaskTags([...taskTags, tag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTaskTags(taskTags.filter(t => t !== tag));
  };

  return (
    <div className={`fade-in group rounded-xl border bg-[var(--color-surface)] p-3 transition-all hover:shadow-md ${
      task.priority === 'urgent' ? 'border-red-400 dark:border-red-700' :
      task.priority === 'high' ? 'border-orange-300 dark:border-orange-800' :
      'border-[var(--color-border)]'
    }`}>
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        {dragHandleProps && (
          <span
            {...dragHandleProps}
            className="mt-1 cursor-grab text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-60 transition-opacity select-none"
          >
            ⠿
          </span>
        )}

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
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)] outline-none"
              >
                <option value="none">No priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {taskTags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-[var(--color-danger)]">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                    list="tag-suggestions"
                    className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-xs text-[var(--color-text)] outline-none"
                  />
                  <datalist id="tag-suggestions">
                    {data.tags.filter(t => !taskTags.includes(t)).map(t => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                  <button onClick={handleAddTag} className="text-xs px-2 py-1 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">+</button>
                </div>
              </div>
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
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {pri.label && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pri.bg} ${pri.color}`}>
                      {pri.label}
                    </span>
                  )}
                  {project && (
                    <span
                      className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name}
                    </span>
                  )}
                  {task.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
                      #{tag}
                    </span>
                  ))}
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
