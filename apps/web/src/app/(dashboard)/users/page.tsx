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
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          dispatch(setUserSearchData({ search: val, status: statusFilter }));
          fetchWithFilters(val, statusFilter);
        }}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          dispatch(setUserSearchData({ search: searchQuery, status: val }));
          fetchWithFilters(searchQuery, val);
        }}
        onRefresh={() => {
          dispatch(setUserSearchData({ search: '', status: 'all' }));
          dispatch(getAllUsers({}));
          dispatch(getAllRoles({}));
        }}
        onCreate={handleOpenCreate}
        createTooltip="Add New User"
      />

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
