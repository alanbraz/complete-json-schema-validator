/**
  * Test script that uses ajv to check all of the files in examples folder against
  *  bundled schema.
  *   Assumes:
  *    - ajv is installed
  *    - everything is run in the root directory, dangerous due to relative pathing
  */

var exampleFolderPath = "./test/examples";
const schemasFolder = "./test/schemas";
const schemasFile = "./test/aimodels.schema.json";
const topSchemaId = "model.schema.json";

const fs = require("fs");
const assert = require('assert');
const AssertionError = require('assert').AssertionError;
const cjsv = require('../lib/index');

let exampleObjectMaps = new Map()

/*
describe('Schemas', function () {
  for(const schemaKey in schemas) {
    it(schemaKey, function () {
      const data = schemas[schemaKey];
      assert(data);
      assert("$id" in data, "Schema does not have an ID");
      assert(data["$id"] === schemaKey, "Schema ID does not match the file name");
    });
  }
  it("Valid", function() {
    const ajv = getAjv()
    const schArr = []
    for(const schemaKey in schemas) {
      schArr.push(schemas[schemaKey]);
    }
    ajv.addSchema(schArr);
    const validate = ajv.getSchema(topSchemaId);
    assert(validate, "Top level schema not found");
  });

  it("Extract dependencies", function() {
    deps = extractAllDependencies(schemas)
    for(const schemaKey in schemas) {
      schArr.push(schemas[schemaKey]);
    }

    // console.log("<Dependencies>")
    // console.log(JSON.stringify(deps))
    // console.log("</Dependencies>")
    // console.log(JSON.stringify(schemas))
  });

});
*/

// First, we validate that everything in the example folder
// Validates according to the schemas
describe('File Examples from Schema directory', function () {
  fs.readdirSync(exampleFolderPath).forEach(file => {
    describe(file, function () {
      it("Conforms to the schema", function () {
        var dataContent = fs.readFileSync(exampleFolderPath + "/" + file);
        let data = JSON.parse(dataContent.toString());
        assert(data, "Invalid JSON");
        var valid = cjsv.validate(topSchemaId, schemasFolder, data);
        if (!valid.valid) console.error(valid.errors);
        assert.equal(valid.valid, !file.startsWith("error"), valid.errors);
      });
    });
  });
});

describe('File Examples from Schema file', function () {
  fs.readdirSync(exampleFolderPath).forEach(file => {
    describe(file, function () {
      it("Conforms to the schema", function () {
        var dataContent = fs.readFileSync(exampleFolderPath + "/" + file);
        let data = JSON.parse(dataContent.toString());
        assert(data, "Invalid JSON");
        var valid = cjsv.validate(topSchemaId, schemasFile, data);
        if (!valid.valid) console.error(valid.errors);
        assert.equal(valid.valid, !file.startsWith("error"), valid.errors);
      });
    });
  });
});

/*
// Next, we go through the all the schemas, and verify
// That all the examples it points to are valid/exist and
// conform to the schema
describe('Embedded Examples', function () {
  for(const schemaKey in schemas) {
    describe(schemaKey, function () {
        verifyExamples(schemas[schemaKey]);
      });
    }
});

function verifyExamples(obj, objPath) {
  // Validate this object's example, if any
  if ("example" in obj) {
    const exampleRef = obj.example;
    if (typeof (exampleRef) === "string") {
      validateExample(obj, exampleRef, objPath);
    }
  }
  // Now, recurse
  for (const key in obj) {
    const val = obj[key];
    if (typeof (val) === 'object') {
      const newPath = objPath ? (objPath) + "." + key : key;
      verifyExamples(val, newPath);
    }
  }
}

function loadJsonRef(jsonUri) {
  const refParts = jsonUri.split('#');
  assert(refParts.length > 0 && refParts.length <= 2, "Not a valid JSON reference");
  const path = refParts[0];
  const buffer = fs.readFileSync(path);
  const full = JSON.parse(buffer.toString());

  if (refParts.length == 1) {
    return [full, full]
  } else {
    return [full, pointer.get(full, refParts[1])]
  }
}

function validateExample(obj, exampleRef, objPath) {
  const actualPath = objPath ? objPath : "the schema";
  exampleObjectMaps.set(obj, obj)
  // in between creating the test cases and running them,
  // we modify the schemas.
  // we use this map to keep track of these updates
  // so that we can test the parent instead of the nested allOf
  describe(actualPath + "[" + exampleRef + "]", function () {
    it("conforms to schema", function () {
      const [full, example] = loadJsonRef(exampleRef);
      assert(example !== undefined, "Invalid JSON Ref");
      // if (obj.id === undefined) {
      //   obj.id = "tmpID" + (objPath ? ("." + objPath) : "");
      // }
      const ajv = getAjvWithSchemas(full)
      const actualObject = exampleObjectMaps.get(obj)
      var validate = ajv.compile(actualObject);
      const valid = validate(example);
      assert(valid, "fails to validate: " + JSON.stringify(validate.errors));
    });
  });
}

*/
