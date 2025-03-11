export function serializerTopProductsReport(
  results: any[],
  breakdown: boolean
) {
  return results.map((row) => {
    const base = {
      product_id: row.product_id,
      total_purchases: row.total_purchases,
    };

    if (breakdown) {
      return {
        ...base,
        date: row.date,
      };
    }
  });
}
