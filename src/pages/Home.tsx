// src/pages/Home.tsx
import React from 'react';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import './Home.css';
import DocumentEditor from '../components/DocumentEditor';
import { useAppData } from '../context/AppDataContext';

const Home: React.FC = () => {
  const { editingDocId } = useAppData();
  return (
    <div className="home-container">
      <Header />
      <main className="home-main">
        {editingDocId ? <DocumentEditor /> : <Outlet />}
      </main>
    </div>
  );
};

export default Home;
