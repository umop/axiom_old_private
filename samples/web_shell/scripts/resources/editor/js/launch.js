// Copyright 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

window.onload = function() {
  var editor = window.aceEditor = ace.edit('editor');

  var event = new Event('ready');
  event.initEvent('ready', false, false);
  this.dispatchEvent(event);

  editor.focus();
  editor.commands.addCommand({
    name: 'saveFile',
    bindKey: {
      win: 'Ctrl-S',
      mac: 'Command-S',
      sender: 'editor|cli'
    },
    exec: (function(editor, args, request) {
      var event = new Event('save');
      event.initEvent('save', false, false);
      event.target = this;
      this.dispatchEvent(event);
    }).bind(this)
  });

  setupVisualization(editor);
}

if (window.opener && window.opener.onEditorWindowOpened) {
  window.opener.onEditorWindowOpened();
}

function setContents(contents) {
  var session = window.aceEditor.getSession();
  session.setValue(contents, -1);
}

function getContents() {
  var session = window.aceEditor.getSession();
  return session.getValue();
}

function setupVisualization(editor) {
  editor.on('input', function() {
    var Range=require("ace/range").Range;

    editor.getSession().unfold(2, true);
    var content = editor.session.getValue()
    // var re = /\/\*\* @type \{([A-Za-z_$.]+)\} ?\*\/\n(\s*)var/g;
    var re = /(|\/\*\* @type \{([^}]+)\} ?\*\/\n(\s*))\bvar /g;
    while(m = re.exec(content)) {
      var annotationStartIndex = m.index
      var annotationEndIndex = m[0].length + annotationStartIndex - 1;
      var startPosition = editor.session.getDocument().indexToPosition(annotationStartIndex)
      var endPosition = editor.session.getDocument().indexToPosition(annotationEndIndex)
      var markerRange = new Range(startPosition.row, startPosition.column, endPosition.row, endPosition.column);
      var typeName = m[2];
      if (typeName === undefined) typeName = "var";
      editor.session.addFold(" " + typeName + " \u25BC ", markerRange);
      // editor.session.addMarker(markerRange, "ace_selected-word", "text");
    }

    re = /for \(var ([a-zA-Z_$]+) *\= *([-a-zA-Z$0-9.]+) *; *([a-zA-Z_$]+) *([<=>]+) *([-a-zA-Z$0-9.]+) *; *([a-zA-Z_$]+)(--|\+\+) *\) * \n?\s*\{/g;
    while(m = re.exec(content)) {
      var annotationStartIndex = m.index
      var annotationEndIndex = m[0].length + annotationStartIndex;
      var startPosition = editor.session.getDocument().indexToPosition(annotationStartIndex)
      var endPosition = editor.session.getDocument().indexToPosition(annotationEndIndex)
      var endValue = m[5];
      editor.session.addFold(" " + m[1] + " \u279C " + m[2] + " .. " + endValue, new Range(startPosition.row, startPosition.column, endPosition.row, endPosition.column));
    }

  });

  editor.session.addEventListener("changeFold", function(e) {
    console.log(e);
    if (e.action == "remove") {
      e.preventDefault();
      e.stopPropagation();
      var range = e.data.range;
      editor.session.addFold(e.data.placeholder, range);
      // window.prompt("Type");
      return false;
    }
  });
  editor.session.setValue("//hello\n  /** @type {string} */\n  var pathSpec = 'hello'")
}