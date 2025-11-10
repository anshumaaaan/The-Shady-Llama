import type { Request, Response } from "express";
import { ProductModel } from "../models/productModel";

export const productController = {
    // create new prod
    async create(req: Request, res: Response){
        try{
            const {name, description, price, stock, category, imageUrl} = req.body;

            // validation
            if(!name || !price || stock == undefined){
                return res.status(400).json({
                    error: 'Price provide name, price and stock'
                });
            }
            if(price < 0 || stock < 0){
                return res.status(400).json({
                    error: 'Price and stock should be positive numbers'
                });
            }

            const product = await ProductModel.create(
                name,
                description || '',
                price,
                stock, category || 'general',
                imageUrl || ''
            );

            res.status(201).json({
                message: 'Prodcut created successfully',
                product
            });
        } catch(error){
            console.error('Create product error: ', error);
            res.status(500).json({error: 'Failed to create product'});
        }
    },
    //get all prod
    async getAll(req: Request, res:Response){
        try{
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const {products, total} = await ProductModel.getAll(limit, offset);

            res.json({
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total/limit)
                }
            });
        } catch(error){
            console.error('Get products error: ', error);
            res.status(500).json({error: 'Failed to fetch products'});
        }
    },
    // get product by ID
    async getById(req: Request, res: Response){
        try{
            const id = parseInt(req.params.id!);

            const product = await ProductModel.getById(id);

            if(!product){
                return res.status(404).json({ error: 'Product not found'});
            }
            res.json({product});
        } catch(error){
            console.error('Get product error:', error);
            res.status(500).json({error: 'Failed to fetch prodcut'});
        }
    },

    // update product (admin only)
    async update(req: Request, res: Response){
        try{

            const id = parseInt(req.params.id!);
            const {name, description, price, stock, category, imageUrl} = req.body;

            // check existence of prod
            const exisitingProduct = await ProductModel.getById(id);
            if(!exisitingProduct){
                return res.status(404).json({error: 'Product not found'});
            }
            //validation
            if (price !== undefined && price < 0) {
            return res.status(400).json({ error: 'Price must be positive' });
            }

            if (stock !== undefined && stock < 0) {
                return res.status(400).json({ error: 'Stock must be positive' });
            }

            const product = await ProductModel.update(
                id,
                name || exisitingProduct.name,
                description !== undefined ? description: exisitingProduct.description,
                price !== undefined ? price : exisitingProduct.price,
                stock !== undefined ? stock : exisitingProduct.stock,
                category || exisitingProduct.category,
                imageUrl !== undefined ? imageUrl : exisitingProduct.image_url
            );

            res.json({
                message: 'Product updated successfully',
                product
            });
        } catch(error){
            console.error('Get product error:', error);
            res.status(500).json({error: 'Failed to update product'});
        }
    },

    // delete product
    async delete(req:Request, res: Response){
        try{
            const id = parseInt(req.params.id!);

            const product = await ProductModel.delete(id);

            if(!product){
                return res.status(404).json({error: 'Product not found'});
            }
            
            res.json({
                message: 'Product deleted successfully',
                product
            });
        } catch(error){
            console.error('Delete product error:', error);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    },

    // search products
    async search(req:Request, res: Response){
        try{
            const query = req.query.q as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page-1)*limit;

            if(!query){
                return res.status(400).json({ error: 'Search query is required' });
            }

            const {products, total } = await ProductModel.search(query, limit, offset);

            res.json({
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total/limit)
                }
            });
        } catch(error){
            console.error('Search products error:', error);
            res.status(500).json({ error: 'Failed to search products' });
        }
    },
    // get products byt  category
    async getByCategory(req:Request, res:Response){
        try{
            const category = req.params.category;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string)|| 10;
            const offset = (page-1)*limit;

            const {products, total} = await ProductModel.getByCategory(
                category!,
                limit,
                offset
            );

            res.json({
                products,
                pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
                }
            });
        } catch(error){
            console.error('Get products by category error:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    },

    // get all categories
    async getCategories(req: Request, res: Response) {
        try {
            const categories = await ProductModel.getCategories();
            res.json({ categories });
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }
};