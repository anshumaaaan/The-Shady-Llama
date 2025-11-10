import type { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { UserModel } from "../models/userModel";

export const authController = {
    //register new user

    async register(req: Request, res:Response){
        try{
            const {email, password, fullName} = req.body;

            // validation
            if(!email || !password || !fullName){
                return res.status(400).json({
                    error: "Enter valid email, password, and fullname"
                });
            }
            if(password.length < 6){
                return res.status(400).json({
                    error: 'Password must be at least 6 characters long'
                });
            }

            const existingUser = await UserModel.findByEmail(email);
            if(existingUser){
                return res.status(400).json({
                    error: 'Email already registered'
                });
            }
            //create new user
            const user = (await UserModel.create(email, password, fullName))!;
            
            const userPayload = {
                userId: user.id,
                email: user.email,
                role: user.role
            };
            //generate new token
            const token = jwt.sign(
                userPayload,
                process.env.JWT_SECRET!,
                {expiresIn: '7d'}
            );
            
            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role
                }
            });
        } catch(error){
            console.log('Registration error:', error);
            res.status(500).json({ error: 'Registration Failed'});
        }
    },
    //login user
    async login(req: Request, res: Response){
        try{
            const {email, password} = req.body;

            if(!email || !password){
                return res.status(400).json({
                    error: 'Please provide valid email and password'
                });
            }

            const user = await UserModel.findByEmail(email);
            if(!user){
                return res.status(401).json({
                    error: 'Invallid email or password'
                });
            }
            const isValidPassword = await UserModel.verifyPassword(
                password,
                user.password
            );

            if(!isValidPassword){
                return res.status(401).json({
                    error: 'Invalid password'
                });
            }

            const token = jwt.sign(
                {userId: user.id, email: user.email, role: user.role},
                process.env.JWT_SECRET!,
                {expiresIn: '7d'}
            );
            res.json({
                message: 'Login successful',
                token,
                user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role
                }
            });
        } catch(error){
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    },
    async getProfile(req: Request, res: Response) {
        try {
        const userId = (req as any).user.userId;
        
        const user = await UserModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
        } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
        }
    }
};