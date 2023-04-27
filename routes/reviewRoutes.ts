import express from 'express';
import { authenticateUser, authorizePermissions } from '../middlewares/authentication';

import { createReview, getAllReviews, getSingleReview, updateReview, deleteReview } from '../controllers/reviewController';
import { Role } from '../utils';

const router = express.Router();

router.route('/').post(authenticateUser, createReview).get(getAllReviews);

router.route('/:id').get(getSingleReview).patch(authenticateUser, updateReview).delete(authenticateUser, deleteReview);

export default router;
