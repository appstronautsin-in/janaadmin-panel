import React, { useState, useEffect } from 'react';
import { Loader2, Search, Monitor, Smartphone, Tablet, MapPin, Clock, Activity as ActivityIcon, Shield, ChevronDown, ChevronUp, SortAsc, SortDesc, Trash2, X, User, Phone, Mail } from 'lucide-react';
import api from '../config/axios';

interface Location {
  country: string;
  city: string;
}

interface Activity {
  action: string;
  section: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface UserInfo {
  _id: string;
  fullname: string;
  phonenumber: string;
  email: string;
  role: string;
}

interface SessionLog {
  _id: string;
  user: UserInfo;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  location: Location;
  loginAt: string;
  logoutAt?: string;
  logoutReason?: string;
  isActive: boolean;
  failedAttempts: number;
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}

interface ManageSessionLogsProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageSessionLogs: React.FC<ManageSessionLogsProps> = ({ showAlert }) => {
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(true);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'loginAt' | 'logoutAt'>('loginAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteOtpToken, setDeleteOtpToken] = useState('');
  const [deleteOtpSent, setDeleteOtpSent] = useState(false);
  const [deleteOtpLoading, setDeleteOtpLoading] = useState(false);
  const [sendingDeleteOtp, setSendingDeleteOtp] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteExpiresAt, setDeleteExpiresAt] = useState<Date | null>(null);

  useEffect(() => {
    if (otpVerified) {
      fetchSessions();
    }
  }, [otpVerified]);

