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
  const [modules, setModules] = useState<AppModule[]>([]);
  const [loading, setLoading] = useState(true);
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;
    try {
      await apiClient.delete(`/modules/${id}`);
      toast.success('Module deleted successfully');
      fetchModules();
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
              aria-label="Edit Module"
            >
              <FiEdit2 className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              variant="custom"
              onClick={() => handleDelete(row.original.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition inline-flex items-center"
              aria-label="Delete Module"
            >
              <FiTrash2 className="w-4 h-4" />
            </LoadingButton>
          </div>
        ),
      },
    ],
    [modules]
  );

  // Client-side pagination slicing
  const slicedModules = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return modules.slice(start, end);
  }, [modules, pagination]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">App Modules</h1>
          <p className="mt-1 text-sm text-custom-muted">Manage system modules, sidebar menus, and icons</p>
        </div>
        <LoadingButton
          onClick={handleOpenCreate}
          variant="custom"
          className="flex items-center space-x-2 px-4 py-2.5 bg-custom-primary hover:bg-custom-primary-hover text-white rounded-xl font-bold shadow-md transition"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Module</span>
        </LoadingButton>
      </div>

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
          totalRows={modules.length}
        />
      )}

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
