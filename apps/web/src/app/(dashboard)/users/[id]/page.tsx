'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-toastify';
import LoadingButton from '@/components/ui/loadingButton';
import { FiArrowLeft, FiMail, FiPhone, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { User } from '@/types/models';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UserDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/users/${id}`);
      setUser(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load user details');
      router.push('/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <p className="text-custom-muted font-medium text-lg">User not found.</p>
        <LoadingButton variant="secondary" onClick={() => router.push('/users')}>
          Back to Users
        </LoadingButton>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex-1 flex flex-col min-h-0 animate-fade-in">
      {/* Back Header navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <LoadingButton
            variant="secondary"
            onClick={() => router.push('/users')}
            className="p-2.5 border border-custom rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition shrink-0"
          >
            <FiArrowLeft className="w-4 h-4" />
          </LoadingButton>
          <div>
            <span className="text-xs text-custom-muted font-bold uppercase tracking-wider">User Directory</span>
            <h2 className="text-xl font-bold text-gray-955 dark:text-white">User Profile Details</h2>
          </div>
        </div>
        <LoadingButton
          variant="primary"
          onClick={() => router.push(`/users/edit?id=${user.id}`)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 font-bold self-start sm:self-auto"
        >
          Edit Profile
        </LoadingButton>
      </div>

      {/* Main Details Card */}
      <div className="bg-custom-card border border-custom rounded-2xl shadow-sm p-6 sm:p-8 space-y-8 flex-grow overflow-auto w-full">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-custom">
          <div className="w-24 h-24 rounded-2xl bg-custom-primary/10 text-custom-primary flex items-center justify-center text-4xl font-extrabold shadow-sm border border-custom-primary/20">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-grow">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {user.name}
            </h3>
            <p className="text-base text-custom-muted mt-1 flex items-center justify-center sm:justify-start gap-2">
              <FiMail className="w-4 h-4" />
              <span>{user.email}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="px-3 py-1.5 bg-custom-primary/10 text-custom-primary text-xs font-bold rounded-full uppercase tracking-wider">
                {user.role?.name || 'No Role Assigned'}
              </span>
              <span className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 ${
                user.is_active 
                  ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800/30' 
                  : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-800/30'
              }`}>
                {user.is_active ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiXCircle className="w-3.5 h-3.5" />}
                <span>{user.is_active ? 'Active Status' : 'Inactive Status'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Card */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Contact Specifications
            </h4>
            <div className="bg-gray-50/50 dark:bg-gray-800/20 border border-custom rounded-2xl p-5 space-y-4">
              <div>
                <span className="text-xs text-custom-muted block font-medium">Registered Email Address</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 block">
                  {user.email}
                </span>
              </div>
              <div className="border-t border-custom pt-4">
                <span className="text-xs text-custom-muted block font-medium">Mobile / Phone Number</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 block flex items-center gap-2">
                  <FiPhone className="w-3.5 h-3.5 text-custom-muted" />
                  <span>{user.phone || 'Not Specified'}</span>
                </span>
              </div>
              <div className="border-t border-custom pt-4">
                <span className="text-xs text-custom-muted block font-medium">Gender Identity</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 block capitalize">
                  {user.gender || 'Not Specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Authorization Settings */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              System Authorization
            </h4>
            <div className="bg-gray-50/50 dark:bg-gray-800/20 border border-custom rounded-2xl p-5 space-y-4">
              <div>
                <span className="text-xs text-custom-muted block font-medium">Associated Role context</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 block capitalize">
                  {user.role?.name || 'Standard User'}
                </span>
              </div>
              <div className="border-t border-custom pt-4">
                <span className="text-xs text-custom-muted block font-medium">Assigned Module Permissions</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {user.role?.name?.toLowerCase() === 'admin' ? (
                    <span className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 px-2.5 py-1 rounded-lg">
                      Full Administrator Privileges (All Modules Enabled)
                    </span>
                  ) : user.permissions && Object.keys(user.permissions).length > 0 ? (
                    Object.keys(user.permissions).map((pKey) => (
                      <span key={pKey} className="px-2.5 py-1 border border-custom rounded-lg text-xs text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider bg-custom-card">
                        {pKey}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-custom-muted font-bold italic">
                      No Mapped Permissions Found
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
