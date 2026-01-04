
import { GoogleGenAI } from "@google/genai";

export class VeoService {
  private static async getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async checkApiKey() {
    if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
      return await window.aistudio.hasSelectedApiKey();
    }
    return true; // Fallback for environments without the helper
  }

  static async requestApiKey() {
    if (typeof window.aistudio?.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
    }
  }

  static async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
    const ai = await this.getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Failed to generate video");

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  static async generateImageToVideo(imageBytes: string, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
    const ai = await this.getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imageBytes,
        mimeType: 'image/png'
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Failed to generate video");

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}
