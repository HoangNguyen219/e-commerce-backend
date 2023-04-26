import express from 'express';
import { authenticateUser, authorizePermissions } from '../middlewares/authentication';

import { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, uploadImage } from '../controllers/productController';
import { Role } from '../utils';

// import { getSingleProductReviews } from '../controllers/reviewController';

const router = express.Router();

router
  .route('/')
  .post([authenticateUser, authorizePermissions(Role.Admin)], createProduct)
  .get(getAllProducts);

router.route('/uploadImage').post([authenticateUser, authorizePermissions(Role.Admin)], uploadImage);

router
  .route('/:id')
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions(Role.Admin)], updateProduct)
  .delete([authenticateUser, authorizePermissions(Role.Admin)], deleteProduct);

// router.route('/:id/reviews').get(getSingleProductReviews);

export default router;
