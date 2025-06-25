"use client"
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { WalletButton } from "../solana/solana-provider";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTimeStakerProgram } from "../counter/timestaker-data-access";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// TypeScript types for the proof type enum
type ProofTypeVariant = 'image' | 'document' | 'link' | 'text' | 'video';

type ProofTypeEnum = 
  | { image: Record<string, never> }
  | { document: Record<string, never> }
  | { link: Record<string, never> }
  | { text: Record<string, never> }
  | { video: Record<string, never> };

// Props interface for the component
interface ProofTypeDisplayProps {
  proofType?: ProofTypeEnum | null;
}

export default function DashboardDao() {
    const { publicKey } = useWallet();
    const { registerJudge, judgeAccounts, goalAccounts, voteButton, withdrawJudgeStake } = useTimeStakerProgram();
    const [showButton, setShowButton] = useState(false);
 
    useEffect(() => {
      if (judgeAccounts.isLoading) {
          return; // Wait for loading to complete
      }

      if (!publicKey) return;
      
      const exist = judgeAccounts.data?.map((data) => data.account.judge.equals(publicKey));
      if (exist) {
          setShowButton(false);
      } else {
          setShowButton(true);
      }
  }, [judgeAccounts.data, judgeAccounts.isLoading, publicKey]) // Add dependencies

    const handleRegister = async() => {
      if (publicKey) {
        await registerJudge.mutateAsync({ judgePubkey: publicKey })
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

    function ProofTypeDisplay({ proofType }: ProofTypeDisplayProps) {
      if (!proofType) return <span className="text-gray-400">No proof type</span>;
      
      const variant = Object.keys(proofType)[0] as ProofTypeVariant;
      const icons = {
        image: '🖼️',
        document: '📄',
        link: '🔗',
        text: '📝',
        video: '🎥'
      };
      
      return (
        <span className="inline-flex items-center gap-1">
          <span>{icons[variant] || '❓'}</span>
          <span className="capitalize">{variant || 'Unknown'}</span>
        </span>
      );
    }

    function isDeadlinePassed(deadline: number) {
      return Date.now() > (deadline * 1000);
    }

    const handleVote = async ({ vote, goalId, goalPubkey, status }: { vote: boolean, goalId: number, goalPubkey: PublicKey, status: any }) => {
      if (publicKey && status.pendingVerification) {
        await voteButton.mutateAsync({ goalPubkey, vote, goalId, judgePubkey: publicKey })
      }
    }

    const handleWithdrawJudgeStake = async() => {
      if (publicKey) {
        await withdrawJudgeStake.mutateAsync({ judgeAuthorityPubkey: publicKey });
      }
    };
    
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
    {/* Background Pattern */}
    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
    
    <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-end">
            <WalletButton />
        </div>
        {/* Header */}
        {showButton ? (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-white/90">Live Voting Dashboard</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Stake your 1 SOL, Become Judge and participate in Voting
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"> Reward rewards for voting</span>?
            </h1>
            
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Cast your vote and see real-time results from the community. Your voice matters in shaping our product&#39;s future.
            </p>
        
            <div className="flex justify-center bg-white/10 rounded-lg p-6 mb-4 backdrop-blur-sm py-10 my-10">
              <button
                onClick={() => handleRegister()}
                className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl px-8 py-4 border border-white/20 text-center text-2xl font-semibold hover:cursor-pointer"
              >
                Become Judge
              </button>
            </div>
          </div>
        ): null}

        {
          judgeAccounts.data?.map((data) => (
            <div key={data.publicKey.toString()}>
              <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-4 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Judge </span>
                Dashboard
              </h1>
              <div className="bg-white/10 rounded-lg p-6 mb-4 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <p className="font-semibold">Correct Votes:</p>
                    <p>{data.account.correctVotes}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="font-semibold">Registered At:</p>
                    <p>{unixToSimpleFormat(data.account.registeredAt.toNumber())}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="font-semibold">Reputation Score:</p>
                    <p>{data.account.reputationScore}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="font-semibold">Staked Amount:</p>
                    <p>{data.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL} SOL</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="font-semibold">Total Votes:</p>
                    <p>{data.account.totalVotes}</p>
                  </div>
                </div>
                <div className="w-full">
                  <button
                    onClick={() => handleWithdrawJudgeStake()}
                    className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white text-xl font-bold py-4 px-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/25 "
                  >
                    😢 Unstake Amount
                  </button>
                </div>
              </div>
            </div>
          ))
        }

        {goalAccounts.data?.map((goal) => (
          <div key={goal.publicKey.toString()} className="bg-white/10 rounded-lg p-6 mb-4 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Basic Info */}
              <div>
                <p className="font-semibold text-gray-300">Creator:</p>
                <p className="text-sm font-mono break-all">{goal.account.creator.toBase58()}</p>
              </div>
              
              <div>
                <p className="font-semibold text-gray-300">Goal ID:</p>
                <p>{goal.account.goalId.toNumber()}</p>
              </div>
              
              {/* Description */}
              <div className="md:col-span-2">
                <p className="font-semibold text-gray-300">Description:</p>
                <p className="whitespace-pre-wrap">{goal.account.description}</p>
              </div>
              
              {/* Stake Amount */}
              <div>
                <p className="font-semibold text-gray-300">Stake Amount:</p>
                <p>{goal.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL} SOL</p>
              </div>
              
              {/* Status */}
              <div>
                <p className="font-semibold text-gray-300">Status:</p>
                <p className={`inline-block px-2 py-1 rounded text-sm ${
                  goal.account.status.active ? 'bg-green-500/20 text-green-400' :
                  goal.account.status.completed ? 'bg-blue-500/20 text-blue-400' :
                  goal.account.status.failed ? 'bg-red-500/20 text-red-400' :
                  goal.account.status.cancelled ? 'bg-gray-500/20 text-gray-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {Object.keys(goal.account.status)[0].toUpperCase()}
                </p>
              </div>
              
              {/* Timestamps */}
              <div>
                <p className="font-semibold text-gray-300">Created At:</p>
                <p>{unixToSimpleFormat(goal.account.createdAt.toNumber())}</p>
              </div>
              
              <div>
                <p className="font-semibold text-gray-300">Deadline:</p>
                <p className={isDeadlinePassed(goal.account.deadline.toNumber()) ? 'text-red-400' : 'text-green-400'}>
                  {unixToSimpleFormat(goal.account.deadline.toNumber())}
                  {isDeadlinePassed(goal.account.deadline.toNumber()) && ' (EXPIRED)'}
                </p>
              </div>
              
              <div>
                <p className="font-semibold text-gray-300">Voting Deadline:</p>
                <p className={isDeadlinePassed(goal.account.votingDeadline.toNumber()) ? 'text-red-400' : 'text-green-400'}>
                  {unixToSimpleFormat(goal.account.votingDeadline.toNumber())}
                  {isDeadlinePassed(goal.account.votingDeadline.toNumber()) && ' (EXPIRED)'}
                </p>
              </div>
              
              {/* Finalized At (if exists) */}
              {goal.account.finalizedAt && (
                <div>
                  <p className="font-semibold text-gray-300">Finalized At:</p>
                  <p>{unixToSimpleFormat(goal.account.finalizedAt.toNumber())}</p>
                </div>
              )}
              
              {/* Proof Data (if exists) */}
              {goal.account.proofData && (
                <div className="md:col-span-2">
                  <p className="font-semibold text-gray-300">Proof Data:</p>
                  <p className="whitespace-pre-wrap break-all">{goal.account.proofData}</p>
                </div>
              )}
              
              {/* Proof Type (if exists) */}
              {goal.account.proofType && (
                <div>
                  <p className="font-semibold text-gray-300">Proof Type:</p>
                  <p className="capitalize">
                  <ProofTypeDisplay proofType={goal.account.proofType} />
                  </p>
                </div>
              )}
              
              {/* Proof Submitted At (if exists) */}
              {goal.account.proofSubmittedAt && (
                <div>
                  <p className="font-semibold text-gray-300">Proof Submitted At:</p>
                  <p>{unixToSimpleFormat(goal.account.proofSubmittedAt.toNumber())}</p>
                </div>
              )}
              
              {/* Voting Stats */}
              <div>
                <p className="font-semibold text-gray-300">Total Votes:</p>
                <p>{goal.account.totalVotes.toNumber()}</p>
              </div>
              
              <div>
                <p className="font-semibold text-gray-300">Yes Votes:</p>
                <p className="text-green-400">
                  {goal.account.yesVotes.toNumber()} 
                  {goal.account.totalVotes.toNumber() > 0 && 
                    ` (${((goal.account.yesVotes.toNumber() / goal.account.totalVotes.toNumber()) * 100).toFixed(1)}%)`
                  }
                </p>
              </div>
              
              <div>
                <p className="font-semibold text-gray-300">No Votes:</p>
                <p className="text-red-400">
                  {goal.account.totalVotes.toNumber() - goal.account.yesVotes.toNumber()}
                  {goal.account.totalVotes.toNumber() > 0 && 
                    ` (${(((goal.account.totalVotes.toNumber() - goal.account.yesVotes.toNumber()) / goal.account.totalVotes.toNumber()) * 100).toFixed(1)}%)`
                  }
                </p>
              </div>
            </div>
            {/* TODO: add logic to not show vote buttons find judge and already voted */}
            {goal.account.status.pendingVerification ? (
                <div className="flex justify-center gap-4 py-2">
                  <button
                    onClick={() => handleVote({ vote: true, goalId: goal.account.goalId.toNumber(), goalPubkey: goal.publicKey, status: goal.account.status })}
                    className="w-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xl font-bold py-6 px-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-500/25 "
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleVote({ vote: false, goalId: goal.account.goalId.toNumber(), goalPubkey: goal.publicKey, status: goal.account.status })}
                    className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white text-xl font-bold py-6 px-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/25 "
                  >
                    No
                  </button>
                </div>
             ) : null} 
          </div>
        ))}

        {/* {!publicKey ? (
            <div className="text-center text-4xl font-bold mb-12 p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">Connect your Wallet</div>
        ): null}
        {publicKey && votes.filter(vote => vote.userVoted === null).map((vote) => (
            <div
                key={vote.id}
                className="mb-12 p-6 md:p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg"
            >
                
                <div className="mb-4 text-left text-white space-y-1">
                <div className="text-sm text-white/50">User</div>
                <div className="font-mono text-md break-all">{vote.userId}</div>

                <div className="mt-4 text-sm text-white/50">Goal</div>
                <div className="text-lg font-semibold text-emerald-300">{vote.goal}</div>

                <div className="mt-4 text-sm text-white/50">Proof</div>
                <a
                    href={vote.proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline break-all hover:text-blue-300"
                >
                    {vote.proof}
                </a>
                </div>

                
                <div className="text-left text-white/70 text-sm mb-6">
                <div>Total Votes: <span className="font-bold text-white">{vote.totalVotes}</span></div>
                <div className="flex gap-6 mt-2">
                    <span className="text-emerald-300">Yes: {(vote.totalVotes ? (vote.yes / vote.totalVotes) * 100 : 0).toFixed(1)}%</span>
                    <span className="text-red-400">No: {(vote.totalVotes ? (vote.no / vote.totalVotes) * 100 : 0).toFixed(1)}%</span>
                </div>
                </div>

                
                <div className="grid md:grid-cols-2 gap-6">
                
                <button
                    onClick={() => handleVote(vote.id, 'yes')}
                    disabled={isVoting || vote.userVoted !== null}
                    className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-6 px-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-full">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-semibold">YES</h3>
                    <p className="text-emerald-100 text-sm">I support this proposal</p>
                    </div>
                    {isVoting && (
                    <div className="absolute inset-0 bg-emerald-600/80 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                    )}
                </button>

                
                <button
                    onClick={() => handleVote(vote.id, 'no')}
                    disabled={isVoting || vote.userVoted !== null}
                    className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white py-6 px-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-full">
                        <XCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-semibold">NO</h3>
                    <p className="text-red-100 text-sm">I disagree with this proposal</p>
                    </div>
                    {isVoting && (
                    <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                    )}
                </button>
                </div>
            </div>
        ))}

        {publicKey && votes.every(v => v.userVoted !== null) && (
        <div className="text-center text-white text-3xl font-semibold mt-12">
            🎉 You've voted on all available proposals!
        </div>
        )} */}



        {/* Voting Section */}
        {/* {!votes.userVoted ? (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            
            <button
              onClick={() => handleVote('yes')}
              disabled={isVoting}
              className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white p-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-2">YES</h3>
                  <p className="text-emerald-100 text-lg">I support this proposal</p>
                </div>
              </div>
              
              {isVoting && (
                <div className="absolute inset-0 bg-emerald-600/80 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>

            
            <button
              onClick={() => handleVote('no')}
              disabled={isVoting}
              className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white p-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <XCircle className="w-12 h-12" />
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-2">NO</h3>
                  <p className="text-red-100 text-lg">I disagree with this proposal</p>
                </div>
              </div>
              
              {isVoting && (
                <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </div>
        ) : (
          
          <div className="text-center mb-12 p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-4 ${
              votes.userVoted === 'yes' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {votes.userVoted === 'yes' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="font-semibold">
                You voted {votes.userVoted.toUpperCase()} 
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Thank you for voting!</h2>
            <p className="text-white/70">Your voice has been counted. See the results below.</p>
          </div>
        )} */}

        {/* Results Section */}
        {/* {votes.totalVotes > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Live Results</h2>
              <span className="ml-auto text-white/70">{votes.totalVotes} total votes</span>
            </div>

            <div className="space-y-6">
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-white font-semibold">YES</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-400">{votes.yes}</span>
                    <span className="text-white/70 ml-2">({yesPercentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
                    style={{ width: `${yesPercentage}%` }}
                  ></div>
                </div>
              </div>

              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-white font-semibold">NO</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-red-400">{votes.no}</span>
                    <span className="text-white/70 ml-2">({noPercentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-1000 ease-out"
                    style={{ width: `${noPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Reset Button */}
        {/* {votes.totalVotes > 0 && (
          <div className="text-center">
            <button
              onClick={resetVotes}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all duration-200 hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Vote (Demo)
            </button>
          </div>
        )} */}
      </div>
    </div>
  </div>
}