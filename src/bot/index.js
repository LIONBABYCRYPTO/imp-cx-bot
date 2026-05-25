const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('❌ BOT_TOKEN is required. Copy .env.example to .env and set it.');
  process.exit(1);
}

const bot = new Bot(token);
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(Number).filter(Boolean);

// ── Commands ──────────────────────────────────────────────────

// Start
bot.command('start', async (ctx) => {
  const ref = ctx.match;
  const keyboard = new InlineKeyboard()
    .text('💰 Buy', 'buy')
    .text('💸 Sell', 'sell')
    .row()
    .text('👤 Copy Wallet', 'copy')
    .text('📊 Portfolio', 'portfolio')
    .row()
    .text('⚙️ Settings', 'settings')
    .text('❓ Help', 'help');

  await ctx.reply(
    `🐾 *imp.cx Bot* — Solana Trading Copilot\n\n` +
    `Trade any token on Solana instantly. Copy profitable wallets.\n` +
    `_Non-custodial — you hold your keys._\n\n` +
    (ref ? `🎯 Referral: ${ref}\n\n` : '') +
    `Use the buttons below or type /help for commands.`,
    { reply_markup: keyboard, parse_mode: 'Markdown' }
  );
});

// Help
bot.command('help', async (ctx) => {
  await ctx.reply(
    `*🤖 imp.cx Bot Commands*\n\n` +
    `/start — Launch bot\n` +
    `/buy <token> <amount> — Buy tokens in SOL or USDC\n` +
    `/sell <token> <amount> — Sell tokens\n` +
    `/copy <wallet> — Copy trade a wallet\n` +
    `/portfolio — View your positions\n` +
    `/balance — Check your wallet balance\n` +
    `/wallet — Show your wallet address\n` +
    `/referral — Get your referral link\n` +
    `/settings — Configure slippage, defaults\n` +
    `/help — Show this message\n\n` +
    `_Fee: 0.5% per trade. Referral: 20% kickback._`,
    { parse_mode: 'Markdown' }
  );
});

// Wallet display
bot.command('wallet', async (ctx) => {
  const userId = ctx.from.id;
  // TODO: fetch wallet from DB
  await ctx.reply(
    `*🔑 Your Wallet*\n\n` +
    `Address: \`Not created yet\`\n` +
    `Use /start to create one.\n\n` +
    `_Non-custodial — only you control your keys._`,
    { parse_mode: 'Markdown' }
  );
});

// Balance
bot.command('balance', async (ctx) => {
  await ctx.reply(`*💰 Balance*\n\nFetching your balances...\n\n_Coming soon in MVP._`, {
    parse_mode: 'Markdown',
  });
});

// Buy command
bot.command('buy', async (ctx) => {
  const args = ctx.match?.split(' ') || [];
  if (args.length < 2) {
    return ctx.reply(
      `*⚠️ Usage:*\n/buy <token_address_or_ticker> <amount_in_SOL>\n\n` +
      `_Example:_ /buy So11111111111111111111111111111111111111112 0.1`,
      { parse_mode: 'Markdown' }
    );
  }
  const [token, amount] = args;
  await ctx.reply(
    `*🔄 Processing Buy*\n\n` +
    `Token: \`${token.slice(0, 8)}...${token.slice(-4)}\`\n` +
    `Amount: ${amount} SOL\n` +
    `Slippage: ${process.env.DEFAULT_SLIPPAGE || 5}%\n\n` +
    `_Preparing transaction..._`,
    { parse_mode: 'Markdown' }
  );
  // TODO: Execute trade via Jupiter API
});

// Sell command
bot.command('sell', async (ctx) => {
  const args = ctx.match?.split(' ') || [];
  if (args.length < 2) {
    return ctx.reply(
      `*⚠️ Usage:*\n/sell <token_address> <percentage_or_amount>\n\n` +
      `_Example:* /sell So11111111111111111111111111111111111111112 100%`,
      { parse_mode: 'Markdown' }
    );
  }
  await ctx.reply(`*🔄 Processing Sell*\n\n_Coming in MVP._`, { parse_mode: 'Markdown' });
});

