#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("CwBMDgLTF4gXE7bigVyNBYJYtZ8zqp9nqVEpVk1XDo1M");

#[program]
pub mod time_staker {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.authority = authority;
        global_state.total_goals = 0;
        global_state.total_judges = 0;
        global_state.min_judge_stakes = 1_000_000_000; // 1 SOL in lamports
        global_state.judge_reward_rate = 500; // 5% in basis points
        global_state.reward_pool = 0;
        Ok(())
    }

    pub fn create_goal(ctx: Context<CreateGoal>, goal_id: u64, description: String, stake_amount: u64, deadline: i64) -> Result<()> {
        require!(stake_amount >= 100_000_000, TimeStakerError::InsufficientStake); // Min 0.1 SOL
        require!(deadline > Clock::get()?.unix_timestamp, TimeStakerError::InvalidDeadline);
        require!(description.len() <= 500, TimeStakerError::DescriptionTooLong);

        let goal = &mut ctx.accounts.goal;
        let bump = ctx.bumps.goal;
        goal.creator = ctx.accounts.creator.key();
        goal.goal_id = goal_id;
        goal.description = description;
        goal.stake_amount = stake_amount;
        goal.deadline = deadline;
        goal.status = GoalStatus::Active;
        goal.created_at = Clock::get()?.unix_timestamp;
        goal.total_votes = 0;
        goal.yes_votes = 0;
        goal.voting_deadline = deadline + 7 * 24 * 3600; // 7 days after goal deadline
        goal.proof_data = None;
        goal.proof_type = None;
        goal.proof_submitted_at = None;
        goal.finalized_at = None;
        goal.bump = bump;

        // Transfer SOL from creator to goal escrow (PDA)
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.creator.key(),
            &ctx.accounts.goal.key(),
            stake_amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.creator.to_account_info(),
                ctx.accounts.goal.to_account_info(),
            ],
        )?;

        // Update global state
        let global_state = &mut ctx.accounts.global_state;
        global_state.total_goals += 1;

        emit!(GoalCreated {
            goal_id,
            creator: ctx.accounts.creator.key(),
            stake_amount,
            deadline,
        });

        Ok(())
    }

    pub fn submit_proof(ctx: Context<SubmitProof>, proof_data: String, proof_type: ProofType) -> Result<()> {
        let goal = &mut ctx.accounts.goal;
        require!(goal.creator == ctx.accounts.creator.key(), TimeStakerError::Unauthorized);
        require!(goal.status == GoalStatus::Active, TimeStakerError::InvalidGoalStatus);
        require!(Clock::get()?.unix_timestamp <= goal.deadline, TimeStakerError::DeadlinePassed);
        require!(proof_data.len() <= 500, TimeStakerError::ProofTooLong);

        goal.proof_data = Some(proof_data.clone());
        goal.proof_type = Some(proof_type);
        goal.proof_submitted_at = Some(Clock::get()?.unix_timestamp);
        goal.status = GoalStatus::PendingVerification;

        emit!(ProofSubmitted {
            goal_id: goal.goal_id,
            creator: ctx.accounts.creator.key(),
            proof_type
        }); 

        Ok(())
    }

    pub fn register_judge(ctx: Context<RegisterJudge>) -> Result<()> {
        let judge = &mut ctx.accounts.judge;
        let global_state = &mut ctx.accounts.global_state;

        judge.judge = ctx.accounts.judge_authority.key();
        judge.stake_amount = global_state.min_judge_stakes;
        judge.reputation_score = 100; // starting reputation
        judge.total_votes = 0;
        judge.correct_votes = 0;
        judge.registered_at = Clock::get()?.unix_timestamp;
        judge.is_active = true;

        // Transfer SOL from judge to judge escrow (PDA)
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.judge_authority.key(),
            &ctx.accounts.judge.key(),
            global_state.min_judge_stakes,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.judge_authority.to_account_info(),
                ctx.accounts.judge.to_account_info(),
            ],
        )?;

        global_state.total_judges += 1;

        emit!(JudgeRegistered {
            judge: ctx.accounts.judge_authority.key(),
            stake_amount: global_state.min_judge_stakes,
        });

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, vote: bool) -> Result<()> {
        let goal = &mut ctx.accounts.goal;
        let judge = &ctx.accounts.judge;
        let vote_record = &mut ctx.accounts.vote_record;

        require!(goal.status == GoalStatus::PendingVerification, TimeStakerError::InvalidGoalStatus);
        require!(Clock::get()?.unix_timestamp <= goal.voting_deadline, TimeStakerError::VotingDeadlinePassed);
        require!(judge.is_active, TimeStakerError::JudgeNotActive);

        vote_record.goal_id = goal.goal_id;
        vote_record.judge = ctx.accounts.judge_authority.key();
        vote_record.vote = vote;
        vote_record.voted_at = Clock::get()?.unix_timestamp;
        
        goal.total_votes += 1;
        if vote {
            goal.yes_votes += 1;
        }

        emit!(VoteCast {
            goal_id: goal.goal_id,
            judge: ctx.accounts.judge_authority.key(),
            vote
        });

        Ok(())
    }

    pub fn finalize_goal(ctx: Context<FinalizeGoal>) -> Result<()> {
        let goal = &mut ctx.accounts.goal;
        require!(goal.status == GoalStatus::PendingVerification, TimeStakerError::InvalidGoalStatus);
        require!(Clock::get()?.unix_timestamp > goal.voting_deadline, TimeStakerError::VotingStillActive);

        let success_threshold = goal.total_votes * 60 / 100;
        let is_successful = goal.yes_votes >= success_threshold;

        if is_successful {
            goal.status = GoalStatus::Completed;
            
            // Calculate reward (10% bonus)
            let reward_amount = goal.stake_amount * 110 / 100;
            
            // Transfer SOL back to creator with reward
            // let goal_id_bytes = goal.goal_id.to_le_bytes();
            // let seeds = &[b"goal", goal_id_bytes.as_ref(), &[goal.bump]];
            // let signer = &[&seeds[..]];
            
            **goal.to_account_info().try_borrow_mut_lamports()? -= reward_amount;
            **ctx.accounts.creator.to_account_info().try_borrow_mut_lamports()? += reward_amount;
        } else {
            goal.status = GoalStatus::Failed;
            // Stake remains in the goal account (or could be transferred to reward pool)
            let global_state = &mut ctx.accounts.global_state;
            global_state.reward_pool += goal.stake_amount;
        }

        goal.finalized_at = Some(Clock::get()?.unix_timestamp);

        emit!(GoalFinalized {
            goal_id: goal.goal_id,
            successful: is_successful,
            final_votes: goal.total_votes,
            yes_votes: goal.yes_votes
        });

        Ok(())
    }

    pub fn update_judge_reputation(ctx: Context<UpdateJudgeReputation>) -> Result<()> {
        let judge = &mut ctx.accounts.judge;
        let vote_record = &ctx.accounts.vote_record;
        let goal = &ctx.accounts.goal;

        require!(goal.status == GoalStatus::Completed || goal.status == GoalStatus::Failed, TimeStakerError::GoalNotFinalized);

        let was_correct = (vote_record.vote && goal.status == GoalStatus::Completed) || (!vote_record.vote && goal.status == GoalStatus::Failed);

        judge.total_votes += 1;

        if was_correct {
            judge.correct_votes += 1;
            judge.reputation_score = std::cmp::min(judge.reputation_score + 10, 2000);
        } else {
            judge.reputation_score = std::cmp::max(judge.reputation_score - 20, 100);
        }

        Ok(())
    }

    pub fn withdraw_judge_stake(ctx: Context<WithdrawJudgeStake>) -> Result<()> {
        let judge = &mut ctx.accounts.judge;
        require!(judge.judge == ctx.accounts.judge_authority.key(), TimeStakerError::Unauthorized);
        require!(judge.is_active, TimeStakerError::JudgeNotActive);

        // Transfer SOL back to judge
        **judge.to_account_info().try_borrow_mut_lamports()? -= judge.stake_amount;
        **ctx.accounts.judge_authority.to_account_info().try_borrow_mut_lamports()? += judge.stake_amount;

        judge.is_active = false;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + GlobalState::INIT_SPACE,
    )]
    pub global_state: Account<'info, GlobalState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(goal_id: u64)]
