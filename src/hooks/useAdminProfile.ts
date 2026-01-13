import { useState, useEffect } from 'react';
import api from '../config/axios';

export interface AdminProfile {
  _id: string;
  fullname: string;
  phonenumber: string;
  email: string;
  position: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const useAdminProfile = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/v1/admin/auth/profile');
        setProfile(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching admin profile:', err);
        setError(err.response?.data?.message || 'Failed to fetch profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
};
