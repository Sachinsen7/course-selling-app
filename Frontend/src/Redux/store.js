import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';

// Import reducers
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import cartReducer from './slices/cartSlice';
import uiReducer from './slices/uiSlice';

// Root reducer combining all feature slices
const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  cart: cartReducer,
  ui: uiReducer,
});

// Middleware for localStorage persistence
const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Save specific state to localStorage
  const state = store.getState();
  
  // Persist theme preference
  if (state.theme) {
    localStorage.setItem('theme', JSON.stringify(state.theme));
  }
  
  // Persist auth token
  if (state.auth?.token) {
    localStorage.setItem('token', state.auth.token);
  } else if (action.type === 'auth/logout') {
    localStorage.removeItem('token');
  }
  
  return result;
};

// Load persisted state from localStorage
const loadPersistedState = () => {
  try {
    const persistedTheme = localStorage.getItem('theme');
    const persistedToken = localStorage.getItem('token');

    const preloadedState = {};

    // Load theme state
    if (persistedTheme) {
      try {
        preloadedState.theme = JSON.parse(persistedTheme);
      } catch (error) {
        // Handle legacy theme storage (just a string)
        if (persistedTheme === 'dark' || persistedTheme === 'light') {
          preloadedState.theme = { mode: persistedTheme };
        }
      }
    }

    // Load auth token (user data will be loaded via initializeAuth action)
    if (persistedToken) {
      preloadedState.auth = {
        token: persistedToken,
        isAuthenticated: false,
        loading: true,
        user: null,
        error: null,
        modal: { isOpen: false, title: '', message: '', type: 'info' }
      };
    }

    return preloadedState;
  } catch (error) {
    console.error('Error loading persisted state:', error);
    return {};
  }
};

// Configure the Redux store
export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadPersistedState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(localStorageMiddleware),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

// Export types for TypeScript (if needed later)
export const RootState = store.getState;
export const AppDispatch = store.dispatch;
