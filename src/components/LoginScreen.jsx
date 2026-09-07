import React from "react";
import { X, Lock } from "lucide-react";
import appIcon from "../icon.png";

const LoginScreen = ({ onLogin }) => (
  <div className="flex flex-col h-full bg-[#121212] relative animate-in fade-in duration-500">
    <div className="absolute top-0 w-full h-12 flex items-center justify-end px-4 z-20 drag-handle">
      <div className="flex gap-2 no-drag">
        <button
          onClick={() => window.electron.quitApp()}
          className="p-1 hover:bg-red-900/50 hover:text-red-400 rounded text-gray-400 transition"
        >
          <X size={16} />
        </button>
      </div>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative w-24 h-24 bg-[#1e1e1e] rounded-xl flex items-center justify-center shadow-2xl border border-[#333] overflow-hidden">
          <img
            src={appIcon}
            alt="Snap Prompt Icon"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Snap Prompt
        </h1>
        <p className="text-gray-500 text-sm max-w-[240px] mx-auto leading-relaxed">
          Sync your Stable Diffusion prompts across all your devices with Google
          Drive.
        </p>
      </div>

      <button
        onClick={onLogin}
        className="group relative flex items-center gap-3 bg-white text-gray-900 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
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

export default LoginScreen;
