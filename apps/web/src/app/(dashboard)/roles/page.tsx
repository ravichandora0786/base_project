'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FiPlus, FiEdit2, FiTrash2, FiLock, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import RenderFields from '@/components/ui/renderFields';
import LoadingButton from '@/components/ui/loadingButton';
import DataTableComponent from '@/components/ui/dataTableComponent';
import GenericModal from '@/components/ui/genericModal';
import SelectDropDown from '@/components/ui/selectDropDown';
import { ColumnDef } from '@tanstack/react-table';
import CustomSwitch from '@/components/ui/customSwitch';
import { useAppDispatch } from '@/store';
import { checkAuthStart } from '@/features/auth/store/auth.slice';
import { STATUS_FILTER_OPTIONS } from '@/lib/constants';
import { useConfirm } from '@/components/ui/confirmationModal';

interface Role {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const roleFields = [
  {
    name: 'name',
    label: 'Role Name',
    type: 'text',
    required: true,
  },
  {
    name: 'is_active',
    label: 'Status Active',
    type: 'toggle',
    required: false,
  },
];

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Role name is required'),
});

export default function RolesCRUDPage() {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | boolean>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Local client-side pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/roles');
      setRoles(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if (editingRole) {
        await apiClient.patch(`/roles/${editingRole.id}`, values);
        toast.success('Role updated successfully');
      } else {
        await apiClient.post('/roles', values);
        toast.success('Role created successfully');
      }
      setModalOpen(false);
      fetchRoles();
      dispatch(checkAuthStart());
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Delete System Role?',
      message: 'Are you sure you want to delete this role? Users assigned to this role will lose access. This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await apiClient.delete(`/roles/${id}`);
      toast.success('Role deleted successfully');
      fetchRoles();
      dispatch(checkAuthStart());
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    }
  };

  // Columns definition for DataTableComponent
  const columns = React.useMemo<ColumnDef<Role>[]>(
    () => [
      {
        header: 'Role Name',
        accessorKey: 'name',
        cell: ({ getValue }) => <span className="capitalize font-bold">{getValue() as string}</span>,
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ row }) => (
          <CustomSwitch
            name={`role-status-${row.original.id}`}
            checked={row.original.is_active}
            onChange={async (e) => {
              const newVal = e.target.checked;
              try {
                await apiClient.patch(`/roles/${row.original.id}`, {
                  is_active: newVal,
                });
                toast.success('Role status updated successfully');
                fetchRoles();
                dispatch(checkAuthStart());
              } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to update status');
              }
            }}
          />
        ),
      },
      {
        header: () => <div className="text-right">Actions</div>,
        id: 'actions',
        cell: ({ row }) => (
          <div className="text-right space-x-2">
            <LoadingButton
              variant="custom"
              onClick={() => router.push(`/roles/${row.original.id}/permissions`)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition inline-flex items-center"
              aria-label="Edit Role Permissions"
              title="Permissions"
            >
              <FiLock className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="custom"
              onClick={() => handleOpenEdit(row.original)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition inline-flex items-center"
              aria-label="Edit Role"
              title="Edit"
            >
              <FiEdit2 className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="custom"
              onClick={() => handleDelete(row.original.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition inline-flex items-center"
              aria-label="Delete Role"
              title="Delete"
            >
              <FiTrash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        ),
      },
    ],
    [roles]
  );

  // Client-side filtering
  const filteredRoles = React.useMemo(() => {
    return roles.filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true : r.is_active === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [roles, searchQuery, statusFilter]);

  // Client-side pagination slicing
  const slicedRoles = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredRoles.slice(start, end);
  }, [filteredRoles, pagination]);

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
              fetchRoles();
            }}
            className="p-2.5 border border-custom rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition"
            title="Refresh Data"
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
            data={slicedRoles}
            pagination={pagination}
            setPagination={setPagination}
            totalRows={filteredRoles.length}
          />
        )}
      </div>

      {/* Modal Dialog using GenericModal & RenderFields */}
      <GenericModal
        showModal={modalOpen}
        closeModal={() => setModalOpen(false)}
        modalTitle={editingRole ? 'Update Role' : 'Create Role'}
        modalBody={
          <Formik
            initialValues={{
              name: editingRole ? editingRole.name : '',
              is_active: editingRole ? editingRole.is_active : true,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleBlur, setFieldValue, isSubmitting }) => (
              <Form className="space-y-4">
                <RenderFields
                  fields={roleFields}
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  handleBlur={handleBlur}
                  columns={1}
                />

                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                  <LoadingButton
                    type="button"
                    variant="secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </LoadingButton>
                  <LoadingButton
                    type="submit"
                    isLoading={isSubmitting}
                    variant="primary"
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
