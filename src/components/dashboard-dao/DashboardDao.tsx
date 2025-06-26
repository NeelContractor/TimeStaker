"use client"

import { CheckCheck, Target, TrendingUp } from "lucide-react";
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
    const { registerJudge, judgeAccounts, goalAccounts, voteButton, withdrawJudgeStake, voteRecordAccounts } = useTimeStakerProgram();
    const [showButton, setShowButton] = useState(false);
    const [activeTab, setActiveTab] = useState<'not-voted' | 'completed' | 'pending'>('not-voted');
    const [isCurrentUserJudge, setIsCurrentUserJudge] = useState(false);
 
    useEffect(() => {
      if (judgeAccounts.isLoading) {
          return; // Wait for loading to complete
      }

      if (!publicKey) {
        setShowButton(true);
        setIsCurrentUserJudge(false);
        return;
      }
      
      // Check if current user is a judge
      const currentUserIsJudge = judgeAccounts.data?.some((data) => 
        data.account.judge.equals(publicKey) && data.account.isActive && data.account.stakeAmount.toNumber() == 1 * LAMPORTS_PER_SOL
      );
      
      setIsCurrentUserJudge(!!currentUserIsJudge);
      setShowButton(!currentUserIsJudge);
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Get current user's judge data
    const currentUserJudgeData = judgeAccounts.data?.find((judge) => 
      publicKey && judge.account.judge.equals(publicKey)
    );

    // Check if current user has already voted on a specific goal
    const hasUserVotedOnGoal = (goalId: number) => {
      return voteRecordAccounts.data?.some((vote) => 
        publicKey && 
        vote.account.judge.equals(publicKey) && 
        vote.account.goalId.toNumber() === goalId
      );
    };
    
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
    {/* Background Pattern */}
    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
    
    <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-end">
            <WalletButton />
        </div>
        
        {/* Header - Show registration section only if user is not a judge */}
        {showButton && (
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
         )}

        {/* Judge Dashboard - Only show for current user if they are a judge */}
        {isCurrentUserJudge && currentUserJudgeData && (
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-4 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Judge </span>
              Dashboard
            </h1>
            <div className="bg-white/10 rounded-lg p-6 mb-4 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <p className="font-semibold">Correct Votes:</p>
                  <p>{currentUserJudgeData.account.correctVotes}</p>
                </div>
                <div className="flex gap-2">
                  <p className="font-semibold">Registered At:</p>
                  <p>{unixToSimpleFormat(currentUserJudgeData.account.registeredAt.toNumber())}</p>
                </div>
                <div className="flex gap-2">
                  <p className="font-semibold">Reputation Score:</p>
                  <p>{currentUserJudgeData.account.reputationScore}</p>
                </div>
                <div className="flex gap-2">
                  <p className="font-semibold">Staked Amount:</p>
                  <p>{currentUserJudgeData.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL} SOL</p>
                </div>
                <div className="flex gap-2">
                  <p className="font-semibold">Total Votes:</p>
                  <p>{currentUserJudgeData.account.totalVotes}</p>
                </div>
              </div>
              <div className="w-full mt-4">
                <button
                  onClick={() => handleWithdrawJudgeStake()}
                  className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white text-xl font-bold py-4 px-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/25 "
                >
                  😢 Unstake Amount
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigator - Only show for judges */}
        {isCurrentUserJudge && (
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('not-voted')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === 'not-voted'
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                      : 'text-purple-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  Not Voted
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === 'completed'
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                      : 'text-purple-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <CheckCheck className="w-4 h-4" />
                  Completed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Not Voted Tab - Show goals that need voting and user hasn't voted on yet */}
        {activeTab === 'not-voted' && isCurrentUserJudge && goalAccounts.data
          ?.filter((goal) => 
            goal.account.status.pendingVerification && 
            !hasUserVotedOnGoal(goal.account.goalId.toNumber())
          )
          .map((goal) => (
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
            
            {/* Voting Buttons - Only show if status is pendingVerification and voting deadline hasn't passed */}
            {goal.account.status.pendingVerification && !isDeadlinePassed(goal.account.votingDeadline.toNumber()) && (
              <div className="flex justify-center gap-4 py-2 mt-4">
                <button
                  onClick={() => handleVote({ vote: true, goalId: goal.account.goalId.toNumber(), goalPubkey: goal.publicKey, status: goal.account.status })}
                  className="w-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xl font-bold py-6 px-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-500/25 "
                >
                  Yes ✅
                </button>
                <button
                  onClick={() => handleVote({ vote: false, goalId: goal.account.goalId.toNumber(), goalPubkey: goal.publicKey, status: goal.account.status })}
                  className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white text-xl font-bold py-6 px-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/25 "
                >
                  No ❌
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Completed Tab - Show goals the current user has voted on */}
        {activeTab === 'completed' && voteRecordAccounts.data
          ?.filter((vote) => publicKey && vote.account.judge.equals(publicKey))
          .map((vote) => (
            <div key={vote.publicKey.toString()} className="bg-white/10 rounded-lg p-6 mb-4 backdrop-blur-sm">
              <div className="flex text-center gap-2">
                <p className="text-xl font-semibold">Goal Id: </p>
                <p className="text-2xl font-bold">{vote.account.goalId.toNumber()}</p>
              </div>
              <div className="flex text-center gap-2">
                <p className="text-xl font-semibold">Voted: </p>
                <p className={`text-2xl font-bold ${vote.account.vote ? 'text-green-400' : 'text-red-400'}`}>
                  {vote.account.vote ? "Yes ✅" : "No ❌"}
                </p>
              </div>
              <div className="flex text-center gap-2">
                <p className="text-xl font-semibold">Voted At: </p>
                <p className="text-2xl font-bold">{unixToSimpleFormat(vote.account.votedAt.toNumber())}</p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  </div>
}


// "use client"

// import { CheckCheck, Target, TrendingUp } from "lucide-react";
// import { useEffect, useState } from "react";
// import { WalletButton } from "../solana/solana-provider";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { useTimeStakerProgram } from "../counter/timestaker-data-access";
// import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// // TypeScript types for the proof type enum
// type ProofTypeVariant = 'image' | 'document' | 'link' | 'text' | 'video';

// type ProofTypeEnum = 
//   | { image: Record<string, never> }
//   | { document: Record<string, never> }
//   | { link: Record<string, never> }
//   | { text: Record<string, never> }
//   | { video: Record<string, never> };

// // Props interface for the component
// interface ProofTypeDisplayProps {
//   proofType?: ProofTypeEnum | null;
// }

// export default function DashboardDao() {
//     const { publicKey } = useWallet();
//     const { registerJudge, judgeAccounts, goalAccounts, voteButton, withdrawJudgeStake, voteRecordAccounts } = useTimeStakerProgram();
//     const [showButton, setShowButton] = useState(false);
//     const [activeTab, setActiveTab] = useState<'not-voted' | 'completed' | 'pending'>('not-voted');
 
//     useEffect(() => {
//       if (judgeAccounts.isLoading) {
//           return; // Wait for loading to complete
//       }

//       if (!publicKey) return;
      
//       const exist = judgeAccounts.data?.map((data) => data.account.judge.equals(publicKey));
//       console.log(JSON.stringify(exist));
//       console.log(judgeAccounts.data?.map((data) => data.account.judge.equals(publicKey)));
//       if (exist) {
//           setShowButton(false);
//       } else {
//           setShowButton(true);
//       }
//   }, [judgeAccounts.data, judgeAccounts.isLoading, publicKey]) // Add dependencies

//     const handleRegister = async() => {
//       if (publicKey) {
//         await registerJudge.mutateAsync({ judgePubkey: publicKey })
//       }
//     }

//     function unixToSimpleFormat(timestamp: number) {
//       const date = new Date(timestamp * 1000);
      
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
//       const hours = String(date.getHours()).padStart(2, '0');
//       const minutes = String(date.getMinutes()).padStart(2, '0');
//       const seconds = String(date.getSeconds()).padStart(2, '0');
      
//       return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//     }

//     function ProofTypeDisplay({ proofType }: ProofTypeDisplayProps) {
//       if (!proofType) return <span className="text-gray-400">No proof type</span>;
      
//       const variant = Object.keys(proofType)[0] as ProofTypeVariant;
//       const icons = {
//         image: '🖼️',
//         document: '📄',
//         link: '🔗',
//         text: '📝',
//         video: '🎥'
//       };
      
//       return (
//         <span className="inline-flex items-center gap-1">
//           <span>{icons[variant] || '❓'}</span>
//           <span className="capitalize">{variant || 'Unknown'}</span>
//         </span>
//       );
//     }

//     function isDeadlinePassed(deadline: number) {
//       return Date.now() > (deadline * 1000);
//     }

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const handleVote = async ({ vote, goalId, goalPubkey, status }: { vote: boolean, goalId: number, goalPubkey: PublicKey, status: any }) => {
//       if (publicKey && status.pendingVerification) {
//         await voteButton.mutateAsync({ goalPubkey, vote, goalId, judgePubkey: publicKey })
//       }
//     }

//     const handleWithdrawJudgeStake = async() => {
//       if (publicKey) {
//         await withdrawJudgeStake.mutateAsync({ judgeAuthorityPubkey: publicKey });
//       }
//     };
    
//     return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
//     {/* Background Pattern */}
//     <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
    
//     <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
//       <div className="w-full max-w-4xl">
//         <div className="flex justify-end">
//             <WalletButton />
//         </div>
//         {/* Header */}
//         {/* {showButton ? ( */}
//           <div className="text-center mb-12">
//             <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
//               <TrendingUp className="w-5 h-5 text-blue-400" />
//               <span className="text-sm font-medium text-white/90">Live Voting Dashboard</span>
//             </div>
            
//             <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
//               Stake your 1 SOL, Become Judge and participate in Voting
//               <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"> Reward rewards for voting</span>?
//             </h1>
            
//             <p className="text-xl text-white/70 max-w-2xl mx-auto">
//               Cast your vote and see real-time results from the community. Your voice matters in shaping our product&#39;s future.
//             </p>
        
//             <div className="flex justify-center bg-white/10 rounded-lg p-6 mb-4 backdrop-blur-sm py-10 my-10">
//               <button
//                 onClick={() => handleRegister()}
//                 className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl px-8 py-4 border border-white/20 text-center text-2xl font-semibold hover:cursor-pointer"
//               >
//                 Become Judge
//               </button>
//             </div>
//           </div>
//         {/* ): null} */}

//         {activeTab == "not-voted" && publicKey && judgeAccounts.data?.filter((judge) => {
//             judge.account.judge.equals(publicKey)
//           })
//           .map((data) => (
//             <div key={data.publicKey.toString()}>
//               <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-4 leading-tight">
//                 <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Judge </span>
//                 Dashboard
//               </h1>
//               <div className="bg-white/10 rounded-lg p-6 mb-4 backdrop-blur-sm">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex gap-2">
//                     <p className="font-semibold">Correct Votes:</p>
//                     <p>{data.account.correctVotes}</p>
//                   </div>
//                   <div className="flex gap-2">
//                     <p className="font-semibold">Registered At:</p>
//                     <p>{unixToSimpleFormat(data.account.registeredAt.toNumber())}</p>
//                   </div>
//                   <div className="flex gap-2">
//                     <p className="font-semibold">Reputation Score:</p>
//                     <p>{data.account.reputationScore}</p>
//                   </div>
//                   <div className="flex gap-2">
//                     <p className="font-semibold">Staked Amount:</p>
//                     <p>{data.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL} SOL</p>
//                   </div>
//                   <div className="flex gap-2">
//                     <p className="font-semibold">Total Votes:</p>
//                     <p>{data.account.totalVotes}</p>
//                   </div>
//                 </div>
//                 <div className="w-full">
//                   <button
//                     onClick={() => handleWithdrawJudgeStake()}
//                     className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white text-xl font-bold py-4 px-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/25 "
//                   >
//                     😢 Unstake Amount
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         }

//         {/* Navigator */}
//         {publicKey && <div className="flex justify-center mb-8">
//           <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setActiveTab('not-voted')}
//                 className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
//                   activeTab === 'not-voted'
//                     ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
//                     : 'text-purple-200 hover:text-white hover:bg-white/10'
//                 }`}
//               >
//                 <Target className="w-4 h-4" />
//                 Not Voted
//               </button>
//               <button
//                 onClick={() => setActiveTab('completed')}
//                 className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
//                   activeTab === 'completed'
//                     ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
//                     : 'text-purple-200 hover:text-white hover:bg-white/10'
//                 }`}
//               >
//                 <CheckCheck className="w-4 h-4" />
//                 Completed
//               </button>
//             </div>
//           </div>
//         </div>}

//         {activeTab == 'not-voted' && publicKey && judgeAccounts.data?.filter((judge) => judge.account.judge.equals(publicKey)) && goalAccounts.data?.map((goal) => (
//           <div key={goal.publicKey.toString()} className="bg-white/10 rounded-lg p-6 mb-4 backdrop-blur-sm">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
//               {/* Basic Info */}
//               <div>
//                 <p className="font-semibold text-gray-300">Creator:</p>
//                 <p className="text-sm font-mono break-all">{goal.account.creator.toBase58()}</p>
//               </div>
              
//               <div>
//                 <p className="font-semibold text-gray-300">Goal ID:</p>
//                 <p>{goal.account.goalId.toNumber()}</p>
//               </div>
              
//               {/* Description */}
//               <div className="md:col-span-2">
//                 <p className="font-semibold text-gray-300">Description:</p>
//                 <p className="whitespace-pre-wrap">{goal.account.description}</p>
//               </div>
              
//               {/* Stake Amount */}
//               <div>
//                 <p className="font-semibold text-gray-300">Stake Amount:</p>
//                 <p>{goal.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL} SOL</p>
//               </div>
              
//               {/* Status */}
//               <div>
//                 <p className="font-semibold text-gray-300">Status:</p>
//                 <p className={`inline-block px-2 py-1 rounded text-sm ${
//                   goal.account.status.active ? 'bg-green-500/20 text-green-400' :
//                   goal.account.status.completed ? 'bg-blue-500/20 text-blue-400' :
//                   goal.account.status.failed ? 'bg-red-500/20 text-red-400' :
//                   goal.account.status.cancelled ? 'bg-gray-500/20 text-gray-400' :
//                   'bg-yellow-500/20 text-yellow-400'
//                 }`}>
//                   {Object.keys(goal.account.status)[0].toUpperCase()}
//                 </p>
//               </div>
              
//               {/* Timestamps */}
//               <div>
//                 <p className="font-semibold text-gray-300">Created At:</p>
//                 <p>{unixToSimpleFormat(goal.account.createdAt.toNumber())}</p>
//               </div>
              
//               <div>
//                 <p className="font-semibold text-gray-300">Deadline:</p>
//                 <p className={isDeadlinePassed(goal.account.deadline.toNumber()) ? 'text-red-400' : 'text-green-400'}>
//                   {unixToSimpleFormat(goal.account.deadline.toNumber())}
//                   {isDeadlinePassed(goal.account.deadline.toNumber()) && ' (EXPIRED)'}
//                 </p>
//               </div>
              
//               <div>
//                 <p className="font-semibold text-gray-300">Voting Deadline:</p>
//                 <p className={isDeadlinePassed(goal.account.votingDeadline.toNumber()) ? 'text-red-400' : 'text-green-400'}>
//                   {unixToSimpleFormat(goal.account.votingDeadline.toNumber())}
//                   {isDeadlinePassed(goal.account.votingDeadline.toNumber()) && ' (EXPIRED)'}
//                 </p>
//               </div>
              
//               {/* Finalized At (if exists) */}
//               {goal.account.finalizedAt && (
//                 <div>
//                   <p className="font-semibold text-gray-300">Finalized At:</p>
//                   <p>{unixToSimpleFormat(goal.account.finalizedAt.toNumber())}</p>
//                 </div>
//               )}
              
//               {/* Proof Data (if exists) */}
//               {goal.account.proofData && (
//                 <div className="md:col-span-2">
//                   <p className="font-semibold text-gray-300">Proof Data:</p>
//                   <p className="whitespace-pre-wrap break-all">{goal.account.proofData}</p>
//                 </div>
//               )}
              
//               {/* Proof Type (if exists) */}
//               {goal.account.proofType && (
//                 <div>
//                   <p className="font-semibold text-gray-300">Proof Type:</p>
//                   <p className="capitalize">
//                   <ProofTypeDisplay proofType={goal.account.proofType} />
//                   </p>
//                 </div>
//               )}
              
//               {/* Proof Submitted At (if exists) */}
//               {goal.account.proofSubmittedAt && (
//                 <div>
//                   <p className="font-semibold text-gray-300">Proof Submitted At:</p>
//                   <p>{unixToSimpleFormat(goal.account.proofSubmittedAt.toNumber())}</p>
//                 </div>
//               )}
              
//               {/* Voting Stats */}
//               <div>
//                 <p className="font-semibold text-gray-300">Total Votes:</p>
//                 <p>{goal.account.totalVotes.toNumber()}</p>
//               </div>
              
//               <div>
//                 <p className="font-semibold text-gray-300">Yes Votes:</p>
//                 <p className="text-green-400">
//                   {goal.account.yesVotes.toNumber()} 
//                   {goal.account.totalVotes.toNumber() > 0 && 
//                     ` (${((goal.account.yesVotes.toNumber() / goal.account.totalVotes.toNumber()) * 100).toFixed(1)}%)`
//                   }
//                 </p>
//               </div>
              
//               <div>
//                 <p className="font-semibold text-gray-300">No Votes:</p>
//                 <p className="text-red-400">
//                   {goal.account.totalVotes.toNumber() - goal.account.yesVotes.toNumber()}
//                   {goal.account.totalVotes.toNumber() > 0 && 
//                     ` (${(((goal.account.totalVotes.toNumber() - goal.account.yesVotes.toNumber()) / goal.account.totalVotes.toNumber()) * 100).toFixed(1)}%)`
//                   }
//                 </p>
//               </div>
//             </div>
//             {/* TODO: add logic to not show vote buttons find judge and already voted */}
//             {goal.account.status.pendingVerification ? (
//                 <div className="flex justify-center gap-4 py-2">
//                   <button
//                     onClick={() => handleVote({ vote: true, goalId: goal.account.goalId.toNumber(), goalPubkey: goal.publicKey, status: goal.account.status })}
//                     className="w-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xl font-bold py-6 px-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-500/25 "
//                   >
//                     Yes
//                   </button>
//                   <button
//                     onClick={() => handleVote({ vote: false, goalId: goal.account.goalId.toNumber(), goalPubkey: goal.publicKey, status: goal.account.status })}
//                     className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white text-xl font-bold py-6 px-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/25 "
//                   >
//                     No
//                   </button>
//                 </div>
//              ) : null} 
//           </div>
//         ))}


//         {/* TODO: add logic to show goals which are completed and voted by this judge */}
//         {activeTab == 'completed' && voteRecordAccounts.data?.filter((vote) => {
//             return vote.account.judge.equals(publicKey!);
//           })
//           .map((vote) => (
//             <div key={vote.publicKey.toString()} className="bg-white/10 rounded-lg p-6 mb-4 backdrop-blur-sm">
//               <div className="flex text-center gap-2">
//                 <p className="text-xl font-semibold">Goal Id: </p>
//                 <p className="text-2xl font-bold">{vote.account.goalId.toNumber()}</p>
//               </div>
//               <div className="flex text-center gap-2">
//                 <p className="text-xl font-semibold">Voted: </p>
//                 <p className="text-2xl font-bold">{vote.account.vote ? "Yes" : "No"}</p>
//               </div>
//               <div className="flex text-center gap-2">
//                 <p className="text-xl font-semibold">Voted At: </p>
//                 <p className="text-2xl font-bold">{unixToSimpleFormat(vote.account.votedAt.toNumber())}</p>
                
//               </div>
//             </div>
//           ))
//         }
//         {/* {activeTab == 'completed' && (
//           goalAccounts.data?.filter((goal) => {
//             // Check if status is completed - handle different possible structures
//             return goal.account.status.completed || 
//             goal.account.status?.completed !== undefined ||
//             (typeof goal.account.status === 'object' && 
//              Object.hasOwnProperty.call(goal.account.status, 'completed'));
//           })
//         )} */}
//       </div>
//     </div>
//   </div>
// }