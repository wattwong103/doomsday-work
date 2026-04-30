import { HashRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './hooks/useStore';
import { useTheme } from './hooks/useTheme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Weekly from './pages/Weekly';
import Journal from './pages/Journal';
import Projects from './pages/Projects';
import Recurring from './pages/Recurring';
import Settings from './pages/Settings';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

export default function App() {
  return (
    <StoreProvider>
      <ThemeWrapper>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/weekly" element={<Weekly />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/recurring" element={<Recurring />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </HashRouter>
      </ThemeWrapper>
    </StoreProvider>
  );
}
