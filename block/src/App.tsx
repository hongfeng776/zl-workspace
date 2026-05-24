import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Lobby } from '@/pages/Lobby';
import { Room } from '@/pages/Room';
import { Game } from '@/pages/Game';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/game/:roomId" element={<Game />} />
      </Routes>
    </Router>
  );
}
