'use client';

import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import RenderFields from '@/components/ui/renderFields';
import LoadingButton from '@/components/ui/loadingButton';
import DataTableComponent from '@/components/ui/dataTableComponent';
import GenericModal from '@/components/ui/genericModal';
import TableToolbar from '@/components/common/TableToolbar';
import TableRowActions from '@/components/common/TableRowActions';
import { ColumnDef } from '@tanstack/react-table';
import CustomSwitch from '@/components/ui/customSwitch';
import { useAppDispatch, useAppSelector } from '@/store';
import { checkAuthStart } from '@/features/auth/store/auth.slice';
import { useConfirm } from '@/components/ui/confirmationModal';
import { AppModule } from '@/types/models';

// Redux Imports
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

const validationSchema = Yup.object().shape({
  display_name: Yup.string()
    .matches(/^[A-Za-z\s]+$/, 'Display name can only contain alphabets and spaces')
    .required('Display name is required'),
  name: Yup.string().required('Module key is required'),
  sort_order: Yup.number().required('Sort order is required'),
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

  const modulesArray: AppModule[] = React.useMemo(() => {
    if (Array.isArray(modulesData)) return modulesData;
    if (Array.isArray(modulesData?.data)) return modulesData.data;
    if (Array.isArray(modulesData?.items)) return modulesData.items;
    return [];
  }, [modulesData]);

  const totalRows: number = React.useMemo(() => {
    if (typeof modulesData?.total === 'number') return modulesData.total;
    if (typeof modulesData?.pagination?.totalItems === 'number') return modulesData.pagination.totalItems;
    return modulesArray.length;
  }, [modulesData, modulesArray]);

  const nextSortOrder = React.useMemo(() => {
    if (!modulesArray.length) return 0;
    const maxOrder = Math.max(
      ...modulesArray.map((m) => (typeof m.sort_order === 'number' ? m.sort_order : -1))
    );
    return maxOrder >= 0 ? maxOrder + 1 : 0;
  }, [modulesArray]);

  const moduleFields = React.useMemo(
    () => [
      {
        name: 'display_name',
        label: 'Display Name',
        type: 'text',
        required: true,
        placeholder: 'Enter Display Name',
        onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (
            ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'].includes(e.key) ||
            e.ctrlKey ||
            e.metaKey
          ) {
            return;
          }
          if (!/^[a-zA-Z\s]$/.test(e.key)) {
            e.preventDefault();
          }
        },
        onChange: (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any, values: any) => {
          const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
          setFieldValue('display_name', lettersOnly);
          const autoKey = lettersOnly
            .toLowerCase()
            .trim()
            .replace(/[^a-z\s_]/g, '')
            .replace(/\s+/g, '_');
          setFieldValue('name', autoKey);
          if (!editingModule && (!values.route || values.route === `/${values.name?.replace(/_/g, '-')}`)) {
            setFieldValue('route', autoKey ? `/${autoKey.replace(/_/g, '-')}` : '');
          }
        },
      },
      {
        name: 'name',
        label: 'Module Key',
        type: 'text',
        required: true,
        disabled: true,
        placeholder: 'Generated automatically from Display Name',
      },
      {
        name: 'route',
        label: 'Route Path',
        type: 'text',
        required: false,
        placeholder: 'e.g. /dashboard',
      },
      {
        name: 'sort_order',
        label: 'Sort Order',
        type: 'number',
        required: true,
        disabled: true,
        placeholder: 'Auto-assigned',
      },
      {
        name: 'is_active',
        label: 'Status Active',
        type: 'toggle',
        required: false,
      },
    ],
    [editingModule]
  );

  const fetchModules = React.useCallback(
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

      dispatch(getAllModules({ data: params }));
    },
    [dispatch, searchQuery, statusFilter]
  );

  const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchModules(1, 10, '', 'all');

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      dispatch(setModuleSearchData({ search: '', status: 'all' }));
      dispatch(setModulePagination({ pageIndex: 0, pageSize: 10 }));
    };
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
      const cleanDisplayName = values.display_name.trim().replace(/[^a-zA-Z\s]/g, '');
      const autoKey = (values.name || cleanDisplayName)
        .toLowerCase()
        .trim()
        .replace(/[^a-z\s_]/g, '')
        .replace(/\s+/g, '_');

      const payload = {
        name: autoKey,
        display_name: cleanDisplayName,
        route: values.route?.trim() || `/${autoKey.replace(/_/g, '-')}`,
        sort_order: Number(values.sort_order ?? nextSortOrder),
        is_active: values.is_active,
      };

      if (editingModule) {
        dispatch(
          updateModule({
            id: editingModule.id,
            data: payload,
            onSuccess: () => {
              toast.success('Module updated successfully');
              dispatch(setModalOpen(false));
              fetchModules(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
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
              fetchModules(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
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

  const handleDelete = async (mod: AppModule) => {
    const isSystemModule = ['dashboard', 'user', 'role', 'permission', 'module'].includes(
      mod.name.toLowerCase()
    );
    if (isSystemModule) {
      toast.error('System modules cannot be deleted');
      return;
    }

    const isConfirmed = await confirm({
      title: 'Delete App Module?',
      message: `Are you sure you want to delete module '${mod.display_name || mod.name}'? All assigned role permissions for this module will also be permanently deleted.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!isConfirmed) return;

    dispatch(
      deleteModule({
        id: mod.id,
        onSuccess: () => {
          toast.success('Module and associated permissions deleted successfully');
          fetchModules(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
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
        cell: ({ getValue }) => <span>{getValue() as string}</span>,
      },
      {
        header: 'Sort Order',
        accessorKey: 'sort_order',
        cell: ({ getValue }) => <span className="font-semibold">{getValue() as number}</span>,
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ row }) => (
          <CustomSwitch
            name={`status-${row.original.id}`}
            checked={row.original.is_active}
            onChange={(e) => {
              const newVal = e.target.checked;
              dispatch(
                updateModule({
                  id: row.original.id,
                  data: { is_active: newVal },
                  onSuccess: () => {
                    toast.success('Module status updated');
                    fetchModules(pagination?.pageIndex ? pagination.pageIndex + 1 : 1, pagination?.pageSize || 10, searchQuery, statusFilter);
                    dispatch(checkAuthStart());
                  },
                  onFailure: (err: any) => {
                    toast.error(err.message || 'Status update failed');
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
        cell: ({ row }) => {
          const isSystemModule = ['dashboard', 'user', 'role', 'permission', 'module'].includes(
            row.original.name.toLowerCase()
          );
          return (
            <TableRowActions
              onEdit={() => handleOpenEdit(row.original)}
              onDelete={isSystemModule ? undefined : () => handleDelete(row.original)}
              editTitle="Edit Module"
              deleteTitle={isSystemModule ? undefined : 'Delete Module'}
            />
          );
        },
      },
    ],
    [dispatch, fetchModules, pagination, searchQuery, statusFilter]
  );

  const handleSearchChange = (val: string) => {
    dispatch(setModuleSearchData({ search: val, status: statusFilter }));
    const newPagination = { ...pagination, pageIndex: 0 };
    dispatch(setModulePagination(newPagination));
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchModules(1, pagination?.pageSize || 10, val, statusFilter);
    }, 300);
  };

  const handleStatusChange = (val: any) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    dispatch(setModuleSearchData({ search: searchQuery, status: val }));
    const newPagination = { ...pagination, pageIndex: 0 };
    dispatch(setModulePagination(newPagination));
    fetchModules(1, pagination?.pageSize || 10, searchQuery, val);
  };

  const handleRefresh = () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    dispatch(setModuleSearchData({ search: '', status: 'all' }));
    const newPagination = { pageIndex: 0, pageSize: 10 };
    dispatch(setModulePagination(newPagination));
    fetchModules(1, 10, '', 'all');
  };

  return (
    <div className="space-y-4 flex-1 flex flex-col min-h-0">
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onRefresh={handleRefresh}
        onCreate={handleOpenCreate}
        createTooltip="Create Module"
      />

      <div className="flex-1 flex flex-col min-h-0">
        <DataTableComponent
          columns={columns}
          data={modulesArray}
          pagination={pagination}
          setPagination={(newPagination: any) => {
            const nextPag = typeof newPagination === 'function' ? newPagination(pagination) : newPagination;
            dispatch(setModulePagination(nextPag));
            fetchModules(nextPag.pageIndex + 1, nextPag.pageSize, searchQuery, statusFilter);
          }}
          totalRows={totalRows}
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
              sort_order: editingModule ? (editingModule.sort_order ?? 0) : nextSortOrder,
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
