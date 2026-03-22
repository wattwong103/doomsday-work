import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Today', icon: '◉' },
  { to: '/weekly', label: 'Weekly', icon: '▦' },
  { to: '/projects', label: 'Projects', icon: '◫' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-blue-500/20'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </NavLink>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-56 p-4 gap-2 border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="px-4 py-3 mb-4">
          <h1 className="text-lg font-bold tracking-tight">Doomsday Work</h1>
          <p className="text-xs text-[var(--color-text-secondary)]">Track everything</p>
        </div>
        {navItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 bg-[var(--color-surface)] border-t border-[var(--color-border)] z-50">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
