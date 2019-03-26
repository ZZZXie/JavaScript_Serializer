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

function parseFunction(str) {
	return new Function("return" + str)();
}



