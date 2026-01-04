import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MagicPanel from './components/MagicPanel';
import TextPanel from './components/TextPanel';
import UploadPanel from './components/UploadPanel';
import VideoCanvas from './components/VideoCanvas';
import Timeline from './components/Timeline';
import { VideoClip, ProjectAsset, TextOverlay } from './types';
import { Download, Share2, Undo2, Redo2, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState('ai-magic');
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [projectTitle, setProjectTitle] = useState('Untitled Project');

  const activeClip = clips.find(c => c.id === activeClipId) || clips[clips.length - 1];

  const handleVideoGenerated = (url: string, prompt: string) => {
    const newClip: VideoClip = {
      id: Date.now().toString(),
      url: url,
      thumbnail: url,
      duration: 5,
      prompt: prompt,
      type: 'ai',
      textOverlays: []
    };
    setClips(prev => [...prev, newClip]);
    setActiveClipId(newClip.id);
  };

  const handleDeleteClip = (id: string) => {
    setClips(prev => prev.filter(c => c.id !== id));
    if (activeClipId === id) {
      setActiveClipId(clips[0]?.id || null);
    }
  };

  const handleExtendClip = (id: string) => {
    alert('AI video extension feature - would regenerate with continuation prompt');
  };

  const handleAddText = (type: 'heading' | 'subheading' | 'body') => {
    if (!activeClip) return;

    const fontSizes = { heading: 48, subheading: 32, body: 20 };
    const contents = { heading: 'Add a heading', subheading: 'Add a subheading', body: 'Add body text' };

    const newText: TextOverlay = {
      id: Date.now().toString(),
      content: contents[type],
      fontSize: fontSizes[type],
      color: '#ffffff',
      fontFamily: 'Inter',
      x: 50,
      y: 50
    };

    setClips(prev => prev.map(clip =>
      clip.id === activeClip.id
        ? { ...clip, textOverlays: [...clip.textOverlays, newText] }
        : clip
    ));
  };

  const handleUpdateText = (textId: string, updates: Partial<TextOverlay>) => {
    if (!activeClip) return;
    setClips(prev => prev.map(clip =>
      clip.id === activeClip.id
        ? {
            ...clip,
            textOverlays: clip.textOverlays.map(text =>
              text.id === textId ? { ...text, ...updates } : text
            )
          }
        : clip
    ));
  };

  const handleRemoveText = (textId: string) => {
    if (!activeClip) return;
    setClips(prev => prev.map(clip =>
      clip.id === activeClip.id
        ? { ...clip, textOverlays: clip.textOverlays.filter(t => t.id !== textId) }
        : clip
    ));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAsset: ProjectAsset = {
          id: Date.now().toString() + Math.random(),
          url: reader.result as string,
          name: file.name,
          type: file.type.startsWith('video') ? 'video' : 'image'
        };
        setAssets(prev => [...prev, newAsset]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddAssetToTimeline = (asset: ProjectAsset) => {
    const newClip: VideoClip = {
      id: Date.now().toString(),
      url: asset.url,
      thumbnail: asset.url,
      duration: 5,
      type: 'upload',
      textOverlays: []
    };
    setClips(prev => [...prev, newClip]);
    setActiveClipId(newClip.id);
  };

  const handleExport = () => {
    alert('Export functionality - would render final video with all effects and overlays');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />

      {activeTool === 'ai-magic' && (
        <MagicPanel onVideoGenerated={handleVideoGenerated} aspectRatio={aspectRatio} />
      )}

      {activeTool === 'text' && (
        <TextPanel onAddText={handleAddText} />
      )}

      {activeTool === 'uploads' && (
        <UploadPanel
          assets={assets}
          onUpload={handleUpload}
          onAddAssetToTimeline={handleAddAssetToTimeline}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-4">
            <input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="text-sm font-semibold bg-transparent border-none outline-none focus:bg-gray-50 px-3 py-1 rounded-md transition-colors"
            />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>•</span>
              <span>{clips.length} clips</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-400">
                <Undo2 size={16} />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-400">
                <Redo2 size={16} />
              </button>
            </div>

            <button
              onClick={() => setAspectRatio(aspectRatio === '16:9' ? '9:16' : '16:9')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
            >
              {aspectRatio}
              <ChevronDown size={14} />
            </button>

            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
              <Share2 size={16} />
              Share
            </button>

            <button
              onClick={handleExport}
              className="px-6 py-2 canva-purple text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-md"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          <VideoCanvas
            activeClip={activeClip || null}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            aspectRatio={aspectRatio}
            onUpdateText={handleUpdateText}
            onRemoveText={handleRemoveText}
          />

          <Timeline
            clips={clips}
            activeClipId={activeClipId}
            setActiveClipId={setActiveClipId}
            onDeleteClip={handleDeleteClip}
            onExtendClip={handleExtendClip}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
