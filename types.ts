
export interface TextOverlay {
  id: string;
  content: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  x: number;
  y: number;
}

export interface VideoClip {
  id: string;
  url: string;
  thumbnail: string;
  duration: number;
  prompt?: string;
  type: 'ai' | 'upload';
  textOverlays: TextOverlay[];
}

export interface ProjectAsset {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
}

export interface VideoProject {
  id: string;
  title: string;
  clips: VideoClip[];
  assets: ProjectAsset[];
  aspectRatio: '16:9' | '9:16';
}

export enum GeneratorTab {
  TEXT_TO_VIDEO = 'text',
  IMAGE_TO_VIDEO = 'image',
  HISTORY = 'history'
}
