import React from 'react';

interface ProgressIndicatorProps {
  createdAt: Date;
  endTime: Date;
  currentTime: Date;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  createdAt,
  endTime,
  currentTime
}) => {
  const totalDuration = endTime.getTime() - createdAt.getTime();
  const elapsed = currentTime.getTime() - createdAt.getTime();
  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Goal Progress</h3>
        <span className="text-purple-200 text-sm">{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-purple-200">
        <span>Started: {createdAt.toLocaleDateString()}</span>
        <span>Deadline: {endTime.toLocaleDateString()}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-2xl font-bold text-white">
            {Math.ceil((endTime.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))}
          </div>
          <div className="text-xs text-purple-200">Total Days</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-2xl font-bold text-white">
            {Math.ceil((currentTime.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))}
          </div>
          <div className="text-xs text-purple-200">Days Elapsed</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-2xl font-bold text-white">
            {Math.max(0, Math.ceil((endTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24)))}
          </div>
          <div className="text-xs text-purple-200">Days Left</div>
        </div>
      </div>
    </div>
  );
};