import 'tests/setup';
import server from '../../../src/server';
import Order from '../../../src/models/Order';
import OrderItem from '../../../src/models/OrderItem';

import { LightMyRequestResponse } from 'fastify';

describe('CREATE action', () => {
  const validInput = {
    customer_id: 1,
    items: [
      { product_id: 1, quantity: 2, discount: 5 },
      { product_id: 2, quantity: 1 },
    ],
  };

  describe('when the input is valid', () => {
    const input = validInput;
    it('is successful', async () => {
      const response = await makeRequest(input);

      expect(response.statusCode).toBe(201);
    });

    it('creates a new record', async () => {
        await assertCount(Order, { customer_id: validInput.customer_id }, { changedBy: 1 });
    });

    it('creates order items', async () => {
      const response = await makeRequest(input);
        const order = await Order.query().findById(response.json().id);
        const items = await OrderItem.query().where('order_id', order?.id);
        expect(items.length).toBe(validInput.items.length);
    });
  });

  describe('when the customer_id is missing', () => {
    const { customer_id, ...input } = validInput;
    it('returns bad request response', async () => {
      const response = await makeRequest(input);
      await assertBadRequest(response, /must have required property 'customer_id'/);
    });
  });

  describe('when items is missing', () => {
    const { items, ...input } = validInput;

    it('returns a bad request response', async () => {
      const response = await makeRequest(input);
      await assertBadRequest(response, /must have required property 'items'/);
    });
  });

  describe('when an item has an invalid product_id', () => {
    const input = { ...validInput, items: [{ product_id: 115145631141546, quantity: 1 }] };
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

  const makeRequest = async (input: Order) =>
    server.inject({
      method: 'POST',
      url: '/orders',
      body: input,
    });

  const assertCount =  async (model, where, { changedBy })  => {
    const initialCount = await model.query().where(where).resultSize();
    await makeRequest(where);
    const finalCount = await model.query().where(where).resultSize();
    expect(finalCount).toBe(initialCount + changedBy);
  };

  const assertBadRequest = async (response: LightMyRequestResponse, message: RegExp | string) => {
    const json_response = response.json<{ message: string }>();
    expect(response.statusCode).toBe(400);
    expect(json_response.message).toMatch(message);
  };    
});
