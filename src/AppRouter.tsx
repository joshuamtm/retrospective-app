import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BoardManager from './components/BoardManager';
import Board from './components/Board';
import App from './App';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BoardManager />} />
        <Route path="/board/:boardId" element={<Board />} />
        <Route path="/local" element={<App />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;