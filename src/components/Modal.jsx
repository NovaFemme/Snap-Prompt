import React from "react";

const Modal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  isDestructive = false,
}) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-full max-w-xs overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 text-center">
          <h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3>
          <p className="text-sm text-gray-400 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2 bg-[#333] hover:bg-[#444] text-gray-200 rounded-lg text-sm font-bold transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2 rounded-lg text-sm font-bold text-white transition ${isDestructive ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
