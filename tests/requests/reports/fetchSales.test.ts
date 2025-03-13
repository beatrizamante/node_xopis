import 'tests/setup';
import server from '../../../src/server';

interface ReportInput {
  start_date: string,
  end_date: string,
  product_id?: number  
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
      console.log("Result ____________sales is valid", result)

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty('date', '2024-01-15');
      expect(result[0]).toHaveProperty('total_sold', 100);
    });

    it('returns filtered report for a specific product', async () => {
      const result = await makeRequest({
        start_date: startDate,
        end_date: endDate,
        product_id: 1,
      });
      console.log("Result product id____________sales is valid", result)
      expect(result).toBeInstanceOf(Array);
      expect(result[0].product_id).toBe(1);
    });
  });

  describe('when invalid queries', () => {
    it('throws an error if dates are missing', async () => {
      await expect(
        makeRequest({ start_date: '', end_date: endDate })
      ).rejects.toThrow('All dates must be filled.');
    });
  });

  const makeRequest = async (input: ReportInput) => {
    const queryParams = new URLSearchParams({
      start_date: input.start_date,
      end_date: input.end_date,
      product_id: input.product_id !== undefined ? String(input.product_id) : '',
    }).toString();

    const response = await server.inject({
      method: 'GET',
      url: `/reports/sales?${queryParams}`,
    });

    console.log(queryParams)
    return JSON.parse(response.body); 

  };
});
