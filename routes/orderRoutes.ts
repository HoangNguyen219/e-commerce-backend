import express from 'express';
const router = express.Router();
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';

import {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  showStats,
} from '../controllers/orderController';

router
  .route('/')
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders);

router.route('/showAllMyOrders').get(authenticateUser, getCurrentUserOrders);
router
  .route('/stats')
  .get(authenticateUser, authorizePermissions('admin'), showStats);
router
  .route('/:id')
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

export default router;
