import 'tests/setup';
import server from '../../../src/server';
import { getSalesReports } from '../../../src/services/reportServices';

interface OrderInput {
  id?: number;
  customer_id?: number;
  items?: { product_id: number; quantity: number; discount?: number }[];
}

const today = new Date().toISOString().split('T')[0];
const startDate = today;
const endDate = today;

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

      await makeRequest(order);
    }
  });

  describe('when valid queries', () => {
    it('returns sales report for a given date range', async () => {
      const result = await getSalesReports({
        start_date: startDate,
        end_date: endDate,
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('date', '2024-01-15');
      expect(result[0]).toHaveProperty('total_sold', 100);
    });

    it('returns filtered report for a specific product', async () => {
      const result = await getSalesReports({
        start_date: startDate,
        end_date: endDate,
        product_id: 1,
      });
      expect(result).toHaveLength(1);
      expect(result[0].product_id).toBe(1);
    });
  });

  describe('when invalid queries', () => {
    it('throws an error if dates are missing', async () => {
      await expect(
        getSalesReports({ start_date: '', end_date: endDate })
      ).rejects.toThrow('All dates must be filled.');
    });
  });

  const makeRequest = async (input: OrderInput) => {
    const response = await server.inject({
      method: 'GET',
      url: '/sales',
      body: input,
    });
    console.log(response.statusCode, response.body);
    return response;
  };
});
