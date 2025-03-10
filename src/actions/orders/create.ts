import { FastifyReply, FastifyRequest } from "fastify";
import { UniqueViolationError } from "objection";
import { CouldNotCreate, ERROR_CODES } from "src/errors/errors";
import { Order, OrderItem, Product } from "src/models";

type Request = FastifyRequest<{
  Body: {
    customer_id: number;
    items: { product_id: number; quantity: number; discount?: number }[];
  };
}>;

export default async (
  { body: { customer_id, items }}: Request,
  reply: FastifyReply
) =>  {
    const trx = await Order.startTransaction();

    try {
        const productsId = items.map((item) => item.product_id);
        const productPrices = new Map(
            (await Product.query(trx).select('id', 'price').whereIn('id', productsId))
              .map(({ id, price }) => [id, price])
          );
        const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
        const totalPaid = items.reduce((sum, { product_id, quantity }) => {
            const price = productPrices.get(product_id) || 0;
            return sum + price * quantity;
          }, 0) - totalDiscount;

          const order = await Order.query(trx).insert({
            customer_id,
            total_paid: totalPaid as number,
            total_discount: totalDiscount as number,
            total_shipping: 0,
            total_tax: 0,
            status: 'payment_pending',
          });          

          const orderItem = items.map((item) => ({
            order_id: order.id, 
            product_id: item.product_id,
            quantity: item.quantity,
            tax: 0,
            shipping: 0,
            discount: item.discount || 0,
            paid: productPrices.get(item.product_id) || 0,
          }));

          await OrderItem.query(trx).insert(orderItem);

          await trx.commit();

          return reply.code(201).send({
            id: order.id,
            customer_id,
            total_paid: totalPaid,
            total_discount: totalDiscount,
            status: order.status,
            items
          });
    } catch (error) {
        await trx.rollback();

        if(error instanceof CouldNotCreate) throw new CouldNotCreate(ERROR_CODES.COULD_NOT_CREATE, 'Error inserting data.');

        throw error;
    }
};