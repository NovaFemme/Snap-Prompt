import React from "react";
import { Plus, Calendar, Trash2, Music, MessageSquare } from "lucide-react";
import SourcePicker from "./SourcePicker";
import ConfigEditor from "./ConfigEditor";
import ApiPanel from "./ApiPanel";

const PromptList = ({
  user,
  history,
  groupedPrompts,
  libraryMode,
  groupBy,
  configs,
  driveFiles,
  driveKeyMap,
  checkedDriveIds,
  isDriveLoading,
  onSetLibraryMode,
  onSetGroupBy,
  onAddNew,
  onEdit,
  onDelete,
  onPreviewImage,
  onToggleDriveFile,
  onDefaultDriveSource,
  onRefreshDriveFiles,
  onConfigSaved,
}) => {
  return (
    <div className="h-full flex flex-col">
      {user && (
        <SourcePicker
          checkedDriveIds={checkedDriveIds}
          driveFiles={driveFiles}
          isDriveLoading={isDriveLoading}
          onToggleDriveFile={onToggleDriveFile}
          onDefault={onDefaultDriveSource}
          onRefresh={onRefreshDriveFiles}
        />
      )}
      <div className="flex items-center gap-1.5 px-2 py-2 bg-[#252525] border-b border-[#333]">
        <select
          value={libraryMode}
          onChange={(e) => {
            onSetLibraryMode(e.target.value);
            onSetGroupBy("none");
          }}
          className="bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs rounded px-1.5 py-1 outline-none focus:border-purple-500 min-w-0 flex-shrink-0"
          style={{ maxWidth: "110px" }}
        >
          <option value="image">🖼 Images</option>
          <option value="song">🎵 Songs</option>
        </select>
        <select
          value={groupBy}
          onChange={(e) => onSetGroupBy(e.target.value)}
          className="bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs rounded px-1.5 py-1 outline-none focus:border-blue-500 min-w-0 flex-1"
        >
          <option value="none">Group: None</option>
          {libraryMode === "song" ? (
            <>
              <option value="genre">Genre</option>
              <option value="keyscale">Key / Scale</option>
              <option value="diffusionModel">Model</option>
              <option value="favourite">Favourite</option>
            </>
          ) : (
            <>
              <option value="promptDate">Date</option>
              <option value="category">Category</option>
              <option value="favourite">Favourite</option>
              <option value="modelresolution">Resolution</option>
              <option value="modeltype">Model Type</option>
              <option value="basemodel">Base Model</option>
              <option value="processType">Process</option>
            </>
          )}
        </select>
        <div className="flex-shrink-0">
          <button
            onClick={onAddNew}
            className={`${libraryMode === "song" ? "bg-purple-600 hover:bg-purple-500" : "bg-blue-600 hover:bg-blue-500"} text-white p-1.5 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-1 pr-2`}
          >
            <Plus size={16} />{" "}
            <span className="text-xs font-bold">NEW</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
        {Object.entries(groupedPrompts).map(([groupName, groupItems]) => (
          <details
            key={groupName}
            open={true}
            className="group bg-[#1a1a1a] border border-[#333] rounded overflow-hidden"
          >
            <summary className="cursor-pointer bg-[#222] p-2 text-xs font-bold text-gray-400 uppercase tracking-wider select-none hover:bg-[#2a2a2a] flex justify-between items-center outline-none">
              <span className="flex items-center">
                <span className="mr-2 transform transition-transform group-open:rotate-90 text-[10px]">
                  ▶
                </span>
                {groupName}
              </span>
              <span className="bg-[#333] text-gray-500 px-2 py-0.5 rounded-full text-[10px]">
                {groupItems.length}
              </span>
            </summary>

            <div className="p-2 space-y-2">
              {groupItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onEdit(item)}
                  className="group/card bg-[#1e1e1e] hover:bg-[#252525] border border-[#333] hover:border-[#555] rounded-lg p-3 cursor-pointer transition-all shadow-sm relative flex gap-3"
                >
                  {item.type === "song" ? (
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Music
                            size={14}
                            className="text-purple-400 flex-shrink-0"
                          />
                          <h3 className="font-bold text-gray-200 truncate pr-8">
                            {item.title}
                          </h3>
                        </div>
                        <button
                          onClick={(e) => onDelete(e, item.id)}
                          className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {(item.genre || item.tags) && (
                        <div className="flex gap-1 flex-wrap">
                          {item.genre && (
                            <span className="text-[10px] bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/40 font-bold">
                              {item.genre}
                            </span>
                          )}
                          {item.tags &&
                            item.tags
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter(Boolean)
                              .map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] bg-[#1a1a1a] text-gray-500 px-1.5 py-0.5 rounded border border-[#2a2a2a]"
                                >
                                  {tag}
                                </span>
                              ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 bg-[#121212] p-2 rounded border border-[#222] line-clamp-2 font-mono">
                        {item.prompt || (
                          <span className="text-gray-600 italic">
                            No prompt yet
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {item.image && (
                        <div
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewImage(item.image);
                          }}
                        >
                          <img
                            src={item.image}
                            alt="Ref"
                            className="w-20 h-20 object-cover rounded bg-[#121212] border border-[#333] hover:opacity-80 hover:scale-105 transition duration-200 cursor-zoom-in"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-200 truncate pr-8">
                            {item.title}
                          </h3>
                          <button
                            onClick={(e) => onDelete(e, item.id)}
                            className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <Calendar size={10} />{" "}
                          {item.promptDate ||
                            new Date(
                              parseInt(item.id),
                            ).toLocaleDateString()}
                        </p>
                        <div className="text-sm text-gray-400 line-clamp-2 font-mono text-xs bg-[#121212] p-2 rounded border border-[#222] h-full">
                          {item.positive || (
                            <span className="text-gray-600 italic">
                              No prompt text
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </details>
        ))}

        {Object.keys(groupedPrompts).length === 0 && (
          <div className="text-center text-gray-500 mt-10 text-sm flex flex-col items-center gap-2 opacity-50">
            <MessageSquare size={40} />
            <p>No prompts found.</p>
          </div>
        )}
      </div>
      <ConfigEditor
        configs={configs}
        driveFiles={driveFiles}
        driveKeyMap={driveKeyMap}
        onConfigSaved={onConfigSaved}
      />
      <ApiPanel />
    </div>
  );
};

export default PromptList;
