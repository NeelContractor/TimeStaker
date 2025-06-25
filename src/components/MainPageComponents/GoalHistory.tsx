"use client"
import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, Calendar } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTimeStakerProgram } from '../counter/timestaker-data-access';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import axios from 'axios';

type ProofTypeVariant = 
  | { image: {} }
  | { document: {} }
  | { link: {} }
  | { text: {} }
  | { video: {} }

export const GoalHistory = () => {
  const { publicKey } = useWallet();
  const { goalAccounts, submitProof } = useTimeStakerProgram()
  const [solPrice, setSolPrice] = useState<number>(0);
  const [submitPrf, setSubmitPrf] = useState(false);
  const [proofData, setProofData] = useState<string>("");
  const [proofType, setProofType] = useState<ProofTypeVariant>({ link: {} });

  useEffect(() => {
    const fetch = async() => {
      try {
        const response = await axios.get(
          'https://lite-api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112'
        );
        const solData = response.data.data['So11111111111111111111111111111111111111112'];
        setSolPrice(solData.price);
      } catch (err) {
        console.error('Failed to fetch SOL price', err);
      }
    }
    fetch()
  }, []);

  function getStatusIcon(status: any) {
    switch (status.name) {
      case "active":
        return <span>🟢</span>;
      case "pendingVerification":
        return <span>⏳</span>;
      case "completed":
        return <span>✅</span>;
      case "failed":
        return <span>❌</span>;
      case "cancelled":
        return <span>🚫</span>;
      default:
        return <span>❓</span>;
    }
  }

  function getStatusColor(status: any) {
    switch (status.name) {
      case "active":
        return "border-green-500 text-green-600";
      case "pendingVerification":
        return "border-yellow-500 text-yellow-600";
      case "completed":
        return "border-blue-500 text-blue-600";
      case "failed":
        return "border-red-500 text-red-600";
      case "cancelled":
        return "border-gray-400 text-gray-500";
      default:
        return "border-gray-300 text-gray-400";
    }
  }

  function getStatusText(status: any) {
    switch (status.name) {
      case "active":
        return "Active";
      case "pendingVerification":
        return "Pending Verification";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  }

  function unixToSimpleFormat(timestamp: number) {
    const date = new Date(timestamp * 1000);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  function unixToDate(timestamp: number) {
    // Unix timestamp is in seconds, JavaScript Date expects milliseconds
    const days = Number(new Date(timestamp * 1000));
    return days
  }

  const handleSubmitProof = async({ goalPubkey }: { goalPubkey: PublicKey }) => {
    if (publicKey ) {
      // TODO: complete this
      await submitProof.mutateAsync({ goalPubkey, proofData: proofData, proofType, creatorPubkey: publicKey })
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-purple-300" />
        <h2 className="text-2xl font-bold text-white">Goal History</h2>
      </div>
      {goalAccounts.data?.map((goal) => (
        <div key={goal.publicKey.toString()}>
          {publicKey && goal.account.creator.equals(publicKey) ? (
            <div className="space-y-6 py-5">
              <div className="grid gap-6">
                  <div key={goal.account.goalId.toNumber()} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(goal.account.status)}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(goal.account.status)}`}>
                          {getStatusText(goal.account.status)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {goal.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL} SOL
                        </div>
                        <div className="text-purple-200 text-sm">
                          {/* ≈ ${(goal.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL)} SOL */}
                          ≈ $
                          {solPrice
                            ? ((goal.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL) * solPrice).toFixed(2)
                            : '...'}{' '}
                        </div>
                      </div>
                    </div>
      
                    <div className="mb-4">
                      <div className='flex gap-2'>
                        <h3 className="text-white font-bold mb-2">Goal</h3>
                        <span className="text-white font-bold mb-2">{goal.account.goalId.toNumber()}</span>
                      </div>
                      <p className="text-purple-200 text-sm leading-relaxed line-clamp-3">
                        {goal.account.description}
                      </p>
                    </div>
      
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-300" />
                        <span className="text-purple-200 text-sm">
                          {unixToSimpleFormat(goal.account.createdAt.toNumber())} → {unixToSimpleFormat(goal.account.deadline.toNumber())}
                        </span>
                      </div>
                    </div>
      
                    {/* Status-specific information */}
                    {goal.account.status.active && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-200 text-sm">
                            {unixToDate(goal.account.deadline.toNumber()) > 0 
                              ? `${unixToSimpleFormat(goal.account.deadline.toNumber())} days remaining`
                              : 'Deadline passed'
                            }
                          </span>
                          <div className="w-32 bg-white/10 rounded-full h-2">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full transition-all"
                              style={{ 
                                width: `${Math.min(100, Math.max(0, 
                                  ((new Date().getTime() - goal.account.createdAt.toNumber()) / 
                                  (goal.account.deadline.toNumber() - goal.account.createdAt.toNumber())) * 100
                                ))}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
      
                    {goal.account.status.completed && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-200 text-sm">
                            Goal Completed
                          </span>
                        </div>
                      </div>
                    )}
      
                    {goal.account.status.pendingVerification&& goal.account.proofSubmittedAt && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-200 text-sm">
                            Proof submitted on {unixToSimpleFormat(goal.account.proofSubmittedAt.toNumber())} - Under review
                          </span>
                        </div>
                      </div>
                    )}
      
                    {goal.account.status.failed && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-200 text-sm">
                            Goal failed - {goal.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL} SOL slashed
                          </span>
                        </div>
                      </div>
                    )}

                    {goal.account.status.active && !submitPrf && (
                      <div className='w-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xl font-bold py-4 my-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-500/25 '>
                        <button 
                          className='w-full text-xl font-bold cursor-pointer'
                          onClick={() => setSubmitPrf((prev) => !prev)}
                        >
                          Submit Proof and Complete Goal
                        </button>
                      </div>
                    )}
                    {/* TODO: Complete this */}
                    {submitPrf && (
                      <div>
                        <div className='grid gap-4 py-4'>
                          <select
                            // type={}
                            // value={}
                            onChange={(e) => setProofType(e.target.value)}
                            // placeholder={"link"}
                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:ring-2 focus:ring-purple-400 transition-all`}
                          >
                            <option value="link">Github Link</option>
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                            <option value="document">Document</option>
                            <option value="text">Text</option>
                          </select>
                          <input
                            type="url"
                            value={proofData}
                            onChange={(e) => setProofData(e.target.value)}
                            placeholder="https://github.com/username/repository"
                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:ring-2 focus:ring-purple-400 transition-all`}
                          />
                        </div>

                        <button
                          className='w-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xl font-bold py-2 my-2 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-500/25 '
                          onClick={() => handleSubmitProof({ goalPubkey: goal.publicKey })}
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl text-center">
              <Clock className="w-16 h-16 text-purple-300 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No Goals Yet</h3>
              <p className="text-purple-200">Create your first goal to start your commitment journey!</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};