import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ArrowRight, Sparkles } from 'lucide-react';

export default function ResumeUpload({ onAnalyze, isLoading }) {
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'text'
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    setError(null);
    if (!file) return;

    const validExtensions = ['.pdf', '.docx', '.doc'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setError(`Invalid file format '${ext}'. Please upload a PDF or DOCX resume.`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'file') {
      if (!selectedFile) {
        setError('Please select a PDF or DOCX file to analyze.');
        return;
      }
      onAnalyze({ file: selectedFile });
    } else {
      if (!rawText.trim() || rawText.trim().length < 50) {
        setError('Please enter at least 50 characters of resume text to extract skills.');
        return;
      }
      onAnalyze({ rawText });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'file'
              ? 'bg-indigo-50 text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Document (PDF/DOCX)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'text'
              ? 'bg-indigo-50 text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Plain Text
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'file' ? (
        <div>
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">
                Click to upload or drag & drop resume
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Supports PDF and DOCX documents up to 10MB. Text is parsed securely and not permanently retained.
              </p>
            </div>
          ) : (
            <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedFile.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for AI skill extraction
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your resume content, experience, education, and technical skills here..."
            className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono transition"
          />
          <p className="text-xs text-slate-500 mt-1">
            Character count: {rawText.length} (minimum 50 recommended)
          </p>
        </div>
      )}

      {/* Action CTA */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || (activeTab === 'file' ? !selectedFile : !rawText.trim())}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-md transition cursor-pointer ${
            isLoading || (activeTab === 'file' ? !selectedFile : !rawText.trim())
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-indigo-200'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Skills with NLP...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Analyze Resume with AI</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
