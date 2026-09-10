import React from 'react';
import UserDetailsClient from './UserDetailsClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function UserDetailsPage() {
  return <UserDetailsClient />;
}
