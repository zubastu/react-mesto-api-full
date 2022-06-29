const jwt = require('jsonwebtoken');
const AuthorizationRequired = require('../utils/WrongPassword');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthorizationRequired('Необходима авторизация');
  }

  const extractBearerToken = (header) => header.replace('Bearer ', '');

  const token = extractBearerToken(authorization);

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some');
  } catch (e) {
    const err = new AuthorizationRequired('Необходима авторизация');
    return next(err);
  }

  req.user = payload;
  return next();
};
