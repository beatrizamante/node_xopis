import { FastifyReply, FastifyRequest } from 'fastify';
import { CouldNotCreate, ERROR_CODES } from '../../errors/errors';
import { createOrder } from '../../services/orderServices';

export default async (
  request: FastifyRequest<{
    Body: {
      id?: number;
      customer_id: number;
      items: { product_id: number; quantity: number; discount?: number }[];
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const order = await createOrder(request.body);
    return reply.code(201).send(order);
  } catch (error) {
    if (error instanceof CouldNotCreate)
      throw new CouldNotCreate(
        ERROR_CODES.COULD_NOT_CREATE,
        'Error inserting data.'
      );

    throw error;
  }
};
