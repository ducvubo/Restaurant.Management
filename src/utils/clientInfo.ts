/**
 * Generate unique client ID based on timestamp
 */
export const generateClientId = (): string => {
  const now = new Date();
  const pad = (num: number, size: number): string => String(num).padStart(size, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1, 2);
  const day = pad(now.getDate(), 2);
  const hours = pad(now.getHours(), 2);
  const minutes = pad(now.getMinutes(), 2);
  const seconds = pad(now.getSeconds(), 2);
  const milliseconds = pad(now.getMilliseconds(), 3);

  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

/**
 * Get client info (cached for session)
 */
let cachedClientId: string | null = null;

export const getClientId = (): string => {
  if (!cachedClientId) {
    cachedClientId = generateClientId();
  }
  return cachedClientId;
};

/**
 * Reset client ID (for new session)
 */
export const resetClientId = (): void => {
  cachedClientId = null;
};