pub struct CreateGoal<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        space = 8 + Goal::INIT_SPACE,
        seeds = [b"goal", goal_id.to_le_bytes().as_ref()],
        bump
    )]
    pub goal: Account<'info, Goal>,
    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitProof<'info> {
    #[account(mut)]
    pub goal: Account<'info, Goal>,
    pub creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct RegisterJudge<'info> {
    #[account(
        init,
        payer = judge_authority,
        space = 8 + Judge::INIT_SPACE,
        seeds = [b"judge", judge_authority.key().as_ref()],
        bump
    )]
    pub judge: Account<'info, Judge>,
    #[account(mut)]
    pub judge_authority: Signer<'info>,
    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub goal: Account<'info, Goal>,
    pub judge: Account<'info, Judge>,
    #[account(
        init,
        payer = judge_authority,
        space = 8 + VoteRecord::INIT_SPACE,
        seeds = [b"vote", goal.goal_id.to_le_bytes().as_ref(), judge_authority.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    #[account(mut)]
    pub judge_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeGoal<'info> {
    #[account(
        mut,
        seeds = [b"goal", goal.goal_id.to_le_bytes().as_ref()],
        bump = goal.bump
    )]
    pub goal: Account<'info, Goal>,
    #[account(mut)]
    pub creator: SystemAccount<'info>,
    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,
}

