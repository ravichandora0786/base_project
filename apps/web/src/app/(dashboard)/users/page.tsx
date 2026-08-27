'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiSearch, FiRefreshCw, FiEye } from 'react-icons/fi';
import RenderFields from '@/components/ui/renderFields';
import LoadingButton from '@/components/ui/loadingButton';
import DataTableComponent from '@/components/ui/dataTableComponent';
import GenericModal from '@/components/ui/genericModal';
import SelectDropDown from '@/components/ui/selectDropDown';
import CustomSwitch from '@/components/ui/customSwitch';
import { useAppSelector, useAppDispatch } from '@/store';
import { checkAuthStart } from '@/features/auth/store/auth.slice';
import { ColumnDef } from '@tanstack/react-table';
import { STATUS_FILTER_OPTIONS, GENDER_OPTIONS, PHONE_REGEX, PHONE_ERROR, EMAIL_GMAIL_REGEX, EMAIL_GMAIL_ERROR, PASSWORD_REGEX, PASSWORD_ERROR } from '@/lib/constants';
import { useConfirm } from '@/components/ui/confirmationModal';
import { useRouter } from 'next/navigation';

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
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | boolean>('all');
  // Local client-side pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiClient.get('/roles');
      setRoles(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch roles');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

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
    try {
      await apiClient.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
      dispatch(checkAuthStart());
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Exclude logged in user and apply search & status filters
  const filteredUsers = React.useMemo(() => {
    let list = users;
    if (currentUser) {
      list = list.filter((u) => u.id !== currentUser.id);
    }
    return list.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ? true : u.is_active === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, currentUser, searchQuery, statusFilter]);

  // Columns definition for DataTableComponent
  const columns = React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: 'Name / Email',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            {row.original.profile_image ? (
              <img
                src={row.original.profile_image}
                alt={row.original.name}
                className="w-9 h-9 rounded-full object-cover border border-custom"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                <FiUser className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="font-bold text-gray-900 dark:text-white capitalize">{row.original.name}</div>
              <div className="text-xs text-custom-muted">{row.original.email}</div>
            </div>
          </div>
        ),
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
        cell: ({ row }) => <span className="text-sm font-semibold">{row.original.phone || '-'}</span>,
      },
      {
        header: 'Gender',
        accessorKey: 'gender',
        cell: ({ row }) => <span className="text-sm font-semibold capitalize">{row.original.gender || '-'}</span>,
      },
      {
        header: 'Role',
        accessorKey: 'role.name',
        cell: ({ row }) => (
          <span className="font-bold text-gray-900 dark:text-white capitalize">
            {row.original.role?.name || '-'}
          </span>
        ),
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
                  fetchUsers();
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
          <div className="text-right space-x-2">
            <LoadingButton
              variant="custom"
              onClick={() => handleOpenView(row.original)}
              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-xl transition inline-flex items-center"
              aria-label="View User Details"
              title="View"
            >
              <FiEye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="custom"
              onClick={() => handleOpenEdit(row.original)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition inline-flex items-center"
              aria-label="Edit User"
              title="Edit"
            >
              <FiEdit2 className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="custom"
              onClick={() => handleDelete(row.original.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition inline-flex items-center"
              aria-label="Delete User"
              title="Delete"
            >
              <FiTrash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        ),
      },
    ],
    [filteredUsers, currentUser]
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-grow max-w-md">
          <div className="relative flex-grow">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-custom hover:border-primary rounded-xl text-sm bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
          
          <div className="w-40 shrink-0">
            <SelectDropDown
              name="status-filter"
              options={STATUS_FILTER_OPTIONS as any}
              value={STATUS_FILTER_OPTIONS.find((opt) => opt.value === statusFilter) as any}
              onChange={(opt: any) => {
                if (opt) setStatusFilter(opt.value);
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
              setSearchQuery('');
              setStatusFilter('all');
              fetchUsers();
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
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <DataTableComponent
            columns={columns}
            data={slicedUsers}
            pagination={pagination}
            setPagination={setPagination}
            totalRows={filteredUsers.length}
          />
        )}
      </div>
    </div>
  );
}