// Copy trading
bot.command('copy', async (ctx) => {
  const wallet = ctx.match?.trim();
  if (!wallet) {
    return ctx.reply(
      `*⚠️ Usage:*\n/copy <wallet_address>\n\n` +
      `_Example:* /copy F9Bqp9tUQzJXTxLkMqMnEiFmKQHgM1nL8jKzp7y8cmqS`,
      { parse_mode: 'Markdown' }
    );
  }
  await ctx.reply(
    `*👤 Copy Trading*\n\n` +
    `Wallet: \`${wallet.slice(0, 8)}...${wallet.slice(-4)}\`\n` +
    `Status: Not implemented yet\n\n` +
    `_Coming in MVP — monitoring + auto-mirror._`,
    { parse_mode: 'Markdown' }
  );
});

// Referral
bot.command('referral', async (ctx) => {
  const userId = ctx.from.id;
  // TODO: generate referral code from DB
  await ctx.reply(
    `*🎯 Your Referral Link*\n\n` +
    `Share this with friends:\n` +
    `\`https://t.me/impcx_bot?start=ref_${userId}\`\n\n` +
    `You earn *20%* of all fees they pay!\n` +
    `_Referrals credited in USDC._`,
    { parse_mode: 'Markdown' }
  );
});

// Settings
bot.command('settings', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text('Slippage: 5%', 'set_slippage')
    .text('Priority Fee: Auto', 'set_priority')
    .row()
    .text('Default Buy: SOL', 'set_default_currency')
    .text('MEV Protect: On', 'set_mev')
    .row()
    .text('⬅️ Back', 'back_main');

  await ctx.reply('*⚙️ Settings*\n\nTap to adjust:', {
    reply_markup: keyboard,
    parse_mode: 'Markdown',
  });
});

// Portfolio
bot.command('portfolio', async (ctx) => {
  await ctx.reply(
    `*📊 Portfolio*\n\n` +
    `Total Value: —\n` +
    `Tokens: —\n` +
    `P&L: —\n\n` +
    `_Connect wallet to see your portfolio._`,
    { parse_mode: 'Markdown' }
  );
});

// ── Button Handlers ───────────────────────────────────────────

bot.callbackQuery('buy', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `*💰 Buy Token*\n\n` +
    `Use: /buy <token_address> <amount_in_SOL>\n\n` +
    `_Not sure what to buy? Use /trending to see hot tokens._`,
    { parse_mode: 'Markdown' }
  );
});

bot.callbackQuery('sell', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `*💸 Sell Token*\n\n` +
    `Use: /sell <token_address> <percentage>\n\n` +
    `_Example:* /sell So11111111111111111111111111111111111111112 all`,
    { parse_mode: 'Markdown' }
  );
});

bot.callbackQuery('portfolio', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(`📊 *Portfolio*\n\n_Coming soon._`, { parse_mode: 'Markdown' });
});

bot.callbackQuery('help', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(`Use /help to see all commands.`);
});

bot.callbackQuery('settings', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(`Use /settings to configure.`);
});

bot.callbackQuery('back_main', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(`Use /start to see the main menu.`);
});

// ── Error Handling ────────────────────────────────────────────

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error for ${ctx.update.update_id}:`, err.error);
  ctx.reply('❌ An error occurred. Please try again.').catch(() => {});
});

// ── Launch ─────────────────────────────────────────────────────

async function main() {
  console.log('🤖 imp.cx Bot starting...');
  console.log(`   Admin IDs: ${ADMIN_IDS.join(', ') || 'Not set'}`);
  console.log(`   Fee: ${process.env.TRADE_FEE_PERCENT || 0.5}%`);

  await bot.api.setMyCommands([
    { command: 'start', description: 'Launch the bot' },
    { command: 'buy', description: 'Buy tokens' },
    { command: 'sell', description: 'Sell tokens' },
    { command: 'copy', description: 'Copy trade a wallet' },
    { command: 'portfolio', description: 'View your positions' },
    { command: 'balance', description: 'Check wallet balance' },
    { command: 'wallet', description: 'Show your wallet address' },
    { command: 'referral', description: 'Get referral link' },
    { command: 'settings', description: 'Configure bot' },
    { command: 'help', description: 'Show commands' },
  ]);

  bot.start();
  console.log('✅ imp.cx Bot is live!');
}

main().catch(console.error);
