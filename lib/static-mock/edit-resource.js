'use strict';

var exampleResponse = require('./example-response');

module.exports = {
  POST: editResource,
  PATCH: editResource,
  PUT: editResource,
  DELETE: editResource
};

/**
 * Returns a function that sends the correct response for the operation.
 *
 * @param   {Request}   req
 * @param   {Response}  res
 * @param   {function}  next
 */
function editResource(req, res, next) {
  var example = exampleResponse(req, res.swagger, res.swagger.isCollection ? [] : null);

  res.swagger.lastModified = new Date();
  res.body = res.body || example;

  next();
}
