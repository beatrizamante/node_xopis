import { FastifyReply, FastifyRequest } from 'fastify';
import { getTopProductReport } from '../../services/reportServices';
import { serializerTopProductsReport } from '../../serializers/products/topProductReportSerializer';

type RequestProducts = FastifyRequest<{
    Querystring: {
      start_date: string;
      end_date: string;
      breakdown?: boolean;
    };
  }>;

  export default async(
    { query: { start_date, end_date, breakdown } }: RequestProducts,
    reply: FastifyReply
) => {
    try {
        const productsData = await getTopProductReport({ start_date, end_date, breakdown });

        const serializedDate = serializerTopProductsReport(productsData);

        return reply.status(200).send(serializedDate);
    } catch(error) {
        return reply.status(500).send({ error: `An error occurred while fetching the sales report: ${error}` });
      }
};