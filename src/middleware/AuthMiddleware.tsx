import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import SessionExpiredPopup from '../components/SessionExpiredPopup';
import { sessionManager } from '../utils/sessionManager';

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

const AuthMiddleware = ({ children }: AuthMiddlewareProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  const checkTokenExpiry = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if ((decoded as any).exp < currentTime) {
        return false;
      }

      // Set up expiry check for remaining time
      const timeUntilExpiry = ((decoded as any).exp - currentTime) * 1000;
      if (timeUntilExpiry > 0) {
        setTimeout(() => {
          setShowSessionExpired(true);
        }, timeUntilExpiry);
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const isValid = checkTokenExpiry();
    if (!isValid && !showSessionExpired) {
      sessionManager.endSession('token_expired').catch(console.error);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('loginTime');
      sessionManager.clearSession();
      navigate('/', { replace: true });
    }
  }, [location]);

  const handleSessionExpired = async () => {
    try {
      await sessionManager.endSession('session_expired');
    } catch (error) {
      console.error('Error ending session:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('loginTime');
    sessionManager.clearSession();
    setShowSessionExpired(false);
    navigate('/', { replace: true });
  };

  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <>
      {children}
      {showSessionExpired && (
        <SessionExpiredPopup onClose={handleSessionExpired} />
      )}
    </>
  );
};

export default AuthMiddleware;