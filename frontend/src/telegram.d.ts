interface TelegramBackButton {
  show(): void;
  hide(): void;
  onClick(cb: () => void): void;
  offClick(cb: () => void): void;
}

interface TelegramWebApp {
  expand(): void;
  BackButton: TelegramBackButton;
  initData: string;
  initDataUnsafe: Record<string, unknown>;
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}
