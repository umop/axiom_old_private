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
import Path from 'axiom/fs/path';

import {zpad} from 'wash/string_utils';

/** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
var JsExecuteContext;

/** @typedef StatResult$$module$axiom$fs$stat_result */
var StatResult;

/**
 * @param {!StatResult} stat
 */
var formatStat = function(stat) {
  var keys = Object.keys(stat).sort();

  var ary = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = stat[key];

    if (key == 'mtime') {
      var d = new Date(stat.mtime);
      value = d.getFullYear() + '-' +
          zpad(d.getMonth() + 1, 2) + '-' +
          zpad(d.getDay(), 2) + ' ' +
          d.toLocaleTimeString();
    } else if (key == 'mode') {
      value = Path.modeIntToString(stat.mode);
    }

    ary.push(key + ': ' + JSON.stringify(value));
  }

  return ary.join(', ');
};

/**
 * @param {JsExecuteContext} executeContext
 */
export var main = function(executeContext) {
  executeContext.ready();

  /** @type {string} */
  var pathSpec;

  if (!executeContext.arg) {
    pathSpec = '';
  } if (typeof executeContext.arg == 'string') {
    pathSpec = executeContext.arg;
  } else {
    return executeContext.closeError(new AxiomError.TypeMismatch(
        'string', pathSpec));
  }

  /** @type {Path} */
  var path = new Path(Path.abs(executeContext.getEnv('$PWD', new Path('/')), pathSpec));

  var fileSystem = executeContext.fileSystem;
  fileSystem.list(path).then(
    function(listResult) {
      var names = Object.keys(listResult).sort();
      var rv = 'count ' + names.length + '\n';

      if (names.length > 0) {
        var longest = names[0].length;
        names.forEach(function(name) {
          if (name.length > longest) longest = name.length;
        });

        names.forEach(function(name) {
          var stat = listResult[name];
          rv += name;
          rv += (stat.mode & Path.Mode.D) ? '/' : ' ';
          for (var i = 0; i < longest - name.length; i++) {
            rv += ' ';
          }

          rv += '   ' + formatStat(stat) + '\n';
        });
      }

      executeContext.stdout(rv);
      return executeContext.closeOk(null);
    }
  ).catch(
   function(value) {
     if (AxiomError.TypeMismatch.test(value)) {
       fileSystem.stat(path).then(
         function(stat) {
           executeContext.stdout(path.getBaseName() + '  ' +
               formatStat(stat) + '\n');
           return executeContext.closeOk(null);
         }
       ).catch(
         function(value) {
           return executeContext.closeError(value);
         }
       );
     } else {
       return executeContext.closeError(value);
     }
   });
};

main.argSigil = '$';

export default main;
