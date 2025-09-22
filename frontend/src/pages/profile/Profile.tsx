import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const Profile: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Name</h3>
                <p className="text-gray-600 dark:text-gray-300">Loading...</p>
              </div>
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-gray-600 dark:text-gray-300">Loading...</p>
              </div>
              <div>
                <h3 className="font-medium">Role</h3>
                <p className="text-gray-600 dark:text-gray-300">Loading...</p>
              </div>
              <div>
                <h3 className="font-medium">Member Since</h3>
                <p className="text-gray-600 dark:text-gray-300">Loading...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
