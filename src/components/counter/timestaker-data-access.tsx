'use client'

import { getTimeStakerProgram, getTimeStakerProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import { BN } from 'bn.js'

type ProofTypeVariant = 
  | { image: {} }
  | { document: {} }
  | { link: {} }
  | { text: {} }
  | { video: {} }

interface CreateGoalsArgs {
  goal_id: number,
  description: string, 
  stakeAmount: number, 
  deadline: number, 
  creatorPubkey: PublicKey
}

interface InitializeArgs {
  authority: PublicKey
}

interface SubmitProofArgs {
  goalPubkey: PublicKey,
  proofData: string,
  proofType: ProofTypeVariant, // { image: {} } or { text: {} }
  creatorPubkey: PublicKey
}

interface RegisterJudgeArgs {
  // use wallet as judge authority
  judgePubkey: PublicKey
}

interface VoteArgs {
  goalPubkey: PublicKey,
  judgePubkey: PublicKey,
  vote: boolean,
  goalId: number
}

interface FinalizeGoalArgs {
  goalPubkey: PublicKey;
  creatorPubkey: PublicKey
}

interface UpdateJudgeReputationArgs {
  judgePubkey: PublicKey,
  voteRecordPubkey: PublicKey,
  goalPubkey: PublicKey
}

interface WithdrawJudgeStakeArgs {
  judgeAuthorityPubkey: PublicKey
}

export function useTimeStakerProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getTimeStakerProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getTimeStakerProgram(provider, programId), [provider, programId])

  const goalAccounts = useQuery({
    queryKey: ['goals', 'all', { cluster }],
    queryFn: () => program.account.goal.all(),
  })

  const judgeAccounts = useQuery({
    queryKey: ['judges', 'all', { cluster }],
    queryFn: () => program.account.judge.all(),
  })

  const voteRecordAccounts = useQuery({
    queryKey: ['voteRecord', 'all', { cluster }],
    queryFn: () => program.account.voteRecord.all(),
  })

  const globalStateAccount = useQuery({
    queryKey: ['globalState', 'all', { cluster }],
    queryFn: () => program.account.globalState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation<string, Error, InitializeArgs>({
    mutationKey: ['globalState', 'initialize', { cluster }],
    mutationFn: async({ authority }) => {
      const globalStateKeypair = Keypair.generate();

      return await program.methods
        .initialize(authority)
        .accounts({ 
          authority: authority,
          globalState: globalStateKeypair.publicKey,
          systemProgram: SystemProgram.programId
        }as any)
        .signers([globalStateKeypair])
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await globalStateAccount.refetch()
    },
    onError: () => {
      toast.error('Failed to initialize program')
    },
  })

  const createGoals = useMutation<string, Error, CreateGoalsArgs>({
    mutationKey: ['goals', 'create', { cluster }],
    mutationFn: async({ goal_id, description, stakeAmount, deadline, creatorPubkey }) => {

      const [goalPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('goal'), new BN(goal_id).toArrayLike(Buffer, 'le', 8)],
        program.programId
      )

      const globalStateAccounts = await program.account.globalState.all();
      if (globalStateAccounts.length === 0) {
        throw new Error('Global state not initialized');
      }
      const globalStatePubkey = globalStateAccounts[0].publicKey;

      return await program.methods
        .createGoal(new BN(goal_id), description, new BN(stakeAmount), new BN(deadline))
        .accounts({ 
          creator: creatorPubkey,
          goal: goalPDA,
          globalState: globalStatePubkey,
          systemProgram: SystemProgram.programId
        }as any)
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await goalAccounts.refetch()
    },
    onError: (error) => {
      toast.error(`Failed to creating goal: ${error.message}`);
    },
  })

  const submitProof = useMutation<string, Error, SubmitProofArgs>({
    mutationKey: ['goals', 'submitProof', { cluster }],
    mutationFn: async({ goalPubkey, proofData, proofType, creatorPubkey }) => {

      return await program.methods
        .submitProof(proofData, proofType)
        .accounts({ 
          goal: goalPubkey,
          creator: creatorPubkey
        }as any)
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await goalAccounts.refetch()
    },
    onError: (error) => {
      toast.error(`Failed to submitting proof: ${error.message}`);
    },
  })

  const registerJudge = useMutation<string, Error, RegisterJudgeArgs>({
    mutationKey: ['judges', 'register', { cluster }],
    mutationFn: async({ judgePubkey }) => {
      const [judgePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('judge'), judgePubkey.toBuffer()],
        program.programId
      );

      const globalStateAccounts = await program.account.globalState.all();
      if (globalStateAccounts.length === 0) {
        throw new Error('Global state not initialized');
      }
      const globalStatePubkey = globalStateAccounts[0].publicKey;

      return await program.methods
        .registerJudge()
        .accounts({ 
          judge: judgePDA,
          judgeAuthority: judgePubkey,
          globalState: globalStatePubkey,
          systemProgram: SystemProgram.programId
        }as any)
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await goalAccounts.refetch()
    },
    onError: (error) => {
      toast.error(`Failed to register as judge: ${error.message}`);
    },
  })

  const voteButton = useMutation<string, Error, VoteArgs>({
    mutationKey: ['votes', 'cast', { cluster }],
    mutationFn: async({ goalPubkey, goalId, vote, judgePubkey }) => {
      const [judgePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('judge'), judgePubkey.toBuffer()],
        program.programId
      );

      const [voteRecordPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('vote'), new BN(goalId).toArrayLike(Buffer, 'le', 8), judgePubkey.toBuffer()],
        program.programId
      )

      return await program.methods
        .vote(vote)
        .accounts({ 
          goal: goalPubkey,
          judge: judgePDA,
          voteRecord: voteRecordPDA,
          judgeAuthority: judgePubkey,
          systemProgram: SystemProgram.programId
        }as any)
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await goalAccounts.refetch()
    },
    onError: (error) => {
      toast.error(`Failed to cast vote: ${error.message}`);
    },
  })

  const finalizeGoal = useMutation<string, Error, FinalizeGoalArgs>({
    mutationKey: ['goals', 'finalize', { cluster }],
    mutationFn: async({ goalPubkey, creatorPubkey }) => {
      const globalStateAccounts = await program.account.globalState.all();
      if (globalStateAccounts.length === 0) {
        throw new Error('Global state not initialized')
      }

      const globalStatePubkey = globalStateAccounts[0].publicKey;

      return await program.methods
        .finalizeGoal()
        .accounts({ 
          goal: goalPubkey,
          creator: creatorPubkey,
          globalState: globalStatePubkey
        }as any)
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await goalAccounts.refetch()
    },
    onError: (error) => {
      toast.error(`Failed to finalize goal: ${error.message}`);
    },
  })

  const updateJudgeReputation = useMutation<string, Error, UpdateJudgeReputationArgs>({
    mutationKey: ['judge', 'updateReputation', { cluster }],
    mutationFn: async({ judgePubkey, voteRecordPubkey, goalPubkey }) => {
      
      return await program.methods
        .updateJudgeReputation()
        .accounts({ 
          goal: goalPubkey,
          judge: judgePubkey,
          voteRecord: voteRecordPubkey
        }as any)
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await goalAccounts.refetch()
    },
    onError: (error) => {
      toast.error(`Failed to update judge reputation: ${error.message}`);
    },
  })

  const withdrawJudgeStake = useMutation<string, Error, WithdrawJudgeStakeArgs>({
    mutationKey: ['judge', 'updateReputation', { cluster }],
    mutationFn: async({ judgeAuthorityPubkey }) => {
      const [judgePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('judge'), judgeAuthorityPubkey.toBuffer()],
        program.programId
      )
      
      return await program.methods
        .withdrawJudgeStake()
        .accounts({ 
          judge: judgePDA,
          judgeAuthority: judgeAuthorityPubkey
        }as any)
        .rpc()
      },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await goalAccounts.refetch()
    },
    onError: (error) => {
      toast.error(`Failed to withdraw judge stake: ${error.message}`);
    },
  })

  return {
    program,
    programId,
    goalAccounts,
    judgeAccounts,
    globalStateAccount,
    getProgramAccount,
    initialize,
    createGoals,
    registerJudge,
    submitProof,
    voteButton,
    finalizeGoal,
    updateJudgeReputation,
    withdrawJudgeStake,
    voteRecordAccounts
  }
}

