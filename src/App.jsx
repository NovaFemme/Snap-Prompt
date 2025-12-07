import React, { useState, useEffect } from 'react';
import { 
  Save, Plus, AlertCircle, Check, Loader2, X, 
  History, Trash2, Calendar, ArrowLeft, Edit2, Minimize2, Maximize2,
  Sliders, FileText, Ban, Image as ImageIcon, Upload, Lock, MessageSquare, LogOut
} from 'lucide-react';

// --- IMAGE HANDLING INSTRUCTIONS ---
import appIcon from './icon.png' 
// ---------------------------------------------------------------------------
// FOR PREVIEW (Current Mode):
// We use a web link so the app doesn't crash here in the browser.
//const appIcon = "https://drive.google.com/uc?export=view&id=1BdkKCJld4j4TeU1mUf_RhQShZPiRA_ps";

// FOR LOCAL BUILD (When you run 'npm run dist' on your PC):
// 1. Make sure 'icon.png' is in your 'src' folder.
// 2. UNCOMMENT the line below (remove the //):
// import appIcon from './icon.png'; 
// 3. COMMENT OUT the 'const appIcon = ...' line above.
// ---------------------------------------------------------------------------

// --- MOCK ELECTRON BRIDGE (For Browser Preview) ---
if (!window.electron) {
  const LOCAL_STORAGE_KEY = 'snap-prompts-mock-data';
  console.warn("Electron API not found. Using Mock Bridge for browser preview.");
  
  window.electron = {
    checkAuth: async () => null, // Simulate logged out initially
    loginGoogle: async () => {
      console.log("Mock Login Triggered");
      return { name: "Preview User", email: "user@example.com", picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" };
    },
    logout: async () => {
      console.log("Mock Logout Triggered");
      return true;
    },
    saveData: async (data) => {
      try {
        await new Promise(r => setTimeout(r, 600)); 
        let items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        if (!data.title || !data.title.trim()) return { success: false, error: "Title is required (Backend Mock)" };

        if (data.id) {
          const idx = items.findIndex(i => i.id === data.id);
          if (idx !== -1) items[idx] = data;
          else items.push(data);
        } else {
          data.id = Date.now().toString();
          items.push(data);
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
        return { success: true, id: data.id };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    listPrompts: async () => {
       const items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
       return items.reverse();
    },
    deletePrompt: async (id) => {
      let items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      items = items.filter(i => i.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      return { success: true };
    },
    getConfigs: async () => ({
      models: ["SDXL_1.0.safetensors", "Realistic_Vision_V5.safetensors", "RevAnimated.safetensors"],
      samplers: ["Euler a", "DPM++ 2M Karras", "DPM++ SDE Karras"]
    }),
    resizeWindow: (min) => console.log(`Window resize requested. Mini mode: ${min}`),
    setResizable: (allow) => console.log(`Window resizable set to: ${allow}`),
    quitApp: () => console.log("App quit requested")
  };
}

// --- LOGIN SCREEN COMPONENT ---
const LoginScreen = ({ onLogin }) => (
  <div className="flex flex-col h-full bg-[#121212] relative animate-in fade-in duration-500">
    <div className="absolute top-0 w-full h-12 flex items-center justify-end px-4 z-20 drag-handle">
       <div className="flex gap-2 no-drag">
          <button onClick={() => window.electron.quitApp()} className="p-1 hover:bg-red-900/50 hover:text-red-400 rounded text-gray-400 transition"><X size={16} /></button>
       </div>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        
        {/* APP ICON */}
        <div className="relative w-24 h-24 bg-[#1e1e1e] rounded-xl flex items-center justify-center shadow-2xl border border-[#333] overflow-hidden">
          <img src={appIcon} alt="Snap Prompt Icon" className="w-full h-full object-cover" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Snap Prompt</h1>
        <p className="text-gray-500 text-sm max-w-[240px] mx-auto leading-relaxed">
          Sync your Stable Diffusion prompts across all your devices with Google Drive.
        </p>
      </div>
      
      <button 
        onClick={onLogin}
        className="group relative flex items-center gap-3 bg-white text-gray-900 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
      >
        <div className="w-5 h-5 flex items-center justify-center">
           <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
             <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
             <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
             <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
             <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
           </svg>
        </div>
        Sign in with Google
      </button>

      <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono mt-8">
        <Lock size={10} />
        <span>SECURE ENCRYPTED SYNC</span>
      </div>
    </div>
  </div>
);

// --- CUSTOM MODAL ---
const Modal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDestructive = false }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-full max-w-xs overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 text-center">
          <h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3>
          <p className="text-sm text-gray-400 mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2 bg-[#333] hover:bg-[#444] text-gray-200 rounded-lg text-sm font-bold transition">Cancel</button>
            <button onClick={onConfirm} className={`flex-1 py-2 rounded-lg text-sm font-bold text-white transition ${isDestructive ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('history'); 
  const [editorView, setEditorView] = useState('prompt');
  
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isFloating, setIsFloating] = useState(false); // Tracks Floating Bubble Mode

  const [history, setHistory] = useState([]);
  const [configs, setConfigs] = useState({ models: [], samplers: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [previewImage, setPreviewImage] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, isDestructive: false, confirmText: 'Confirm' });

  const [formData, setFormData] = useState({
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
    model: "SDXL_1.0.safetensors",
    vae: "Automatic",
    clipSkip: 2,
    denoise: 0.7,
    addNoise: true,
    startStep: 0,
    endStep: 100,
    action: "Text to Image",
    usedPromptType: "SDXL",
    category: "Character Design",
    subCategory: "",
    comment: "",
    link: "",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (window.electron) {
        // Lock window resize to prevent accidental resizing
        if (window.electron.setResizable) {
            window.electron.setResizable(false);
        }

        window.electron.checkAuth().then(u => { 
            if (u) {
                setUser(u);
                loadHistory(); 
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

  const showModal = (title, message, onConfirm, isDestructive = false, confirmText = 'Confirm') => {
    setModalConfig({ isOpen: true, title, message, onConfirm: () => { onConfirm(); setModalConfig(prev => ({...prev, isOpen: false})); }, isDestructive, confirmText });
  };
  const closeModal = () => setModalConfig(prev => ({...prev, isOpen: false}));

  const handleLogin = async () => { 
      if (window.electron) { 
          try {
            const u = await window.electron.loginGoogle(); 
            if (u) {
                setUser(u);
                loadHistory(); 
            }
          } catch (err) {
            console.error("Login failed:", err);
            showModal(
                "Login Error", 
                `Failed to sign in: ${err.message || "Unknown error"}. Ensure your .env file is correctly set up with Google Credentials.`, 
                () => {}, 
                false, 
                "OK"
            );
          }
      } 
  };

  const handleLogout = async () => {
    if (window.electron) {
      // 1. Call backend to clear tokens
      await window.electron.logout();
      // 2. Clear local state
      setUser(null);
      setHistory([]);
    }
  };

  const toggleFloating = () => {
    const newState = !isFloating;
    setIsFloating(newState);
    if (window.electron) {
      window.electron.resizeWindow(newState);
    }
  };

  const handleTitleChange = (e) => {
    setErrorMsg(''); 
    setFormData(prev => ({...prev, title: e.target.value}));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { 
        showModal("File Too Large", "Please upload an image smaller than 1MB.", () => {}, false, "OK");
        return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (silent = false) => {
    if (!formData.title.trim()) {
      if (!silent) setErrorMsg("Title is required!");
      return false;
    }
    setIsSaving(true);
    setErrorMsg('');
    try {
      const result = await window.electron.saveData(formData);
      if (!result.success) {
        setErrorMsg(result.error || "Unknown error occurred");
        setIsSaving(false);
        return false;
      }
      setFormData(prev => ({ ...prev, id: result.id }));
      if (!silent) setTimeout(() => setIsSaving(false), 1000); else setIsSaving(false);
      await loadHistory();
      return true;
    } catch (err) {
      console.error(err);
      setErrorMsg("System Error: " + err.message);
      setIsSaving(false);
      return false;
    }
  }

  const handleBackOrCancel = async () => {
    if (!formData.id) {
        showModal("Discard Prompt?", "You haven't saved this prompt yet. Discard?", () => setActiveTab('history'), true, "Discard");
        return;
    }
    const saved = await handleSave(true);
    if (saved) setActiveTab('history');
  };

  const handleAddNew = () => {
    setFormData({ id: null, title: "", favourite: false, image: "", positive: "", negative: "", stylePrompt: "", refinerPrompt: "", width: 1024, height: 1024, steps: 30, cfgScale: 7.0, seed: -1, sampler: "DPM++ 2M Karras", model: "SDXL_1.0.safetensors", vae: "Automatic", clipSkip: 2, denoise: 0.7, addNoise: true, startStep: 0, endStep: 100, action: "Text to Image", usedPromptType: "SDXL", category: "Character Design", subCategory: "", comment: "", link: "", date: new Date().toISOString().split('T')[0] });
    setErrorMsg(''); setIsSaving(false); setEditorView('prompt'); setActiveTab('editor');
  };

  const handleEdit = (prompt) => {
    setFormData(prompt); setErrorMsg(''); setIsSaving(false); setEditorView('prompt'); setActiveTab('editor');
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    showModal("Delete Prompt?", "This action cannot be undone.", async () => { await window.electron.deletePrompt(id); loadHistory(); }, true, "Delete");
  };

  // 1. Loading State
  if (isAuthLoading) return <div className="h-screen flex items-center justify-center bg-[#121212] text-white"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  // 2. Login State
  if (!user) return (
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

  // 3. FLOATING MODE UI
  if (isFloating) {
    return (
      // Changed to a full-screen container that centers the bubble.
      // The bubble itself is now constrained to w-24 h-24 (96px).
      // This works in both the small window (100x100) and the large preview window.
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div 
          className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl drag-handle cursor-move bg-[#121212] relative group flex items-center justify-center"
        >
          <img src={user.picture} alt="Floating User" className="w-full h-full object-cover pointer-events-none" />
          {/* ADDED no-drag AND onClick here to ensure interactions work even if drag region swallows double-clicks */}
          <div 
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity no-drag cursor-pointer"
              onClick={toggleFloating}
              title="Click to Restore"
          >
              <Maximize2 size={24} className="text-white drop-shadow-md" />
          </div>
        </div>
      </div>
    );
  }

  // 4. MAIN AUTHENTICATED UI (NORMAL MODE)
  return (
    <div className="flex flex-col h-screen bg-[#121212] text-gray-100 border border-[#333] shadow-2xl overflow-hidden rounded-xl relative animate-in fade-in zoom-in duration-300">
      <Modal isOpen={modalConfig.isOpen} title={modalConfig.title} message={modalConfig.message} onConfirm={modalConfig.onConfirm} onCancel={closeModal} isDestructive={modalConfig.isDestructive} confirmText={modalConfig.confirmText} />
      
      {previewImage && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-8 animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
            <div className="relative max-w-full max-h-full flex flex-col items-center">
                 <button onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 bg-[#333] hover:bg-[#444] text-white p-2 rounded-full transition shadow-lg border border-[#555] z-50"><X size={20}/></button>
                 <img src={previewImage} alt="Full Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-[#333]" onClick={e => e.stopPropagation()} />
            </div>
        </div>
      )}

      {/* HEADER */}
      <div className="drag-handle h-14 bg-[#1a1a1a] flex items-center justify-between px-4 border-b border-[#333]">
        <div className="flex items-center gap-3">
          {/* USER AVATAR - CLICK TO FLOAT */}
          <div className="relative group no-drag cursor-pointer" onClick={toggleFloating} title="Click to Switch to Floating Mode">
             <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-60 transition duration-300"></div>
             <img src={user.picture} alt="User" className="relative w-10 h-10 rounded-full border-2 border-[#333] group-hover:border-white transition-all transform group-hover:scale-105 object-cover" />
          </div>

          <div className="flex flex-col">
            <div className="font-bold text-sm tracking-wide text-gray-200 flex items-center gap-2">
              {activeTab === 'history' ? 'Prompt Library' : (formData.id ? 'Edit Prompt' : 'New Prompt')}
            </div>
            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
               {activeTab === 'history' ? `${history.length} Saved` : 'Editor'}
            </div>
          </div>
        </div>

        <div className="flex gap-2 no-drag">
          {/* LOGOUT BUTTON ADDED HERE */}
          <button onClick={handleLogout} className="p-2 hover:bg-[#333] rounded-lg text-gray-400 transition" title="Sign Out">
            <LogOut size={18} />
          </button>
          
          <button onClick={() => window.electron.quitApp()} className="p-2 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-gray-400 transition"><X size={18} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === 'history' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2 opacity-50"><MessageSquare size={40} /><p>No prompts saved yet.</p></div>
              ) : (
                history.map(item => (
                  <div key={item.id} onClick={() => handleEdit(item)} className="group bg-[#1e1e1e] hover:bg-[#252525] border border-[#333] hover:border-[#555] rounded-lg p-3 cursor-pointer transition-all shadow-sm relative flex gap-3">
                    {item.image && (
                        <div className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); setPreviewImage(item.image); }}>
                             <img src={item.image} alt="Ref" className="w-20 h-20 object-cover rounded bg-[#121212] border border-[#333] hover:opacity-80 hover:scale-105 transition duration-200 cursor-zoom-in" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-gray-200 truncate pr-8">{item.title}</h3>
                            <button onClick={(e) => handleDelete(e, item.id)} className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded transition"><Trash2 size={14} /></button>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Calendar size={10}/> {new Date(parseInt(item.id)).toLocaleDateString()}</p>
                        <div className="text-sm text-gray-400 line-clamp-2 font-mono text-xs bg-[#121212] p-2 rounded border border-[#222] h-full">
                            {item.positive || <span className="text-gray-600 italic">No prompt text</span>}
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-[#1a1a1a] border-t border-[#333]">
              <button onClick={handleAddNew} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"><Plus size={20} /> Create New Prompt</button>
            </div>
          </>
        )}

        {activeTab === 'editor' && (
          <div className="flex flex-col h-full">
            <div className="flex border-b border-[#333] bg-[#1a1a1a]">
                <button onClick={() => setEditorView('prompt')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${editorView === 'prompt' ? 'text-blue-400 bg-[#222] border-b-2 border-blue-500' : 'text-gray-500 hover:bg-[#222]'}`}><MessageSquare size={14}/> Prompt</button>
                <button onClick={() => setEditorView('settings')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${editorView === 'settings' ? 'text-blue-400 bg-[#222] border-b-2 border-blue-500' : 'text-gray-500 hover:bg-[#222]'}`}><Sliders size={14}/> Settings</button>
                <button onClick={() => setEditorView('notes')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${editorView === 'notes' ? 'text-blue-400 bg-[#222] border-b-2 border-blue-500' : 'text-gray-500 hover:bg-[#222]'}`}><FileText size={14}/> Notes</button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {errorMsg && <div className="bg-red-900/20 border border-red-800 text-red-200 px-3 py-2 rounded text-sm flex items-center gap-2 animate-pulse"><AlertCircle size={16} /> {errorMsg}</div>}

              {editorView === 'prompt' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Title <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.title} onChange={handleTitleChange} disabled={isSaving} className="w-full bg-[#1a1a1a] border border-[#333] focus:border-blue-500 rounded p-2 text-white outline-none transition disabled:opacity-50" placeholder="e.g. Cyberpunk City"/>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-2">Reference Image <span className="text-[10px] font-normal text-gray-600">(Max 1MB)</span></label>
                    <div className="flex items-start gap-4">
                        {formData.image ? (
                            <div className="relative group">
                                <img src={formData.image} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-[#333] shadow-lg cursor-zoom-in" onClick={() => setPreviewImage(formData.image)} />
                                <button onClick={() => setFormData({...formData, image: ""})} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-md hover:bg-red-500 transition scale-90 hover:scale-110"><X size={12}/></button>
                            </div>
                        ) : (
                            <label className="w-24 h-24 border border-dashed border-[#444] rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-[#1f1f1f] cursor-pointer transition">
                                <Upload size={20} /> <span className="text-[10px] mt-1 font-bold">UPLOAD</span> <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        )}
                        <div className="text-xs text-gray-500 mt-2 flex-1">
                             {formData.image ? "Image attached. It will be saved with your prompt." : "Attach a reference image to this prompt."}
                        </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 text-green-500">Positive Prompt</label>
                    <textarea value={formData.positive} onChange={e => setFormData({...formData, positive: e.target.value})} disabled={isSaving} className="w-full h-32 bg-[#1a1a1a] border border-[#333] focus:border-green-500/50 rounded p-2 text-sm text-gray-200 outline-none resize-none font-mono disabled:opacity-50" placeholder="What do you want to see?"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 text-red-400">Negative Prompt</label>
                    <textarea value={formData.negative} onChange={e => setFormData({...formData, negative: e.target.value})} disabled={isSaving} className="w-full h-24 bg-[#1a1a1a] border border-[#333] focus:border-red-500/50 rounded p-2 text-sm text-gray-200 outline-none resize-none font-mono disabled:opacity-50" placeholder="What to avoid?"/>
                  </div>
                </>
              )}

              {editorView === 'settings' && (
                <div className="space-y-4">
                   <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Checkpoint Model</label><select value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none">{configs.models.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                   <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Sampling Method</label><select value={formData.sampler} onChange={e => setFormData({...formData, sampler: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none">{configs.samplers.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                   <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Steps: {formData.steps}</label><input type="range" min="1" max="100" value={formData.steps} onChange={e => setFormData({...formData, steps: parseInt(e.target.value)})} className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500" /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">CFG Scale: {formData.cfgScale}</label><input type="range" min="1" max="30" step="0.5" value={formData.cfgScale} onChange={e => setFormData({...formData, cfgScale: parseFloat(e.target.value)})} className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500" /></div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Width</label><input type="number" value={formData.width} onChange={e => setFormData({...formData, width: parseInt(e.target.value)})} className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none" /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Height</label><input type="number" value={formData.height} onChange={e => setFormData({...formData, height: parseInt(e.target.value)})} className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none" /></div>
                   </div>
                </div>
              )}

              {editorView === 'notes' && (
                <div className="space-y-1 h-full"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Personal Notes</label><textarea value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} className="w-full h-64 bg-[#1a1a1a] border border-[#333] focus:border-blue-500/50 rounded p-2 text-sm text-gray-400 outline-none resize-none" placeholder="Add your thoughts, tags, or context here..."/></div>
              )}
            </div>

            <div className="p-4 bg-[#1a1a1a]/95 backdrop-blur border-t border-[#333] flex gap-3">
              <button onClick={handleBackOrCancel} className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 ${!formData.id ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-[#333] hover:bg-[#444] text-gray-200'}`}>
                {!formData.id ? <Ban size={18} /> : <ArrowLeft size={18} />} {!formData.id ? 'Cancel' : 'Back'}
              </button>
              <button onClick={() => handleSave(false)} disabled={isSaving} className={`flex-1 ${isSaving ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'} text-white py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2`}>
                {isSaving ? <Check size={18} /> : <Save size={18} />} {isSaving ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
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
}

export default App;