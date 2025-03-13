import 'tests/setup';
import server from '../../../src/server';
import Product from '../../../src/models/Product';

describe('UPDATE action', () => {
  describe('when the product is found', () => {
    describe('and updating the name only', () => {
      const input = { name: 'Colorful Beach Ball' };

      it('is successful', async () => {
        const product = await createProduct();

        const response = await makeRequest(product.id, input);

        expect(response.statusCode).toBe(200);
      });

      it('does NOT create a new record', async () => {
        const product = await createProduct();

        await assertCount(product, input, { changedBy: 0 });
      });

      it('returns the updated product', async () => {
        const product = await createProduct();

        const response = await makeRequest(product.id, input);

        const jsonResponse = response.json<Product>();
        expect(jsonResponse).toEqual(
          expect.objectContaining({
            id: product.id,
            name: input.name,
            description: product.description,
          })
        );
      });
    });

    describe('and updating the sku only', () => {
      const input = { sku: 'SK-BB0042' };

      it('is successful', async () => {
        const product = await createProduct();

        const response = await makeRequest(product.id, input);

        expect(response.statusCode).toBe(200);
      });

      it('does NOT create a new record', async () => {
        const product = await createProduct();

        await assertCount(product, input, { changedBy: 0 });
      });

      it('returns the updated product', async () => {
        const product = await createProduct();

        const response = await makeRequest(product.id, input);

        const jsonResponse = response.json<Product>();
        expect(jsonResponse).toEqual(
          expect.objectContaining({
            id: product.id,
            name: product.name,
            sku: input.sku,
          })
        );
      });
    });
  });

  describe('when the product is NOT found', () => {
    it('is not found', async () => {
      const response = await makeRequest(1, { sku: 'jack.doe@sku.com' });

      expect(response.statusCode).toBe(404);
    });

    it('returns the product data', async () => {
      const response = await makeRequest(1, { sku: 'jack.doe@sku.com' });

      const json_response = response.json<{ error: string }>();
      expect(json_response).toEqual({
        error: 'Product not found',
      });
    });
  });

  const makeRequest = async (id: number, input: Partial<Product>) =>
    server.inject({
      method: 'PATCH',
      url: `/products/${id}`,
      body: input,
    });

  const countRecords = async (input: Partial<Product>) =>
    Product.query().where(input).resultSize();

  const assertCount = async (oldProduct: Product, input: Partial<Product>, { changedBy }: { changedBy: number }) => {
    const initialCount = await countRecords({});
    expect(initialCount).toBeGreaterThan(0);

    await makeRequest(oldProduct.id, input);

    const finalCount = await countRecords({});

    expect(finalCount).toBe(initialCount + changedBy);
  };

  const createProduct = async () =>
    await Product.query()
      .insert({
        name: 'Beach Ball',
        sku: 'BCHBLL',
        description: 'Fun for the whole family',
        price: 2.99,
        stock: 100,
      });
});
