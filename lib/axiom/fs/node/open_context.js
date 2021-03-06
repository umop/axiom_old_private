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

import AxiomError from 'axiom/core/error';
import ReadResult from 'axiom/fs/read_result';
import SeekWhence from 'axiom/fs/seek_whence';
import DataType from 'axiom/fs/data_type';
import WriteResult from 'axiom/fs/write_result';

import OpenContext from 'axiom/fs/base/open_context';

import nodefsUtil from 'axiom/fs/node/nodefs_util';

import Path from 'axiom/fs/path';

/** @typedef NodeFileSystem$$module$axiom$fs$node$file_system */
var NodeFileSystem;

/** @typedef OpenMode$$module$axiom$fs$open_mode */
var OpenMode;

/**
 * @constructor @extends {OpenContext}
 * Construct a new context that can be used to open a file.
 *
 * @param {NodeFileSystem} nodefs
 * @param {Path} path
 * @param {string|OpenMode} mode
 */
export var NodeOpenContext = function(nodefs, path, mode) {

  OpenContext.call(this, nodefs, path, mode);

  this.pathSpec = this.pathSpec;

  this.onFileError_ = nodefsUtil.rejectFileError.bind(null, path.spec);

  // The Node FileEntry we're operation on.
  this.entry_ = null;

  // The Node fd we're operating on.
  this.fd = null;

};

export default NodeOpenContext;

NodeOpenContext.prototype = Object.create(OpenContext.prototype);

/** @suppress {undefinedVars} */
var NodeBuffer = function(size) { return new Buffer(size) };

/**
 * @param {number} offset
 * @param {SeekWhence} whence
 * @return {!Promise<undefined>}
 */
OpenContext.prototype.seek_ = function(offset, whence) {
    return Promise.reject(
        new AxiomError.TypeMismatch('seekable', this.pathSpec));
};

/**
 * @param {OpenMode} mode
 * @returns {string} mode string.
 */
NodeOpenContext.prototype.convertModeToString_ = function(mode) {
  var modeString = '';

  if (this.mode.write || this.mode.create) {
    modeString = 'w';
  }

  if (this.mode.exclusive) {
    modeString += 'x';
  }

  if (this.mode.read) {
    if (modeString == '')
      modeString = 'r';
    else {
      modeString += '+';
    }
  }
  return modeString;
}

/**
 * Initiate the open.
 *
 * Returns a promise that completes when the open is no longer valid.
 *
 * @return {!Promise<undefined>}
 */
NodeOpenContext.prototype.open = function() {
  return new Promise(function(resolve, reject) {
    this.fileSystem.fileSystem.exists(this.pathSpec, function(exists) {
      if (!exists && !this.mode.create) {
        return reject(new AxiomError.Invalid('Invalid path: ', this.pathSpec));
      } else if (this.mode.exclusive) {
        return reject(new AxiomError.Invalid('Invalid path: ', this.pathSpec));
      }

      var stats = this.fileSystem.fileSystem.statSync(this.pathSpec);

      if (stats.isDirectory()) {
        return reject(new AxiomError.Invalid('Invalid path: ', this.pathSpec));
      }

      var mode = this.convertModeToString_(this.mode);

      this.fileSystem.fileSystem.open(this.pathSpec, mode, function(err, fd) {
        if (err) {
          return reject(err);
        }
        this.fd = fd;
        return resolve();
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

/**
 * @param {number} offset
 * @param {SeekWhence} whence
 * @param {?DataType} dataType
 * @return {!Promise<!ReadResult>}
 */
NodeOpenContext.prototype.read = function(offset, whence, dataType) {
  var fs = this.fileSystem.fileSystem;
  return new Promise(function(resolve, reject) {
    if (dataType != DataType.UTF8String) {
      return reject(new AxiomError.NotImplemented(
          dataType + ': not supportd.'));
    }

    if (offset != 0 || whence != SeekWhence.Begin) {
      return reject(new AxiomError.Invalid('whence is not supported.', whence));
    }

    fs.fstat(this.fd, function(err, stats) {
      var bufferSize = stats.size;
      var chunkSize = 512;
      var buffer = NodeBuffer(bufferSize);
      var bytesRead = 0;

      while (bytesRead < bufferSize) {
        if ((bytesRead + chunkSize) > bufferSize) {
          chunkSize = (bufferSize - bytesRead);
        }
        fs.readSync(this.fd, buffer, bytesRead, chunkSize, bytesRead);
        bytesRead += chunkSize;
      }
      var result = new ReadResult(0, null, dataType);
      result.data = buffer.toString('utf8', 0, bufferSize);
      fs.closeSync(this.fd);
      return resolve(result);
    }.bind(this));
  }.bind(this));
};

/**
 * @param {number} offset
 * @param {SeekWhence} whence
 * @param {?DataType} dataType
 * @param {*} data
 * @return {!Promise<!WriteResult>}
 */
NodeOpenContext.prototype.write = function(offset, whence, dataType, data) {
  dataType = dataType || DataType.UTF8String;
  return new Promise(function(resolve, reject) {
   if (dataType != DataType.UTF8String) {
      return reject(new AxiomError.NotImplemented(dataType + ': not supportd.'));
   }
   this.fileSystem.fileSystem.writeFile(this.pathSpec, data, function(err) {
     if (err) {
       return reject(err);
     } else {
       return resolve(new WriteResult(offset, whence, dataType));
     }
   });
  }.bind(this));
};
