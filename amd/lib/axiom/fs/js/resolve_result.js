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

/** @typedef FileSystem$$module$axiom$fs$base$file_system */
define("axiom/fs/js/resolve_result", ["exports"], function(__exports__) {
 "use strict";

 function __es6_export__(name, value) {
  __exports__[name] = value;
 }

 var BaseFileSystem;

 /** @typedef JsEntry$$module$axiom$fs$js$entry */
 var JsEntry;

 var JsResolveResult = function(prefixList, suffixList, entry) {
   this.prefixList = prefixList || [];
   this.suffixList = suffixList || [];
   this.entry = entry;

   this.isFinal = (entry && this.suffixList.length === 0);
 };

 __es6_export__("JsResolveResult", JsResolveResult);
 __es6_export__("default", JsResolveResult);
});

//# sourceMappingURL=resolve_result.js.map