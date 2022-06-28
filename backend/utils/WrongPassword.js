class WrongPassword extends Error {
  constructor(message) {
    super(message);
    this.name = 'WrongPassword';
  }
}

module.exports = WrongPassword;
