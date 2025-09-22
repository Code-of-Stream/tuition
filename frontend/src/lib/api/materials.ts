import api from './api';

export interface Material {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  batchId?: string;
  uploadedBy: string;
}

export const getMaterials = async (): Promise<Material[]> => {
  const response = await api.get('/materials');
  return response.data;
};

export const getMaterialById = async (id: string): Promise<Material> => {
  const response = await api.get(`/materials/${id}`);
  return response.data;
};

export const uploadMaterial = async (materialData: FormData): Promise<Material> => {
  const response = await api.post('/materials', materialData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateMaterial = async (id: string, materialData: Partial<Material>): Promise<Material> => {
  const response = await api.put(`/materials/${id}`, materialData);
  return response.data;
};

export const deleteMaterial = async (id: string): Promise<void> => {
  await api.delete(`/materials/${id}`);
};
