import React, { useState, useEffect } from 'react';
import { Loader2, Copy, Check, Radio, RadioTower } from 'lucide-react';

const ApiPanel = () => {
  const [open, setOpen] = useState(false);
  const [apiInfo, setApiInfo] = useState({ running: false });
  const [port, setPort] = useState(5174);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    window.electron?.getApiInfo().then(setApiInfo);
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    if (apiInfo.running) {
      const result = await window.electron?.stopApi();
      setApiInfo(result);
    } else {
      const result = await window.electron?.startApi(port);
      setApiInfo(result);
    }
    setLoading(false);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="border-t border-[#333] bg-[#1a1a1a] flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-300 hover:bg-[#222] transition"
      >
        <span className="flex items-center gap-1.5">
          <RadioTower size={12} />
          Local API
          {apiInfo.running && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          )}
        </span>
        <span className="text-[10px]">{open ? '▼' : '▶'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {apiInfo.running && (
            <>
              <div className="flex items-center gap-1">
                <span className="flex-1 text-[10px] text-green-400 font-mono truncate bg-[#111] border border-[#333] rounded px-2 py-1">
                  {apiInfo.url}
                </span>
                <button
                  onClick={() => handleCopy(apiInfo.url, 'url')}
                  className="flex-shrink-0 p-1.5 text-gray-500 hover:text-gray-200 hover:bg-[#333] rounded transition"
                  title="Copy URL"
                >
                  {copied === 'url' ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <span className="flex-1 text-[10px] text-yellow-600 font-mono truncate bg-[#111] border border-[#333] rounded px-2 py-1">
                  {apiInfo.token}
                </span>
                <button
                  onClick={() => handleCopy(apiInfo.token, 'token')}
                  className="flex-shrink-0 p-1.5 text-gray-500 hover:text-gray-200 hover:bg-[#333] rounded transition"
                  title="Copy token"
                >
                  {copied === 'token' ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                </button>
              </div>
            </>
          )}

          {!apiInfo.running && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-600">Port</span>
              <input
                type="number"
                value={port}
                onChange={e => setPort(Number(e.target.value))}
                className="w-20 bg-[#111] border border-[#333] text-gray-300 text-xs rounded px-2 py-1 outline-none focus:border-green-500"
                min={1024}
                max={65535}
              />
            </div>
          )}

          <button
            onClick={handleToggle}
            disabled={loading}
            className={`w-full py-1.5 text-xs font-bold rounded transition flex items-center justify-center gap-1.5 disabled:opacity-50 ${
              apiInfo.running
                ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/40'
                : 'bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-900/40'
            }`}
          >
            {loading
              ? <Loader2 size={11} className="animate-spin" />
              : <Radio size={11} />}
            {loading ? 'Please wait...' : apiInfo.running ? 'Stop API' : 'Start API'}
          </button>

          {apiInfo.running && (
            <p className="text-[9px] text-gray-700 text-center">
              GET /api/prompts · /api/config · /api/health
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiPanel;
