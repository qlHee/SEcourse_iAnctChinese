import React, { useState } from 'react';
import type { DragEvent } from 'react';
import './ImportDocumentModal.css';

interface ImportDocumentModalProps {
  projectName: string;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

const ImportDocumentModal: React.FC<ImportDocumentModalProps> = ({ projectName, onClose, onUpload }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = (files: FileList) => {
    const arr = Array.from(files);
    setSelectedFiles(arr);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      alert('请先选择文件');
      return;
    }
    onUpload(selectedFiles);
    setSelectedFiles([]);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>导入文档 - {projectName}</h2>

        <div
          className={`upload-area ${dragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <p>点击选择文件或拖动文件到这里</p>
          <input
            id="fileInput"
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="file-list">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="file-item">{file.name}</div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={handleSubmit}>上传</button>
          <button onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  );
};

export default ImportDocumentModal;
