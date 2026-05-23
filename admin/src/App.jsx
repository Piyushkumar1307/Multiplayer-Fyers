import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { isAdminLoggedIn } from './lib/auth';
import { useWakeLock } from './hooks/useWakeLock';

function ProtectedRoute({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  useWakeLock(true);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
