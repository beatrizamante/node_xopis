import { FastifyReply, FastifyRequest } from 'fastify';
import { getSalesReports } from '../../services/reportServices';
import { serializerSalesReport } from '../../serializers/sales/salesReportSerializer';

type RequestSales = FastifyRequest<{
    Querystring: {
      start_date: string;
      end_date: string;
      product_id?: number;
    };
  }>;

  export default async(
    { query: { start_date, end_date, product_id } }: RequestSales,
    reply: FastifyReply
) => {
    try {
        const salesData = await getSalesReports({ start_date, end_date, product_id });

        const serializedDate = serializerSalesReport(salesData);

        return reply.status(200).send(serializedDate);
    } catch(error) {
        return reply.status(500).send({ error: `An error occurred while fetching the sales report: ${error}` });
      }
};