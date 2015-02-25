// Copyright (c) 2015 Google Inc. All rights reserved.
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


/** @constructor */
define("axiom/fs/open_mode", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  var OpenMode = function() {
    this.create = false;
    this.exclusive = false;
    this.truncate = false;
    this.read = false;
    this.write = false;
  };

  __es6_export__("OpenMode", OpenMode);
  __es6_export__("default", OpenMode);

  /**
   * @param {string} str
   * @return {OpenMode}
   */
  OpenMode.fromString = function(str) {
    var m = new OpenMode();

    for (var i = 0; i < str.length; i++) {
      switch(str.substr(i, 1)) {
        case 'c':
        m.create = true;
        break;

        case 'e':
        m.exclusive = true;
        break;

        case 't':
        m.truncate = true;
        break;

        case 'r':
        m.read = true;
        break;

        case 'w':
        m.write = true;
        break;
      }
    }

    return m;
  };
});

//# sourceMappingURL=open_mode.js.map