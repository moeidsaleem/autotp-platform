import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';

interface SnackbarProps {
  message: string;
  duration?: number;
  type?: 'success' | 'warning' | 'error' | 'info';
}

export const Snackbar: React.FC<SnackbarProps> = ({ 
  message, 
  duration = 4000,
  type = 'success'
}) => {
  const [visible, setVisible] = useState(false);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      setExit(false);
      const timer = setTimeout(() => {
        setExit(true);
        setTimeout(() => setVisible(false), 300);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!message || !visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Check className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <div 
      className={`fixed md:bottom-8 bottom-20 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-black/60 border border-white/10 px-5 py-3 rounded-xl text-neutral-50 shadow-2xl z-50 flex items-center gap-3 max-w-md ${
        !exit 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4 pointer-events-none'
      } transition-all duration-300 ease-out`}
    >
      {getIcon()}
      <span className="text-sm font-medium">{message}</span>
      <button 
        onClick={() => setExit(true)} 
        className="ml-auto opacity-70 hover:opacity-100 transition-opacity p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
