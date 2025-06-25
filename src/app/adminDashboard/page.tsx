"use client"

import { useTimeStakerProgram } from "@/components/counter/timestaker-data-access";
import { ADMINPUBKEY } from "@/components/MainPageComponents/TimeStaker";
import { useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
    const { publicKey } = useWallet()
    const router = useRouter();
    const { initialize, globalStateAccount, judgeAccounts, updateJudgeReputation, finalizeGoal, voteRecordAccounts, goalAccounts } = useTimeStakerProgram();

    const [showInitializeButton, setShowInitializeButton] = useState(false);
    
    // Check if user is admin, redirect if not
    useEffect(() => {
        if (!publicKey || !publicKey.equals(ADMINPUBKEY)) {
            router.push('/');
        }
    }, [publicKey, router]) // Add dependencies

    // Check if program needs to be initialized
    useEffect(() => {
        if (globalStateAccount.isLoading) {
            return; // Wait for loading to complete
        }
        
        // Show initialize button if no global state exists (needs initialization)
        if (!globalStateAccount.data || globalStateAccount.data.length === 0) {
            setShowInitializeButton(true);
        } else {
            setShowInitializeButton(false);
        }
    }, [globalStateAccount.data, globalStateAccount.isLoading]) // Add dependencies

    async function handleInitialize() {
        if (publicKey) {
            try {
                const tx = await initialize.mutateAsync({ authority: publicKey });
                toast.success("Program initialized successfully!");
                console.log("Transaction:", tx);
            } catch (error) {
                console.error("Error initializing:", error);
                toast.error("Failed to initialize program");
            }
        }
    }

    // Don't render anything if not admin (while redirecting)
    if (!publicKey || !publicKey.equals(ADMINPUBKEY)) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-900 via-blue-900 to-red-900 text-white">
            <div className="py-5">
                <h1 className="text-6xl font-bold text-center">Admin's Dashboard</h1>
            </div>
            
            {/* Show loading state */}
            {globalStateAccount.isLoading && (
                <div className="text-center py-8">
                    <p className="text-xl">Loading...</p>
                </div>
            )}
            
            {/* Show initialize button if program not initialized */}
            {showInitializeButton && (
                <div className="text-center py-8">
                    <button
                        onClick={handleInitialize}
                        disabled={initialize.isPending}
                        className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl px-8 py-4 border border-white/20 text-center font-semibold hover:shadow-md shadow-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {initialize.isPending ? "Initializing..." : "Initialize Program"}
                    </button>
                </div>
            )}
            
            {/* Show global state data */}
            {globalStateAccount.data && globalStateAccount.data.length > 0 && (
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <h2 className="text-3xl font-bold mb-6">Global State</h2>
                    {globalStateAccount.data.map((data) => (
                        <div key={data.publicKey.toString()} className="bg-white/10 rounded-lg p-6 mb-4 backdrop-blur-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-semibold">Authority:</p>
                                    <p className="text-sm font-mono break-all">{data.account.authority.toBase58()}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Judge Reward Rate:</p>
                                    <p>{data.account.judgeRewardRate}%</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Min Judge Stakes:</p>
                                    <p>{data.account.minJudgeStakes.toNumber() / LAMPORTS_PER_SOL} SOL</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Reward Pool:</p>
                                    <p>{data.account.rewardPool.toNumber()} lamports</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Total Goals:</p>
                                    <p>{data.account.totalGoals.toNumber()}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Total Judges:</p>
                                    <p>{data.account.totalJudges.toNumber()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* {goalAccounts.data?.map((goal) => (
                <div key={goal.account.goalId.toString()}>
                    {goal.account.status.completed}
                </div>
            ))} */}
            
            {/* Show error state */}
            {globalStateAccount.error && (
                <div className="text-center py-8">
                    <p className="text-red-400">Error loading global state: {globalStateAccount.error.message}</p>
                </div>
            )}
        </div>
    );
}