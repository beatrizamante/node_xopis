import { FastifyReply, FastifyRequest } from 'fastify';
import { Order, OrderItem, OrderStatus, Product } from '../../models';
import { CouldNotCreate, ERROR_CODES } from '../../errors/errors';

type Request = FastifyRequest<{
  Body: {
    id?: number;
    customer_id: number;
    items: { product_id: number; quantity: number; discount?: number }[];
  };
}>;

export default async (
  { body: { id, customer_id, items } }: Request,
  reply: FastifyReply
) => {
  const trx = await Order.startTransaction();

  try {
    const productsId = items.map((item) => item.product_id);
    const productPrices = new Map(
      (
        await Product.query(trx).select('id', 'price').whereIn('id', productsId)
      ).map(({ id, price }) => [id, price])
    );
    const totalDiscount = items.reduce(
      (sum, item) => sum + (item.discount || 0),
      0
    );
    const totalPaid =
      items.reduce((sum, { product_id, quantity }) => {
        const price = productPrices.get(product_id) || 0;
        return sum + price * quantity;
      }, 0) - totalDiscount;

    let order;

    if (id) {
      order = await Order.query(trx).findById(id);

      if (!order)
        throw new Error('Order not found. Please, create a new order.');
      if (order.status !== OrderStatus.PaymentPending)
        throw new Error('Only pending payments can be modified.');

      order = await Order.query(trx).patchAndFetchById(id, {
        customer_id,
        total_paid: totalPaid as number,
        total_discount: totalDiscount as number,
        total_shipping: 0,
        total_tax: 0,
        status: order.status,
      });

      await OrderItem.query(trx).where('order_id', id).delete();
    } else {
      order = await Order.query(trx).insert({
        customer_id,
        total_paid: totalPaid as number,
        total_discount: totalDiscount as number,
        total_shipping: 0,
        total_tax: 0,
        status: OrderStatus.PaymentPending,
      });
    }

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
      items,
    });
  } catch (error) {
    await trx.rollback();

    if (error instanceof CouldNotCreate)
      throw new CouldNotCreate(
        ERROR_CODES.COULD_NOT_CREATE,
        'Error inserting data.'
      );

    throw error;
  }
};
