import type { RequestHandler } from 'express';

const login: RequestHandler = (req, res, next) => {
  res.send('OK');
};

export default login;
