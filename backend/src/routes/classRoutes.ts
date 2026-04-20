import { Router } from 'express';
import { createClass, getTeacherClasses, getClassDetails, getTeacherStats } from '../controllers/classController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', createClass);
router.get('/teacher/stats', getTeacherStats);
router.get('/teacher', getTeacherClasses);
router.get('/:id', getClassDetails);

export default router;
