/**
 * Jupiter DEX Aggregator Service
 * Handles Solana token swaps via Jupiter API v6
 */

const axios = require('axios');
const {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} = require('@solana/web3.js');

const JUPITER_API = process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6';
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const DEFAULT_SLIPPAGE = parseInt(process.env.DEFAULT_SLIPPAGE || 5);

const connection = new Connection(SOLANA_RPC, 'confirmed');

/**
 * Get a quote for swapping tokens
 */
async function getQuote(inputMint, outputMint, amount, slippage = DEFAULT_SLIPPAGE) {
  try {
    const { data } = await axios.get(`${JUPITER_API}/quote`, {
      params: {
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippage * 100,
      },
    });
    return data;
  } catch (error) {
    console.error('Quote error:', error.response?.data || error.message);
    throw new Error('Failed to get quote');
  }
}

/**
 * Get serialized transaction for swap
 */
async function getSwapTransaction(quoteResponse, walletPublicKey) {
  try {
    const { data } = await axios.post(`${JUPITER_API}/swap`, {
      quoteResponse,
      userPublicKey: walletPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: {
          maxLamports: 1000000,
          priorityLevel: 'high',
        },
      },
    });
    return data;
  } catch (error) {
    console.error('Swap tx error:', error.response?.data || error.message);
    throw new Error('Failed to prepare swap transaction');
  }
}

/**
 * Execute a swap transaction
 */
async function executeSwap(swapTransaction, wallet) {
  try {
    // Deserialize the transaction
    const tx = VersionedTransaction.deserialize(
      Buffer.from(swapTransaction, 'base64')
    );

    // Sign with user's wallet
    tx.sign([wallet]);

    // Send transaction
    const signature = await connection.sendTransaction(tx, {
      maxRetries: 3,
      skipPreflight: false,
    });

    // Confirm
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');

    return {
      signature,
      confirmed: !confirmation.value.err,
      error: confirmation.value.err,
    };
  } catch (error) {
    console.error('Execute swap error:', error);
    throw new Error(`Swap failed: ${error.message}`);
  }
}

/**
 * Get token balance for a wallet
 */
async function getTokenBalance(walletAddress, tokenMint) {
  try {
    const pubKey = new PublicKey(walletAddress);
    const mintPubKey = new PublicKey(tokenMint);

    if (tokenMint === 'So11111111111111111111111111111111111111112') {
      // SOL
      const balance = await connection.getBalance(pubKey);
      return balance / 1e9; // Convert lamports to SOL
    }

    // SPL Token
    const tokenAccounts = await connection.getTokenAccountsByOwner(pubKey, {
      mint: mintPubKey,
    });

    if (tokenAccounts.value.length === 0) return 0;

    const accountData = tokenAccounts.value[0].account.data;
    const amount = accountData.readBigUInt64LE(64);
    return Number(amount) / 1e9; // Adjust for token decimals
  } catch (error) {
    console.error('Balance error:', error);
    return null;
  }
}

/**
 * Get SOL balance
 */
async function getSolBalance(walletAddress) {
  try {
    const pubKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(pubKey);
    return balance / 1e9;
  } catch (error) {
    return null;
  }
}

module.exports = {
  getQuote,
  getSwapTransaction,
  executeSwap,
  getTokenBalance,
  getSolBalance,
  connection,
};
