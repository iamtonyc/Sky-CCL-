
import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  error?: string | null;
  onClearError: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, error, onClearError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcess(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcess(files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      alert("Please upload a valid .xlsx file.");
      return;
    }
    onFileSelect(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 md:p-8 transition-all duration-200 text-center
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".xlsx"
          className="hidden"
          aria-label="Upload Excel File"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Upload size={24} />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800">
              Upload CCL data
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag and drop .xlsx file or click to browse
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-1 px-5 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Select File
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
          <FileSpreadsheet size={12} />
          <span>Excel .xlsx required</span>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Invalid Upload</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button 
            onClick={onClearError}
            className="text-red-400 hover:text-red-600 transition-colors"
            aria-label="Clear error"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
