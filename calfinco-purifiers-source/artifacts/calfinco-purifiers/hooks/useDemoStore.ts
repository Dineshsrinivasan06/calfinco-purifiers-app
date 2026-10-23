import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRODUCTS } from "@/data/catalog";

export type DemoRole = "customer" | "dealer" | "admin";
export type OrderStatus =
  | "Pending approval"
  | "Confirmed"
  | "In transit"
  | "Delivered";

export type CartLine = { productId: string; quantity: number };
export type Order = {
  id: string;
  customerName: string;
  role: "customer" | "dealer";
  items: CartLine[];
  total: number;
  status: OrderStatus;
  paymentStatus: string;
  placedAt: string;
};
export type DealerRequest = {
  id: string;
  business: string;
  contact: string;
  status: "Pending" | "Approved" | "Declined";
};
export type ServiceRequest = {
  id: string;
  name: string;
  phone: string;
  address: string;
  issue: string;
  status: "Requested" | "Confirmed";
};

type DemoState = {
  cart: CartLine[];
  orders: Order[];
  dealers: DealerRequest[];
  serviceRequests: ServiceRequest[];
};

const STORAGE_KEY = "@calfinco/demo-state-v1";

const initialState: DemoState = {
  cart: [],
  orders: [
    {
      id: "CF-2601",
      customerName: "Ananya Rao",
      role: "customer",
      items: [
        { productId: "ro-1", quantity: 1 },
        { productId: "filter-1", quantity: 2 },
      ],
      total: 13588,
      status: "In transit",
      paymentStatus: "Cash on delivery",
      placedAt: "Today, 10:42 AM",
    },
    {
      id: "CF-2602",
      customerName: "Metro Aqua Services",
      role: "dealer",
      items: [
        { productId: "uv-1", quantity: 4 },
        { productId: "filter-3", quantity: 12 },
      ],
      total: 7990 * 4 * 0.8 + 399 * 12 * 0.8,
      status: "Pending approval",
      paymentStatus: "Wholesale invoice",
      placedAt: "Today, 11:18 AM",
    },
  ],
  dealers: [
    {
      id: "dealer-1",
      business: "Metro Aqua Services",
      contact: "Rohan Mehta · Pune",
      status: "Pending",
    },
    {
      id: "dealer-2",
      business: "BlueDrop Solutions",
      contact: "Kavya Nair · Bengaluru",
      status: "Pending",
    },
  ],
  serviceRequests: [],
};

export function useDemoStore() {
  const [state, setState] = useState<DemoState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!mounted || !saved) return;
        const parsed = JSON.parse(saved) as Partial<DemoState>;
        setState({
          cart: Array.isArray(parsed.cart) ? parsed.cart : initialState.cart,
          orders: Array.isArray(parsed.orders)
            ? parsed.orders
            : initialState.orders,
          dealers: Array.isArray(parsed.dealers)
            ? parsed.dealers
            : initialState.dealers,
          serviceRequests: Array.isArray(parsed.serviceRequests)
            ? parsed.serviceRequests
            : initialState.serviceRequests,
        });
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() =>
      undefined,
    );
  }, [hydrated, state]);

  const addToCart = (productId: string) => {
    setState((current) => {
      const found = current.cart.find((line) => line.productId === productId);
      return {
        ...current,
        cart: found
          ? current.cart.map((line) =>
              line.productId === productId
                ? { ...line, quantity: line.quantity + 1 }
                : line,
            )
          : [...current.cart, { productId, quantity: 1 }],
      };
    });
  };

  const setQuantity = (productId: string, quantity: number) => {
    setState((current) => ({
      ...current,
      cart:
        quantity <= 0
          ? current.cart.filter((line) => line.productId !== productId)
          : current.cart.map((line) =>
              line.productId === productId ? { ...line, quantity } : line,
            ),
    }));
  };

  const placeOrder = (
    customerName: string,
    role: "customer" | "dealer",
  ): Order | null => {
    if (!state.cart.length) return null;
    const total = state.cart.reduce((sum, line) => {
      const product = PRODUCTS.find((item) => item.id === line.productId);
      const price = product
        ? role === "dealer"
          ? product.dealerPrice
          : product.price
        : 0;
      return sum + price * line.quantity;
    }, 0);
    const order: Order = {
      id: `CF-${Date.now().toString().slice(-6)}`,
      customerName: customerName.trim() || "Guest customer",
      role,
      items: state.cart,
      total,
      status: role === "dealer" ? "Pending approval" : "Confirmed",
      paymentStatus: "Cash on delivery",
      placedAt: "Just now",
    };
    setState((current) => ({
      ...current,
      cart: [],
      orders: [order, ...current.orders],
    }));
    return order;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setState((current) => ({
      ...current,
      orders: current.orders.map((order) =>
        order.id === id ? { ...order, status } : order,
      ),
    }));
  };

  const updateDealerStatus = (
    id: string,
    status: DealerRequest["status"],
  ) => {
    setState((current) => ({
      ...current,
      dealers: current.dealers.map((dealer) =>
        dealer.id === id ? { ...dealer, status } : dealer,
      ),
    }));
  };

  const addServiceRequest = (request: Omit<ServiceRequest, "id" | "status">) => {
    const savedRequest: ServiceRequest = {
      ...request,
      id: `SR-${Date.now().toString().slice(-6)}`,
      status: "Requested",
    };
    setState((current) => ({
      ...current,
      serviceRequests: [savedRequest, ...current.serviceRequests],
    }));
  };

  return {
    ...state,
    hydrated,
    addToCart,
    setQuantity,
    placeOrder,
    updateOrderStatus,
    updateDealerStatus,
    addServiceRequest,
  };
}
