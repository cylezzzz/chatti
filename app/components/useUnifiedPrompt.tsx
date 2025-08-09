'use client';

import { useState, useCallback } from 'react';
import { PromptSettings } from './UnifiedPromptMask';

export interface UnifiedPromptResult {
  prompt: string;
  settings: PromptSettings;
  timestamp: number;
}

export interface UseUnifiedPromptReturn {
  // State
  isPromptMaskOpen: boolean;
  currentSettings: PromptSettings | null;
  
  // Actions
  openPromptMask: (mode: string, initialSettings?: Partial<PromptSettings>) => void;
  closePromptMask: () => void;
  handleGenerate: (prompt: string, settings: PromptSettings) => void;
  
  // Data
  lastResult: UnifiedPromptResult | null;
}

const DEFAULT_SETTINGS: PromptSettings = {
  format: 'image',
  genre: 'sfw',
  aspectRatio: '16:9',
  resolution: 'auto',
  quality: 'high',
  safety: 'balanced',
  position: 'center',
  styleChips: [],
  negativeChips: [],
  length: 8,
  fps: 30,
  audio: 'none',
  subtitles: false
};

export function useUnifiedPrompt(
  onGenerate?: (result: UnifiedPromptResult, mode: string) => void
): UseUnifiedPromptReturn {
  const [isPromptMaskOpen, setIsPromptMaskOpen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<PromptSettings | null>(null);
  const [currentMode, setCurrentMode] = useState<string>('');
  const [lastResult, setLastResult] = useState<UnifiedPromptResult | null>(null);

  const openPromptMask = useCallback((mode: string, initialSettings?: Partial<PromptSettings>) => {
    const settings = { ...DEFAULT_SETTINGS, ...initialSettings };
    
    // Mode-spezifische Anpassungen
    switch (mode) {
      case 'text2video':
      case 'image2video':
        settings.format = 'video';
        break;
      case 'text2image':
      case 'image2image':
      case 'sketch2image':
        settings.format = 'image';
        break;
    }
    
    setCurrentSettings(settings);
    setCurrentMode(mode);
    setIsPromptMaskOpen(true);
  }, []);

  const closePromptMask = useCallback(() => {
    setIsPromptMaskOpen(false);
    setCurrentSettings(null);
    setCurrentMode('');
  }, []);

  const handleGenerate = useCallback((prompt: string, settings: PromptSettings) => {
    const result: UnifiedPromptResult = {
      prompt,
      settings,
      timestamp: Date.now()
    };
    
    setLastResult(result);
    setIsPromptMaskOpen(false);
    
    if (onGenerate) {
      onGenerate(result, currentMode);
    }
  }, [onGenerate, currentMode]);

  return {
    isPromptMaskOpen,
    currentSettings,
    openPromptMask,
    closePromptMask,
    handleGenerate,
    lastResult
  };
}

// Integration Helper für bestehende Komponenten
export function integrateUnifiedPrompt() {
  return {
    // Text2Image Integration
    text2image: (settings: PromptSettings, prompt: string) => {
      console.log('🎨 Text2Image mit UPM:', { 
        prompt, 
        format: settings.format,
        aspectRatio: settings.aspectRatio,
        quality: settings.quality,
        styleChips: settings.styleChips,
        negativeChips: settings.negativeChips,
        safety: settings.safety
      });
      
      // TODO: Integration mit Stable Diffusion
      // return generateImage(enhancedPrompt, settings);
    },

    // Image2Image Integration  
    image2image: (settings: PromptSettings, prompt: string, sourceImage: string) => {
      console.log('🖼️ Image2Image mit UPM:', {
        prompt,
        sourceImage,
        position: settings.position,
        styleChips: settings.styleChips,
        quality: settings.quality
      });
      
      // TODO: Integration mit ControlNet/IP-Adapter
      // return processImage(sourceImage, enhancedPrompt, settings);
    },

    // Text2Video Integration
    text2video: (settings: PromptSettings, prompt: string) => {
      console.log('🎬 Text2Video mit UPM:', {
        prompt,
        length: settings.length,
        fps: settings.fps,
        audio: settings.audio,
        subtitles: settings.subtitles,
        aspectRatio: settings.aspectRatio
      });
      
      // TODO: Integration mit Stable Video Diffusion
      // return generateVideo(enhancedPrompt, settings);
    },

    // Image2Video Integration
    image2video: (settings: PromptSettings, prompt: string, sourceImage: string) => {
      console.log('🎥 Image2Video mit UPM:', {
        prompt,
        sourceImage,
        length: settings.length,
        fps: settings.fps,
        position: settings.position
      });
      
      // TODO: Integration mit AnimateDiff
      // return animateImage(sourceImage, enhancedPrompt, settings);
    },

    // Face Generation Integration
    faceGeneration: (settings: PromptSettings, prompt: string, faceData?: any) => {
      console.log('👤 Face Generation mit UPM:', {
        prompt,
        faceData,
        quality: settings.quality,
        safety: settings.safety
      });
      
      // TODO: Integration mit Face-specific Models
      // return generateFace(enhancedPrompt, faceData, settings);
    },

    // Region Processing Integration
    regionProcessing: (settings: PromptSettings, prompt: string, regions: any[]) => {
      console.log('🎯 Region Processing mit UPM:', {
        prompt,
        regions,
        position: settings.position,
        quality: settings.quality
      });
      
      // TODO: Integration mit Inpainting/Outpainting
      // return processRegions(regions, enhancedPrompt, settings);
    }
  };
}

// Prompt Enhancement Utilities
export function enhancePrompt(prompt: string, settings: PromptSettings): string {
  let enhanced = prompt;

  // Add style tags
  if (settings.styleChips.length > 0) {
    enhanced += `, ${settings.styleChips.join(', ')}`;
  }

  // Add quality modifiers based on settings
  const qualityModifiers = {
    draft: 'simple, basic',
    high: 'high quality, detailed',
    ultra: 'ultra high quality, masterpiece, highly detailed, 8k resolution'
  };
  
  enhanced += `, ${qualityModifiers[settings.quality]}`;

  // Add position/framing
  if (settings.position !== 'center') {
    const positionPrompts = {
      left: 'left side composition',
      right: 'right side composition', 
      top: 'top view, overhead angle',
      bottom: 'low angle, bottom view',
      thirds: 'rule of thirds composition'
    };
    enhanced += `, ${positionPrompts[settings.position]}`;
  }

  // Add format-specific enhancements
  if (settings.format === 'video') {
    enhanced += ', smooth motion, cinematic';
    
    if (settings.length > 30) {
      enhanced += ', long duration, extended sequence';
    }
    
    if (settings.fps === 24) {
      enhanced += ', cinematic 24fps';
    } else if (settings.fps === 30) {
      enhanced += ', smooth 30fps motion';
    }
  }

  // Add safety considerations
  if (settings.safety === 'strict') {
    enhanced += ', safe for work, family friendly';
  } else if (settings.safety === 'open' && settings.genre === 'nsfw') {
    enhanced += ', artistic, mature content';
  }

  return enhanced.trim();
}

// Negative Prompt Builder
export function buildNegativePrompt(settings: PromptSettings): string {
  let negatives = [...settings.negativeChips];

  // Add quality-based negatives
  negatives.push('low quality', 'blurry', 'distorted', 'artifacts');

  // Add safety-based negatives
  if (settings.safety === 'strict' || settings.genre === 'sfw') {
    negatives.push('nsfw', 'explicit', 'inappropriate', 'sexual', 'nude');
  }

  // Add format-specific negatives
  if (settings.format === 'video') {
    negatives.push('static', 'no motion', 'frozen', 'still image');
  }

  // Remove duplicates
  return [...new Set(negatives)].join(', ');
}

// Settings Validation
export function validateSettings(settings: PromptSettings): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Video-specific validations
  if (settings.format === 'video') {
    if (settings.length < 3 || settings.length > 60) {
      errors.push('Video length must be between 3 and 60 seconds');
    }
    
    if (![24, 25, 30].includes(settings.fps)) {
      errors.push('FPS must be 24, 25, or 30');
    }
  }

  // Quality validations
  if (!['draft', 'high', 'ultra'].includes(settings.quality)) {
    errors.push('Invalid quality setting');
  }

  // Safety validations
  if (settings.genre === 'nsfw' && settings.safety === 'strict') {
    errors.push('NSFW content cannot use strict safety settings');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export default integration object
export const unifiedPromptIntegration = {
  useUnifiedPrompt,
  integrateUnifiedPrompt,
  enhancePrompt,
  buildNegativePrompt,
  validateSettings,
  DEFAULT_SETTINGS
};