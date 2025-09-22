import api from '@/lib/api';

export interface Batch {
  id: string;
  name: string;
  course: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive' | 'Completed' | 'Upcoming';
  location?: string;
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  studentCount: number;
  students?: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
  }>;
}

export const getBatches = async (): Promise<Batch[]> => {
  try {
    const response = await api.get('/api/batches');
    return response.data;
  } catch (error) {
    console.error('Error fetching batches:', error);
    throw error;
  }
};

export const getBatchById = async (id: string): Promise<Batch> => {
  try {
    const response = await api.get(`/api/batches/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching batch ${id}:`, error);
    throw error;
  }
};

export const createBatch = async (batchData: Omit<Batch, 'id' | 'studentCount'>): Promise<Batch> => {
  try {
    const response = await api.post('/api/batches', batchData);
    return response.data;
  } catch (error) {
    console.error('Error creating batch:', error);
    throw error;
  }
};

export const updateBatch = async (id: string, batchData: Partial<Batch>): Promise<Batch> => {
  try {
    const response = await api.put(`/api/batches/${id}`, batchData);
    return response.data;
  } catch (error) {
    console.error(`Error updating batch ${id}:`, error);
    throw error;
  }
};

export const deleteBatch = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/batches/${id}`);
  } catch (error) {
    console.error(`Error deleting batch ${id}:`, error);
    throw error;
  }
};

export const addStudentsToBatch = async (batchId: string, studentIds: string[]): Promise<void> => {
  try {
    await api.post(`/api/batches/${batchId}/students`, { studentIds });
  } catch (error) {
    console.error(`Error adding students to batch ${batchId}:`, error);
    throw error;
  }
};

export const removeStudentFromBatch = async (batchId: string, studentId: string): Promise<void> => {
  try {
    await api.delete(`/api/batches/${batchId}/students/${studentId}`);
  } catch (error) {
    console.error(`Error removing student ${studentId} from batch ${batchId}:`, error);
    throw error;
  }
};
