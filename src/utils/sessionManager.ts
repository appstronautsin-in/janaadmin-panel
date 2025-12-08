import api from '../config/axios';
import Cookies from 'js-cookie';

interface Location {
  country: string;
  city: string;
}

interface SessionData {
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  location: Location;
}

interface ActivityData {
  action: string;
  section: string;
  description: string;
  metadata?: Record<string, any>;
}

class SessionManager {
  private sessionId: string | null = null;

  async getIPAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get IP address:', error);
      return 'unknown';
    }
  }

  async getLocation(ip: string): Promise<Location> {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      return {
        country: data.country_name || 'Unknown',
        city: data.city || 'Unknown'
      };
    } catch (error) {
      console.error('Failed to get location:', error);
      return {
        country: 'Unknown',
        city: 'Unknown'
      };
    }
  }

  getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
      return 'mobile';
    }
    return 'web';
  }

  async startSession(): Promise<string | null> {
    try {
      console.log('[SessionManager] Starting new session...');
      const ipAddress = await this.getIPAddress();
      console.log('[SessionManager] IP Address:', ipAddress);

      const location = await this.getLocation(ipAddress);
      console.log('[SessionManager] Location:', location);

      const userAgent = navigator.userAgent;
      const deviceType = this.getDeviceType();
      console.log('[SessionManager] Device Type:', deviceType);

      const sessionData: SessionData = {
        ipAddress,
        userAgent,
        deviceType,
        location
      };

      console.log('[SessionManager] Sending session data to API:', sessionData);
      console.log('[SessionManager] POST URL: /v1/session-logs');

      const response = await api.post('/v1/session-logs', sessionData);
      console.log('[SessionManager] Session created successfully:', response.data);

      this.sessionId = response.data.session?._id || response.data._id || response.data.sessionId;
      console.log('[SessionManager] Session ID:', this.sessionId);

      if (this.sessionId) {
        Cookies.set('sessionId', this.sessionId, { expires: 7, secure: true, sameSite: 'strict' });
        console.log('[SessionManager] Session ID saved to cookies');
      }

      return this.sessionId;
    } catch (error) {
      console.error('[SessionManager] Failed to start session:', error);
      if (error instanceof Error) {
        console.error('[SessionManager] Error message:', error.message);
      }
      return null;
    }
  }

  async logActivity(activityData: ActivityData): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      if (!sessionId) {
        console.warn('[SessionManager] No active session for activity logging');
        return;
      }

      console.log('[SessionManager] Logging activity for session:', sessionId);
      console.log('[SessionManager] Activity data:', activityData);
      console.log('[SessionManager] POST URL: /v1/session-logs/' + sessionId + '/activity');

      const response = await api.post(`/v1/session-logs/${sessionId}/activity`, activityData);
      console.log('[SessionManager] Activity logged successfully:', response.data);
    } catch (error) {
      console.error('[SessionManager] Failed to log activity:', error);
      if (error instanceof Error) {
        console.error('[SessionManager] Error message:', error.message);
      }
    }
  }

  async endSession(reason: string = 'manual'): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      if (!sessionId) {
        console.log('[SessionManager] No active session to end');
        return;
      }

      console.log('[SessionManager] Ending session:', sessionId);
      console.log('[SessionManager] Reason:', reason);
      console.log('[SessionManager] POST URL: /v1/session-logs/logout');

      const response = await api.post('/v1/session-logs/logout', {
        sessionId,
        reason
      });

      console.log('[SessionManager] Session ended successfully:', response.data);
      this.clearSession();
    } catch (error) {
      console.error('[SessionManager] Failed to end session:', error);
      if (error instanceof Error) {
        console.error('[SessionManager] Error message:', error.message);
      }
      this.clearSession();
    }
  }

  async revokeSession(sessionId: string, note?: string): Promise<void> {
    try {
      const body = note ? { note } : {};
      console.log('[SessionManager] Revoking session:', sessionId);
      console.log('[SessionManager] Note:', note);
      console.log('[SessionManager] POST URL: /v1/session-logs/revoke/' + sessionId);

      const response = await api.post(`/v1/session-logs/revoke/${sessionId}`, body);
      console.log('[SessionManager] Session revoked successfully:', response.data);
    } catch (error) {
      console.error('[SessionManager] Failed to revoke session:', error);
      if (error instanceof Error) {
        console.error('[SessionManager] Error message:', error.message);
      }
      throw error;
    }
  }

  getSessionId(): string | null {
    if (!this.sessionId) {
      this.sessionId = Cookies.get('sessionId') || null;
    }
    return this.sessionId;
  }

  clearSession(): void {
    this.sessionId = null;
    Cookies.remove('sessionId');
    console.log('[SessionManager] Session ID removed from cookies');
  }
}

export const sessionManager = new SessionManager();
export default sessionManager;
