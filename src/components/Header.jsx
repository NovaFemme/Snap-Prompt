import React from "react";
import { Heart, LogOut, X } from "lucide-react";

const Header = ({
  user,
  activeTab,
  formData,
  songFormData,
  history,
  onMinimize,
  onToggleFavourite,
  onLogout,
}) => {
  return (
    <div className="drag-handle h-14 bg-[#1a1a1a] flex items-center justify-between px-4 border-b border-[#333]">
      <div className="flex items-center gap-3">
        <div
          className="relative group no-drag cursor-pointer"
          onClick={onMinimize}
          title="Click to Switch to Floating Mode"
        >
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-60 transition duration-300"></div>
          <img
            src={user.picture}
            alt="User"
            className="relative w-10 h-10 rounded-full border-2 border-[#333] group-hover:border-white transition-all transform group-hover:scale-105 object-cover"
          />
        </div>

        <div className="flex flex-col">
          <div className="font-bold text-sm tracking-wide text-gray-200 flex items-center gap-2">
            {activeTab === "history"
              ? "Prompt Library"
              : activeTab === "song-editor"
                ? songFormData.id
                  ? "Edit Song"
                  : "New Song"
                : formData.id
                  ? "Edit Prompt"
                  : "New Prompt"}
          </div>
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
            {activeTab === "history"
              ? `${history.length} Saved`
              : activeTab === "song-editor"
                ? "Song Editor"
                : "Editor"}
          </div>
        </div>
      </div>

      <div className="flex gap-2 no-drag">
        {/* Heart Button */}
        {(activeTab === "editor" || activeTab === "song-editor") && (
          <button
            onClick={onToggleFavourite}
            className={`p-2 rounded-lg transition flex items-center justify-center ${
              (
                activeTab === "song-editor"
                  ? songFormData.favourite
                  : formData.favourite
              )
                ? "text-red-500 hover:bg-red-900/20"
                : "text-gray-400 hover:bg-[#333] hover:text-gray-200"
            }`}
            title="Toggle Favourite"
          >
            <Heart
              size={18}
              fill={
                (
                  activeTab === "song-editor"
                    ? songFormData.favourite
                    : formData.favourite
                )
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        )}

        <button
          onClick={onLogout}
          className="p-2 hover:bg-[#333] rounded-lg text-gray-400 transition"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>

        <button
          onClick={() => window.electron.quitApp()}
          className="p-2 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-gray-400 transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Header;
