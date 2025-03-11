import { FastifyInstance } from 'fastify';
import reportFetch from '../actions/products/fetch';

export default async function reportsRoutes(server: FastifyInstance) {
  server.get('/sales', reportFetch);
  server.get('/top-products', reportFetch);

}
