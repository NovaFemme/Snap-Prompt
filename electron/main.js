const { app, BrowserWindow, ipcMain, screen, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const dotenv = require('dotenv');

// --- 1. CONFIGURATION & PATH FIXES ---

// UNIVERSAL PATH LOGIC
// In Dev: __dirname is /electron. .env is in parent (/). Result: /electron/../.env
// In Prod: __dirname is /resources/app.asar/electron. .env is in /resources/app.asar/.env. Result: /electron/../.env
const envPath = app.isPackaged 
    ? path.join(process.resourcesPath, '.env') 
    : path.join(__dirname, '../.env');

// 2. Load the config
dotenv.config({ path: envPath });
//require('dotenv').config({ path: envPath });

// Debugging (Optional: logs to command line if you run from terminal)
console.log(`Looking for .env at: ${envPath}`);
console.log(`Loaded Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'YES' : 'NO'}`);

const USER_DATA_PATH = app.getPath('userData');
const DATA_FILE = path.join(USER_DATA_PATH, 'snap-prompts.json');
const TOKEN_FILE = path.join(USER_DATA_PATH, 'auth-tokens.json');
const USER_CONFIGS_FILE = path.join(USER_DATA_PATH, 'user-configs.json');
const REDIRECT_PORT = 5000;
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/callback`;

// Google Endpoints
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

// Global state
let authTokens = null;
let userProfile = null;
let driveFolderId = null;
let mainWindow;


function parseItems(data) {
  if (!Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'string') return item;
    return item.label || item.name || 'Unknown';
  }).filter(Boolean);
}

function loadUserConfigs() {
  if (!fs.existsSync(USER_CONFIGS_FILE)) return {};
  return safeJSONParse(fs.readFileSync(USER_CONFIGS_FILE, 'utf-8'), {});
}

function saveUserConfigs(configs) {
  fs.writeFileSync(USER_CONFIGS_FILE, JSON.stringify(configs, null, 2));
}

function loadJSON(filename) {
  const key = filename.replace('.json', '');

  // Load bundled defaults
  let bundled = [];
  try {
    const filePath = path.join(__dirname, '..', 'src', 'items', filename);
    bundled = parseItems(safeJSONParse(fs.readFileSync(filePath, 'utf-8'), []));
  } catch (err) {}

  // Load user custom items for this key
  const userConfigs = loadUserConfigs();
  const userItems = Array.isArray(userConfigs[key]) ? userConfigs[key] : [];

  // Merge: bundled first, then any user items not already present
  const seen = new Set(bundled);
  const merged = [...bundled];
  for (const item of userItems) {
    if (!seen.has(item)) merged.push(item);
  }
  return merged;
}

// --- UTILS ---
function safeJSONParse(data, fallback = null) {
  try { return JSON.parse(data); } catch { return fallback; }
}

function loadTokens() {
  if (fs.existsSync(TOKEN_FILE)) {
    authTokens = safeJSONParse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
  }
}

function saveTokens(tokens) {
  authTokens = { ...authTokens, ...tokens }; 
  if (tokens.expires_in) {
      authTokens.expiry_date = Date.now() + (tokens.expires_in * 1000); 
  }
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(authTokens, null, 2));
}

// --- WINDOW MANAGEMENT ---
function createWindow() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: 400,
    height: 800,
    x: width - 450,
    y: 100,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const startUrl = process.env.NODE_ENV === 'development' || !app.isPackaged
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (!app.isPackaged) mainWindow.webContents.openDevTools({ mode: 'detach' });

  // --- STARTUP CONFIG CHECK ---
  // If keys are missing, alert the user immediately so they don't wait for a login failure.
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      // Small delay to ensure window is ready to show dialog
      setTimeout(() => {
          dialog.showErrorBox(
              "Startup Error: Missing Config",
              `Could not load Google API keys.\n\nLooking for .env at:\n${envPath}\n\nClient ID found: ${process.env.GOOGLE_CLIENT_ID ? "Yes" : "NO"}`
          );
      }, 1000);
  }
}

app.whenReady().then(() => {
  loadTokens(); 
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- GOOGLE API HELPERS ---

async function getValidAccessToken() {
  if (!authTokens || !authTokens.refresh_token) throw new Error("No refresh token available");

  // If token is valid for at least another 5 minutes, use it
  if (authTokens.expiry_date && Date.now() < authTokens.expiry_date - (5 * 60 * 1000)) {
    return authTokens.access_token;
  }

  console.log("Refreshing Access Token...");
  // Check for credentials before refreshing
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error("Missing Google Credentials in .env file.");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: querystring.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: authTokens.refresh_token,
      grant_type: 'refresh_token'
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error_description || data.error);
  
  saveTokens(data); 
  return data.access_token;
}

async function googleRequest(endpoint, options = {}) {
  const token = await getValidAccessToken();
  const headers = { 
    'Authorization': `Bearer ${token}`, 
    'Content-Type': 'application/json',
    ...options.headers 
  };
  
  const response = await fetch(endpoint, { ...options, headers });
  const text = await response.text();
  return safeJSONParse(text, text); 
}

async function ensureDriveFolder() {
  if (driveFolderId) return driveFolderId;

  const query = "mimeType='application/vnd.google-apps.folder' and name='Snap Prompt' and 'root' in parents and trashed=false";
  const searchRes = await googleRequest(`${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}`);

  if (searchRes.files && searchRes.files.length > 0) {
    driveFolderId = searchRes.files[0].id;
  } else {
    const createRes = await googleRequest(`${DRIVE_API_URL}/files`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Snap Prompt', mimeType: 'application/vnd.google-apps.folder' })
    });
    driveFolderId = createRes.id;
  }
  return driveFolderId;
}

async function syncCustomConfigToDrive(key, items) {
  if (!authTokens) return;
  try {
    const folderId = await ensureDriveFolder();
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    const fileName = `Custom_${label}.json`;
    const fileContent = JSON.stringify(items, null, 2);

    const query = `name='${fileName}' and '${folderId}' in parents and trashed=false`;
    const searchRes = await googleRequest(`${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id)`);

    let fileId = null;
    if (searchRes.files && searchRes.files.length > 0) fileId = searchRes.files[0].id;

    const boundary = '-------314159265358979323846';
    const metadata = { name: fileName, parents: fileId ? [] : [folderId] };
    const body = `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${fileContent}\r\n--${boundary}--`;

    const uploadEndpoint = fileId
      ? `${DRIVE_UPLOAD_URL}/files/${fileId}?uploadType=multipart`
      : `${DRIVE_UPLOAD_URL}/files?uploadType=multipart`;

    await googleRequest(uploadEndpoint, {
      method: fileId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': `multipart/related; boundary="${boundary}"` },
      body,
    });
    console.log(`Synced ${fileName} to Drive`);
  } catch (err) {
    console.error(`Drive sync failed for ${key}:`, err);
  }
}

async function pullCustomConfigsFromDrive() {
  if (!authTokens) return;
  try {
    const folderId = await ensureDriveFolder();
    const query = `'${folderId}' in parents and name contains 'Custom_' and trashed=false`;
    const searchRes = await googleRequest(`${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`);

    if (!searchRes.files || searchRes.files.length === 0) return;

    const configs = loadUserConfigs();
    for (const file of searchRes.files) {
      const match = file.name.match(/^Custom_(.+)\.json$/i);
      if (!match) continue;
      const key = match[1].toLowerCase();
      const items = await googleRequest(`${DRIVE_API_URL}/files/${file.id}?alt=media`);
      if (Array.isArray(items)) configs[key] = items;
    }
    saveUserConfigs(configs);
    console.log('Custom configs pulled from Drive');
  } catch (err) {
    console.error('Pull custom configs failed:', err);
  }
}

async function syncToDrive() {
  try {
    const folderId = await ensureDriveFolder();
    if (!fs.existsSync(DATA_FILE)) return;
    
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');

    const query = `name='snap-prompts.json' and '${folderId}' in parents and trashed=false`;
    const searchRes = await googleRequest(`${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}`);

    let fileId = null;
    if (searchRes.files && searchRes.files.length > 0) fileId = searchRes.files[0].id;

    const boundary = '-------314159265358979323846';
    const metadata = { name: 'snap-prompts.json', parents: fileId ? [] : [folderId] };
    
    const body = `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${fileContent}\r\n--${boundary}--`;

    const uploadEndpoint = fileId 
      ? `${DRIVE_UPLOAD_URL}/files/${fileId}?uploadType=multipart`
      : `${DRIVE_UPLOAD_URL}/files?uploadType=multipart`;

    await googleRequest(uploadEndpoint, {
      method: fileId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': `multipart/related; boundary="${boundary}"` },
      body: body
    });
    
    console.log("Sync successful");
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

// --- AUTH HANDLER ---
ipcMain.handle('auth-login', async () => {
  // 1. Check for Credentials immediately
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      dialog.showErrorBox(
          "Configuration Error", 
          "Google API Credentials are missing.\nPlease check your .env file."
      );
      return null;
  }

  if (authTokens) {
    try {
      const profile = await googleRequest('https://www.googleapis.com/oauth2/v2/userinfo');
      userProfile = profile;
      await pullCustomConfigsFromDrive();
      syncToDrive();
      return { name: profile.name, email: profile.email, picture: profile.picture };
    } catch (e) {
      console.log("Saved token invalid, re-authenticating...");
    }
  }

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const parsedUrl = url.parse(req.url);
      const query = querystring.parse(parsedUrl.query);

      if (query.code) {
        res.end('<h1>Login successful! You can close this window.</h1><script>window.close()</script>');
        server.close();

        try {
          const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: querystring.stringify({
              code: query.code,
              client_id: process.env.GOOGLE_CLIENT_ID,
              client_secret: process.env.GOOGLE_CLIENT_SECRET,
              redirect_uri: REDIRECT_URI,
              grant_type: 'authorization_code'
            })
          });

          const tokens = await tokenRes.json();
          if (tokens.error) throw new Error(tokens.error_description || tokens.error);

          saveTokens(tokens); 

          const profile = await googleRequest('https://www.googleapis.com/oauth2/v2/userinfo');
          userProfile = profile;

          await pullCustomConfigsFromDrive();
          syncToDrive();
          resolve({ name: profile.name, email: profile.email, picture: profile.picture });

        } catch (err) {
          reject(err);
        }
      }
    });

    server.listen(REDIRECT_PORT, () => {
      const authUrl = `${GOOGLE_AUTH_URL}?` + querystring.stringify({
        access_type: 'offline', 
        prompt: 'consent',      
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive',
        response_type: 'code',
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: REDIRECT_URI
      });
      shell.openExternal(authUrl);
    });
  });
});

// --- DATA HANDLERS ---
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return safeJSONParse(fs.readFileSync(DATA_FILE, 'utf-8'), []);
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    if (authTokens) syncToDrive(); 
    return true;
  } catch (error) {
    console.error("Save error:", error);
    return false;
  }
}

// IPC Handlers
ipcMain.handle('auth-check', async () => userProfile); 

// NEW: LOGOUT HANDLER
ipcMain.handle('auth-logout', async () => {
    authTokens = null;
    userProfile = null;
    driveFolderId = null;
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            fs.unlinkSync(TOKEN_FILE);
        }
        return true;
    } catch (e) {
        console.error("Logout error:", e);
        return false;
    }
});

let bubbleWindow = null;

ipcMain.on('resize-window', (e, isMin) => {
    if (!mainWindow) return;
    if (isMin) {
        const [x, y] = mainWindow.getPosition();
        const picture = encodeURIComponent(userProfile?.picture || '');
        const name = encodeURIComponent(userProfile?.name || '');
        const base = (process.env.NODE_ENV === 'development' || !app.isPackaged)
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`;
        const bubbleUrl = `${base}?mode=bubble&picture=${picture}&name=${name}`;

        bubbleWindow = new BrowserWindow({
            width: 96,
            height: 96,
            x: x + 400 - 96,
            y,
            frame: false,
            transparent: true,
            backgroundColor: '#00000000',
            alwaysOnTop: true,
            hasShadow: false,
            resizable: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
            },
        });

        bubbleWindow.loadURL(bubbleUrl);
        bubbleWindow.on('closed', () => { bubbleWindow = null; });
        mainWindow.hide();
    } else {
        mainWindow.show();
        mainWindow.focus();
    }
});

