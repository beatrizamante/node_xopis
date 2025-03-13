import 'tests/setup';
import server from '../../../src/server';
import Order from '../../../src/models/Order';
import OrderItem from '../../../src/models/OrderItem';

import { LightMyRequestResponse } from 'fastify';

interface OrderInput {
  customer_id?: number;
  items?: { product_id: number; quantity: number; discount?: number }[];
}

describe('CREATE action', () => {
  const validInput = {
    customer_id: 1,
    items: [
      { product_id: 1, quantity: 2 },
      { product_id: 2, quantity: 1 },
    ],
  };

  describe('when the input is valid', () => {
    const input = validInput;
    it('is successful', async () => {
      const response = await makeRequest(input);

      expect(response.statusCode).toBe(201);
    });

    it('creates order items', async () => {
      const response = await makeRequest(input);

      const order = await Order.query().findById(response.json().id);

      if (!order) {
        throw new Error('Order not found');
      }

      const items = await OrderItem.query().where('order_id', order?.id);
      expect(items.length).toBe(validInput.items.length);
    });
  });

  describe('when the customer_id is missing', () => {
    const { customer_id, ...input } = validInput;

    it('returns bad request response', async () => {
      const response = await makeRequest(input);
      await assertBadRequest(
        response,
        /customer_id: must have required property 'customer_id'/
      );
    });
  });

  describe('when an item has an invalid product_id', () => {
    const input = {
      ...validInput,
      items: [{ product_id: 1151, quantity: 1 }],
    };

    it('returns an error response', async () => {
      const response = await makeRequest(input);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('when an item has a negative quantity', () => {
    const input = { ...validInput, items: [{ product_id: 1, quantity: -1 }] };

    it('returns a bad request response', async () => {
      const response = await makeRequest(input);
      await assertBadRequest(response, /total_paid: must be >= 0/);
    });
  });

  const makeRequest = async (input: OrderInput) => {
    const response = await server.inject({
      method: 'POST',
      url: '/orders',
      body: input,
    });
    console.log(response.statusCode, response.body);
    return response;
  };

  const assertBadRequest = async (
    response: LightMyRequestResponse,
    message: RegExp | string
  ) => {
    const json_response = response.json<{ message: string }>();
    expect(response.statusCode).toBe(400);
    expect(json_response.message).toMatch(message);
  };
});
