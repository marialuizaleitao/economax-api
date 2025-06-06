import { Router } from 'express';
import {
  createLimit,
  getLimits,
  updateLimit,
  deleteLimit
} from '../controllers/limitController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createLimit);
router.get('/', getLimits);
router.put('/:id', updateLimit);
router.delete('/:id', deleteLimit);

export default router;