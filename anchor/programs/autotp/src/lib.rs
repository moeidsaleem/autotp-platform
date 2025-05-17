#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

// Declare the program ID
declare_id!("FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS");

#[program]
pub mod autotp {
    use super::*;

    // Super simple initialize function
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        counter.user = ctx.accounts.user.key();
        Ok(())
    }

    // Simple increment function
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;
        Ok(())
    }
}

// Account used to initialize the counter
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8 + 32
    )]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Account used to increment the counter
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        has_one = user
    )]
    pub counter: Account<'info, Counter>,
    pub user: Signer<'info>,
}

// The counter account
#[account]
pub struct Counter {
    pub count: u64,
    pub user: Pubkey,
}
