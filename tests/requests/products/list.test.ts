import 'tests/setup';
import server from '../../../src/server';
import Product from '../../../src/models/Product';

describe('LIST action', () => {
  describe("when there's no products in the database", () => {
    it('returns an empty array', async () => {
      const response = await makeRequest();

      const json_response = response.json<Product[]>();
      expect(response.statusCode).toBe(200);
      expect(json_response).toEqual([]);
    });
  });

  describe('when there are products in the database', () => {
    const products = [
      { name: 'Beach Ball', sku: 'BCHBLL', description: 'A fun and colorful beach ball.', price: 2.99, stock: 100 },
      { name: 'Frisbee', sku: 'FRISB', description: 'A fun and colorful frisbee.', price: 1.99, stock: 50 },
      { name: 'Surfboard', sku: 'SRFBRD', description: 'A fun and colorful surfboard.', price: 99.99, stock: 10 }
    ];

    beforeEach(async () => {
      Promise.all(products.map(async product =>
        Product.query().insert(product)
      ));
    });

    it('returns an empty array', async () => {
      const response = await makeRequest();

      const json_response = response.json<Product[]>();
      expect(response.statusCode).toBe(200);
      expect(json_response).toEqual(
        expect.arrayContaining(products.map(product =>
          expect.objectContaining({
            ...product,
            id: expect.any(Number)
          })
        ))
      );
    });
  });

  const makeRequest = async () =>
    server.inject({
      method: 'GET',
      url: '/products',
    });
});
