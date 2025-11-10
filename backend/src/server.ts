import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sql from './config/database';
import { timeStamp } from 'console';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import OrderRoutes from './routes/orderRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

// route
app.get('/api/health', (req, res) =>{
    res.json({message: "Server is running!"});
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', OrderRoutes);

//error handling middleware
app.use((err:any, req: express.Request, res:express.Response, next:express.NextFunction) =>{
    console.log(err.stack);
    res.status(500).json({error: 'Something went wrong!'});
})

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
});
