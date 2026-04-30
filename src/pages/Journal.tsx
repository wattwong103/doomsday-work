import { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { todayStr, formatDate } from '../lib/utils';
import { subDays, parseISO } from 'date-fns';

export default function Journal() {
  const { data, saveJournal } = useStore();
  const today = todayStr();
  const [selectedDate, setSelectedDate] = useState(today);

  const entry = data.journalEntries.find(j => j.date === selectedDate);
  const [done, setDone] = useState(entry?.done ?? '');
  const [blockers, setBlockers] = useState(entry?.blockers ?? '');
  const [plan, setPlan] = useState(entry?.plan ?? '');

  const recentDates = useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < 14; i++) {
      const d = subDays(new Date(), i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }, []);

  const handleSelect = (date: string) => {
    setSelectedDate(date);
    const e = data.journalEntries.find(j => j.date === date);
    setDone(e?.done ?? '');
    setBlockers(e?.blockers ?? '');
    setPlan(e?.plan ?? '');
  };

  const handleSave = () => {
    saveJournal(selectedDate, done, blockers, plan);
  };

  const hasEntry = (date: string) => data.journalEntries.some(j => j.date === date);

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold">Daily Journal</h1>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {recentDates.map(date => (
          <button
            key={date}
            onClick={() => handleSelect(date)}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all border ${
              selectedDate === date
                ? 'border-[var(--color-primary)] bg-blue-50 dark:bg-blue-950 text-[var(--color-primary)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <div>{parseISO(date).toLocaleDateString('en', { weekday: 'short' })}</div>
            <div className="text-sm font-bold">{parseISO(date).getDate()}</div>
            {hasEntry(date) && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] mx-auto mt-1" />}
          </button>
        ))}
      </div>

      {/* Journal form */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">{formatDate(selectedDate)}</h2>
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">What I accomplished</label>
          <textarea
            value={done}
            onChange={e => setDone(e.target.value)}
            rows={4}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none"
            placeholder="Completed the auth flow, reviewed PRs, shipped the hotfix..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Blockers / Challenges</label>
          <textarea
            value={blockers}
            onChange={e => setBlockers(e.target.value)}
            rows={3}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none"
            placeholder="Waiting on API docs, CI pipeline is flaky..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">Plan for tomorrow</label>
          <textarea
            value={plan}
            onChange={e => setPlan(e.target.value)}
            rows={3}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none"
            placeholder="Start the dashboard redesign, fix deploy, 1:1 meeting..."
          />
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium"
        >
          Save Entry
        </button>
      </div>

      {/* Recent entries */}
      {data.journalEntries.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3">Recent Entries</h2>
          <div className="space-y-3">
            {data.journalEntries
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 7)
              .map(j => (
                <button
                  key={j.date}
                  onClick={() => handleSelect(j.date)}
                  className="w-full text-left rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:shadow-md transition-all"
                >
                  <p className="text-xs font-semibold text-[var(--color-primary)]">{formatDate(j.date)}</p>
                  {j.done && <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">{j.done}</p>}
                </button>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
