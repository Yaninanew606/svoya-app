import { Bot, InlineKeyboard } from 'grammy';

export function startBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log('TELEGRAM_BOT_TOKEN not set, skipping bot startup');
    return;
  }

  const bot = new Bot(token);
  const webAppUrl = process.env.WEBAPP_URL || 'https://your-app.railway.app';

  bot.command('start', async (ctx) => {
    const keyboard = new InlineKeyboard().webApp('Открыть приложение', webAppUrl);
    await ctx.reply(
      'Привет! Я твой персональный wellness-помощник. 🌸\n\n' +
      'Я помогу тебе составить план питания и тренировок, ' +
      'подстроенный именно под тебя.\n\n' +
      'Нажми кнопку ниже, чтобы начать:',
      { reply_markup: keyboard }
    );
  });

  bot.command('plan', async (ctx) => {
    const keyboard = new InlineKeyboard().webApp('План на сегодня', `${webAppUrl}/nutrition`);
    await ctx.reply('Посмотри свой план на сегодня:', { reply_markup: keyboard });
  });

  bot.command('checkin', async (ctx) => {
    const keyboard = new InlineKeyboard().webApp('Отметиться', `${webAppUrl}/checkin`);
    await ctx.reply('Время чек-ина! Расскажи, как прошёл день:', { reply_markup: keyboard });
  });

  bot.command('help', async (ctx) => {
    await ctx.reply(
      'Доступные команды:\n\n' +
      '/start — Открыть приложение\n' +
      '/plan — Посмотреть план на сегодня\n' +
      '/checkin — Ежедневный чек-ин\n' +
      '/help — Эта справка\n\n' +
      'Приложение подстраивается под твоё самочувствие и прогресс. ' +
      'Чем чаще ты делаешь чек-ины, тем точнее будут рекомендации!'
    );
  });

  bot.start();
  console.log('Telegram bot started');
}
