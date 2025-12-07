# Snap Prompts

## Sync your Stable Diffusion prompts across devices via Google Drive

* Features
* Installation
* Development
* Tech Stack

## 📖 About
Snap Prompts is a modern desktop application designed for AI artists and Stable Diffusion users. It solves the problem of scattered prompt libraries by providing a centralized, secure way to store, edit, and visualize your prompts.
Instead of relying on third-party servers, Snap Prompts uses your own Google Drive as the backend storage, ensuring you maintain full ownership and privacy of your data while keeping it synced across Windows, macOS, and Linux.
* ✨ **Features**
* ☁️ **Google Drive Sync:** Automatically syncs your JSON library to a dedicated folder in your Google Drive. Work on your PC, switch to your laptop, and pick up right where you left off.
* 🖼️ **Image Attachments:** Attach reference images (up to 1MB) directly to your prompts. Images are encoded and stored securely within your library.
* 🎈 **Floating Mini-Mode:** Switch to a compact, floating bubble mode (similar to chat heads) to keep your prompts accessible while working in other apps.
* 🔒 **Privacy First:** Direct connection to Google APIs. No intermediate servers or data harvesting.
* 🎨 **Modern UI:** built with a beautiful, dark-themed interface using Tailwind CSS and Lucide icons.
* ⚡ **Hot-Reloading:** Instant updates to your library.
* 📥 Installation

### Grab the latest installer for your operating system from the Releases Page.
* https://github.com/NovaFemme/Snap-Prompt/releases/tag/snap-prompt
  
<img width="976" height="843" alt="1" src="https://github.com/user-attachments/assets/a0a4ab4d-dc94-40b8-8355-9ab0ca551d07" />

<img width="810" height="916" alt="2" src="https://github.com/user-attachments/assets/4f9962e5-5237-4ceb-bc4a-97ad844fc410" />

<img width="1611" height="977" alt="3" src="https://github.com/user-attachments/assets/593847a0-b785-466d-8206-f35bd6f0bf57" />

<img width="976" height="810" alt="5" src="https://github.com/user-attachments/assets/0f94a6bb-5592-4fdc-b027-5be54e5e19f6" />

<img width="969" height="828" alt="6" src="https://github.com/user-attachments/assets/28421d1b-365b-4397-b117-15f9f4933cc8" />

<img width="1165" height="898" alt="7" src="https://github.com/user-attachments/assets/2b5ed57d-201e-4644-a8bb-ba9cabe6c70b" />

<img width="708" height="894" alt="8" src="https://github.com/user-attachments/assets/c2b3d077-147e-42be-8f7b-8c17a7e22405" />

<img width="726" height="671" alt="9" src="https://github.com/user-attachments/assets/4882b453-bb52-419c-b297-9883287b7f79" />

### Supported Platforms

**Windows:** Windows 10/11 (.exe)
**macOS:** 10.13+ (.dmg)
**Linux:** AppImage (.AppImage)

🛠️ **Development**

* If you want to build the app from source or contribute, follow these steps:
**Prerequisites**

* Node.js (v16 or higher)
* npm or yarn
* A Google Cloud Project with Drive API enabled (for .env configuration)
**Setup:**
Clone the repository
git clone https://github.com/NovaFemme/Snap-Prompt.git
cd snap-prompts

**Install dependencies**
npm install


**Configure Environment Variables**
Create a .env file in the root directory and add your Google API credentials:
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret


**Run Locally**
Start the React development server and Electron wrapper simultaneously:
npm run electron:dev


**Building the Installer**
To package the application for distribution:

# This will build the installer for your current OS
npm run dist


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





