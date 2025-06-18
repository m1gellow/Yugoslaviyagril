import { useCart } from '../context/CartContext';

const { getTotalItems, getTotalPrice } = useCart();

const showTotalPrice = () => {
  const totalPrice = getTotalPrice();
  if (totalPrice > 0) {
    return totalPrice;
  }
  return null;
};
const showTotalItems = () => {
  const totalItems = getTotalItems();
  if (totalItems > 0) {
    return totalItems;
  }
  return null;
};

type cardInfoType = {
  totalPrice: () => number | null;
  totalItems: () => number | null;
};

export const cartInfo: cardInfoType = {
  totalPrice: () => showTotalPrice(),
  totalItems: () => showTotalItems(),
} as const;
