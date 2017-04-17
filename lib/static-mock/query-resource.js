'use strict';

module.exports = {
  GET: queryResource,
  HEAD: queryResource,
  OPTIONS: queryResource
};

var util     = require('../helpers/util'),
    ono      = require('ono'),
    exampleResponse = require('./example-response');

/**
 * Returns the REST resource at the URL.
 * If there's no resource that matches the URL, then a 404 error is returned.
 *
 * @param   {Request}   req
 * @param   {Response}  res
 * @param   {function}  next
 */
function queryResource(req, res, next) {
  var example = exampleResponse(req, res.swagger, null);
  if (example) {
    res.swagger.lastModified = new Date();
    res.body = res.body || example
    next();
  } else {
    util.debug('ERROR! 404 - %s %s does not exist', req.method, req.path);
    err = ono({status: 404}, '%s Not Found', resource.toString());
    next(err);
  }
}
