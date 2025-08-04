import { createSlice, createSelector } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null,
};

// Create the cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initializeCart: (state, action) => {
      const { userId } = action.payload;
      if (userId) {
        const savedCart = localStorage.getItem(`cart_${userId}`);
        if (savedCart) {
          try {
            state.items = JSON.parse(savedCart);
          } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            state.items = [];
          }
        }
      } else {
        state.items = [];
      }
    },
    addToCart: (state, action) => {
      const { course, userId } = action.payload;
      
      // Check if course is already in cart
      const existingItem = state.items.find(item => item._id === course._id);
      if (existingItem) {
        return; // Don't add duplicate items
      }

      const cartItem = {
        _id: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        imageUrl: course.imageUrl,
        category: course.category,
        level: course.level,
        duration: course.duration,
        creatorId: course.creatorId,
        addedAt: new Date().toISOString(),
      };

      state.items.push(cartItem);
      
      // Save to localStorage
      if (userId) {
        localStorage.setItem(`cart_${userId}`, JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action) => {
      const { courseId, userId } = action.payload;
      state.items = state.items.filter(item => item._id !== courseId);
      
      // Save to localStorage
      if (userId) {
        localStorage.setItem(`cart_${userId}`, JSON.stringify(state.items));
      }
    },
    clearCart: (state, action) => {
      const { userId } = action.payload;
      state.items = [];
      
      // Clear from localStorage
      if (userId) {
        localStorage.removeItem(`cart_${userId}`);
      }
    },
    setCartLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCartError: (state, action) => {
      state.error = action.payload;
    },
    clearCartError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  initializeCart,
  addToCart,
  removeFromCart,
  clearCart,
  setCartLoading,
  setCartError,
  clearCartError,
} = cartSlice.actions;

// Export selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

// Computed selectors
export const selectCartCount = (state) => state.cart.items.length;
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => total + (item.price || 0), 0);

export const selectIsInCart = (courseId) => (state) =>
  state.cart.items.some(item => item._id === courseId);

export const selectCartSummary = createSelector(
  [selectCartItems],
  (items) => {
    const subtotal = items.reduce((total, item) => total + (item.price || 0), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      itemCount: items.length,
      items,
    };
  }
);

// Export reducer
export default cartSlice.reducer;
