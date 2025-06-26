import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentProfileForm from '../components/auth/StudentProfileForm';
import CompanyProfileForm from '../components/auth/CompanyProfileForm';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Manage Your Profile</h1>
      <div className="mt-4">
        {user?.role === 'STUDENT' && <StudentProfileForm />}
        {user?.role === 'COMPANY' && <CompanyProfileForm />}
      </div>
    </div>
  );
};

export default ProfilePage; 