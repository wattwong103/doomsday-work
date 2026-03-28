import { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { getWeekStart, getWeekDays, getWeekLabel, formatDayShort, isDayToday } from '../lib/utils';
import { addWeeks, subWeeks, parseISO } from 'date-fns';
import ProgressRing from '../components/ProgressRing';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

export default function Weekly() {
  const { data, addWeeklyGoal, toggleWeeklyGoal, deleteWeeklyGoal } = useStore();
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [goalInput, setGoalInput] = useState('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const days = getWeekDays(weekStart);
  const weekGoals = data.weeklyGoals.filter(g => g.weekStart === weekStart);

  const weekTasks = useMemo(
    () => data.tasks.filter(t => days.includes(t.date)),
    [data.tasks, days]
  );

  const weekDone = weekTasks.filter(t => t.status === 'done').length;
  const weekProgress = weekTasks.length ? Math.round((weekDone / weekTasks.length) * 100) : 0;

  const prevWeek = () => setWeekStart(getWeekStart(subWeeks(parseISO(weekStart), 1)));
  const nextWeek = () => setWeekStart(getWeekStart(addWeeks(parseISO(weekStart), 1)));

  const handleAddGoal = () => {
    if (!goalInput.trim()) return;
    addWeeklyGoal(weekStart, goalInput.trim());
    setGoalInput('');
  };

  const dayTasks = selectedDay ? data.tasks.filter(t => t.date === selectedDay) : [];

  return (
    <div className="space-y-6 fade-in">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-lg">←</button>
        <h1 className="text-lg font-bold">{getWeekLabel(weekStart)}</h1>
        <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-lg">→</button>
      </div>

      {/* Week overview */}
      <div className="flex items-center gap-6 justify-center">
        <ProgressRing progress={weekProgress} label="Week progress" />
        <div className="text-sm space-y-1">
          <p><span className="font-bold">{weekTasks.length}</span> tasks</p>
          <p className="text-[var(--color-success)]"><span className="font-bold">{weekDone}</span> done</p>
          <p className="text-[var(--color-text-secondary)]"><span className="font-bold">{weekGoals.length}</span> goals</p>
        </div>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(day => {
          const dayCount = data.tasks.filter(t => t.date === day).length;
          const dayDone = data.tasks.filter(t => t.date === day && t.status === 'done').length;
          const isSelected = selectedDay === day;
          const isToday = isDayToday(day);

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`rounded-xl p-2 text-center transition-all border ${
                isSelected
                  ? 'border-[var(--color-primary)] bg-blue-50 dark:bg-blue-950'
                  : isToday
                    ? 'border-[var(--color-primary)] bg-[var(--color-surface)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <p className={`text-xs font-medium ${isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                {formatDayShort(day)}
              </p>
              <p className="text-lg font-bold">{dayCount}</p>
              {dayCount > 0 && (
                <div className="w-full bg-[var(--color-border)] rounded-full h-1 mt-1">
                  <div
                    className="h-1 rounded-full bg-[var(--color-success)] transition-all"
                    style={{ width: `${(dayDone / dayCount) * 100}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day tasks */}
      {selectedDay && (
        <section className="fade-in">
          <h2 className="text-sm font-semibold mb-2">{formatDayShort(selectedDay)} Tasks</h2>
          <TaskForm date={selectedDay} />
          <div className="space-y-2 mt-3">
            {dayTasks.map(t => (
              <TaskCard key={t.id} task={t} projects={data.projects} />
            ))}
            {dayTasks.length === 0 && (
              <p className="text-sm text-[var(--color-text-secondary)] text-center py-4">No tasks for this day</p>
            )}
          </div>
        </section>
      )}

      {/* Weekly goals */}
      <section>
        <h2 className="text-sm font-semibold mb-3">Weekly Goals</h2>
        <div className="flex gap-2 mb-3">
          <input
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
            placeholder="Add a goal for this week..."
            className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-secondary)]"
          />
          <button onClick={handleAddGoal} className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium">Add</button>
        </div>
        <div className="space-y-2">
          {weekGoals.map(g => (
            <div key={g.id} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 group">
              <button
                onClick={() => toggleWeeklyGoal(g.id)}
                className={`h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${
                  g.completed
                    ? 'border-[var(--color-success)] bg-[var(--color-success)] text-white'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                }`}
              >
                {g.completed && <span className="text-xs">✓</span>}
              </button>
              <span className={`flex-1 text-sm ${g.completed ? 'line-through text-[var(--color-text-secondary)]' : ''}`}>
                {g.goal}
              </span>
              <button
                onClick={() => deleteWeeklyGoal(g.id)}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
          {weekGoals.length === 0 && (
            <p className="text-sm text-[var(--color-text-secondary)] text-center py-4">No goals set for this week</p>
          )}
        </div>
      </section>
    </div>
  );
}
