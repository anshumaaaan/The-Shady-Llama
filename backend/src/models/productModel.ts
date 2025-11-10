import sql from "../config/database";

export interface Product{
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image_url: string;
    created_at: Date;
}

export const ProductModel = {
    // create new prod
    async create(
        name:string,
        description:string,
        price: number,
        stock: number,
        category: string,
        image_url: string
    ) {
        const result = await sql`
        INSERT INTO products (name, description, price, stock, category, image_url)
        VALUES (${name}, ${description}, ${price}, ${stock}, ${category}, ${image_url})
        RETURNING *
        `;
        return result[0];
    },

    // get all prod with pagination
    async getAll(limit = 10, offset = 0){
        const products = await sql`
            SELECT * FROM products
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;
        const countResult = await sql`
            SELECT COUNT(*) FROM products
        `;

        return{
            products,
            total: parseInt(countResult[0]!.count)
        };
    },

    // get prod by ID
    async getById(id:number){
        const result = await sql`
            SELECT * FROM products
            WHERE id = ${id}
        `;
        return result[0];
    },

    // update prod
    async update(
        id: number,
        name: string,
        description: string,
        price: number,
        stock: number,
        category: string,
        imageUrl: string
    ){
        const result = await sql`
            UPDATE products
            SET name = ${name},
                description = ${description},
                price = ${price},
                stock = ${stock},
                category = ${category},
                image_url = ${imageUrl}
            WHERE id = ${id}
            RETURNING *
        `;
        return result[0];
    },
    async delete(id: number){
        const result = await sql`
            DELETE FROM products WHERE id = ${id}
            RETURNING *
        `;
        return result[0];
    },

    // search products
    async search(query: string, limit=10, offset = 0){
        const searchTerm = `%${query}%`;

        const products = await sql`
            SELECT * FROM products
            WHERE name ILIKE ${searchTerm}
                OR description ILIKE ${searchTerm}
                OR category ILIKE ${searchTerm}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const countResult = await sql`
            SELECT COUNT(*) FROM products
            WHERE name ILIKE ${searchTerm}
                OR description ILIKE ${searchTerm}
                OR category ILIKE ${searchTerm}
        `;

        return{
            products,
            total: parseInt(countResult[0]!.count)
        };
    },
    // Get products by category
  async getByCategory(category: string, limit = 10, offset = 0) {
    const products = await sql`
      SELECT * FROM products
      WHERE category = ${category}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const countResult = await sql`
      SELECT COUNT(*) FROM products
      WHERE category = ${category}
    `;
    
    return {
      products,
      total: parseInt(countResult[0]!.count)
    };
  },

    // Get all categories
    async getCategories() {
        const result = await sql`
        SELECT DISTINCT category FROM products
        WHERE category IS NOT NULL
        ORDER BY category
        `;
        return result.map(row => row.category);
    },

    // Update stock
    async updateStock(id: number, quantity: number) {
        const result = await sql`
        UPDATE products
        SET stock = stock - ${quantity}
        WHERE id = ${id} AND stock >= ${quantity}
        RETURNING *
        `;
        return result[0];
    },

    // Check if product has enough stock
    async hasStock(id: number, quantity: number) {
        const result = await sql`
        SELECT stock FROM products WHERE id = ${id}
        `;
        
        if (!result[0]) return false;
        return result[0].stock >= quantity;
    }

};