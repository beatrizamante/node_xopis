import 'tests/setup';
import server from '../../../src/server';
import { TopProductReport } from '../../../src/interfaces/reports';

interface ReportInput {
  start_date: string,
  end_date: string,
  breakdown?: boolean  
}

const today = new Date().toISOString().split('T')[0];
const startDate = today;
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];
const endDate = String(tomorrow);

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

      await server.inject({
        method: 'POST',
        url: '/orders',
        body: order,
      });
    }
  });

  describe('when the query is valid', () => {
    it('is successful without optional', async () => {
      const result = await makeRequest({ start_date: startDate, end_date: endDate });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
        
      expect(result[0]).toHaveProperty('total_purchases');
    });

    it('returns breakdown by date if requested', async () => {
      const result = await makeRequest({ start_date: startDate, end_date: endDate, breakdown: true});

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      expect(result[0]).toHaveProperty('date');
    });
  });

  describe('when invalid queries', () => {
    it('throws an error if dates are missing', async () => {
      const response = await makeRequest({ start_date: '', end_date: endDate });

      console.log('Response error:', response);

      expect(response).toHaveProperty('error');
    });
  });

  const makeRequest = async (input: ReportInput): Promise<TopProductReport[]> => {
    const queryParams: Record<string, string> = {
      start_date: input.start_date,
      end_date: input.end_date,
    };

    if (input.breakdown !== undefined) {
      queryParams.breakdown = String(input.breakdown);
    }
  
    const queryString = new URLSearchParams(queryParams).toString();
  
    const response = await server.inject({
      method: 'GET',
      url: `/reports/top-products?${queryString}`,
    });

    return JSON.parse(response.body); 
  };
});
