import { Schema, model } from "mongoose";

const expenseSchema = new Schema({
    category: {
        type: String,
        trim: true,
        lowercase: true,
        default: 'uncategorized'
    },
    itemName: {
        type: String,
        trim: true, 
        lowercase: true,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

})

export const Expense = model('Expense', expenseSchema);