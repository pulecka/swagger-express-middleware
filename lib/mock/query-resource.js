'use strict';

module.exports = {
  GET: queryResource,
  HEAD: queryResource,
  OPTIONS: queryResource
};

var util     = require('../helpers/util'),
    ono      = require('ono'),
    Resource = require('../data-store/resource');

/**
 * Returns the REST resource at the URL.
 * If there's no resource that matches the URL, then a 404 error is returned.
 *
 * @param   {Request}   req
 * @param   {Response}  res
 * @param   {function}  next
 * @param   {DataStore} dataStore
 */
function queryResource(req, res, next, dataStore) {
  var resource = new Resource(req.path);

  dataStore.get(resource, function(err, result) {
    if (err) {
      next(err);
    }
    else if (!result) {
      var defaultValue = getDefaultValue(req, res);

      if (defaultValue === undefined) {
        util.debug('ERROR! 404 - %s %s does not exist', req.method, req.path);
        err = ono({status: 404}, '%s Not Found', resource.toString());
        next(err);
      }
      else {
        // There' a default value, so use it instead of sending a 404
        util.debug(
          '%s %s does not exist, but the response schema defines a fallback value.  So, using the fallback value',
          req.method, req.path
        );
        res.swagger.lastModified = new Date();
        res.body = defaultValue;
        next();
      }
    }
    else {
      res.swagger.lastModified = result.modifiedOn;

      // Set the response body (unless it's already been set by other middleware)
      res.body = res.body || result.data;
      next();
    }
  });
}

/**
 * Returns the default/example value for this request.
 */
function getDefaultValue(req, res) {
  if (res.body) {
    return res.body;
  }
  // Use the default/example value, if there is one
  else if (res.swagger.examples || res.swagger.schema) {
    var accept = req.get('Accept');
    var example = res.swagger.examples ? res.swagger.examples[accept] : null;
    return example || res.swagger.schema.default || res.swagger.schema.example;
  }
}
