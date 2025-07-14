import React, { useState, useCallback } from 'react';
import { Upload, Play, Loader2, CheckCircle } from 'lucide-react';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import ExpandableWidget from './components/ExpandableWidget';
import PerformanceMetrics from './components/PerformanceMetrics';
import ProcessingAnalytics from './components/ProcessingAnalytics';
import { useVideoProcessing } from './hooks/useVideoProcessing';
import type { VideoMetadata } from './types';

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('clahe');
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [activeWidget, setActiveWidget] = useState<'performance' | 'analytics' | null>(null);

  const { 
    isProcessing, 
    processedVideoUrl, 
    processingData, 
    processingStats,
    processVideo,
    resetProcessing 
  } = useVideoProcessing();

  const handleFileUpload = useCallback((file: File) => {
    console.log('📁 File uploaded:', file.name);
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setCurrentVideoUrl(url);
    resetProcessing();
    
    // Create basic metadata from file
    setVideoMetadata({
      filename: file.name,
      duration: 0,
      frameRate: 30,
      resolution: 'Unknown',
      fileSize: file.size,
      status: 'ready'
    });
  }, [resetProcessing]);

  const handleProcessStart = useCallback(async () => {
    if (!uploadedFile) {
      console.error('❌ No file uploaded');
      return;
    }

    console.log('🚀 Starting processing with method:', selectedMethod);
    setVideoMetadata(prev => prev ? { ...prev, status: 'processing' } : null);

    try {
      console.log('📤 Sending request to backend...');
      const result = await processVideo(uploadedFile, selectedMethod);
      
      console.log('✅ Processing completed:', result);
      
      // Update metadata with result
      if (result?.metadata) {
        setVideoMetadata(prev => prev ? ({
          ...prev,
          status: 'completed',
          processCategory: result.metadata.process_category,
          modelUsed: result.metadata.model_used,
          totalFrames: result.metadata.video?.total_frames,
          processedFrames: result.metadata.video?.processed_frames,
          totalTime: result.metadata.performance?.total_time,
          avgDelayPerFrame: result.metadata.performance?.avg_delay_per_frame,
          deviceUsed: result.metadata.performance?.device_used,
          cpuUsage: result.metadata.performance?.cpu_usage_percent,
          gpuUsage: result.metadata.performance?.gpu_usage_percent,
          deviceSpecs: result.metadata.performance?.device_specs,
        }) : null);
      } else {
        setVideoMetadata(prev => prev ? { ...prev, status: 'completed' } : null);
      }
    } catch (error) {
      console.error('❌ Processing failed:', error);
      setVideoMetadata(prev => prev ? { ...prev, status: 'error' } : null);
    }
  }, [uploadedFile, selectedMethod, processVideo]);

  const toggleWidget = useCallback((widget: 'performance' | 'analytics') => {
    setActiveWidget(prev => prev === widget ? null : widget);
  }, []);

  const getProcessingButtonContent = () => {
    if (isProcessing) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      );
    }
    
    if (videoMetadata?.status === 'completed') {
      return (
        <>
          <CheckCircle className="w-4 h-4" />
          ✓ Processing Complete
        </>
      );
    }
    
    return (
      <>
        <Play className="w-4 h-4" />
        Start Processing
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header 
        selectedMethod={selectedMethod}
        onMethodChange={setSelectedMethod}
        onFileUpload={handleFileUpload}
      />
      
      <main className="container mx-auto px-6 py-8">
        {/* Processing Button */}
        {currentVideoUrl && !processedVideoUrl && videoMetadata?.status !== 'completed' && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={handleProcessStart}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {getProcessingButtonContent()}
            </button>
          </div>
        )}

        {/* Video Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              {processedVideoUrl ? 'Original Video' : 'Video Upload'}
            </h2>
            <VideoPlayer
              videoUrl={currentVideoUrl}
              isUpload={!currentVideoUrl}
              onFileUpload={handleFileUpload}
            />
          </div>
          
          {processedVideoUrl && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Processed Video</h2>
              <VideoPlayer
                videoUrl={processedVideoUrl}
              />
            </div>
          )}
        </div>
      </main>

      {/* Widget Buttons */}
      <button
        onClick={() => toggleWidget('performance')}
        className="fixed left-6 bottom-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="Performance Metrics"
      >
        <div className="w-6 h-6 flex items-center justify-center">📊</div>
      </button>

      <button
        onClick={() => toggleWidget('analytics')}
        className="fixed right-6 bottom-6 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="Analytics"
      >
        <div className="w-6 h-6 flex items-center justify-center">📈</div>
      </button>

      {/* Expandable Widgets */}
      <ExpandableWidget
        isOpen={activeWidget === 'performance'}
        onClose={() => setActiveWidget(null)}
        title="Performance Metrics"
        position="left"
      >
        {videoMetadata && <PerformanceMetrics metadata={videoMetadata} />}
      </ExpandableWidget>

      <ExpandableWidget
        isOpen={activeWidget === 'analytics'}
        onClose={() => setActiveWidget(null)}
        title="Processing Analytics"
        position="right"
      >
        <ProcessingAnalytics data={processingData} stats={processingStats} />
      </ExpandableWidget>
    </div>
  );
}

export default App;