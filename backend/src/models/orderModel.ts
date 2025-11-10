import sql from '../config/database';

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  payment_intent_id: string;
  shipping_address: string;
  created_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: Date;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    product_name: string;
    product_image_url: string;
  })[];
}

export const OrderModel = {
  // Create new order
  async create(
    userId: number,
    total: number,
    paymentIntentId: string,
    shippingAddress: string
  ) {
    const result = await sql`
      INSERT INTO orders (user_id, total, status, payment_intent_id, shipping_address)
      VALUES (${userId}, ${total}, 'pending', ${paymentIntentId}, ${shippingAddress})
      RETURNING *
    `;
    return result[0];
  },

  // Add items to order
  // Add items to order
  async addItems(
      orderId: number,
      items: { productId: number; quantity: number; price: number }[]
    ) {
      // Flatten all values into one array
      const values = items.flatMap(item => [
        orderId,
        item.productId,
        item.quantity,
        item.price
      ]);

      //  placeholders  ($1, $2, $3, $4), ($5, $6, $7, $8), ...
      const placeholders = items
        .map((_, i) =>
          `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
        )
        .join(', ');

      const query = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ${placeholders}
        RETURNING *
      `;

      const result = await sql.query(query, values);
      return result;
    },


  // Get order by ID with items
  async getById(orderId: number) {
    const order = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `;

    if (order.length === 0) return null;

    const items = await sql`
      SELECT 
        oi.*,
        p.name as product_name,
        p.image_url as product_image_url
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${orderId}
    `;

    return {
      ...(order[0] as Order),
      items: items as OrderWithItems['items']
    };
  },

  // Get order by payment intent ID
  async getByPaymentIntent(paymentIntentId: string) {
    const result = await sql`
      SELECT * FROM orders WHERE payment_intent_id = ${paymentIntentId}
    `;
    return result[0];
  },

  // Get user's orders
  async getByUserId(userId: number) {
    const orders = await sql`
      SELECT * FROM orders 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await sql`
          SELECT 
            oi.*,
            p.name as product_name,
            p.image_url as product_image_url
          FROM order_items oi
          INNER JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ${order.id}
        `;
        return { ...order, items };
      })
    );

    return ordersWithItems;
  },

  // Update order status
  async updateStatus(orderId: number, status: string) {
    const result = await sql`
      UPDATE orders 
      SET status = ${status}
      WHERE id = ${orderId}
      RETURNING *
    `;
    return result[0];
  },

  // Get all orders (admin)
  async getAll(limit = 50, offset = 0) {
    const orders = await sql`
      SELECT 
        o.*,
        u.email as user_email,
        u.full_name as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*) FROM orders
    `;

    return {
      orders,
      total: parseInt(countResult[0]!.count)
    };
  }
};