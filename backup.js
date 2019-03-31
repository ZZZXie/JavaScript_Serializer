// ***********************************
// Serialization functions for values in object
// ***********************************
function objSerializeNumber(value, objCopy) {
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

function objSerializeString(value, objCopy) {
  // cache the type string for this variable
  objCopy[name] = value[name];
}

function objSerializeUndefined(value, objCopy) {
  // Primitive but needs to get converted to string
  objCopy[name] = stringifyPrimitiveBuiltIn(value[name]);
  objCopy["_MemberVarTypes"][name] = "undefined";
}

function objSerializeNull(value, objCopy) {
  objCopy[name] = stringifyPrimitiveBuiltIn(value[name]);
  objCopy["_MemberVarTypes"][name] = "null";
}

function objSerializeBool(value, objCopy) {
  objCopy[name] = value[name];
}

function objSerializeRegExp(value, objCopy) {
  objCopy[name] = regexStringify(value[name]);
}

function objSerializeDate(value, objCopy) {
  objCopy[name] = stringifyDate(value[name]);
  objCopy["_MemberVarTypes"][name] = "date";
}

function objSerializeArray(value, objCopy) {
  for (var i = 0; i < value.length; i++) {
    var objectName = Object.prototype.toString(value[i]);
    switch (objectName.substring(8, objectName.length - 1)) {
      case "Number":
        arrSerializeNumber(value, objCopy, i);
        break;

      case "String":
        arrSerializeString(value, objCopy, i);
        break;

      case "Undefined":
        arrSerializeUndefined(value, objCopy, i);
        break;

      case "Null":
        arrSerializeNull(value, objCopy, i);
        break;

      case "Boolean":
        arrSerializeBool(value, objCopy, i);
        break;

      case "Function":
        // TODO: Handle native function cases
        // TODO: consider handling function variables
        arrSerializeFunction(value, objCopy, i);
        break;

      case "RegExp":
        arrSerializeRegExp(value, objCopy, i);
        break;

      case "Date":
        arrSerializeDate(value, objCopy, i);
        break;

      case "Object":
        arrSerializeDate(value, objCopy, i);
        break;

      case "Array":
        // for array, loop through values, and handle non-stringifiable objects, etc
        arrSerializeArray(value, objCopy, i);
        break;

      default:
        objCopy[i] = objectName;
        break;
    }
  }
}

function objSerializeKeys(value, objCopy) {
  // Loop through all keys in this object
  for (var name in value) {
    if (value.hasOwnProperty(name)){
      // Get the type of this value[name]
      var objectName = Object.prototype.toString(value[name]);
      // console.log(objectName.substring(8, objectName.length - 1));
      switch (objectName.substring(8, objectName.length - 1)) {
        case "Number":
          objSerializeNumber(value, objCopy);
          break;

        case "String":
          objSerializeString(value, objCopy);
          break;

        case "Undefined":
          // Primitive but needs to get converted to string
          objSerializeUndefined(value, objCopy);
          break;

        case "Null":
          objSerializeNull(value, objCopy);
          break;

        case "Boolean":
          objSerializeBool(value, objCopy);
          break;

        case "Function":
          objSerializeFunction(value, objCopy);
          break;

        case "RegExp":
          objSerializeRegExp(value, objCopy);
          break;

        case "Date":
          objSerializeDate(value, objCopy);
          break;

        case "Object":
          objCopy[name] = {};
          objCopy["_MemberVarTypes"][name] = "object";
          objSerializeObject(value[name], objCopy[name]);
          break;

        case "Array":
          // for array, loop through values, and handle non-stringifiable objects, etc
          objCopy[name] = [];
          objCopy["_MemberVarTypes"][name] = "array";
          objSerializeArray(value[name], objCopy[name]);
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
      // TODO: store all keys, now only support functions and variables
      // Variables in a function can be objects, can be any type
      TODO
    }
  }
  // Serialize all keys in this object
  serializeKeys(value, objCopy)
}

function serializeFunction(value, objCopy) {
  // TODO
}


// ***********************************
// Serialization functions for values in array
// ***********************************

function arrSerializeNumber(value, objCopy, i) {
  if (value[i] === Infinity) {
    objCopy[i] = {"_type" : "infinity", "_value": "Infinity"};
  }
  if (value[i] === NaN) {
    objCopy[i] = {"_type" : "nan", "_value": "NaN"};
  }
  // Do nothing
  objCopy[i] = {"_type" : "number", "_value": value[i]};
}

function arrSerializeString(value, objCopy, i) {
  // cache the type string for this variable
  objCopy[i] = {"_type" : "string", "_value": value[i]};
}

function arrSerializeUndefined(value, objCopy, i) {
  // Primitive but needs to get converted to string
  objCopy[i] = {"_type" : "undefined", "_value": stringifyPrimitiveBuiltIn(value[i])};
}

function arrSerializeNull(value, objCopy, i) {
  objCopy[i] = {"_type" : "null", "_value": stringifyPrimitiveBuiltIn(value[i])};
}

function arrSerializeBool(value, objCopy, i) {
  objCopy[i] = {"_type" : "boolean", "_value": value[i]};
}

function arrSerializeRegExp(value, objCopy, i) {
  objCopy[i] = {"_type" : "regexp", "_value": regexStringify(value[i])};
}

function arrSerializeDate(value, objCopy, i) {
  objCopy[i] = {"_type" : "date", "_value": stringifyDate(value[i])};
}

function arrSerializeArray(value, objCopy, i) {

}

function arrSerializeKeys(value, objCopy, i) {
  // Loop through all keys in this object
  for (var name in value) {
    if (value.hasOwnProperty(name)){
      // Get the type of this value[name]
      var objectName = Object.prototype.toString(value[name]);
      // console.log(objectName.substring(8, objectName.length - 1));
      switch (objectName.substring(8, objectName.length - 1)) {
        case "Number":
          serializeNumber(value, objCopy);
          break;

        case "String":
          serializeString(value, objCopy);
          break;

        case "Undefined":
          // Primitive but needs to get converted to string
          serializeUndefined(value, objCopy);
          break;

        case "Null":
          serializeNull(value, objCopy);
          break;

        case "Boolean":
          serializeBool(value, objCopy);
          break;

        case "Function":
          serializeFunction(value, objCopy);
          break;

        case "RegExp":
          
          // revert: new RegExp(JSON.parse(regexStringify(regex1)))
          break;

        case "Date":
          objCopy[name] = stringifyDate(value[name]);
          objCopy["_MemberVarTypes"][name] = "date";
          break;

        case "Object":
          objCopy[name] = {};
          ComplexSerializer.objectToString(value[name], objCopy[name]);
          objCopy["_MemberVarTypes"][name] = "object";
          break;

        case "Array":
          // for array, loop through values, and handle non-stringifiable objects, etc
          objCopy[name] = [];
          objCopy["_MemberVarTypes"][name] = "array";
          ComplexSerializer.arrayToString(value[name], objCopy[name]);
          break;

        default:
          objCopy[name] = objectName;
          break;
      }
    }
  }
}

function arrSerializeObject(value, objCopy, i) {
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
      // TODO: store all keys, now only support functions and variables
      // Variables in a function can be objects, can be any type
      for (var i = 0; i < func_keys.length; i++) {
        if (value.constructor[func_keys[i]] instanceof Function) {
          objCopy["#"]["keys"][func_keys[i]] = value.constructor[func_keys[i]].toString();
        }
        else {
          objCopy["#"]["keys"][func_keys[i]] = value.constructor[func_keys[i]];
        }
      }
    }
  }
  // Serialize all keys in this object
  serializeKeys(value, objCopy)
}

function arrSerializeFunction(value, objCopy, i) {

}



