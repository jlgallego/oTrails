const { expressjwt: jwtMiddleware } = require('express-jwt');
const JWT_SECRET = process.env.JWT_SECRET
const jwt = require('jsonwebtoken');
const checkJwt  = jwtMiddleware({ secret: JWT_SECRET, algorithms: ['HS256'] });
module.exports = checkJwt;
