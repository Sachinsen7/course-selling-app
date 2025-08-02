import { useCart as useCartContext } from '../context/CartContext';

// Re-export the cart hook for convenience
export const useCart = useCartContext;

export default useCart;
