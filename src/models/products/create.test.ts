import 'tests/setup';
import server from '../../server';
import Product from '../Product';
import { LightMyRequestResponse } from 'fastify';

describe('CREATE action', () => {
  const validInput: Partial<Product> = {
    name: 'Beach Ball',
    sku: 'BCHBLL',
    description: 'A fun and colorful beach ball.',
    price: 2.99,
    stock: 100,
  };

  describe('when the input is valid', () => {
    const input = validInput;

    it('is successful', async () => {
      const response = await makeRequest(input);

      expect(response.statusCode).toBe(201);
    });

    it('creates a new record', async () => {
      await assertCount(input, { changedBy: 1 });
    });

    it('returns the created user', async () => {
      const response = await makeRequest(input);

      const jsonResponse = response.json<Product>();
      expect(jsonResponse).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: input.name,
          description: input.description,
          price: input.price,
          stock: input.stock,
        })
      );
    });
  });

  describe('when the name is missing', () => {
    const { name, ...input } = validInput;

    it('does not create a new record', async () => {
      await assertCount(input, { changedBy: 0 });
    });

    it('returns a bad request response', async () => {
      const response = await makeRequest(input);

      await assertBadRequest(response, /must have required property 'name'/);
    });
  });

  describe('when the sku is missing', () => {
    const { sku, ...input } = validInput;

    it('does not create a new record', async () => {
      await assertCount(input, { changedBy: 0 });
    });

    it('returns a bad request response', async () => {
      const response = await makeRequest(input);

      await assertBadRequest(response, /must have required property 'sku'/);
    });
  });

  describe('when the sku is already taken', () => {
    const input = validInput;

    beforeEach(async () => {
      const response = await makeRequest({ ...input, name: 'Super Beach Ball' });

      expect(response.statusCode).toBe(201);
    });

    it('does not create a new record', async () => {
      await assertCount({ sku: input.sku }, { changedBy: 0 });
    });

    it('returns a bad request response', async () => {
      await makeRequest(input);

      const response = await makeRequest(input);
      await assertBadRequest(response, /sku already taken/);
    });
  });

  describe('when the price is missing', () => {
    const { price, ...input } = validInput;

    it('does not create a new record', async () => {
      await assertCount(input, { changedBy: 0 });
    });

    it('returns a bad request response', async () => {
      const response = await makeRequest(input);

      await assertBadRequest(response, /must have required property 'price'/);
    });
  });

  describe('when the price is negative', () => {
    const input = { ...validInput, price: -2.99 };

    it('does not create a new record', async () => {
      await assertCount(input, { changedBy: 0 });
    });

    it('returns a bad request response', async () => {
      const response = await makeRequest(input);

      await assertBadRequest(response, /price: must be >= 0/);
    });
  });

  describe('when the stock is missing', () => {
    const { stock, ...input } = validInput;

    it('does not create a new record', async () => {
      await assertCount(input, { changedBy: 0 });
    });

    it('returns a bad request response', async () => {
      const response = await makeRequest(input);

      await assertBadRequest(response, /must have required property 'stock'/);
    });
  });

  describe('when the stock is negative', () => {
    const input = { ...validInput, stock: -100 };

    it('does not create a new record', async () => {
      await assertCount(input, { changedBy: 0 });
    });

    it('returns a bad request response', async () => {
      const response = await makeRequest(input);

      await assertBadRequest(response, /stock: must be >= 0/);
    });
  });

  describe('when the stock is not an integer', () => {
    const input = { ...validInput, stock: 1.5 };

    it('does not create a new record', async () => {
      await assertCount(input, { changedBy: 0 });
    });

    it('returns a bad request response', async () => {
      const response = await makeRequest(input);

      await assertBadRequest(response, /stock: must be integer/);
    });
  });

  const makeRequest = async (input: Partial<Product>) =>
    server.inject({
      method: 'POST',
      url: '/products',
      body: input,
    });

  const countRecords = async (input: Partial<Product>) =>
    Product.query().where(input).resultSize();

  const assertCount = async (input: Partial<Product>, { changedBy }: { changedBy: number }) => {
    const initialCount = await countRecords(input);

    await makeRequest(input);

    const finalCount = await countRecords(input);

    expect(finalCount).toBe(initialCount + changedBy);
  };

  const assertBadRequest = async (response: LightMyRequestResponse, message: RegExp | string) => {
    const json_response = response.json<{ message: string }>();
    expect(response.statusCode).toBe(400);
    expect(json_response.message).toMatch(message);
  };
});
