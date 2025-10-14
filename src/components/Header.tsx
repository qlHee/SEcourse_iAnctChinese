import React, { useState, useRef, useEffect } from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const Header: React.FC = () => {
  const [langOpen, setLangOpen] = useState(false); // 下拉是否展开
  const [language, setLanguage] = useState('简体中文'); // 当前语言
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 点击页面其他地方关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setLangOpen(false);
    // TODO: 可以在这里触发实际的语言切换逻辑
  };

  return (
    <header className="header">
      <div className="header-title">My Project</div>
      <div className="header-nav">
        {/* Editor actions if editing */}
        <EditorButtons />
        {/* 语言按钮 */}
        <div className="lang-wrapper" ref={wrapperRef}>
          <button
            className="header-button"
            onClick={() => setLangOpen(!langOpen)}
          >
            {language}
          </button>
          {langOpen && (
            <div className="lang-dropdown">
              {['English', '한국인', '简体中文', '繁体中文'].map((lang) => (
                <div
                  key={lang}
                  className="lang-item"
                  onClick={() => handleLanguageChange(lang)}
                >
                  {lang}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="header-button">个人信息</button>
        <button className="header-button logout-button">登出</button>
      </div>
    </header>
  );
};

export default Header;

const EditorButtons: React.FC = () => {
  const navigate = useNavigate();
  const { editingDocId, editingContent, editingAuthor, setEditingDocId, updateDocument, documents, projects } = useAppData();
  if (!editingDocId) return null;
  const doc = documents.find(d => d.id === editingDocId);
  if (!doc) return null;

  return (
    <>
      <button className="header-button" onClick={() => {
        updateDocument(doc.id, { content: editingContent, author: editingAuthor });
        setEditingDocId(null);
      }}><FiSave /> 保存文档</button>
      <button className="header-button" onClick={() => {
        setEditingDocId(null);
        const proj = projects.find(p => p.id === doc.projectId);
        navigate(`/projects/${doc.projectId}/documents`, { state: { projectName: proj?.name ?? '' } });
      }}><FiArrowLeft /> 返回项目</button>
    </>
  );
};
