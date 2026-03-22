import { useRef, useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useTheme } from '../hooks/useTheme';

export default function Settings() {
  const { data, exportData, importData, updateSettings, triggerSync, syncing } = useStore();
  const { theme, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');
  const [dropboxToken, setDropboxToken] = useState(data.settings.dropboxToken ?? '');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const success = importData(reader.result as string);
      setImportStatus(success ? 'Data imported successfully!' : 'Invalid file format');
      setTimeout(() => setImportStatus(''), 3000);
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    localStorage.removeItem('doomsday-work-data');
    window.location.reload();
  };

  const handleSaveDropbox = () => {
    updateSettings({ dropboxToken: dropboxToken.trim() || null });
  };

  return (
    <div className="space-y-8 fade-in">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Theme */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Appearance</h2>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                theme === t
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {t === 'light' ? '☀️ Light' : t === 'dark' ? '🌙 Dark' : '💻 System'}
            </button>
          ))}
        </div>
      </section>

      {/* Dropbox Sync */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Dropbox Sync</h2>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Enter your Dropbox access token to enable automatic sync.
          Create an app at dropbox.com/developers and generate a token.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={dropboxToken}
            onChange={e => setDropboxToken(e.target.value)}
            placeholder="Dropbox access token"
            className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
          <button
            onClick={handleSaveDropbox}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium"
          >
            Save
          </button>
        </div>
        {data.settings.dropboxToken && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-success)]">Connected</span>
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        )}
      </section>

      {/* Export / Import */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Data</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportData}
            className="px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            Import JSON
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
        {importStatus && (
          <p className={`text-xs ${importStatus.includes('success') ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
            {importStatus}
          </p>
        )}
      </section>

      {/* Danger Zone */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-danger)]">Danger Zone</h2>
        {showClearConfirm ? (
          <div className="flex items-center gap-3">
            <p className="text-sm">Are you sure? This cannot be undone.</p>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-xl bg-[var(--color-danger)] text-white text-sm font-medium"
            >
              Yes, Clear All
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 rounded-xl border border-[var(--color-danger)] text-[var(--color-danger)] text-sm hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            Clear All Data
          </button>
        )}
      </section>

      {/* Stats */}
      <section className="text-xs text-[var(--color-text-secondary)] space-y-1">
        <p>{data.tasks.length} tasks, {data.projects.length} projects, {data.weeklyGoals.length} goals</p>
        <p>Last saved: {new Date(data.exportedAt).toLocaleString()}</p>
      </section>
    </div>
  );
}
