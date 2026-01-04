
import React, { useState } from 'react';
import { Sparkles, Video, Image as ImageIcon, Send, Loader2, Key, Info } from 'lucide-react';
import { VeoService } from '../services/veoService';
import { GeneratorTab } from '../types';

interface MagicPanelProps {
  onVideoGenerated: (url: string, prompt: string) => void;
  aspectRatio: '16:9' | '9:16';
}

const MagicPanel: React.FC<MagicPanelProps> = ({ onVideoGenerated, aspectRatio }) => {
  const [activeTab, setActiveTab] = useState<GeneratorTab>(GeneratorTab.TEXT_TO_VIDEO);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageRaw, setSelectedImageRaw] = useState<string | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() && activeTab === GeneratorTab.TEXT_TO_VIDEO) return;
    
    setError(null);
    setIsGenerating(true);

    try {
      const hasKey = await VeoService.checkApiKey();
      if (!hasKey) {
        setShowKeyDialog(true);
        setIsGenerating(false);
        return;
      }

      let videoUrl: string;
      if (activeTab === GeneratorTab.IMAGE_TO_VIDEO && selectedImageRaw) {
        videoUrl = await VeoService.generateImageToVideo(selectedImageRaw, prompt, aspectRatio);
      } else {
        videoUrl = await VeoService.generateVideo(prompt, aspectRatio);
      }

      onVideoGenerated(videoUrl, prompt);
      setPrompt('');
      setSelectedImage(null);
      setSelectedImageRaw(null);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setShowKeyDialog(true);
      }
      setError("Video generation failed. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        setSelectedImageRaw(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-[360px] bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="p-5 border-b border-gray-100 sticky top-0 z-10 bg-white">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={20} className="text-[#7d2ae8]" />
          Magic Media
        </h2>
        <div className="flex mt-5 bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab(GeneratorTab.TEXT_TO_VIDEO)}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === GeneratorTab.TEXT_TO_VIDEO ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Video
          </button>
          <button 
            onClick={() => setActiveTab(GeneratorTab.IMAGE_TO_VIDEO)}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === GeneratorTab.IMAGE_TO_VIDEO ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Animate
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {showKeyDialog && (
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-3">
            <div className="flex gap-2">
              <Info size={16} className="text-[#7d2ae8] shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-900 leading-relaxed font-medium">Link your Google AI Studio API key with billing enabled to generate videos.</p>
            </div>
            <button 
              onClick={async () => { await VeoService.requestApiKey(); setShowKeyDialog(false); }}
              className="w-full py-2.5 canva-purple hover:canva-purple-hover text-white text-xs font-bold rounded-lg transition-colors"
            >
              Link API Key
            </button>
          </div>
        )}

        {activeTab === GeneratorTab.IMAGE_TO_VIDEO && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Start with an image</label>
            <div className={`relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer group transition-all ${selectedImage ? 'border-[#7d2ae8] bg-indigo-50/30' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}>
              {selectedImage ? (
                <img src={selectedImage} className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon size={32} className="text-gray-400 group-hover:text-gray-500" />
                  <span className="text-xs text-gray-500 mt-2 font-semibold">Upload Image</span>
                </>
              )}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Describe your video</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A lush magical forest at dawn with golden particles floating in the air..."
            className="w-full h-40 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#7d2ae8]/20 focus:border-[#7d2ae8] outline-none resize-none placeholder:text-gray-400 font-medium transition-all"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || (!prompt.trim() && activeTab === GeneratorTab.TEXT_TO_VIDEO)}
          className="w-full py-4 canva-purple hover:canva-purple-hover disabled:bg-gray-200 disabled:text-gray-400 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Create video</span>
            </>
          )}
        </button>
        {error && <p className="text-red-500 text-xs mt-2 text-center font-bold bg-red-50 py-2 rounded-lg">{error}</p>}

        <div className="pt-4">
           <p className="text-[11px] text-gray-400 text-center font-medium">Power by Gemini Veo 3.1</p>
        </div>
      </div>
    </div>
  );
};

export default MagicPanel;
