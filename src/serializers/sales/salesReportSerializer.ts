export function serializerSalesReport(results: any[]) {
  return results.map((row) => ({
    date: row.date,
    product_id: row.product_id,
    total_sold: parseFloat(row.total_sold),
  }));
}
