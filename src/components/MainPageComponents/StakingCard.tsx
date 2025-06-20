import React from 'react';
import { Coins, Target, Clock, ExternalLink } from 'lucide-react';

interface StakingCardProps {
  stakedAmount: number;
  goal: string;
  githubLink: string;
  createdAt: Date;
  endTime: Date;
  status: 'active' | 'completed' | 'slashed' | 'under_review';
}

export const StakingCard: React.FC<StakingCardProps> = ({
  stakedAmount,
  goal,
  githubLink,
  createdAt,
  endTime,
  status
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'slashed': return 'bg-red-500';
      case 'under_review': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'slashed': return 'Slashed';
      case 'under_review': return 'Under Review';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Coins className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Staked Amount</h3>
            <p className="text-purple-200 text-sm">SOL Locked</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-white mb-2">
          {stakedAmount.toFixed(2)} SOL
        </div>
        <div className="text-purple-200 text-sm">
          ≈ ${(stakedAmount * 240).toFixed(2)} USD
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-purple-300 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-white font-medium mb-1">Goal</h4>
            <p className="text-purple-200 text-sm leading-relaxed">{goal}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ExternalLink className="w-5 h-5 text-purple-300" />
          <div>
            <h4 className="text-white font-medium mb-1">Repository</h4>
            <a 
              href={githubLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-200 text-sm underline transition-colors"
            >
              {githubLink.replace('https://github.com/', '')}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-purple-300" />
          <div>
            <h4 className="text-white font-medium mb-1">Timeline</h4>
            <div className="text-purple-200 text-sm">
              <div>Started: {createdAt.toLocaleDateString()}</div>
              <div>Deadline: {endTime.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};