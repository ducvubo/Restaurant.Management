import type { NotificationInstance } from 'antd/es/notification/interface';
import { notification as staticNotification } from 'antd';

// Global notification instance
let notificationApi: NotificationInstance | null = null;

/**
 * Set notification API instance (should be called from App component)
 */
export const setNotificationApi = (api: NotificationInstance) => {
  notificationApi = api;
};

/**
 * Get notification API instance (fallback to static if not set)
 */
const getNotificationApi = (): NotificationInstance => {
  if (notificationApi) {
    return notificationApi;
  }
  // Fallback to static methods if API not set yet
  return staticNotification as unknown as NotificationInstance;
};

/**
 * Show notification based on severity
 */
export const showNotification = (
  severity: 'success' | 'info' | 'warning' | 'error',
  title: string,
  description: string
): void => {
  const api = getNotificationApi();
  
  const config = {
    title: title,
    description: description || undefined,
    duration: 3,
    placement: 'topRight' as const,
    className: 'custom-notification',
    style: {
      width: '320px',
    },
  };

  switch (severity) {
    case 'success':
      api.success(config);
      break;
    case 'info':
      api.info(config);
      break;
    case 'warning':
      api.warning(config);
      break;
    case 'error':
      api.error(config);
      break;
  }
};

/**
 * Show error notification
 */
export const showErrorNotification = (title: string, description: string): void => {
  const api = getNotificationApi();
  
  api.error({
    title: title,
    description: description,
    duration: 4,
    placement: 'topRight',
    className: 'custom-notification',
    style: {
      width: '320px',
    },
  });
};

