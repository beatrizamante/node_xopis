import { TopProductReport } from '../../interfaces/reports';

export function serializerTopProductsReport(results: TopProductReport[], breakdown: boolean) {
  return results.map((row) => ({
    product_id: row.product_id,
    total_purchases: row.total_purchases,
    ...(breakdown && { date: row.date }),
  }));
}
