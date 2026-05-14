import { Router } from 'express';
import { extractUser, requireAuth } from '../middleware/auth.js';
import {
    createPoll,
    getMyPolls,
    getPollById,
    publishPoll,
    deletePoll,
} from './controller.js';

export const pollRouter = Router();

// Public — anyone can view a poll (to respond or see results)
pollRouter.get('/:id', extractUser(), getPollById);

// Protected — must be logged in
pollRouter.use(extractUser(), requireAuth());

pollRouter.post('/',          createPoll);
pollRouter.get('/',           getMyPolls);
pollRouter.patch('/:id/publish', publishPoll);
pollRouter.delete('/:id',    deletePoll);
