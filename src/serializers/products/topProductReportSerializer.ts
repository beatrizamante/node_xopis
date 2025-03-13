import { TopProductReport } from '../../interfaces/reports';

export function serializerTopProductsReport(results: TopProductReport[]) {
  return results.map((row) => ({
    product_id: row.product_id,
    total_purchases: row.total_purchases,
    ...(row.date && { date: row.date }),
  }));
}
