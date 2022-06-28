const NotFoundErr = require('./NotFound');
const WrongPassword = require('./WrongPassword');

const BAD_REQ = 400;
const WRONG_PASS_OR_EMAIL = 401;
const AUTH_REQ = 401;
const WRONG_OWNER = 403;
const NOT_FOUND = 404;
const REGISTRATION_WITH_USED_EMAIL = 409;
const DEFAULT_ERROR_CODE = 500;

module.exports.errorProcessing = (err, res) => {
  switch (err.name) {
    case 'ValidationError':
      return res.status(BAD_REQ).send({ message: `Ошибка передачи данных, все поля должны быть заполнены корректно: ${err.message}` });
    case 'BadRequest':
      return res.status(BAD_REQ).send({ message: `Не найдено по входным данным: ${err.message}` });
    case 'CastError':
      return res.status(BAD_REQ).send({ message: `Не найдено по входным данным: ${err.message}` });
    case 'WrongPassword':
      return res.status(WRONG_PASS_OR_EMAIL).send({ message: `Не найдено по входным данным: ${err.message}` });
    case 'AuthorizationRequired':
      return res.status(AUTH_REQ).send({ message: `Ошибка: ${err.message}` });
    case 'WrongOwner':
      return res.status(WRONG_OWNER).send({ message: `Ошибка: ${err.message}` });
    case 'NotFound':
      return res.status(NOT_FOUND).send({ message: `Не найдено по входным данным: ${err.message}` });
    case 'UsedEmail':
      return res.status(REGISTRATION_WITH_USED_EMAIL).send({ message: `Ошибка: ${err.message}` });
    default:
      return res.status(DEFAULT_ERROR_CODE).send({ message: err.message });
  }
};

module.exports.checkBadData = (data, res) => {
  if (!data) {
    throw new NotFoundErr('Не найдено');
  }
  return res.send({ data });
};

module.exports.checkUser = (data, res) => {
  if (!data) {
    throw new WrongPassword('Неправильная почта или пароль');
  }
  return res.send({ data });
};
