import { z } from 'zod';
import { Poll } from '../poll/model.js';
import { Response } from './model.js';

// ─── Validation ───────────────────────────────────────────────────────────────
const answerSchema = z.object({
    questionId: z.string().min(1),
    optionId:   z.string().min(1),
});

const submitSchema = z.object({
    answers: z.array(answerSchema).min(1, 'At least one answer required'),
});

// ─── Submit Response ──────────────────────────────────────────────────────────
export async function submitResponse(req, res) {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    // Expiry check
    if (poll.expiresAt < new Date()) {
        return res.status(410).json({ message: 'This poll has expired and is no longer accepting responses' });
    }

    // Auth check — if poll is NOT anonymous, user must be logged in
    if (!poll.isAnonymous && !req.user) {
        return res.status(401).json({ message: 'This poll requires authentication to respond' });
    }

    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Validation failed', errors: parsed.error.issues });
    }

    const { answers } = parsed.data;

    // Mandatory question validation
    const mandatoryQuestions = poll.questions.filter(q => q.isMandatory);
    const answeredQuestionIds = answers.map(a => a.questionId);

    for (const mq of mandatoryQuestions) {
        if (!answeredQuestionIds.includes(mq._id.toString())) {
            return res.status(400).json({
                message: `Question "${mq.text}" is mandatory and must be answered`,
            });
        }
    }

    // Validate each answer — questionId and optionId must exist in poll
    for (const answer of answers) {
        const question = poll.questions.find(q => q._id.toString() === answer.questionId);
        if (!question) {
            return res.status(400).json({ message: `Invalid questionId: ${answer.questionId}` });
        }
        const option = question.options.find(o => o._id.toString() === answer.optionId);
        if (!option) {
            return res.status(400).json({ message: `Invalid optionId: ${answer.optionId} for question: ${question.text}` });
        }
    }

    const respondentId = poll.isAnonymous ? null : req.user?.id ?? null;

    // Duplicate response check for authenticated polls
    if (respondentId) {
        const existing = await Response.findOne({ pollId: poll._id, respondentId });
        if (existing) {
            return res.status(409).json({ message: 'You have already responded to this poll' });
        }
    }

    const response = await Response.create({
        pollId: poll._id,
        respondentId,
        answers,
    });

    // Increment total responses counter
    await Poll.findByIdAndUpdate(poll._id, { $inc: { totalResponses: 1 } });

    // Emit real-time update via Socket.io (attached to app)
    const io = req.app.get('io');
    if (io) {
        // Get fresh analytics and broadcast to poll room
        const analytics = await buildAnalytics(poll._id.toString());
        io.to(`poll:${poll._id}`).emit('analytics:update', analytics);
    }

    return res.status(201).json({ message: 'Response submitted successfully', data: { id: response._id } });
}

// ─── Analytics Builder ────────────────────────────────────────────────────────
export async function buildAnalytics(pollId) {
    const poll = await Poll.findById(pollId);
    if (!poll) return null;

    const responses = await Response.find({ pollId });
    const totalResponses = responses.length;

    const questionSummaries = poll.questions.map(question => {
        const optionCounts = question.options.map(option => {
            const count = responses.filter(r =>
                r.answers.some(
                    a =>
                        a.questionId.toString() === question._id.toString() &&
                        a.optionId.toString() === option._id.toString()
                )
            ).length;

            return {
                optionId:   option._id,
                optionText: option.text,
                count,
                percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0,
            };
        });

        const answeredCount = responses.filter(r =>
            r.answers.some(a => a.questionId.toString() === question._id.toString())
        ).length;

        return {
            questionId:    question._id,
            questionText:  question.text,
            isMandatory:   question.isMandatory,
            answeredCount,
            skippedCount:  totalResponses - answeredCount,
            options:       optionCounts,
        };
    });

    return {
        pollId,
        title:          poll.title,
        totalResponses,
        isAnonymous:    poll.isAnonymous,
        isPublished:    poll.isPublished,
        expiresAt:      poll.expiresAt,
        isExpired:      poll.expiresAt < new Date(),
        questionSummaries,
    };
}

// GET /api/polls/:pollId/analytics
// - Creator: always allowed
// - Public: only if poll is published
export async function getAnalytics(req, res) {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    const isCreator = req.user && poll.creatorId === req.user.id;

    if (!isCreator && !poll.isPublished) {
        return res.status(403).json({ message: 'Analytics not available until results are published' });
    }

    const analytics = await buildAnalytics(req.params.pollId);
    return res.json({ data: analytics });
}
