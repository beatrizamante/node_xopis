import fastify from 'fastify';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import ordersRoutes from './routes/orders';
import reportsRoutes from './routes/reports';
import { errorPlugin } from './handlers/errorPlugin';

const shouldLog = process.env.NODE_ENV !== 'test';
const server = fastify({ logger: shouldLog });

server.register(errorPlugin);
server.register(userRoutes, { prefix: '/users' });
server.register(productRoutes, { prefix: '/products' });
server.register(ordersRoutes, { prefix: '/orders' });
server.register(reportsRoutes, { prefix: '/reports' });

export default server;
