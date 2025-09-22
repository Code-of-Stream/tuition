import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { getBatchById } from '@/services/batchService';

export const BatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: batch, isLoading, isError } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => getBatchById(id || ''),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !batch) {
    return (
      <div className="p-4 text-red-600">
        Error loading batch details. The batch may not exist or you may not have permission to view it.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{batch.name}</h1>
          <p className="text-muted-foreground">{batch.course}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to="/batches">Back to Batches</Link>
          </Button>
          <Button asChild>
            <Link to={`/batches/${id}/edit`}>Edit Batch</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Batch Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batch ID:</span>
                    <span>{batch.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Course:</span>
                    <span>{batch.course}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{formatDate(batch.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span>{formatDate(batch.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      batch.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {batch.status}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Class Schedule</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days:</span>
                    <span>{batch.schedule?.days?.join(', ') || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span>
                      {batch.schedule?.startTime} - {batch.schedule?.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{batch.location || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">
                {batch.description || 'No description available.'}
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Students in this Batch</h3>
              <Button size="sm" asChild>
                <Link to={`/batches/${id}/add-students`}>Add Students</Link>
              </Button>
            </div>
            {batch.students && batch.students.length > 0 ? (
              <div className="border rounded-md">
                <div className="grid grid-cols-12 bg-gray-50 p-3 font-medium text-sm text-gray-500">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-3">Phone</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                {batch.students.map((student) => (
                  <div key={student.id} className="grid grid-cols-12 p-3 border-t items-center">
                    <div className="col-span-4 font-medium">{student.name}</div>
                    <div className="col-span-3 text-sm text-muted-foreground">{student.email}</div>
                    <div className="col-span-3 text-sm text-muted-foreground">{student.phone || '-'}</div>
                    <div className="col-span-2 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/students/${student.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No students have been added to this batch yet.
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Class Schedule</h3>
            <p>Schedule content will be displayed here.</p>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Attendance</h3>
            <p>Attendance records will be displayed here.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BatchDetails;
