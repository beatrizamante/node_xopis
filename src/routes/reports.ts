import { FastifyInstance } from 'fastify';
import fetchSales from '../actions/reports/fetchSales';
import fetchTopProducts from '../actions/reports/fetchTopProducts';

export default async function reportsRoutes(server: FastifyInstance) {
  server.get('/sales', fetchSales);
  server.get('/top-products', fetchTopProducts);

}
