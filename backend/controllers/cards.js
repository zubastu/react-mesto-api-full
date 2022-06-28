const Card = require('../models/card');
const { checkBadData } = require('../utils/errors');
const WrongOwner = require('../utils/WrongOwner');
const NotFoundErr = require('../utils/NotFound');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => checkBadData(cards, res))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const { _id } = req.user;
  Card.create({ name, link, owner: _id })
    .then((card) => checkBadData(card, res))
    .catch((err) => next(err));
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const { _id } = req.user;
  Card.findById(cardId).then((card) => {
    if (!card) {
      throw new NotFoundErr('Не найдено');
    }
    if (card.owner.toString() !== _id) {
      throw new WrongOwner('Чтобы удалить карточку необходимо быть ее создателем');
    }
    return card;
  }).then((selectedCard) => {
    Card.deleteOne({ _id: selectedCard._id })
      .then(() => res.send({ message: 'Успешно' }))
      .catch((err) => next(err));
  })
    .catch((err) => next(err));
};

module.exports.likeCard = (req, res, next) => {
  const { _id } = req.user;
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: _id } }, { new: true, runValidators: true })
    .then((card) => checkBadData(card, res))
    .catch((err) => next(err));
};

module.exports.dislikeCard = (req, res, next) => {
  const { _id } = req.user;
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $pull: { likes: _id } }, { new: true, runValidators: true })
    .then((card) => checkBadData(card, res))
    .catch((err) => next(err));
};
