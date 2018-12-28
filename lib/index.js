const fs = require("fs");
const pointer = require('json-pointer');
const Ajv = require('ajv');

let deps;
let schemas = {};
let schArr = [];

function getAjv() {
  var ajv = new Ajv({schemaId: 'id'}); // options can be passed, e.g. {allErrors: true}
  var metaSchema = require('ajv/lib/refs/json-schema-draft-04.json');
  ajv.addMetaSchema(metaSchema);
  ajv._opts.defaultMeta = metaSchema.id;
  ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';
  return ajv
}

function updateSchemaDataDependencies(data) {
  for(const dep in deps) {
    let fragment = {}
    if(pointer.has(data, dep)) {
      fragment = pointer.get(data, dep)
    }
    const schemaHoles = deps[dep]
    schemaHoles.forEach(hole => hole[0] = fragment)
  }
}

// Updates the given schemas with holes for dependencies
// And returns a map for the dependencies
function extractAllDependencies(schemas) {
  let deps = {}
  if(Array.isArray(schemas)) {
    for (let i=0; i<schemas.length; i++) {
      schemas[i] = extractDependencies(schemas[i], deps)
    }
  } else if(typeof(schemas) === 'object') {
    for (const key in schemas) {
      schemas[key] = extractDependencies(schemas[key], deps)
    }
  } else {
    throw new TypeError("")
  }
  return deps
}

// Returns an updated version of the schema
function extractDependencies(schema, deps) {
  if (typeof (schema) === 'object') {
    for(key in schema) {
      const val = schema[key]
      schema[key] = extractDependencies(val, deps)
    }

    if("definitions" in schema
      && "$dependent_schema" in schema["definitions"]
      && "enum" in schema["definitions"]["$dependent_schema"]
      && (Array.isArray(schema["definitions"]["$dependent_schema"]["enum"]))
      && (typeof (schema["definitions"]["$dependent_schema"]["enum"][0]) === "string")) {
        const ref = schema["definitions"]["$dependent_schema"]["enum"][0]
        const extraSchema = {}
        const combinedSchemas = [
          extraSchema,
          schema
        ]
        const allSchema = ({
          "allOf": combinedSchemas
        })
        addDep(deps, ref, combinedSchemas)
        // if(exampleObjectMaps.has(schema)) {
        //   exampleObjectMaps.set(schema, allSchema)
        // }
        return allSchema
      } else {
        return schema
      }
  } else {
    return schema
  }
}

function addDep(deps, ref, extraSchema) {
  let dep = deps[ref]
  if(typeof(dep) === 'undefined') {
    dep = []
    deps[ref] = dep
  }
  dep.push(extraSchema)
}

exports.validate = function(topSchemaId, schemasFolder, jsonData) {

  deps = {};
  schemas = {};
  schArr = [];

  // First load the data in
  fs.readdirSync(schemasFolder).forEach(file => {
    const dataContent = fs.readFileSync(schemasFolder + "/" + file);
    schemas[file] = JSON.parse(dataContent.toString());
  });

  for(const schemaKey in schemas) {
    schArr.push(schemas[schemaKey]);
  }

  deps = extractAllDependencies(schemas)

  let ajv = getAjv();
  updateSchemaDataDependencies(jsonData)
  ajv.addSchema(schArr);
  const validate = ajv.getSchema(topSchemaId);
  var valid = validate(jsonData);

  return valid;

}