#[derive(Accounts)] 
pub struct UpdateJudgeReputation<'info> {
    #[account(mut)]
    pub judge: Account<'info, Judge>,
    pub vote_record: Account<'info, VoteRecord>,
    pub goal: Account<'info, Goal>,
}

#[derive(Accounts)]
pub struct WithdrawJudgeStake<'info> {
    #[account(mut)]
    pub judge: Account<'info, Judge>,
    #[account(mut)]
    pub judge_authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct GlobalState {
    pub authority: Pubkey,
    pub total_goals: u64,
    pub total_judges: u64,
    pub min_judge_stakes: u64,
    pub judge_reward_rate: u16,
    pub reward_pool: u64
}

#[account]
#[derive(InitSpace)]
pub struct Goal {
    pub creator: Pubkey,
    pub goal_id: u64,
    #[max_len(500)]
    pub description: String,
    pub stake_amount: u64,
    pub deadline: i64,
    pub voting_deadline: i64,
    pub status: GoalStatus,
    pub created_at: i64,
    pub finalized_at: Option<i64>,
    #[max_len(500)]
    pub proof_data: Option<String>,
    pub proof_type: Option<ProofType>,
    pub proof_submitted_at: Option<i64>,
    pub total_votes: u64,
    pub yes_votes: u64,
    pub bump: u8
}

#[account]
#[derive(InitSpace)]
pub struct Judge {
    pub judge: Pubkey,
    pub stake_amount: u64,
    pub reputation_score: u32,
    pub total_votes: u32,
    pub correct_votes: u32,
    pub registered_at: i64,
    pub is_active: bool,
}

#[account]
#[derive(InitSpace)]
pub struct VoteRecord {
    pub goal_id: u64,
    pub judge: Pubkey,
    pub vote: bool,
    pub voted_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum GoalStatus {
    Active,
    PendingVerification,
    Completed,
    Failed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ProofType {
    Image,
    Document,
    Link,
    Text,
    Video
}

// Events
#[event]
pub struct GoalCreated {
    pub goal_id: u64,
    pub creator: Pubkey,
    pub stake_amount: u64,
    pub deadline: i64
}

#[event]
pub struct ProofSubmitted {
    pub goal_id: u64,
    pub creator: Pubkey,
    pub proof_type: ProofType,
}

#[event]
pub struct JudgeRegistered {
    pub judge: Pubkey,
    pub stake_amount: u64,
}

#[event]
pub struct VoteCast {
    pub goal_id: u64,
    pub judge: Pubkey,
    pub vote: bool,
}

#[event]
pub struct GoalFinalized {
    pub goal_id: u64,
    pub successful: bool,
    pub final_votes: u64,
    pub yes_votes: u64
}

#[error_code]
pub enum TimeStakerError {
    #[msg("Insufficient stake amount")]
    InsufficientStake,
    #[msg("Invalid Deadline")]
    InvalidDeadline,
    #[msg("Description too long")]
    DescriptionTooLong,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid goal status")]
    InvalidGoalStatus,
    #[msg("Deadline has passed")]
    DeadlinePassed,
    #[msg("Proof data too long")]
    ProofTooLong,
    #[msg("Judge not active")]
    JudgeNotActive,
    #[msg("Voting deadline has passed")]
    VotingDeadlinePassed,
    #[msg("Voting is still active")]
    VotingStillActive,
    #[msg("Goal not finalized")]
    GoalNotFinalized,
}