ipcMain.on('restore-window', () => {
    if (bubbleWindow) { bubbleWindow.close(); bubbleWindow = null; }
    if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
});

ipcMain.on('move-window', (e, { dx, dy }) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if (!win) return;
    const [x, y] = win.getPosition();
    win.setPosition(x + Math.round(dx), y + Math.round(dy));
});

// --- USER CONFIG HANDLERS ---

ipcMain.handle('get-user-config', async (e, key) => {
  const userConfigs = loadUserConfigs();
  return Array.isArray(userConfigs[key]) ? userConfigs[key] : [];
});

ipcMain.handle('save-user-config', async (e, { key, userItems }) => {
  try {
    const configs = loadUserConfigs();
    configs[key] = userItems;
    saveUserConfigs(configs);
    syncCustomConfigToDrive(key, userItems); // fire-and-forget
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Returns all user configs (for Drive sync later)
ipcMain.handle('get-all-user-configs', async () => loadUserConfigs());

ipcMain.handle('list-drive-files', async () => {
  if (!authTokens) return [];
  try {
    const folderId = await ensureDriveFolder();
    const query = `'${folderId}' in parents and trashed=false`;
    const searchRes = await googleRequest(
      `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name)&orderBy=name`
    );
    if (!searchRes.files) return [];
    return searchRes.files.filter(f =>
      f.name.endsWith('.json') &&
      f.name !== 'snap-prompts.json' &&
      !f.name.startsWith('Custom_')
    );
  } catch (err) {
    console.error('List drive files failed:', err);
    return [];
  }
});

ipcMain.handle('load-drive-file', async (e, fileId) => {
  if (!authTokens) return {};
  try {
    const content = await googleRequest(`${DRIVE_API_URL}/files/${fileId}?alt=media`);
    if (content && typeof content === 'object') {
      if (content.error) {
        console.error('[Drive] load-drive-file API error:', JSON.stringify(content.error));
        return {};
      }
      return content;
    }
    return {};
  } catch (err) {
    console.error('Load drive file failed:', err);
    return {};
  }
});

ipcMain.handle('save-drive-file', async (e, { fileId, prompts }) => {
  if (!authTokens) return { success: false, error: 'Not authenticated' };
  try {
    const fileContent = JSON.stringify(prompts, null, 2);
    const boundary = '-------314159265358979323846';
    const body = `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({})}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${fileContent}\r\n--${boundary}--`;
    await googleRequest(`${DRIVE_UPLOAD_URL}/files/${fileId}?uploadType=multipart`, {
      method: 'PATCH',
      headers: { 'Content-Type': `multipart/related; boundary="${boundary}"` },
      body,
    });
    return { success: true };
  } catch (err) {
    console.error('Save drive file failed:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.on('quit-app', () => app.quit());
ipcMain.handle('list-prompts', async () => loadData().reverse());
ipcMain.handle('delete-prompt', async (e, id) => {
  let p = loadData().filter(i => i.id !== id);
  saveData(p);
  return { success: true };
});

ipcMain.handle('get-configs', async () => {
  // No 'await' needed here because loadJSON uses fs.readFileSync
  const basemodels = loadJSON('basemodels.json');
  const samplers = loadJSON('samplers.json');
  const categories = loadJSON('categories.json');
  const checkpointtypes = loadJSON('checkpointtypes.json');
  const modelfileformats = loadJSON('modelfileformats.json');
  const modeltypes = loadJSON('modeltypes.json');
  const modelresolutions = loadJSON('modelresolutions.json');
  const schedulers = loadJSON('schedulers.json');
  const lyric_languages = loadJSON('lyric_languages.json');
  const lyric_keyscales = loadJSON('lyric_keyscales.json');
  const lyric_diffusionmodels = loadJSON('lyric_diffusionmodels.json');
  const lyric_diffusionmodelweightdtypes = loadJSON('lyric_diffusionmodelweightdtypes.json');
  const lyric_cliploaders = loadJSON('lyric_cliploaders.json');
  const lyric_cliploadertypes = loadJSON('lyric_cliploadertypes.json');
  const lyric_samplernames = loadJSON('lyric_samplernames.json');
  const lyric_samplerschedulers = loadJSON('lyric_samplerschedulers.json');
  const lyric_genres = loadJSON('lyric_genres.json');

  const valo = {
    basemodels,
    samplers,
    categories,
    checkpointtypes,
    modelfileformats,
    modeltypes,
    schedulers,
    modelresolutions,
    lyric_languages,
    lyric_keyscales,
    lyric_diffusionmodels,
    lyric_diffusionmodelweightdtypes,
    lyric_cliploaders,
    lyric_cliploadertypes,
    lyric_samplernames,
    lyric_samplerschedulers,
    lyric_genres
  };
  
  // Return the data object directly
  return {
    basemodels,
    samplers,
    categories,
    checkpointtypes,
    modelfileformats,
    modeltypes,
    schedulers,
    modelresolutions,
    lyric_languages,
    lyric_keyscales,
    lyric_diffusionmodels,
    lyric_diffusionmodelweightdtypes,
    lyric_cliploaders,
    lyric_cliploadertypes,
    lyric_samplernames,
    lyric_samplerschedulers,
    lyric_genres
  };
});

// Helper: load from src/song-items/ folder
function loadSongJSON(filename) {
  try {
    const filePath = path.join(__dirname, '..', 'src', 'song-items', filename);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => {
      if (typeof item === 'string') return item;
      return item.label || item.name || 'Unknown';
    }).filter(Boolean);
  } catch (err) {
    return [];
  }
}

ipcMain.handle('get-song-configs', async () => {
  return {
    languages:                  loadSongJSON('languages.json'),
    keyscales:                  loadSongJSON('keyscales.json'),
    diffusionModels:            loadSongJSON('diffusion-models.json'),
    diffusionModelWeightDtypes: loadSongJSON('diffusion-model-weight-dtypes.json'),
    clipLoaders:                loadSongJSON('clip-loaders.json'),
    clipLoaderTypes:            loadSongJSON('clip-loader-types.json'),
    samplerNames:               loadSongJSON('sampler-names.json'),
    samplerSchedulers:          loadSongJSON('sampler-schedulers.json'),
  };
});


ipcMain.handle('save-prompt', async (event, promptData) => {
  try {
    const prompts = loadData();
    const cleanTitle = (promptData.title || "").trim();
    
    if (!cleanTitle) return { success: false, error: "Title required" };
    
    const conflict = prompts.find(p => p.title.trim().toLowerCase() === cleanTitle.toLowerCase() && p.id !== promptData.id);
    if (conflict) return { success: false, error: "Title exists" };

    if (promptData.id) {
      const idx = prompts.findIndex(p => p.id === promptData.id);
      if (idx !== -1) prompts[idx] = promptData;
      else prompts.push(promptData);
    } else {
      promptData.id = Date.now().toString();
      prompts.push(promptData);
    }

    saveData(prompts);
    return { success: true, id: promptData.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
});