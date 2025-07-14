import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { FrameProcessingData, ProcessingStats } from '../types/index';

interface ProcessingAnalyticsProps {
  data: FrameProcessingData[];
  stats?: ProcessingStats;
}

const ProcessingAnalytics: React.FC<ProcessingAnalyticsProps> = ({ data, stats = {
  averageTime: 0,
  peakTime: 0,
  totalFrames: 0,
  processedFrames: 0
} }) => {
  return (
    <div className="p-6">
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="frameNumber" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              label={{ value: 'Processing Time (ms)', angle: -90, position: 'insideLeft' }}
            />
            <Line 
              type="monotone" 
              dataKey="processingTime" 
              stroke="#14B8A6" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#14B8A6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="text-center p-4 bg-slate-700 rounded-lg">
          <div className="text-2xl font-bold text-teal-400">{stats.averageTime.toFixed(1)}ms</div>
          <div className="text-sm text-slate-400">Average Time</div>
        </div>
        <div className="text-center p-4 bg-slate-700 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">{stats.peakTime.toFixed(1)}ms</div>
          <div className="text-sm text-slate-400">Peak Time</div>
        </div>
        <div className="text-center p-4 bg-slate-700 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">{stats.processedFrames}</div>
          <div className="text-sm text-slate-400">Frames Processed</div>
        </div>
        <div className="text-center p-4 bg-slate-700 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{stats.totalFrames}</div>
          <div className="text-sm text-slate-400">Total Frames</div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingAnalytics;