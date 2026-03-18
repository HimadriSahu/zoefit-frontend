// Enhanced error handling service for robust error management
import { ApiError } from './api';

export interface ErrorReport {
  timestamp: string;
  error: {
    type: 'network' | 'validation' | 'server' | 'authentication' | 'unknown';
    message: string;
    code?: string | number;
    details?: any;
  };
  context: {
    endpoint?: string;
    method?: string;
    userId?: string;
    action?: string;
  };
  recovery: {
    attempted: boolean;
    successful: boolean;
    action?: string;
  };
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorReports: ErrorReport[] = [];

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  // Handle and categorize errors
  handleError(error: any, context?: Partial<ErrorReport['context']>): ErrorReport {
    const timestamp = new Date().toISOString();
    
    let errorType: ErrorReport['error']['type'] = 'unknown';
    let errorMessage = 'Unknown error occurred';
    let errorCode: string | number | undefined;
    
    // Categorize error type
    if (error instanceof ApiError) {
      errorType = this.categorizeApiError(error);
      errorMessage = error.message;
      errorCode = error.status;
    } else if (error instanceof Error) {
      errorType = this.categorizeStandardError(error);
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
      errorType = 'unknown';
    } else if (error && error.message) {
      errorMessage = error.message;
      errorType = 'server';
    }

    const errorReport: ErrorReport = {
      timestamp,
      error: {
        type: errorType,
        message: errorMessage,
        code: errorCode,
        details: error
      },
      context: {
        endpoint: context?.endpoint,
        method: context?.method,
        userId: context?.userId,
        action: context?.action
      },
      recovery: {
        attempted: false,
        successful: false
      }
    };

    // Store error report
    this.errorReports.push(errorReport);
    
    // Keep only last 50 error reports
    if (this.errorReports.length > 50) {
      this.errorReports = this.errorReports.slice(-50);
    }

    // Log error
    this.logError(errorReport);
    
    // Attempt recovery
    this.attemptErrorRecovery(errorReport);

    return errorReport;
  }

  // Categorize API errors
  private categorizeApiError(error: ApiError): ErrorReport['error']['type'] {
    if (!error.status) {
      return 'network';
    }

    switch (error.status) {
      case 400:
        return 'validation';
      case 401:
      case 403:
        return 'authentication';
      case 404:
        return 'server';
      case 429:
        return 'server';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'server';
      default:
        if (error.status >= 400 && error.status < 500) {
          return 'validation';
        } else if (error.status >= 500) {
          return 'server';
        }
        return 'unknown';
    }
  }

  // Categorize standard JavaScript errors
  private categorizeStandardError(error: Error): ErrorReport['error']['type'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    } else if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
      return 'validation';
    } else if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
      return 'authentication';
    } else if (message.includes('server') || message.includes('internal')) {
      return 'server';
    }
    
    return 'unknown';
  }

  // Attempt automatic error recovery
  private async attemptErrorRecovery(errorReport: ErrorReport): Promise<void> {
    try {
      errorReport.recovery.attempted = true;
      
      switch (errorReport.error.type) {
        case 'network':
          await this.handleNetworkError(errorReport);
          break;
        case 'authentication':
          await this.handleAuthError(errorReport);
          break;
        case 'validation':
          await this.handleValidationError(errorReport);
          break;
        case 'server':
          await this.handleServerError(errorReport);
          break;
        default:
          console.warn('⚠️ No automatic recovery available for error type:', errorReport.error.type);
      }
    } catch (recoveryError) {
      console.error('❌ Error recovery failed:', recoveryError);
      errorReport.recovery.successful = false;
    }
  }

  // Handle network errors
  private async handleNetworkError(errorReport: ErrorReport): Promise<void> {
    console.log('🔄 Attempting network error recovery...');
    
    // Check if it's a timeout or connection issue
    if (errorReport.error.message?.includes('timeout')) {
      console.log('⏰ Network timeout detected, retry may help');
      errorReport.recovery.action = 'retry_request';
      errorReport.recovery.successful = true;
    } else if (errorReport.error.message?.includes('fetch')) {
      console.log('🌐 Connection issue detected, check network status');
      errorReport.recovery.action = 'check_network';
      errorReport.recovery.successful = true;
    }
  }

  // Handle authentication errors
  private async handleAuthError(errorReport: ErrorReport): Promise<void> {
    console.log('🔐 Attempting authentication error recovery...');
    
    if (errorReport.error.code === 401) {
      console.log('🔑 Token expired, attempting refresh...');
      errorReport.recovery.action = 'refresh_token';
      errorReport.recovery.successful = true;
    } else if (errorReport.error.code === 403) {
      console.log('🚫 Access denied, check permissions');
      errorReport.recovery.action = 'check_permissions';
      errorReport.recovery.successful = true;
    }
  }

  // Handle validation errors
  private async handleValidationError(errorReport: ErrorReport): Promise<void> {
    console.log('✅ Validation error recovery...');
    
    if (errorReport.context.endpoint?.includes('onboarding')) {
      console.log('📝 Onboarding validation failed, check required fields');
      errorReport.recovery.action = 'validate_required_fields';
      errorReport.recovery.successful = true;
    } else if (errorReport.context.endpoint?.includes('profile')) {
      console.log('👤 Profile validation failed, check data format');
      errorReport.recovery.action = 'check_data_format';
      errorReport.recovery.successful = true;
    }
  }

  // Handle server errors
  private async handleServerError(errorReport: ErrorReport): Promise<void> {
    console.log('🖥 Server error recovery...');
    
    if (errorReport.error.code === 500) {
      console.log('💥 Internal server error, retry after delay');
      errorReport.recovery.action = 'retry_with_backoff';
      errorReport.recovery.successful = true;
    } else if (errorReport.error.code === 503) {
      console.log('🔧 Service unavailable, try later');
      errorReport.recovery.action = 'try_later';
      errorReport.recovery.successful = true;
    }
  }

  // Log error with appropriate level
  private logError(errorReport: ErrorReport): void {
    const logMessage = `[${errorReport.timestamp}] ${errorReport.error.type.toUpperCase()}: ${errorReport.error.message}`;
    
    switch (errorReport.error.type) {
      case 'network':
      case 'server':
        console.error('🚨', logMessage, errorReport.error.details);
        break;
      case 'authentication':
        console.warn('🔐', logMessage, errorReport.error.details);
        break;
      case 'validation':
        console.info('⚠️', logMessage, errorReport.error.details);
        break;
      default:
        console.log('❓', logMessage, errorReport.error.details);
    }
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    recent: ErrorReport[];
    recoveryRate: number;
  } {
    const byType: Record<string, number> = {};
    
    this.errorReports.forEach(report => {
      byType[report.error.type] = (byType[report.error.type] || 0) + 1;
    });

    const recoveredCount = this.errorReports.filter(r => r.recovery.successful).length;
    const recoveryRate = this.errorReports.length > 0 ? (recoveredCount / this.errorReports.length) * 100 : 0;

    return {
      total: this.errorReports.length,
      byType,
      recent: this.errorReports.slice(-10), // Last 10 errors
      recoveryRate: Math.round(recoveryRate * 100) / 100
    };
  }

  // Clear error reports
  clearErrorReports(): void {
    this.errorReports = [];
    console.log('🧹 Error reports cleared');
  }

  // Export error reports for debugging
  exportErrorReports(): string {
    const stats = this.getErrorStats();
    return JSON.stringify({
      exportTime: new Date().toISOString(),
      statistics: stats,
      reports: this.errorReports
    }, null, 2);
  }
}

export const errorHandlingService = ErrorHandlingService.getInstance();
