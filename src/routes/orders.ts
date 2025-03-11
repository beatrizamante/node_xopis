import { FastifyInstance } from 'fastify';
import orderCreate from '../actions/orders/create';
// import orderList from '../actions/orders/list';
// import orderFetch from '../actions/orders/fetch';
// import orderDelete from '../actions/orders/delete';
// import ordertUpdate from '../actions/orders/update';

export default async function ordersRoutes(server: FastifyInstance) {
  server.post('/', orderCreate);
  // server.get('/', orderList);
  // server.get('/:id', orderFetch);
  // server.delete('/:id', orderDelete);
  // server.patch('/:id', ordertUpdate);
}
