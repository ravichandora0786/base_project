'use client';

import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiSearch, FiRefreshCw, FiEye } from 'react-icons/fi';
import LoadingButton from '@/components/ui/loadingButton';
import DataTableComponent from '@/components/ui/dataTableComponent';
import SelectDropDown from '@/components/ui/selectDropDown';
import CustomSwitch from '@/components/ui/customSwitch';
import { useAppSelector, useAppDispatch } from '@/store';
import { checkAuthStart } from '@/features/auth/store/auth.slice';
import { ColumnDef } from '@tanstack/react-table';
import { STATUS_FILTER_OPTIONS } from '@/lib/constants';
import { useConfirm } from '@/components/ui/confirmationModal';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

// Redux Imports
import { selectGlobalLoading } from '@/store/common/selector';
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

interface Role {
  id: string;
  name: string;
  is_active: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  profile_image: string | null;
  is_active: boolean;
  role: {
    id: string;
    name: string;
  };
  permissions?: Record<string, string[]>;
}

export default function UsersCRUDPage() {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const router = useRouter();
  const { user: currentUser } = useAppSelector((state) => state.auth);

  // Redux Selectors
  const usersData = useAppSelector(selectAllUserDataList);
  const rolesData = useAppSelector(selectAllRoleDataList);
  const pagination = useAppSelector(selectUserPagination);
  const { search: searchQuery, status: statusFilter } = useAppSelector(selectUserSearchData);

  const usersRaw: User[] = Array.isArray(usersData) ? usersData : [];
  const roles: Role[] = Array.isArray(rolesData) ? rolesData : [];

  useEffect(() => {
    dispatch(getAllUsers({}));
    dispatch(getAllRoles({}));
  }, [dispatch]);

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
          dispatch(getAllUsers({}));
          dispatch(checkAuthStart());
        },
        onFailure: (err: any) => {
          toast.error(err.message || 'Failed to delete user');
        },
      })
    );
  };

  // Fetch with server-side filter params
  const fetchWithFilters = (search: string, status: any) => {
    const params: any = {};
    if (search) params.search = search;
    if (status !== 'all') params.is_active = status;
    dispatch(getAllUsers({ data: params }));
  };

  // Exclude logged-in user (client-side only), server already filtered search/status
  const filteredUsers = React.useMemo(() => {
    return usersRaw.filter((u) => (currentUser ? u.id !== currentUser.id : true));
  }, [usersRaw, currentUser]);

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
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-custom flex items-center justify-center text-slate-500 shadow-2xs">
                  <FiUser className="w-4 h-4" />
                </div>
              )}
              <div>
                <div className="font-bold text-slate-900 dark:text-white capitalize tracking-tight leading-snug">
                  {row.original.name}
                </div>
                <div className="text-xs text-custom-muted">{row.original.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {row.original.phone || '—'}
          </span>
        ),
      },
      {
        header: 'Gender',
        accessorKey: 'gender',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 capitalize">
            {row.original.gender || '—'}
          </span>
        ),
      },
      {
        header: 'Role',
        accessorKey: 'role.name',
        cell: ({ row }) => {
          const roleName = row.original.role?.name || '—';
          const isAdmin = roleName.toLowerCase() === 'admin';
          return (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-tight border capitalize ${
                isAdmin
                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {roleName}
            </span>
          );
        },
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ row }) => {
          const isActive = row.original.is_active;
          const isAdmin = currentUser?.role?.name?.toLowerCase() === 'admin';
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
                  dispatch(getAllUsers({}));
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
          <div className="text-right space-x-1.5">
            <LoadingButton
              variant="custom"
              onClick={() => handleOpenView(row.original)}
              className="w-8 h-8 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/40 transition inline-flex items-center justify-center shadow-2xs"
              aria-label="View User Details"
              title="View User"
            >
              <FiEye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="custom"
              onClick={() => handleOpenEdit(row.original)}
              className="w-8 h-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40 transition inline-flex items-center justify-center shadow-2xs"
              aria-label="Edit User"
              title="Edit User"
            >
              <FiEdit2 className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="custom"
              onClick={() => handleDelete(row.original.id)}
              className="w-8 h-8 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-100 dark:hover:border-red-900/40 transition inline-flex items-center justify-center shadow-2xs"
              aria-label="Delete User"
              title="Delete User"
            >
              <FiTrash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        ),
      },
    ],
    [filteredUsers, currentUser, dispatch]
  );

  // Client-side pagination slicing
  const slicedUsers = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, pagination]);

  return (
    <div className="space-y-4 flex-1 flex flex-col min-h-0">
      {/* Toolbar Search, Status Filter and Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center space-x-3 flex-grow max-w-md">
          <div className="relative flex-grow">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Name"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                dispatch(setUserSearchData({ search: val, status: statusFilter }));
                fetchWithFilters(val, statusFilter);
              }}
              className="w-full pl-10 pr-4 py-2 border border-custom hover:border-primary rounded-xl text-sm bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          <div className="w-40 shrink-0">
            <SelectDropDown
              name="status-filter"
              options={STATUS_FILTER_OPTIONS as any}
              value={STATUS_FILTER_OPTIONS.find((opt) => opt.value === statusFilter) as any}
              onChange={(opt: any) => {
                if (opt) {
                  dispatch(setUserSearchData({ search: searchQuery, status: opt.value }));
                  fetchWithFilters(searchQuery, opt.value);
                }
              }}
              isSearchable={false}
              isClearable={false}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <LoadingButton
            variant="custom"
            onClick={() => {
              dispatch(setUserSearchData({ search: '', status: 'all' }));
              dispatch(getAllUsers({}));
              dispatch(getAllRoles({}));
            }}
            className="p-2.5 border border-custom rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition"
            title="Refresh"
          >
            <FiRefreshCw className="w-4 h-4 animate-hover-spin" />
          </LoadingButton>

          <LoadingButton
            onClick={handleOpenCreate}
            variant="custom"
            className="flex items-center space-x-2 px-4 py-2.5 bg-custom-primary hover:bg-custom-primary-hover text-white rounded-xl font-bold shadow-md transition"
          >
            <FiPlus className="w-4 h-4" />
          </LoadingButton>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <DataTableComponent
          columns={columns}
          data={slicedUsers}
          pagination={pagination}
          setPagination={(newPag: any) => dispatch(setUserPagination(newPag))}
          totalRows={filteredUsers.length}
        />
      </div>
    </div>
  );
}
