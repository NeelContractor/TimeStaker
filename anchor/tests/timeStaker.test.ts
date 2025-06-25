import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TimeStaker } from "../target/types/time_staker";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  createAccount, 
  mintTo, 
  getAccount 
} from "@solana/spl-token";
import { BN } from "bn.js";

describe("time_staker", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TimeStaker as Program<TimeStaker>;
  
  // Test accounts
  let authority: Keypair;
  let creator: Keypair;
  let judge1: Keypair;
  let judge2: Keypair;
  let globalState: Keypair;
  let mint: PublicKey;
  let creatorTokenAccount: PublicKey;
  let judge1TokenAccount: PublicKey;
  let judge2TokenAccount: PublicKey;
  let goalEscrow: PublicKey;
  let judge1Escrow: PublicKey;
  let judge2Escrow: PublicKey;

  // Test data
  const goalId = new BN(1);
  const stakeAmount = new BN(0.5 * LAMPORTS_PER_SOL); // 0.5 SOL
  const judgeStakeAmount = new BN(1 * LAMPORTS_PER_SOL); // 1 SOL
  const goalDescription = "Complete 30 days of daily exercise";
  const deadline = Math.floor(Date.now() / 1000) + 30 * 24 * 3600; // 30 days from now

  beforeAll(async () => {
    // Initialize keypairs
    authority = Keypair.generate();
    creator = Keypair.generate();
    judge1 = Keypair.generate();
    judge2 = Keypair.generate();
    globalState = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(authority.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(creator.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(judge1.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(judge2.publicKey, 10 * LAMPORTS_PER_SOL);

    // Wait for airdrops to confirm
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create mint and token accounts
    mint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      9
    );

    creatorTokenAccount = await createAccount(
      provider.connection,
      creator,
      mint,
      creator.publicKey
    );

    judge1TokenAccount = await createAccount(
      provider.connection,
      judge1,
      mint,
      judge1.publicKey
    );

    judge2TokenAccount = await createAccount(
      provider.connection,
      judge2,
      mint,
      judge2.publicKey
    );

    goalEscrow = await createAccount(
      provider.connection,
      authority,
      mint,
      authority.publicKey
    );

    judge1Escrow = await createAccount(
      provider.connection,
      authority,
      mint,
      authority.publicKey
    );

    judge2Escrow = await createAccount(
      provider.connection,
      authority,
      mint,
      authority.publicKey
    );

    // Mint tokens to test accounts
    await mintTo(
      provider.connection,
      authority,
      mint,
      creatorTokenAccount,
      authority,
      10 * LAMPORTS_PER_SOL
    );

    await mintTo(
      provider.connection,
      authority,
      mint,
      judge1TokenAccount,
      authority,
      10 * LAMPORTS_PER_SOL
    );

    await mintTo(
      provider.connection,
      authority,
      mint,
      judge2TokenAccount,
      authority,
      10 * LAMPORTS_PER_SOL
    );
    console.log("done");
  });

  describe("initialize", () => {
    it("Should initialize global state successfully", async () => {
      const tx = await program.methods
        .initialize(authority.publicKey)
        .accounts({
          authority: authority.publicKey,
          globalState: globalState.publicKey,
          systemProgram: SystemProgram.programId,
        }as any)
        .signers([authority, globalState])
        .rpc({ skipPreflight: true });

      // console.log(tx);

      const globalStateAccount = await program.account.globalState.fetch(globalState.publicKey);
      expect(globalStateAccount.authority.toString()).toEqual(authority.publicKey.toString());
      expect(globalStateAccount.totalGoals.toNumber()).toEqual(0);
      expect(globalStateAccount.totalJudges.toNumber()).toEqual(0);
      expect(globalStateAccount.minJudgeStakes.toNumber()).toEqual(1_000_000_000);
      expect(globalStateAccount.judgeRewardRate).toEqual(500);
      expect(globalStateAccount.rewardPool.toNumber()).toEqual(0);
    });
  });

  describe("create_goal", () => {
    it("Should create a goal successfully", async () => {
      const [goalPda, goalBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal"), goalId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const tx = await program.methods
        .createGoal(
          goalId,
          goalDescription,
          stakeAmount,
          new BN(deadline),
        )
        .accounts({
          creator: creator.publicKey,
          goal: goalPda,
          creatorTokenAccount,
          goalEscrow,
          globalState: globalState.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        }as any)
        .signers([creator])
        .rpc({ skipPreflight: true });

      console.log(tx);

      const goalAccount = await program.account.goal.fetch(goalPda);
      console.log(goalAccount);
      expect(goalAccount.creator.toString()).toEqual(creator.publicKey.toString());
      expect(goalAccount.goalId.toNumber()).toEqual(goalId.toNumber());
      expect(goalAccount.description).toEqual(goalDescription);
      expect(goalAccount.stakeAmount.toNumber()).toEqual(stakeAmount.toNumber());
      expect(goalAccount.deadline.toNumber()).toEqual(deadline);
      // expect(goalAccount.status).toContainEqual({ active: {} }); //
      console.log(goalAccount.status);
      expect(goalAccount.totalVotes.toNumber()).toEqual(0);
      expect(goalAccount.yesVotes.toNumber()).toEqual(0);

      // Check that stake was transferred
      const escrowAccount = await getAccount(provider.connection, goalEscrow);
      expect(escrowAccount.amount.toString()).toEqual(stakeAmount.toString());
    });

    // it("Should fail with insufficient stake", async () => {
    //   const insufficientStake = new BN(0.05 * LAMPORTS_PER_SOL); // 0.05 SOL
    //   const [goalPda] = PublicKey.findProgramAddressSync(
    //     [Buffer.from("goal"), new BN(2).toArrayLike(Buffer, "le", 8)],
    //     program.programId
    //   );

    //   try {
    //     await program.methods
    //       .createGoal(
    //         new BN(2),
    //         "Test goal",
    //         insufficientStake,
    //         new BN(deadline),
    //         { personal: {} }
    //       )
    //       .accounts({
    //         creator: creator.publicKey,
    //         goal: goalPda,
    //         creatorTokenAccount,
    //         goalEscrow,
    //         globalState: globalState.publicKey,
    //         tokenProgram: TOKEN_PROGRAM_ID,
    //         systemProgram: SystemProgram.programId,
    //       }as any)
    //       .signers([creator])
    //       .rpc();
        
    //     expect.fail("Should have failed with insufficient stake"); //
    //   } catch (error) {
    //     console.log(error)
    //     expect(error.error.errorMessage).to.include("Insufficient stake amount");
    //   }
    // });

    // it("Should fail with invalid deadline", async () => {
    //   const pastDeadline = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    //   const [goalPda] = PublicKey.findProgramAddressSync(
    //     [Buffer.from("goal"), new BN(3).toArrayLike(Buffer, "le", 8)],
    //     program.programId
    //   );

    //   try {
    //     await program.methods
    //       .createGoal(
    //         new BN(3),
    //         "Test goal",
    //         stakeAmount,
    //         new BN(pastDeadline),
    //         { personal: {} }
    //       )
    //       .accounts({
    //         creator: creator.publicKey,
    //         goal: goalPda,
    //         creatorTokenAccount,
    //         goalEscrow,
    //         globalState: globalState.publicKey,
    //         tokenProgram: TOKEN_PROGRAM_ID,
    //         systemProgram: SystemProgram.programId,
    //       }as any)
    //       .signers([creator])
    //       .rpc();
        
    //     expect.fail("Should have failed with invalid deadline");
    //   } catch (error) {
    //     expect(error.error.errorMessage).to.include("Invalid Deadline");
    //   }
    // });
  });

  describe("submit_proof", () => {
    let goalPda: PublicKey;

    beforeAll(async () => {
      const goalId4 = new BN(4);
      [goalPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal"), goalId4.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const tx = await program.methods
        .createGoal(
          goalId4,
          "Test goal for proof",
          stakeAmount,
          new BN(deadline),
        )
        .accounts({
          creator: creator.publicKey,
          goal: goalPda,
          creatorTokenAccount,
          goalEscrow,
          globalState: globalState.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        }as any)
        .signers([creator])
        .rpc({ skipPreflight: true });

      console.log(tx);
    });

    it("Should submit proof successfully", async () => {
      const proofData = "https://example.com/proof-image.jpg";

      const tx = await program.methods
        .submitProof(proofData, { image: {} })
        .accounts({
          goal: goalPda,
          creator: creator.publicKey,
        })
        .signers([creator])
        .rpc({ skipPreflight: true });

      console.log(tx);

      const goalAccount = await program.account.goal.fetch(goalPda);
      console.log(goalAccount);
      expect(goalAccount.proofData).toEqual(proofData);
      expect(goalAccount.proofType).toContainEqual({ image: {} }); 
      expect(goalAccount.status).toContainEqual({ pendingVerification: {} });
      expect(goalAccount.proofSubmittedAt).not.toBeNull;
    });

    // it("Should fail when non-creator tries to submit proof", async () => {
    //   try {
    //     await program.methods
    //       .submitProof("fake proof", { text: {} })
    //       .accounts({
    //         goal: goalPda,
    //         creator: judge1.publicKey,
    //       })
    //       .signers([judge1])
    //       .rpc();
        
    //     expect.fail("Should have failed with unauthorized");
    //   } catch (error) {
    //     expect(error.error.errorMessage).to.include("Unauthorized");
    //   }
    // });
  });

  describe("register_judge", () => {
    it("Should register judge successfully", async () => {
      const [judgePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("judge"), judge1.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .registerJudge()
        .accounts({
          judge: judgePda,
          judgeAuthority: judge1.publicKey,
          judgeTokenAccount: judge1TokenAccount,
          judgeEscrow: judge1Escrow,
          globalState: globalState.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        }as any)
        .signers([judge1])
        .rpc();

      const judgeAccount = await program.account.judge.fetch(judgePda);
      expect(judgeAccount.judge.toString()).toEqual(judge1.publicKey.toString());
      expect(judgeAccount.stakeAmount.toNumber()).toEqual(1_000_000_000);
      expect(judgeAccount.reputationScore).toEqual(100);
      expect(judgeAccount.totalVotes).toEqual(0);
      expect(judgeAccount.correctVotes).toEqual(0);
      expect(judgeAccount.isActive).toBeTruthy;

      // Check that stake was transferred
      const escrowAccount = await getAccount(provider.connection, judge1Escrow);
      expect(escrowAccount.amount.toString()).toEqual("1000000000");
    });

    it("Should register second judge successfully", async () => {
      const [judgePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("judge"), judge2.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .registerJudge()
        .accounts({
          judge: judgePda,
          judgeAuthority: judge2.publicKey,
          judgeTokenAccount: judge2TokenAccount,
          judgeEscrow: judge2Escrow,
          globalState: globalState.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        }as any)
        .signers([judge2])
        .rpc();

      const judgeAccount = await program.account.judge.fetch(judgePda);
      expect(judgeAccount.judge.toString()).toEqual(judge2.publicKey.toString());
    });
  });

  // describe("vote", () => {
  //   let goalPda: PublicKey;
  //   let judge1Pda: PublicKey;
  //   let judge2Pda: PublicKey;

  //   beforeAll(async () => {
  //     const goalId5 = new BN(5);
  //     [goalPda] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("goal"), goalId5.toArrayLike(Buffer, "le", 8)],
  //       program.programId
  //     );

  //     [judge1Pda] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("judge"), judge1.publicKey.toBuffer()],
  //       program.programId
  //     );

  //     [judge2Pda] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("judge"), judge2.publicKey.toBuffer()],
  //       program.programId
  //     );

  //     // Create goal and submit proof
  //     await program.methods
  //       .createGoal(
  //         goalId5,
  //         "Test goal for voting",
  //         stakeAmount,
  //         new BN(deadline),
  //         { personal: {} }
  //       )
  //       .accounts({
  //         creator: creator.publicKey,
  //         goal: goalPda,
  //         creatorTokenAccount,
  //         goalEscrow,
  //         globalState: globalState.publicKey,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         systemProgram: SystemProgram.programId,
  //       }as any)
  //       .signers([creator])
  //       .rpc();

  //     await program.methods
  //       .submitProof("Test proof", { image: {} })
  //       .accounts({
  //         goal: goalPda,
  //         creator: creator.publicKey,
  //       })
  //       .signers([creator])
  //       .rpc();
  //   });

  //   it("Should allow judge to vote yes", async () => {
  //     const [voteRecordPda] = PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from("vote"),
  //         new BN(5).toArrayLike(Buffer, "le", 8),
  //         judge1.publicKey.toBuffer()
  //       ],
  //       program.programId
  //     );

  //     await program.methods
  //       .vote(true)
  //       .accounts({
  //         goal: goalPda,
  //         judge: judge1Pda,
  //         voteRecord: voteRecordPda,
  //         judgeAuthority: judge1.publicKey,
  //         systemProgram: SystemProgram.programId,
  //       }as any)
  //       .signers([judge1])
  //       .rpc();

  //     const voteRecord = await program.account.voteRecord.fetch(voteRecordPda);
  //     expect(voteRecord.goalId.toNumber()).toEqual(5);
  //     expect(voteRecord.judge.toString()).toEqual(judge1.publicKey.toString());
  //     expect(voteRecord.vote).toBeTruthy;

  //     const goalAccount = await program.account.goal.fetch(goalPda);
  //     expect(goalAccount.totalVotes.toNumber()).toEqual(1);
  //     expect(goalAccount.yesVotes.toNumber()).toEqual(1);
  //   });

  //   it("Should allow second judge to vote no", async () => {
  //     const [voteRecordPda] = PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from("vote"),
  //         new BN(5).toArrayLike(Buffer, "le", 8),
  //         judge2.publicKey.toBuffer()
  //       ],
  //       program.programId
  //     );

  //     await program.methods
  //       .vote(false)
  //       .accounts({
  //         goal: goalPda,
  //         judge: judge2Pda,
  //         voteRecord: voteRecordPda,
  //         judgeAuthority: judge2.publicKey,
  //         systemProgram: SystemProgram.programId,
  //       }as any)
  //       .signers([judge2])
  //       .rpc();

  //     const voteRecord = await program.account.voteRecord.fetch(voteRecordPda);
  //     expect(voteRecord.vote).toBeFalsy;

  //     const goalAccount = await program.account.goal.fetch(goalPda);
  //     expect(goalAccount.totalVotes.toNumber()).toEqual(2);
  //     expect(goalAccount.yesVotes.toNumber()).toEqual(1);
  //   });
  // });

  // describe("finalize_goal", () => {
  //   let goalPda: PublicKey;
  //   let shortDeadline: number;

  //   beforeAll(async () => {
  //     // Create a goal with a short deadline for testing finalization
  //     const goalId6 = new BN(6);
  //     shortDeadline = Math.floor(Date.now() / 1000) + 5; // 5 seconds from now
      
  //     [goalPda] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("goal"), goalId6.toArrayLike(Buffer, "le", 8)],
  //       program.programId
  //     );

  //     const [judge1Pda] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("judge"), judge1.publicKey.toBuffer()],
  //       program.programId
  //     );

  //     const [judge2Pda] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("judge"), judge2.publicKey.toBuffer()],
  //       program.programId
  //     );

  //     // Create goal, submit proof, and get votes
  //     await program.methods
  //       .createGoal(
  //         goalId6,
  //         "Test goal for finalization",
  //         stakeAmount,
  //         new BN(shortDeadline),
  //         { personal: {} }
  //       )
  //       .accounts({
  //         creator: creator.publicKey,
  //         goal: goalPda,
  //         creatorTokenAccount,
  //         goalEscrow,
  //         globalState: globalState.publicKey,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         systemProgram: SystemProgram.programId,
  //       }as any)
  //       .signers([creator])
  //       .rpc();

  //     await program.methods
  //       .submitProof("Final test proof", { image: {} })
  //       .accounts({
  //         goal: goalPda,
  //         creator: creator.publicKey,
  //       })
  //       .signers([creator])
  //       .rpc();

  //     // Both judges vote yes for successful completion
  //     const [voteRecord1Pda] = PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from("vote"),
  //         goalId6.toArrayLike(Buffer, "le", 8),
  //         judge1.publicKey.toBuffer()
  //       ],
  //       program.programId
  //     );

  //     const [voteRecord2Pda] = PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from("vote"),
  //         goalId6.toArrayLike(Buffer, "le", 8),
  //         judge2.publicKey.toBuffer()
  //       ],
  //       program.programId
  //     );

  //     await program.methods
  //       .vote(true)
  //       .accounts({
  //         goal: goalPda,
  //         judge: judge1Pda,
  //         voteRecord: voteRecord1Pda,
  //         judgeAuthority: judge1.publicKey,
  //         systemProgram: SystemProgram.programId,
  //       }as any)
  //       .signers([judge1])
  //       .rpc();

  //     await program.methods
  //       .vote(true)
  //       .accounts({
  //         goal: goalPda,
  //         judge: judge2Pda,
  //         voteRecord: voteRecord2Pda,
  //         judgeAuthority: judge2.publicKey,
  //         systemProgram: SystemProgram.programId,
  //       }as any)
  //       .signers([judge2])
  //       .rpc();

  //     // Wait for voting deadline to pass
  //     await new Promise(resolve => setTimeout(resolve, 8000));
  //   });

  //   it("Should finalize goal as successful", async () => {
  //     const creatorBalanceBefore = await getAccount(provider.connection, creatorTokenAccount);

  //     await program.methods
  //       .finalizeGoal()
  //       .accounts({
  //         goal: goalPda,
  //         goalEscrow,
  //         creatorTokenAccount,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //       }as any)
  //       .rpc();

  //     const goalAccount = await program.account.goal.fetch(goalPda);
  //     expect(goalAccount.status).toContainEqual({ completed: {} });
  //     expect(goalAccount.finalizedAt).not.toBeNull;

  //     // Check creator received rewards (110% of stake)
  //     const creatorBalanceAfter = await getAccount(provider.connection, creatorTokenAccount);
  //     const expectedReward = stakeAmount.toNumber() * 1.1;
  //     const actualReward = Number(creatorBalanceAfter.amount) - Number(creatorBalanceBefore.amount);
  //     expect(actualReward).toEqual(expectedReward);
  //   });
  // });

  // describe("update_judge_reputation", () => {
  //   it("Should update judge reputation correctly", async () => {
  //     const [judge1Pda] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("judge"), judge1.publicKey.toBuffer()],
  //       program.programId
  //     );

  //     const [goalPda] = PublicKey.findProgramAddressSync(
  //       [Buffer.from("goal"), new BN(6).toArrayLike(Buffer, "le", 8)],
  //       program.programId
  //     );

  //     const [voteRecordPda] = PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from("vote"),
  //         new BN(6).toArrayLike(Buffer, "le", 8),
  //         judge1.publicKey.toBuffer()
  //       ],
  //       program.programId
  //     );

  //     const judgeBefore = await program.account.judge.fetch(judge1Pda);

  //     await program.methods
  //       .updateJudgeReputation()
  //       .accounts({
  //         judge: judge1Pda,
  //         voteRecord: voteRecordPda,
  //         goal: goalPda,
  //       })
  //       .rpc();

  //     const judgeAfter = await program.account.judge.fetch(judge1Pda);
  //     expect(judgeAfter.totalVotes).toEqual(judgeBefore.totalVotes + 1);
  //     expect(judgeAfter.correctVotes).toEqual(judgeBefore.correctVotes + 1);
  //     expect(judgeAfter.reputationScore).toEqual(judgeBefore.reputationScore + 10);
  //   });
  // });
});