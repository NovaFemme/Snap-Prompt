import React, { useState } from "react";
import {
  Save,
  AlertCircle,
  Check,
  ArrowLeft,
  Sliders,
  FileText,
  Ban,
  MessageSquare,
  Copy,
  Clipboard,
  Music,
  Tag,
  Mic2,
} from "lucide-react";

const SongEditor = ({
  songFormData,
  setSongFormData,
  configs,
  isSaving,
  errorMsg,
  setErrorMsg,
  onSave,
  onBackOrCancel,
}) => {
  const [songEditorView, setSongEditorView] = useState("content");

  const handleCopy = (text) => {
    if (text) navigator.clipboard.writeText(text);
  };

  const handlePaste = async (field) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setSongFormData((prev) => ({ ...prev, [field]: text }));
    } catch (err) {
      console.error("Paste failed", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-[#333] bg-[#1a1a1a]">
        <button
          onClick={() => setSongEditorView("content")}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${songEditorView === "content" ? "text-purple-400 bg-[#222] border-b-2 border-purple-500" : "text-gray-500 hover:bg-[#222]"}`}
        >
          <Mic2 size={12} /> Content
        </button>
        <button
          onClick={() => setSongEditorView("generation")}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${songEditorView === "generation" ? "text-purple-400 bg-[#222] border-b-2 border-purple-500" : "text-gray-500 hover:bg-[#222]"}`}
        >
          <Sliders size={12} /> Generation
        </button>
        <button
          onClick={() => setSongEditorView("model")}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${songEditorView === "model" ? "text-purple-400 bg-[#222] border-b-2 border-purple-500" : "text-gray-500 hover:bg-[#222]"}`}
        >
          <FileText size={12} /> Model
        </button>
        <button
          onClick={() => setSongEditorView("sampler")}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${songEditorView === "sampler" ? "text-purple-400 bg-[#222] border-b-2 border-purple-500" : "text-gray-500 hover:bg-[#222]"}`}
        >
          <Music size={12} /> Sampler
        </button>
        <button
          onClick={() => setSongEditorView("notes")}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${songEditorView === "notes" ? "text-purple-400 bg-[#222] border-b-2 border-purple-500" : "text-gray-500 hover:bg-[#222]"}`}
        >
          <MessageSquare size={12} /> Notes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {errorMsg && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-3 py-2 rounded text-sm flex items-center gap-2 animate-pulse">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* TAB 01 — CONTENT */}
        {songEditorView === "content" && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={songFormData.title}
                onChange={(e) => {
                  setErrorMsg("");
                  setSongFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }));
                }}
                className="w-full bg-[#1a1a1a] border border-[#333] focus:border-purple-500 rounded p-2 text-white outline-none transition"
                placeholder="e.g. Midnight Drift"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Genre
              </label>
              <select
                value={songFormData.genre || ""}
                onChange={(e) =>
                  setSongFormData((prev) => ({
                    ...prev,
                    genre: e.target.value,
                  }))
                }
                className="w-full bg-[#1a1a1a] border border-[#333] focus:border-purple-500 rounded p-2 text-sm text-gray-300 outline-none transition"
              >
                <option value="">-- Select Genre --</option>
                {(configs.lyric_genres || []).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Prompt
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(songFormData.prompt)}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Copy"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => handlePaste("prompt")}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Paste"
                  >
                    <Clipboard size={12} />
                  </button>
                </div>
              </div>
              <textarea
                value={songFormData.prompt}
                onChange={(e) =>
                  setSongFormData((prev) => ({
                    ...prev,
                    prompt: e.target.value,
                  }))
                }
                className="w-full h-24 bg-[#1a1a1a] border border-[#333] focus:border-purple-500/50 rounded p-2 text-sm text-gray-200 outline-none resize-none font-mono"
                placeholder="Describe the song style, feel, or generation instructions..."
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-purple-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                  <Mic2 size={11} /> Lyrics
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(songFormData.lyrics)}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Copy"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => handlePaste("lyrics")}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Paste"
                  >
                    <Clipboard size={12} />
                  </button>
                </div>
              </div>
              <textarea
                value={songFormData.lyrics}
                onChange={(e) =>
                  setSongFormData((prev) => ({
                    ...prev,
                    lyrics: e.target.value,
                  }))
                }
                className="w-full h-40 bg-[#1a1a1a] border border-[#333] focus:border-purple-500/50 rounded p-2 text-sm text-gray-200 outline-none resize-none font-mono"
                placeholder={
                  "[Verse 1]\nWrite your lyrics here...\n\n[Chorus]\n..."
                }
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                  <Tag size={11} /> Tags
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(songFormData.tags)}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Copy"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => handlePaste("tags")}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Paste"
                  >
                    <Clipboard size={12} />
                  </button>
                </div>
              </div>
              <textarea
                value={songFormData.tags}
                onChange={(e) =>
                  setSongFormData((prev) => ({
                    ...prev,
                    tags: e.target.value,
                  }))
                }
                className="w-full h-20 bg-[#1a1a1a] border border-[#333] focus:border-purple-500/50 rounded p-2 text-sm text-gray-300 outline-none resize-none font-mono"
                placeholder={
                  "dark, cinematic, upbeat, lo-fi\ninstrumental, 808 bass, oud"
                }
              />
            </div>
          </>
        )}

        {/* TAB 02 — GENERATION */}
        {songEditorView === "generation" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Duration (sec)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={songFormData.duration}
                  onChange={(e) =>
                    setSongFormData((p) => ({
                      ...p,
                      duration: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  BPM
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={songFormData.bpm}
                  onChange={(e) =>
                    setSongFormData((p) => ({
                      ...p,
                      bpm: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Time Signature
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={songFormData.timeSignature}
                  onChange={(e) =>
                    setSongFormData((p) => ({
                      ...p,
                      timeSignature: parseInt(e.target.value) || 4,
                    }))
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Language
                </label>
                <select
                  value={songFormData.language}
                  onChange={(e) =>
                    setSongFormData((p) => ({
                      ...p,
                      language: e.target.value,
                    }))
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
                >
                  <option value="">-- Select --</option>
                  {(configs.lyric_languages || []).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Key / Scale
                </label>
                <select
                  value={songFormData.keyscale}
                  onChange={(e) =>
                    setSongFormData((p) => ({
                      ...p,
                      keyscale: e.target.value,
                    }))
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
                >
                  <option value="">-- Select --</option>
                  {(configs.lyric_keyscales || []).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-[#2a2a2a] pt-3 space-y-3">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">
                Sampling Parameters
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  CFG Scale: {songFormData.cfgScale.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.1"
                  value={songFormData.cfgScale}
                  onChange={(e) =>
                    setSongFormData((p) => ({
                      ...p,
                      cfgScale: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Temperature: {songFormData.temperature.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={songFormData.temperature}
                  onChange={(e) =>
                    setSongFormData((p) => ({
                      ...p,
                      temperature: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Top P: {songFormData.topP.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={songFormData.topP}
                  onChange={(e) =>
                    setSongFormData((p) => ({
                      ...p,
                      topP: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Top K
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={songFormData.topK}
                    onChange={(e) =>
                      setSongFormData((p) => ({
                        ...p,
                        topK: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Min P
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={songFormData.minP}
                    onChange={(e) =>
                      setSongFormData((p) => ({
                        ...p,
                        minP: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 03 — MODEL */}
        {songEditorView === "model" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Diffusion Model
              </label>
              <select
                value={songFormData.diffusionModel}
                onChange={(e) =>
                  setSongFormData((p) => ({
                    ...p,
                    diffusionModel: e.target.value,
                  }))
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
              >
                <option value="">-- Select --</option>
                {(configs.lyric_diffusionmodels || []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Model Weight DType
              </label>
              <select
                value={songFormData.diffusionModelWeightDtype}
                onChange={(e) =>
                  setSongFormData((p) => ({
                    ...p,
                    diffusionModelWeightDtype: e.target.value,
                  }))
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
              >
                <option value="">-- Select --</option>
                {(configs.lyric_diffusionmodelweightdtypes || []).map(
                  (d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Clip Loader 01
              </label>
              <select
                value={songFormData.clipLoader01}
                onChange={(e) =>
                  setSongFormData((p) => ({
                    ...p,
                    clipLoader01: e.target.value,
                  }))
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
              >
                <option value="">-- Select --</option>
                {(configs.lyric_cliploaders || []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Clip Loader 02
              </label>
              <select
                value={songFormData.clipLoader02}
                onChange={(e) =>
                  setSongFormData((p) => ({
                    ...p,
                    clipLoader02: e.target.value,
                  }))
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
              >
                <option value="">-- Select --</option>
                {(configs.lyric_cliploaders || []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Clip Loader Type
              </label>
              <select
                value={songFormData.clipLoaderType}
                onChange={(e) =>
                  setSongFormData((p) => ({
                    ...p,
                    clipLoaderType: e.target.value,
                  }))
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
              >
                <option value="">-- Select --</option>
                {(configs.lyric_cliploadertypes || []).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Seed
                </label>
                <input
                  type="number"
                  step="1"
                  value={songFormData.seed}
                  onChange={(e) =>
                    setSongFormData((p) => ({
                      ...p,
                      seed: parseInt(e.target.value),
                    }))
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Model Shift
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={songFormData.modelShift}
                  onChange={(e) =>
                    setSongFormData((p) => ({
                      ...p,
                      modelShift: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 04 — SAMPLER */}
        {songEditorView === "sampler" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Sampler Steps: {songFormData.samplerSteps}
              </label>
              <input
                type="range"
                min="1"
                max="150"
                step="1"
                value={songFormData.samplerSteps}
                onChange={(e) =>
                  setSongFormData((p) => ({
                    ...p,
                    samplerSteps: parseInt(e.target.value),
                  }))
                }
                className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>1</span>
                <span>75</span>
                <span>150</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Sampler CFG: {songFormData.samplerCfg.toFixed(1)}
              </label>
              <input
                type="range"
                min="1"
                max="30"
                step="0.1"
                value={songFormData.samplerCfg}
                onChange={(e) =>
                  setSongFormData((p) => ({
                    ...p,
                    samplerCfg: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>1</span>
                <span>15</span>
                <span>30</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Sampler Denoise: {songFormData.samplerDenoise.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={songFormData.samplerDenoise}
                onChange={(e) =>
                  setSongFormData((p) => ({
                    ...p,
                    samplerDenoise: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>0.00</span>
                <span>0.50</span>
                <span>1.00</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Sampler Name
              </label>
              <select
                value={songFormData.samplerName}
                onChange={(e) =>
                  setSongFormData((p) => ({
                    ...p,
                    samplerName: e.target.value,
                  }))
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
              >
                <option value="">-- Select --</option>
                {(configs.lyric_samplernames || []).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Sampler Scheduler
              </label>
              <select
                value={songFormData.samplerScheduler}
                onChange={(e) =>
                  setSongFormData((p) => ({
                    ...p,
                    samplerScheduler: e.target.value,
                  }))
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-purple-500"
              >
                <option value="">-- Select --</option>
                {(configs.lyric_samplerschedulers || []).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {songEditorView === "notes" && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
              Personal Notes
            </label>
            <textarea
              value={songFormData.comment}
              onChange={(e) =>
                setSongFormData((p) => ({
                  ...p,
                  comment: e.target.value,
                }))
              }
              className="w-full h-40 bg-[#1a1a1a] border border-[#333] focus:border-purple-500/50 rounded p-2 text-sm text-gray-400 outline-none resize-none"
              placeholder="Add your thoughts, tags, or context here..."
            />
          </div>
        )}
      </div>

      <div className="p-4 bg-[#1a1a1a]/95 backdrop-blur border-t border-[#333] flex gap-3">
        <button
          onClick={onBackOrCancel}
          className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 ${!songFormData.id ? "bg-red-900/20 text-red-400 hover:bg-red-900/40" : "bg-[#333] hover:bg-[#444] text-gray-200"}`}
        >
          {!songFormData.id ? <Ban size={18} /> : <ArrowLeft size={18} />}{" "}
          {!songFormData.id ? "Cancel" : "Back"}
        </button>
        <button
          onClick={() => onSave(false)}
          disabled={isSaving}
          className={`flex-1 ${isSaving ? "bg-green-600" : "bg-purple-600 hover:bg-purple-500"} text-white py-2 rounded-lg font-bold shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2`}
        >
          {isSaving ? <Check size={18} /> : <Save size={18} />}{" "}
          {isSaving ? "Saved!" : "Save Song"}
        </button>
      </div>
    </div>
  );
};

export default SongEditor;
