use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod fibonum {

    use super::*;

    pub fn init(
        ctx: Context<Init>,
        bump: u8,
    ) -> ProgramResult {
        let mut state = ctx.accounts.state.load_init()?;

        state.bump = bump;
        state.first_num = 0;
        state.second_num = 1;
        state.next_fb = 1;
        Ok(())
    }

    pub fn next_fb(ctx: Context<NextFibo>, next: u8) -> ProgramResult {
        let state = &mut ctx.accounts.state.load_mut()?;
        if next != state.next_fb {
            return Err(ErrorCode::MisMatch.into());
        }

        state.first_num = state.second_num;
        state.second_num = state.next_fb;
        state.next_fb = state.first_num + state.second_num;
        Ok(())
    }
}

#[account(zero_copy)]
#[derive(PartialEq, Default, Debug)]
pub struct State {
    pub first_num: u8,
    pub second_num: u8,
    pub next_fb: u8,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Init<'info> {
    #[account(init, seeds = [b"fibo".as_ref()], bump = bump, payer = payer)]
    pub state: Loader<'info, State>,
    pub payer: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct NextFibo<'info> {
    #[account(mut, seeds = [b"fibo".as_ref()], bump = state.load()?.bump)]
    pub state: Loader<'info, State>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
}

#[error]
pub enum ErrorCode {
    #[msg("Next num doesnt match")]
    MisMatch,
}