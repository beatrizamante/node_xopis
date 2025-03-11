import { FastifyInstance } from 'fastify';
import reportFetch from '../actions/products/fetch';

export default async function reportsRoutes(server: FastifyInstance) {
  server.post('/sales', reportFetch);
  server.post('/top-products', reportFetch);

}
