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

/**
 * Left pad a string to a given length using a given character.
 *
 * @param {string} str The string to pad.
 * @param {number} length The desired length.
 * @param {string} opt_ch The optional padding character, defaults to ' '.
 * @return {string} The padded string.
 */
define("wash/string_utils", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  var lpad = function(str, length, opt_ch) {
    str = String(str);
    opt_ch = opt_ch || ' ';

    while (str.length < length)
      str = opt_ch + str;

    return str;
  };

  __es6_export__("lpad", lpad);
  var zpad = function(number, length) {
    return lpad(number.toString(), length, '0');
  };

  __es6_export__("zpad", zpad);
  var getWhitespace = function(length) {
    if (length === 0)
      return '';

    var f = this.getWhitespace;
    if (!f.whitespace)
      f.whitespace = '          ';

    while (length > f.whitespace.length) {
      f.whitespace += f.whitespace;
    }

    return f.whitespace.substr(0, length);
  };
  __es6_export__("getWhitespace", getWhitespace);
});

//# sourceMappingURL=string_utils.js.map