'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';
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

interface AppModule {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
  icon: string | null;
  route: string | null;
  sort_order: number;
}

const moduleFields = [
  {
    name: 'name',
    label: 'Module Key',
    type: 'text',
    required: true,
  },
  {
    name: 'display_name',
    label: 'Display Name',
    type: 'text',
    required: true,
  },
  {
    name: 'route',
    label: 'Route Path',
    type: 'text',
    required: false,
  },
  {
    name: 'sort_order',
    label: 'Sort Order',
    type: 'number',
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
  name: Yup.string().required('Module key is required'),
  display_name: Yup.string().required('Display name is required'),
  sort_order: Yup.number().required('Sort order is required').min(0),
});

export default function ModulesCRUDPage() {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const [modules, setModules] = useState<AppModule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | boolean>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<AppModule | null>(null);

  // Local client-side pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/modules');
      setModules(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleOpenCreate = () => {
    setEditingModule(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (mod: AppModule) => {
    setEditingModule(mod);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const payload = {
        ...values,
        sort_order: Number(values.sort_order),
      };

      if (editingModule) {
        await apiClient.patch(`/modules/${editingModule.id}`, payload);
        toast.success('Module updated successfully');
      } else {
        await apiClient.post('/modules', payload);
        toast.success('Module created successfully');
      }
      setModalOpen(false);
      fetchModules();
      dispatch(checkAuthStart());
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Delete App Module?',
      message: 'Are you sure you want to delete this module? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await apiClient.delete(`/modules/${id}`);
      toast.success('Module deleted successfully');
      fetchModules();
      dispatch(checkAuthStart());
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete module');
    }
  };

  // Columns definition for DataTableComponent
  const columns = React.useMemo<ColumnDef<AppModule>[]>(
    () => [
      {
        header: 'Module Key / Path',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-gray-900 dark:text-white">{row.original.name}</div>
            <div className="text-xs text-custom-muted">{row.original.route || 'No Route'}</div>
          </div>
        ),
      },
      {
        header: 'Display Name',
        accessorKey: 'display_name',
        cell: ({ getValue }) => <span className="font-semibold text-gray-700 dark:text-gray-300">{getValue() as string}</span>,
      },
      {
        header: 'Sort Order',
        accessorKey: 'sort_order',
        cell: ({ getValue }) => <span className="text-sm">{getValue() as number}</span>,
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ row }) => (
          <CustomSwitch
            name={`mod-status-${row.original.id}`}
            checked={row.original.is_active}
            onChange={async (e) => {
              const newVal = e.target.checked;
              try {
                await apiClient.patch(`/modules/${row.original.id}`, {
                  is_active: newVal,
                });
                toast.success('Module status updated successfully');
                fetchModules();
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
              onClick={() => handleOpenEdit(row.original)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition inline-flex items-center"
              aria-label="Edit Module"
              title="Edit"
            >
              <FiEdit2 className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="custom"
              onClick={() => handleDelete(row.original.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition inline-flex items-center"
              aria-label="Delete Module"
              title="Delete"
            >
              <FiTrash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        ),
      },
    ],
    [modules]
  );

  // Client-side filtering
  const filteredModules = React.useMemo(() => {
    return modules.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.display_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ? true : m.is_active === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [modules, searchQuery, statusFilter]);

  // Client-side pagination slicing
  const slicedModules = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredModules.slice(start, end);
  }, [filteredModules, pagination]);

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
              fetchModules();
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
            data={slicedModules}
            pagination={pagination}
            setPagination={setPagination}
            totalRows={filteredModules.length}
          />
        )}
      </div>

      {/* Modal Dialog using GenericModal & RenderFields */}
      <GenericModal
        showModal={modalOpen}
        closeModal={() => setModalOpen(false)}
        modalTitle={editingModule ? 'Update App Module' : 'Create App Module'}
        modalBody={
          <Formik
            initialValues={{
              name: editingModule ? editingModule.name : '',
              display_name: editingModule ? editingModule.display_name : '',
              route: (editingModule && editingModule.route) ? editingModule.route : '',
              sort_order: editingModule ? editingModule.sort_order : 0,
              is_active: editingModule ? editingModule.is_active : true,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleBlur, setFieldValue, isSubmitting }) => (
              <Form className="space-y-4">
                <RenderFields
                  fields={moduleFields}
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
