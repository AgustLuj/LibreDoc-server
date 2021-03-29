const book = require('./books');
const user = require('./users');

module.exports = {
    ...book,
    ...user
}