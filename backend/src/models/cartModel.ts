import sql from '../config/database';

export interface CartItem{
    id: number;
    user_id: number;
    product_id: number;
    quantity: number;
    created_at: Date;
    // joined product details
    product_name?: string;
    product_price?: number;
    product_stock?: number;
    product_image_url?: string;
}

export const CartModel = {
    // add items to cart
    async addItem(userId: number, productId: number, quantity: number){
        //if already exist
        const exisiting = await sql `
            SELECT * FROM cart
            WHERE user_id = ${userId} AND product_id = ${productId}
        `;

        if(exisiting.length > 0){
            // update quantity if exists
            const result = await sql`
                UPDATE cart
                SET quantity = quantity + ${quantity}
                WHERE user_id = ${userId} AND product_id = ${productId}
                RETURNING *
            `;
            return result[0];
        } else{
            // insert new item
            const result = await sql`
                INSERT INTO cart (user_id, product_id, quantity)
                VALUES (${userId}, ${productId}, ${quantity})
                RETURNING *
            `;
            return result[0];
        }
    },

    // get user's cart with prod details
    async getByUserId(userId: number){

        const result = await sql`
            SELECT 
               c.id,
               c.user_id,
               c.product_id,
               c.quantity,
               c.created_at,
               p.name as product_name,
               p.price as product_price,
               p.stock as product_stock,
               p.image_url as product_image_url,
               p.description as product_description
            FROM cart c
            INNER JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ${userId}
            ORDER BY c.created_at DESC
        `;
        return result;
    },

    // update cart item quantity
    async updateQuantity(userId:number, productId: number, quantity:number){
        if(quantity <= 0){
            return await this.removeItem(userId, productId);
        }

        const result = await sql`
            UPDATE 
            SET quantity = ${quantity}
            WHERE user_id = ${userId} AND product_id = ${productId}
            RETURNING *
        `;
        return result[0];
    },

    // remove item from cart
    async removeItem(userId: number, productId: number) {
        const result = await sql`
            DELETE FROM cart 
            WHERE user_id = ${userId} AND product_id = ${productId}
            RETURNING *
        `;
        return result[0];
    },

    // clear entire cart
    async clearCart(userId: number) {
        const result = await sql`
            DELETE FROM cart WHERE user_id = ${userId}
            RETURNING *
        `;
        return result;
    },

    // get cart itme count
    async getCartCount(userId: number) {
        const result = await sql`
            SELECT COALESCE(SUM(quantity), 0) as count
            FROM cart
            WHERE user_id = ${userId}
        `;
        return parseInt(result[0]!.count);
    },

    //get cart total
    async getCartTotal(userId: number){
        const result = await sql`
            SELECT COALESCE(SUM(c.quantity * p.price), 0) as total
            FROM cart c
            INNER JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ${userId}
        `;
        return parseFloat(result[0]!.total);
    },

    // check if all cart items have sufficient stock
    async validateStock(userId: number) {
        const result = await sql`
            SELECT 
                c.product_id,
                c.quantity,
                p.name,
                p.stock
            FROM cart c
            INNER JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ${userId} AND c.quantity > p.stock
        `;
        return result;
    }
}