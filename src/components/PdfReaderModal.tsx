import React from 'react';
import { X, Download, ExternalLink, BookOpen } from 'lucide-react';

interface PdfReaderModalProps {
  url: string | null;
  title: string;
  onClose: () => void;
}

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({ url, title, onClose }) => {
  if (!url) return null;

  // If google drive preview URL, normalize to preview format
  let viewUrl = url;
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      viewUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-2 md:p-6 flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-5xl h-[92vh] bg-slate-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-800">
        {/* Reader Top Bar */}
        <div className="px-6 py-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2.5 truncate max-w-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="font-black text-sm text-emerald-300 truncate">{title}</h3>
              <p className="text-[10px] text-slate-400">eBookBazar Secure PDF Reader</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ডাউনলোড PDF</span>
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              title="নতুন ট্যাবে খুলুন"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition font-black ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 bg-slate-950 relative">
          <iframe
            src={viewUrl}
            title={title}
            className="w-full h-full border-0"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  );
};
