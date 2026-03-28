import { useState, type FormEvent } from 'react';
import { useStore } from '../hooks/useStore';

interface Props {
  date?: string;
  projectId?: string | null;
  onDone?: () => void;
}

export default function TaskForm({ date, projectId, onDone }: Props) {
  const { data, addTask } = useStore();
  const [title, setTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState(projectId ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), selectedProject || null, date);
    setTitle('');
    onDone?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Add a task..."
        className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-[var(--color-text-secondary)]"
        autoFocus
      />
      {projectId === undefined && data.projects.length > 0 && (
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text)] outline-none"
        >
          <option value="">No project</option>
          {data.projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      )}
      <button
        type="submit"
        className="shrink-0 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
      >
        Add
      </button>
    </form>
  );
}
