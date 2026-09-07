import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import "./bridge/mockElectron";

import FloatingProfile from "./components/FloatingProfile";
import LoginScreen from "./components/LoginScreen";
import Modal from "./components/Modal";
import Header from "./components/Header";
import PromptList from "./components/PromptList";
import PromptEditor from "./components/PromptEditor";
import SongEditor from "./components/SongEditor";

import { defaultFormData, defaultSongForm } from "./constants/editorKeys";

// Detect if this window is the floating bubble
const _params = new URLSearchParams(window.location.search);
const IS_BUBBLE = _params.get("mode") === "bubble";
const BUBBLE_PICTURE = _params.get("picture") || "";
const BUBBLE_NAME = _params.get("name") || "";

const App = () => {
  // --- STATE DEFINITIONS ---
  const [activeTab, setActiveTab] = useState("history");

  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [history, setHistory] = useState([]);
  const [configs, setConfigs] = useState({
    basemodels: [],
    samplers: [],
    categories: [],
    checkpointtypes: [],
    modelfileformats: [],
    modeltypes: [],
    schedulers: [],
    modelresolutions: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDestructive: false,
    confirmText: "Confirm",
  });

  // Grouping State
  const [groupBy, setGroupBy] = useState("none");

  // Drive Config Sources
  const [driveFiles, setDriveFiles] = useState([]);
  const [checkedDriveIds, setCheckedDriveIds] = useState(new Set());
  const [driveKeyMap, setDriveKeyMap] = useState({});
  const [isDriveLoading, setIsDriveLoading] = useState(false);

  // Library Mode: 'image' or 'song'
  const [libraryMode, setLibraryMode] = useState("image");

  const [formData, setFormData] = useState({
    ...defaultFormData,
    promptDate: new Date().toISOString().split("T")[0],
  });

  const [songFormData, setSongFormData] = useState({
    ...defaultSongForm,
    promptDate: new Date().toISOString().split("T")[0],
  });

  // --- HELPER: Group Prompts ---
  const getGroupedPrompts = () => {
    const filtered =
      libraryMode === "song"
        ? history.filter((p) => p.type === "song")
        : history.filter((p) => p.type !== "song");

    if (groupBy === "none") return { "All Prompts": filtered };

    return filtered.reduce((groups, prompt) => {
      let key = prompt[groupBy];
      if (groupBy === "promptDate") {
        key = key ? new Date(key).toLocaleDateString() : "No Date";
      } else if (groupBy === "favourite") {
        key = key ? "❤️ Favourites" : "Standard";
      } else if (!key || key === "") {
        key = "Uncategorized";
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(prompt);
      return groups;
    }, {});
  };

  const groupedPrompts = getGroupedPrompts();

  // --- EFFECTS ---
  useEffect(() => {
    if (window.electron) {
      if (window.electron.setResizable) {
        window.electron.setResizable(false);
      }

      window.electron.checkAuth().then((u) => {
        if (u) {
          setUser(u);
          loadHistory();
          loadDriveFiles();
        }
        setIsAuthLoading(false);
      });
      window.electron.getConfigs().then(setConfigs);
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  const loadHistory = async () => {
    if (window.electron) {
      const data = await window.electron.listPrompts();
      setHistory(data);
    }
  };

  const reloadConfigs = () => {
    if (checkedDriveIds.size > 0) {
      applyDriveConfigs(checkedDriveIds);
    } else {
      window.electron?.getConfigs().then(setConfigs);
    }
  };

  const loadDriveFiles = async () => {
    const files = await window.electron?.listDriveFiles();
    setDriveFiles(Array.isArray(files) ? files : []);
  };

  const applyDriveConfigs = async (checkedIds) => {
    setIsDriveLoading(true);
    const base = await window.electron?.getConfigs();
    let merged = { ...base };
    const keyMap = {};
    for (const fileId of checkedIds) {
      const content = await window.electron?.loadDriveFile(fileId);
      if (!content || typeof content !== "object" || Array.isArray(content))
        continue;
      for (const [key, items] of Object.entries(content)) {
        if (!Array.isArray(items) || !(key in merged)) continue;
        merged[key] = [...new Set([...items, ...merged[key]])];
        keyMap[key] = fileId;
      }
    }
    setConfigs(merged);
    setDriveKeyMap(keyMap);
    setIsDriveLoading(false);
  };

  const toggleDriveFile = async (fileId) => {
    const next = new Set(checkedDriveIds);
    if (next.has(fileId)) next.delete(fileId);
    else next.add(fileId);
    setCheckedDriveIds(next);
    await applyDriveConfigs(next);
  };

  const handleDefaultClick = async () => {
    setCheckedDriveIds(new Set());
    setDriveKeyMap({});
    const base = await window.electron?.getConfigs();
    if (base) setConfigs(base);
  };

  const showModal = (
    title,
    message,
    onConfirm,
    isDestructive = false,
    confirmText = "Confirm",
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
      isDestructive,
      confirmText,
    });
  };
  const closeModal = () =>
    setModalConfig((prev) => ({ ...prev, isOpen: false }));

  const handleLogin = async () => {
    if (window.electron) {
      try {
        const u = await window.electron.loginGoogle();
        if (u) {
          setUser(u);
          loadHistory();
          reloadConfigs();
          loadDriveFiles();
        }
      } catch (err) {
        console.error("Login failed:", err);
        showModal(
          "Login Error",
          `Failed to sign in: ${err.message || "Unknown error"}. Ensure your .env file is correctly set up with Google Credentials.`,
          () => {},
          false,
          "OK",
        );
      }
    }
  };

  const handleLogout = async () => {
    if (window.electron) {
      await window.electron.logout();
      setUser(null);
      setHistory([]);
    }
  };

  const handleMinimize = () => {
    window.electron?.resizeWindow(true);
  };

  const handleTitleChange = (e) => {
    setErrorMsg("");
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      showModal(
        "File Too Large",
        "Please upload an image smaller than 1MB.",
        () => {},
        false,
        "OK",
      );
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (silent = false) => {
    if (!formData.title.trim()) {
      if (!silent) setErrorMsg("Title is required!");
      return false;
    }
    setIsSaving(true);
    setErrorMsg("");
    try {
      const result = await window.electron.saveData(formData);
      if (!result.success) {
        setErrorMsg(result.error || "Unknown error occurred");
        setIsSaving(false);
        return false;
      }
      setFormData((prev) => ({ ...prev, id: result.id }));
      if (!silent) setTimeout(() => setIsSaving(false), 1000);
      else setIsSaving(false);
      await loadHistory();
      return true;
    } catch (err) {
      console.error(err);
      setErrorMsg("System Error: " + err.message);
      setIsSaving(false);
      return false;
    }
  };

  const handleBackOrCancel = async () => {
    if (!formData.id) {
      showModal(
        "Discard Prompt?",
        "You haven't saved this prompt yet. Discard?",
        () => setActiveTab("history"),
        true,
        "Discard",
      );
      return;
    }
    const saved = await handleSave(true);
    if (saved) setActiveTab("history");
  };

  const handleAddNew = () => {
    if (libraryMode === "song") {
      setSongFormData({ ...defaultSongForm, promptDate: new Date().toISOString().split("T")[0] });
      setErrorMsg("");
      setIsSaving(false);
      setActiveTab("song-editor");
    } else {
      setFormData({
        id: null,
        title: "",
        favourite: false,
        image: "",
        positive: "",
        negative: "",
        stylePrompt: "",
        refinerPrompt: "",
        width: 1024,
        height: 1024,
        steps: 30,
        cfgScale: 7.0,
        seed: -1,
        sampler: "DPM++ 2M Karras",
        scheduler: "Simple",
        basemodel: "SDXL_1.0.safetensors",
        checkpointtype: "Merged",
        modelfileformat: "Safe Tensor",
        modeltype: "Checkpoint",
        vae: "Automatic",
        clipSkip: 2,
        denoise: 0.7,
        addNoise: true,
        startStep: 0,
        endStep: 100,
        processType: "Text to Image",
        usedPromptType: "SDXL",
        category: "Character Design",
        subCategory: "",
        comment: "",
        modelUrl: "",
        promptDate: new Date().toISOString().split("T")[0],
      });
      setErrorMsg("");
      setIsSaving(false);
      setActiveTab("editor");
    }
  };

  const handleEdit = (prompt) => {
    if (prompt.type === "song") {
      setSongFormData(prompt);
      setErrorMsg("");
      setIsSaving(false);
      setActiveTab("song-editor");
    } else {
      setFormData(prompt);
      setErrorMsg("");
      setIsSaving(false);
      setActiveTab("editor");
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    showModal(
      "Delete Prompt?",
      "This action cannot be undone.",
      async () => {
        await window.electron.deletePrompt(id);
        loadHistory();
      },
      true,
      "Delete",
    );
  };

  const handleSaveSong = async (silent = false) => {
    if (!songFormData.title.trim()) {
      if (!silent) setErrorMsg("Title is required!");
      return false;
    }
    setIsSaving(true);
    setErrorMsg("");
    try {
      const result = await window.electron.saveData({
        ...songFormData,
        type: "song",
      });
      if (!result.success) {
        setErrorMsg(result.error || "Unknown error occurred");
        setIsSaving(false);
        return false;
      }
      setSongFormData((prev) => ({ ...prev, id: result.id }));
      if (!silent) setTimeout(() => setIsSaving(false), 1000);
      else setIsSaving(false);
      await loadHistory();
      return true;
    } catch (err) {
      setErrorMsg("System Error: " + err.message);
      setIsSaving(false);
      return false;
    }
  };

  const handleSongBackOrCancel = async () => {
    if (!songFormData.id) {
      showModal(
        "Discard Song?",
        "You haven't saved this song yet. Discard?",
        () => setActiveTab("history"),
        true,
        "Discard",
      );
      return;
    }
    const saved = await handleSaveSong(true);
    if (saved) setActiveTab("history");
  };

  const handleToggleFavourite = () => {
    if (activeTab === "song-editor")
      setSongFormData((prev) => ({
        ...prev,
        favourite: !prev.favourite,
      }));
    else
      setFormData((prev) => ({
        ...prev,
        favourite: !prev.favourite,
      }));
  };

  // 1. Loading State
  if (isAuthLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212] text-white">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );

  // 2. Login State
  if (!user)
    return (
      <div className="h-screen bg-[#121212] border border-[#333] shadow-2xl overflow-hidden rounded-xl relative flex flex-col">
        <Modal
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
          onCancel={closeModal}
          isDestructive={modalConfig.isDestructive}
          confirmText={modalConfig.confirmText}
        />
        <LoginScreen onLogin={handleLogin} />
      </div>
    );

  // 3. BUBBLE WINDOW MODE
  if (IS_BUBBLE)
    return <FloatingProfile picture={BUBBLE_PICTURE} name={BUBBLE_NAME} />;

  // 4. MAIN AUTHENTICATED UI (NORMAL MODE)
  return (
    <div className="flex flex-col h-screen bg-[#121212] text-gray-100 border border-[#333] shadow-2xl overflow-hidden rounded-xl relative animate-in fade-in zoom-in duration-300">
      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        isDestructive={modalConfig.isDestructive}
        confirmText={modalConfig.confirmText}
      />

      <Header
        user={user}
        activeTab={activeTab}
        formData={formData}
        songFormData={songFormData}
        history={history}
        onMinimize={handleMinimize}
        onToggleFavourite={handleToggleFavourite}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === "history" && (
          <PromptList
            user={user}
            history={history}
            groupedPrompts={groupedPrompts}
            libraryMode={libraryMode}
            groupBy={groupBy}
            configs={configs}
            driveFiles={driveFiles}
            driveKeyMap={driveKeyMap}
            checkedDriveIds={checkedDriveIds}
            isDriveLoading={isDriveLoading}
            onSetLibraryMode={setLibraryMode}
            onSetGroupBy={setGroupBy}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreviewImage={() => {}}
            onToggleDriveFile={toggleDriveFile}
            onDefaultDriveSource={handleDefaultClick}
            onRefreshDriveFiles={loadDriveFiles}
            onConfigSaved={reloadConfigs}
          />
        )}

        {activeTab === "editor" && (
          <PromptEditor
            formData={formData}
            setFormData={setFormData}
            configs={configs}
            isSaving={isSaving}
            errorMsg={errorMsg}
            onSave={handleSave}
            onBackOrCancel={handleBackOrCancel}
            onTitleChange={handleTitleChange}
            onImageUpload={handleImageUpload}
          />
        )}

        {activeTab === "song-editor" && (
          <SongEditor
            songFormData={songFormData}
            setSongFormData={setSongFormData}
            configs={configs}
            isSaving={isSaving}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
            onSave={handleSaveSong}
            onBackOrCancel={handleSongBackOrCancel}
          />
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a1a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
};

export default App;
