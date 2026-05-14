import { Router } from 'express';
import { extractUser } from '../middleware/auth.js';
import { submitResponse, getAnalytics } from './controller.js';
import { requireAuth } from '../middleware/auth.js';

export const responseRouter = Router({ mergeParams: true });

// POST /api/polls/:pollId/responses  — submit a response
// extractUser tries to get user but doesn't block (anonymous polls allowed)
responseRouter.post('/', extractUser(), submitResponse);

// GET /api/polls/:pollId/analytics  — creator or public (if published)
responseRouter.get('/analytics', extractUser(), getAnalytics);
