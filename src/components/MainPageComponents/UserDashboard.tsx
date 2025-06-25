"use client"
import React, { useState } from 'react';
import { CreateGoalForm } from './CreateGoalForm';
import { GoalHistory } from './GoalHistory';
import { User, Target, History, TrendingUp, Coins } from 'lucide-react';

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

export const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  
  // Mock data - replace with real data from your backend
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      goal: 'Build a full-stack e-commerce application with React, Node.js, and PostgreSQL. Include user authentication, payment processing, inventory management, and admin dashboard.',
      githubLink: 'https://github.com/user/ecommerce-app',
      stakedAmount: 50.0,
      createdAt: new Date('2024-01-01'),
      endTime: new Date('2024-03-01'),
      status: 'completed',
      completedAt: new Date('2024-02-28')
    },
    {
      id: '2',
      goal: 'Create a mobile-first progressive web app for task management with offline capabilities, push notifications, and real-time collaboration features.',
      githubLink: 'https://github.com/user/task-manager-pwa',
      stakedAmount: 25.5,
      createdAt: new Date('2024-02-15'),
      endTime: new Date('2024-04-15'),
      status: 'under_review',
      proofSubmittedAt: new Date('2024-04-14')
    },
    {
      id: '3',
      goal: 'Develop a machine learning model for image classification using TensorFlow, deploy it as a REST API, and create a web interface for testing.',
      githubLink: 'https://github.com/user/ml-image-classifier',
      stakedAmount: 75.25,
      createdAt: new Date('2024-03-01'),
      endTime: new Date('2024-05-01'),
      status: 'slashed'
    },
    {
      id: '4',
      goal: 'Build a real-time chat application with WebSocket support, message encryption, file sharing, and group chat functionality.',
      githubLink: 'https://github.com/user/realtime-chat',
      stakedAmount: 30.0,
      createdAt: new Date('2024-04-01'),
      endTime: new Date('2024-06-01'),
      status: 'active'
    }
  ]);

  const handleCreateGoal = (goalData: {
    goal: string;
    githubLink: string;
    stakedAmount: number;
    endDate: string;
  }) => {
    
  };

  // Calculate stats
  const totalStaked = goals.reduce((sum, goal) => sum + goal.stakedAmount, 0);
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const activeGoals = goals.filter(goal => goal.status === 'active').length;
  const successRate = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-lime-900 to-yellow-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">My Dashboard</h1>
            </div>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Create new goals, track your progress, and manage your SOL commitments
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{totalStaked.toFixed(1)}</div>
              <div className="text-purple-200 text-sm">Total SOL Staked</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{activeGoals}</div>
              <div className="text-purple-200 text-sm">Active Goals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{completedGoals}</div>
              <div className="text-purple-200 text-sm">Completed Goals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <History className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{successRate.toFixed(0)}%</div>
              <div className="text-purple-200 text-sm">Success Rate</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === 'create'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'text-purple-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  Create Goal
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === 'history'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'text-purple-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'create' ? (
            <CreateGoalForm onSubmit={handleCreateGoal} />
          ) : (
            <GoalHistory />
          )}
        </div>
      </div>
    </div>
  );
};