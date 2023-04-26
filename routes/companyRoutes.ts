import express from 'express';
import { authenticateUser, authorizePermissions } from '../middlewares/authentication';

import { createCompany, getAllCompanies, getSingleCompany, updateCompany, deleteCompany } from '../controllers/companyController';
import { Role } from '../utils';

const router = express.Router();

router
  .route('/')
  .post([authenticateUser, authorizePermissions(Role.Admin)], createCompany)
  .get(getAllCompanies);

router
  .route('/:id')
  .get(getSingleCompany)
  .patch([authenticateUser, authorizePermissions(Role.Admin)], updateCompany)
  .delete([authenticateUser, authorizePermissions(Role.Admin)], deleteCompany);

export default router;
