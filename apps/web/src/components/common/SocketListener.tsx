'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { checkAuthStart } from '@/features/auth/store/auth.slice';
import { getSocket } from '@/lib/socket';
import { toast } from 'react-toastify';

export default function SocketListener() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state?.auth || {}) as any;

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();

    const handlePermissionsUpdated = (data: { roleId?: string; roleName?: string; timestamp?: string }) => {
      const userRoleId = user?.role?.id;
      const userRoleName = user?.role?.name?.toLowerCase();
      const updatedRoleId = data?.roleId;
      const updatedRoleName = data?.roleName?.toLowerCase();

      // Check if current user is affected
      const isAffected =
        !updatedRoleId ||
        updatedRoleId === userRoleId ||
        (updatedRoleName && updatedRoleName === userRoleName);

      if (isAffected) {
        // Refresh authenticated user state and permissions dynamically
        dispatch(checkAuthStart());

        // Notify user if not admin
        if (userRoleName !== 'admin') {
          toast.info('Your permissions were updated in real-time!', {
            toastId: 'socket-perm-update',
            autoClose: 3500,
          });
        }
      }
    };

    socket.on('permissions_updated', handlePermissionsUpdated);

    return () => {
      socket.off('permissions_updated', handlePermissionsUpdated);
    };
  }, [isAuthenticated, user?.role?.id, user?.role?.name, dispatch]);

  return null;
}
