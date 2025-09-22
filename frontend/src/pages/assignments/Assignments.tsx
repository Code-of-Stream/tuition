import React from 'react';
import { Typography } from '@/components/ui';

const Assignments: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <Typography variant="h4" className="mb-6">
          Assignments
        </Typography>
        <div className="text-gray-600 dark:text-gray-300">
          <p>Assignments management feature will be implemented here.</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This is a placeholder component. You can build your assignments management interface here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Assignments;
