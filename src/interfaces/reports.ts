export interface TopProductReport {
  product_id: number;
  total_purchases: number;
  date?: string;
}

export interface SalesReport {
  date: string;
  product_id: number;
  total_sold: string;
}
