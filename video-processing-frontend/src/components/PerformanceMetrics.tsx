import React from 'react';
import { Clock, Cpu, HardDrive, Zap, Monitor, Activity } from 'lucide-react';
import type { VideoMetadata } from '../types/index';

interface PerformanceMetricsProps {
  metadata: VideoMetadata;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metadata }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    return `${seconds.toFixed(2)}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-slate-400';
      case 'processing': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Activity className="w-4 h-4 animate-pulse" />;
      case 'completed': return <Zap className="w-4 h-4" />;
      case 'error': return <Monitor className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Video Information */}
      <div>
        <h4 className="text-white font-semibold mb-3 flex items-center">
          <Monitor className="w-4 h-4 mr-2 text-teal-500" />
          Video Information
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Filename:</span>
            <span className="text-white font-medium text-sm">{metadata.filename}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Duration:</span>
            <span className="text-white font-medium">{formatDuration(metadata.duration)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Resolution:</span>
            <span className="text-white font-medium">{metadata.resolution}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Frame Rate:</span>
            <span className="text-white font-medium">{metadata.frameRate} fps</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">File Size:</span>
            <span className="text-white font-medium">{formatFileSize(metadata.fileSize)}</span>
          </div>
        </div>
      </div>

      {/* Processing Information */}
      <div>
        <h4 className="text-white font-semibold mb-3 flex items-center">
          <Cpu className="w-4 h-4 mr-2 text-teal-500" />
          Processing Details
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Method:</span>
            <span className="text-white font-medium">{metadata.processCategory || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Model:</span>
            <span className="text-white font-medium">{metadata.modelUsed || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Device:</span>
            <span className="text-white font-medium">{metadata.deviceUsed || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total Frames:</span>
            <span className="text-white font-medium">{metadata.totalFrames || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Processed:</span>
            <span className="text-white font-medium">{metadata.processedFrames || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h4 className="text-white font-semibold mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-teal-500" />
          Performance Metrics
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total Processing Time (LAG):</span>
            <span className="text-red-400 font-medium">{formatTime(metadata.totalTime)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Avg Time/Frame:</span>
            <span className="text-white font-medium">{formatTime(metadata.avgDelayPerFrame)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">CPU Usage:</span>
            <span className="text-white font-medium">{metadata.cpuUsage ? `${metadata.cpuUsage.toFixed(1)}%` : 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">GPU Usage:</span>
            <span className="text-white font-medium">{metadata.gpuUsage ? `${metadata.gpuUsage.toFixed(1)}%` : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Device Specifications */}
      {metadata.deviceSpecs && (
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <HardDrive className="w-4 h-4 mr-2 text-teal-500" />
            Device Specifications
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">CPU:</span>
              <span className="text-white font-medium text-sm">{metadata.deviceSpecs.cpu}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">GPU:</span>
              <span className="text-white font-medium text-sm">{metadata.deviceSpecs.gpu}</span>
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="pt-4 border-t border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Status:</span>
          <div className={`flex items-center space-x-2 ${getStatusColor(metadata.status)}`}>
            {getStatusIcon(metadata.status)}
            <span className="font-medium capitalize">{metadata.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;