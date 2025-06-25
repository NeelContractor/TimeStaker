"use client"
import React, { useState } from 'react';
import { CreateGoalForm } from './CreateGoalForm';
import { GoalHistory } from './GoalHistory';
import { User, Target, History, TrendingUp, Coins } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  
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
              <div className="p-3 bg-gradient-to-r from-green-500 to-yellow-500 rounded-2xl">
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
              <div className="text-2xl font-bold text-white">{50}</div>
              <div className="text-purple-200 text-sm">Total SOL Staked</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{10}</div>
              <div className="text-purple-200 text-sm">Active Goals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{9}</div>
              <div className="text-purple-200 text-sm">Completed Goals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <History className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{90}%</div>
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
                      ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-lg'
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
                      ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-lg'
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
            <CreateGoalForm />
          ) : (
            <GoalHistory />
          )}
        </div>
      </div>
    </div>
  );
};