function isDev(): boolean {
  return Boolean(import.meta.env.DEV);
}

export const logger = {
  error: (...args: unknown[]) => {
    if (isDev()) {
      console.error(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev()) {
      console.warn(...args);
    }
  },
};
