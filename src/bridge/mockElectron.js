// --- MOCK ELECTRON BRIDGE (For Browser Preview) ---
if (!window.electron) {
  const LOCAL_STORAGE_KEY = "snap-prompts-mock-data";
  console.warn(
    "Electron API not found. Using Mock Bridge for browser preview.",
  );

  window.electron = {
    checkAuth: async () => null,
    loginGoogle: async () => {
      console.log("Mock Login Triggered");
      return {
        name: "Preview User",
        email: "user@example.com",
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      };
    },
    logout: async () => {
      console.log("Mock Logout Triggered");
      return true;
    },
    saveData: async (data) => {
      try {
        await new Promise((r) => setTimeout(r, 600));
        let items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
        if (!data.title || !data.title.trim())
          return { success: false, error: "Title is required (Backend Mock)" };

        if (data.id) {
          const idx = items.findIndex((i) => i.id === data.id);
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
      const items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
      return items.reverse();
    },
    deletePrompt: async (id) => {
      let items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
      items = items.filter((i) => i.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      return { success: true };
    },
    getConfigs: async () => {
      return {
        basemodels: ["SDXL_1.0", "SD 1.5"],
        samplers: ["DPM++ 2M Karras", "Euler a"],
        categories: ["Character", "Landscape"],
        modeltypes: ["Checkpoint", "LoRA"],
        checkpointtypes: ["Merged", "Trained"],
        modelfileformats: ["Safe Tensor", "ckpt"],
        modelresolutions: ["1024x1024", "512x512"],
        lyric_genres: [
          "Pop",
          "Hip-Hop",
          "R&B",
          "Rock",
          "Electronic",
          "House",
          "Techno",
          "Ambient",
          "Lo-Fi",
          "Jazz",
          "Blues",
          "Country",
          "Folk",
          "Classical",
          "Metal",
          "Reggae",
          "Soul",
          "Funk",
          "Trap",
          "Deep Tech House",
          "Middle Eastern",
          "World",
          "Latin",
          "Afrobeats",
          "Drum & Bass",
          "Dubstep",
        ],
        lyric_languages: [
          "English",
          "Spanish",
          "French",
          "German",
          "Japanese",
          "Korean",
          "Arabic",
        ],
        lyric_keyscales: [
          "C Major",
          "C Minor",
          "D Major",
          "D Minor",
          "E Major",
          "A Minor",
          "G Major",
        ],
        lyric_diffusionmodels: [
          "stable-audio-open-1.0",
          "audioldm2-music",
          "musicldm-base",
        ],
        lyric_diffusionmodelweightdtypes: ["fp32", "fp16", "bf16", "int8"],
        lyric_cliploaders: ["clip_l", "clip_g", "t5xxl"],
        lyric_cliploadertypes: ["sdxl", "sd3", "flux", "stable_audio"],
        lyric_samplernames: ["euler", "dpmpp_2m", "dpmpp_3m_sde", "ddim"],
        lyric_samplerschedulers: ["normal", "karras", "exponential", "simple"],
      };
    },
    resizeWindow: (min) =>
      console.log(`Window resize requested. Mini mode: ${min}`),
    restoreWindow: () => console.log("Restore window requested"),
    moveWindow: (dx, dy) => console.log(`Move window: ${dx}, ${dy}`),
    setResizable: (allow) => console.log(`Window resizable set to: ${allow}`),
    quitApp: () => console.log("App quit requested"),
    getUserConfig: async () => [],
    saveUserConfig: async (key, items) => {
      console.log("Mock saveUserConfig", key, items);
      return { success: true };
    },
    getAllUserConfigs: async () => ({}),
    listDriveFiles: async () => [],
    loadDriveFile: async () => ({}),
    saveDriveFile: async () => ({ success: true }),
    getApiInfo: async () => ({ running: false }),
    startApi: async (port) => ({ running: true, url: `http://127.0.0.1:${port || 5174}`, token: 'mock-token', port: port || 5174 }),
    stopApi: async () => ({ running: false }),
  };
}
