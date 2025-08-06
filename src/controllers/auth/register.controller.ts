import type { RequestHandler } from 'express';

const register: RequestHandler = (req, res, next) => {
  res.send('OK');
};

export default register;
