class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WrongPassword';
  }
}

module.exports = ValidationError;
