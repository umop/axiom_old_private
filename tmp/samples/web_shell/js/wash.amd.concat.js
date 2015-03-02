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
  "wash/exe/cat",
  ["axiom/core/error", "axiom/fs/path", "exports"],
  function(axiom$core$error$$, axiom$fs$path$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];

    var CAT_CMD_USAGE_STRING = 'usage: cat [file...]';

    var main = function(executeContext) {
      executeContext.ready();

      var arg = executeContext.arg;
      if (!arg['_'] || (arg['_'].length === 0) || arg['h'] || arg['help']) {
        executeContext.stdout(CAT_CMD_USAGE_STRING + '\n');
        return executeContext.closeOk();
      }

      var fileSystem = executeContext.fileSystem;

      var catNext = function() {
        if (!arg['_'].length) {
          return executeContext.closeOk();
        }

        /** @type {string} */
        var pathSpec = arg['_'].shift();
        pathSpec = Path.abs(executeContext.getEnv('$PWD', '/'), pathSpec);

        fileSystem.readFile(new Path(pathSpec)).then(
          function(result) {
            executeContext.stdout(result.data);
            return catNext();
          }
        ).catch(function(e) {
            var errorString;

            if (e instanceof AxiomError) {
              errorString = e.errorName;
            } else {
              errorString = e.toString();
            }

            executeContext.stdout('cat: ' + pathSpec + ': ' + errorString + '\n');
            return catNext();
          }
        );
      };

      return catNext();
    };

    __es6_export__("main", main);
    __es6_export__("default", main);

    main.argSigil = '%';
  }
);

//# sourceMappingURL=cat.js.map
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
 "wash/exe/clear",
 ["wash/termcap", "exports"],
 function(wash$termcap$$, __exports__) {
  "use strict";

  function __es6_export__(name, value) {
   __exports__[name] = value;
  }

  var Termcap;
  Termcap = wash$termcap$$["default"];

  /** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
  var JsExecuteContext;

  var main = function(cx) {
    cx.ready();
    var tc = new Termcap();
    var output = tc.output('%clear-terminal()%set-row-column(row, column)',
                           {row: 1, column: 1});
    cx.stdout(output);
    cx.closeOk();
  };

  __es6_export__("main", main);
  __es6_export__("default", main);

  main.argSigil = '';
 }
);

//# sourceMappingURL=clear.js.map
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
  "wash/exe/cp",
  ["axiom/core/error", "axiom/fs/path", "exports"],
  function(axiom$core$error$$, axiom$fs$path$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];

    var CP_CMD_USAGE_STRING = 'usage: cp sourceFile targetFile';

    /** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
    var JsExecuteContext;

    var main = function(executeContext) {
      executeContext.ready();

      var arg = executeContext.arg;
      if (!arg._ || (arg._.length != 2) || arg['h'] || arg['help']) {
        executeContext.stdout(CP_CMD_USAGE_STRING + '\n');
        return executeContext.closeOk();
      }

      /** @type {string} */
      var fromPathSpec = arg._[0];
      /** @type {string} */
      var toPathSpec = arg._[1];
      /** @type {string} */
      var pwd = executeContext.getEnv('$PWD', '/');
      var fromPath = new Path(Path.abs(pwd, fromPathSpec));
      var toPath = new Path(Path.abs(pwd, toPathSpec));

      var fileSystem = executeContext.fileSystem;

      fileSystem.readFile(fromPath).then(
        function(readResult) {
          fileSystem.writeFile(toPath, readResult.dataType, readResult.data)
              .then(function(writeResult) {
            executeContext.closeOk();
          });
        });
    };

    __es6_export__("main", main);
    __es6_export__("default", main);

    main.argSigil = '%';
  }
);

//# sourceMappingURL=cp.js.map
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
 * Simple callback for a JsExecutable which echos the argument list to stdout
 * and exits.
 */
define("wash/exe/echo", ["exports"], function(__exports__) {
 "use strict";

 function __es6_export__(name, value) {
  __exports__[name] = value;
 }

 var main = function(cx) {
   cx.ready();
   cx.stdout(cx.arg + '\n');
   cx.closeOk();
 };

 __es6_export__("main", main);
 __es6_export__("default", main);

 /**
  * Accept any value for the execute context arg.
  */
 main.argSigil = '*';
});

//# sourceMappingURL=echo.js.map
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
  "wash/exe/ls",
  ["axiom/core/error", "axiom/fs/path", "wash/string_utils", "exports"],
  function(axiom$core$error$$, axiom$fs$path$$, wash$string_utils$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var zpad;
    zpad = wash$string_utils$$["zpad"];

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

    var main = function(executeContext) {
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

    __es6_export__("main", main);

    main.argSigil = '$';

    __es6_export__("default", main);
  }
);

//# sourceMappingURL=ls.js.map
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
  "wash/exe/mkdir",
  ["axiom/core/error", "axiom/fs/path", "exports"],
  function(axiom$core$error$$, axiom$fs$path$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];

    var MKDIR_CMD_USAGE_STRING = 'usage: mkdir directory ...';

    /** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
    var JsExecuteContext;

    var main = function(executeContext) {
      executeContext.ready();

      var arg = executeContext.arg;
      if (!arg['_'] || (arg['_'].length === 0) || arg['h'] || arg['help']) {
        executeContext.stdout(MKDIR_CMD_USAGE_STRING + '\n');
        return executeContext.closeOk();
      }

      var fileSystem = executeContext.fileSystem;

      var mkdirNext = function() {
        if (!arg['_'].length)
          return executeContext.closeOk();

        /** @type {string} */
        var pathSpec = arg['_'].shift();
        var path = new Path(Path.abs(executeContext.getEnv('$PWD', '/'), pathSpec));

       fileSystem.mkdir(path).then(
          function() {
            return mkdirNext();
          }
        ).catch(function(e) {
          var errorString;

          if (e instanceof AxiomError) {
            errorString = e.errorName;
          } else {
            errorString = e.toString();
          }

          executeContext.stdout('mkdir: ' + path.originalSpec + ': ' + errorString + '\n');
          return mkdirNext();
        });
      };

      return mkdirNext();
    };

    __es6_export__("main", main);
    __es6_export__("default", main);

    main.argSigil = '%';
  }
);

//# sourceMappingURL=mkdir.js.map
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

/** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
define("wash/exe/pwd", ["exports"], function(__exports__) {
 "use strict";

 function __es6_export__(name, value) {
  __exports__[name] = value;
 }

 var JsExecuteContext;

 var main = function(cx) {
   cx.ready();
   return cx.closeOk(cx.getEnv('$PWD', '/'));
 };

 __es6_export__("main", main);
 __es6_export__("default", main);

 main.argSigil = '';
});

//# sourceMappingURL=pwd.js.map
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
  "wash/exe/readline",
  ["axiom/core/error", "wash/termcap", "exports"],
  function(axiom$core$error$$, wash$termcap$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Termcap;
    Termcap = wash$termcap$$["default"];

    /** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
    var JsExecuteContext;

    /** @typedef StatResult$$module$axiom$fs$stat_result */
    var StatResult;

    /**
     * @constructor
     * A partial clone of GNU readline.
     *
     * @param {JsExecuteContext} executeContext
     */
    var Readline = function(executeContext) {
      this.executeContext = executeContext;

      this.executeContext.onStdIn.addListener(this.onStdIn_, this);

      this.promptString_ = executeContext.arg.promptString || '';
      this.promptVars_ = null;

      this.history_ = [];
      this.historyIndex_ = 0;

      this.line = '';
      this.linePosition = 0;

      this.debug_ = false;

      // Cursor position when the read() started.
      this.cursorHome_ = null;

      // Cursor position after printing the prompt.
      this.cursorPrompt_ = null;

      this.verbose = false;

      this.nextUndoIndex_ = 0;
      this.undo_ = [['', 0]];

      // Global killRing shared across all readline instances.  WCGW?
      this.killRing_ = Readline.killRing;

      this.previousLineHeight_ = 0;

      this.pendingESC_ = false;

      this.tc_ = new Termcap();

      this.bindings = {};
      this.addKeyBindings(Readline.defaultBindings);
    };

    __es6_export__("Readline", Readline);
    var main = function(executeContext) {
      var inputHistory = executeContext.arg.inputHistory;
      if (inputHistory && !(inputHistory instanceof Array))
        return Promise.reject(new AxiomError.Invalid('inputHistory', inputHistory));

      if (!executeContext.getTTY().isatty)
        return executeContext.closeError(new AxiomError.Runtime('Not a tty'));

      var readline = new Readline(executeContext);
      executeContext.ready();

      readline.read(inputHistory).then(
        function(value) {
          executeContext.closeOk(value);
        },
        function(err) {
          executeContext.closeError(err);
        });

      return executeContext.ephemeralPromise;
    };

    __es6_export__("main", main);

    main.argSigil = '%';

    __es6_export__("default", main);

    Readline.killRing = [];

    /**
     * Default mapping of key sequence to readline commands.
     *
     * Uses Termcap syntax for the keys.
     */
    Readline.defaultBindings = {
      '%(BACKSPACE)': 'backward-delete-char',
      '%(ENTER)': 'accept-line',

      '%(LEFT)': 'backward-char',
      '%(RIGHT)': 'forward-char',

      '%(UP)': 'previous-history',
      '%(DOWN)': 'next-history',

      '%(HOME)': 'beginning-of-line',
      '%(END)': 'end-of-line',
      '%(DELETE)': 'delete-char',

      '%ctrl("A")': 'beginning-of-line',
      '%ctrl("D")': 'delete-char-or-eof',
      '%ctrl("E")': 'end-of-line',
      '%ctrl("H")': 'backward-delete-char',
      '%ctrl("K")': 'kill-line',
      '%ctrl("L")': 'clear-home',
      '%ctrl("N")': 'next-history',
      '%ctrl("P")': 'previous-history',
      '%ctrl("Y")': 'yank',
      '%ctrl("_")': 'undo',
      '%ctrl("/")': 'undo',

      '%ctrl(LEFT)': 'backward-word',
      '%ctrl(RIGHT)': 'forward-word',

      // Meta and key at the same time.
      '%meta(BACKSPACE)': 'backward-kill-word',
      '%meta(DELETE)': 'kill-word',
      '%meta(">")': 'end-of-history',
      '%meta("<")': 'beginning-of-history',

      // Meta, then key.
      //
      // TODO(rginda): This would be better as a nested binding, like...
      //   '%(META)': { '%(DELETE)': 'kill-word', ... }
      // ...which would also allow provide for C-c and M-x multi key sequences.
      '%(META)%(DELETE)': 'kill-word',
      '%(META).': 'yank-last-arg',
    };

    /**
     * Read a line of input.
     *
     * Prints the given prompt, and waits while the user edits a line of text.
     * Provides editing functionality through the keys specified in defaultBindings.
     */
    Readline.prototype.read = function(inputHistory) {
      this.history_ = [''];
      if (inputHistory) {
        // Ensure the history is nothing but strings.
        inputHistory = inputHistory.filter(function(el) {
          return typeof el == 'string';
        });
        this.history_ = this.history_.concat(inputHistory);
      }

      this.line = this.history_[0] = '';
      this.linePosition = 0;

      this.nextUndoIndex_ = 0;
      this.undo_ = [['', 0]];

      this.cursorHome_ = null;
      this.cursorPrompt_ = null;

      this.previousLineHeight_ = 0;

      this.print('%get-row-column()');

      return new Promise(function(resolve, reject) {
        this.resolve_ = resolve;
        this.reject_ = reject;
      }.bind(this));
    };

    /**
     * Find the start of the word under linePosition in the given line.
     */
    Readline.getWordStart = function(line, linePosition) {
      var left = line.substr(0, linePosition);

      var searchEnd = left.search(/[a-z0-9][^a-z0-9]*$/i);
      left = left.substr(0, searchEnd);

      var wordStart = left.search(/[^a-z0-9][a-z0-9]*$/i);
      return (wordStart > 0) ? wordStart + 1 : 0;
    };

    /**
     * Find the end of the word under linePosition in the given line.
     */
    Readline.getWordEnd = function(line, linePosition) {
      var right = line.substr(linePosition);

      var searchStart = right.search(/[a-z0-9]/i);
      right = right.substr(searchStart);

      var wordEnd = right.search(/[^a-z0-9]/i);

      if (wordEnd == -1)
        return line.length;

      return linePosition + searchStart + wordEnd;
    };

    /**
     * Register multiple key bindings.
     */
    Readline.prototype.addKeyBindings = function(obj) {
      for (var key in obj) {
        this.addKeyBinding(key, obj[key]);
      }
    };

    /**
     * Register a single key binding.
     */
    Readline.prototype.addKeyBinding = function(str, commandName) {
      this.addRawKeyBinding(this.tc_.input(str), commandName);
    };

    /**
     * Register a binding without passing through termcap.
     */
    Readline.prototype.addRawKeyBinding = function(bytes, commandName) {
      this.bindings[bytes] = commandName;
    };

    /**
     *
     * @param {string} str
     * @param {Object=} opt_vars
     */
    Readline.prototype.print = function(str, opt_vars) {
      this.executeContext.stdout(this.tc_.output(str, opt_vars || {}));
    };

    Readline.prototype.setPrompt = function(str, vars) {
      this.promptString_ = str;
      this.promptVars_ = vars;

      this.cursorPrompt_ = null;

      if (this.executeContext.isEphemeral('Ready'))
        this.dispatch('redraw-line');
    };

    /**
     *
     * @param {string} name
     * @param {*=} arg
     */
    Readline.prototype.dispatch = function(name, arg) {
      this.commands[name].call(this, arg);
    };

    /**
     * Instance method version of getWordStart.
     */
    Readline.prototype.getWordStart = function() {
      return Readline.getWordStart(this.line, this.linePosition);
    };

    /**
     * Instance method version of getWordEnd.
     */
    Readline.prototype.getWordEnd = function() {
      return Readline.getWordEnd(this.line, this.linePosition);
    };

    Readline.prototype.killSlice = function(start, length) {
      if (length == -1)
        length = this.line.length - start;

      var killed = this.line.substr(start, length);
      this.killRing_.unshift(killed);

      this.line = (this.line.substr(0, start) + this.line.substr(start + length));
    };

    // TODO(rginda): Readline.on does not exist.
    // Readline.prototype.dispatchMessage = function(msg) {
    //   msg.dispatch(this, Readline.on);
    // };

    /**
     * Called when the terminal replys with the current cursor position.
     */
    Readline.prototype.onCursorReport = function(row, column) {
      if (!this.cursorHome_) {
        this.cursorHome_ = {row: row, column: column};
        this.dispatch('redraw-line');
        return;
      }

      if (!this.cursorPrompt_) {
        this.cursorPrompt_ = {row: row, column: column};
        if (this.cursorHome_.row == this.cursorPrompt_.row) {
          this.promptLength_ =
              this.cursorPrompt_.column - this.cursorHome_.column;
        } else {
          var tty = this.executeContext.getTTY();

          var top = tty.columns - this.cursorPrompt_.column;
          var bottom = this.cursorHome_.column;
          var middle = tty.columns * (this.cursorPrompt_.row -
                                       this.cursorHome_.row);
          this.promptLength_ = top + middle + bottom;
        }

        this.dispatch('redraw-line');
        return;
      }

      console.warn('Unexpected cursor position report: ' + row + ', ' + column);
      return;
    };

    Readline.prototype.onStdIn_ = function(value) {
      if (typeof value != 'string')
        return;

      var string = value;

      var ary = string.match(/^\x1b\[(\d+);(\d+)R$/);
      if (ary) {
        this.onCursorReport(parseInt(ary[1], 10), parseInt(ary[2], 10));
        return;
      }

      if (string == '\x1b') {
        this.pendingESC_ = true;
        return;
      }

      if (this.pendingESC_) {
        string = '\x1b' + string;
        this.pendingESC_ = false;
      }

      var commandName = this.bindings[string];

      if (commandName) {
        if (this.verbose)
          console.log('dispatch: ' + JSON.stringify(string) + ' => ' + commandName);

        if (!(commandName in this.commands)) {
          throw new Error('Unknown command "' + commandName + '", bound to: ' +
                          string);
        }

        var previousLine = this.line;
        var previousPosition = this.linePosition;

        if (commandName != 'undo')
          this.nextUndoIndex_ = 0;

        this.dispatch(commandName, string);

        if (previousLine != this.line && previousLine != this.undo_[0][0])
          this.undo_.unshift([previousLine, previousPosition]);

      } else if (/^[\x20-\xff]+$/.test(string)) {
        this.nextUndoIndex_ = 0;
        this.commands['self-insert'].call(this, string);
      } else if (this.debug_) {
        console.log('unhandled: ' + JSON.stringify(string));
      }
    };

    Readline.prototype.commands = {};

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['clear-home'] = function(string) {
      this.print('%clear-terminal()%set-row-column(row, column)',
                 {row: 0, column: 0});
      this.cursorHome_ = null;
      this.cursorPrompt_ = null;
      this.print('%get-row-column()');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['redraw-line'] = function(string) {
      if (!this.cursorHome_) {
        console.warn('readline: Home cursor position unknown, won\'t redraw.');
        return;
      }

      if (!this.cursorPrompt_) {
        // We don't know where the cursor ends up after printing the prompt.
        // We can't just depend on the string length of the prompt because
        // it may have non-printing escapes.  Instead we echo the prompt and then
        // locate the cursor.
        this.print('%set-row-column(row, column)',
                   { row: this.cursorHome_.row,
                     column: this.cursorHome_.column,
                   });
        this.print(this.promptString_, this.promptVars_);
        this.print('%get-row-column()');
        return;
      }

      this.print('%set-row-column(row, column)%(line)',
                 { row: this.cursorPrompt_.row,
                   column: this.cursorPrompt_.column,
                   line: this.line
                 });

      var tty = this.executeContext.getTTY();

      var totalLineLength = this.cursorHome_.column - 1 + this.promptLength_ +
          this.line.length;
      var totalLineHeight = Math.ceil(totalLineLength / tty.columns);
      var additionalLineHeight = totalLineHeight - 1;

      var lastRowFilled = (totalLineLength % tty.columns) === 0;
      if (!lastRowFilled)
        this.print('%erase-right()');

      if (totalLineHeight < this.previousLineHeight_) {
        for (var i = totalLineHeight; i < this.previousLineHeight_; i++) {
          this.print('%set-row-column(row, 1)%erase-right()',
                     {row: this.cursorPrompt_.row + i});
        }
      }

      this.previousLineHeight_ = totalLineHeight;

      if (totalLineLength >= tty.columns) {
        // This line overflowed the terminal width.  We need to see if it also
        // overflowed the height causing a scroll that would invalidate our idea
        // of the cursor home row.
        var scrollCount;

        if (this.cursorHome_.row + additionalLineHeight == tty.rows &&
            lastRowFilled) {
          // The line was exactly long enough to fill the terminal width and
          // and height.  Insert a newline to hold the new cursor position.
          this.print('\n');
          scrollCount = 1;
        } else {
          scrollCount = this.cursorHome_.row + additionalLineHeight - tty.rows;
        }

        if (scrollCount > 0) {
          this.cursorPrompt_.row -= scrollCount;
          this.cursorHome_.row -= scrollCount;
        }
      }

      this.dispatch('reposition-cursor');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['abort-line'] = function() {
      this.resolve_(null);
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['reposition-cursor'] = function(string) {
      // Count the number or rows it took to render the current line at the
      // current terminal width.
      var tty = this.executeContext.getTTY();
      var rowOffset = Math.floor((this.cursorPrompt_.column - 1 +
                                  this.linePosition) / tty.columns);
      var column = (this.cursorPrompt_.column + this.linePosition -
                    (rowOffset * tty.columns));
      this.print('%set-row-column(row, column)',
                 { row: this.cursorPrompt_.row + rowOffset,
                   column: column
                 });
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['self-insert'] = function(string) {
      if (this.linePosition == this.line.length) {
        this.line += string;
      } else {
        this.line = this.line.substr(0, this.linePosition) + string +
            this.line.substr(this.linePosition);
      }

      this.linePosition += string.length;

      this.history_[0] = this.line;

      this.dispatch('redraw-line');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['accept-line'] = function() {
      this.historyIndex_ = 0;
      if (this.line && this.line != this.history_[1])
        this.history_.splice(1, 0, this.line);
      this.print('\r\n');
      this.resolve_(this.line);
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['beginning-of-history'] = function() {
      this.historyIndex_ = this.history_.length - 1;
      this.line = this.history_[this.historyIndex_];
      this.linePosition = this.line.length;

      this.dispatch('redraw-line');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['end-of-history'] = function() {
      this.historyIndex_ = this.history_.length - 1;
      this.line = this.history_[this.historyIndex_];
      this.linePosition = this.line.length;

      this.dispatch('redraw-line');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['previous-history'] = function() {
      if (this.historyIndex_ == this.history_.length - 1) {
        this.print('%bell()');
        return;
      }

      this.historyIndex_ += 1;
      this.line = this.history_[this.historyIndex_];
      this.linePosition = this.line.length;

      this.dispatch('redraw-line');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['next-history'] = function() {
      if (this.historyIndex_ === 0) {
        this.print('%bell()');
        return;
      }

      this.historyIndex_ -= 1;
      this.line = this.history_[this.historyIndex_];
      this.linePosition = this.line.length;

      this.dispatch('redraw-line');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['kill-word'] = function() {
      var start = this.linePosition;
      var length =  this.getWordEnd() - start;
      this.killSlice(start, length);

      this.dispatch('redraw-line');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['backward-kill-word'] = function() {
      var start = this.getWordStart();
      var length = this.linePosition - start;
      this.killSlice(start, length);
      this.linePosition = start;

      this.dispatch('redraw-line');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['kill-line'] = function() {
      this.killSlice(this.linePosition, -1);

      this.dispatch('redraw-line');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['yank'] = function() {
      var text = this.killRing_[0];
      this.line = (this.line.substr(0, this.linePosition) +
                   text +
                   this.line.substr(this.linePosition));
      this.linePosition += text.length;

      this.dispatch('redraw-line');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['yank-last-arg'] = function() {
      if (this.history_.length < 2)
        return;

      var last = this.history_[1];
      var i = Readline.getWordStart(last, last.length - 1);
      if (i != -1)
        this.dispatch('self-insert', last.substr(i));
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['delete-char-or-eof'] = function() {
      if (!this.line.length) {
        this.dispatch('abort-line');
      } else {
        this.dispatch('delete-char');
      }
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['delete-char'] = function() {
      if (this.linePosition < this.line.length) {
        this.line = (this.line.substr(0, this.linePosition) +
                     this.line.substr(this.linePosition + 1));
        this.dispatch('redraw-line');
      } else {
        this.print('%bell()');
      }
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['backward-delete-char'] = function() {
      if (this.linePosition > 0) {
        this.linePosition -= 1;
        this.line = (this.line.substr(0, this.linePosition) +
                     this.line.substr(this.linePosition + 1));
        this.dispatch('redraw-line');
      } else {
        this.print('%bell()');
      }
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['backward-char'] = function() {
      if (this.linePosition > 0) {
        this.linePosition -= 1;
        this.dispatch('reposition-cursor');
      } else {
        this.print('%bell()');
      }
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['forward-char'] = function() {
      if (this.linePosition < this.line.length) {
        this.linePosition += 1;
        this.dispatch('reposition-cursor');
      } else {
        this.print('%bell()');
      }
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['backward-word'] = function() {
      this.linePosition = this.getWordStart();
      this.dispatch('reposition-cursor');
    };


    /**
     * @this {Readline}
     */
    Readline.prototype.commands['forward-word'] = function() {
      this.linePosition = this.getWordEnd();
      this.dispatch('reposition-cursor');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['beginning-of-line'] = function() {
      if (this.linePosition === 0) {
        this.print('%bell()');
        return;
      }

      this.linePosition = 0;
      this.dispatch('reposition-cursor');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['end-of-line'] = function() {
      if (this.linePosition == this.line.length) {
        this.print('%bell()');
        return;
      }

      this.linePosition = this.line.length;
      this.dispatch('reposition-cursor');
    };

    /**
     * @this {Readline}
     */
    Readline.prototype.commands['undo'] = function() {
      if ((this.nextUndoIndex_ == this.undo_.length)) {
        this.print('%bell()');
        return;
      }

      this.line = this.undo_[this.nextUndoIndex_][0];
      this.linePosition = this.undo_[this.nextUndoIndex_][1];

      this.dispatch('redraw-line');

      this.nextUndoIndex_ += 2;
    };
  }
);

//# sourceMappingURL=readline.js.map
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
  "wash/exe/rm",
  ["axiom/core/error", "axiom/fs/path", "exports"],
  function(axiom$core$error$$, axiom$fs$path$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];

    var RM_CMD_USAGE_STRING = 'usage: rm file ...';

    /** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
    var JsExecuteContext;

    var main = function(executeContext) {
      executeContext.ready();

      var arg = executeContext.arg;
      if (!arg['_'] || (arg['_'].length === 0)  || arg['h'] || arg['help']) {
        executeContext.stdout(RM_CMD_USAGE_STRING + '\n');
        return executeContext.closeOk();
      }

      var fileSystem = executeContext.fileSystem;

      var rmNext = function() {
        if (!arg['_'].length)
          return executeContext.closeOk();

        /** @type {string} */
        var pathSpec = arg['_'].shift();
        var path = new Path(Path.abs(executeContext.getEnv('$PWD', '/'), pathSpec));

        fileSystem.unlink(path).then(
          function() {
            return rmNext();
          }
        ).catch(function(e) {
          var errorString;

          if (e instanceof AxiomError) {
            errorString = e.errorName;
          } else {
            errorString = e.toString();
          }

          executeContext.stdout('rm: ' + path.originalSpec + ': ' + errorString + '\n');
          return rmNext();
        });
      };

      return rmNext();
    };

    __es6_export__("main", main);
    __es6_export__("default", main);

    main.argSigil = '%';
  }
);

//# sourceMappingURL=rm.js.map
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
  "wash/exe/wash",
  ["axiom/core/error", "axiom/fs/data_type", "axiom/fs/base/open_context", "axiom/fs/path", "axiom/fs/js/file_system", "axiom/fs/js/entry", "wash/termcap", "exports"],
  function(
    axiom$core$error$$,
    axiom$fs$data_type$$,
    axiom$fs$base$open_context$$,
    axiom$fs$path$$,
    axiom$fs$js$file_system$$,
    axiom$fs$js$entry$$,
    wash$termcap$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var AxiomError;
    AxiomError = axiom$core$error$$["default"];
    var DataType;
    DataType = axiom$fs$data_type$$["default"];
    var OpenContext;
    OpenContext = axiom$fs$base$open_context$$["default"];
    var Path;
    Path = axiom$fs$path$$["default"];
    var JsFileSystem;
    JsFileSystem = axiom$fs$js$file_system$$["default"];
    var JsEntry;
    JsEntry = axiom$fs$js$entry$$["default"];
    var Termcap;
    Termcap = wash$termcap$$["default"];

    /** @typedef ExecuteContext$$module$axiom$fs$base$execute_context */
    var ExecuteContext;

    /** @typedef JsExecuteContext$$module$axiom$fs$js$execute_context */
    var JsExecuteContext;

    /** @typedef ReadResult$$module$axiom$fs$read_result */
    var ReadResult;

    /** @typedef StatResult$$module$axiom$fs$stat_result */
    var StatResult;

    var Wash = function(executeContext) {
      /** @type {JsExecuteContext} */
      this.executeContext = executeContext;

      /** @type {JsFileSystem} */
      this.fileSystem = executeContext.jsfs;

      /** @type {string} */
      this.historyFile = executeContext.getEnv('$HISTFILE', '');

      /** @type {Array<string>} */
      this.inputHistory = [];

      /**
       * @private @type {Array<JsExecuteContext>}
       * The list of currently active jobs.
       */
      this.executeContextList_ = [];

      /**
       * @private @type {Array<JsExecuteContext>}
       */
      this.foregroundContext_ = null;

      /**
       * @private @type {Termcap}
       */
      this.tc_ = new Termcap();

      /**
       * @private @type {string}
       */
      this.promptString_ = this.tc_.output(
          '%set-attr(FG_BOLD, FG_CYAN)wash$ %set-attr()');

      executeContext.onSignal.addListener(this.onSignal_.bind(this));

      var builtins = new Wash.Builtins(this);
      this.builtinsFS = new JsFileSystem();
      this.builtinsFS.rootDirectory.install(builtins.callbacks);

      if (!this.executeContext.getEnv('$PWD'))
        this.executeContext.setEnv('$PWD', '/');

      if (!this.executeContext.getEnv('$HOME'))
        this.executeContext.setEnv('$HOME', '/home');
    };

    __es6_export__("Wash", Wash);

    /**
     * Set to true to make the shell exit if a subcommand errors.
     *
     * This can help debug infinite-loop at startup issues.
     *
     * @type {boolean}
     */
    Wash.exitOnError = false;

    /**
     * @constructor
     *
     * Shell builtins.  These can't be done as separate executables because they
     * alter state of the controlling Wash instance or have privileged access to it.
     *
     * @param {Wash} wash
     */
    Wash.Builtins = function(wash) {
      /** @type {Object<string, function(JsExecuteContext): Promise<*>>} */
      this.callbacks = {
        /**
         * @param {JsExecuteContext} cx
         */
        'cd($)': function(cx) {
          cx.ready();

          if (typeof cx.arg != 'string')
            return cx.closeError(new AxiomError.TypeMismatch('string', cx.arg));

          /** @type {string} */
          var pathSpec = wash.absPath(cx.arg || cx.getEnv('$HOME', '/'));
          var path = new Path(pathSpec);

          wash.fileSystem.stat(path).then(
            function(/** StatResult */ statResult) {
              if (!(statResult.mode & Path.Mode.D)) {
                return cx.closeError(
                  new AxiomError.TypeMismatch('dir', path.originalSpec));
              }

              if (!/\/$/.test(pathSpec))
                pathSpec += '/';

              wash.executeContext.setEnv('$PWD', pathSpec);
              cx.closeOk();
            }
          );
        },

        /**
         * @param {JsExecuteContext} cx
         */
        'env-del(@)': function(cx) {
          cx.ready();

          var arg = cx.arg;
          for (var i = 0; i < arg.length; i++) {
            wash.executeContext.delEnv(arg[i]);
          }

          cx.closeOk();
        },

        /**
         * @param {JsExecuteContext} cx
         */
        'env-get(@)': function(cx) {
          cx.ready();

          var arg = cx.arg;
          if (!arg.length)
            return cx.closeOk(wash.executeContext.getEnvs());

          var rv = {};
          for (var i = 0; i < arg.length; i++) {
            rv[arg[i]] = wash.executeContext.getEnv(arg[i]);
          }

          cx.closeOk(rv);
        },

        /**
         * @param {JsExecuteContext} cx
         */
        'env-set(%)': function(cx) {
          cx.ready();

          var arg = cx.arg;
          for (var name in arg) {
            var value = arg[name];
            var sigil = name.substr(0, 1);
            if ('$@%'.indexOf(sigil) == -1)
              return cx.closeError(new AxiomError.Invalid('name', name));

            if (!((sigil == '$' && typeof value == 'string') ||
                  (sigil == '@' && value instanceof Array) ||
                  (sigil == '%' && value instanceof Object))) {
              return cx.closeError(new AxiomError.TypeMismatch(sigil, value));
            }

            wash.executeContext.setEnv(name, value);
          }
        }
      };
    };

    __es6_export__("default", Wash.main = function(cx) {
      var wash = new Wash(cx);

      if (typeof window != 'undefined')
        window.wash_ = wash;  // Console debugging aid.

      cx.ready();

      var repl = wash.readEvalPrintLoop.bind(wash);
      wash.loadWashHistory().then(repl).catch(repl);
      return cx.ephemeralPromise;
    });

    /** @type {string} */
    Wash.main.argSigil = '%';

    /**
     * @return {!Promise<null>}
     */
    Wash.prototype.loadWashHistory = function() {
      if (!this.historyFile)
        return Promise.resolve(null);

      return this.fileSystem.readFile(
          new Path(this.historyFile), DataType.UTF8String).then(
        function(/** ReadResult */ result) {
          try {
            if (typeof result.data != 'string') {
              return Promise.reject(new AxiomError.TypeMismatch(
                  'string', typeof result.data));
            }
            var history = JSON.parse(result.data);
            if (history instanceof Array)
              this.inputHistory = history;
          } catch (ex) {
            this.errorln('Error loading: ' + this.historyFile);
            this.printErrorValue(ex);
          }

          return Promise.resolve(null);
        }.bind(this)
      ).catch(
        function(err) {
          if (!AxiomError.NotFound.test(err))
            this.printErrorValue(err);

          return Promise.reject(err);
        }.bind(this)
      );
    };

    /**
     * @param {string} path
     * @return {string}
     */
    Wash.prototype.absPath = function(path) {
      return Path.abs(this.executeContext.getEnv('$PWD', '/'), path);
    };

    /**
     * @param {string} path
     * @return {!Promise<!{absPath: string, statResult: StatResult}>}
     */
    Wash.prototype.findExecutable = function(path) {
      var searchList = this.executeContext.getEnv('@PATH', ['/']);

      /** @type {function(): !Promise<!{absPath: string, statResult: StatResult}>} */
      var searchNextPath = function() {
        if (!searchList.length)
          return Promise.reject(new AxiomError.NotFound('path', path));

        var currentPrefix = searchList.shift();
        var currentPath = new Path(currentPrefix + '/' + path);
        return this.fileSystem.stat(currentPath).then(
          function(statResult) {
            if (statResult.mode & Path.Mode.X)
              return Promise.resolve({absPath: currentPath.spec,
                                      statResult: statResult});
            return searchNextPath();
          }
        ).catch(function(value) {
          if (AxiomError.NotFound.test(value))
            return searchNextPath();

          return Promise.reject(value);
        });
      }.bind(this);

      return searchNextPath();
    };

    /**
     * @return {!Promise<*>}
     */
    Wash.prototype.read = function() {
      return this.findExecutable('readline').then(
        function(result) {
          return this.executeContext.call(
              this.fileSystem,
              new Path(result.absPath),
              { promptString: this.promptString_,
                inputHistory: this.inputHistory
              });
        }.bind(this));
    };

    /**
     * Evaluate a single line of input.
     *
     * @param {string} str
     * @return {!Promise<*>} Resolves to result of the evaluation.
     */
    Wash.prototype.evaluate = function(str) {
      str = str.trim();

      if (!str)
        return Promise.resolve();

      if (str != this.inputHistory[0])
        this.inputHistory.unshift(str);

      var ary = this.parseShellInput(str);
      return this.dispatch(ary[0], ary[1]);
    };

    /**
     * Read a single line of input, eval it, print the result or an error.
     *
     * @return {Promise<*>} Resolves to result of the evaluation.
     */
    Wash.prototype.readEvalPrint = function() {
      return this.read().then(
        function(result) {
          if (result == null || result == 'exit') {
            if (!result)
              this.executeContext.stdout('exit\n');
            return this.exit();
          }

          if (typeof result != 'string') {
            return Promise.reject(new AxiomError.Runtime(
                'Unexpected type from readline: ' + (typeof result)));
          }

          return this.evaluate(result).then(
            function(value) {
              if (typeof value != 'undefined' && typeof value != 'number' &&
                  value != null) {
                this.println(JSON.stringify(value, null, '  '));
              }

              return Promise.resolve(value);
            }.bind(this));
        }.bind(this)
      ).catch(
        function(error) {
          this.printErrorValue(error);
          return Promise.reject(error);
        }.bind(this)
      );
    };

    /**
     * Read-eval-print-loop.
     *
     * @return {Promise<*>} Resolves to the value of the final evaluation.
     */
    Wash.prototype.readEvalPrintLoop = function() {
      return this.readEvalPrint().then(
        function(value) {
          if (this.executeContext.isEphemeral('Ready'))
            return this.readEvalPrintLoop();

          return Promise.resolve(value);
        }.bind(this)
      ).catch(
        function(value) {
          if (!Wash.exitOnError) {
            if (this.executeContext.isEphemeral('Ready'))
              return this.readEvalPrintLoop();
          }

          return Promise.reject(value);
        }.bind(this)
      );
    };

    /**
     * Parse a line of shell input into the path and the argument string.
     *
     * @return {Array<string>}
     */
    Wash.prototype.parseShellInput = function(str) {
      var pos = str.indexOf(' ');
      var path, argv;
      if (pos > -1) {
        path = str.substr(0, pos);
        argv = str.substr(pos + 1).trim();
      } else {
        path = str;
        argv = null;
      }

      if (path.substr(0, 2) == './')
        path = this.executeContext.getEnv('$PWD', '/') + path.substr(2);

      return [path, argv];
    };

    /**
     * Run the given path with the given argv string, returning a promise that
     * resolves to the result of the evaluation.
     *
     * For relative paths we'll search the builtins as well as $PATH.  The argv
     * string will be parsed according to the sigil of the target executable.
     *
     * @param {string} pathSpec
     * @param {string} argv
     * @return {!Promise<*>}
     */
    Wash.prototype.dispatch = function(pathSpec, argv) {
      var path = new Path(pathSpec);
      return this.builtinsFS.stat(path).then(
        function(/** StatResult */ statResult) {
          argv = this.parseArgv(statResult.argSigil, argv);
          return this.builtinsFS.createExecuteContext(path, argv).then(
            function(/** ExecuteContext */ cx) {
              return this.dispatchExecuteContext(cx);
            }.bind(this));
        }.bind(this)
      ).catch(
        function(error) {
          if (!AxiomError.NotFound.test(error))
            return error;

          return this.findExecutable(path.spec).then(
            function(/** {absPath: string, statResult: StatResult } */ result) {
              argv = this.parseArgv(result.statResult.argSigil, argv);
              return this.fileSystem.createExecuteContext(
                  new Path(result.absPath), argv).then(
                function(cx) {
                  return this.dispatchExecuteContext(cx);
                }.bind(this));
            }.bind(this));
        }.bind(this)
      );
    };

    /**
     * @param {ExecuteContext} cx
     * @return {Promise<*>}
     */
    Wash.prototype.dispatchExecuteContext = function(cx) {
      this.executeContext.setCallee(cx);
      return cx.execute();
    };

    Wash.prototype.parseArgv = function(argSigil, argv) {
      if (!argv)
        argv = '';

      if (/[\{\[\"\']/.test(argv.substr(0, 1))) {
        // argv starts with {, [, ", or '... parse it as JSON.
        try {
          return JSON.parse(argv);
        } catch (ex) {
          throw new AxiomError.Runtime('Error parsing arguments: ' + ex);
        }

      } else {
        if (argSigil == '$' || argSigil == '*')
          return argv;

        if (argSigil == '@')
          return argv ? argv.split(/\s+/g) : [];

        if (argSigil == '%') {
          throw new AxiomError.Runtime('TODO: fix minimist support');
          //return minimist(argv.split(/\s+/g), {});
        }
      }
    };

    Wash.prototype.printErrorValue = function(value) {
      var args = [];
      if (!(value instanceof AxiomError)) {
        if (value instanceof Error) {
          //console.log('printErrorValue:', value, value.stack);
          var stack = value.stack;
          value = new AxiomError.Runtime(value.message);
          value.stack = stack;
        } else if (value instanceof Object) {
          value = new AxiomError.Runtime(value.toString());
        } else {
          value = new AxiomError.Runtime(JSON.stringify(value));
        }
      }

      for (var key in value.errorValue) {
        args.push(key + ': ' + JSON.stringify(value.errorValue[key]));
      }

      var str = this.tc_.output('%set-attr(FG_BOLD, FG_RED)Error%set-attr(): ' +
                                value.errorName);
      if (args.length)
        str += ' {' + args.join(', ') + '}';

      if (!AxiomError.Interrupt.test(value) && value.stack)
        str += '\n' + value.stack;

      this.errorln(str);
    };

    Wash.prototype.exit = function() {
      if (!this.historyFile)
        return this.executeContext.closeOk(null);

      return this.fileSystem.writeFile(
          new Path(this.historyFile),
          DataType.UTF8String,
          JSON.stringify(this.inputHistory, null, '  ') + '\n'
      ).then(
          function() {
            return this.executeContext.closeOk(null);
          }.bind(this)
      ).catch(
        function(error) {
          // TODO: writeFile should only raise AxiomErrors.
          //if (error instanceof window.FileError)
          //  error = domfsUtil.convertFileError(this.historyFile, error);

          this.printErrorValue(error);
          this.executeContext.closeOk(null);
        }.bind(this)
      );
    };

    Wash.prototype.println = function(str) {
      this.executeContext.stdout(str + '\n');
    };

    Wash.prototype.errorln = function(str) {
      this.executeContext.stderr(str + '\n');
    };

    Wash.prototype.onSignal_ = function(name) {
      console.log('Caught signal: ' + name);
      if (name == 'interrupt') {
        var str = this.tc_.output('%set-attr(FG_BOLD, FG_RED)Interrupt%set-attr()');
        this.errorln(str);

        this.readEvalPrintLoop();
      }
    };
  }
);

//# sourceMappingURL=wash.js.map
// GENERATED BY grunt make_dir_module.
define(
  "wash/exe_modules",
  ["wash/exe/cat", "wash/exe/clear", "wash/exe/cp", "wash/exe/echo", "wash/exe/ls", "wash/exe/mkdir", "wash/exe/pwd", "wash/exe/readline", "wash/exe/rm", "wash/exe/wash", "exports"],
  function(
    wash$exe$cat$$,
    wash$exe$clear$$,
    wash$exe$cp$$,
    wash$exe$echo$$,
    wash$exe$ls$$,
    wash$exe$mkdir$$,
    wash$exe$pwd$$,
    wash$exe$readline$$,
    wash$exe$rm$$,
    wash$exe$wash$$,
    __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var m0;
    m0 = wash$exe$cat$$["default"];
    var m1;
    m1 = wash$exe$clear$$["default"];
    var m2;
    m2 = wash$exe$cp$$["default"];
    var m3;
    m3 = wash$exe$echo$$["default"];
    var m4;
    m4 = wash$exe$ls$$["default"];
    var m5;
    m5 = wash$exe$mkdir$$["default"];
    var m6;
    m6 = wash$exe$pwd$$["default"];
    var m7;
    m7 = wash$exe$readline$$["default"];
    var m8;
    m8 = wash$exe$rm$$["default"];
    var m9;
    m9 = wash$exe$wash$$["default"];
    var dir = {};
    __es6_export__("dir", dir);
    __es6_export__("default", dir);
    dir["cat"] = m0;
    dir["clear"] = m1;
    dir["cp"] = m2;
    dir["echo"] = m3;
    dir["ls"] = m4;
    dir["mkdir"] = m5;
    dir["pwd"] = m6;
    dir["readline"] = m7;
    dir["rm"] = m8;
    dir["wash"] = m9;
  }
);

//# sourceMappingURL=exe_modules.js.map
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
 * @constructor
 *
 * Class used to convert lib.replaceVars-like strings into actual terminal
 * escape.
 *
 * This is roughly analogous to Linux's termcap library.
 *
 * Instances of this class are able to translate both outgoing strings and
 * incoming key sequences.
 */
define("wash/termcap", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  var Termcap = function() {};
  __es6_export__("Termcap", Termcap);
  __es6_export__("default", Termcap);

  /**
   * Replace %<function>(VAR,...) and %(VAR) patterns in the given string, using
   * the set of output functions and variables.
   *
   * Use this for string you intend to write to the terminal.  For example,
   * the default prompt for wash: '%set-attr(FG_BOLD, FG_CYAN)wash$ %set-attr()'.
   *
   * See the outputVars and outputFunctions below for the list of valid stuff.
   * @param {string} str
   * @param {Object=} opt_vars
   */
  Termcap.prototype.output = function(str, opt_vars) {
    var vars;
    if (opt_vars) {
      vars = Object.create(this.outputVars);
      for (var key in opt_vars) {
        vars[key] = opt_vars[key];
      }
    } else {
      vars = this.outputVars;
    }

    return Termcap.replaceVars_(str, vars, this.outputFunctions);
  };

  /**
   * Replace %<function>(VAR,...) and %(VAR) patterns in the given string, using
   * the set of output functions and variables.
   *
   * Use this to convert mnemonic keystrokes into their byte sequences.  For
   * example, some default keybindings from lib_wa_readline.js:
   *
   *  '%ctrl("_")': 'undo',
   *  '%ctrl("/")': 'undo',
   *
   *  '%ctrl(LEFT)': 'backward-word',
   *  '%ctrl(RIGHT)': 'forward-word',
   *
   *  '%meta(BACKSPACE)': 'backward-kill-word',
   *  '%meta(DELETE)': 'kill-word',
   *
   * See the inputVars and inputFunctions below for the list of valid stuff.
   * 
   * @param {string} str
   * @param {Object=} opt_vars
   */
  Termcap.prototype.input = function(str, opt_vars) {
    var vars;
    if (opt_vars) {
      vars = Object.create(this.inputVars);
      for (var key in opt_vars) {
        vars[key] = opt_vars[key];
      }
    } else {
      vars = this.inputVars;
    }

    return Termcap.replaceVars_(str, vars, this.inputFunctions);
  };

  /**
   * The valid variables for Termcap..output()
   */
  Termcap.prototype.outputVars = {
    'FG_BOLD': '1',

    'FG_BLACK': '30',
    'FG_RED': '31',
    'FG_GREEN': '32',
    'FG_YELLOW': '33',
    'FG_BLUE': '34',
    'FG_MAGENTA': '35',
    'FG_CYAN': '36',
    'FG_WHITE': '37',
    'FG_DEFAULT': '39',

    'BG_BLACK': '40',
    'BG_RED': '41',
    'BG_GREEN': '42',
    'BG_YELLOW': '43',
    'BG_BLUE': '44',
    'BG_MAGENTA': '45',
    'BG_CYAN': '46',
    'BG_WHITE': '47',
    'BG_DEFAULT': '49',
  };

  /**
   * The valid functions for Termcap..output()
   */
  Termcap.prototype.outputFunctions = {
    'clear-terminal': function() {
      return '\x1b[2J';
    },

    'crlf': function(str) {
      return str.replace(/\n/g, '\r\n');
    },

    'set-attr': function(/* ... */) {
      var args = ['0'];
      args.push.apply(args, arguments);
      return '\x1b[' + args.join(';') + 'm';
    },

    'add-attr': function(/* ... */) {
      var args = [];
      args.push.apply(args, arguments);
      return '\x1b[' + args.join(';') + 'm';
    },

    'insert-blank': function(opt_count) {
      return ('\x1b[' + (opt_count || '') + '@');
    },

    'erase-chars': function(opt_count) {
      return ('\x1b[' + (opt_count || '') + 'X');
    },

    'erase-right': function() {
      return ('\x1b[K');
    },

    'set-row-column': function(row, column) {
      if (isNaN(row) || isNaN(column))
        throw new Error('Invalid row/column: ' + row + ', ' + column);
      return '\x1b[' + row + ';' + column + 'H';
    },

    'cursor-left': function(opt_count) {
      return ('\x1b[' + (opt_count || '') + 'D');
    },

    'cursor-right': function(opt_count) {
      return ('\x1b[' + (opt_count || '') + 'C');
    },

    'bell': function() {
      return ('\x07');
    },

    'insert-lines': function(opt_count) {
      return ('\x1b[' + (opt_count || '') + 'L');
    },

    'get-row-column': function() {
      return ('\x1b[6n');
    }
  };

  /**
   * The valid variables for Termcap..input()
   */
  Termcap.prototype.inputVars = {
    'BACKSPACE': '\x7f',
    'DELETE': '\x1b[3~',
    'DOWN': '\x1b[B',
    'END': '\x1b[F',
    'ENTER': '\r',
    'HOME': '\x1b[H',
    'INSERT': '\x1b[2~',
    'LEFT': '\x1b[D',
    'META': '\x1b',
    'PGDN': '\x1b[6~',
    'PGUP': '\x1b[5~',
    'RIGHT': '\x1b[C',
    'UP': '\x1b[A',
  };


  /**
   * The valid functions for Termcap..input()
   */
  Termcap.prototype.inputFunctions = {
    'shift': function(seq) {
      if (/\x1b\[/.test(seq))
        return Termcap.modcsi(';2', seq);

      if (seq.length == 1)
        return seq.toUpperCase();

      throw new Error('Invalid ctrl sequence: ' + seq);
    },

    'meta': function(seq) {
      if (/\x1b\[/.test(seq))
        return Termcap.modcsi(';3', seq);

      return '\x1b' + seq;
    },

    'shift-meta': function(seq) {
      if (/\x1b\[/.test(seq))
        return Termcap.modcsi(';4', seq);

      return '\x1b' + seq.toUpperCase();
    },

    'ctrl': function(seq) {
      if (/\x1b\[/.test(seq))
        return Termcap.modcsi(';5', seq);

      if (seq.length == 1)
        return String.fromCharCode(seq.toUpperCase().charCodeAt(0) - 64);

      throw new Error('Invalid ctrl sequence: ' + seq);
    },

    'shift-ctrl': function(seq) {
      if (/\x1b\[/.test(seq))
        return Termcap.modcsi(';6', seq);

      if (seq.length == 1)
        return String.fromCharCode(seq.toUpperCase().charCodeAt(0) - 64);

      throw new Error('Invalid shift-ctrl sequence: ' + seq);
    },

    'ctrl-meta': function(seq) {
      if (/\x1b\[/.test(seq))
        return Termcap.modcsi(';7', seq);

      if (seq.length == 1) {
        return '\x1b' + String.fromCharCode(
            seq.toUpperCase().charCodeAt(0) - 64);
      }

      throw new Error('Invalid ctrl-meta sequence: ' + seq);
    },

    'shift-ctrl-meta': function(seq) {
      if (/\x1b\[/.test(seq))
        return Termcap.modcsi(';8', seq);

      if (seq.length == 1) {
        return '\x1b' + String.fromCharCode(
            seq.toUpperCase().charCodeAt(0) - 64);
      }

      throw new Error('Invalid shift-ctrl-meta sequence: ' + seq);
    },
  };

  /**
   * Similar to lib.f.replaceVars, but allows for multiple-parameter functions
   * and string and integer literals.
   *
   * TODO(rginda): String literals are brittle.  We only check that they start
   * and end with double-quotes.  Comma-splitting is also brittle, and strings
   * containing commas will cause trouble.
   */
  Termcap.replaceVars_ = function(str, vars, functions) {
    var resolve = function(param, source) {
      if ((/^-?\d+$/.test(param)))
        return param;

      if ((/^\".*\"$/.test(param))) {
        return param.slice(1, -1);
      }

      if (typeof vars[param] == 'undefined') {
        throw new Error('Unknown variable: ' + source + ': ' + param);
      }

      return vars[param];
    };

    var doReplace = function(match, fn, paramstr) {
      if (!fn && !paramstr)
        return '%()';

      var ary;
      if (paramstr) {
        ary = paramstr.split(/\s*,\s*/);

        for (var i = 0; i < ary.length; ++i) {
          ary[i] = resolve(ary[i], '%' + fn + '(' + paramstr + ')');
        }
      }

      if (fn) {
        if (!(fn in functions))
          throw new Error('Unknown escape function: ' + fn);

        return functions[fn].apply(null, ary);
      }

      if (ary.length != 1)
        throw new Error('Expected single argument, got: ' + paramstr);

      return ary[0];
    };

    return str.replace(/%([a-z0-9+\-_]*)\(([^\)]*)\)/gi, doReplace);
  };

  Termcap.modcsi = function(mod, seq) {
    if (seq.length == 3) {
      // Some of the CSI sequences have zero parameters unless modified.
      return '\x1b[1' + mod + seq.substr(2, 1);
    }

    // Others always have at least one parameter.
    return seq.substr(0, seq.length - 1) + mod + seq.substr(seq.length - 1);
  };
});

//# sourceMappingURL=termcap.js.map