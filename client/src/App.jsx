import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Splash from './pages/Splash';
import OnboardingInstructions from './pages/OnboardingInstructions';
import Register from './pages/Register';
import Lobby from './pages/Lobby';
import WaitingRoom from './pages/WaitingRoom';
import Game from './pages/Game';
import Results from './pages/Results';
import GameRedirectListener from './components/GameRedirectListener';
import ScreenAwakeHint from './components/ScreenAwakeHint';
import { useWakeLock } from './hooks/useWakeLock';
import { isLoggedIn } from './lib/auth';

function RequireAuth({ children }) {
  if (!isLoggedIn()) return <Navigate to="/instructions" replace />;
  return children;
}

export default function App() {
  useWakeLock(true);

  return (
    <BrowserRouter>
      <GameRedirectListener />
      <ScreenAwakeHint />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/instructions" element={<OnboardingInstructions />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/lobby"
          element={
            <RequireAuth>
              <Lobby />
            </RequireAuth>
          }
        />
        <Route
          path="/room/:code"
          element={
            <RequireAuth>
              <WaitingRoom />
            </RequireAuth>
          }
        />
        <Route
          path="/game/:roomCode"
          element={
            <RequireAuth>
              <Game />
            </RequireAuth>
          }
        />
        <Route
          path="/results/:roomCode"
          element={
            <RequireAuth>
              <Results />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
