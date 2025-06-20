import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, ExternalLink, Calendar, Coins } from 'lucide-react';

interface Goal {
  id: string;
  goal: string;
  githubLink: string;
  stakedAmount: number;
  createdAt: Date;
  endTime: Date;
  status: 'active' | 'completed' | 'slashed' | 'under_review';
  proofSubmittedAt?: Date;
  completedAt?: Date;
}

interface GoalHistoryProps {
  goals: Goal[];
}

export const GoalHistory: React.FC<GoalHistoryProps> = ({ goals }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'slashed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'under_review':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'slashed': return 'bg-red-500/20 border-red-500/30 text-red-300';
      case 'under_review': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      default: return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'slashed': return 'Slashed';
      case 'under_review': return 'Under Review';
      default: return 'Active';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (goals.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl text-center">
        <Clock className="w-16 h-16 text-purple-300 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-white mb-2">No Goals Yet</h3>
        <p className="text-purple-200">Create your first goal to start your commitment journey!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-purple-300" />
        <h2 className="text-2xl font-bold text-white">Goal History</h2>
        <span className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm">
          {goals.length} {goals.length === 1 ? 'Goal' : 'Goals'}
        </span>
      </div>

      <div className="grid gap-6">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(goal.status)}
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(goal.status)}`}>
                  {getStatusText(goal.status)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {goal.stakedAmount.toFixed(2)} SOL
                </div>
                <div className="text-purple-200 text-sm">
                  ≈ ${(goal.stakedAmount * 240).toFixed(2)} USD
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-white font-medium mb-2">Goal</h3>
              <p className="text-purple-200 text-sm leading-relaxed line-clamp-3">
                {goal.goal}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-purple-300" />
                <a 
                  href={goal.githubLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm underline transition-colors truncate"
                >
                  {goal.githubLink.replace('https://github.com/', '')}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-300" />
                <span className="text-purple-200 text-sm">
                  {formatDate(goal.createdAt)} → {formatDate(goal.endTime)}
                </span>
              </div>
            </div>

            {/* Status-specific information */}
            {goal.status === 'active' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-200 text-sm">
                    {getDaysRemaining(goal.endTime) > 0 
                      ? `${getDaysRemaining(goal.endTime)} days remaining`
                      : 'Deadline passed'
                    }
                  </span>
                  <div className="w-32 bg-white/10 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, 
                          ((new Date().getTime() - goal.createdAt.getTime()) / 
                           (goal.endTime.getTime() - goal.createdAt.getTime())) * 100
                        ))}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {goal.status === 'completed' && goal.completedAt && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-200 text-sm">
                    Completed on {formatDate(goal.completedAt)}
                  </span>
                </div>
              </div>
            )}

            {goal.status === 'under_review' && goal.proofSubmittedAt && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-200 text-sm">
                    Proof submitted on {formatDate(goal.proofSubmittedAt)} - Under review
                  </span>
                </div>
              </div>
            )}

            {goal.status === 'slashed' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-200 text-sm">
                    Goal failed - SOL slashed on {formatDate(goal.endTime)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};