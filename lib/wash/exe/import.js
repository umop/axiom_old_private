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

import Path from 'axiom/fs/path';

/** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
var JsExecuteContext;

/**
 * Import a directory of files for use in wash.
 *
 * @param {JsExecuteContext} cx
 */
export var main = function(cx) {
  cx.ready();

  var input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('webkitdirectory', '');
  input.setAttribute('multiple', 'webkitdirectory');
  input.style.cssText =
      'position: absolute;' +
      'right: 0';

  input.addEventListener('change', handleFileSelect.bind(this, cx), false);

  document.body.appendChild(input);

  input.click();
};

function handleFileSelect(cx, evt) {
  /**
   * @type {FileList}
   */
  var files = evt.target.files;

  var fileCount = 0;
  this.fsm = cx.fileSystemManager;

  for (var i = 0, f; f = files[i]; i++) {
    var path = Path.abs(cx.getPwd(), f.webkitRelativePath);

    fileCount++;
    var reader = new FileReader();
    reader.onload = function(path, evt) {
      var fileContent = reader.result;
      console.log(path);
      var parentDirectory = path.getParentPath();
      return this.fsm.mkdir(parentDirectory).then(function() {
        return this.fsm.writeFile(path, axiom.fs.data_type.DataType.Value, fileContent);
      }.bind(this)).then(function() {
        fileCount--;
        if (fileCount == 0) {
          document.body.removeChild(input);
          cx.closeOk();
        }
      });
    }.bind(this, path);

    reader.readAsBinaryString(f);
  }
}

export default main;

main.signature = {};