import React, { useEffect, useReducer } from "react";
import { Save, Plus, Loader2, X, Sliders, FileText } from "lucide-react";
import { EDITOR_KEYS } from "../constants/editorKeys";

export const editorInitial = {
  open: false,
  selectedKey: "basemodels",
  userItems: [],
  inputValue: "",
  saving: false,
  loading: false,
};

export function editorReducer(state, action) {
  switch (action.type) {
    case "TOGGLE":
      return { ...state, open: !state.open };
    case "SET_KEY":
      return { ...state, selectedKey: action.key };
    case "LOADING":
      return { ...state, loading: true, userItems: [], inputValue: "" };
    case "LOADED":
      return { ...state, loading: false, userItems: action.items };
    case "INPUT":
      return { ...state, inputValue: action.value };
    case "ADD": {
      const v = state.inputValue.trim();
      if (!v || state.userItems.includes(v))
        return { ...state, inputValue: "" };
      return { ...state, userItems: [...state.userItems, v], inputValue: "" };
    }
    case "REMOVE":
      return {
        ...state,
        userItems: state.userItems.filter((_, i) => i !== action.index),
      };
    case "SAVING":
      return { ...state, saving: true };
    case "SAVED":
      return { ...state, saving: false };
    default:
      return state;
  }
}

const ConfigEditor = ({ configs, driveFiles, driveKeyMap, onConfigSaved }) => {
  const [state, dispatch] = useReducer(editorReducer, editorInitial);

  const activeDriveFileId = driveKeyMap[state.selectedKey] || null;
  const activeDriveFile = activeDriveFileId
    ? driveFiles.find((f) => f.id === activeDriveFileId)
    : null;
  const driveFileName = activeDriveFile
    ? activeDriveFile.name.replace(/\.json$/i, "")
    : null;

  useEffect(() => {
    if (!state.open) return;
    let cancelled = false;
    dispatch({ type: "LOADING" });
    if (activeDriveFileId) {
      window.electron?.loadDriveFile(activeDriveFileId).then((content) => {
        if (!cancelled) {
          const items =
            content && typeof content === "object" && !Array.isArray(content)
              ? content[state.selectedKey] || []
              : [];
          dispatch({ type: "LOADED", items });
        }
      });
    } else {
      window.electron?.getUserConfig(state.selectedKey).then((items) => {
        if (!cancelled)
          dispatch({
            type: "LOADED",
            items: Array.isArray(items) ? items : [],
          });
      });
    }
    return () => {
      cancelled = true;
    };
  }, [state.open, state.selectedKey, activeDriveFileId]);

  const userSet = new Set(state.userItems);
  const bundledItems = (configs[state.selectedKey] || []).filter(
    (item) => !userSet.has(item),
  );

  const handleSave = async () => {
    dispatch({ type: "SAVING" });
    if (activeDriveFileId) {
      const current = await window.electron?.loadDriveFile(activeDriveFileId);
      const base =
        current && typeof current === "object" && !Array.isArray(current)
          ? current
          : {};
      await window.electron?.saveDriveFile({
        fileId: activeDriveFileId,
        prompts: { ...base, [state.selectedKey]: state.userItems },
      });
    } else {
      await window.electron?.saveUserConfig(state.selectedKey, state.userItems);
    }
    dispatch({ type: "SAVED" });
    onConfigSaved?.();
  };

  return (
    <div className="border-t border-[#333] bg-[#1a1a1a] flex-shrink-0">
      <button
        onClick={() => dispatch({ type: "TOGGLE" })}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-300 hover:bg-[#222] transition"
      >
        <span className="flex items-center gap-1.5">
          <Sliders size={12} /> Custom Options
        </span>
        <span className="text-[10px]">{state.open ? "▼" : "▶"}</span>
      </button>

      {state.open && (
        <div className="px-3 pb-3 space-y-2">
          <select
            value={state.selectedKey}
            onChange={(e) => dispatch({ type: "SET_KEY", key: e.target.value })}
            className="w-full bg-[#111] border border-[#333] text-gray-300 text-xs rounded px-2 py-1.5 outline-none focus:border-blue-500"
          >
            {EDITOR_KEYS.map((k) => (
              <option key={k} value={k}>
                {driveKeyMap[k] ? `● ${k}` : k}
              </option>
            ))}
          </select>

          {driveFileName && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-900/20 border border-blue-900/30 rounded text-[10px] text-blue-400">
              <FileText size={10} />
              <span className="truncate">Editing: {driveFileName}</span>
            </div>
          )}

          {state.loading ? (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-gray-600">
              <Loader2 size={12} className="animate-spin" /> Loading...
            </div>
          ) : (
            <div className="max-h-32 overflow-y-auto space-y-1 pr-0.5">
              {!driveFileName &&
                bundledItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between px-2 py-1 bg-[#111] rounded text-xs text-gray-500"
                  >
                    <span className="truncate">{item}</span>
                    <span className="ml-2 flex-shrink-0 text-[9px] text-gray-700 border border-[#2a2a2a] rounded px-1">
                      default
                    </span>
                  </div>
                ))}
              {state.userItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-2 py-1 bg-green-900/20 border border-green-900/30 rounded text-xs text-green-300"
                >
                  <span className="truncate">{item}</span>
                  <button
                    onClick={() => dispatch({ type: "REMOVE", index: i })}
                    className="ml-2 flex-shrink-0 text-red-500 hover:text-red-400 p-0.5 rounded transition"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {(driveFileName
                ? state.userItems.length === 0
                : bundledItems.length === 0 &&
                  state.userItems.length === 0) && (
                <p className="text-[10px] text-gray-700 text-center py-1">
                  No items yet
                </p>
              )}
            </div>
          )}

          <div className="flex gap-1.5">
            <input
              value={state.inputValue}
              onChange={(e) =>
                dispatch({ type: "INPUT", value: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && dispatch({ type: "ADD" })}
              placeholder={
                driveFileName
                  ? `Add to ${driveFileName}...`
                  : "Add custom item..."
              }
              className="flex-1 bg-[#111] border border-[#333] text-gray-300 text-xs rounded px-2 py-1.5 outline-none focus:border-blue-500 placeholder-gray-600"
            />
            <button
              onClick={() => dispatch({ type: "ADD" })}
              className="px-2 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs font-bold transition"
            >
              <Plus size={12} />
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={state.saving}
            className="w-full py-1.5 bg-[#222] hover:bg-[#2a2a2a] border border-[#333] text-gray-400 hover:text-gray-200 text-xs font-bold rounded transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {state.saving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            {state.saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfigEditor;
