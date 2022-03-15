/* global TW, TWX, require, URL, monaco */
$("body").append('<script src="https://unpkg.com/monaco-editor@latest/min/vs/loader.js"></script>');
TW.IDE.Dialogs.JavaScriptEvaluatorCustomEditor = function () {
  var uid = new Date().getTime() + "_" + Math.floor(1000 * Math.random());
  this.title = 'JavaScript Code';
  var code, editor;

  this.renderDialogHtml = function (widgetObj) {
    code = widgetObj.properties['code'];
    var inputParameters = this.strToJson(widgetObj.properties['inputParameters']);
    var htmlParameters = "";
    for (var key in inputParameters) {
      htmlParameters += "<span class='JavaScriptEvaluatorCustomEditor_" + uid + "_inputParameter' style='display:block;padding:5px;white-space:nowrap;cursor:pointer' key='" + key + "'><b>" + key + "</b>: " + inputParameters[key] + "</span>";
    }

    htmlParameters +=
            "<hr/>" +
            "<span class='JavaScriptEvaluatorCustomEditor_" + uid + "_result' style='display:block;padding:5px;white-space:nowrap;cursor:pointer'><b>result</b>: " + widgetObj.properties['resultType'] + "</span>";

    htmlParameters +=
            "<hr/>" +
            "<span class='JavaScriptEvaluatorCustomEditor_" + uid + "_triggerCustomEvent' style='display:block;padding:5px;white-space:nowrap;cursor:pointer'><b>triggerCustomEvent</b></span>";

    var style1 = parseFloat(TWX.App.version) <= 9 ? "width:15%;height:100%" : "width:15%;height:96%";
    var style2 = parseFloat(TWX.App.version) <= 9 ? "width:84%;height:100%" : "width:82%;height:96%";
    var html =
            "<div style='" + style1 + ";position:absolute;overflow:auto;border:1px solid gray'>" + htmlParameters + "</div>" +
            "<textarea class='JavaScriptEvaluatorCustomEditor_" + uid + "' style='" + style2 + ";visibility:hidden;resize:none;position:absolute;left:16%;font-size:14px;font-family:monospaced;white-space:nowrap'>" + (code ? code : "") + "</textarea>" +
            "<div id='JavaScriptEvaluatorCustomEditor_" + uid + "' style='" + style2 + ";resize:none;position:absolute;left:16%'></div>";
    return html;
  };

  this.afterRender = function (domElementId) {
    try {
      if (window.monaco && monaco.editor) {
        createEditor();
      } else {
        require.config({paths: {'vs': 'https://unpkg.com/monaco-editor@latest/min/vs'}});
        window.MonacoEnvironment = {getWorkerUrl: () => proxy};

        var proxy = URL.createObjectURL(new Blob([`
          self.MonacoEnvironment = {baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'};
          importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
        `], {type: 'text/javascript'}));

        require(["vs/editor/editor.main"], createEditor);
      }
    } catch (exception) {
      editor = null;
      $("#JavaScriptEvaluatorCustomEditor_" + uid).css("visibility", "hidden");
      $(".JavaScriptEvaluatorCustomEditor_" + uid).css("visibility", "visible");
      setClickForTextArea();
    }
  };

  this.updateProperties = function (widgetObj) {
    widgetObj.setProperty('code', editor ? editor.getValue() : $(".JavaScriptEvaluatorCustomEditor_" + uid).val());
    return true;
  };

  this.strToJson = function (value) {
    if (!value) {
      value = {};
    } else if (typeof value === "string") {
      value = JSON.parse(value);
    }
    return value;
  };

  function createEditor() {
    try {
      editor = monaco.editor.create(document.getElementById('JavaScriptEvaluatorCustomEditor_' + uid), {
        value: code ? code : "",
        language: 'javascript',
        scrollBeyondLastLine: false,
        theme: 'vs',
        minimap: {
          enabled: false
        }
      });

      $('.JavaScriptEvaluatorCustomEditor_' + uid + '_inputParameter').click(function () {
        var ops = [];
        var selections = editor.getSelections();
        for (var index = 0; index < selections.length; index++) {
          var id = {major: 1, minor: 1};
          ops.push({identifier: id, range: selections[index], text: $(this).attr("key"), forceMoveMarkers: true});
        }
        editor.executeEdits("my-source", ops);
      });

      $('.JavaScriptEvaluatorCustomEditor_' + uid + '_result').click(function () {
        var ops = [];
        var selections = editor.getSelections();
        for (var index = 0; index < selections.length; index++) {
          var id = {major: 1, minor: 1};
          ops.push({identifier: id, range: selections[index], text: "result", forceMoveMarkers: true});
        }
        editor.executeEdits("my-source", ops);
      });

      $('.JavaScriptEvaluatorCustomEditor_' + uid + '_triggerCustomEvent').click(function () {
        var ops = [];
        var selections = editor.getSelections();
        for (var index = 0; index < selections.length; index++) {
          var id = {major: 1, minor: 1};
          ops.push({identifier: id, range: selections[index], text: "triggerCustomEvent(<INSERT CUSTOM EVENT INDEX HERE>);", forceMoveMarkers: true});
        }
        editor.executeEdits("my-source", ops);
      });
    } catch (exception) {
      editor = null;
      $("#JavaScriptEvaluatorCustomEditor_" + uid).css("visibility", "hidden");
      $(".JavaScriptEvaluatorCustomEditor_" + uid).css("visibility", "visible");
      setClickForTextArea();
    }
  }

  function setClickForTextArea() {
    $('.JavaScriptEvaluatorCustomEditor_' + uid + '_inputParameter').click(function () {
      var txtarea = document.getElementsByClassName("JavaScriptEvaluatorCustomEditor_" + uid)[0];

      txtarea.value =
              txtarea.value.substring(0, txtarea.selectionStart) +
              $(this).attr("key") +
              txtarea.value.substring(txtarea.selectionEnd, txtarea.value.length);
    });

    $('.JavaScriptEvaluatorCustomEditor_' + uid + '_result').click(function () {
      var txtarea = document.getElementsByClassName("JavaScriptEvaluatorCustomEditor_" + uid)[0];

      txtarea.value =
              txtarea.value.substring(0, txtarea.selectionStart) +
              "result" +
              txtarea.value.substring(txtarea.selectionEnd, txtarea.value.length);
    });

    $('.JavaScriptEvaluatorCustomEditor_' + uid + '_triggerCustomEvent').click(function () {
      var txtarea = document.getElementsByClassName("JavaScriptEvaluatorCustomEditor_" + uid)[0];

      txtarea.value =
              txtarea.value.substring(0, txtarea.selectionStart) +
              "triggerCustomEvent(<INSERT CUSTOM EVENT INDEX HERE>);" +
              txtarea.value.substring(txtarea.selectionEnd, txtarea.value.length);
    });
  }
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
        },
        'numberOfCustomEvents': {
          'isVisible': true,
          'baseType': 'INTEGER',
          'isEditable': true,
          'defaultValue': 0,
          'description': 'The number of custom events'
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

    this.addNewEventParameters(this.getProperty('numberOfCustomEvents'));
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
    } else if (name === "numberOfCustomEvents") {
      this.deleteOldEventParameters();
      this.addNewEventParameters(value);
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

  this.deleteOldEventParameters = function () {
    var properties = this.allWidgetProperties().properties;

    for (var key in properties) {
      if (key.toLowerCase().startsWith("customevent")) {
        delete properties[key];
      }
    }
  };

  this.addNewEventParameters = function (numberOfCustomEvents) {
    var properties = this.allWidgetProperties().properties;

    for (var eventN = 1; eventN <= numberOfCustomEvents; eventN++) {
      properties['CustomEvent' + eventN] = {
        name: "CustomEvent" + eventN,
        type: "event",
        description: 'CustomEvent N. ' + eventN,
        isVisible: true
      };
    }

    this.updatedProperties({
      updateUI: true
    });
  };
};