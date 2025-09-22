import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMaterials } from '@/lib/api/materials';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

const Materials: React.FC = () => {
  const { data: materials, isLoading, error } = useQuery({
    queryKey: ['materials'],
    queryFn: getMaterials,
  });

  if (isLoading) return <div>Loading materials...</div>;
  if (error) return <div>Error loading materials: {error.message}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Study Materials</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Material
        </Button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        {materials && materials.length > 0 ? (
          <div className="space-y-4">
            {materials.map((material) => (
              <div key={material.id} className="border-b pb-4 last:border-0">
                <h3 className="font-medium">{material.title}</h3>
                <p className="text-sm text-gray-500">{material.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <span>Uploaded: {new Date(material.uploadDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No materials available yet.</p>
        )}
      </div>
    </div>
  );
};

export default Materials;
