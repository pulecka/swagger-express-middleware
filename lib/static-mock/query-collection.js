'use strict';

module.exports = {
  GET: queryCollection,
  HEAD: queryCollection,
  OPTIONS: queryCollection
};

var _    = require('lodash'),
    util = require('../helpers/util'),
    exampleResponse = require('./example-response');

/**
 * Returns an array of all resources in the collection.
 * If there are no resources, then an empty array is returned.  No 404 error is thrown.
 *
 * If the Swagger API includes "query" parameters, they can be used to filter the results.
 * Deep property names are allowed (e.g. "?address.city=New+York").
 * Query string params that are not defined in the Swagger API are ignored.
 *
 * @param   {Request}   req
 * @param   {Response}  res
 * @param   {function}  next
 */
function queryCollection(req, res, next) {
  var example = exampleResponse(req, res.swagger, []);
  var filtered = filter(example, req);

  res.swagger.lastModified = new Date();
  res.body = res.body || filtered;

  next();
}


/**
 * Filters the given {@link Resource} array, using the "query" params defined in the Swagger API.
 *
 * @param   {Resource[]}    resources
 * @param   {Request}       req
 * @returns {Resource[]}
 */
function filter(resources, req) {
  util.debug('There are %d resources in %s', resources.length, req.path);

  if (resources.length > 0) {
    // If there are query params, then filter the collection by them
    var queryParams = _.where(req.swagger.params, {in: 'query'});
    if (queryParams.length > 0) {
      // Build the filter object
      var filterCriteria = {data: {}};
      queryParams.forEach(function(param) {
        if (req.query[param.name] !== undefined) {
          setDeepProperty(filterCriteria.data, param.name, req.query[param.name]);
        }
      });

      if (!_.isEmpty(filterCriteria.data)) {
        // Filter the collection
        util.debug('Filtering resources by %j', filterCriteria.data);
        resources = _.where(resources, filterCriteria);
        util.debug('%d resources matched the filter criteria', resources.length);
      }
    }
  }

  return resources;
}

/**
 * Sets a deep property of the given object.
 *
 * @param   {object}    obj       - The object whose property is to be set.
 * @param   {string}    propName  - The deep property name (e.g. "Vet.Address.State")
 * @param   {*}         propValue - The value to set
 */
function setDeepProperty(obj, propName, propValue) {
  propName = propName.split('.');
  for (var i = 0; i < propName.length - 1; i++) {
    obj = obj[propName[i]] = obj[propName[i]] || {};
  }
  obj[propName[propName.length - 1]] = propValue;
}
