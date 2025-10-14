import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HomeContent from './components/HomeContent';
import DocumentList from './pages/DocumentList';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Home 是 layout，包含 Header + Outlet */}
        <Route path="/" element={<Home />}>
          {/* 默认内容（index）就是 HomeContent */}
          <Route index element={<HomeContent />} />

          {/* 项目文档列表（打开项目时导航到这个） */}
          <Route path="projects/:id/documents" element={<DocumentList />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
