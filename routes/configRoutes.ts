import express from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';

import {
  createConfig,
  getAllConfigs,
  getSingleConfig,
  updateConfig,
  deleteConfig,
} from '../controllers/configController';
import { Role } from '../utils';

const router = express.Router();

router
  .route('/')
  .post([authenticateUser, authorizePermissions(Role.Admin)], createConfig)
  .get(getAllConfigs);

router
  .route('/:id')
  .all([authenticateUser, authorizePermissions(Role.Admin)])
  .get(getSingleConfig)
  .patch(updateConfig)
  .delete(deleteConfig);

export default router;
