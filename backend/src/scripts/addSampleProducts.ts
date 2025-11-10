import sql from '../config/database';

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    description: 'Latest Apple smartphone with A17 Pro chip and titanium design',
    price: 999.99,
    stock: 50,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1592286927505-2fd0c643b8dd?w=400'
  },
  {
    name: 'MacBook Air M2',
    description: 'Lightweight laptop with M2 chip and stunning display',
    price: 1199.99,
    stock: 30,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
  },
  {
    name: 'AirPods Pro',
    description: 'Wireless earbuds with active noise cancellation',
    price: 249.99,
    stock: 100,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400'
  },
  {
    name: 'Nike Air Max',
    description: 'Comfortable running shoes with Air cushioning',
    price: 129.99,
    stock: 75,
    category: 'Footwear',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
  },
  {
    name: 'Leather Jacket',
    description: 'Premium genuine leather jacket for all seasons',
    price: 199.99,
    stock: 40,
    category: 'Clothing',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'
  },
  {
    name: 'Gaming Mouse',
    description: 'High-precision gaming mouse with RGB lighting',
    price: 79.99,
    stock: 120,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Cherry MX switches with customizable RGB backlighting',
    price: 149.99,
    stock: 60,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400'
  },
  {
    name: 'Smartwatch',
    description: 'Fitness tracking smartwatch with heart rate monitor',
    price: 299.99,
    stock: 85,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
  },
  {
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe',
    price: 89.99,
    stock: 45,
    category: 'Home',
    image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400'
  },
  {
    name: 'Yoga Mat',
    description: 'Non-slip exercise mat perfect for yoga and fitness',
    price: 34.99,
    stock: 150,
    category: 'Sports',
    image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'
  },
  {
    name: 'Backpack',
    description: 'Durable laptop backpack with multiple compartments',
    price: 59.99,
    stock: 90,
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
  },
  {
    name: 'Wireless Charger',
    description: 'Fast wireless charging pad for smartphones',
    price: 29.99,
    stock: 200,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1591290619762-c588af9986f9?w=400'
  }
];

async function addSampleProducts() {
  try {
    console.log('Adding sample products...');

    for (const product of sampleProducts) {
      await sql`
        INSERT INTO products (name, description, price, stock, category, image_url)
        VALUES (${product.name}, ${product.description}, ${product.price}, ${product.stock}, ${product.category}, ${product.image_url})
      `;
      console.log(`✅ Added: ${product.name}`);
    }

    console.log('\n✅ All sample products added successfully!');
  } catch (error) {
    console.error('❌ Error adding products:', error);
  }
}

addSampleProducts();