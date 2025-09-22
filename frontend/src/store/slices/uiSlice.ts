import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  modal: {
    isOpen: boolean;
    content: React.ReactNode | null;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    onClose?: () => void;
  };
  toast: {
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
  loading: boolean;
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme as 'light' | 'dark';
    
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return 'light';
};

const initialState: UIState = {
  theme: getInitialTheme(),
  sidebarOpen: false,
  modal: {
    isOpen: false,
    content: null,
    size: 'md',
  },
  toast: {
    isOpen: false,
    message: '',
    type: 'info',
  },
  loading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      document.documentElement.classList.toggle('dark', action.payload === 'dark');
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openModal: (state, action: PayloadAction<{
      content: React.ReactNode;
      title?: string;
      size?: 'sm' | 'md' | 'lg' | 'xl';
      onClose?: () => void;
    }>) => {
      state.modal = {
        isOpen: true,
        content: action.payload.content,
        title: action.payload.title,
        size: action.payload.size || 'md',
        onClose: action.payload.onClose,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        content: null,
        size: 'md',
      };
    },
    showToast: (state, action: PayloadAction<{
      message: string;
      type?: 'success' | 'error' | 'info' | 'warning';
    }>) => {
      state.toast = {
        isOpen: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
      };
    },
    hideToast: (state) => {
      state.toast.isOpen = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  openModal,
  closeModal,
  showToast,
  hideToast,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectModal = (state: { ui: UIState }) => state.ui.modal;
export const selectToast = (state: { ui: UIState }) => state.ui.toast;
export const selectIsLoading = (state: { ui: UIState }) => state.ui.loading;
