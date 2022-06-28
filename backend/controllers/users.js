const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { checkBadData } = require('../utils/errors');
const ValidationError = require('../utils/ValidationError');
const UsedEmail = require('../utils/UsedEmail');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => checkBadData(users, res))
    .catch((err) => next(err));
};

module.exports.getUser = (req, res, next) => {
  const { id } = req.params;
  User.findById(id)
    .then((user) => checkBadData(user, res))
    .catch((err) => next(err));
};

module.exports.getUserSelf = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .then((user) => checkBadData(user, res))
    .catch((err) => next(err));
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!email) {
        const err = new ValidationError('Email не может быть пустым');
        return next(err);
      }
      if (user) {
        const err = new UsedEmail('Пользователь с таким email уже есть!');
        return next(err);
      }

      return bcrypt.hash(password, 5).then((hash) => User.create({
        name, about, avatar, email, password: hash,
      }))
        .then((userInfo) => {
          const newUserInfo = {
            name: userInfo.name,
            about: userInfo.about,
            avatar: userInfo.avatar,
            _id: userInfo._id,
            email: userInfo.email,
          };
          checkBadData(newUserInfo, res);
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

module.exports.patchUserInfo = (req, res, next) => {
  const { _id } = req.user;
  const { name, about } = req.body;
  User.findByIdAndUpdate(_id, { $set: { name, about } }, { new: true, runValidators: true })
    .then((userInfo) => checkBadData(userInfo, res))
    .catch((err) => next(err));
};

module.exports.patchAvatar = (req, res, next) => {
  const { _id } = req.user;
  const { avatar } = req.body;
  User.findByIdAndUpdate(_id, { $set: { avatar } }, { new: true, runValidators: true })
    .then((userAvatar) => checkBadData(userAvatar, res))
    .catch((err) => next(err));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email или пароль не могут быть пустыми');
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      const { name, userEmail, avatar } = user;

      return res.send({
        name, userEmail, avatar, token,
      });
    })
    .catch((err) => next(err));
};
