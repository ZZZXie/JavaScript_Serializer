/*
How to handle different types of objects in JavaScript
1. Primitives
    null; undefined; boolean; number; string; *object*; symbol (added in ES6)
    NOTE: typeof null === "object"; // true
    https://www.oreilly.com/library/view/you-dont-know/9781491905159/ch01.html

2. Built-In Object types 
    Functions; Time; Date; Regexp; etc.
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects

2. Custom Objects (functions)

*/

/*
Check if built-in functions like toString() has been overwrittten (=== Object.prototype.toString()) or create an iframe an then compare
Use typeof for simple built-in types
Use instanceof for customized types
Do a traversal of variables for each object even if it is a built-in type
*/

/*
String primitive vs String object:
https://stackoverflow.com/questions/3907613/how-is-a-javascript-string-not-an-object
*/



// null; undefined; boolean; number; string; symbol (added in ES6)
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


// NO need to use this, here just for reference in case I need it in the future.
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



