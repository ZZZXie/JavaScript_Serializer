# JavaScript_Serializer

## Research Progress & Notes
https://docs.google.com/document/d/1zxOISS3te2sGX4jPvPHxywgFNTzIHaSDPhp7J9FyDj0/edit

## How to run
1. Open up chrome browser with security feature disabled:
```shell
open -na Google\ Chrome --args --disable-web-security --user-data-dir="/tmp/chrome_dev"
```
2. Then open the developer tool in the browser.

3. Usage of serializer:
```javascript
// NOTE: JSON.decycle and retrocycle is in helper.js

// JSON.decycle will decycle self referencing inside the object
var serializedWindow = serialize(JSON.decycle(window));
// Now this cleaned window object can be stringified.
var outputString = JSON.stringify(serializedWindow);
// Parse back the window object based on cached string
var parsedWindow = deserialize(serializedWindow);
// array cannot be correctly parsed back currently such that retrocycle will not work
// var retroCycledWindow = JSON.retrocycle(parsedWindow);
```

4. Simple Test case:
```javascript
var a = {"a": 1, "b": "hello", "c": /w3schools/i, "data": Date('December 17, 1995 03:24:00'), "arr": [1, 2, {"2": function() {}}]};

var seri = serialize(a);

var deseri = deserialize(seri);

// Then if we compare deseri and a, these two objects should contain same information.
```

## Debugs Solved
It went through some test cases. But may still contain bugs.

## Current Issue
Some information is still lost during stringification and needs to be investigated case by case. For example, 
```javascript
var a = function () {};
var dict = {"func" : a};
// the function name a will be lost after serialize and deserialize
```
The other thing is this serializer does not preserve references, which require more work.

## Serializing Object and Functions
This page discusses how to serialize objects and is a good reference:  
https://nullprogram.com/blog/2013/03/11/  

