const { app, BrowserWindow, ipcMain, screen, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');
const querystring = require('querystring');

// --- 1. CONFIGURATION & PATH FIXES ---

// UNIVERSAL PATH LOGIC
// In Dev: __dirname is /electron. .env is in parent (/). Result: /electron/../.env
// In Prod: __dirname is /resources/app.asar/electron. .env is in /resources/app.asar/.env. Result: /electron/../.env
const envPath = path.resolve(__dirname, '../.env');

require('dotenv').config({ path: envPath });

const USER_DATA_PATH = app.getPath('userData');
const DATA_FILE = path.join(USER_DATA_PATH, 'snap-prompts.json');
const TOKEN_FILE = path.join(USER_DATA_PATH, 'auth-tokens.json'); 
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


// Remove 'async' keyword since we use readFileSync (synchronous)
function loadJSON(filename) {
  try {
    const filePath = path.join(__dirname, '..', 'src', 'items', filename);
    
    // Read and parse
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(rawData);
    
    // Safety check
    if (!Array.isArray(parsedData)) return [];

    // SMART MAPPING: Works for both Strings and Objects
    return parsedData.map(item => {
      // 1. If it is already a string (e.g. "SDXL 1.0"), just return it
      if (typeof item === 'string') return item;
      
      // 2. If it is an object, try to find 'label' or 'name'
      return item.label || item.name || "Unknown"; 
    }).filter(Boolean);

  } catch (err) {
    // console.error(`Error loading ${filename}:`, err.message);
    return []; // Return empty array on failure
  }
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
    resizable: false, // Locked as requested
    alwaysOnTop: true,
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
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.file',
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

ipcMain.on('resize-window', (e, isMin) => {
    if (!mainWindow) return;
    if (isMin) {
        mainWindow.setSize(100, 100, true);
        mainWindow.setResizable(false); // Ensure locked
    } else {
        mainWindow.setSize(400, 800, true);
        mainWindow.setResizable(false); // Ensure locked
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
  const schedulers = loadJSON('schedulers.json');
  const modelresolutions = loadJSON('modelresolutions.json');

  const valo = {
    basemodels,
    samplers,
    categories,
    checkpointtypes,
    modelfileformats,
    modeltypes,
    schedulers,
    modelresolutions
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
    modelresolutions
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