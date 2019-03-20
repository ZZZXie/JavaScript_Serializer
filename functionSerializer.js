function splice(str, start, delCount, newSubStr) {
	return str.slice(0, start) + newSubStr + str.slice(start + Math.abs(delCount));
};


// This one treats all functions as declarations

function cacheFunction(func) {
	var func_components = {}
	var entire = func.toString(); // sample outputs 1."function(a, b) {return 1;}"  2."function m() {return 1;}"
	var body = entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}"));
	// Function declaration (including name, arguments and body); 
	// 1.1 If this is function variable
	if (entire[8] === '(') {
		// Use function blabla = new Function(args, body)
		// TODO: check if function arguments is necessary to cache
		var func_name = ' ' + func.name;
		func_components['function_declaration'] = splice(entire, 8, 0, func_name);
	}
	// 1.2 If Function declaration
	else {
		// Use eval to re-declare this function
		func_components['function_declaration'] = entire;
	}

	// Function objects keys (use Object.keys()); 
	var func_keys = Object.keys(func);
	if (func_keys.length > 0) {
		func_components['keys'] = {};
		// TODO: store all keys, now only support functions and variables
		for (var i = 0; i < func_keys.length; i++) {
			if (func[func_keys[i]] instanceof Function) {
				func_components['keys'][func_keys[i]] = func[func_keys[i]].toString();
			}
			else {
				func_components['keys'][func_keys[i]] = func[func_keys[i]];
			}
		}
	}
	return func_components;

	// No need to scan through all built-in functions because it will be in keys if modified in this level
	// The more interesting case is considering loops.
}