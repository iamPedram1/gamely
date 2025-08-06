import express from 'express';

// Controllers
import login from 'controllers/auth/login.controller';

const router = express.Router();

router.post('/', login);

export default router;
