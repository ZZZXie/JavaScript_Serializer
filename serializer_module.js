// *************************************
//           Helper Functions
// *************************************

function isNativeFunction(func){
    if (/\{\s+\[native code\]/.test( Function.prototype.toString.call(func))) {
        return true;
    }
    else {
        return false;
    }
}

function stringifyPrimitiveBuiltIn(obj) {
  // If the value is null
  if (obj === null)
    return "null";

  if (obj === undefined)
    return "undefined";
    
  if (obj instanceof RegExp)
    return obj.toString();
    
    return obj.toString();
}

function parsePrimitiveBuiltIn(str) {
  return eval(str);
}

// Stringify Functions use: JSONfn.stringify and JSONfn.parse

function stringifyDate(obj) {
  return obj.toJSON();
}

function parseDate(str) {
  return new Date(str);
}

//https://stackoverflow.com/questions/7650071/is-there-a-way-to-create-a-function-from-a-string-with-javascript
function parseFunction(str) {
  return new Function("return " + str)();
}


// *************************************
// Serialization objects into stringifiable format
// *************************************

function objSerializeNumber(value, objCopy, name) {
  if (value[name] === Infinity) {
    objCopy[name] = "";
    objCopy["_MemberVarTypes"][name] = "infinity";
  }
  if (value[name] === NaN) {
    objCopy[name] = "";
    objCopy["_MemberVarTypes"][name] = "nan";
  }
  // Do nothing
  objCopy[name] = value[name];
}

function objSerializeString(value, objCopy, name) {
  // cache the type string for this variable
  objCopy[name] = value[name];
}

function objSerializeUndefined(value, objCopy, name) {
  // Primitive but needs to get converted to string
  objCopy[name] = stringifyPrimitiveBuiltIn(value[name]);
  objCopy["_MemberVarTypes"][name] = "undefined";
}

function objSerializeNull(value, objCopy, name) {
  objCopy[name] = stringifyPrimitiveBuiltIn(value[name]);
  objCopy["_MemberVarTypes"][name] = "null";
}

function objSerializeBool(value, objCopy, name) {
  objCopy[name] = value[name];
}

function objSerializeRegExp(value, objCopy, name) {
  // pattern, and modifiers
  // All Regex object have 2 main parts: Pattern and Modifiers. /pattern/modifiers
  //The pattern can be extracted by calling this.source
  //There are 3 types of modifiers i, m, g, corresponding to 3 properties: ignoreCase, multiline, global
  // Example: var patt = /w3schools/i
  // Obtain: {"p":"w3schools","m":"i"}
  objCopy[name] = {"p": value[name].source, "m": ((value[name].global ? "g" : "") + (value[name].ignoreCase ? "i" : "") + (value[name].multiline ? "m" : ""))};
  objCopy["_MemberVarTypes"][name] = "regex";

  // For reconstruct: new RegExp(pattern, modifier);
}

function objSerializeDate(value, objCopy, name) {
  objCopy[name] = stringifyDate(value[name]);
  objCopy["_MemberVarTypes"][name] = "date";
}

function objSerializeArray(value, objCopy, name) {
  objCopy[name] = {}
  objSerializeKeys(value[name], objCopy[name]);
  objCopy["_MemberVarTypes"][name] = "array";
}

function objSerializeFunction(value, objCopy, name) {
  // NOTE: This stringification of function will not work with closures!
  if (isNativeFunction(value[name])) {
    // I assume this native function leaves in window object
    // So that the connection can be rebuilt by the function name
    objCopy[name] = value[name].name;
    objCopy["_MemberVarTypes"][name] = "native function";
  }
  else {
    objCopy[name] = {};
    objCopy[name]["func_str"] = value[name].toString();
    objCopy[name]["keys"] = {};
    objCopy["_MemberVarTypes"][name] = "function";
    var func_keys = Object.keys(value[name]);
    if (func_keys.length > 0) {
      objSerializeKeys(value[name], objCopy[name]["keys"]);
    }
  } 
}

function objSerializeKeys(value, objCopy) {
  // Loop through all keys in this object
  var keys = Object.keys(value);
  for (var name in keys) {
    if (value.hasOwnProperty(name)){
      // Get the type of this value[name]
      var objectName = Object.prototype.toString(value[name]);
      // console.log(objectName.substring(8, objectName.length - 1));
      switch (objectName.substring(8, objectName.length - 1)) {
        case "Number":
          objSerializeNumber(value, objCopy, name);
          break;

        case "String":
          objSerializeString(value, objCopy, name);
          break;

        case "Undefined":
          // Primitive but needs to get converted to string
          objSerializeUndefined(value, objCopy, name);
          break;

        case "Null":
          objSerializeNull(value, objCopy, name);
          break;

        case "Boolean":
          objSerializeBool(value, objCopy, name);
          break;

        case "Function":
          objSerializeFunction(value, objCopy, name);
          break;

        case "RegExp":
          objSerializeRegExp(value, objCopy, name);
          break;

        case "Date":
          objSerializeDate(value, objCopy, name);
          break;

        case "Object":
          objCopy[name] = {};
          objCopy["_MemberVarTypes"][name] = "object";
          objSerializeObject(value[name], objCopy[name]);
          break;

        case "Array":
          // for array, loop through values, and handle non-stringifiable objects, etc
          objSerializeArray(value, objCopy, name);
          break;

        default:
          // This should be unconsidered cases and needs further research
          objCopy[name] = objectName;
          break;
      }
    }
  }
}

function objSerializeObject(value, objCopy) {
  objCopy["_MemberVarTypes"] = {};
  // https://nullprogram.com/blog/2013/03/11/
  // Check if this object is Object prototype
  if (value.constructor === Object.prototype.constructor) {
    objCopy["#"] = Object.prototype.constructor.name;
  }
  // Function is native function and also present in window object
  else if (value.constructor.name in window && isNativeFunction(value.constructor)) {
    objCopy["#"] = Object.prototype.constructor.name;
  }
  // Here assume the other case is function is 
  else {
    objCopy["#"] = {};
    objCopy["#"]["func_str"] = value.constructor.toString();
    objCopy["#"]["keys"] = {};
    var func_keys = Object.keys(value.constructor);
    if (func_keys.length > 0) {
      objSerializeKeys(value[name], objCopy["#"]["keys"]);
    }
  }
  // Serialize all keys in this object
  objSerializeKeys(value, objCopy);
}


//************************************************//
//   Convert parsed object back to original form
//   Deserialization
//************************************************//




