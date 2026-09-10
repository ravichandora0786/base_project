'use client';

import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUser } from 'react-icons/fi';
import DataTableComponent from '@/components/ui/dataTableComponent';
import CustomSwitch from '@/components/ui/customSwitch';
import TableToolbar from '@/components/common/TableToolbar';
import TableRowActions from '@/components/common/TableRowActions';
import { useAppSelector, useAppDispatch } from '@/store';
import { checkAuthStart } from '@/features/auth/store/auth.slice';
import { ColumnDef } from '@tanstack/react-table';
import { useConfirm } from '@/components/ui/confirmationModal';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { User, Role } from '@/types/models';
import Cookies from 'js-cookie';

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    if (typeof window !== 'undefined' && window.atob) {
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    }
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

// Redux Imports
import {
  selectAllUserDataList,
  selectUserPagination,
  selectUserSearchData,
} from './store/selector';
import {
  getAllUsers,
  setUserPagination,
  setUserSearchData,
  deleteUser,
} from './store/slice';
import { selectAllRoleDataList } from '../roles/store/selector';
import { getAllRoles } from '../roles/store/slice';

export default function UsersCRUDPage() {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const router = useRouter();
  const { user: currentUser } = useAppSelector((state) => state?.auth || {}) as any;

  // Extract logged-in user id & email from Redux or directly from access_token JWT
  const loggedInInfo = React.useMemo(() => {
    let id = currentUser?.id || null;
    let email = currentUser?.email || null;
    let role = currentUser?.role?.name || null;

    if (!id || !email) {
      try {
        const token = Cookies.get('access_token');
        if (token) {
          const decoded = parseJwt(token);
          if (!id) id = decoded?.sub || decoded?.id || null;
          if (!email) email = decoded?.email || null;
          if (!role) role = decoded?.role || null;
        }
      } catch (err) {
        console.error('Error parsing access token:', err);
      }
    }

    return { id, email, role };
  }, [currentUser]);

  // Redux Selectors
  const usersData = useAppSelector(selectAllUserDataList);
  const rolesData = useAppSelector(selectAllRoleDataList);
  const pagination = useAppSelector(selectUserPagination);
  const { search: searchQuery, status: statusFilter } = useAppSelector(selectUserSearchData);

  const usersRaw: User[] = React.useMemo(() => {
    if (Array.isArray(usersData)) return usersData;
    if (Array.isArray(usersData?.data)) return usersData.data;
    if (Array.isArray(usersData?.items)) return usersData.items;
    return [];
  }, [usersData]);

  const roles: Role[] = Array.isArray(rolesData) ? rolesData : [];

  // Exclude logged-in user by ID and email (from token / currentUser)
  const filteredUsers = React.useMemo(() => {
    return usersRaw.filter((u) => {
      if (loggedInInfo.id && u.id === loggedInInfo.id) return false;
      if (loggedInInfo.email && u.email?.toLowerCase() === loggedInInfo.email.toLowerCase()) return false;
      return true;
    });
  }, [usersRaw, loggedInInfo]);

  const isServerPaginated = typeof usersData?.total === 'number' || typeof usersData?.pagination?.totalItems === 'number';

  const totalRows: number = React.useMemo(() => {
    const hasLoggedInUserInRaw = Boolean(
      (loggedInInfo.id && usersRaw.some((u) => u.id === loggedInInfo.id)) ||
      (loggedInInfo.email && usersRaw.some((u) => u.email?.toLowerCase() === loggedInInfo.email.toLowerCase()))
    );
    const serverTotal = typeof usersData?.total === 'number'
      ? usersData.total
      : (typeof usersData?.pagination?.totalItems === 'number'
          ? usersData.pagination.totalItems
          : filteredUsers.length);
    return hasLoggedInUserInRaw ? Math.max(0, serverTotal - 1) : serverTotal;
  }, [usersData, usersRaw, loggedInInfo, filteredUsers.length]);

  // Fetch with server-side query params (page, pageSize, search, is_active)
  const fetchUsers = React.useCallback(
    (page: number, pageSize: number, search?: string, status?: any) => {
      const params: any = {
        page,
        pageSize,
      };
      const activeSearch = search !== undefined ? search : searchQuery;
      const activeStatus = status !== undefined ? status : statusFilter;

      if (activeSearch && activeSearch.trim()) {
        params.search = activeSearch.trim();
      }
      if (activeStatus !== undefined && activeStatus !== null && activeStatus !== 'all') {
        params.is_active = activeStatus;
      }

      dispatch(getAllUsers({ data: params }));
    },
    [dispatch, searchQuery, statusFilter]
  );

  useEffect(() => {
    fetchUsers(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
    dispatch(getAllRoles({}));
  }, [dispatch]);

  const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (val: string) => {
    dispatch(setUserSearchData({ search: val, status: statusFilter }));
    const newPagination = { ...pagination, pageIndex: 0 };
    dispatch(setUserPagination(newPagination));

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      fetchUsers(1, pagination?.pageSize || 10, val, statusFilter);
    }, 300);
  };

  const handleStatusChange = (val: any) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    dispatch(setUserSearchData({ search: searchQuery, status: val }));
    const newPagination = { ...pagination, pageIndex: 0 };
    dispatch(setUserPagination(newPagination));
    fetchUsers(1, pagination?.pageSize || 10, searchQuery, val);
  };

  const handlePaginationChange = (updater: any) => {
    const nextPagination = typeof updater === 'function' ? updater(pagination) : updater;
    dispatch(setUserPagination(nextPagination));
    fetchUsers(nextPagination.pageIndex + 1, nextPagination.pageSize, searchQuery, statusFilter);
  };

  const handleRefresh = () => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    const resetPag = { pageIndex: 0, pageSize: 10 };
    dispatch(setUserSearchData({ search: '', status: 'all' }));
    dispatch(setUserPagination(resetPag));
    fetchUsers(1, 10, '', 'all');
    dispatch(getAllRoles({}));
  };

  const handleOpenCreate = () => {
    router.push('/users/add');
  };

  const handleOpenEdit = (user: User) => {
    router.push(`/users/edit?id=${user.id}`);
  };

  const handleOpenView = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Delete User Account?',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!isConfirmed) return;

    dispatch(
      deleteUser({
        id,
        onSuccess: () => {
          toast.success('User deleted successfully');
          fetchUsers(pagination.pageIndex + 1, pagination.pageSize || 10, searchQuery, statusFilter);
          dispatch(checkAuthStart());
        },
        onFailure: (err: any) => {
          toast.error(err.message || 'Failed to delete user');
        },
      })
    );
  };

  // Columns definition for DataTableComponent
  const columns = React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: 'Name / Email',
        accessorKey: 'name',
        cell: ({ row }) => {
          const [imgError, setImgError] = React.useState(false);
          return (
            <div className="flex items-center space-x-3">
              {row.original.profile_image && !imgError ? (
                <img
                  src={row.original.profile_image}
                  alt={row.original.name}
                  className="w-9 h-9 rounded-xl object-cover border border-custom shadow-2xs"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-custom-primary/10 border border-custom flex items-center justify-center text-custom-primary font-bold shadow-2xs">
                  <FiUser className="w-4 h-4" />
                </div>
              )}
              <div>
                <div className="font-bold text-gray-900 dark:text-white capitalize">{row.original.name}</div>
                <div className="text-xs text-custom-muted">{row.original.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Role',
        accessorKey: 'role.name',
        cell: ({ row }) => {
          const roleName = row.original.role?.name || 'No Role';
          const isRoleAdmin = roleName.toLowerCase() === 'admin';
          return (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize border ${
                isRoleAdmin
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 shadow-2xs'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 shadow-2xs'
              }`}
            >
              {roleName}
            </span>
          );
        },
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
        cell: ({ getValue }) => <span>{(getValue() as string) || '-'}</span>,
      },
      {
        header: 'Gender',
        accessorKey: 'gender',
        cell: ({ getValue }) => {
          const val = (getValue() as string) || '';
          return <span className="capitalize">{val ? val : '-'}</span>;
        },
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ row }) => {
          const isActive = row.original.is_active;
          const isAdmin =
            currentUser?.role?.name?.toLowerCase() === 'admin' ||
            loggedInInfo.role?.toLowerCase() === 'admin';
          return (
            <CustomSwitch
              name={`status-${row.original.id}`}
              checked={isActive}
              onChange={async (e) => {
                const newVal = e.target.checked;
                try {
                  await apiClient.patch(`/users/${row.original.id}/status`, {
                    is_active: newVal,
                  });
                  toast.success('User status updated successfully');
                  fetchUsers(pagination.pageIndex + 1, pagination.pageSize || 10, searchQuery, statusFilter);
                  dispatch(checkAuthStart());
                } catch (err: any) {
                  toast.error(err.response?.data?.message || 'Failed to update status');
                }
              }}
              disabled={!isAdmin}
            />
          );
        },
      },
      {
        header: () => <div className="text-right">Actions</div>,
        id: 'actions',
        cell: ({ row }) => (
          <TableRowActions
            onView={() => handleOpenView(row.original)}
            onEdit={() => handleOpenEdit(row.original)}
            onDelete={() => handleDelete(row.original.id)}
            viewTitle="View User"
            editTitle="Edit User"
            deleteTitle="Delete User"
          />
        ),
      },
    ],
    [filteredUsers, currentUser, dispatch, pagination, searchQuery, statusFilter, fetchUsers]
  );

  // Paginated data for display
  const displayUsers = React.useMemo(() => {
    if (isServerPaginated) return filteredUsers;
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, pagination, isServerPaginated]);

  return (
    <div className="space-y-4 flex-1 flex flex-col min-h-0">
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onRefresh={handleRefresh}
        onCreate={handleOpenCreate}
        createTooltip="Add New User"
      />

      <div className="flex-1 flex flex-col min-h-0">
        <DataTableComponent
          columns={columns}
          data={displayUsers}
          pagination={pagination}
          setPagination={handlePaginationChange}
          totalRows={totalRows}
        />
      </div>
    </div>
  );
}
