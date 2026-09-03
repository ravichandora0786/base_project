'use client';

import React, { useEffect } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/store';
import { checkAuthStart } from '@/features/auth/store/auth.slice';
import { STATUS_FILTER_OPTIONS } from '@/lib/constants';
import { useConfirm } from '@/components/ui/confirmationModal';
import { apiClient } from '@/lib/api/client';

// Redux Imports
import { selectGlobalLoading } from '@/store/common/selector';
import {
  selectAllModuleDataList,
  selectModulePagination,
  selectModuleSearchData,
  selectModuleModalOpen,
  selectEditingModule,
} from './store/selector';
import {
  getAllModules,
  setModulePagination,
  setModuleSearchData,
  setModalOpen,
  setEditingModule,
  createModule,
  updateModule,
  deleteModule,
} from './store/slice';

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

  // Redux Selectors
  const modulesData = useAppSelector(selectAllModuleDataList);
  const pagination = useAppSelector(selectModulePagination);
  const { search: searchQuery, status: statusFilter } = useAppSelector(selectModuleSearchData);
  const modalOpen = useAppSelector(selectModuleModalOpen);
  const editingModule = useAppSelector(selectEditingModule);

  useEffect(() => {
    dispatch(getAllModules({}));
  }, [dispatch]);

  const handleOpenCreate = () => {
    dispatch(setEditingModule(null));
    dispatch(setModalOpen(true));
  };

  const handleOpenEdit = (mod: AppModule) => {
    dispatch(setEditingModule(mod));
    dispatch(setModalOpen(true));
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const payload = {
        ...values,
        sort_order: Number(values.sort_order),
      };

      if (editingModule) {
        dispatch(
          updateModule({
            id: editingModule.id,
            data: payload,
            onSuccess: () => {
              toast.success('Module updated successfully');
              dispatch(setModalOpen(false));
              dispatch(getAllModules({}));
              dispatch(checkAuthStart());
            },
            onFailure: (err: any) => {
              toast.error(err.message || 'Update failed');
            },
          })
        );
      } else {
        dispatch(
          createModule({
            data: payload,
            onSuccess: () => {
              toast.success('Module created successfully');
              dispatch(setModalOpen(false));
              dispatch(getAllModules({}));
              dispatch(checkAuthStart());
            },
            onFailure: (err: any) => {
              toast.error(err.message || 'Creation failed');
            },
          })
        );
      }
    } catch (error: any) {
      toast.error('Action failed');
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

    dispatch(
      deleteModule({
        id,
        onSuccess: () => {
          toast.success('Module deleted successfully');
          dispatch(getAllModules({}));
          dispatch(checkAuthStart());
        },
        onFailure: (err: any) => {
          toast.error(err.message || 'Failed to delete module');
        },
      })
    );
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
            onChange={(e) => {
              const newVal = e.target.checked;
              dispatch(
                updateModule({
                  id: row.original.id,
                  data: { ...row.original, is_active: newVal },
                  onSuccess: () => {
                    toast.success('Module status updated successfully');
                    dispatch(getAllModules({}));
                    dispatch(checkAuthStart());
                  },
                  onFailure: (err: any) => {
                    toast.error(err.message || 'Failed to update status');
                  },
                })
              );
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
    [dispatch]
  );

  // Fetch modules with server-side filtering
  const fetchWithFilters = (search: string, status: any) => {
    const params: any = {};
    if (search) params.search = search;
    if (status !== 'all') params.is_active = status;
    dispatch(getAllModules({ data: params }));
  };

  // Client-side pagination slicing (data already filtered by server)
  const modulesArray: AppModule[] = Array.isArray(modulesData) ? modulesData : [];

  const slicedModules = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return modulesArray.slice(start, end);
  }, [modulesArray, pagination]);

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
              onChange={(e) => {
                const val = e.target.value;
                dispatch(setModuleSearchData({ search: val, status: statusFilter }));
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
                  dispatch(setModuleSearchData({ search: searchQuery, status: opt.value }));
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
              dispatch(setModuleSearchData({ search: '', status: 'all' }));
              dispatch(getAllModules({}));
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
        <DataTableComponent
          columns={columns}
          data={slicedModules}
          pagination={pagination}
          setPagination={(newPag: any) => dispatch(setModulePagination(newPag))}
          totalRows={modulesArray.length}
        />
      </div>

      {/* Modal Dialog using GenericModal & RenderFields */}
      <GenericModal
        showModal={modalOpen}
        closeModal={() => dispatch(setModalOpen(false))}
        modalTitle={editingModule ? 'Update Module' : 'Create Module'}
        modalBody={
          <Formik
            initialValues={{
              name: editingModule ? editingModule.name : '',
              display_name: editingModule ? editingModule.display_name : '',
              route: editingModule ? (editingModule.route || '') : '',
              sort_order: editingModule ? editingModule.sort_order : 0,
              is_active: editingModule ? editingModule.is_active : true,
            }}
            validationSchema={validationSchema}
            enableReinitialize={true}
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
                  columns={2}
                />

                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                  <LoadingButton
                    type="button"
                    variant="secondary"
                    onClick={() => dispatch(setModalOpen(false))}
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
