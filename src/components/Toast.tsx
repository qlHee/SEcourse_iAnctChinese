import React, { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  visible: boolean;
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, visible, duration = 3000, onClose }) => {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  return (
    <div className={`toast-root ${visible ? 'show' : ''}`} role="status" aria-live="polite">
      <div className="toast-message">{message}</div>
    </div>
  );
};

export default Toast;
