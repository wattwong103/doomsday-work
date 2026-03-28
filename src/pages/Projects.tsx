import { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { randomColor } from '../lib/utils';

export default function Projects() {
  const { data, addProject, deleteProject } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(randomColor());

  const selected = data.projects.find(p => p.id === selectedId);

  const projectTasks = useMemo(
    () => (selectedId ? data.tasks.filter(t => t.projectId === selectedId) : []),
    [data.tasks, selectedId]
  );

  const handleCreate = () => {
    if (!name.trim()) return;
    addProject(name.trim(), description.trim(), color);
    setName('');
    setDescription('');
    setColor(randomColor());
    setShowForm(false);
  };

  const taskStats = (projectId: string) => {
    const tasks = data.tasks.filter(t => t.projectId === projectId);
    const done = tasks.filter(t => t.status === 'done').length;
    return { total: tasks.length, done, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
  };

  // Detail view
  if (selected) {
    const stats = taskStats(selected.id);
    const todo = projectTasks.filter(t => t.status !== 'done');
    const done = projectTasks.filter(t => t.status === 'done');

    return (
      <div className="space-y-6 fade-in">
        <button
          onClick={() => setSelectedId(null)}
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          ← All Projects
        </button>

        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selected.color }} />
          <h1 className="text-2xl font-bold">{selected.name}</h1>
        </div>

        {selected.description && (
          <p className="text-sm text-[var(--color-text-secondary)]">{selected.description}</p>
        )}

        <div className="flex gap-4 text-sm">
          <span><strong>{stats.total}</strong> tasks</span>
          <span className="text-[var(--color-success)]"><strong>{stats.done}</strong> done</span>
          <span className="text-[var(--color-primary)]"><strong>{stats.pct}%</strong> complete</span>
        </div>

        <TaskForm projectId={selected.id} />

        {todo.length > 0 && (
          <div className="space-y-2">
            {todo.map(t => <TaskCard key={t.id} task={t} projects={data.projects} showDate />)}
          </div>
        )}
        {done.length > 0 && (
          <details className="mt-4">
            <summary className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] cursor-pointer mb-2">
              Completed ({done.length})
            </summary>
            <div className="space-y-2">
              {done.map(t => <TaskCard key={t.id} task={t} projects={data.projects} showDate />)}
            </div>
          </details>
        )}
      </div>
    );
  }

  // Project list
  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium"
        >
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showForm && (
        <div className="fade-in rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Project name"
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            autoFocus
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-[var(--color-text-secondary)]">Color</label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer" />
          </div>
          <button onClick={handleCreate} className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium">
            Create Project
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {data.projects.map(project => {
          const stats = taskStats(project.id);
          return (
            <button
              key={project.id}
              onClick={() => setSelectedId(project.id)}
              className="text-left rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                <h3 className="font-semibold text-sm">{project.name}</h3>
              </div>
              {project.description && (
                <p className="text-xs text-[var(--color-text-secondary)] mb-3 line-clamp-2">{project.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-secondary)]">{stats.total} tasks</span>
                {stats.total > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[var(--color-border)] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-[var(--color-success)] transition-all"
                        style={{ width: `${stats.pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{stats.pct}%</span>
                  </div>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteProject(project.id); }}
                className="mt-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Delete
              </button>
            </button>
          );
        })}
      </div>

      {data.projects.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📁</p>
          <p className="text-[var(--color-text-secondary)]">No projects yet</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Create one to organize your tasks</p>
        </div>
      )}
    </div>
  );
}
