# Snap Prompts

## Sync your Stable Diffusion prompts across devices via Google Drive

* Features
* Installation
* Development
* Tech Stack

## 📖 About
Snap Prompts is a modern desktop application designed for AI artists and Stable Diffusion users. It solves the problem of scattered prompt libraries by providing a centralized, secure way to store, edit, and visualize your prompts.
Instead of relying on third-party servers, Snap Prompts uses your own Google Drive as the backend storage, ensuring you maintain full ownership and privacy of your data while keeping it synced across Windows.
* ✨ **Features**
* ☁️ **Google Drive Sync:** Automatically syncs your JSON library to a dedicated folder in your Google Drive. Work on your PC, switch to your laptop, and pick up right where you left off.
* 🎵 **Song Lyrics Mode:** Store and manage AI music generation workflows with a full 4-tab editor covering content, generation parameters, model config, and sampler settings.
* 🖼️ **Image Attachments:** Attach reference images (up to 1MB) directly to your prompts. Images are encoded and stored securely within your library.
* 🎈 **Floating Mini-Mode:** Switch to a compact, floating bubble mode (similar to chat heads) to keep your prompts accessible while working in other apps.
* 🔒 **Privacy First:** Direct connection to Google APIs. No intermediate servers or data harvesting.
* 🎨 **Modern UI:** built with a beautiful, dark-themed interface using Tailwind CSS and Lucide icons.
* ⚡ **Hot-Reloading:** Instant updates to your library.
* 📥 Installation


## 🆕 What's New in v1.2.0 — Song Lyrics Mode

Version 1.2.0 introduces a dedicated **Song Lyrics** mode alongside the existing Image Prompts library, bringing full AI music generation workflow support to Snap Prompt.

### 🎵 Song Lyrics Mode
- A new **Mode selector** in the toolbar switches between `🖼 Images` and `🎵 Songs`, keeping the two libraries completely separate
- Song cards display the **Genre badge**, **tag pills**, and a **prompt preview**
- **Group By** is now mode-aware — Songs can be grouped by Genre, Key / Scale, Model, or Favourite; Images retain their original grouping options
- Switching modes automatically resets the active group to prevent stale field mismatches
  
## 🆕 What's New in v1.3.0 — Custom Config Sync

Version 1.3.0 extends Google Drive sync beyond the prompt library, letting you pull in and merge your own custom config files from Drive.

### ⚙️ Custom Config Sync
- **Google Drive sync** now supports **custom config files**, in addition to your prompt library
- A new **Drive source file picker** lets you tick individual files to merge their fields into the app — **ticked files are editable**
- Editing a field that isn't covered by a ticked file and saving it will **create a new `Custom_*filename*` file** to hold that change
- **Custom Options editor** shows a **●** indicator next to any field that's currently covered by a ticked file
- **Song editor** gains a new **Notes tab** for jotting down extra context alongside your lyrics workflow
- **Floating profile bubble** window mode, extending the existing Floating Mini-Mode to profile management
- Fixed a bug where **dragging didn't work while the program was minimized**

**Custom file naming rules:**
- Must follow the format `example-example.json` — the hyphen (`-`) is required
- Must **not** be prefixed with `Custom_`
- Must **not** be named `snap-prompts.json`
- Only one file can define a given field at a time

**Example** — a custom file can define multiple fields at once, but each field can only be covered by one ticked file:
```json
// my-file.json
{
  "basemodels": ["pear", "apple", "orange", "brown", "hill"],
  "schedulers": ["pear", "apple", "red", "green"]
}
```

Any field defined this way will show the **●** indicator in the Custom Options editor to show it's coming from a Drive file. Remember: only one ticked file can define a given field at a time — if two ticked files both try to define `basemodels`, that's a conflict.

## Supported Platforms
* **Windows:** Windows 10/11 (.exe)
* **macOS: 10.13+ (.dmg)
* **Linux: AppImage (.AppImage)

🛠️ **Development**

* Git: **https://github.com/NovaFemme/Snap-Prompt/tree/main**
* 
* If you want to build the app from source or contribute, follow these steps:
**Prerequisites**
* Node.js (v16 or higher)
* npm or yarn
* A Google Cloud Project with Drive API enabled (for .env configuration)

**Setup:**
* Clone the repository
* **git clone https://github.com/NovaFemme/Snap-Prompt.git**
* cd snap-prompts

**Install dependencies**
* npm install


**Configure Environment Variables**
* Create a .env file in the root directory and add your Google API credentials:
* GOOGLE_CLIENT_ID=your_client_id
* GOOGLE_CLIENT_SECRET=your_client_secret


**Run Locally**
* Start the React development server and Electron wrapper simultaneously:
* npm run electron:dev


**Building the Installer**
**To package the application for distribution:**

# This will build the installer for your current OS
* npm run dist


* The output files will be located in the dist folder.

🏗️ **Tech Stack**

* Core: Electron (v28)
* Frontend: React (v18)
* Styling: Tailwind CSS
* Icons: Lucide React
* Auth & Storage: Google OAuth2 & Google Drive API v3
* Build Tool: Electron Builder

📄 **License**
## Distributed under the MIT License. See LICENSE for more information.
**Built with ❤️ for the AI Art Community**

# **Privacy Policy for Snap Prompt**

1. Data Storage Snap Prompt does not store your personal data, prompts, or images on its own servers. All data is stored locally on your device **(snap-prompts.json)** and synchronized directly to your personal Google Drive in the **"Snap Prompt"** folder.

2. Google Drive API Usage Snap Prompt uses the Google Drive API for the sole purpose of:
* **Creating a folder named "Snap Prompt.**
* **Uploading your local snap-prompts.json file to that folder.**
* **Downloading that file to sync your data across your devices.**

3. Data Sharing We do not view, harvest, or share your data with third parties. 

* **Your data remains strictly between your local device and your Google Drive account.**

### Grab the latest installer for your operating system from the Releases Page.
* [https://github.com/NovaFemme/Snap-Prompt/releases/tag/snap-prompt](https://github.com/NovaFemme/Snap-Prompt/releases)

<img width="509" height="882" alt="snap_prompt (1)" src="https://github.com/user-attachments/assets/2da940e3-8c81-4bd4-bfb8-35a812674ec8" />

<img width="453" height="842" alt="snap_prompt (2)" src="https://github.com/user-attachments/assets/3fe2c3c9-39a5-4f23-ad12-dfd9a9cb1592" />

<img width="446" height="844" alt="snap_prompt (3)" src="https://github.com/user-attachments/assets/14cdc0cd-2919-4e5c-9ce2-a393a0316ec5" />

<img width="477" height="841" alt="snap_prompt (4)" src="https://github.com/user-attachments/assets/56908ea5-9d9d-4082-9bff-6724e61d8c33" />




