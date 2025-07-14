import React, { useState, useCallback } from 'react';
import { Upload, Play, Loader2, CheckCircle, BarChart3 } from 'lucide-react';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import ExpandableWidget from './components/ExpandableWidget';
import ProcessingAnalytics from './components/ProcessingAnalytics';
import { useVideoProcessing } from './hooks/useVideoProcessing';
import type { VideoMetadata } from './types';

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('clahe');
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);

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

  // Determine which video to show - processed video takes priority
  const displayVideoUrl = processedVideoUrl || currentVideoUrl;
  const videoTitle = processedVideoUrl ? 'Processed Video' : 'Original Video';

  return (
    <div className="min-h-screen bg-slate-900">
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
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {getProcessingButtonContent()}
            </button>
          </div>
        )}

        {/* Single Video Display */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-4">
            {videoTitle}
          </h2>
          <div className="bg-slate-800 rounded-lg p-6" style={{ height: '500px' }}>
            <VideoPlayer
              videoUrl={displayVideoUrl}
              isUpload={!displayVideoUrl}
              onFileUpload={handleFileUpload}
            />
          </div>
        </div>
      </main>

      {/* Analytics Button */}
      <button
        onClick={() => setShowAnalytics(!showAnalytics)}
        className="fixed right-6 bottom-6 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-50 flex items-center gap-2"
      >
        <BarChart3 className="w-5 h-5" />
        Analytics
        <svg 
          className={`w-4 h-4 transition-transform ${showAnalytics ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Analytics Widget */}
      <ExpandableWidget
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        title="Analytics"
        position="right"
      >
        <ProcessingAnalytics data={processingData} stats={processingStats} />
      </ExpandableWidget>
    </div>
  );
}

export default App;