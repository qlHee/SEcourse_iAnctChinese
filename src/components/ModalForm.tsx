import React from 'react';
import './ModalForm.css';

export interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea';
  readOnly?: boolean;
}

export interface ModalFormProps {
  title: string;
  fields: Field[];
  initialData?: Record<string, any>;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
}

const ModalForm: React.FC<ModalFormProps> = ({
  title,
  fields,
  initialData = {},
  onClose,
  onSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    onSubmit(data);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">{title}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          {fields.map((field) => (
            <div key={field.name} className="modal-form-group">
              <label>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  defaultValue={initialData?.[field.name] || ''}
                  readOnly={field.readOnly}
                  className={field.readOnly ? 'readonly' : ''}
                />
              ) : (
                <input
                  type="text"
                  name={field.name}
                  defaultValue={initialData?.[field.name] || ''}
                  readOnly={field.readOnly}
                  className={field.readOnly ? 'readonly' : ''}
                />
              )}
            </div>
          ))}
          <div className="modal-actions">
            <button type="submit" className="submit-btn">
              确定
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
