import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthMiddleware from './middleware/AuthMiddleware';
import { PermissionsProvider } from './middleware/PermissionsMiddleware';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <AuthMiddleware>
              <PermissionsProvider>
                <Dashboard />
              </PermissionsProvider>
            </AuthMiddleware>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;