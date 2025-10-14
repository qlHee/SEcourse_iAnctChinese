import React, { useEffect, useState } from 'react';
import './DocumentEditor.css';
import { useAppData } from '../context/AppDataContext';
import LeftPanel from './LeftPanel';
import {
  FiSearch, FiCopy, FiScissors, FiClipboard, FiCheckSquare, FiTrash2, FiZap, FiHash,
  FiTag, FiLayers, FiUser, FiLink, FiDatabase, FiBookOpen
} from 'react-icons/fi';

const DocumentEditor: React.FC = () => {
  const {
    documents, projects, editingDocId, editingContent,
    setEditingContent, activeTab, setActiveTab,
    editingAuthor, setEditingAuthor
  } = useAppData();

  useEffect(() => {
    if (!activeTab) setActiveTab('结构标注');
  }, [activeTab, setActiveTab]);

  if (!editingDocId) return null;

  const doc = documents.find(d => d.id === editingDocId);
  if (!doc) return null;

  const [resolvedProject, setResolvedProject] = useState<any | null>(null);
  const project = projects.find(p => p.id === doc.projectId) || resolvedProject;

  useEffect(() => {
    if (!project) {
      try {
        const raw = localStorage.getItem('appdata_projects_v1');
        if (raw) {
          const parsed = JSON.parse(raw) as any[];
          const found = parsed.find(p => String(p.id) === String(doc.projectId));
          if (found) setResolvedProject(found);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [doc.projectId, project]);

  const isExportView = activeTab?.trim() === '导出数据';
  const isGraphView = activeTab?.trim() === '知识图谱';

  return (
    <div className="document-editor-container">
      <div className="editor-header">
        <div className="editor-tabs">
          {['结构标注', '实体标注', '关系标注', '知识图谱', '导出数据'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="editor-actions">
          {/* 保存/返回由 Header 提供，全局控制 */}
        </div>
      </div>

      <div className="editor-body">

        <div className={`editor-column ${isExportView ? 'export-col' : 'left-col'}`}>
          {!isExportView && <LeftPanel activeTab={activeTab} />}
        </div>

        {!isExportView && (
          <div className="editor-column center-col">
            {isGraphView ? (
              <div className="center-empty">
                <FiBookOpen size={28} style={{ marginRight: 8 }} />
                知识图谱模块
              </div>
            ) : (
              <>
                <div className="center-header">
                  {activeTab?.trim() === '结构标注' && (
                    <>
                      <button className="icon-btn" title="查找/替换"><FiSearch /></button>
                      <button className="icon-btn" title="复制"><FiCopy /></button>
                      <button className="icon-btn" title="剪切"><FiScissors /></button>
                      <button className="icon-btn" title="粘贴"><FiClipboard /></button>
                      <button className="icon-btn" title="全选"><FiCheckSquare /></button>
                      <button className="icon-btn" title="删除"><FiTrash2 /></button>
                      <button className="icon-btn" title="自动标点"><FiZap /></button>
                      <button className="icon-btn" title="自动分词"><FiHash /></button>
                    </>
                  )}
                  {activeTab?.trim() === '实体标注' && (
                    <>
                      <button className="icon-btn" title="实体类型"><FiTag /></button>
                      <button className="icon-btn" title="实体层级"><FiLayers /></button>
                      <button className="icon-btn" title="实体用户"><FiUser /></button>
                    </>
                  )}
                  {activeTab?.trim() === '关系标注' && (
                    <button className="icon-btn" title="关系操作"><FiLink /></button>
                  )}
                </div>

                <textarea
                  className="editor-textarea"
                  value={editingContent}
                  onChange={e => setEditingContent(e.target.value)}
                />
              </>
            )}
          </div>
        )}

        {isExportView && (
          <div className="editor-column merged-col">
            <div className="center-empty">
              <FiDatabase size={28} style={{ marginRight: 8 }} />
              导出数据模块
            </div>
          </div>
        )}


        <div className="editor-column right-col">
          <h4>文档信息</h4>
          <div className="info-row"><strong>项目ID:</strong> {project?.id}</div>
          <div className="info-row"><strong>项目名称:</strong> {project?.name}</div>
          <div className="info-row"><strong>项目描述:</strong> {project?.description}</div>
          <div className="info-row"><strong>文档ID:</strong> {doc.id}</div>
          <div className="info-row"><strong>文档名称:</strong> {doc.name}</div>
          <div className="info-row"><strong>文档描述:</strong> {doc.description}</div>
          <div className="info-row">
            <strong>作者:</strong>
            <input
              className="author-input"
              value={editingAuthor}
              onChange={e => setEditingAuthor(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
