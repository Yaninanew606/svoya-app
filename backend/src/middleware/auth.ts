import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

declare global {
  namespace Express {
    interface Request {
      telegramUser?: TelegramUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const initData = req.headers['x-telegram-init-data'] as string;

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    // Dev mode — mock user
    req.telegramUser = { id: 12345, first_name: 'Dev' };
    next();
    return;
  }

  if (!initData) {
    // Demo mode — allow access without Telegram auth
    req.telegramUser = { id: 12345, first_name: 'Demo' };
    next();
    return;
  }

  const user = validateTelegramWebApp(initData, process.env.TELEGRAM_BOT_TOKEN);
  if (!user) {
    res.status(401).json({ error: 'Invalid init data' });
    return;
  }

  req.telegramUser = user;
  next();
}

function validateTelegramWebApp(initData: string, botToken: string): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (hash !== expectedHash) return null;
    return JSON.parse(params.get('user') || '{}');
  } catch {
    return null;
  }
}
