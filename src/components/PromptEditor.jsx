import React, { useState } from "react";
import {
  Save,
  AlertCircle,
  Check,
  X,
  ArrowLeft,
  Sliders,
  FileText,
  Ban,
  Upload,
  MessageSquare,
  Copy,
  Clipboard,
} from "lucide-react";

const PromptEditor = ({
  formData,
  setFormData,
  configs,
  isSaving,
  errorMsg,
  onSave,
  onBackOrCancel,
  onTitleChange,
  onImageUpload,
}) => {
  const [editorView, setEditorView] = useState("prompt");
  const [previewImage, setPreviewImage] = useState(null);

  const handleCopy = (text) => {
    if (text) navigator.clipboard.writeText(text);
  };

  const handlePaste = async (field) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setFormData((prev) => ({ ...prev, [field]: text }));
    } catch (err) {
      console.error("Paste failed", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {previewImage && (
        <div
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-8 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-full max-h-full flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 bg-[#333] hover:bg-[#444] text-white p-2 rounded-full transition shadow-lg border border-[#555] z-50"
            >
              <X size={20} />
            </button>
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-[#333]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className="flex border-b border-[#333] bg-[#1a1a1a]">
        <button
          onClick={() => setEditorView("prompt")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${editorView === "prompt" ? "text-blue-400 bg-[#222] border-b-2 border-blue-500" : "text-gray-500 hover:bg-[#222]"}`}
        >
          <MessageSquare size={14} /> Prompt
        </button>
        <button
          onClick={() => setEditorView("settings")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${editorView === "settings" ? "text-blue-400 bg-[#222] border-b-2 border-blue-500" : "text-gray-500 hover:bg-[#222]"}`}
        >
          <Sliders size={14} /> Settings
        </button>
        <button
          onClick={() => setEditorView("notes")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${editorView === "notes" ? "text-blue-400 bg-[#222] border-b-2 border-blue-500" : "text-gray-500 hover:bg-[#222]"}`}
        >
          <FileText size={14} /> Notes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {errorMsg && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-3 py-2 rounded text-sm flex items-center gap-2 animate-pulse">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {editorView === "prompt" && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={onTitleChange}
                disabled={isSaving}
                className="w-full bg-[#1a1a1a] border border-[#333] focus:border-blue-500 rounded p-2 text-white outline-none transition disabled:opacity-50"
                placeholder="e.g. Cyberpunk City"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                Reference Image{" "}
                <span className="text-[10px] font-normal text-gray-600">
                  (Max 1MB)
                </span>
              </label>
              <div className="flex items-start gap-4">
                {formData.image ? (
                  <div className="relative group">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border border-[#333] shadow-lg cursor-zoom-in"
                      onClick={() => setPreviewImage(formData.image)}
                    />
                    <button
                      onClick={() =>
                        setFormData({ ...formData, image: "" })
                      }
                      className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-md hover:bg-red-500 transition scale-90 hover:scale-110"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 border border-dashed border-[#444] rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-[#1f1f1f] cursor-pointer transition">
                    <Upload size={20} />{" "}
                    <span className="text-[10px] mt-1 font-bold">
                      UPLOAD
                    </span>{" "}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onImageUpload}
                    />
                  </label>
                )}
                <div className="text-xs text-gray-500 mt-2 flex-1">
                  {formData.image
                    ? "Image attached. It will be saved with your prompt."
                    : "Attach a reference image to this prompt."}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 text-green-500">
                  Positive Prompt
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(formData.positive)}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Copy"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => handlePaste("positive")}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Paste"
                  >
                    <Clipboard size={12} />
                  </button>
                </div>
              </div>
              <textarea
                value={formData.positive}
                onChange={(e) =>
                  setFormData({ ...formData, positive: e.target.value })
                }
                disabled={isSaving}
                className="w-full h-32 bg-[#1a1a1a] border border-[#333] focus:border-green-500/50 rounded p-2 text-sm text-gray-200 outline-none resize-none font-mono disabled:opacity-50"
                placeholder="What do you want to see?"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 text-red-400">
                  Negative Prompt
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(formData.negative)}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Copy"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => handlePaste("negative")}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Paste"
                  >
                    <Clipboard size={12} />
                  </button>
                </div>
              </div>
              <textarea
                value={formData.negative}
                onChange={(e) =>
                  setFormData({ ...formData, negative: e.target.value })
                }
                disabled={isSaving}
                className="w-full h-24 bg-[#1a1a1a] border border-[#333] focus:border-red-500/50 rounded p-2 text-sm text-gray-200 outline-none resize-none font-mono disabled:opacity-50"
                placeholder="What to avoid?"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 text-yellow-600">
                  Style Prompt
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(formData.stylePrompt)}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Copy"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => handlePaste("stylePrompt")}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Paste"
                  >
                    <Clipboard size={12} />
                  </button>
                </div>
              </div>
              <textarea
                value={formData.stylePrompt}
                onChange={(e) =>
                  setFormData({ ...formData, stylePrompt: e.target.value })
                }
                disabled={isSaving}
                className="w-full h-20 bg-[#1a1a1a] border border-[#333] focus:border-yellow-600/50 rounded p-2 text-sm text-gray-200 outline-none resize-none font-mono disabled:opacity-50"
                placeholder="SDXL style prompt..."
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 text-orange-500">
                  Refiner Prompt
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(formData.refinerPrompt)}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Copy"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => handlePaste("refinerPrompt")}
                    className="p-1 rounded-full bg-[#222] hover:bg-[#333] text-gray-400 transition"
                    title="Paste"
                  >
                    <Clipboard size={12} />
                  </button>
                </div>
              </div>
              <textarea
                value={formData.refinerPrompt}
                onChange={(e) =>
                  setFormData({ ...formData, refinerPrompt: e.target.value })
                }
                disabled={isSaving}
                className="w-full h-20 bg-[#1a1a1a] border border-[#333] focus:border-orange-500/50 rounded p-2 text-sm text-gray-200 outline-none resize-none font-mono disabled:opacity-50"
                placeholder="Refiner pass prompt..."
              />
            </div>
          </>
        )}

        {editorView === "settings" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Steps: {formData.steps}
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formData.steps}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      steps: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  CFG Scale: {formData.cfgScale}
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={formData.cfgScale}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cfgScale: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Seed
              </label>
              <input
                type="number"
                step="1"
                value={formData.seed}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seed: parseInt(e.target.value),
                  })
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-blue-500"
                placeholder="-1 for random"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Base Model
              </label>
              <select
                value={formData.basemodel}
                onChange={(e) =>
                  setFormData({ ...formData, basemodel: e.target.value })
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
              >
                {configs.basemodels?.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Model Type
              </label>
              <select
                value={formData.modeltype}
                onChange={(e) =>
                  setFormData({ ...formData, modeltype: e.target.value })
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
              >
                {configs.modeltypes?.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Checkpoint Type
              </label>
              <select
                value={formData.checkpointtype}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    checkpointtype: e.target.value,
                  })
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
              >
                {configs.checkpointtypes?.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                File Format
              </label>
              <select
                value={formData.modelfileformat}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    modelfileformat: e.target.value,
                  })
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
              >
                {configs.modelfileformats?.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Categories
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
              >
                {configs.categories?.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Sampling Method
              </label>
              <select
                value={formData.sampler}
                onChange={(e) =>
                  setFormData({ ...formData, sampler: e.target.value })
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
              >
                {configs.samplers?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Scheduler
              </label>
              <select
                value={formData.scheduler}
                onChange={(e) =>
                  setFormData({ ...formData, scheduler: e.target.value })
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
              >
                {configs.schedulers?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Prompt Type
              </label>
              <input
                type="text"
                value={formData.usedPromptType}
                onChange={(e) =>
                  setFormData({ ...formData, usedPromptType: e.target.value })
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-blue-500"
                placeholder="e.g. SDXL, SD 1.5, Flux"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Resolution
              </label>
              <select
                value={formData.modelresolution}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    modelresolution: e.target.value,
                  })
                }
                className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
              >
                {configs.modelresolutions?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Width
                </label>
                <input
                  type="number"
                  value={formData.width}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      width: parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Height
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {editorView === "notes" && (
          <div className="h-full flex flex-col space-y-4 overflow-y-auto pr-1 custom-scrollbar">
            {/* Existing Notes Field */}
            <div className="space-y-1 flex-shrink-0">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Personal Notes
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                className="w-full h-32 bg-[#1a1a1a] border border-[#333] focus:border-blue-500/50 rounded p-2 text-sm text-gray-400 outline-none resize-none"
                placeholder="Add your thoughts, tags, or context here..."
              />
            </div>

            {/* New Fields Container */}
            <div className="grid grid-cols-2 gap-3 pb-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Process Type
                </label>
                <select
                  value={formData.processType || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      processType: e.target.value,
                    })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
                >
                  <option value="">Select Type</option>
                  <option value="txt2img">Text to Image</option>
                  <option value="img2img">Image to Image</option>
                  <option value="txt2vid">Text to Video</option>
                  <option value="img2vid">Image to Video</option>
                  <option value="inpainting">Inpainting</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Sub Category
                </label>
                <input
                  type="text"
                  value={formData.subCategory || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, subCategory: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none focus:border-blue-500"
                  placeholder="e.g. Fantasy, Sci-Fi, Portrait..."
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Model URL
                </label>
                <input
                  type="text"
                  value={formData.modelUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, modelUrl: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Prompt Date
                </label>
                <input
                  type="date"
                  value={
                    formData.promptDate ||
                    new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      promptDate: e.target.value,
                    })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  VAE
                </label>
                <input
                  type="text"
                  value={formData.vae || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, vae: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Clip Skip
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.clipSkip || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      clipSkip: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Denoise
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.denoise || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      denoise: parseFloat(e.target.value) || 0.0,
                    })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Start Step
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.startStep || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startStep: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  End Step
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.endStep || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endStep: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded p-2 text-sm text-gray-300 outline-none"
                />
              </div>

              <div className="col-span-2 flex items-center space-x-3 p-1 mt-1">
                <input
                  type="checkbox"
                  checked={formData.addNoise || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      addNoise: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded bg-[#1a1a1a] border border-[#333] text-blue-500 focus:ring-0"
                />
                <label className="text-sm text-gray-300 select-none">
                  Add Noise
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#1a1a1a]/95 backdrop-blur border-t border-[#333] flex gap-3">
        <button
          onClick={onBackOrCancel}
          className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 ${!formData.id ? "bg-red-900/20 text-red-400 hover:bg-red-900/40" : "bg-[#333] hover:bg-[#444] text-gray-200"}`}
        >
          {!formData.id ? <Ban size={18} /> : <ArrowLeft size={18} />}{" "}
          {!formData.id ? "Cancel" : "Back"}
        </button>
        <button
          onClick={() => onSave(false)}
          disabled={isSaving}
          className={`flex-1 ${isSaving ? "bg-green-600" : "bg-blue-600 hover:bg-blue-500"} text-white py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2`}
        >
          {isSaving ? <Check size={18} /> : <Save size={18} />}{" "}
          {isSaving ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default PromptEditor;
