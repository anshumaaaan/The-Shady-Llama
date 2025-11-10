import sql from "../config/database";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin(){
    try{
        const email = 'admin@example.com';
        const password = 'admin123';
        const fullName = 'Admin User';

        const hashedPassword = await bcrypt.hash(password, 10);
    
        const result = await sql`
            INSERT INTO users (email, password, full_name, role)
            VALUES (${email}, ${hashedPassword}, ${fullName}, 'admin')
            ON CONFLICT (email) DO NOTHING
            RETURNING id, email, full_name, role
        `;
        
        if (result.length > 0) {
            console.log('Admin created successfully');
            console.log('Email:', email);
            console.log('Password:', password);
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

createAdmin();