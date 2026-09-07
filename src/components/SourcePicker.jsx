import React, { useState } from "react";
import { Loader2, Check } from "lucide-react";

const SourcePicker = ({
  checkedDriveIds,
  driveFiles,
  isDriveLoading,
  onToggleDriveFile,
  onDefault,
  onRefresh,
}) => {
  const [sourceOpen, setSourceOpen] = useState(false);

  return (
    <div className="relative px-2 py-1.5 bg-[#1e1e1e] border-b border-[#2a2a2a]">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-gray-600 flex-shrink-0">
          Source:
        </span>
        <button
          onClick={() => setSourceOpen((o) => !o)}
          className="flex-1 flex items-center justify-between bg-[#111] border border-[#333] text-gray-300 text-xs rounded px-1.5 py-1 hover:border-blue-500 transition min-w-0"
        >
          <span className="truncate">
            {checkedDriveIds.size === 0
              ? "Default"
              : `${checkedDriveIds.size} source${checkedDriveIds.size > 1 ? "s" : ""} active`}
          </span>
          <span className="ml-1 text-[10px] flex-shrink-0">
            {sourceOpen ? "▲" : "▼"}
          </span>
        </button>
        <button
          onClick={onRefresh}
          title="Refresh"
          className="flex-shrink-0 p-1 text-gray-600 hover:text-gray-300 hover:bg-[#333] rounded transition"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
        {isDriveLoading && (
          <Loader2
            size={12}
            className="animate-spin text-gray-500 flex-shrink-0"
          />
        )}
      </div>

      {sourceOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSourceOpen(false)}
          />
          <div className="absolute left-2 right-2 top-full mt-0.5 z-50 bg-[#1a1a1a] border border-[#333] rounded shadow-xl overflow-hidden">
            <button
              onClick={() => {
                onDefault();
                setSourceOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#222] transition"
            >
              <span
                className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${checkedDriveIds.size === 0 ? "bg-blue-600 border-blue-600" : "border-[#555]"}`}
              >
                {checkedDriveIds.size === 0 && (
                  <Check size={8} className="text-white" />
                )}
              </span>
              <span
                className={
                  checkedDriveIds.size === 0
                    ? "text-gray-200 font-bold"
                    : "text-gray-500"
                }
              >
                Default
              </span>
            </button>

            {driveFiles.length > 0 && (
              <>
                <div className="px-3 py-1 text-[10px] text-gray-600 border-t border-[#2a2a2a]">
                  📁 Snap Prompt
                </div>
                {driveFiles.map((f) => {
                  const checked = checkedDriveIds.has(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        onToggleDriveFile(f.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#222] transition"
                    >
                      <span
                        className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${checked ? "bg-blue-600 border-blue-600" : "border-[#555]"}`}
                      >
                        {checked && (
                          <Check size={8} className="text-white" />
                        )}
                      </span>
                      <span
                        className={`truncate ${checked ? "text-blue-300" : "text-gray-400"}`}
                      >
                        {f.name.replace(/\.json$/i, "")}
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            {driveFiles.length === 0 && (
              <p className="px-3 py-2 text-[10px] text-gray-600 border-t border-[#2a2a2a]">
                No files found in Snap Prompt folder
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SourcePicker;
