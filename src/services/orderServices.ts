import { Order, OrderItem, OrderStatus, Product } from '../models';

interface OrderItemData {
  product_id: number;
  quantity: number;
  discount?: number;
}

interface OrderData {
  id?: number;
  customer_id: number;
  items: OrderItemData[];
}

export async function createOrder(data: OrderData): Promise<Order> {
  const { customer_id, items } = data;

  const trx = await Order.startTransaction();
    
    try {
    const productPrices = await getProductPrices(items, trx);
    const totalPaid = calculateTotalPaid(items, productPrices);
    const totalDiscount = calculateTotalDiscound(items);

    const order = await Order.query(trx).insert({
      customer_id,
      total_paid: totalPaid,
      total_discount: totalDiscount,
      total_shipping: 0,
      total_tax: 0,
      status: OrderStatus.PaymentPending,
    });

    await insertOrderItems(order.id, items, productPrices, trx);
    await trx.commit();
    return order;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function updateOrder(data: OrderData) {
  const { id, customer_id, items } = data;
  if (!id) throw new Error('Order ID is required for update.');

  const trx = await Order.startTransaction();

  try {
    let order = await Order.query(trx).findById(id);

    if (!order) throw new Error('Order not found. Please, create a new order.');
    if (order.status !== OrderStatus.PaymentPending)
      throw new Error('Only pending payments can be modified.');

    await OrderItem.query(trx).where('order_id', id).delete();

    if (items.length < 1) {
      order = await Order.query(trx).patchAndFetchById(id, {
        customer_id,
        total_paid: 0,
        total_discount: 0,
        total_shipping: 0,
        total_tax: 0,
        status: order.status,
      });
      await trx.commit();
      return order;
    }

    const productPrices = await getProductPrices(items, trx);
    const totalPaid = calculateTotalPaid(items, productPrices);
    const totalDiscount = calculateTotalDiscound(items);

    order = await Order.query(trx).patchAndFetchById(id, {
      customer_id,
      total_paid: totalPaid as number,
      total_discount: totalDiscount as number,
      total_shipping: 0,
      total_tax: 0,
      status: order.status,
    });

    await OrderItem.query(trx).where('order_id', id).delete();
    await insertOrderItems(order.id, items, productPrices, trx);

    await trx.commit();
    return order;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function upsertOrder(data: OrderData) {
  return data.id ? updateOrder(data) : createOrder(data);
}

async function insertOrderItems(
  orderId: number,
  items: OrderItemData[],
  productPrices: Map<number, number>,
  trx: any

): Promise<void> {
  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    quantity: item.quantity,
    tax: 0,
    shipping: 0,
    discount: item.discount || 0,
    paid: productPrices.get(item.product_id) || 0,
  }));

  await OrderItem.query(trx).insert(orderItems);
}

function calculateTotalDiscound(items: OrderItemData[]): number {
  return items.reduce((sum, item) => sum + (item.discount || 0), 0);
}

function calculateTotalPaid(
  items: OrderItemData[],
  productPrices: Map<number, number>
): number {
  const totalDiscount = calculateTotalDiscound(items);
  return (
    items.reduce((sum, { product_id, quantity }) => {
      const price = productPrices.get(product_id) || 0;
      return sum + price * quantity;
    }, 0) - totalDiscount
  );
}

async function getProductPrices(items: OrderItemData[], trx: any): Promise<Map<number, number>> {
  const productsId = items.map((item) => item.product_id);
  const productPrices = new Map(
    (
      await Product.query(trx).select('id', 'price').whereIn('id', productsId)
    ).map(({ id, price }) => [id, price])
  );

  return productPrices;
}
