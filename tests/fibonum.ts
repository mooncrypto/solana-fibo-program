import * as anchor from '@project-serum/anchor'
import { Program, utils } from '@project-serum/anchor'

import {
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram
} from '@solana/web3.js'
import {assert} from "chai"

describe('fibo', () => {

  const provider = anchor.Provider.env()
  anchor.setProvider(provider);
  const program: Program = anchor.workspace.Fibonum as Program;
  
  // @ts-expect-error
  const wallet = provider.wallet.payer as Keypair
  let stateAddress: PublicKey

  const getNextState = async (next) => {
    await program.rpc.nextFb(next, { 
      accounts: {
        state: stateAddress,
        owner: wallet.publicKey
      }
    })

    const state = await program.account.state.fetch(stateAddress)
    return state;
  }

  before(async () => {

    const [_stateAddress, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(utils.bytes.utf8.encode("fibo"))],
      program.programId
    )
    stateAddress = _stateAddress

    await program.rpc.init(bump, {
      accounts: {
        state: stateAddress,
        payer: wallet.publicKey,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId
      }
    })
  })

  it('Test next_fb!', async () => {
    // Add your test here.

    let state = await program.account.state.fetch(stateAddress)

    console.log(state)
    assert.ok(state.firstNum == 0);
    assert.ok(state.secondNum == 1);
    assert.ok(state.nextFb == 1);

    state = await getNextState(state.nextFb);
    assert.ok(state.nextFb == 2);

    state = await getNextState(state.nextFb);
    assert.ok(state.nextFb == 3);

    try {
      await program.rpc.nextFb(state.nextFb + 2, { 
        accounts: {
          state: stateAddress,
          owner: wallet.publicKey
        }
      })
    } catch (err) {
      const errMsg = "Next num doesnt match";
      assert.equal(err.toString(), errMsg);
    }
    
    state = await getNextState(state.nextFb);
    assert.ok(state.nextFb == 5);
  });

});
