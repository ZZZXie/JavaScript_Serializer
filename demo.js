serializeObject() + deserializeObject()

// declare cleanedWindow which is a stringifiable window object
var cleanedWindow = {};
// JSON.decycle will decycle self referencing inside the object
serializeObject(JSON.decycle(window), cleanedWindow);
// Now this cleaned window object can be stringified.
var outputString = JSON.stringify(cleanedWindow);
// Parse back the window object based on cached string
var parsedWindow = {};
deserializeObject(cleanedWindow, parsedWindow);
// Restore cycles
var retroCycledWindow = JSON.retrocycle(parsedWindow);



var a = {"a": 1, "b": "hello", "c": /w3schools/i, "data": Date('December 17, 1995 03:24:00'), "arr": [1, 2, {"2": function() {}}]};