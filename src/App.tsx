import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './hooks/useStore';
import { useTheme } from './hooks/useTheme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Weekly from './pages/Weekly';
import Projects from './pages/Projects';
import Settings from './pages/Settings';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

export default function App() {
  return (
    <StoreProvider>
      <ThemeWrapper>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/weekly" element={<Weekly />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeWrapper>
    </StoreProvider>
  );
}
