import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useGame } from './context/GameContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Arena from './pages/Arena';
import Challenge from './pages/Challenge';
import Leaderboard from './pages/Leaderboard';
import Passport from './pages/Passport';
import Business from './pages/Business';
import College from './pages/College';
import Recruiter from './pages/Recruiter';

function Protected({ children }) {
  const { state } = useGame();
  return state.loggedIn ? children : <Navigate to="/" replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/business" element={<Business />} />
        <Route element={<Protected><Layout /></Protected>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/arena/:missionId" element={<Challenge />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/passport" element={<Passport />} />
          <Route path="/college" element={<College />} />
          <Route path="/recruiter" element={<Recruiter />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
