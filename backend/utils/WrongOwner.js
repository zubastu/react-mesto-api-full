class WrongOwner extends Error {
  constructor(message) {
    super(message);
    this.name = 'WrongOwner';
  }
}

module.exports = WrongOwner;