  useEffect(() => {
    if (otpSent && expiresAt) {
      const timer = setInterval(() => {
        if (new Date() > expiresAt) {
          setOtpSent(false);
          setOtpToken('');
          showAlert('OTP expired. Please request a new one.', 'error');
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, expiresAt]);

  useEffect(() => {
    if (deleteOtpSent && deleteExpiresAt) {
      const timer = setInterval(() => {
        if (new Date() > deleteExpiresAt) {
          setDeleteOtpSent(false);
          setDeleteOtpToken('');
          showAlert('Delete OTP expired. Please request a new one.', 'error');
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [deleteOtpSent, deleteExpiresAt]);

  useEffect(() => {
    let filtered = [...sessions];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(session =>
        statusFilter === 'active' ? session.isActive : !session.isActive
      );
    }

    if (deviceFilter !== 'all') {
      filtered = filtered.filter(session => session.deviceType === deviceFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(session =>
        session.ipAddress.includes(search) ||
        session.location.country.toLowerCase().includes(search) ||
        session.location.city.toLowerCase().includes(search) ||
        session.deviceType.toLowerCase().includes(search) ||
        session.user.fullname.toLowerCase().includes(search) ||
        session.user.phonenumber.includes(search) ||
        session.user.email.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      const aValue = sortField === 'loginAt' ? new Date(a.loginAt).getTime() : (a.logoutAt ? new Date(a.logoutAt).getTime() : 0);
      const bValue = sortField === 'loginAt' ? new Date(b.loginAt).getTime() : (b.logoutAt ? new Date(b.logoutAt).getTime() : 0);
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredSessions(filtered);
  }, [sessions, searchTerm, statusFilter, deviceFilter, sortField, sortOrder]);

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      const response = await api.post('/v1/session-logs/superadmin/send-otp');

      if (response.data.ok) {
        setOtpToken(response.data.otpToken);
        setOtpSent(true);
        const expiresIn = response.data.expiresInSeconds || 300;
        setExpiresAt(new Date(Date.now() + expiresIn * 1000));
        showAlert(response.data.message || 'OTP sent successfully', 'success');
      } else {
        showAlert('Failed to send OTP', 'error');
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      showAlert(error.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showAlert('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await api.post('/v1/session-logs/superadmin/verify-otp', {
        otpToken,
        otp
      });

      if (response.data.ok) {
        setOtpVerified(true);
        setShowOtpModal(false);
        showAlert('OTP verified successfully', 'success');
      } else {
        showAlert('Invalid OTP', 'error');
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      showAlert(error.response?.data?.message || 'Failed to verify OTP', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const fetchSessions = async () => {
    if (!otpToken) {
      showAlert('No OTP token available', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/v1/session-logs', {
        headers: {
          'x-otp-token': otpToken
        }
      });

      if (response.data.ok && response.data.sessions) {
        setSessions(response.data.sessions);
      } else {
        showAlert('Failed to fetch session logs', 'error');
      }
    } catch (error: any) {
      console.error('Error fetching session logs:', error);
      if (error.response?.status === 403) {
        showAlert('OTP verification expired. Please verify again.', 'error');
        setOtpVerified(false);
        setShowOtpModal(true);
        setOtpSent(false);
        setOtpToken('');
      } else {
        showAlert(error.response?.data?.message || 'Failed to fetch session logs', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (sessionId: string) => {
    setDeleteSessionId(sessionId);
    setDeleteModalOpen(true);
    setDeleteOtpSent(false);
    setDeleteOtp('');
    setDeleteOtpToken('');
  };

  const handleSendDeleteOtp = async () => {
    setSendingDeleteOtp(true);
    try {
      const response = await api.post('/v1/session-logs/superadmin/send-otp');

      if (response.data.ok) {
        setDeleteOtpToken(response.data.otpToken);
        setDeleteOtpSent(true);
        const expiresIn = response.data.expiresInSeconds || 300;
        setDeleteExpiresAt(new Date(Date.now() + expiresIn * 1000));
        showAlert(response.data.message || 'OTP sent successfully', 'success');
      } else {
        showAlert('Failed to send OTP', 'error');
      }
    } catch (error: any) {
      console.error('Error sending delete OTP:', error);
      showAlert(error.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setSendingDeleteOtp(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!deleteOtp || deleteOtp.length !== 6) {
      showAlert('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    if (!deleteSessionId || !deleteOtpToken) {
      showAlert('Missing required information', 'error');
      return;
    }

    setDeleting(true);
    try {
      const verifyResponse = await api.post('/v1/session-logs/superadmin/verify-otp', {
        otpToken: deleteOtpToken,
        otp: deleteOtp
      });

      if (!verifyResponse.data.ok) {
        showAlert('Invalid OTP', 'error');
        setDeleting(false);
        return;
      }

      const deleteResponse = await api.delete(`/v1/session-logs/${deleteSessionId}`, {
        headers: {
          'x-otp-token': deleteOtpToken
        }
      });

      if (deleteResponse.data.ok) {
        showAlert('Session log deleted successfully', 'success');
        setDeleteModalOpen(false);
        setDeleteSessionId(null);
        setDeleteOtp('');
        setDeleteOtpToken('');
        setDeleteOtpSent(false);
        fetchSessions();
      } else {
        showAlert('Failed to delete session log', 'error');
      }
    } catch (error: any) {
      console.error('Error deleting session log:', error);
      showAlert(error.response?.data?.message || 'Failed to delete session log', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getTimeRemaining = () => {
    if (!expiresAt) return '';
    const diff = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDeleteTimeRemaining = () => {
    if (!deleteExpiresAt) return '';
    const diff = Math.max(0, Math.floor((deleteExpiresAt.getTime() - Date.now()) / 1000));
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (showOtpModal) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="bg-white w-full max-w-md rounded-lg shadow-xl border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Security Verification</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Security Notice:</strong> Access to Session Logs requires OTP verification. An OTP will be sent to your registered phone number.
              </p>
            </div>

            {!otpSent ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Click the button below to receive an OTP on your registered phone number.
                </p>
                <button
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full flex items-center justify-center px-4 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors duration-200"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Send OTP
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 focus:border-black focus:ring-1 focus:ring-black tracking-widest"
                  />
                </div>

                {expiresAt && (
                  <div className="text-center text-sm text-gray-600">
                    OTP expires in: <span className="font-bold text-red-600">{getTimeRemaining()}</span>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 transition-colors duration-200"
                  >
                    {sendingOtp ? 'Resending...' : 'Resend OTP'}
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otp.length !== 6}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors duration-200"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-gray-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Session Logs</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor and manage user session activity</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            Verified
          </span>
        </div>
      </div>

      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, IP, location, or device..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
          >
            <option value="all">All Devices</option>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-5 w-5 mr-2" /> : <SortDesc className="h-5 w-5 mr-2" />}
            Sort by {sortField === 'loginAt' ? 'Login' : 'Logout'}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>{filteredSessions.length} session(s) found</span>
          <button
            onClick={fetchSessions}
            disabled={loading}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Loader2 className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ActivityIcon className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">No session logs found</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session._id}
                className="border border-gray-200 hover:border-gray-400 transition-colors"
              >
                <div className="p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 text-gray-700">
                            {getDeviceIcon(session.deviceType)}
                            <span className="font-medium capitalize">{session.deviceType}</span>
                          </div>
                          {session.isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                              Active
                            </span>
                          )}
                          {!session.isActive && session.logoutReason && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                              {session.logoutReason}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">User Information</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-900 font-medium">{session.user.fullname}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{session.user.phonenumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600 truncate">{session.user.email}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded capitalize">
                            {session.user.role}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{session.location.city}, {session.location.country}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Monitor className="h-4 w-4" />
                          <span className="truncate">{session.ipAddress}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(session.loginAt)}</span>
                        </div>
                      </div>

                      {session.logoutAt && (
                        <div className="text-sm text-gray-600">
                          Logout: {formatDate(session.logoutAt)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteClick(session._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete session log"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setExpandedSession(expandedSession === session._id ? null : session._id)}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                      >
                        {expandedSession === session._id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedSession === session._id && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <ActivityIcon className="h-4 w-4 mr-2" />
                      Activities ({session.activities.length})
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {session.activities.map((activity, index) => (
                        <div key={index} className="bg-gray-50 p-3 text-sm border-l-4 border-blue-500">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{activity.description}</div>
                              <div className="text-gray-600 mt-1">
                                <span className="font-medium">{activity.action}</span> · {activity.section}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                              {formatDate(activity.timestamp)}
                            </span>
                          </div>
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                                {JSON.stringify(activity.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-bold text-gray-900">Delete Session Log</h2>
              </div>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteSessionId(null);
                  setDeleteOtp('');
                  setDeleteOtpToken('');
                  setDeleteOtpSent(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Deleting a session log requires OTP verification. This action cannot be undone.
                </p>
              </div>

              {!deleteOtpSent ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Click the button below to receive an OTP to confirm deletion.
                  </p>
                  <button
                    onClick={handleSendDeleteOtp}
                    disabled={sendingDeleteOtp}
                    className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 transition-colors duration-200"
                  >
                    {sendingDeleteOtp ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5 mr-2" />
                        Send OTP
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={deleteOtp}
                      onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 focus:border-black focus:ring-1 focus:ring-black tracking-widest"
                    />
                  </div>

                  {deleteExpiresAt && (
                    <div className="text-center text-sm text-gray-600">
                      OTP expires in: <span className="font-bold text-red-600">{getDeleteTimeRemaining()}</span>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSendDeleteOtp}
                      disabled={sendingDeleteOtp}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 transition-colors duration-200"
                    >
                      {sendingDeleteOtp ? 'Resending...' : 'Resend OTP'}
                    </button>
                    <button
                      onClick={handleDeleteSession}
                      disabled={deleting || deleteOtp.length !== 6}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 transition-colors duration-200"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-5 w-5 mr-2" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSessionLogs;
