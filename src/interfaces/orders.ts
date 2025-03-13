export interface OrderItemData {
  product_id: number;
  quantity: number;
  discount?: number;
}

export interface OrderData {
  id?: number;
  customer_id: number;
  items: OrderItemData[];
}

export interface Transaction {
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}
