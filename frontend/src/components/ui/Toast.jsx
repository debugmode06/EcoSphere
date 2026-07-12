import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-[100] p-4 rounded-xl shadow-lg flex items-center gap-3 border ${
      type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
      'bg-red-50 text-red-700 border-red-200'
    }`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
