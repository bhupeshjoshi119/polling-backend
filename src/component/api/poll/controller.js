import { z } from 'zod';
import { Poll } from './model.js';

// ─── Validation Schemas ───────────────────────────────────────────────────────
const optionSchema = z.object({
    text: z.string().min(1, 'Option text required'),
});

const questionSchema = z.object({
    text:        z.string().min(1, 'Question text required'),
    options:     z.array(optionSchema).min(2, 'At least 2 options required'),
    isMandatory: z.boolean().default(true),
});

const createPollSchema = z.object({
    title:       z.string().min(1, 'Title required'),
    description: z.string().optional().default(''),
    questions:   z.array(questionSchema).min(1, 'At least 1 question required'),
    isAnonymous: z.boolean().default(false),
    expiresAt:   z.string().datetime({ message: 'Valid ISO datetime required for expiresAt' }),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isPollExpired(poll) {
    return poll.expiresAt < new Date();
}

// ─── Controller ───────────────────────────────────────────────────────────────

// POST /api/polls  — create a new poll
export async function createPoll(req, res) {
    const parsed = createPollSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Validation failed', errors: parsed.error.issues });
    }

    const { title, description, questions, isAnonymous, expiresAt } = parsed.data;

    const expiryDate = new Date(expiresAt);
    if (expiryDate <= new Date()) {
        return res.status(400).json({ message: 'expiresAt must be in the future' });
    }

    const poll = await Poll.create({
        title,
        description,
        questions,
        isAnonymous,
        expiresAt: expiryDate,
        creatorId: req.user.id,
    });

    return res.status(201).json({ message: 'Poll created', data: poll });
}

// GET /api/polls  — get all polls created by logged-in user
export async function getMyPolls(req, res) {
    const polls = await Poll.find({ creatorId: req.user.id }).sort({ createdAt: -1 });

    // mark expired ones
    const now = new Date();
    const result = polls.map(p => {
        const obj = p.toObject();
        obj.isExpired = p.expiresAt < now;
        return obj;
    });

    return res.json({ data: result });
}

// GET /api/polls/:id  — get single poll (public — for respondents)
export async function getPollById(req, res) {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    const now = new Date();
    const isExpired = poll.expiresAt < now;

    // If poll is published, return full results view
    if (poll.isPublished) {
        return res.json({
            data: {
                ...poll.toObject(),
                isExpired,
                viewMode: 'results',
            },
        });
    }

    // If expired but not published — show expired state
    if (isExpired) {
        return res.json({
            data: {
                _id: poll._id,
                title: poll.title,
                description: poll.description,
                isExpired: true,
                isActive: false,
                viewMode: 'expired',
            },
        });
    }

    // Active poll — return questions for respondent (strip internal fields)
    return res.json({
        data: {
            _id: poll._id,
            title: poll.title,
            description: poll.description,
            questions: poll.questions,
            isAnonymous: poll.isAnonymous,
            expiresAt: poll.expiresAt,
            isExpired: false,
            viewMode: 'respond',
        },
    });
}

// PATCH /api/polls/:id/publish  — publish results (creator only)
export async function publishPoll(req, res) {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    if (poll.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    poll.isPublished = true;
    await poll.save();

    return res.json({ message: 'Poll results published', data: poll });
}

// DELETE /api/polls/:id  — delete poll (creator only)
export async function deletePoll(req, res) {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    if (poll.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    await poll.deleteOne();
    return res.json({ message: 'Poll deleted' });
}
