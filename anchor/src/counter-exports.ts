// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TimeStakerIDL from '../target/idl/time_staker.json'
import type { TimeStaker } from '../target/types/time_staker'

// Re-export the generated IDL and type
export { TimeStaker, TimeStakerIDL }

// The programId is imported from the program IDL.
export const TIME_STAKER_PROGRAM_ID = new PublicKey(TimeStakerIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getTimeStakerProgram(provider: AnchorProvider, address?: PublicKey): Program<TimeStaker> {
  return new Program({ ...TimeStakerIDL, address: address ? address.toBase58() : TimeStakerIDL.address } as TimeStaker, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getTimeStakerProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('CwBMDgLTF4gXE7bigVyNBYJYtZ8zqp9nqVEpVk1XDo1M')
    case 'mainnet-beta':
    default:
      return TIME_STAKER_PROGRAM_ID
  }
}
