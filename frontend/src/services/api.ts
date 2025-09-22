import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
  credentials: 'include',
});

// Define a base query with re-authentication logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // If 401 Unauthorized, try to refresh token
  if (result.error?.status === 401) {
    // Add your refresh token logic here if needed
    // For now, we'll just log out the user
    api.dispatch({ type: 'auth/logout' });
    window.location.href = '/login';
  }
  
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Batch',
    'Attendance',
    'Assignment',
    'Submission',
    'Material',
    'Payment',
  ],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<{ user: any; token: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<{ user: any; token: string }, any>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: (data) => ({
        url: '/auth/forgotpassword',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation<void, { token: string; password: string }>({
      query: ({ token, ...data }) => ({
        url: `/auth/resetpassword/${token}`,
        method: 'PUT',
        body: data,
      }),
    }),
    
    // User endpoints
    getMe: builder.query<any, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<any, any>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updatePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: (data) => ({
        url: '/users/updatepassword',
        method: 'PUT',
        body: data,
      }),
    }),
    
    // Batch endpoints
    getBatches: builder.query<any[], void>({
      query: () => '/batches',
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: 'Batch' as const, id: _id })), 'Batch']
          : ['Batch'],
    }),
    getBatch: builder.query<any, string>({
      query: (id) => `/batches/${id}`,
      providesTags: (result, error, id) => [{ type: 'Batch', id }],
    }),
    createBatch: builder.mutation<any, any>({
      query: (data) => ({
        url: '/batches',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Batch'],
    }),
    updateBatch: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/batches/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Batch', id }],
    }),
    deleteBatch: builder.mutation<void, string>({
      query: (id) => ({
        url: `/batches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Batch'],
    }),
    
    // Add more endpoints as needed...
  }),
});

export const {
  // Auth
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  
  // User
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  
  // Batch
  useGetBatchesQuery,
  useGetBatchQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
} = api;
