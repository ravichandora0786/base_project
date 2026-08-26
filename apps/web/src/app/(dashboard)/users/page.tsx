'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import RenderFields from '@/components/ui/renderFields';
import LoadingButton from '@/components/ui/loadingButton';
import DataTableComponent from '@/components/ui/dataTableComponent';
import GenericModal from '@/components/ui/genericModal';
import { ColumnDef } from '@tanstack/react-table';

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
  is_active: boolean;
  role: {
    id: string;
    name: string;
  };
}

export default function UsersCRUDPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if (editingUser) {
        const payload = {
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          gender: values.gender || null,
          role_id: values.role_id,
          is_active: values.is_active,
        };
        await apiClient.patch(`/users/${editingUser.id}`, payload);
        toast.success('User updated successfully');
      } else {
        const selectedRole = roles.find((r) => r.id === values.role_id);
        const payload = {
          name: values.name,
          email: values.email,
          password: values.password,
          role: selectedRole ? selectedRole.name : 'user',
        };
        await apiClient.post('/users', payload);
        toast.success('User created successfully');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiClient.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const roleOptions = roles
    .filter((r) => r.is_active)
    .map((r) => ({
      label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
      value: r.id,
    }));

  const fields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
    },
    ...(!editingUser
      ? [
          {
            name: 'password',
            label: 'Password',
            type: 'password',
            required: true,
          },
        ]
      : []),
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: false,
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      required: false,
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'role_id',
      label: 'User Role',
      type: 'select',
      required: true,
      options: roleOptions,
    },
    {
      name: 'is_active',
      label: 'Status Active',
      type: 'toggle',
      required: false,
    },
  ];

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    role_id: Yup.string().required('Role is required'),
    ...(!editingUser
      ? {
          password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters'),
        }
      : {}),
  });

  // Columns definition for DataTableComponent
  const columns = React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: 'Name / Email',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-gray-900 dark:text-white capitalize">{row.original.name}</div>
            <div className="text-xs text-custom-muted">{row.original.email}</div>
          </div>
        ),
      },
      {
        header: 'Phone / Gender',
        accessorKey: 'phone',
        cell: ({ row }) => (
          <div>
            <div className="text-sm">{row.original.phone || '-'}</div>
            <div className="text-xs text-custom-muted capitalize">{row.original.gender || '-'}</div>
          </div>
        ),
      },
      {
        header: 'Role',
        accessorKey: 'role.name',
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900 rounded-md capitalize">
            {row.original.role?.name || '-'}
          </span>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ getValue }) => {
          const isActive = getValue() as boolean;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
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
              onClick={() => handleOpenEdit(row.original)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition inline-flex items-center"
              aria-label="Edit User"
            >
              <FiEdit2 className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="custom"
              onClick={() => handleDelete(row.original.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition inline-flex items-center"
              aria-label="Delete User"
            >
              <FiTrash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        ),
      },
    ],
    [users]
  );

  // Client-side pagination slicing
  const slicedUsers = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return users.slice(start, end);
  }, [users, pagination]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Users Management</h1>
          <p className="mt-1 text-sm text-custom-muted">Admin dashboard for platform users and assignments</p>
        </div>
        <LoadingButton
          onClick={handleOpenCreate}
          variant="custom"
          className="flex items-center space-x-2 px-4 py-2.5 bg-custom-primary hover:bg-custom-primary-hover text-white rounded-xl font-bold shadow-md transition"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add User</span>
        </LoadingButton>
      </div>

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
          totalRows={users.length}
        />
      )}

      {/* Modal Dialog using GenericModal & RenderFields */}
      <GenericModal
        showModal={modalOpen}
        closeModal={() => setModalOpen(false)}
        modalTitle={editingUser ? 'Update User Details' : 'Create User Account'}
        modalBody={
          <Formik
            initialValues={{
              name: editingUser ? editingUser.name : '',
              email: editingUser ? editingUser.email : '',
              password: '',
              phone: editingUser?.phone ? editingUser.phone : '',
              gender: editingUser?.gender ? editingUser.gender : '',
              role_id: editingUser?.role?.id ? editingUser.role.id : '',
              is_active: editingUser ? editingUser.is_active : true,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleBlur, setFieldValue, isSubmitting }) => (
              <Form className="space-y-4">
                <RenderFields
                  fields={fields}
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  handleBlur={handleBlur}
                  columns={2}
                />

                <div className="flex space-x-3 pt-2">
                  <LoadingButton
                    type="button"
                    variant="secondary"
                    onClick={() => setModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </LoadingButton>
                  <LoadingButton
                    type="submit"
                    isLoading={isSubmitting}
                    variant="primary"
                    className="flex-1"
                  >
                    Save
                  </LoadingButton>
                </div>
              </Form>
            )}
          </Formik>
        }
      />
    </div>
  );
}
