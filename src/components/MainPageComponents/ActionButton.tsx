import React from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface ActionButtonProps {
  status: 'active' | 'completed' | 'slashed' | 'under_review';
  canSubmitProof: boolean;
  onSubmitProof: () => void;
  timeRemaining: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  status,
  canSubmitProof,
  onSubmitProof,
  timeRemaining
}) => {
  const getButtonContent = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Goal Completed',
          className: 'bg-green-500/20 border-green-500/30 text-green-300 cursor-not-allowed',
          disabled: true
        };
      case 'slashed':
        return {
          icon: <XCircle className="w-5 h-5" />,
          text: 'SOL Slashed',
          className: 'bg-red-500/20 border-red-500/30 text-red-300 cursor-not-allowed',
          disabled: true
        };
      case 'under_review':
        return {
          icon: <Clock className="w-5 h-5 animate-spin" />,
          text: 'Under Review',
          className: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300 cursor-not-allowed',
          disabled: true
        };
      default:
        if (!timeRemaining) {
          return {
            icon: <AlertTriangle className="w-5 h-5" />,
            text: 'Time Expired',
            className: 'bg-red-500/20 border-red-500/30 text-red-300 cursor-not-allowed',
            disabled: true
          };
        }
        if (canSubmitProof) {
          return {
            icon: <CheckCircle className="w-5 h-5" />,
            text: 'Submit Proof of Completion',
            className: 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-transparent hover:scale-105 transform transition-all shadow-lg',
            disabled: false
          };
        }
        return {
          icon: <Clock className="w-5 h-5" />,
          text: 'Goal In Progress',
          className: 'bg-white/10 border-white/20 text-purple-200 cursor-not-allowed',
          disabled: true
        };
    }
  };

  const { icon, text, className, disabled } = getButtonContent();

  return (
    <button
      onClick={disabled ? undefined : onSubmitProof}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl border-2 font-medium transition-all ${className}`}
    >
      {icon}
      {text}
    </button>
  );
};