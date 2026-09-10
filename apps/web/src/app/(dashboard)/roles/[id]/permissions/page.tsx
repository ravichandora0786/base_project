import React from 'react';
import RolePermissionsClient from './RolePermissionsClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function EditRolePermissionsPage() {
  return <RolePermissionsClient />;
}
