import 'tests/setup';
import server from '../../server';
import Product from '../Product';

describe('DELETE action', () => {
  const beachBallInput: Partial<Product> = {
    name: 'Beach Ball',
    sku: 'BCHBLL',
    description: 'A fun and colorful beach ball.',
    price: 2.99,
    stock: 100,
  };

  const frisbeeInput: Partial<Product> = {
    name: 'Frisbee',
    sku: 'FRISB',
    description: 'A fun and colorful frisbee.',
    price: 1.99,
    stock: 200,
  };

  const surfBoardInput: Partial<Product> = {
    name: 'Surf Board',
    sku: 'SURFBRD',
    description: 'A fun and colorful surf board.',
    price: 99.99,
    stock: 50,
  };

  describe('when the product is found', () => {
    it('is successful', async () => {
      const product = await Product.query().insert(beachBallInput);

      const response = await makeRequest(product.id);

      expect(response.statusCode).toBe(200);
    });

    it('deletes the product', async () => {
      const { id, sku } = await Product.query().insert(beachBallInput);

      await assertCount(id, { sku }, { changedBy: -1 });
    });

    it('returns the product id', async () => {
      await Product.query().insert(frisbeeInput);
      const product = await Product.query().insert(beachBallInput);
      await Product.query().insert(surfBoardInput);

      const response = await makeRequest(product.id);

      const json_response = response.json<number>();
      expect(json_response).toEqual(product.id);
    });
  });

  describe('when the product is NOT found', () => {
    it('is not found', async () => {
      const product = await Product.query().insert(beachBallInput);

      const response = await makeRequest(product.id + 1);

      expect(response.statusCode).toBe(404);
    });

    it('returns an error message', async () => {
      await Product.query().insert(surfBoardInput);
      const product = await Product.query().insert(beachBallInput);

      const response = await makeRequest(product.id + 1);

      const json_response = response.json<{ error: string }>();
      expect(json_response).toEqual({
        error: 'Product not found',
      });
    });
  });

  const makeRequest = async (id: number) =>
    server.inject({
      method: 'DELETE',
      url: `/products/${id}`,
    });

  const countRecords = async (input: Partial<Product>) =>
    Product.query().where(input).resultSize();

  const assertCount = async (id: number, input: Partial<Product>, { changedBy }: { changedBy: number }) => {
    const initialCount = await countRecords(input);

    await makeRequest(id);

    const finalCount = await countRecords(input);

    expect(finalCount).toBe(initialCount + changedBy);
  };
});
