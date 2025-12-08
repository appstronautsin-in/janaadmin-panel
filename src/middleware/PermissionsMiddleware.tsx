import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../config/axios';

interface Permissions {
  _id: string;
  admin: string;
  createNews: boolean;
  editNews: boolean;
  deleteNews: boolean;
  createENews: boolean;
  editENews: boolean;
  deleteENews: boolean;
  createCategory: boolean;
  editCategory: boolean;
  deleteCategory: boolean;
  createSubCategory: boolean;
  editSubCategory: boolean;
  deleteSubCategory: boolean;
  addUser: boolean;
  editUser: boolean;
  deleteUser: boolean;
  createSubscription: boolean;
  editSubscription: boolean;
  deleteSubscription: boolean;
  createAds: boolean;
  editAds: boolean;
  deleteAds: boolean;
  createCustomer: boolean;
  editCustomer: boolean;
  deleteCustomer: boolean;
  createPolling: boolean;
  editPolling: boolean;
  deletePolling: boolean;
  createBreakingNews: boolean;
  editBreakingNews: boolean;
  deleteBreakingNews: boolean;
  createDamInformation: boolean;
  editDamInformation: boolean;
  deleteDamInformation: boolean;
  createClassifiedAds: boolean;
  editClassifiedAds: boolean;
  deleteClassifiedAds: boolean;
  createThought: boolean;
  editThought: boolean;
  deleteThought: boolean;
  createFifty: boolean;
  editFifty: boolean;
  deleteFifty: boolean;
  createJustIn: boolean;
  editJustIn: boolean;
  deleteJustIn: boolean;
  createPromotion: boolean;
  editPromotion: boolean;
  deletePromotion: boolean;
  createDoYouKnow: boolean;
  editDoYouKnow: boolean;
  deleteDoYouKnow: boolean;
  createEvent: boolean;
  editEvent: boolean;
  deleteEvent: boolean;
  viewActivity: boolean;
  viewViews: boolean;
}

interface PermissionsContextType {
  permissions: Permissions | null;
  loading: boolean;
  error: string | null;
  checkPermission: (permission: keyof Permissions) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: null,
  loading: true,
  error: null,
  checkPermission: () => false,
});

export const usePermissions = () => useContext(PermissionsContext);

interface PermissionsProviderProps {
  children: React.ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await api.get('/v1/admin/roles/my-permissions');
        if (response.data) {
          // Filter out non-boolean properties
          const permissionsData = Object.entries(response.data).reduce((acc, [key, value]) => {
            if (typeof value === 'boolean' || key === '_id' || key === 'admin') {
              acc[key] = value;
            }
            return acc;
          }, {} as Permissions);
          
          setPermissions(permissionsData);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching permissions:', err);
        setError('Failed to fetch permissions');
        setPermissions(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const checkPermission = (permission: keyof Permissions): boolean => {
    if (!permissions || typeof permissions[permission] !== 'boolean') {
      return false;
    }
    return permissions[permission];
  };

  return (
    <PermissionsContext.Provider value={{ permissions, loading, error, checkPermission }}>
      {children}
    </PermissionsContext.Provider>
  );
};

interface RequirePermissionProps {
  permission: keyof Permissions;
  children: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({ permission, children }) => {
  const { loading, checkPermission } = usePermissions();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!checkPermission(permission)) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};