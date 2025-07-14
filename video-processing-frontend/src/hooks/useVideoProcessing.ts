import { useState, useCallback } from 'react';
import { VideoProcessingAPI } from '../services/api';
import type { VideoMetadata, FrameProcessingData, ProcessingStats } from '../types/index';

export const useVideoProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [processingData, setProcessingData] = useState<FrameProcessingData[]>([]);
  const [processingStats, setProcessingStats] = useState<ProcessingStats>({
    averageTime: 0,
    peakTime: 0,
    totalFrames: 0,
    processedFrames: 0,
  });

  const processVideo = useCallback(async (file: File, method: string) => {
    setIsProcessing(true);
    setError(null);
    setProcessedVideoUrl(null);
    setProcessingData([]);
    
    return new Promise<{ videoUrl?: string; metadata?: any }>((resolve, reject) => {
      // Simulate frame-by-frame processing updates for UI feedback
      const simulateProcessing = () => {
        // Estimate frame count based on file size and typical video properties
        const estimatedFrames = Math.floor(file.size / 50000); // Rough estimation
        const totalFrames = Math.max(50, Math.min(estimatedFrames, 300)); // Between 50-300 frames
        const data: FrameProcessingData[] = [];
        
        for (let i = 0; i < totalFrames; i++) {
          // Simulate realistic processing times based on method
          let baseTime = 25; // Base processing time in ms
          switch (method) {
            case 'clahe':
            case 'low-light':
              baseTime = 30;
              break;
            case 'deraining':
              baseTime = 45;
              break;
            case 'dehazing':
              baseTime = 40;
              break;
            case 'glare':
              baseTime = 35;
              break;
            case 'tilt':
              baseTime = 20;
              break;
            case 'unet':
              baseTime = 35;
              break;
            case 'automatic':
            case 'unet_selective':
              baseTime = 50;
              break;
          }
          
          const processingTime = baseTime + (Math.random() * 30 - 15); // ±15ms variation
          data.push({
            frameNumber: i,
            processingTime: Math.max(5, processingTime), // Minimum 5ms
          });
        }

        // Simulate real-time updates
        data.forEach((frameData, index) => {
          setTimeout(() => {
            setProcessingData(prev => [...prev, frameData]);
            
            const currentData = data.slice(0, index + 1);
            const times = currentData.map(d => d.processingTime);
            const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
            const peakTime = Math.max(...times);
            
            setProcessingStats({
              averageTime,
              peakTime,
              totalFrames,
              processedFrames: index + 1,
            });
          }, index * 100); // 100ms delay between frame updates for smooth animation
        });

        return totalFrames * 100; // Total simulation time
      };

      // Start UI simulation
      const simulationTime = simulateProcessing();

      // Make actual API call
      VideoProcessingAPI.processVideo(file, method)
        .then(({ videoBlob, metadata }) => {
          console.log('Processed blob received:', videoBlob.size, 'bytes');
          console.log('Metadata received:', metadata);
          
          const videoUrl = URL.createObjectURL(videoBlob);
          console.log('Created video URL:', videoUrl);
          
          // Wait for simulation to complete or minimum processing time
          setTimeout(() => {
            console.log('Setting processed video URL:', videoUrl);
            setProcessedVideoUrl(videoUrl);
            setIsProcessing(false);
            
            resolve({ videoUrl, metadata });
          }, Math.max(simulationTime, 2000)); // Minimum 2 seconds for user feedback
        })
        .catch((err) => {
          console.error('Processing error:', err);
          setError(err instanceof Error ? err.message : 'Processing failed');
          setIsProcessing(false);
          reject(err);
        });
    });
  }, []);


  const resetProcessing = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    if (processedVideoUrl) {
      URL.revokeObjectURL(processedVideoUrl);
    }
    setProcessedVideoUrl(null);
    setProcessingData([]);
    setProcessingStats({
      averageTime: 0,
      peakTime: 0,
      totalFrames: 0,
      processedFrames: 0,
    });
  }, [processedVideoUrl]);

  return {
    isProcessing,
    error,
    processedVideoUrl,
    processingData,
    processingStats,
    processVideo,
    resetProcessing,
  };
};