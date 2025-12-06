import React from 'react';

function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-xs">
      <div
        className={`px-4 py-2 rounded-lg shadow-lg text-sm break-words ${
          toast.type === 'success'
            ? 'bg-emerald-500 text-slate-900'
            : 'bg-red-500 text-slate-900'
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
}

export default Toast;
