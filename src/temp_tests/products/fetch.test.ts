import 'tests/setup';
import server from '../../server';
import Product from '../../models/Product';

describe('FETCH action', () => {
  const validInput: Partial<Product> = {
    name: 'Beach Ball',
    sku: 'BCHBLL',
    description: 'A fun and colorful beach ball.',
    price: 2.99,
    stock: 100,
  };

  describe('when the product is found', () => {
    it('is successful', async () => {
      const product = await Product.query().insert(validInput);

      const response = await makeRequest(product.id);

      expect(response.statusCode).toBe(200);
    });

    it('returns the product data', async () => {
      const product = await Product.query().insert(validInput);

      const response = await makeRequest(product.id);

      const json_response = response.json<Product>();
      expect(json_response).toEqual({
        id: product.id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
  });

  describe('when the product is NOT found', () => {
    it('is not found', async () => {
      const product = await Product.query().insert(validInput);

      const response = await makeRequest(product.id + 1);

      expect(response.statusCode).toBe(404);
    });

    it('returns the product data', async () => {
      const product = await Product.query().insert(validInput);

      const response = await makeRequest(product.id + 1);

      const json_response = response.json<{ error: string }>();
      expect(json_response).toEqual({
        error: 'Product not found',
      });
    });
  });

  const makeRequest = async (id: number) =>
    server.inject({
      method: 'GET',
      url: `/products/${id}`,
    });
});
