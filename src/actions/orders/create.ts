import { FastifyReply, FastifyRequest } from 'fastify';
import { CouldNotCreateError, ERROR_CODES } from '../../errors/errors';
import { upsertOrder } from '../../services/orderServices';

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
    const order = await upsertOrder(request.body);
    return reply.code(201).send(order);
  } catch (error) {
    if (error instanceof CouldNotCreateError)
      throw new CouldNotCreateError(
        ERROR_CODES.COULD_NOT_CREATE,
        'Error inserting data.'
      );

    throw error;
  }
};
