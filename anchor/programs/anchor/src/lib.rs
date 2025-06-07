#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
// Declare the program ID
declare_id!("4zNsNcDNWFJUPhpBF2j6ZBA4f6arEHn3hEx1osH6Hvkq");

#[program]
pub mod autotp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, target_price: u64, referrer: Pubkey) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.owner.key();
        vault.token_mint = ctx.accounts.token_mint.key();
        vault.target_price = target_price;
        vault.referrer = referrer;
        vault.current_price = 0;
        vault.ready_for_execution = false;
        msg!(
            "Vault initialized with target price: {} and referrer: {}",
            target_price,
            referrer
        );
        Ok(())
    }

    pub fn cancel_tp(ctx: Context<CancelTP>) -> Result<()> {
        let vault = &ctx.accounts.vault;
        require_keys_eq!(
            vault.owner,
            ctx.accounts.owner.key(),
            CustomError::Unauthorized
        );
        token::transfer(
            ctx.accounts
                .transfer_context()
                .with_signer(&[&vault.seeds()]),
            ctx.accounts.vault_tokens.amount,
        )?;
        msg!("TP canceled for vault {}");
        Ok(())
    }

    pub fn execute_tp(ctx: Context<ExecuteTP>, current_price: u64) -> Result<()> {
        // Create a copy of the seeds to avoid borrow checker issues
        let seeds = ctx.accounts.vault.seeds();
        
        let price_to_check = if current_price > 0 {
            current_price
        } else {
            ctx.accounts.vault.current_price
        };

        require!(
            price_to_check >= ctx.accounts.vault.target_price,
            CustomError::TargetNotReached
        );

        let total_amount = ctx.accounts.vault_tokens.amount;
        let protocol_fee = total_amount / 100; // 1%
        let referrer_fee = protocol_fee / 10; // 10% of protocol_fee
        let protocol_share = protocol_fee - referrer_fee;
        let user_amount = total_amount - protocol_fee;

        // Distribute to referrer
        if ctx.accounts.vault.referrer != Pubkey::default() {
            token::transfer(
                ctx.accounts
                    .transfer_context_for_referrer()
                    .with_signer(&[&seeds]),
                referrer_fee,
            )?;
        }

        // Distribute protocol share
        token::transfer(
            ctx.accounts
                .transfer_context_for_protocol()
                .with_signer(&[&seeds]),
            protocol_share,
        )?;

        // Send user remainder
        token::transfer(
            ctx.accounts
                .transfer_context_for_user()
                .with_signer(&[&seeds]),
            user_amount,
        )?;

        ctx.accounts.vault.ready_for_execution = false;
        msg!("TP executed for vault {} at price {}");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = owner, space = 8 + Vault::LEN)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelTP<'info> {
    #[account(mut, has_one = owner)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub vault_tokens: Account<'info, TokenAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// Add this implementation **immediately after** the CancelTP struct
impl<'info> CancelTP<'info> {
    fn transfer_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.vault_tokens.to_account_info(),
                to: self.owner.to_account_info(),
                authority: self.vault.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct ExecuteTP<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub vault_tokens: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination_user: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination_protocol: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination_referrer: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

// Add this implementation **immediately after** the ExecuteTP struct
impl<'info> ExecuteTP<'info> {
    fn transfer_context_for_referrer(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.vault_tokens.to_account_info(),
                to: self.destination_referrer.to_account_info(),
                authority: self.vault.to_account_info(),
            },
        )
    }

    fn transfer_context_for_protocol(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.vault_tokens.to_account_info(),
                to: self.destination_protocol.to_account_info(),
                authority: self.vault.to_account_info(),
            },
        )
    }

    fn transfer_context_for_user(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.vault_tokens.to_account_info(),
                to: self.destination_user.to_account_info(),
                authority: self.vault.to_account_info(),
            },
        )
    }
}

#[account]
pub struct Vault {
    pub owner: Pubkey,
    pub token_mint: Pubkey,
    pub target_price: u64,
    pub referrer: Pubkey,
    pub current_price: u64,
    pub ready_for_execution: bool,
}

impl Vault {
    pub const LEN: usize = 32 + 32 + 8 + 32 + 8 + 1;

    pub fn seeds(&self) -> [&[u8]; 2] {
        [b"vault", self.owner.as_ref()]
    }
}

#[error_code]
pub enum CustomError {
    #[msg("Target price not reached.")]
    TargetNotReached,
    #[msg("Unauthorized action.")]
    Unauthorized,
}