export function useTimeStakerProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program } = useTimeStakerProgram()

  const accountQuery = useQuery({
    queryKey: ['goal', 'fetch', { cluster, account }],
    queryFn: () => program.account.goal.fetch(account),
  })

  const judgeQuery = useQuery({
    queryKey: ['judge', 'fetch', { cluster, account }],
    queryFn: () => program.account.judge.fetch(account),
  })

  const voteRecordQuery = useQuery({
    queryKey: ['voteRecord', 'fetch', { cluster, account }],
    queryFn: () => program.account.voteRecord.fetch(account),
  })

  return {
    accountQuery,
    judgeQuery,
    voteRecordQuery
  }
}

export function getGoalPDA(programId: PublicKey, goalId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('goal'), new BN(goalId).toArrayLike(Buffer, 'le', 8)],
    programId
  )
}

export function getJudgePDA(programId: PublicKey, judgeAuthority: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('judge'), judgeAuthority.toBuffer()],
    programId
  )
}

export function getVoteRecordPDA(programId: PublicKey, goalId: number, judgeAuthority: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vote'), new BN(goalId).toArrayLike(Buffer, 'le', 8), judgeAuthority.toBuffer()],
    programId
  )
}

export const ProofType = {
  Image: { image: {} },
  Document: { document: {} },
  Link: { link: {} },
  Text: { text: {} },
  Video: { video: {} },
} as const