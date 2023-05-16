import express from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';

import {
  createAddress,
  getAllAddresses,
  getSingleAddress,
  updateAddress,
  deleteAddress,
  getCurrentUserAddresses,
} from '../controllers/addressController';
import { Role } from '../utils';

const router = express.Router();

router
  .route('/')
  .post(authenticateUser, createAddress)
  .get(authenticateUser, authorizePermissions('admin'), getAllAddresses);

router
  .route('/showAllMyAddresses')
  .get(authenticateUser, getCurrentUserAddresses);

router
  .route('/:id')
  .get(getSingleAddress)
  .patch(authenticateUser, updateAddress)
  .delete(authenticateUser, deleteAddress);

export default router;
