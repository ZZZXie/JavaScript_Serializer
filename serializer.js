/*
 * var newWindow = {}
 * ComplexSerializer.objectToString(JSON.decycle(window), newWindow);
 * 
 */

function regexStringify (reg) {
  reg = reg instanceof RegExp ? reg.source : reg

  if (typeof reg !== 'string') {
    throw new Error('reg is not a string' + reg)
  }

  for (let i = 0, len = reg.length; i < len; i++) {
    if (reg[i] === '\\' || reg[i] === '"') {
      reg = reg.substring(0, i) + '\\' + reg.substring(i++)
      len += 2
    }
  }
  return '"' + reg + '"'
}

// Needs to be a complex object to use this function
var ComplexSerializer = {
    objectToString: function (value, objCopy) {
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
      // Loop through all keys in this object
      for (var name in value) {
        if (value.hasOwnProperty(name)){
          var objectName = Object.prototype.toString.call(value[name]);
          console.log(objectName.substring(8, objectName.length - 1));
          switch (objectName.substring(8, objectName.length - 1)) {
            case "Number":
              if (value[name] === Infinity) {
                objCopy[name] = "Infinity";
                objCopy["_MemberVarTypes"][name] = "infinity";
              }
              if (value[name] === NaN) {
                objCopy[name] = "NaN";
                objCopy["_MemberVarTypes"][name] = "nan";
              }
              // Do nothing
              objCopy[name] = value[name];
              break;

            case "String":
              // cache the type string for this variable
              objCopy[name] = value[name];
              // objCopy["_MemberVarTypes"][name] = "string";
              break;

            case "Undefined":
              // Primitive but needs to get converted to string
              objCopy[name] = stringifyPrimitiveBuiltIn(value[name]);
              objCopy["_MemberVarTypes"][name] = "undefined";
              break;

            case "Null":
              objCopy[name] = stringifyPrimitiveBuiltIn(value[name]);
              objCopy["_MemberVarTypes"][name] = "null";
              break;

            case "Boolean":
              objCopy[name] = value[name];
              break;

            case "Function":
              // TODO: Handle native function cases
              if (isNativeFunction(value[name])) {
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
                  // TODO: store all keys, now only support functions and variables
                  // Variables in a function can be objects, can be any type
                  for (var i = 0; i < func_keys.length; i++) {
                    if (value[name][func_keys[i]] instanceof Function) {
                      objCopy[name]["keys"][func_keys[i]] = value[name][func_keys[i]].toString();
                    }
                    else {
                      objCopy[name]["keys"][func_keys[i]] = value[name][func_keys[i]];
                    }
                  }
                }
              } 
              break;

            case "RegExp":
              objCopy[name] = regexStringify(value[name]);
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
    },
    arrayToString: function (value, objCopy) {
      for (var i = 0; i < value.length; i++) {
        var objectName = Object.prototype.toString.call(value[i]);
        switch (objectName.substring(8, objectName.length - 1)) {
          case "Number":
            if (value[i] === Infinity) {
              objCopy[i] = {"_type" : "infinity", "_value": "Infinity"};
            }
            if (value[i] === NaN) {
              objCopy[i] = {"_type" : "nan", "_value": "NaN"};
            }
            // Do nothing
            objCopy[i] = {"_type" : "number", "_value": value[i]};
            break;

          case "String":
            // cache the type string for this variable
            objCopy[i] = {"_type" : "string", "_value": value[i]};
            break;

          case "Undefined":
            // Primitive but needs to get converted to string
            objCopy[i] = {"_type" : "undefined", "_value": stringifyPrimitiveBuiltIn(value[i])};
            break;

          case "Null":
            objCopy[i] = {"_type" : "null", "_value": stringifyPrimitiveBuiltIn(value[i])};
            break;

          case "Boolean":
            objCopy[i] = {"_type" : "boolean", "_value": value[i]};
            break;

          case "Function":
            // TODO: Handle native function cases
            // TODO: consider handling function variables
            objCopy[i] = {"_type" : "function", "_value": value[i].toString()};
            break;

          case "RegExp":
            objCopy[i] = {"_type" : "regexp", "_value": regexStringify(value[i])};
            // revert: new RegExp(JSON.parse(regexStringify(regex1)))
            break;

          case "Date":
            objCopy[i] = {"_type" : "date", "_value": stringifyDate(value[i])};
            break;

          case "Object":
            objCopy[i] = {};
            ComplexSerializer.objectToString(value[i], objCopy[i]);
            break;

          case "Array":
            // for array, loop through values, and handle non-stringifiable objects, etc
            objCopy[i] = [];
            ComplexSerializer.arrayToString(value[i], objCopy[i]);
            break;

          default:
            objCopy[i] = objectName;
            break;
        }
      }
    },
    toObject: function (value, objCopy) {
      // First check objCopy["#"] and determine the prototype of this object
      // If proto is in window and is a native constructor
      // if (window.hasOwnProperty(value["#"] && isNativeFunction(window[value["#"]])) {
      if (typeof value["#"] === "string") {
        objCopy.__proto__ = window[value["#"]].prototype;
      }
      // Function constructor
      else {
        var newConstructor = parseFunction(objCopy["#"]["func_str"]);
        for (2)
        objCopy.constructor = 
      }
      // Loop through all vars in the object
      for (var name in value) {
        // Exclude _MemberVarTypes during the loop
        if (value.hasOwnProperty(name) && name !== "_MemberVarTypes"){
          // If membertype has this var, we need to process that var
          if (value["_MemberVarTypes"].hasOwnProperty(name)) {
            switch(value["_MemberVarTypes"][name]) {
              case "infinity":
                objCopy[name] = Infinity;
                break;
              case "nan":
                objCopy[name] = NaN;
                break;
              case "string":
                // objCopy[name] = value[name];
                break;
              case "undefined":
                objCopy[name] = undefined;
                break;
              case "null":
                objCopy[name] = null;
                break;
              case "function":
                objCopy[name] = parseFunction(value[name]);
                break;
              case "native function":
                // TODO: build the connection to the native function
                objCopy[name] = value[name];
                break;
              case "date":
                objCopy[name] = parseDate(value[name]);
                break;
              case "object":
                // traverse through objects
                objCopy[name] = {};
                ComplexSerializer.toObject(value[name], objCopy[name]);
              case "array":

                // TODO
                break;
              default:
                break;
            }
          }
          // Otherwise, do nothing. The data should be parsed correctly
          else {
            objCopy[name] = value[name];
          }
        }
      }
    },
    toArray: function(value, objCopy) {

    }
}



