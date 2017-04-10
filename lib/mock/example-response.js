'use strict';

module.exports = exampleResponse;

/**
 * Returns the defined response example from OpenAPI definition.
 *
 * @param   {Request}   request
 * @param   {Response}  definition
 * @param   {any}  empty
 */
function exampleResponse(request, definition, empty) {
  var accept = request.get('Accept');
  var acceptTypes = accept.split(',').map(function(type) {
    return type.split(';')[0].trim();
  });
  var exampleTypes = Object.keys(definition.examples);
  var contentType = acceptTypes
    .find(function(type) {
      var match = exampleTypes.find(function(exampleType) {
        if (type === '*/*') {
          return true;
        }
        return type === exampleType;
      });
      return !!match;
    });

  if (definition.examples && definition.examples[contentType]) {
    return definition.examples[contentType];
  }

  if (definition.schema) {
    return definition.schema.default || definition.schema.example;
  }

  return empty;
}
