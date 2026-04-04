import { createContext, useContext, useState, ReactNode } from "react";

export type ProcessingKey = "standard" | "rush3" | "rush24";

export interface CartItem {
  id: string;
  serviceTitle: string;
  processingKey: ProcessingKey;
  processingLabel: string;
  processingTime: string;
  price: number;
  clientUsername?: string;
  addedAt: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "addedAt">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  discountAmount: number;
}

const CartContext = createContext<CartContextType | null>(null);

const VALID_CODES: Record<string, number> = {
  "IFCS10": 10,
  "IFCS20": 20,
  "WELCOME15": 15,
  "CUNY": 20,
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState("");
  const discountAmount = VALID_CODES[discountCode.toUpperCase()] ?? 0;

  const addItem = (item: Omit<CartItem, "id" | "addedAt">) => {
    const newItem: CartItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      addedAt: new Date().toLocaleString(),
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems: items.length, discountCode, setDiscountCode, discountAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
