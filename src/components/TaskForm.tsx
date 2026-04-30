import { useState, type FormEvent } from 'react';
import type { Priority } from '../types';
import { useStore } from '../hooks/useStore';

interface Props {
  date?: string;
  projectId?: string | null;
  onDone?: () => void;
}

export default function TaskForm({ date, projectId, onDone }: Props) {
  const { data, addTask, addTag } = useStore();
  const [title, setTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState(projectId ?? '');
  const [priority, setPriority] = useState<Priority>('none');
  const [showMore, setShowMore] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), selectedProject || null, date, priority, tags);
    tags.forEach(t => addTag(t));
    setTitle('');
    setPriority('none');
    setTags([]);
    setShowMore(false);
    onDone?.();
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-[var(--color-text-secondary)]"
          autoFocus
        />
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className={`shrink-0 rounded-xl px-2.5 py-2.5 text-sm transition-colors ${
            showMore ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'
          }`}
          title="More options"
        >
          ⚙
        </button>
        <button
          type="submit"
          className="shrink-0 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
        >
          Add
        </button>
      </div>
      {showMore && (
        <div className="flex flex-wrap gap-2 items-center fade-in">
          {projectId === undefined && data.projects.length > 0 && (
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none"
            >
              <option value="">No project</option>
              {data.projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none"
          >
            <option value="none">No priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <div className="flex items-center gap-1">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
                #{tag}
                <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-[var(--color-danger)]">×</button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              placeholder="#tag"
              list="form-tag-suggestions"
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-2 py-1.5 text-xs text-[var(--color-text)] outline-none w-20"
            />
            <datalist id="form-tag-suggestions">
              {data.tags.filter(t => !tags.includes(t)).map(t => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
        </div>
      )}
    </form>
  );
}
