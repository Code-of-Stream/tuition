import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button } from '@/components/ui';

const AssignmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // This is a placeholder for assignment data that would normally come from an API
  const assignment = {
    id,
    title: 'Assignment Title',
    description: 'This is a detailed description of the assignment.',
    dueDate: '2023-12-31',
    status: 'Pending',
    // Add more fields as needed
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4">Assignment Details</Typography>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="text-sm"
          >
            Back to Assignments
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Typography variant="h5" className="font-medium">
              {assignment.title}
            </Typography>
            <Typography variant="muted" className="text-sm">
              Assignment ID: {assignment.id}
            </Typography>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Typography variant="p" className="whitespace-pre-line">
              {assignment.description}
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <Typography variant="small" className="text-gray-500 dark:text-gray-400">
                Due Date
              </Typography>
              <Typography variant="p">{assignment.dueDate}</Typography>
            </div>
            <div>
              <Typography variant="small" className="text-gray-500 dark:text-gray-400">
                Status
              </Typography>
              <span className={`px-2 py-1 text-xs rounded-full ${
                assignment.status === 'Completed' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {assignment.status}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
            <Button>Submit Work</Button>
            <Button variant="outline">Download Files</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;
