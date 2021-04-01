const book = require('./books');
const user = require('./users');
const auth = require('./auth');

module.exports = {
    ...book,
    ...user,
    ...auth
}