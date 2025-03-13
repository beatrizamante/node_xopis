import { raw } from 'objection';
import { OrderItem } from '../models';
import { CouldNotGetReport, ERROR_CODES } from '../errors/errors';

interface SalesReportParams {
  start_date: string;
  end_date: string;
  product_id?: number;
}

export async function getSalesReports({
  start_date,
  end_date,
  product_id,
}: SalesReportParams) {
  if (!start_date || !end_date)
    throw new CouldNotGetReport(
      ERROR_CODES.COULD_NOT_GET_REPORT,
      'All dates must be filled.'
    );

  const query = OrderItem.query()
    .select([
      raw('DATE(orders.created_at) as date'),
      'orders_items.product_id',
      raw('SUM(orders_items.paid) as total_sold'),
    ])
    .join('orders', 'orders.id', 'orders_items.order_id')
    .whereBetween('orders.created_at', [start_date, end_date])
    .groupBy('date', 'orders_items.product_id')
    .orderBy('date', 'asc');

  if (product_id) {
    query.where('orders_items.product_id', product_id);
  }

  return query;
}

export async function getTopProductReport(
  start_date: string,
  end_date: string,
  breakdown?: boolean
) {
  if (!start_date || !end_date)
    throw new CouldNotGetReport(
      ERROR_CODES.COULD_NOT_GET_REPORT,
      'All dates must be filled.'
    );

  const query = OrderItem.query()
    .select([
      'orders_items.product_id',
      raw('COUNT(orders_items.order_id) as total_purchases'),
    ])
    .join('orders', 'orders.id', 'orders_items.order_id')
    .whereBetween('orders.created_at', [start_date, end_date])
    .groupBy('orders_items.product_id')
    .orderBy('total_purchases', 'desc');

  if (breakdown) {
    query
      .select(raw('DATE(orders.created_at) as DATE'))
      .groupBy('date', 'orders_items.product_id');
  }

  return query;
}
