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
      expect(result).toHaveLength(5);
      expect(result[0]).toHaveProperty('product_id', 1);
    });

    it('returns breakdown by date if requested', async () => {
      const result = await makeRequest({ start_date: startDate, end_date: endDate, breakdown: true});
      expect(result[0]).toHaveProperty('date', '2024-01-15');
    });
  });

  describe('when invalid queries', () => {
    it('throws an error if dates are missing', async () => {
      const response = await makeRequest({ start_date: '', end_date: endDate });

      console.log('Response error:', response);

      expect(response).toHaveProperty('error');
      expect(response.error).toContain('All dates must be filled.');
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
      url: `/reports/sales?${queryString}`,
    });

    return JSON.parse(response.body); 
  };
});
