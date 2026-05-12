'use client';

import { useEffect, useState } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

export default function Toast({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  const icon = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <X className="w-5 h-5" />,
  }[type];

  return (
    <div
      className={`fixed bottom-4 left-4 flex items-center gap-3 px-4 py-3 rounded-lg text-white ${bgColor} shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 z-50`}
    >
      {icon}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
