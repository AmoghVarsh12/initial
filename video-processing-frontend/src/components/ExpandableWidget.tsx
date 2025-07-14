import React from 'react';
import { X, ChevronRight } from 'lucide-react';

interface ExpandableWidgetProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  position: 'left' | 'right';
  children: React.ReactNode;
}

const ExpandableWidget: React.FC<ExpandableWidgetProps> = ({
  title,
  isOpen,
  onClose,
  position,
  children,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fixed top-20 ${position === 'left' ? 'left-6' : 'right-6'} w-80 h-96 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-40`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto h-80">
        {children}
      </div>
    </div>
  );
};

export default ExpandableWidget;