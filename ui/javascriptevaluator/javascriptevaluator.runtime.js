/* global TW, result */
TW.Runtime.Widgets.javascriptevaluator = function () {
  var thisWidget = this;

  this.runtimeProperties = function () {
    var inputParametersDataShape = this.strToJson(thisWidget.getProperty('_InputParametersDataShape'));

    var propertyAttributes = {
    };

    for (var key in inputParametersDataShape) {
      if (inputParametersDataShape[key] === "STRING") {
        propertyAttributes[key] = {'isLocalizable': true};
      }
    }

    return {
      'needsDataLoadingAndError': false,
      propertyAttributes: propertyAttributes
    };
  };

  this.renderHtml = function () {
    var html = '';
    html = '<div class="widget-content widget-javascriptevaluator" style="display:none;"></div>';
    return html;
  };

  this.serviceInvoked = function (serviceName) {
    if (serviceName === 'Evaluate') {
      var code = thisWidget.getProperty('code');
      var debugMode = thisWidget.getProperty('debugMode');
      var inputParametersDataShape = this.strToJson(thisWidget.getProperty('_InputParametersDataShape'));

      var variableDefinitions = "var result;";
      for (var key in inputParametersDataShape) {
        variableDefinitions += "var " + key + " = thisWidget.getProperty('" + key + "');";
      }
      var triggerCustomEvent = 'function triggerCustomEvent() {try {thisWidget.jqElement.triggerHandler("CustomEvent");} catch (exception) {console.log(exception);}};';
      var completeCode = "try {" + variableDefinitions + triggerCustomEvent + code + "} catch (exception) {console.log(exception);}";

      if (debugMode) {
        console.log("JavaScriptEvaluator - evaluate -> Start");
        console.log("JavaScriptEvaluator - evaluate -> variableDefinitions = " + variableDefinitions);
        console.log("JavaScriptEvaluator - evaluate -> code = " + code);
        console.log("JavaScriptEvaluator - evaluate -> completeCode = " + completeCode);
      }

      eval(completeCode);

      if (debugMode) {
        console.log("JavaScriptEvaluator - evaluate -> result = " + result);
        console.log("JavaScriptEvaluator - evaluate -> Stop");
      }

      thisWidget.setProperty("result", result);
      thisWidget.jqElement.triggerHandler("Evaluated");
    }
  };

  this.updateProperty = function (updatePropertyInfo) {
    if (updatePropertyInfo.TargetProperty === 'code') {
      this.setProperty("code", updatePropertyInfo.RawSinglePropertyValue);
    } else {
      var inputParametersDataShape = this.strToJson(this.getProperty('_InputParametersDataShape'));

      if (updatePropertyInfo.TargetProperty in inputParametersDataShape) {
        switch (inputParametersDataShape[updatePropertyInfo.TargetProperty]) {
          case "INTEGER":
            this.setProperty(updatePropertyInfo.TargetProperty, parseInt(updatePropertyInfo.SinglePropertyValue, 10));
            break;
          case "NUMBER":
            this.setProperty(updatePropertyInfo.TargetProperty, parseFloat(updatePropertyInfo.SinglePropertyValue));
            break;
          case "DATETIME":
            this.setProperty(updatePropertyInfo.TargetProperty, new Date(updatePropertyInfo.SinglePropertyValue));
            break;
          case "BOOLEAN":
            this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.SinglePropertyValue === 'true' || updatePropertyInfo.SinglePropertyValue === true);
            break;
          default:
            this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawSinglePropertyValue);
            break;
        }
      }
    }
  };

  this.strToJson = function (value) {
    if (!value) {
      value = {};
    } else if (typeof value === "string") {
      value = JSON.parse(value);
    }
    return value;
  };
};