import mongoose from "mongoose";
import express from "express";
import { User } from './mongoose/schemas/users.mjs';
import { Expense } from './mongoose/schemas/expense.mjs';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { verifyToken } from "./middleware/verifyToken.mjs";
import bcrypt from 'bcrypt';

dotenv.config()

const app = express();
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log('Error connecting to MongoDB: ', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//signup route
app.post("/api/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const findUser = await User.findOne({ username });
        if (findUser) return res.status(400).json({ message: 'User already exists' });
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//login route
app.post("/api/login", async (req, res) => {
    try{
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: 'Invalid password' });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//expense route
app.post("/api/expense", verifyToken, async(req, res)=>{
    try{
        const { category, itemName, amount } = req.body;
        const newExpense = new Expense({
            category,
            itemName, 
            amount,
            userId: req.user.id
        });
        await newExpense.save()
        res.status(201).json({ message: 'New expense created successfully'});
    }catch(err){
        console.error('Error during insertion: ', err);
        res.status(500).json({ message: 'internal server error'});
    }
});

//expense display route
app.get("/api/expense", verifyToken, async(req, res)=>{
    try{
        const expenses = await Expense.find({ userId: req.user.id });
        if(!expenses) return res.status(404).json({ message: 'No expense found'});
        res.status(200).json({expenses});

    }catch(err){
        console.error('Error during protected route access:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});




