import React, { useState } from 'react';
import { Monitor, ChevronDown, Upload } from 'lucide-react';

interface HeaderProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onFileUpload: (file: File) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedMethod, onMethodChange, onFileUpload }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const methods = [
    { id: 'low-light', name: 'LOW LIGHT', isActive: true, subMethods: [
      { id: 'clahe', name: 'CLAHE', description: 'Contrast Limited Adaptive Histogram Equalization' },
      { id: 'unet', name: 'UNet', description: 'Deep learning enhancement' }
    ]},
    { id: 'glare', name: 'GLARE', isActive: false },
    { id: 'deraining', name: 'DERAINING', isActive: false },
    { id: 'tilt', name: 'TILT', isActive: false },
    { id: 'dehazing', name: 'DEHAZING', isActive: false },
    { id: 'automatic', name: 'AUTOMATIC', isActive: false }
  ];

  const handleMethodClick = (method: any) => {
    if (method.subMethods && method.subMethods.length > 0) {
      setOpenDropdown(openDropdown === method.id ? null : method.id);
    } else {
      onMethodChange(method.id);
      setOpenDropdown(null);
    }
  };

  const handleSubMethodSelect = (methodId: string, subMethodId: string) => {
    onMethodChange(subMethodId);
    setOpenDropdown(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-6 border-2 border-teal-500 rounded-sm flex items-center justify-center">
              <Monitor className="w-4 h-4 text-teal-500" />
            </div>
            <h1 className="text-lg font-bold text-white">Computer Vision SW3</h1>
          </div>
          <p className="text-slate-400 text-sm ml-4">Video Enhancement Processing System</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {methods.map((method) => (
            <div key={method.id} className="relative">
              <button
                onClick={() => handleMethodClick(method)}
                className={`px-3 py-2 rounded text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                  method.isActive || selectedMethod === method.id || (method.subMethods && method.subMethods.some((sub: any) => sub.id === selectedMethod))
                    ? 'bg-teal-600 text-white'
                    : method.isActive === false 
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                disabled={method.isActive === false}
              >
                <span>{method.name}</span>
                {method.subMethods && method.subMethods.length > 0 && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    openDropdown === method.id ? 'rotate-180' : ''
                  }`} />
                )}
              </button>
              
              {/* Dropdown for sub-methods */}
              {method.subMethods && method.subMethods.length > 0 && openDropdown === method.id && (
                <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50 min-w-full">
                  {method.subMethods.map((subMethod) => (
                    <button
                      key={subMethod.id}
                      onClick={() => handleSubMethodSelect(method.id, subMethod.id)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors first:rounded-t-md last:rounded-b-md ${
                        selectedMethod === subMethod.id
                          ? 'bg-teal-600/20 text-teal-300'
                          : 'text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{subMethod.name}</div>
                        <div className="text-xs text-slate-400">{subMethod.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors ml-4"
          >
            <Upload className="w-4 h-4" />
            Upload Video
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </header>
  );
};

export default Header;