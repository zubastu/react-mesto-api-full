const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const routeUsers = require('./routes/users');

const routeCards = require('./routes/cards');

const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const { errorProcessing } = require('./utils/errors');

const allowedCors = [
  'https://praktikum.tk',
  'http://praktikum.tk',
  'localhost:3000',
];

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const { method } = req; // Сохраняем тип запроса (HTTP-метод) в соответствующую переменную
  const { origin } = req.headers; // Сохраняем источник запроса в переменную origin

  // Значение для заголовка Access-Control-Allow-Methods по умолчанию (разрешены все типы запросов)
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

  // Если это предварительный запрос, добавляем нужные заголовки
  if (method === 'OPTIONS') {
    // разрешаем кросс-доменные запросы любых типов (по умолчанию)
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
  }
  // проверяем, что источник запроса есть среди разрешённых
  if (allowedCors.includes(origin)) {
    // устанавливаем заголовок, который разрешает браузеру запросы с этого источника
    res.header('Access-Control-Allow-Origin', origin);
  }
  // сохраняем список заголовков исходного запроса
  const requestHeaders = req.headers['access-control-request-headers'];
  if (method === 'OPTIONS') {
    // разрешаем кросс-доменные запросы с этими заголовками
    res.header('Access-Control-Allow-Headers', requestHeaders);
    // завершаем обработку запроса и возвращаем результат клиенту
    return res.end();
  }
  return next();
});

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    avatar: Joi.string().pattern(/^https?:\/\/(www\.)?[a-zA-Z\d-]+\.[\w\d\-.~:/?#[\]@!$&'()*+,;=]{2,}#?$/),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), createUser);

app.use(auth);

app.use('/users', routeUsers);

app.use('/cards', routeCards);

app.use((req, res) => res.status(404).send({ message: 'Не найдено' }));

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  next(errorProcessing(err, res));
});

mongoose.connect('mongodb://localhost:27017/mestodb', { useNewUrlParser: true, family: 4 })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App started on ${PORT} port`);
    });
  }).catch((e) => console.log(e));
