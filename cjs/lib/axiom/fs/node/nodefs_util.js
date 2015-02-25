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

"use strict";
var axiom$fs$path$$ = require("axiom/fs/path"), axiom$core$error$$ = require("axiom/core/error");
var nodefsUtil = {};
exports["default"] = nodefsUtil;

/**
 * List all FileEntrys in a given nodefs directory.
 *
 * @param {fs} node filesystem.
 * @param {string} path The absolute path of the target directory.
 * @return {Promise<Object>}
 */
nodefsUtil.listDirectory = function(fs, path) {
  return new Promise(function(resolve, reject) {
    var rv = {};

    var cb = function(err, files) {
      for (var i = 0; i < files.length; i++) {
        var stat = fs.statSync(path + '/' + files[i]);
       rv[files[i]] = nodefsUtil.filterStat(stat);
      }
      resolve(rv);
    };
    fs.readdir(path, cb);
  });
};

nodefsUtil.filterStat = function(stat) {
  var stat_new = {};
  stat_new['mtime'] = stat['mtime'];
  stat_new['size'] = stat['mtime'];
  stat_new['mode'] = stat['mode'];
  return stat_new;
};

/**
 * Convenience method to convert a FileError to a promise rejection with an
 * Axiom error.
 *
 * Used in the context of a FileEntry.
 */
nodefsUtil.convertFileError = function(pathSpec, error) {
  if (error.name == 'TypeMismatchError')
    return new axiom$core$error$$.default.TypeMismatch('entry-type', pathSpec);

  if (error.name == 'NotFoundError')
    return new axiom$core$error$$.default.NotFound('path', pathSpec);

  if (error.name == 'PathExistsError')
    return new axiom$core$error$$.default.Duplicate('path', pathSpec);

  return new axiom$core$error$$.default.Runtime(pathSpec + ':' + error.toString());
};

nodefsUtil.rejectFileError = function(pathSpec, reject, error) {
  reject(nodefsUtil.convertFileError(pathSpec, error));
};
exports.nodefsUtil = nodefsUtil;

//# sourceMappingURL=nodefs_util.js.map