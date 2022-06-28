class AuthorizationRequired extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationRequired';
  }
}
module.exports = AuthorizationRequired;
