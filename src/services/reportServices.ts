import { raw } from 'objection';
import { OrderItem } from '../models';

export async function getSalesReports(
  startDate: string,
  endDate: string,
  productId?: number
) {
  const query = OrderItem.query()
    .select([
      raw('DATE(orders.created_at) as date'),
      'order_items.product_id',
      raw('SUM(order_items.paid) as total_sold'),
    ])
    .join('order', 'orders.id', 'order_items.order_id')
    .whereBetween('orders.created_at', [startDate, endDate])
    .groupBy('date', 'order_items.product_id')
    .orderBy('date', 'asc');

  if (productId) {
    query.where('order_items.product_id', productId);
  }

  return query;
}

export async function getTopProductReport(
  startDate: string,
  endDate: string,
  breakdown?: boolean
) {
  const query = OrderItem.query()
    .select([
      'order_items.product_id',
      raw('COUNT(order_items.order_id) as total_purchases'),
    ])
    .join('orders', 'orders.id', 'order_items.order_id')
    .whereBetween('orders.created_at', [startDate, endDate])
    .groupBy('order_items.product_id')
    .orderBy('total_purchases', 'desc');

  if (breakdown) {
    query
      .select(raw('DATE(orders.created_at) as DATE'))
      .groupBy('date', 'order_items.product_id');
  }

  return query;
}
