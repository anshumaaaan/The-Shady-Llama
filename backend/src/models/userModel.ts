import { hash } from "crypto";
import sql from "../config/database";
import bcrypt from 'bcrypt';

export interface User {
    id: number;
    email: string;
    password: string;
    full_name: string;
    role: string;
    created_at: Date;
}

export const UserModel = {
    async create(email: string, password: string, fullName: string){
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await sql`
            INSERT INTO users(email, password, full_name, role)
            VALUES (${email}, ${hashedPassword}, ${fullName}, 'customer')
            RETURNING id, email, full_name, role, created_at
        `;

        return result[0];
    },

    async findByEmail(email : string){
        const result = await sql`
            SELECT * FROM users WHERE email = ${email}
        `;
        return result[0];
    },
    async findById(id:number){
        const result = await sql`
            SELECT id, email, full_name, role, created_at
            FROM users
            WHERE id = ${id}
        `;
        return result[0];
    },

    async verifyPassword(plainPassword: string, hashedPassword: string){
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
};