"use client"

import { Github, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react"
import { ActionButton } from "./ActionButton";
import { ProgressIndicator } from "./ProgressIndicator";
import { CountdownTimer } from "./CountdownTimer";
import { StakingCard } from "./StakingCard";
import { ProofSubmission } from "./ProofSubmission";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { WalletButton } from "../solana/solana-provider";

export const ADMINPUBKEY = new PublicKey('GToMxgF4JcNn8dmNiHt2JrrvLaW6S1zSPoL2W8K2Wkmi');

export default function TimeStaker() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showProofModal, setShowProofModal] = useState(false);
    const [status, setStatus] = useState<'active' | 'completed' | 'slashed' | 'under_review'>('active');
    const router = useRouter();
    const { publicKey } = useWallet();

    //mock data - replace with real data 
    const stakingData = {
        stakedAmount: 25.75,
        goal: "Complete and deploy a full-stack web application with user authentication, database integration, and responsive design. The project should include at least 5 main features and be production-ready.",
        githubLink: "https://github.com/username/commitment-project",
        createdAt: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-02-15T23:59:59Z'),
        status: status
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const timeRemaining = currentTime < stakingData.endTime;
    const canSubmitProof = timeRemaining && status === 'active';

    const handleTimeUp = () => {
        if (status == 'active') {
            setStatus('slashed')
        }
    }

    const handleProofSubmit = (proof: { images: File[], links: string[], description: string }) => {
        console.log("Proof submitted:", proof);
        setStatus('under_review');
        // here send the proof to db or program
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
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
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">TimeStaker</h1>
            </div>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Lock your SOL to commit to your goals. Complete your commitment to reclaim your stake, 
              or risk slashing if you fail to deliver proof by the deadline.
            </p>
          </div>

          <div className="flex justify-center py-5">
            <WalletButton />
          </div>

          {publicKey && publicKey.equals(ADMINPUBKEY) && (
            <div className="grid grid-cols-1 gap-6 mb-8">
              <button
                className='w-full bg-gradient-to-br from-purple-500 to-blue-600 hover:from-blue-400 hover:to-purple-500 text-white text-xl font-bold py-4 my-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-500/25 '
                onClick={() => router.push('adminDashboard')}
              >
                Go to Admin&#39;s Dashboard
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button 
              className='w-full bg-gradient-to-br from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white text-xl font-bold py-4 my-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-500/25 '
              onClick={() => router.push('user_dashboard')}
            >
                Start setting and achiving Goal
            </button>

            <button 
              className='w-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white text-xl font-bold py-4 my-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-500/25 '
              onClick={() => router.push('dao_dashboard')}
            >
                Become judge and verify user goals
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">12,847</div>
              <div className="text-purple-200 text-sm">Total SOL Staked</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <Github className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">1,293</div>
              <div className="text-purple-200 text-sm">Active Commitments</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">87%</div>
              <div className="text-purple-200 text-sm">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <StakingCard {...stakingData} />
            <ProgressIndicator 
              createdAt={stakingData.createdAt}
              endTime={stakingData.endTime}
              currentTime={currentTime}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <CountdownTimer 
              endTime={stakingData.endTime}
              onTimeUp={handleTimeUp}
            />
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <h3 className="text-white font-semibold mb-4">Action Required</h3>
              <ActionButton
                status={status}
                canSubmitProof={canSubmitProof}
                onSubmitProof={() => setShowProofModal(true)}
                timeRemaining={timeRemaining}
              />
              
              {status === 'active' && timeRemaining && (
                <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-blue-200 text-sm text-center">
                    💡 Complete your goal and submit proof before the deadline to reclaim your staked SOL
                  </p>
                </div>
              )}
              
              {status === 'under_review' && (
                <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <p className="text-yellow-200 text-sm text-center">
                    🔍 Your proof is being reviewed. You&#39;ll be notified once the review is complete.
                  </p>
                </div>
              )}
              
              {status === 'slashed' && (
                <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-red-200 text-sm text-center">
                    ⚠️ Your staked SOL has been slashed due to missing the deadline without proof of completion.
                  </p>
                </div>
              )}
            </div>

            {/* Risk Warning */}
            <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/20">
              <h4 className="text-red-200 font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Slashing Risk
              </h4>
              <div className="space-y-2 text-red-300 text-sm">
                <p>• Failure to submit proof by deadline results in SOL slashing</p>
                <p>• Proof must be substantial and verifiable</p>
                <p>• Review process may take 24-48 hours</p>
                <p>• False or inadequate proof may result in partial slashing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proof Submission Modal */}
      <ProofSubmission
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        onSubmit={handleProofSubmit}
      />
    </div>
    )
}