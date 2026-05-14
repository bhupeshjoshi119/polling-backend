import mongoose from 'mongoose';

// ─── Option Schema ────────────────────────────────────────────────────────────
const optionSchema = new mongoose.Schema({
    text: { type: String, required: true, trim: true },
}, { _id: true });

// ─── Question Schema ──────────────────────────────────────────────────────────
const questionSchema = new mongoose.Schema({
    text:       { type: String, required: true, trim: true },
    options:    { type: [optionSchema], required: true, validate: v => v.length >= 2 },
    isMandatory:{ type: Boolean, default: true },
}, { _id: true });

// ─── Poll Schema ──────────────────────────────────────────────────────────────
const pollSchema = new mongoose.Schema({
    title:          { type: String, required: true, trim: true },
    description:    { type: String, default: '', trim: true },
    creatorId:      { type: String, required: true },   // userId from auth-service JWT
    questions:      { type: [questionSchema], required: true, validate: v => v.length >= 1 },
    isAnonymous:    { type: Boolean, default: false },  // true = anyone can respond without login
    expiresAt:      { type: Date, required: true },
    isPublished:    { type: Boolean, default: false },  // results published publicly
    isActive:       { type: Boolean, default: true },   // false after expiry
    totalResponses: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-deactivate expired polls on read
pollSchema.methods.checkExpiry = function () {
    if (this.isActive && this.expiresAt < new Date()) {
        this.isActive = false;
    }
    return this;
};

export const Poll = mongoose.model('Poll', pollSchema);
