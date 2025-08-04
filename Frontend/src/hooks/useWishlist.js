import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated } from '../Redux/slices/authSlice';
import { showModal } from '../Redux/slices/uiSlice';
import { getWishlist, addToWishlist, removeFromWishlist, checkWishlistStatus } from '../services/api';

export const useWishlist = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wishlist data
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getWishlist();
      const wishlistCourses = data.wishlist || [];
      setWishlist(wishlistCourses);
      setWishlistIds(new Set(wishlistCourses.map(course => course._id)));
    } catch (err) {
      setError(err.message || 'Failed to fetch wishlist');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Add course to wishlist
  const addCourseToWishlist = useCallback(async (courseId, courseTitle = 'Course') => {
    if (!isAuthenticated) {
      dispatch(showModal({
        title: 'Login Required',
        message: 'Please log in to add courses to your wishlist.',
        type: 'info',
      }));
      return false;
    }

    try {
      await addToWishlist(courseId);
      setWishlistIds(prev => new Set([...prev, courseId]));
      
      // Refresh wishlist to get full course data
      fetchWishlist();
      
      dispatch(showModal({
        title: 'Added to Wishlist',
        message: `"${courseTitle}" has been added to your wishlist.`,
        type: 'success',
      }));
      return true;
    } catch (err) {
      dispatch(showModal({
        title: 'Error',
        message: err.message || 'Failed to add course to wishlist',
        type: 'error',
      }));
      return false;
    }
  }, [isAuthenticated, dispatch, fetchWishlist]);

  // Remove course from wishlist
  const removeCourseFromWishlist = useCallback(async (courseId, courseTitle = 'Course') => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      await removeFromWishlist(courseId);
      setWishlistIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
      setWishlist(prev => prev.filter(course => course._id !== courseId));
      
      dispatch(showModal({
        title: 'Removed from Wishlist',
        message: `"${courseTitle}" has been removed from your wishlist.`,
        type: 'success',
      }));
      return true;
    } catch (err) {
      dispatch(showModal({
        title: 'Error',
        message: err.message || 'Failed to remove course from wishlist',
        type: 'error',
      }));
      return false;
    }
  }, [isAuthenticated, dispatch]);

  // Toggle course in wishlist
  const toggleWishlist = useCallback(async (courseId, courseTitle = 'Course') => {
    const isInWishlist = wishlistIds.has(courseId);
    
    if (isInWishlist) {
      return await removeCourseFromWishlist(courseId, courseTitle);
    } else {
      return await addCourseToWishlist(courseId, courseTitle);
    }
  }, [wishlistIds, addCourseToWishlist, removeCourseFromWishlist]);

  // Check if course is in wishlist
  const isInWishlist = useCallback((courseId) => {
    return wishlistIds.has(courseId);
  }, [wishlistIds]);

  // Check wishlist status for a specific course (useful for individual course pages)
  const checkCourseWishlistStatus = useCallback(async (courseId) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      const data = await checkWishlistStatus(courseId);
      return data.isInWishlist;
    } catch (err) {
      console.error('Error checking wishlist status:', err);
      return false;
    }
  }, [isAuthenticated]);

  // Initialize wishlist on authentication change
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    wishlistIds,
    loading,
    error,
    fetchWishlist,
    addCourseToWishlist,
    removeCourseFromWishlist,
    toggleWishlist,
    isInWishlist,
    checkCourseWishlistStatus,
    wishlistCount: wishlist.length,
  };
};

export default useWishlist;
