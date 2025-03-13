import { FastifyInstance } from 'fastify';
import orderCreate from '../actions/orders/create';

export default async function ordersRoutes(server: FastifyInstance) {
  server.post('/', orderCreate);
}
