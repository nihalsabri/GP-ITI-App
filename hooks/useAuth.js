import { useSelector } from 'react-redux';

/**
 * Custom hook للوصول لبيانات المصادقة من Redux
 * @returns {Object} { user, role, isAuthenticated, isLoading }
 */
export const useAuth = () => {
  const { user, role, isAuthenticated, isLoading } = useSelector(
    (state) => state.app
  );

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
  };
};