export interface VideoMetadata {
  filename: string;
  duration: number;
  frameRate: number;
  resolution: string;
  fileSize: number;
  status: 'ready' | 'processing' | 'completed' | 'error';
  processCategory?: string;
  modelUsed?: string;
  totalFrames?: number;
  processedFrames?: number;
  totalTime?: number;
  avgDelayPerFrame?: number;
  deviceUsed?: string;
  cpuUsage?: number;
  gpuUsage?: number;
  deviceSpecs?: {
    cpu: string;
    gpu: string;
  };
}

export interface ProcessingMethod {
  id: string;
  name: string;
  description: string;
  active: boolean;
  subMethods?: SubMethod[];
  selectedSubMethod?: string;
}

export interface SubMethod {
  id: string;
  name: string;
  description: string;
}

export interface FrameProcessingData {
  frameNumber: number;
  processingTime: number;
}

export interface ProcessingStats {
  averageTime: number;
  peakTime: number;
  totalFrames: number;
  processedFrames: number;
}

export interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  data?: any;
}

export interface WidgetState {
  analytics: boolean;
  performance: boolean;
}