class UsedEmail extends Error {
  constructor(message) {
    super(message);
    this.name = 'UsedEmail';
  }
}

module.exports = UsedEmail;
