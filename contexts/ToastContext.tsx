import { CustomToast, ToastType } from '@/components/ui/CustomToast';
import React, { createContext, useContext, useState } from 'react';

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    message: string;
    duration: number;
  }>({
    visible: false,
    type: 'info',
    message: '',
    duration: 2000,
  });

  const showToast = (type: ToastType, message: string, duration: number = 2000) => {
    setToast({
      visible: true,
      type,
      message,
      duration,
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <CustomToast
        type={toast.type}
        message={toast.message}
        visible={toast.visible}
        onHide={hideToast}
        duration={toast.duration}
      />
    </ToastContext.Provider>
  );
};
