import 'tests/setup';
import server from '../../../src/server';
import { getTopProductReport } from '../../../src/services/reportServices';

interface OrderInput {
  id?: number;
  customer_id?: number;
  items?: { product_id: number; quantity: number; discount?: number }[];
}

const today = new Date().toISOString().split('T')[0];
const startDate = today;
const endDate = today;

describe('Top Product Report', () => {
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

  describe('when the query is valid', () => {
    it('is successful without optional', async () => {
      const result = await getTopProductReport({ start_date: startDate, end_date: endDate });
      expect(result).toHaveLength(5);
      expect(result[0]).toHaveProperty('product_id', 1);
    });

    it('is successful with optional', () => {
      it('is successful without optional', async () => {
        const breakdown: boolean = true;
        const result = await getTopProductReport({ start_date: startDate, end_date: endDate, breakdown: breakdown});
        expect(result).toHaveLength(5);
        expect(result[0]).toHaveProperty('product_id', 1);
      });
    });
  });

  describe('when the query is invalid', () => {
    it('returns breakdown by date if requested', async () => {
      const result = await getTopProductReport({ start_date: startDate, end_date: endDate, breakdown: true});
      expect(result[0]).toHaveProperty('date', '2024-01-15');
    });

    it('throws an error if dates are missing', async () => {
      await expect(getTopProductReport({ start_date: '', end_date: endDate})).rejects.toThrow(
        'All dates must be filled.'
      );
    });
  });

  const makeRequest = async (input: OrderInput) => {
    const response = await server.inject({
      method: 'GET',
      url: '/top-products',
      body: input,
    });
    console.log(response.statusCode, response.body);
    return response;
  };
});
