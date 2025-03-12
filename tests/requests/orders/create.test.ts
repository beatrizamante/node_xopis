import 'tests/setup';
import server from '../../../src/server';
import Order, { OrderStatus } from '../../../src/models/Order';
import OrderItem from '../../../src/models/OrderItem';

import { LightMyRequestResponse } from 'fastify';
import { Model } from 'objection';

interface OrderInput {
  id?: number;
  customer_id?: number;
  items?: { product_id: number; quantity: number; discount?: number }[];
}

jest.mock('../models');
jest.mock('../services/orderService', () => ({
  ...jest.requireActual('../services/orderService'),
  getProductPrices: jest.fn(),
  calculateTotalPaid: jest.fn(),
  calculateTotalDiscound: jest.fn(),
  insertOrderItems: jest.fn(),
}));

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

    it('creates a new record', async () => {
        await assertCount(
          Order,
          { customer_id: validInput.customer_id },
          { changedBy: 1, items: validInput.items } 
        );
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

  describe('UPDATE action', () => {
    const existingOrder = {
      id: 1,
      customer_id: 1,
      status: OrderStatus.PaymentPending,
      total_paid: 100,
      total_discount: 10,
    };
  
    const updateInput = {
      id: 1,
      customer_id: 2,
      items: [{ product_id: 1, quantity: 3 }],
    };
  
    beforeEach(async () => {
      await Order.query().insert(existingOrder);
      await OrderItem.query().insert([
        { order_id: 1, product_id: 1, quantity: 2 },
      ]);
    });
  
    it('updates an existing order successfully', async () => {
      const response = await makeRequest(updateInput);
      expect(response.statusCode).toBe(200);
  
      const updatedOrder = await Order.query().findById(updateInput.id);
      expect(updatedOrder?.customer_id).toBe(updateInput.customer_id);
    });
  
    it('returns an error if order does not exist', async () => {
      const response = await makeRequest({ ...updateInput, id: 999 });
      expect(response.statusCode).toBe(500);
    });
  
    it('returns an error if order status is not PaymentPending', async () => {
      await Order.query().patchAndFetchById(existingOrder.id, {
        status: OrderStatus.Shipped,
      });
  
      const response = await makeRequest(updateInput);
      expect(response.statusCode).toBe(500);
    });
  
    it('removes all items when items array is empty', async () => {
      const response = await makeRequest({ ...updateInput, items: [] });
      expect(response.statusCode).toBe(200);
  
      const updatedItems = await OrderItem.query().where('order_id', updateInput.id);
      expect(updatedItems.length).toBe(0);
    });
  
    const makeRequest = async (input: OrderInput) => {
      return await server.inject({
        method: 'PUT',
        url: '/orders',
        body: input,
      });
    };
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

  const assertCount = async (
    model: typeof Model,
    where: object,
    { changedBy, items }: { changedBy: number, items?: Partial<OrderItem>[] }
  ) => {
    const initialCount = await model.query().where(where).resultSize();
    console.log('Initial count:', initialCount);
    const response = await makeRequest(where);
    const createdOrder = response.json();

   const initialItemCount = await OrderItem.query().where({ order_id: createdOrder.id }).resultSize();
  console.log('Initial item count:', initialItemCount);

  const finalCount = await model.query().where(where).resultSize();
  console.log('Final count:', finalCount);

  const finalItemCount = await OrderItem.query().where({ order_id: createdOrder.id }).resultSize();
  console.log('Final item count:', finalItemCount);

  expect(finalCount).toBe(initialCount + changedBy);

  if (items) {
    expect(finalItemCount).toBe(initialItemCount + items.length);
  }
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
