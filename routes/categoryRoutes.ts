import express from 'express';
import { authenticateUser, authorizePermissions } from '../middlewares/authentication';

import { createCategory, getAllCategories, getSingleCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { Role } from '../utils';

const router = express.Router();

router
  .route('/')
  .post([authenticateUser, authorizePermissions(Role.Admin)], createCategory)
  .get(getAllCategories);

router
  .route('/:id')
  .get(getSingleCategory)
  .patch([authenticateUser, authorizePermissions(Role.Admin)], updateCategory)
  .delete([authenticateUser, authorizePermissions(Role.Admin)], deleteCategory);

export default router;
