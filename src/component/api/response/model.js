import mongoose from 'mongoose';

// ─── Answer Schema ────────────────────────────────────────────────────────────
const answerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    optionId:   { type: mongoose.Schema.Types.ObjectId, required: true },
}, { _id: false });

// ─── Response Schema ──────────────────────────────────────────────────────────
const responseSchema = new mongoose.Schema({
    pollId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
    respondentId:{ type: String, default: null },   // null = anonymous
    answers:     { type: [answerSchema], required: true },
}, { timestamps: true });

// Ek user ek poll mein sirf ek baar respond kar sake (authenticated polls ke liye)
responseSchema.index(
    { pollId: 1, respondentId: 1 },
    { unique: true, partialFilterExpression: { respondentId: { $ne: null } } }
);

export const Response = mongoose.model('Response', responseSchema);
