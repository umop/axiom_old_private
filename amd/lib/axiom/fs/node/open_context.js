// Copyright 2014 Google Inc. All rights reserved.
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

define(
  "axiom/fs/node/open_context",
  ["axiom/core/error", "axiom/fs/base/open_context", "axiom/fs/node/nodefs_util", "axiom/fs/path", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$base$open_context$$,
    axiom$fs$node$nodefs_util$$,
    axiom$fs$path$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var OpenContext;
    OpenContext = axiom$fs$base$open_context$$["default"];
    var nodefsUtil;
    nodefsUtil = axiom$fs$node$nodefs_util$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];

    /** @typedef NodeFileSystem$$module$axiom$fs$node$file_system */
    var NodeFileSystem;

    /** @typedef OpenMode$$module$axiom$fs$open_mode */
    var OpenMode;

    var NodeOpenContext = function(nodefs, path, arg) {
      this.nodefs = nodefs;
      this.path = path;
      this.arg = arg;

      this.onFileError_ = nodefsUtil.rejectFileError.bind(null, path.spec);

      // The current read/write position.
      this.position_ = 0;

      // The Node FileEntry we're operation on.
      this.entry_ = null;

      // THe Node file we're operating on.
      this.file_ = null;

    };

    __es6_export__("NodeOpenContext", NodeOpenContext);
    __es6_export__("default", NodeOpenContext);

    /**
     * If the arg object does not have a 'whence' property, this call succeeds
     * with no side effects.
     *
     * @param {Object} arg An object containing 'whence' and 'offset' arguments
     *  describing the seek operation.
     */
    NodeOpenContext.prototype.seek_ = function(arg) {
      var fileSize = this.file_.size;
      var start = this.position_;

      if (!arg['whence'])
        return Promise.resolve(true);

      if (arg['whence'] == 'begin') {
        start = arg['offset'];

      } else if (arg['whence'] == 'current') {
        start += arg['offset'];

      } else if (arg['whence'] == 'end') {
        start = fileSize + arg['offset'];
      }

      if (start > fileSize) {
        //onError(wam.mkerr('wam.FileSystem.Error.EndOfFile', []));
        return Promise.reject(new AxiomError.Runtime('reached end of file.'));
      }

      if (start < 0) {
        return Promise.reject(new AxiomError.Runtime(
            'Invalid file offset: ' + this.path.spec));
      }

      this.position_ = start;
      return Promise.resolve({position: this.position_});
    };

    NodeOpenContext.prototype.open_ = function() {
      var mode = this.arg;
      return new Promise(function(resolve, reject) {
        var onFileError = this.onFileError_.bind(null, reject);
        var onStat = function(stat) {
          this.entry_.file(function(f) {
              this.file_ = f;
              resolve();
          }.bind(this), onFileError);
        }.bind(this);

        var onFileFound = function(entry) {
          this.entry_ = entry;
          if (mode.write && mode.truncate) {
            this.entry_.createWriter(
                function(writer) {
                  writer.truncate(0);
                  //nodefsUtil.statEntry(entry).then(onStat).catch(onFileError);
                },
                reject);
            return;
          }

          /*nodefsUtil.statEntry(entry).then(function(value) {
            onStat(value);
          }).catch(function(e) {
            reject(e);
          });*/
        }.bind(this);

        this.nodefs.fileSystem.root.getFile(
            this.path.spec,
            {create: mode.create,
             exclusive: mode.exclusive
            },
            onFileFound, onFileError);
      }.bind(this));
    };

    /**
     * Handle a read event.
     */
    NodeOpenContext.prototype.read_ = function(arg) {
      if (!arg) {
        arg = {
           dataType: 'utf8-string',
           count: 0
        };
      }
      return new Promise(function(resolve, reject) {
        this.seek_(arg).then(function(rv) {
          if (!rv) {
            return reject();
          }

          var fileSize = this.file_.size;
          var end;
          if (arg.count) {
            end = this.position_ + arg.count;
          } else {
            end = fileSize;
          }

          var dataType = arg.dataType || 'utf8-string';
          var reader = new FileReader();

          reader.onload = function(e) {
            this.position_ = end + 1;
            var data = reader.result;

            if (dataType == 'base64-string' && typeof data == 'string') {
              // TODO: By the time we read this into a string the data may already
              // have been munged.  We need an ArrayBuffer->Base64 string
              // implementation to make this work for real.
              data = window.btoa(data);
            }
            resolve({dataType: dataType, data: data});
          }.bind(this);

          reader.onerror = function(error) {
            return this.onFileError_(reject, error);
          };

          var slice = this.file_.slice(this.position_, end);
          if (dataType == 'blob') {
            resolve({dataType: dataType, data: slice});
          }  else if (dataType == 'arraybuffer') {
            reader.readAsArrayBuffer(slice);
          } else {
            reader.readAsText(slice);
          }
        }.bind(this));
      }.bind(this));
    };

    /**
     * Handle a write event.
     */
    NodeOpenContext.prototype.write_ = function(arg) {
      if (!arg) {
        return Promise.reject(new AxiomError.Missing('arg'));
      }
      var dataType = arg.dataType || 'utf8-string';
      return new Promise(function(resolve, reject) {
        var onWriterReady = function(writer) {
          var blob;
          if (arg.data instanceof Blob) {
            blob = arg.data;
          } else if (arg.data instanceof ArrayBuffer) {
            blob = new Blob([arg.data], {type: 'application/octet-stream'});
          } else if (dataType == 'base64-string' && typeof arg.data == 'string') {
            // TODO: Once we turn this into a string the data may already have
            // been munged.  We need an ArrayBuffer->Base64 string implementation to
            // make this work for real.
            blob = new Blob([window.atob(arg.data)],
                            {type: 'application/octet-stream'});
          } else if (dataType == 'utf8-string') {
            blob = new Blob([arg.data],  {type: 'text/plain'});
          } else if (dataType == 'value') {
            blob = new Blob([JSON.stringify(arg.data)],  {type: 'text/json'});
          }

          writer.onerror = function(error) {
            return this.onFileError_(reject, error);
          }.bind(this);

          writer.onwrite = function() {
            this.position_ = this.position_ + blob.size;
            resolve(null);
          }.bind(this);

          writer.seek(this.position_);
          writer.write(blob);
        }.bind(this);

        this.seek_(arg).then(function(rv) {
          if (!rv) {
            return reject();
          }
          this.entry_.createWriter(
              onWriterReady,
              this.onFileError_.bind(null, reject));
        }.bind(this));
      }.bind(this));
    };
  }
);

//# sourceMappingURL=open_context.js.map