# JavaScriptEvaluatorWidget
An extension to execute JavaScript code without any restriction.

**This Extension is provided as-is and without warranty or support. It is not part of the PTC product suite and there is no PTC support.**

## Description
This extension provides a widget to execute JavaScript code without any restriction, it is an advanced version of standard expression.

The widget allows to fire one or more "custom events" by calling the function *triggerCustomEvent(eventIndex)* inside the code.

## Properties
- debugMode - BOOLEAN (default = false): if set to true it sends to the browser's JS console a set of information useful for debugging the widget
- inputParameters - JSON (default = {}): the JSON object describing the input parameters having parameter names as key and data type as value; ex. {"minTemp": "STRING"}
- code - STRING (no default value): the JavaScript code to execute
- resultType - STRING (default = 'NOTHING'): the (optional) result type of the executed JavaScript code (options: NOTHING, STRING, INTEGER, NUMBER, DATETIME, BOOLEAN)
- numberOfCustomEvents - INTEGER (default = 0): the number of custom events
- other properties depending on the inputParameters property

## Services
- Evaluate: service to execute the code

## Events
- Evaluated: event to notify the code has been executed
- CustomEvent1, ..., CustomEvent\<numberOfCustomEvents\>: events triggered when the code executes the *triggerCustomEvent(eventIndex)* function

## Dependencies
- Monaco Editor - [link](https://microsoft.github.io/monaco-editor/)

## Donate
If you would like to support the development of this and/or other extensions, consider making a [donation](https://www.paypal.com/donate/?business=HCDX9BAEYDF4C&no_recurring=0&currency_code=EUR).
