/* Things to note:
1. Use serializeObject() + deserializeObject()
or serializeArray() + deserializeArray() in pair. all other functions are helper functions

2. There are several todo in this code which is due to loss of reference during stringification.
I haven't had time to look into those issues yet

3. This code is not considering if the input is containing cycles and will be handled by JSON.decycle in helper.js
*/

// *************************************
//           Public API
// *************************************
function serialize(obj) {
  var objCopy = {};
  if (obj instanceof Array) {
    serializeArray(obj, objCopy);
  }
  else {
    serializeObject(obj, objCopy);
  }
  return objCopy;
}

function deserialize(obj) {
  var objCopy = {};
  if (obj instanceof Array) {
    objCopy = [];
    deserializeArray(obj, objCopy);
  }
  else {
    deserializeObject(obj, objCopy);
  }
  return objCopy;
}


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

function objSerializeArray(value, objCopy) {
  objSerializeKeys(value, objCopy);
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

// Make sure objCopy["_MemberVarTypes"] = {} is defined
function objSerializeKeys(value, objCopy) {
  // Loop through all keys in this object
  var keys = Object.keys(value);
  for (var name of keys) {
    if (value.hasOwnProperty(name)){
      // Get the type of this value[name]
      var objectName = Object.prototype.toString.call(value[name]);
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
          serializeObject(value[name], objCopy[name]);
          break;

        case "Array":
          // for array, loop through values, and handle non-stringifiable objects, etc
          objCopy[name] = {};
          objCopy["_MemberVarTypes"][name] = "array";
          serializeArray(value[name], objCopy[name]);
          break;

        default:
          // This should be unconsidered cases and needs further research
          objCopy[name] = objectName;
          break;
      }
    }
  }
}

// Make sure objCopy = {} is defined
function serializeObject(value, objCopy) {
  objCopy["_MemberVarTypes"] = {};
  // https://nullprogram.com/blog/2013/03/11/
  // Check if this object is Object prototype
  if (value.constructor === Object.prototype.constructor) {
    objCopy["#"] = Object.prototype.constructor.name;
  }
  // Function is native function and also present in window object
  else if (value.constructor.name in window && isNativeFunction(value.constructor)) {
    objCopy["#"] = value.constructor.name;
  }
  // Here assume the other case is function is 
  else {
    objCopy["#"] = {};
    objCopy["#"]["func_str"] = value.constructor.toString();
    objCopy["#"]["keys"] = {};
    var func_keys = Object.keys(value.constructor);
    if (func_keys.length > 0) {
      objCopy["#"]["keys"]["_MemberVarTypes"] = {};
      objSerializeKeys(value[name], objCopy["#"]["keys"]);
    }
  }
  // Serialize all keys in this object
  objSerializeKeys(value, objCopy);
}

// Make sure objCopy = {} is defined
function serializeArray(value, objCopy) {
  objCopy["_MemberVarTypes"] = {};
  objSerializeArray(value, objCopy);
}


//************************************************//
//   Convert parsed object back to original form
//   Deserialization
//************************************************//


function objDeserializeRegex(value, objCopy) {
  // pattern + modifiers
  objCopy = RegExp(value["p"], value["m"]);
  // console.log(value["p"], value["m"], objCopy);
}

function objDeserializeFunction(value, objCopy, name, isNative) {
  if (isNative) {
    objCopy[name] = window[value[name]];
  }
  else {
    objCopy[name] = parseFunction(value[name]["func_str"]);
    objDeserializeKeys(value[name]["keys"], objCopy[name]);
  }
}

function objDeserializeArray(value, objCopy) {
  objDeserializeKeys(value, objCopy);
}

function objDeserializeKeys(value, objCopy) {
  var keys = Object.keys(value);
  for (var name of keys) {
    // Exclude _MemberVarTypes and # during the loop
    if (value.hasOwnProperty(name) && name !== "_MemberVarTypes" && name !== "#"){
      // If membertype has this var, we need to process that var
      if (value["_MemberVarTypes"].hasOwnProperty(name)) {
        switch(value["_MemberVarTypes"][name]) {
          case "infinity":
            objCopy[name] = Infinity;
            break;
          case "nan":
            objCopy[name] = NaN;
            break;
          // case "string":
          //   break;
          case "regex":
            objCopy[name] = new RegExp(value[name]["p"], value[name]["m"]);
            break;
          case "undefined":
            objCopy[name] = undefined;
            break;
          case "null":
            objCopy[name] = null;
            break;
          case "function":
            objDeserializeFunction(value, objCopy, name, false);
            // objCopy[name] = parseFunction(value[name]);
            break;
          case "native function":
            objDeserializeFunction(value, objCopy, name, true);
            // objCopy[name] = value[name];
            break;
          case "date":
            objCopy[name] = parseDate(value[name]);
            break;
          case "object":
            // traverse through objects
            objCopy[name] = {};
            deserializeObject(value[name], objCopy[name]);
            break;
          case "array":
            objCopy[name] = [];
            deserializeArray(value[name], objCopy[name]);
            break;
          default:
            break;
        }
      }
      // Otherwise, do nothing. The data should be parsed correctly
      else {
        // console.log(objCopy);
        objCopy[name] = value[name];
      }
    }
  }
}

// Make sure objCopy = {} is defined
// Value is the object to be deserialized
function deserializeObject(value, objCopy) {
  // First check objCopy["#"] and determine the prototype of this object
  // If proto is in window and is a native constructor
  if (typeof value["#"] === "string") {
    objCopy.__proto__ = window[value["#"]].prototype;
  }
  // Function constructor
  else {
    // TODO: Consider preserving references here
    var newConstructor = parseFunction(value["#"]["func_str"]);
    objCopy.constructor = newConstructor;
    objDeserializeKeys(value["#"]["keys"], objCopy.constructor);
  }

  // Deserialize all keys
  objDeserializeKeys(value, objCopy);
}

// Make sure objCopy = [] is defined
function deserializeArray(value, objCopy) {
  objDeserializeArray(value, objCopy);
}



