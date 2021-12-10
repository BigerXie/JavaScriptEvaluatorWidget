/* global TW, TWX */
TW.IDE.Dialogs.JavaScriptEvaluatorCustomEditor = function () {
  var uid = new Date().getTime() + "_" + Math.floor(1000 * Math.random());
  this.title = 'JavaScript Code';

  this.renderDialogHtml = function (widgetObj) {
    var style = parseFloat(TWX.App.version) <= 9 ? "width:100%;height:100%" : "width:98%;height:96%";
    var code = widgetObj.properties['code'];
    var html = "<textarea class='JavaScriptEvaluatorCustomEditor_" + uid + "' style='" + style + ";resize:none;position:absolute;font-size:14px;font-family:monospaced;white-space:nowrap'>" + (code ? code : "") + "</textarea>";
    return html;
  };

  this.afterRender = function (domElementId) {
  };

  this.updateProperties = function (widgetObj) {
    widgetObj.setProperty('code', $(".JavaScriptEvaluatorCustomEditor_" + uid).val());
    return true;
  };
};

TW.IDE.Widgets.javascriptevaluator = function () {
  this.widgetIconUrl = function () {
    return '../Common/extensions/JavaScriptEvaluatorWidget/ui/javascriptevaluator/js.png';
  };

  this.widgetProperties = function () {
    return {
      'name': 'JavaScriptEvaluator',
      'description': 'Widget to execute JavaScript code without any restriction',
      'category': ['Common'],
      'iconImage': 'js.png',
      customEditor: 'JavaScriptEvaluatorCustomEditor',
      customEditorMenuText: 'Edit JavaScript Code',
      'properties': {
        'Width': {
          'description': 'width',
          'defaultValue': 200
        },
        'Height': {
          'description': 'height',
          'defaultValue': 28
        },
        inputParameters: {
          baseType: 'JSON',
          defaultValue: '{}',
          description: 'The JSON object describing the input parameters having parameter names as key and data type as value; ex. {"minTemp": "STRING"}'
        },
        'code': {
          'isVisible': true,
          'baseType': 'STRING',
          'isBindingTarget': true,
          'isEditable': true,
          'description': 'The JavaScript code to execute'
        },
        'debugMode': {
          'isVisible': true,
          'baseType': 'BOOLEAN',
          'isEditable': true,
          'defaultValue': false,
          'description': 'true to activate the debug'
        },
        'resultType': {
          'isVisible': true,
          'baseType': 'STRING',
          'isEditable': true,
          'description': 'The (optional) result type of the executed JavaScript code',
          'defaultValue': 'NOTHING',
          'selectOptions': [
            {value: 'NOTHING', text: 'Nothing'},
            {value: 'STRING', text: 'String'},
            {value: 'INTEGER', text: 'Integer'},
            {value: 'NUMBER', text: 'Number'},
            {value: 'DATETIME', text: 'DateTime'},
            {value: 'BOOLEAN', text: 'Boolean'}
          ]
        }
      }
    };
  };

  this.widgetServices = function () {
    return {
      'Evaluate': {
        'warnIfNotBound': true
      }
    };
  };

  this.widgetEvents = function () {
    return {
      'Evaluated': {}
    };
  };

  this.renderHtml = function () {
    return '<div class="widget-content widget-javascriptevaluator">' + '<span class="javascriptevaluator-property">JavaScript Evaluator</span>' + '</div>';
  };

  this.afterRender = function () {
    this.setProperty('_InputParametersDataShape', '{}');
    this.addNewInputParameters(this.getProperty("inputParameters"));

    this.manageResultType();
  };

  this.afterSetProperty = function (name, value) {
    var thisWidget = this;
    var result = false;

    if (name === 'inputParameters') {
      this.deleteOldInputParameters();

      if (value === '') {
        thisWidget.resetJSON(name);
      } else if (!this.addNewInputParameters(value)) {
        TW.IDE.showStatusText('error', 'inputParameters: the JSON object is not valid, or one of the parameter names is reserved, or a type other than STRING, INTEGER, NUMBER, DATETIME, BOOLEAN, INFOTABLE has been indicated.');
        thisWidget.resetJSON(name);
      }
    } else if (name === "resultType") {
      this.manageResultType();
    }

    return result;
  };

  this.deleteOldInputParameters = function () {
    var properties = this.allWidgetProperties().properties;
    var oldDataShape = this.strToJson(this.getProperty('_InputParametersDataShape'));

    for (var key in oldDataShape) {
      delete properties[key];
    }
  };

  this.addNewInputParameters = function (newInputParameters) {
    var properties = this.allWidgetProperties().properties;
    newInputParameters = this.strToJson(newInputParameters);
    var allowedTypes = ["STRING", "INTEGER", "NUMBER", "DATETIME", "BOOLEAN", "INFOTABLE"];

    for (var key in newInputParameters) {
      if (newInputParameters.hasOwnProperty(key) && properties[key]) {
        this.setProperty('_InputParametersDataShape', '{}');
        return false;
      } else if (allowedTypes.indexOf(newInputParameters[key]) === -1) {
        this.setProperty('_InputParametersDataShape', '{}');
        return false;
      }
    }

    for (var key in newInputParameters) {
      properties[key] = {
        isBaseProperty: false,
        name: key,
        type: 'property',
        isVisible: true,
        isBindingTarget: true,
        baseType: newInputParameters[key]
      };

      if (newInputParameters[key] === "STRING") {
        properties[key].isLocalizable = true;
      }
    }

    this.setProperty('_InputParametersDataShape', this.jsonToStr(this.getProperty('inputParameters')));

    this.updatedProperties({
      updateUI: true
    });
    return true;
  };

  this.jsonToStr = function (value) {
    if (!value) {
      value = "{}";
    } else if (typeof value !== "string") {
      value = JSON.stringify(value);
    }
    return value;
  };

  this.strToJson = function (value) {
    if (!value) {
      value = {};
    } else if (typeof value === "string") {
      value = JSON.parse(value);
    }
    return value;
  };

  this.resetJSON = function (name) {
    this.setProperty(name, '{}');
    TW.IDE.updateWidgetPropertiesWindow();
  };

  this.manageResultType = function () {
    var properties = this.allWidgetProperties().properties;
    delete properties["result"];

    var resultType = this.getProperty("resultType");
    if (resultType !== "NOTHING") {
      properties["result"] = {
        isBaseProperty: false,
        name: "result",
        type: 'property',
        isVisible: true,
        isEditable: false,
        isBindingSource: true,
        baseType: resultType,
        'description': 'The (optional) result of the executed JavaScript code'
      };
    }

    this.updatedProperties({
      updateUI: true
    });
  };
};