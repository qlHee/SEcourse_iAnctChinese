
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiFolder, FiInfo, FiCopy, FiTrash2, FiPlus, FiUpload, FiBarChart, FiArrowLeft } from 'react-icons/fi';
import './DocumentList.css';
import ModalForm from '../components/ModalForm';
import ImportDocumentModal from '../components/ImportDocumentModal';
import Toast from '../components/Toast';
import { useAppData } from '../context/AppDataContext';

interface Document {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

const DocumentList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 从跳转时带过来的 state 中获取项目名
  const state = location.state as { projectName?: string };
  const projectId = id ?? undefined;
  const projectName = state?.projectName || (projectId ? `项目 ${projectId}` : '项目');

  const { documents, addDocument, updateDocument, deleteDocument, importDocuments, setEditingDocId, setEditingContent, setActiveTab, setEditingAuthor } = useAppData();

  // 弹窗控制
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [copySourceDoc, setCopySourceDoc] = useState<Document | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // 编辑器 state moved to global context

  // 删除文档
  const handleDeleteDocument = (docId: string) => {
    if (window.confirm('确定删除该文档吗？')) {
      deleteDocument(docId);
    }
  };

  // 新建文档
  const handleAddDocument = (data: Record<string, any>) => {
    addDocument({ projectId: projectId ?? (documents[0]?.projectId ?? ''), name: data.name, description: data.description });
  };

  // 更新文档详情
  const handleUpdateDocument = (data: Record<string, any>) => {
    if (!selectedDoc) return;
    updateDocument(selectedDoc.id, { name: data.name, description: data.description });
  };

  return (
    <div className="document-list-container">
      {/* 顶部标题 + 操作按钮 */}
      <div className="document-list-header">
        <h2 className="document-list-title">{projectName} 的文档列表</h2>
        <div className="document-list-actions">
          <button className="action-btn" onClick={() => setShowNewModal(true)}><FiPlus /> 新建文档</button>
          <button className="action-btn" onClick={() => setShowImportModal(true)}><FiUpload /> 导入文档</button>
          <button className="action-btn"><FiBarChart /> 分析和导出</button>
          <button className="action-btn" onClick={() => navigate(-1)}><FiArrowLeft /> 返回项目列表</button>
        </div>
      </div>

          {/* 文档列表（只显示属于当前 projectId 的文档） */}
          <div className="document-list-content">
            {projectId !== undefined ? (
              (() => {
                const visibleDocs = documents.filter(d => d.projectId === projectId);
                if (visibleDocs.length === 0) {
                  return <div className="empty-state">当前项目暂无文档</div>;
                }
                return visibleDocs.map(doc => (
                  <div key={doc.id} className="document-card">
                    <div className="document-info">
                      <div className="document-title-row">
                        <span className="document-title">{doc.name}</span>
                        <span className="document-detail">{doc.description}</span>
                      </div>
                      <span className="document-meta">{doc.createdAt}</span>
                    </div>
                    <div className="document-actions">
                      <button className="doc-btn" onClick={() => {
                        console.debug('[DocumentList] opening doc', doc.id, 'contentLen=', ((doc as any).content ?? '').length);
                        setEditingDocId(doc.id);
                        setEditingContent((doc as any).content ?? '');
                        setEditingAuthor((doc as any).author ?? '');
                        setActiveTab('结构标注');
                        navigate('/');
                      }}><FiFolder /> 打开文档</button>
                      <button
                        className="doc-btn"
                        onClick={() => {
                          setSelectedDoc(doc);
                          setShowDetailModal(true);
                        }}
                      >
                        <FiInfo /> 文档详情
                      </button>
                      <button
                        className="doc-btn"
                        onClick={() => {
                          setCopySourceDoc(doc);
                          // 默认名称带上“复制”后缀
                          setShowCopyModal(true);
                        }}
                      ><FiCopy /> 复制文档</button>
                      <button
                        className="doc-btn delete-btn"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <FiTrash2 /> 删除文档
                      </button>
                    </div>
                  </div>
                ));
              })()
            ) : (
              <div className="empty-state">未指定项目，无法显示文档</div>
            )}
          </div>

      {/* editor rendered at Home via DocumentEditor component */}

      {/* 新建文档弹窗 */}
      {showNewModal && (
        <ModalForm
          title="新建文档"
          fields={[
            { name: 'name', label: '名称', type: 'text' },
            { name: 'description', label: '描述', type: 'textarea' },
          ]}
          onClose={() => setShowNewModal(false)}
          onSubmit={(data) => {
            handleAddDocument(data);
            setShowNewModal(false);
          }}
        />
      )}

      {/* 复制文档弹窗（复用 ModalForm，仅修改名称，其余保持一致） */}
      {showCopyModal && copySourceDoc && (
        <ModalForm
          title={`复制：${copySourceDoc.name}`}
          fields={[
            { name: 'name', label: '新名称', type: 'text' },
          ]}
          initialData={{ name: `${copySourceDoc.name} - 复制` }}
          onClose={() => {
            setShowCopyModal(false);
            setCopySourceDoc(null);
          }}
          onSubmit={(data) => {
            // 基于源文档创建新文档，名称来自表单，描述等沿用源文档
            addDocument({ projectId: copySourceDoc.projectId ?? (projectId ?? (documents[0]?.projectId ?? '')), name: data.name, description: copySourceDoc.description });
            setShowCopyModal(false);
            setCopySourceDoc(null);
          }}
        />
      )}

      {/* 导入文档弹窗（点击或拖拽上传文件） */}
      {showImportModal && (
        <ImportDocumentModal
          projectName={projectName}
          onClose={() => setShowImportModal(false)}
          onUpload={async (files) => {
            const ids = await importDocuments(files, projectId ?? (documents[0]?.projectId ?? ''));
            console.debug('[DocumentList] import returned ids', ids);
            // show toast
            const count = files.length;
            setToastMessage(`导入 ${count} 个文档成功`);
            setToastVisible(true);
            setShowImportModal(false);
          }}
        />
      )}

      {/* 文档详情弹窗 */}
      {showDetailModal && selectedDoc && (
        <ModalForm
          title="文档详情"
          fields={[
            { name: 'name', label: '名称', type: 'text' },
            { name: 'description', label: '描述', type: 'textarea' },
            { name: 'createdAt', label: '创建时间', type: 'text', readOnly: true },
            { name: 'updatedAt', label: '更新时间', type: 'text', readOnly: true },
          ]}
          initialData={{
            name: selectedDoc.name,
            description: selectedDoc.description,
            createdAt: selectedDoc.createdAt,
            updatedAt: selectedDoc.updatedAt,
          }}
          onClose={() => setShowDetailModal(false)}
          onSubmit={(data) => {
            handleUpdateDocument(data);
            setShowDetailModal(false);
          }}
        />
      )}
      <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
};

export default DocumentList;
