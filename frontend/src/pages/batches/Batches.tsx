import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { getBatches } from '@/services/batchService';

export const Batches: React.FC = () => {
  const { data: batches, isLoading, isError } = useQuery({
    queryKey: ['batches'],
    queryFn: getBatches,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div className="p-4 text-red-600">Error loading batches. Please try again later.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Batches</h1>
        <Button asChild>
          <Link to="/batches/new">Create New Batch</Link>
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches?.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell className="font-medium">
                  <Link to={`/batches/${batch.id}`} className="text-blue-600 hover:underline">
                    {batch.name}
                  </Link>
                </TableCell>
                <TableCell>{batch.course}</TableCell>
                <TableCell>{formatDate(batch.startDate)}</TableCell>
                <TableCell>{formatDate(batch.endDate)}</TableCell>
                <TableCell>{batch.studentCount}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    batch.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {batch.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/batches/${batch.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Batches;
