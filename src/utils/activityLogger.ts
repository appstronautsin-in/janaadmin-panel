import { sessionManager } from './sessionManager';

export const logActivity = async (
  action: string,
  section: string,
  description: string,
  metadata?: Record<string, any>
) => {
  try {
    await sessionManager.logActivity({
      action,
      section,
      description,
      metadata
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const ActivityActions = {
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  VIEW: 'view',
  APPROVE: 'approve',
  REJECT: 'reject',
  REVOKE: 'revoke',
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  UPDATE_STATUS: 'update_status',
  ASSIGN: 'assign',
  ALIGN: 'align',
  NAVIGATE: 'navigate',
  ACCESS: 'access'
};

export const ActivitySections = {
  DASHBOARD: 'Dashboard',
  NEWS: 'News',
  CATEGORY: 'Category',
  SUB_CATEGORY: 'Sub Category',
  USERS: 'Users',
  E_NEWS: 'E-Paper',
  SUBSCRIPTION: 'Subscription',
  CUSTOMERS: 'Customers',
  ADS: 'Ads',
  CLASSIFIED_ADS: 'Classified Ads',
  BREAKING_NEWS: 'Breaking News',
  DAM_INFORMATION: 'Dam Information',
  POLLING: 'Polling',
  THOUGHTS: 'Thoughts',
  FIFTY: 'FiftyYears',
  JUST_IN: 'JustIn',
  DO_YOU_KNOW: 'Do You Know',
  EVENTS: 'Events',
  PROMOTIONS: 'Promotions',
  ACTIVITY: 'Activity',
  SESSION_LOGS: 'Session Logs',
  PERMISSIONS: 'Permissions',
  ALIGN_NEWS: 'Align News',
  MAATHU_MAANKIYA: 'Maathu Maankiya',
  SUBMITTED_NEWS: 'Submitted News',
  VIEWS_ANALYTICS: 'Views Analytics',
  LOGS: 'Logs',
  SETTINGS: 'System Settings',
  ALBUMS: 'Albums'
};
