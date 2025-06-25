"use client"
import React, { useState } from 'react';
import { Target, Github, Calendar, Coins, Plus, AlertCircle } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTimeStakerProgram } from '../counter/timestaker-data-access';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface CreateGoalFormProps {
  onSubmit: (goalData: {
    goal: string;
    githubLink: string;
    stakedAmount: number;
    endDate: string;
  }) => void;
}

export const CreateGoalForm: React.FC<CreateGoalFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    goal: '',
    githubLink: '',
    stakedAmount: '',
    endDate: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { publicKey } = useWallet()
  const { createGoals, globalStateAccount } = useTimeStakerProgram()

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.goal.trim()) {
      newErrors.goal = 'Goal description is required';
    } else if (formData.goal.length < 20) {
      newErrors.goal = 'Goal description must be at least 20 characters';
    }

    if (!formData.githubLink.trim()) {
      newErrors.githubLink = 'GitHub repository link is required';
    } else if (!formData.githubLink.includes('github.com')) {
      newErrors.githubLink = 'Please enter a valid GitHub repository URL';
    }

    if (!formData.stakedAmount) {
      newErrors.stakedAmount = 'Staked amount is required';
    } else if (parseFloat(formData.stakedAmount) < 0.1) {
      newErrors.stakedAmount = 'Minimum stake is 0.1 SOL';
    } else if (parseFloat(formData.stakedAmount) > 1000) {
      newErrors.stakedAmount = 'Maximum stake is 1000 SOL';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else {
      const selectedDate = new Date(formData.endDate);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 1);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);

      if (selectedDate < minDate) {
        newErrors.endDate = 'End date must be at least 1 day from now';
      } else if (selectedDate > maxDate) {
        newErrors.endDate = 'End date cannot be more than 1 year from now';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!publicKey) {
      setErrors(prev => ({ ...prev, general: 'Please connect your wallet first' }));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Fix: Extract totalGoals correctly and handle the array properly
      let goalId;
      if (globalStateAccount.data && globalStateAccount.data.length > 0) {
        // Get the totalGoals from the first account's data
        goalId = globalStateAccount.data[0].account.totalGoals.toNumber() + 1;
      } else {
        goalId = 1;
      }

      const stakeAmountLamports = Math.floor(parseFloat(formData.stakedAmount) * LAMPORTS_PER_SOL);
      const deadlineTimestamp = Math.floor(new Date(formData.endDate).getTime() / 1000);
      const fullDescription = `Goal ${formData.goal}\nGithub Repository: ${formData.githubLink}`;

      await createGoals.mutateAsync({
        goal_id: goalId,
        description: fullDescription,
        stakeAmount: stakeAmountLamports,
        deadline: deadlineTimestamp,
        creatorPubkey: publicKey
      });

      // Call the onSubmit prop to notify parent component of successful creation
      onSubmit({
        goal: formData.goal,
        githubLink: formData.githubLink,
        stakedAmount: parseFloat(formData.stakedAmount),
        endDate: formData.endDate
      });

      // Reset form after successful submission
      setFormData({
        goal: '',
        githubLink: '',
        stakedAmount: '',
        endDate: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Set maximum date to 1 year from now
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-500 to-yellow-500 rounded-xl">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Create New Goal</h2>
          <p className="text-purple-200">Stake SOL to commit to your goal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goal Description */}
        <div>
          <label className="flex items-center gap-2 text-white font-medium mb-3">
            <Target className="w-4 h-4" />
            Goal Description
          </label>
          <textarea
            value={formData.goal}
            onChange={(e) => handleInputChange('goal', e.target.value)}
            placeholder="Describe your goal in detail. What will you accomplish? What are the specific deliverables?"
            rows={4}
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none ${
              errors.goal ? 'border-red-400' : 'border-white/20 focus:border-purple-400'
            }`}
          />
          {errors.goal && (
            <div className="flex items-center gap-2 mt-2 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.goal}
            </div>
          )}
          <div className="mt-2 text-purple-300 text-sm">
            {formData.goal.length}/500 characters
          </div>
        </div>

        {/* GitHub Link */}
        <div>
          <label className="flex items-center gap-2 text-white font-medium mb-3">
            <Github className="w-4 h-4" />
            GitHub Repository
          </label>
          <input
            type="url"
            value={formData.githubLink}
            onChange={(e) => handleInputChange('githubLink', e.target.value)}
            placeholder="https://github.com/username/repository"
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
              errors.githubLink ? 'border-red-400' : 'border-white/20 focus:border-purple-400'
            }`}
          />
          {errors.githubLink && (
            <div className="flex items-center gap-2 mt-2 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.githubLink}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Staked Amount */}
          <div>
            <label className="flex items-center gap-2 text-white font-medium mb-3">
              <Coins className="w-4 h-4" />
              Stake Amount (SOL)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              max="1000"
              value={formData.stakedAmount}
              onChange={(e) => handleInputChange('stakedAmount', e.target.value)}
              placeholder="0.00"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                errors.stakedAmount ? 'border-red-400' : 'border-white/20 focus:border-purple-400'
              }`}
            />
            {errors.stakedAmount && (
              <div className="flex items-center gap-2 mt-2 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.stakedAmount}
              </div>
            )}
            {formData.stakedAmount && !errors.stakedAmount && (
              <div className="mt-2 text-purple-300 text-sm">
                ≈ ${(parseFloat(formData.stakedAmount) * 240).toFixed(2)} USD
              </div>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="flex items-center gap-2 text-white font-medium mb-3">
              <Calendar className="w-4 h-4" />
              Deadline
            </label>
            <input
              type="date"
              min={minDate}
              max={maxDateStr}
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                errors.endDate ? 'border-red-400' : 'border-white/20 focus:border-purple-400'
              }`}
            />
            {errors.endDate && (
              <div className="flex items-center gap-2 mt-2 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.endDate}
              </div>
            )}
          </div>
        </div>

        {/* Risk Warning */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-red-200 font-medium mb-2">Slashing Risk Warning</h4>
              <ul className="text-red-300 text-sm space-y-1">
                <li>• Your staked SOL will be slashed if you fail to submit proof by the deadline</li>
                <li>• Proof must be substantial and verifiable</li>
                <li>• Review process may take 24-48 hours</li>
                <li>• False or inadequate proof may result in partial slashing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 disabled:from-purple-500/50 disabled:to-blue-500/50 text-white py-4 rounded-xl font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating Goal...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Stake SOL & Create Goal
            </>
          )}
        </button>
      </form>
    </div>
  );
};