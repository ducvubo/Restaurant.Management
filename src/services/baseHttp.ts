import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { API_BASE_URL } from '../config/api';
import { getClientId } from '../utils/clientInfo';
import type { ResultMessage } from '../types';
import { showNotification as showNotificationUtil, showErrorNotification as showErrorNotificationUtil } from './notificationService';

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  result?: T; // Alternative field name
  code?: number;
  timestamp?: string;
}

/**
 * Problem JSON response (RFC 7807)
 */
export interface ProblemJson {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

/**
 * Create axios instance with default config
 */
const createApiInstance = (): AxiosInstance => {
  const apiUrl = localStorage.getItem('apiUrl') || API_BASE_URL;

  return axios.create({
    baseURL: apiUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json; charset=utf8',
    },
    timeout: 30000, // 30 seconds
  });
};

const Api: AxiosInstance = createApiInstance();

/**
 * Request Interceptor
 * - Add Authorization token
 * - Add CLIENT_ID header
 * - Add LOG_INFO for non-GET requests (optional)
 */
Api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add Authorization token
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CLIENT_ID
    const clientId = getClientId();
    if (clientId) {
      config.headers['CLIENT_ID'] = clientId;
    }

    // Add LOG_INFO for non-GET requests (if needed)
    // You can implement logging logic here
    if (config.method !== 'get' && config.method !== 'GET') {
      // Example: Add log info if needed
      // const logInfo = { ... };
      // config.headers['LOG_INFO'] = btoa(JSON.stringify(logInfo));
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handle success responses
 * - Handle error responses with automatic toast notifications
 * - Handle special status codes (401, 403, etc.)
 * - Handle Blob responses with problem+json
 */
Api.interceptors.response.use(
  async (response: AxiosResponse) => {
    const contentType = response.headers['content-type'];

    // Handle Blob response with problem+json
    if (
      response.status !== 200 &&
      contentType &&
      contentType.includes('application/problem+json') &&
      response.data instanceof Blob
    ) {
      try {
        const text = await response.data.text();
        const json: ProblemJson = JSON.parse(text);
        
        showErrorNotification(
          'Thất bại',
          json.detail || json.title || 'Đã xảy ra lỗi',
          response.status
        );

        // Return error response for further handling
        return Promise.reject({
          response: {
            ...response,
            data: json,
            status: response.status,
          },
        });
      } catch (parseError) {
        console.error('Error parsing Blob response:', parseError);
      }
    }

    // Handle non-200 status codes
    if (response.status !== 200 && response.data) {
      const data = response.data as ApiResponse | ProblemJson;
      
      if ('title' in data && 'status' in data) {
        // Problem JSON format
        showErrorNotification(
          'Thất bại',
          data.detail || data.title || 'Đã xảy ra lỗi',
          data.status
        );
      } else if ('message' in data) {
        // Custom API response format
        const severity = getSeverityFromStatus(response.status);
        let title = '';
        if (severity === 'success') {
          title = 'Thành công';
        } else if (severity === 'error') {
          title = 'Thất bại';
        } else if (severity === 'warning') {
          title = 'Cảnh báo';
        } else {
          title = 'Thông báo';
        }
        showNotification(
          severity,
          title,
          data.message || 'Thông báo',
          response.status
        );
      }
    }

    if (response.status === 200 && response.data) {
      const data = response.data as ApiResponse | ResultMessage<any>;
      const method = (response.config?.method || '').toUpperCase();
      
      if ('message' in data && data.message) {
        let severity: 'success' | 'info' | 'warning' | 'error' = 'success';
        
        if (data.success === false) {
          severity = 'error';
        } else if (data.success === true) {
          // Check code for more specific severity
          const code = (data as ResultMessage<any>).code;
          if (code === 200 || code === undefined) {
            severity = 'success';
          } else if (code >= 400 && code < 500) {
            severity = 'warning';
          } else if (code >= 500) {
            severity = 'error';
          }
        }
        
        // API GET: chỉ thông báo khi thất bại, không thông báo khi thành công
        if (method === 'GET') {
          if (severity === 'error' || data.success === false) {
            // Chỉ hiển thị notification khi có lỗi
            const title = 'Thất bại';
            const description = data.message || 'Đã xảy ra lỗi';
            showNotification('error', title, description, response.status);
          }
          // Nếu thành công thì không hiển thị notification
        } else {
          // Các method khác (POST, PUT, DELETE, PATCH): hiển thị cả thành công và thất bại
          // Determine title based on severity
          let title = '';
          if (severity === 'success') {
            title = 'Thành công';
          } else if (severity === 'error') {
            title = 'Thất bại';
          } else if (severity === 'warning') {
            title = 'Cảnh báo';
          } else if (severity === 'info') {
            title = 'Thông báo';
          } else {
            title = 'Thông báo';
          }
          
          // Description is the message from server
          const description = data.message || 'Thành công';
          
          // Show notification based on severity
          showNotification(
            severity,
            title,
            description,
            response.status
          );
        }
      }
    }

    return response;
  },
  async (error) => {
    const response = error.response;

    if (response) {
      const contentType = response.headers?.['content-type'];
      const data = response.data;

      // Handle Blob error response with problem+json
      if (
        data instanceof Blob &&
        contentType &&
        contentType.includes('application/problem+json')
      ) {
        try {
          const text = await data.text();
          const json: ProblemJson = JSON.parse(text);
          
          showErrorNotification(
            'Thất bại',
            json.detail || json.title || 'Đã xảy ra lỗi',
            json.status || response.status
          );

          return Promise.reject(json);
        } catch (parseError) {
          console.error('Error parsing Blob error response:', parseError);
        }
      }

      // Handle special status codes
      if (response.status === 401) {
        // Unauthorized - Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        showErrorNotification(
          'Thất bại',
          'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại',
          401
        );

        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else if (response.status === 403) {
        showErrorNotification(
          'Thất bại',
          'Bạn không có quyền thực hiện thao tác này',
          403
        );
        // Không redirect, chỉ hiển thị thông báo
      } else {
        // Other errors
        const errorMessage = getErrorMessage(data, response.status);
        showErrorNotification(
          'Thất bại',
          errorMessage,
          response.status
        );
      }
    } else {
      // Network error or no response
      console.error('Network error:', error);
      showErrorNotification(
        'Thất bại',
        'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        0
      );
    }

    return Promise.reject(error);
  }
);

/**
 * Get error message from response data
 */
const getErrorMessage = (data: any, status: number): string => {
  if (typeof data === 'string') {
    return data;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.error) {
    return typeof data.error === 'string' ? data.error : data.error.message || 'Đã xảy ra lỗi';
  }

  return `${status}: ${getStatusText(status)}`;
};

/**
 * Get status text
 */
const getStatusText = (status: number): string => {
  const statusTexts: Record<number, string> = {
    400: 'Yêu cầu không hợp lệ',
    401: 'Chưa xác thực',
    403: 'Không có quyền truy cập',
    404: 'Không tìm thấy',
    500: 'Lỗi máy chủ',
    502: 'Lỗi cổng kết nối',
    503: 'Dịch vụ không khả dụng',
  };
  return statusTexts[status] || 'Lỗi không xác định';
};

/**
 * Get severity from status code
 */
const getSeverityFromStatus = (status: number): 'success' | 'info' | 'warning' | 'error' => {
  if (status >= 200 && status < 300) {
    return 'success';
  } else if (status === 220) {
    return 'info';
  } else if (status === 221) {
    return 'warning';
  } else if (status === 222 || status >= 400) {
    return 'error';
  }
  return 'error';
};

/**
 * Show notification based on severity
 */
const showNotification = (
  severity: 'success' | 'info' | 'warning' | 'error',
  title: string,
  description: string,
  _status?: number
): void => {
  showNotificationUtil(severity, title, description);
};

/**
 * Show error notification
 */
const showErrorNotification = (title: string, description: string, _status: number): void => {
  showErrorNotificationUtil(title, description);
};

/**
 * Show success message
 */
export const showSuccessMessage = (content: string, duration: number = 3): void => {
  message.success(content, duration);
};

/**
 * Show error message
 */
export const showErrorMessage = (content: string, duration: number = 3): void => {
  message.error(content, duration);
};

/**
 * Show warning message
 */
export const showWarningMessage = (content: string, duration: number = 3): void => {
  message.warning(content, duration);
};

/**
 * Show info message
 */
export const showInfoMessage = (content: string, duration: number = 3): void => {
  message.info(content, duration);
};

/**
 * Fetch audio file and return as base64
 */
export const fetchAudioFile = async (action: string, audioId: string): Promise<string> => {
  try {
    const response = await Api.get(`${action}/${audioId}`, {
      responseType: 'arraybuffer',
    });

    const binaryString = new Uint8Array(response.data).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    );

    const base64 = btoa(binaryString);
    return `data:audio/mp3;base64,${base64}`;
  } catch (error) {
    console.error('Error fetching audio file:', error);
    throw error;
  }
};

/**
 * Stream API response
 */
export const streamApi = async (
  action: string,
  updateVariable: (data: any) => void
): Promise<void> => {
  const apiUrl = localStorage.getItem('apiUrl') || API_BASE_URL;
  const token = localStorage.getItem('accessToken');
  const clientId = getClientId();

  try {
    const response = await fetch(`${apiUrl}/${action}`, {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        CLIENT_ID: clientId,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    const processChunk = async ({ done, value }: ReadableStreamReadResult<Uint8Array>) => {
      if (done) {
        console.log('Streaming complete.');
        return;
      }

      const text = decoder.decode(value, { stream: true });
      buffer += text;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      lines.forEach((line) => {
        const cleanText = line.trim();
        if (cleanText !== '') {
          try {
            const parsedObject = JSON.parse(cleanText);
            updateVariable(parsedObject);
          } catch (error) {
            console.error('Error parsing JSON:', cleanText, error);
          }
        }
      });

      const result = await reader.read();
      return processChunk(result);
    };

    await reader.read().then(processChunk);
  } catch (error) {
    console.error('Stream API error:', error);
    throw error;
  }
};

export default Api;

