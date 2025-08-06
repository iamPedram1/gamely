import express from 'express';

// Controllers
import register from 'controllers/auth/register.controller';

const router = express.Router();

router.post('/', register);

export default router;
