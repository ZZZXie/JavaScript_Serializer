# JavaScript_Serializer

## Research Progress & Notes
https://docs.google.com/document/d/1zxOISS3te2sGX4jPvPHxywgFNTzIHaSDPhp7J9FyDj0/edit

## How to run
1. Open up chrome browser with security feature disabled:
```shell
open -na Google\ Chrome --args --disable-web-security --user-data-dir="/tmp/chrome_dev"
```
2. Then open the developer tool in the browser.

3. Copy and paste helper.js, stringify.js, and serializer.js codes inside console to correctly define functions and variables.

4. Usage of serializer:
```javascript
// declare cleanedWindow which is a stringifiable window object
var cleanedWindow = {};
// JSON.decycle will decycle self referencing inside the object
ComplexSerializer.objectToString(JSON.decycle(window), cleanedWindow);
// Now this cleaned window object can be stringified.
var outputString = JSON.stringify(cleanedWindow);
// Parse back the window object based on cached string
var parsedWindow = {};
ComplexSerializer.toObject(cleanedWindow, parsedWindow);
// array cannot be correctly parsed back currently such that retrocycle will not work
// var retroCycledWindow = JSON.retrocycle(parsedWindow);
```

## Current Issue
Some information is still lost during stringification and needs to be investigated case by case. Code for parsing back is still not complete.

## Serializing Object and Functions
This page discusses how to serialize objects and is a good reference:  
https://nullprogram.com/blog/2013/03/11/  

