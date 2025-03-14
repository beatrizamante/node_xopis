import 'tests/setup';
import server from '../../../src/server';

interface ReportInput {
  start_date: string;
  end_date: string;
  product_id?: number;
}

const today = new Date().toISOString().split('T')[0];
const startDate = today;
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];
const endDate = String(tomorrow);

describe('Sales Reports', () => {
  beforeEach(async () => {
    for (let i = 1; i <= 5; i++) {
      const order = {
        customer_id: 1,
        items: [
          { product_id: i, quantity: 2 },
          { product_id: i + 1, quantity: 1 },
        ],
      };

      await server.inject({
        method: 'POST',
        url: '/orders',
        body: order,
      });
    }
  });

  describe('when valid queries', () => {
    it('returns sales report for a given date range', async () => {
      const result = await makeRequest({
        start_date: startDate,
        end_date: endDate,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
        
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('total_sold');
    });

    it('returns filtered report for a specific product', async () => {
      const result = await makeRequest({
        start_date: startDate,
        end_date: endDate,
        product_id: 1,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      expect(result[0]).toHaveProperty('product_id');
      expect(result[0].product_id).toBe(1);
    });
  });

  describe('when invalid queries', () => {
    it('throws an error if dates are missing', async () => {
      const response = await makeRequest({ start_date: '', end_date: endDate });

      expect(response).toHaveProperty('error');
      expect(response.error).toContain('All dates must be filled.');
    });
  });

  const makeRequest = async (input: ReportInput) => {
    const queryParams = new URLSearchParams({
      start_date: input.start_date,
      end_date: input.end_date,
      product_id:
        input.product_id !== undefined ? String(input.product_id) : '',
    }).toString();

    const response = await server.inject({
      method: 'GET',
      url: `/reports/sales?${queryParams}`,
    });

    return JSON.parse(response.body);
  };
});
