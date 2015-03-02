define("hterm/character_map", 
  ["hterm/util","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var util = __dependency1__["default"];

    /**
     * Character map object.
     *
     * @param {object} The GL mapping from input characters to output characters.
     *     The GR mapping will be automatically created.
     */
    var CharacterMap = function(name, glmap) {
      /**
       * Short name for this character set, useful for debugging.
       */
      this.name = name;

      /**
       * The function to call to when this map is installed in GL.
       */
      this.GL = null;

      /**
       * The function to call to when this map is installed in GR.
       */
      this.GR = null;

      if (glmap)
        this.reset(glmap);
    };
    __exports__.CharacterMap = CharacterMap;
    __exports__["default"] = CharacterMap;

    /**
     * @param {object} The GL mapping from input characters to output characters.
     *     The GR mapping will be automatically created.
     */
    CharacterMap.prototype.reset = function(glmap) {
      // Set the the GL mapping.
      this.glmap = glmap;

      var glkeys = Object.keys(this.glmap).map(function(key) {
          return '\\x' + util.string.zpad(key.charCodeAt(0).toString(16));
        });

      this.glre = new RegExp('[' + glkeys.join('') + ']', 'g');

      // Compute the GR mapping.
      // This is the same as GL except all keys have their MSB set.
      this.grmap = {};

      glkeys.forEach(function(glkey) {
          var grkey = String.fromCharCode(glkey.charCodeAt(0) & 0x80);
          this.grmap[grkey] = this.glmap[glkey];
        }.bind(this));

      var grkeys = Object.keys(this.grmap).map(function(key) {
          return '\\x' + util.string.zpad(key.charCodeAt(0).toString(16), 2);
        });

      this.grre = new RegExp('[' + grkeys.join('') + ']', 'g');

      this.GL = function(str) {
        return str.replace(this.glre,
                           function(ch) { return this.glmap[ch] }.bind(this));
      }.bind(this);

      this.GR = function(str) {
        return str.replace(this.grre,
                           function(ch) { return this.grmap[ch] }.bind(this));
      }.bind(this);
    };

    /**
     * Mapping from received to display character, used depending on the active
     * VT character set.
     */
    CharacterMap.maps = {};

    /**
     * VT100 Graphic character map.
     * http://vt100.net/docs/vt220-rm/table2-4.html
     */
    CharacterMap.maps['0'] = new CharacterMap(
        'graphic', {
          '\x60':'\u25c6',  // ` -> diamond
          '\x61':'\u2592',  // a -> grey-box
          '\x62':'\u2409',  // b -> h/t
          '\x63':'\u240c',  // c -> f/f
          '\x64':'\u240d',  // d -> c/r
          '\x65':'\u240a',  // e -> l/f
          '\x66':'\u00b0',  // f -> degree
          '\x67':'\u00b1',  // g -> +/-
          '\x68':'\u2424',  // h -> n/l
          '\x69':'\u240b',  // i -> v/t
          '\x6a':'\u2518',  // j -> bottom-right
          '\x6b':'\u2510',  // k -> top-right
          '\x6c':'\u250c',  // l -> top-left
          '\x6d':'\u2514',  // m -> bottom-left
          '\x6e':'\u253c',  // n -> line-cross
          '\x6f':'\u23ba',  // o -> scan1
          '\x70':'\u23bb',  // p -> scan3
          '\x71':'\u2500',  // q -> scan5
          '\x72':'\u23bc',  // r -> scan7
          '\x73':'\u23bd',  // s -> scan9
          '\x74':'\u251c',  // t -> left-tee
          '\x75':'\u2524',  // u -> right-tee
          '\x76':'\u2534',  // v -> bottom-tee
          '\x77':'\u252c',  // w -> top-tee
          '\x78':'\u2502',  // x -> vertical-line
          '\x79':'\u2264',  // y -> less-equal
          '\x7a':'\u2265',  // z -> greater-equal
          '\x7b':'\u03c0',  // { -> pi
          '\x7c':'\u2260',  // | -> not-equal
          '\x7d':'\u00a3',  // } -> british-pound
          '\x7e':'\u00b7',  // ~ -> dot
        });

    /**
     * British character map.
     * http://vt100.net/docs/vt220-rm/table2-5.html
     */
    CharacterMap.maps['A'] = new CharacterMap(
        'british', {
          '\x23': '\u00a3',  // # -> british-pound
        });

    /**
     * US ASCII map, no changes.
     */
    CharacterMap.maps['B'] = new CharacterMap(
        'us', null);

    /**
     * Dutch character map.
     * http://vt100.net/docs/vt220-rm/table2-6.html
     */
    CharacterMap.maps['4'] = new CharacterMap(
        'dutch', {
          '\x23': '\u00a3',  // # -> british-pound

          '\x40': '\u00be',  // @ -> 3/4

          '\x5b': '\u0132',  // [ -> 'ij' ligature (xterm goes with \u00ff?)
          '\x5c': '\u00bd',  // \ -> 1/2
          '\x5d': '\u007c',  // ] -> vertical bar

          '\x7b': '\u00a8',  // { -> two dots
          '\x7c': '\u0066',  // | -> f
          '\x7d': '\u00bc',  // } -> 1/4
          '\x7e': '\u00b4',  // ~ -> acute
        });

    /**
     * Finnish character map.
     * http://vt100.net/docs/vt220-rm/table2-7.html
     */
    CharacterMap.maps['C'] =
    CharacterMap.maps['5'] = new CharacterMap(
        'finnish', {
          '\x5b': '\u00c4',  // [ -> 'A' umlaut
          '\x5c': '\u00d6',  // \ -> 'O' umlaut
          '\x5d': '\u00c5',  // ] -> 'A' ring
          '\x5e': '\u00dc',  // ~ -> 'u' umlaut

          '\x60': '\u00e9',  // ` -> 'e' acute

          '\x7b': '\u00e4',  // { -> 'a' umlaut
          '\x7c': '\u00f6',  // | -> 'o' umlaut
          '\x7d': '\u00e5',  // } -> 'a' ring
          '\x7e': '\u00fc',  // ~ -> 'u' umlaut
        });

    /**
     * French character map.
     * http://vt100.net/docs/vt220-rm/table2-8.html
     */
    CharacterMap.maps['R'] = new CharacterMap(
        'french', {
          '\x23': '\u00a3',  // # -> british-pound

          '\x40': '\u00e0',  // @ -> 'a' grave

          '\x5b': '\u00b0',  // [ -> ring
          '\x5c': '\u00e7',  // \ -> 'c' cedilla
          '\x5d': '\u00a7',  // ] -> section symbol (double s)

          '\x7b': '\u00e9',  // { -> 'e' acute
          '\x7c': '\u00f9',  // | -> 'u' grave
          '\x7d': '\u00e8',  // } -> 'e' grave
          '\x7e': '\u00a8',  // ~ -> umlaut
        });

    /**
     * French Canadian character map.
     * http://vt100.net/docs/vt220-rm/table2-9.html
     */
    CharacterMap.maps['Q'] = new CharacterMap(
        'french canadian', {
          '\x40': '\u00e0',  // @ -> 'a' grave

          '\x5b': '\u00e2',  // [ -> 'a' circumflex
          '\x5c': '\u00e7',  // \ -> 'c' cedilla
          '\x5d': '\u00ea',  // ] -> 'e' circumflex
          '\x5e': '\u00ee',  // ^ -> 'i' circumflex

          '\x60': '\u00f4',  // ` -> 'o' circumflex

          '\x7b': '\u00e9',  // { -> 'e' acute
          '\x7c': '\u00f9',  // | -> 'u' grave
          '\x7d': '\u00e8',  // } -> 'e' grave
          '\x7e': '\u00fb',  // ~ -> 'u' circumflex
        });

    /**
     * German character map.
     * http://vt100.net/docs/vt220-rm/table2-10.html
     */
    CharacterMap.maps['K'] = new CharacterMap(
        'german', {
          '\x40': '\u00a7',  // @ -> section symbol (double s)

          '\x5b': '\u00c4',  // [ -> 'A' umlaut
          '\x5c': '\u00d6',  // \ -> 'O' umlaut
          '\x5d': '\u00dc',  // ] -> 'U' umlaut

          '\x7b': '\u00e4',  // { -> 'a' umlaut
          '\x7c': '\u00f6',  // | -> 'o' umlaut
          '\x7d': '\u00fc',  // } -> 'u' umlaut
          '\x7e': '\u00df',  // ~ -> eszett
        });

    /**
     * Italian character map.
     * http://vt100.net/docs/vt220-rm/table2-11.html
     */
    CharacterMap.maps['Y'] = new CharacterMap(
        'italian', {
          '\x23': '\u00a3',  // # -> british-pound

          '\x40': '\u00a7',  // @ -> section symbol (double s)

          '\x5b': '\u00b0',  // [ -> ring
          '\x5c': '\u00e7',  // \ -> 'c' cedilla
          '\x5d': '\u00e9',  // ] -> 'e' acute

          '\x60': '\u00f9',  // ` -> 'u' grave

          '\x7b': '\u00e0',  // { -> 'a' grave
          '\x7c': '\u00f2',  // | -> 'o' grave
          '\x7d': '\u00e8',  // } -> 'e' grave
          '\x7e': '\u00ec',  // ~ -> 'i' grave
        });

    /**
     * Norwegian/Danish character map.
     * http://vt100.net/docs/vt220-rm/table2-12.html
     */
    CharacterMap.maps['E'] =
    CharacterMap.maps['6'] = new CharacterMap(
        'norwegian/danish', {
          '\x40': '\u00c4',  // @ -> 'A' umlaut

          '\x5b': '\u00c6',  // [ -> 'AE' ligature
          '\x5c': '\u00d8',  // \ -> 'O' stroke
          '\x5d': '\u00c5',  // ] -> 'A' ring
          '\x5e': '\u00dc',  // ^ -> 'U' umlaut

          '\x60': '\u00e4',  // ` -> 'a' umlaut

          '\x7b': '\u00e6',  // { -> 'ae' ligature
          '\x7c': '\u00f8',  // | -> 'o' stroke
          '\x7d': '\u00e5',  // } -> 'a' ring
          '\x7e': '\u00fc',  // ~ -> 'u' umlaut
        });

    /**
     * Spanish character map.
     * http://vt100.net/docs/vt220-rm/table2-13.html
     */
    CharacterMap.maps['Z'] = new CharacterMap(
        'spanish', {
          '\x23': '\u00a3',  // # -> british-pound

          '\x40': '\u00a7',  // @ -> section symbol (double s)

          '\x5b': '\u00a1',  // [ -> '!' inverted
          '\x5c': '\u00d1',  // \ -> 'N' tilde
          '\x5d': '\u00bf',  // ] -> '?' inverted

          '\x7b': '\u00b0',  // { -> ring
          '\x7c': '\u00f1',  // | -> 'n' tilde
          '\x7d': '\u00e7',  // } -> 'c' cedilla
        });

    /**
     * Swedish character map.
     * http://vt100.net/docs/vt220-rm/table2-14.html
     */
    CharacterMap.maps['7'] =
    CharacterMap.maps['H'] = new CharacterMap(
        'swedish', {
          '\x40': '\u00c9',  // @ -> 'E' acute

          '\x5b': '\u00c4',  // [ -> 'A' umlaut
          '\x5c': '\u00d6',  // \ -> 'O' umlaut
          '\x5d': '\u00c5',  // ] -> 'A' ring
          '\x5e': '\u00dc',  // ^ -> 'U' umlaut

          '\x60': '\u00e9',  // ` -> 'e' acute

          '\x7b': '\u00e4',  // { -> 'a' umlaut
          '\x7c': '\u00f6',  // | -> 'o' umlaut
          '\x7d': '\u00e5',  // } -> 'a' ring
          '\x7e': '\u00fc',  // ~ -> 'u' umlaut
        });

    /**
     * Swiss character map.
     * http://vt100.net/docs/vt220-rm/table2-15.html
     */
    CharacterMap.maps['='] = new CharacterMap(
        'swiss', {
          '\x23': '\u00f9',  // # -> 'u' grave

          '\x40': '\u00e0',  // @ -> 'a' grave

          '\x5b': '\u00e9',  // [ -> 'e' acute
          '\x5c': '\u00e7',  // \ -> 'c' cedilla
          '\x5d': '\u00ea',  // ] -> 'e' circumflex
          '\x5e': '\u00ee',  // ^ -> 'i' circumflex
          '\x5f': '\u00e8',  // _ -> 'e' grave

          '\x60': '\u00f4',  // ` -> 'o' circumflex

          '\x7b': '\u00e4',  // { -> 'a' umlaut
          '\x7c': '\u00f6',  // | -> 'o' umlaut
          '\x7d': '\u00fc',  // } -> 'u' umlaut
          '\x7e': '\u00fb',  // ~ -> 'u' circumflex
        });
  });
define("hterm/config", 
  ["hterm/config_defs","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var configDefs = __dependency1__["default"];

    var Config = function() {
      this.values = {};

      for (var key in configDefs) {
        this.values[key] = configDefs[key][0];
      }

      this.observers = [];
    };
    __exports__.Config = Config;
    __exports__["default"] = Config;

    Config.prototype.get = function(name) {
      if (!(name in this.values))
        throw new Error('Unknown config value: ' + name);

      return this.values[name];
    };

    Config.prototype.set = function(name, value) {
      this.values[name] = value;
      this.observers.forEach(function(callback) { callback(name, value) });
    };

    Config.prototype.addObserver = function(callback) {
      this.observers.push(callback);
    };

    Config.prototype.removeObserver = function(callback) {
      var i = this.observers.indexOf(callback);
      this.observers.splice(i, 1);
    };
  });
define("hterm/config_defs", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var configDefs = {
      'alt-backspace-is-meta-backspace':
      [false, 'bool',
       'If set, undoes the Chrome OS Alt-Backspace->DEL remap, so that ' +
       'alt-backspace indeed is alt-backspace.'],

      'alt-is-meta':
      [false, 'bool',
       'Set whether the alt key acts as a meta key or as a distinct alt key.'],

      'alt-sends-what':
      ['escape', ['escape', '8-bit', 'browser-key'],
       'Controls how the alt key is handled.\n' +
       '\n' +
       '  escape....... Send an ESC prefix.\n' +
       '  8-bit........ Add 128 to the unshifted character as in xterm.\n' +
       '  browser-key.. Wait for the keypress event and see what the browser \n' +
       '                says.  (This won\'t work well on platforms where the \n' +
       '                browser performs a default action for some alt sequences.)'
      ],

      'audible-bell-sound':
      ['x-resource:ding', 'url',
       'Terminal bell sound.  Empty string for no audible bell.'],

      'desktop-notification-bell':
      [false, 'bool',
       'If true, terminal bells in the background will create a Web ' +
       'Notification. http://www.w3.org/TR/notifications/\n' +
       '\n'+
       'Displaying notifications requires permission from the user. When this ' +
       'option is set to true, hterm will attempt to ask the user for permission ' +
       'if necessary. Note browsers may not show this permission request if it ' +
       'did not originate from a user action.\n' +
       '\n' +
       'Chrome extensions with the "notfications" permission have permission to ' +
       'display notifications.'],

      'background-color':
      ['rgb(16, 16, 16)', 'color',
       'The background color for text with no other color attributes.'],

      'background-image':
      ['', 'url',
       'The background image.'],

      'background-size':
      ['', 'string',
       'The background image size.'],

      'background-position':
      ['', 'string',
       'The background image position'],

      'backspace-sends-backspace':
      [false, 'bool',
       'If true, the backspace should send BS (\'\x08\', aka ^H).  Otherwise ' +
       'the backspace key should send \'\x7f\'.'],

      'cursor-blink':
      [false, 'bool',
       'Whether or not to blink the cursor by default.'],

      'cursor-blink-cycle':
      [[1000, 500], 'value',
       'The cursor blink rate in milliseconds.\n' +
       '\n' +
       'A two element array, the first of which is how long the cursor should be ' +
       'on, second is how long it should be off.'],

      'cursor-color':
      ['rgba(255, 0, 0, 0.5)', 'color',
       'The color of the visible cursor.'],

      'color-palette-overrides':
      [null, 'value',
       'Override colors in the default palette.\n' +
       '\n' +
       'This can be specified as an array or an object.  If specified as an ' +
       'object it is assumed to be a sparse array, where each property ' +
       'is a numeric index into the color palette.\n' +
       '\n' +
       'Values can be specified as almost any css color value.  This ' +
       'includes #RGB, #RRGGBB, rgb(...), rgba(...), and any color names ' +
       'that are also part of the stock X11 rgb.txt file.\n' +
       '\n' +
       'You can use \'null\' to specify that the default value should be not ' +
       'be changed.  This is useful for skipping a small number of indicies ' +
       'when the value is specified as an array.'],

      'copy-on-select':
      [true, 'bool',
       'Automatically copy mouse selection to the clipboard.'],

      'use-default-window-copy':
      [false, 'bool',
       'Whether to use the default window copy behaviour'],

      'clear-selection-after-copy':
      [true, 'bool',
       'Whether to clear the selection after copying.'],

      'ctrl-plus-minus-zero-zoom':
      [true, 'bool',
       'If true, Ctrl-Plus/Minus/Zero controls zoom. ' +
       'If false, Ctrl-Shift-Plus/Minus/Zero controls zoom, Ctrl-Minus sends ^_, ' +
       'Ctrl-Plus/Zero do nothing.'],

      'ctrl-c-copy':
      [false,
       'Ctrl+C copies if true, send ^C to host if false.  Ctrl+Shift+C sends ^C ' +
       'to host if true, copies if false.'],

      'ctrl-v-paste':
      [false, 'bool',
       'Ctrl+V pastes if true, send ^V to host if false.  Ctrl+Shift+V sends ^V ' +
       'to host if true, pastes if false.'],

      'east-asian-ambiguous-as-two-column':
      [false, 'bool',
       'Set whether East Asian Ambiguous characters have two column width.'],

      'enable-8-bit-control':
      [false, 'bool',
       'True to enable 8-bit control characters, false to ignore them.'],

      'enable-bold':
      [null, 'tristate',
       'True if we should use bold weight font for text with the bold/bright ' +
       'attribute.  False to use the normal weight font.  Null to autodetect.'],

      'enable-bold-as-bright':
      [true, 'bool',
       'True if we should use bright colors (8-15 on a 16 color palette) ' +
       'for any text with the bold attribute.  False otherwise.'],

      'enable-clipboard-notice':
      [true, 'bool',
       'Show a message in the terminal when the host writes to the clipboard.'],

      'enable-clipboard-write':
      [true, 'bool',
       'Allow the host to write directly to the system clipboard.'],

      'enable-dec12':
      [false, 'bool',
       'Respect the host\'s attempt to change the cursor blink status using ' +
       'DEC Private Mode 12.'],

      'font-family':
      ['"DejaVu Sans Mono", "Everson Mono", FreeMono, "Menlo", "Terminal", ' +
       'monospace', 'string',
       'Default font family for the terminal text.'],

      'font-size':
      [15, 'int',
       'The default font size in pixels.'],

      'font-smoothing':
      ['antialiased', 'string',
       'CSS font-smoothing property.'],

      'foreground-color':
      ['rgb(240, 240, 240)', 'color',
       'The foreground color for text with no other color attributes.'],

      'home-keys-scroll':
      [false, 'bool',
       'If true, home/end will control the terminal scrollbar and shift home/end ' +
       'will send the VT keycodes.  If false then home/end sends VT codes and ' +
       'shift home/end scrolls.'],

      'max-string-sequence':
      [100000, 'int',
       'Max length of a DCS, OSC, PM, or APS sequence before we give up and ' +
       'ignore the code.'],

      'media-keys-are-fkeys':
      [false, 'bool',
       'If true, convert media keys to their Fkey equivalent. If false, let ' +
       'the browser handle the keys.'],

      'meta-sends-escape':
      [true, 'bool',
       'Set whether the meta key sends a leading escape or not.'],

      'mouse-paste-button':
      [null, 'int',
       'Mouse paste button, or null to autodetect.\n' +
       '\n' +
       'For autodetect, we\'ll try to enable middle button paste for non-X11 ' +
       'platforms.  On X11 we move it to button 3.'],

      'page-keys-scroll':
      [false, 'bool',
       'If true, page up/down will control the terminal scrollbar and shift ' +
       'page up/down will send the VT keycodes.  If false then page up/down ' +
       'sends VT codes and shift page up/down scrolls.'],

      'pass-alt-number':
      [false, 'bool',
       'If true, Alt-1..9 will be handled by the browser.  If false, Alt-1..9 ' +
       'will be sent to the host.'],

      'pass-ctrl-number':
      [false, 'bool',
       'If true, Ctrl-1..9 will be handled by the browser.  If false, Ctrl-1..9 ' +
       'will be sent to the host.'],

      'pass-meta-number':
      [false, 'bool',
       'If true, Meta-1..9 will be handled by the browser.  If false, Meta-1..9 ' +
       'will be sent to the host.'],

      'pass-meta-v':
      [true, 'bool',
       'Set whether meta-V gets passed to host.'],

      'receive-encoding':
      ['utf-8', ['utf-8', 'raw'],
       'Set the expected encoding for data received from the host.'],

      'scroll-on-keystroke':
      [true, 'bool',
       'If true, scroll to the bottom on any keystroke.'],

      'scroll-on-output':
      [false, 'bool',
       'If true, scroll to the bottom on terminal output.'],

      'scrollbar-visible':
      [true, 'bool',
       'The vertical scrollbar mode.'],

      'send-encoding':
      ['utf-8', ['utf-8', 'raw'],
       'Set the encoding for data sent to host.'],

      'shift-insert-paste':
      [true, 'bool',
       'Shift + Insert pastes if true, sent to host if false.'],

      'user-css':
      ['', 'url',
       'User stylesheet to include in the terminal document.']
    };
    __exports__.configDefs = configDefs;
    __exports__["default"] = configDefs;
  });
define("hterm/i18n", 
  ["hterm/i18n/msg","hterm/i18n/utf8","hterm/i18n/wc","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var msg = __dependency1__["default"];
    var utf8 = __dependency2__["default"];
    var wc = __dependency3__["default"];

    var i18n = {
      msg: msg,
      utf8: utf8,
      wc: wc
    };
    __exports__.i18n = i18n;
    __exports__["default"] = i18n;
  });
define("hterm/i18n/msg", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    /**
     * Default messages used in hterm.
     *
     * They are intended to be somewhat universal, but you're free to override
     * them with something more appropriate for the users locale.
     */

    var msg = {};
    __exports__.msg = msg;__exports__["default"] = msg;

    /**
     * Warning message to display in the terminal when browser zoom is enabled.
     *
     * You can replace it with your own localized message.
     */
    msg.zoomWarning = 'ZOOM != 100%';

    /**
     * Brief overlay message displayed when text is copied to the clipboard.
     *
     * By default it is the unicode BLACK SCISSORS character, but you can
     * replace it with your own localized message.
     *
     * This is only displayed when the 'enable-clipboard-notice' preference
     * is enabled.
     */
    msg.notifyCopy = '\u2702';

    /**
     * Text shown in a desktop notification for the terminal
     * bell.  \u226a is a unicode EIGHTH NOTE, %(title) will
     * be replaced by the terminal title.
     */
    msg.desktopNotificationTitle = '\u266A %(title) \u266A';
  });
define("hterm/i18n/utf8", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var utf8 = {};
    __exports__.utf8 = utf8;__exports__["default"] = utf8;

    // TODO(davidben): When the string encoding API is implemented,
    // replace this with the native in-browser implementation.
    //
    // http://wiki.whatwg.org/wiki/StringEncoding
    // http://dvcs.w3.org/hg/encoding/raw-file/tip/Overview.html

    /**
     * A stateful UTF-8 decoder.
     */
    utf8.Decoder = function() {
      // The number of bytes left in the current sequence.
      this.bytesLeft = 0;
      // The in-progress code point being decoded, if bytesLeft > 0.
      this.codePoint = 0;
      // The lower bound on the final code point, if bytesLeft > 0.
      this.lowerBound = 0;
    };

    /**
     * Decodes a some UTF-8 data, taking into account state from previous
     * data streamed through the encoder.
     *
     * @param {String} str data to decode, represented as a JavaScript
     *     String with each code unit representing a byte between 0x00 to
     *     0xFF.
     * @return {String} The data decoded into a JavaScript UTF-16 string.
     */
    utf8.Decoder.prototype.decode = function(str) {
      var ret = '';
      for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (this.bytesLeft === 0) {
          if (c <= 0x7F) {
            ret += str.charAt(i);
          } else if (0xC0 <= c && c <= 0xDF) {
            this.codePoint = c - 0xC0;
            this.bytesLeft = 1;
            this.lowerBound = 0x80;
          } else if (0xE0 <= c && c <= 0xEF) {
            this.codePoint = c - 0xE0;
            this.bytesLeft = 2;
            this.lowerBound = 0x800;
          } else if (0xF0 <= c && c <= 0xF7) {
            this.codePoint = c - 0xF0;
            this.bytesLeft = 3;
            this.lowerBound = 0x10000;
          } else if (0xF8 <= c && c <= 0xFB) {
            this.codePoint = c - 0xF8;
            this.bytesLeft = 4;
            this.lowerBound = 0x200000;
          } else if (0xFC <= c && c <= 0xFD) {
            this.codePoint = c - 0xFC;
            this.bytesLeft = 5;
            this.lowerBound = 0x4000000;
          } else {
            ret += '\ufffd';
          }
        } else {
          if (0x80 <= c && c <= 0xBF) {
            this.bytesLeft--;
            this.codePoint = (this.codePoint << 6) + (c - 0x80);
            if (this.bytesLeft === 0) {
              // Got a full sequence. Check if it's within bounds and
              // filter out surrogate pairs.
              var codePoint = this.codePoint;
              if (codePoint < this.lowerBound ||
                  (0xD800 <= codePoint && codePoint <= 0xDFFF) ||
                  codePoint > 0x10FFFF) {
                ret += '\ufffd';
              } else {
                // Encode as UTF-16 in the output.
                if (codePoint < 0x10000) {
                  ret += String.fromCharCode(codePoint);
                } else {
                  // Surrogate pair.
                  codePoint -= 0x10000;
                  ret += String.fromCharCode(
                    0xD800 + ((codePoint >>> 10) & 0x3FF),
                    0xDC00 + (codePoint & 0x3FF));
                }
              }
            }
          } else {
            // Too few bytes in multi-byte sequence. Rewind stream so we
            // don't lose the next byte.
            ret += '\ufffd';
            this.bytesLeft = 0;
            i--;
          }
        }
      }
      return ret;
    };

    /**
     * Decodes UTF-8 data. This is a convenience function for when all the
     * data is already known.
     *
     * @param {String} str data to decode, represented as a JavaScript
     *     String with each code unit representing a byte between 0x00 to
     *     0xFF.
     * @return {String} The data decoded into a JavaScript UTF-16 string.
     */
    utf8.decode = function(str) {
      return (new utf8.Decoder()).decode(str);
    };

    /**
     * Encodes a UTF-16 string into UTF-8.
     *
     * TODO(davidben): Do we need a stateful version of this that can
     * handle a surrogate pair split in two calls? What happens if a
     * keypress event would have contained a character outside the BMP?
     *
     * @param {String} str The string to encode.
     * @return {String} The string encoded as UTF-8, as a JavaScript
     *     string with bytes represented as code units from 0x00 to 0xFF.
     */
    utf8.encode = function(str) {
      var ret = '';
      for (var i = 0; i < str.length; i++) {
        // Get a unicode code point out of str.
        var c = str.charCodeAt(i);
        if (0xDC00 <= c && c <= 0xDFFF) {
          c = 0xFFFD;
        } else if (0xD800 <= c && c <= 0xDBFF) {
          if (i+1 < str.length) {
            var d = str.charCodeAt(i+1);
            if (0xDC00 <= d && d <= 0xDFFF) {
              // Swallow a surrogate pair.
              c = 0x10000 + ((c & 0x3FF) << 10) + (d & 0x3FF);
              i++;
            } else {
              c = 0xFFFD;
            }
          } else {
            c = 0xFFFD;
          }
        }

        // Encode c in UTF-8.
        var bytesLeft;
        if (c <= 0x7F) {
          ret += str.charAt(i);
          continue;
        } else if (c <= 0x7FF) {
          ret += String.fromCharCode(0xC0 | (c >>> 6));
          bytesLeft = 1;
        } else if (c <= 0xFFFF) {
          ret += String.fromCharCode(0xE0 | (c >>> 12));
          bytesLeft = 2;
        } else /* if (c <= 0x10FFFF) */ {
          ret += String.fromCharCode(0xF0 | (c >>> 18));
          bytesLeft = 3;
        }

        while (bytesLeft > 0) {
          bytesLeft--;
          ret += String.fromCharCode(0x80 | ((c >>> (6 * bytesLeft)) & 0x3F));
        }
      }
      return ret;
    };
  });
define("hterm/i18n/wc", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of wc source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    /**
     * This JavaScript library is ported from the wcwidth.js module of node.js.
     * The original implementation can be found at:
     * https://npmjs.org/package/wcwidth.js
     */

    /**
     * JavaScript porting of Markus Kuhn's wcwidth() implementation
     *
     * The following explanation comes from the original C implementation:
     *
     * This is an implementation of wcwidth() and wcswidth() (defined in
     * IEEE Std 1002.1-2001) for Unicode.
     *
     * http://www.opengroup.org/onlinepubs/007904975/functions/wcwidth.html
     * http://www.opengroup.org/onlinepubs/007904975/functions/wcswidth.html
     *
     * In fixed-width output devices, Latin characters all occupy a single
     * "cell" position of equal width, whereas ideographic CJK characters
     * occupy two such cells. Interoperability between terminal-line
     * applications and (teletype-style) character terminals using the
     * UTF-8 encoding requires agreement on which character should advance
     * the cursor by how many cell positions. No established formal
     * standards exist at present on which Unicode character shall occupy
     * how many cell positions on character terminals. These routines are
     * a first attempt of defining such behavior based on simple rules
     * applied to data provided by the Unicode Consortium.
     *
     * For some graphical characters, the Unicode standard explicitly
     * defines a character-cell width via the definition of the East Asian
     * FullWidth (F), Wide (W), Half-width (H), and Narrow (Na) classes.
     * In all these cases, there is no ambiguity about which width a
     * terminal shall use. For characters in the East Asian Ambiguous (A)
     * class, the width choice depends purely on a preference of backward
     * compatibility with either historic CJK or Western practice.
     * Choosing single-width for these characters is easy to justify as
     * the appropriate long-term solution, as the CJK practice of
     * displaying these characters as double-width comes from historic
     * implementation simplicity (8-bit encoded characters were displayed
     * single-width and 16-bit ones double-width, even for Greek,
     * Cyrillic, etc.) and not any typographic considerations.
     *
     * Much less clear is the choice of width for the Not East Asian
     * (Neutral) class. Existing practice does not dictate a width for any
     * of these characters. It would nevertheless make sense
     * typographically to allocate two character cells to characters such
     * as for instance EM SPACE or VOLUME INTEGRAL, which cannot be
     * represented adequately with a single-width glyph. The following
     * routines at present merely assign a single-cell width to all
     * neutral characters, in the interest of simplicity. This is not
     * entirely satisfactory and should be reconsidered before
     * establishing a formal standard in this area. At the moment, the
     * decision which Not East Asian (Neutral) characters should be
     * represented by double-width glyphs cannot yet be answered by
     * applying a simple rule from the Unicode database content. Setting
     * up a proper standard for the behavior of UTF-8 character terminals
     * will require a careful analysis not only of each Unicode character,
     * but also of each presentation form, something the author of these
     * routines has avoided to do so far.
     *
     * http://www.unicode.org/unicode/reports/tr11/
     *
     * Markus Kuhn -- 2007-05-26 (Unicode 5.0)
     *
     * Copyright (C) 2012-2014 by Jun Woong and Tim Oxley.
     *
     * This package is a JavaScript porting of wcwidth() implementation by Markus
     * Kuhn.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to
     * deal in the Software without restriction, including without limitation the
     * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
     * sell copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * Latest version: http://www.cl.cam.ac.uk/~mgk25/ucs/wcwidth.c
     */

    /**
     * The following function defines the column width of an ISO 10646 character
     * as follows:
     *
     *  - The null character (U+0000) has a column width of 0.
     *  - Other C0/C1 control characters and DEL will lead to a return value of -1.
     *  - Non-spacing and enclosing combining characters (general category code Mn
     *    or Me in the Unicode database) have a column width of 0.
     *  - SOFT HYPHEN (U+00AD) has a column width of 1.
     *  - Other format characters (general category code Cf in the Unicode database)
     *    and ZERO WIDTH SPACE (U+200B) have a column width of 0.
     *  - Hangul Jamo medial vowels and final consonants (U+1160-U+11FF) have a
     *    column width of 0.
     *  - Spacing characters in the East Asian Wide (W) or East Asian Full-width (F)
     *    category as defined in Unicode Technical Report #11 have a column width of
     *    2.
     *  - East Asian Ambigous characters are taken into account if
     *    regardCjkAmbiguous flag is enabled. They have a column width of 2.
     *  - All remaining characters (including all printable ISO 8859-1 and WGL4
     *    characters, Unicode control characters, etc.) have a column width of 1.
     *
     * This implementation assumes that characters are encoded in ISO 10646.
     */

    var wc = {};
    __exports__.wc = wc;__exports__["default"] = wc;

    // Width of a nul character.
    wc.nulWidth = 0;

    // Width of a control charater.
    wc.controlWidth = 0;

    // Flag whether to consider East Asian Ambiguous characters.
    wc.regardCjkAmbiguous = false;

    // Width of an East Asian Ambiguous character.
    wc.cjkAmbiguousWidth = 2;

    // Sorted list of non-overlapping intervals of non-spacing characters
    // generated by "uniset +cat=Me +cat=Mn +cat=Cf -00AD +1160-11FF +200B c"
    wc.combining = [
        [ 0x0300, 0x036F ], [ 0x0483, 0x0486 ], [ 0x0488, 0x0489 ],
        [ 0x0591, 0x05BD ], [ 0x05BF, 0x05BF ], [ 0x05C1, 0x05C2 ],
        [ 0x05C4, 0x05C5 ], [ 0x05C7, 0x05C7 ], [ 0x0600, 0x0603 ],
        [ 0x0610, 0x0615 ], [ 0x064B, 0x065E ], [ 0x0670, 0x0670 ],
        [ 0x06D6, 0x06E4 ], [ 0x06E7, 0x06E8 ], [ 0x06EA, 0x06ED ],
        [ 0x070F, 0x070F ], [ 0x0711, 0x0711 ], [ 0x0730, 0x074A ],
        [ 0x07A6, 0x07B0 ], [ 0x07EB, 0x07F3 ], [ 0x0901, 0x0902 ],
        [ 0x093C, 0x093C ], [ 0x0941, 0x0948 ], [ 0x094D, 0x094D ],
        [ 0x0951, 0x0954 ], [ 0x0962, 0x0963 ], [ 0x0981, 0x0981 ],
        [ 0x09BC, 0x09BC ], [ 0x09C1, 0x09C4 ], [ 0x09CD, 0x09CD ],
        [ 0x09E2, 0x09E3 ], [ 0x0A01, 0x0A02 ], [ 0x0A3C, 0x0A3C ],
        [ 0x0A41, 0x0A42 ], [ 0x0A47, 0x0A48 ], [ 0x0A4B, 0x0A4D ],
        [ 0x0A70, 0x0A71 ], [ 0x0A81, 0x0A82 ], [ 0x0ABC, 0x0ABC ],
        [ 0x0AC1, 0x0AC5 ], [ 0x0AC7, 0x0AC8 ], [ 0x0ACD, 0x0ACD ],
        [ 0x0AE2, 0x0AE3 ], [ 0x0B01, 0x0B01 ], [ 0x0B3C, 0x0B3C ],
        [ 0x0B3F, 0x0B3F ], [ 0x0B41, 0x0B43 ], [ 0x0B4D, 0x0B4D ],
        [ 0x0B56, 0x0B56 ], [ 0x0B82, 0x0B82 ], [ 0x0BC0, 0x0BC0 ],
        [ 0x0BCD, 0x0BCD ], [ 0x0C3E, 0x0C40 ], [ 0x0C46, 0x0C48 ],
        [ 0x0C4A, 0x0C4D ], [ 0x0C55, 0x0C56 ], [ 0x0CBC, 0x0CBC ],
        [ 0x0CBF, 0x0CBF ], [ 0x0CC6, 0x0CC6 ], [ 0x0CCC, 0x0CCD ],
        [ 0x0CE2, 0x0CE3 ], [ 0x0D41, 0x0D43 ], [ 0x0D4D, 0x0D4D ],
        [ 0x0DCA, 0x0DCA ], [ 0x0DD2, 0x0DD4 ], [ 0x0DD6, 0x0DD6 ],
        [ 0x0E31, 0x0E31 ], [ 0x0E34, 0x0E3A ], [ 0x0E47, 0x0E4E ],
        [ 0x0EB1, 0x0EB1 ], [ 0x0EB4, 0x0EB9 ], [ 0x0EBB, 0x0EBC ],
        [ 0x0EC8, 0x0ECD ], [ 0x0F18, 0x0F19 ], [ 0x0F35, 0x0F35 ],
        [ 0x0F37, 0x0F37 ], [ 0x0F39, 0x0F39 ], [ 0x0F71, 0x0F7E ],
        [ 0x0F80, 0x0F84 ], [ 0x0F86, 0x0F87 ], [ 0x0F90, 0x0F97 ],
        [ 0x0F99, 0x0FBC ], [ 0x0FC6, 0x0FC6 ], [ 0x102D, 0x1030 ],
        [ 0x1032, 0x1032 ], [ 0x1036, 0x1037 ], [ 0x1039, 0x1039 ],
        [ 0x1058, 0x1059 ], [ 0x1160, 0x11FF ], [ 0x135F, 0x135F ],
        [ 0x1712, 0x1714 ], [ 0x1732, 0x1734 ], [ 0x1752, 0x1753 ],
        [ 0x1772, 0x1773 ], [ 0x17B4, 0x17B5 ], [ 0x17B7, 0x17BD ],
        [ 0x17C6, 0x17C6 ], [ 0x17C9, 0x17D3 ], [ 0x17DD, 0x17DD ],
        [ 0x180B, 0x180D ], [ 0x18A9, 0x18A9 ], [ 0x1920, 0x1922 ],
        [ 0x1927, 0x1928 ], [ 0x1932, 0x1932 ], [ 0x1939, 0x193B ],
        [ 0x1A17, 0x1A18 ], [ 0x1B00, 0x1B03 ], [ 0x1B34, 0x1B34 ],
        [ 0x1B36, 0x1B3A ], [ 0x1B3C, 0x1B3C ], [ 0x1B42, 0x1B42 ],
        [ 0x1B6B, 0x1B73 ], [ 0x1DC0, 0x1DCA ], [ 0x1DFE, 0x1DFF ],
        [ 0x200B, 0x200F ], [ 0x202A, 0x202E ], [ 0x2060, 0x2063 ],
        [ 0x206A, 0x206F ], [ 0x20D0, 0x20EF ], [ 0x302A, 0x302F ],
        [ 0x3099, 0x309A ], [ 0xA806, 0xA806 ], [ 0xA80B, 0xA80B ],
        [ 0xA825, 0xA826 ], [ 0xFB1E, 0xFB1E ], [ 0xFE00, 0xFE0F ],
        [ 0xFE20, 0xFE23 ], [ 0xFEFF, 0xFEFF ], [ 0xFFF9, 0xFFFB ],
        [ 0x10A01, 0x10A03 ], [ 0x10A05, 0x10A06 ], [ 0x10A0C, 0x10A0F ],
        [ 0x10A38, 0x10A3A ], [ 0x10A3F, 0x10A3F ], [ 0x1D167, 0x1D169 ],
        [ 0x1D173, 0x1D182 ], [ 0x1D185, 0x1D18B ], [ 0x1D1AA, 0x1D1AD ],
        [ 0x1D242, 0x1D244 ], [ 0xE0001, 0xE0001 ], [ 0xE0020, 0xE007F ],
        [ 0xE0100, 0xE01EF ]
    ];

    // Sorted list of non-overlapping intervals of East Asian Ambiguous characters
    // generated by "uniset +WIDTH-A -cat=Me -cat=Mn -cat=Cf c"
    wc.ambiguous = [
        [ 0x00A1, 0x00A1 ], [ 0x00A4, 0x00A4 ], [ 0x00A7, 0x00A8 ],
        [ 0x00AA, 0x00AA ], [ 0x00AE, 0x00AE ], [ 0x00B0, 0x00B4 ],
        [ 0x00B6, 0x00BA ], [ 0x00BC, 0x00BF ], [ 0x00C6, 0x00C6 ],
        [ 0x00D0, 0x00D0 ], [ 0x00D7, 0x00D8 ], [ 0x00DE, 0x00E1 ],
        [ 0x00E6, 0x00E6 ], [ 0x00E8, 0x00EA ], [ 0x00EC, 0x00ED ],
        [ 0x00F0, 0x00F0 ], [ 0x00F2, 0x00F3 ], [ 0x00F7, 0x00FA ],
        [ 0x00FC, 0x00FC ], [ 0x00FE, 0x00FE ], [ 0x0101, 0x0101 ],
        [ 0x0111, 0x0111 ], [ 0x0113, 0x0113 ], [ 0x011B, 0x011B ],
        [ 0x0126, 0x0127 ], [ 0x012B, 0x012B ], [ 0x0131, 0x0133 ],
        [ 0x0138, 0x0138 ], [ 0x013F, 0x0142 ], [ 0x0144, 0x0144 ],
        [ 0x0148, 0x014B ], [ 0x014D, 0x014D ], [ 0x0152, 0x0153 ],
        [ 0x0166, 0x0167 ], [ 0x016B, 0x016B ], [ 0x01CE, 0x01CE ],
        [ 0x01D0, 0x01D0 ], [ 0x01D2, 0x01D2 ], [ 0x01D4, 0x01D4 ],
        [ 0x01D6, 0x01D6 ], [ 0x01D8, 0x01D8 ], [ 0x01DA, 0x01DA ],
        [ 0x01DC, 0x01DC ], [ 0x0251, 0x0251 ], [ 0x0261, 0x0261 ],
        [ 0x02C4, 0x02C4 ], [ 0x02C7, 0x02C7 ], [ 0x02C9, 0x02CB ],
        [ 0x02CD, 0x02CD ], [ 0x02D0, 0x02D0 ], [ 0x02D8, 0x02DB ],
        [ 0x02DD, 0x02DD ], [ 0x02DF, 0x02DF ], [ 0x0391, 0x03A1 ],
        [ 0x03A3, 0x03A9 ], [ 0x03B1, 0x03C1 ], [ 0x03C3, 0x03C9 ],
        [ 0x0401, 0x0401 ], [ 0x0410, 0x044F ], [ 0x0451, 0x0451 ],
        [ 0x2010, 0x2010 ], [ 0x2013, 0x2016 ], [ 0x2018, 0x2019 ],
        [ 0x201C, 0x201D ], [ 0x2020, 0x2022 ], [ 0x2024, 0x2027 ],
        [ 0x2030, 0x2030 ], [ 0x2032, 0x2033 ], [ 0x2035, 0x2035 ],
        [ 0x203B, 0x203B ], [ 0x203E, 0x203E ], [ 0x2074, 0x2074 ],
        [ 0x207F, 0x207F ], [ 0x2081, 0x2084 ], [ 0x20AC, 0x20AC ],
        [ 0x2103, 0x2103 ], [ 0x2105, 0x2105 ], [ 0x2109, 0x2109 ],
        [ 0x2113, 0x2113 ], [ 0x2116, 0x2116 ], [ 0x2121, 0x2122 ],
        [ 0x2126, 0x2126 ], [ 0x212B, 0x212B ], [ 0x2153, 0x2154 ],
        [ 0x215B, 0x215E ], [ 0x2160, 0x216B ], [ 0x2170, 0x2179 ],
        [ 0x2190, 0x2199 ], [ 0x21B8, 0x21B9 ], [ 0x21D2, 0x21D2 ],
        [ 0x21D4, 0x21D4 ], [ 0x21E7, 0x21E7 ], [ 0x2200, 0x2200 ],
        [ 0x2202, 0x2203 ], [ 0x2207, 0x2208 ], [ 0x220B, 0x220B ],
        [ 0x220F, 0x220F ], [ 0x2211, 0x2211 ], [ 0x2215, 0x2215 ],
        [ 0x221A, 0x221A ], [ 0x221D, 0x2220 ], [ 0x2223, 0x2223 ],
        [ 0x2225, 0x2225 ], [ 0x2227, 0x222C ], [ 0x222E, 0x222E ],
        [ 0x2234, 0x2237 ], [ 0x223C, 0x223D ], [ 0x2248, 0x2248 ],
        [ 0x224C, 0x224C ], [ 0x2252, 0x2252 ], [ 0x2260, 0x2261 ],
        [ 0x2264, 0x2267 ], [ 0x226A, 0x226B ], [ 0x226E, 0x226F ],
        [ 0x2282, 0x2283 ], [ 0x2286, 0x2287 ], [ 0x2295, 0x2295 ],
        [ 0x2299, 0x2299 ], [ 0x22A5, 0x22A5 ], [ 0x22BF, 0x22BF ],
        [ 0x2312, 0x2312 ], [ 0x2460, 0x24E9 ], [ 0x24EB, 0x254B ],
        [ 0x2550, 0x2573 ], [ 0x2580, 0x258F ], [ 0x2592, 0x2595 ],
        [ 0x25A0, 0x25A1 ], [ 0x25A3, 0x25A9 ], [ 0x25B2, 0x25B3 ],
        [ 0x25B6, 0x25B7 ], [ 0x25BC, 0x25BD ], [ 0x25C0, 0x25C1 ],
        [ 0x25C6, 0x25C8 ], [ 0x25CB, 0x25CB ], [ 0x25CE, 0x25D1 ],
        [ 0x25E2, 0x25E5 ], [ 0x25EF, 0x25EF ], [ 0x2605, 0x2606 ],
        [ 0x2609, 0x2609 ], [ 0x260E, 0x260F ], [ 0x2614, 0x2615 ],
        [ 0x261C, 0x261C ], [ 0x261E, 0x261E ], [ 0x2640, 0x2640 ],
        [ 0x2642, 0x2642 ], [ 0x2660, 0x2661 ], [ 0x2663, 0x2665 ],
        [ 0x2667, 0x266A ], [ 0x266C, 0x266D ], [ 0x266F, 0x266F ],
        [ 0x273D, 0x273D ], [ 0x2776, 0x277F ], [ 0xE000, 0xF8FF ],
        [ 0xFFFD, 0xFFFD ], [ 0xF0000, 0xFFFFD ], [ 0x100000, 0x10FFFD ]
    ];

    /**
     * Binary search to check if the given unicode character is a space character.
     *
     * @param {interger} ucs A unicode character code.
     *
     * @return {boolean} True if the given character is a space character; false
     *     otherwise.
     */
    wc.isSpace = function(ucs) {
      // Auxiliary function for binary search in interval table.
      var min = 0, max = wc.combining.length - 1;
      var mid;

      if (ucs < wc.combining[0][0] || ucs > wc.combining[max][1])
        return false;
      while (max >= min) {
        mid = Math.floor((min + max) / 2);
        if (ucs > wc.combining[mid][1]) {
          min = mid + 1;
        } else if (ucs < wc.combining[mid][0]) {
          max = mid - 1;
        } else {
          return true;
        }
      }

      return false;
    };

    /**
     * Auxiliary function for checking if the given unicode character is a East
     * Asian Ambiguous character.
     *
     * @param {interger} ucs A unicode character code.
     *
     * @return {boolean} True if the given character is a East Asian Ambiguous
     * character.
     */
    wc.isCjkAmbiguous = function(ucs) {
      var min = 0, max = wc.ambiguous.length - 1;
      var mid;

      if (ucs < wc.ambiguous[0][0] || ucs > wc.ambiguous[max][1])
        return false;
      while (max >= min) {
        mid = Math.floor((min + max) / 2);
        if (ucs > wc.ambiguous[mid][1]) {
          min = mid + 1;
        } else if (ucs < wc.ambiguous[mid][0]) {
          max = mid - 1;
        } else {
          return true;
        }
      }

      return false;
    };

    /**
     * Determine the column width of the given character.
     *
     * @param {integer} ucs A unicode character code.
     *
     * @return {integer} The column width of the given character.
     */
    wc.charWidth = function(ucs) {
      if (wc.regardCjkAmbiguous) {
        return wc.charWidthRegardAmbiguous(ucs);
      } else {
        return wc.charWidthDisregardAmbiguous(ucs);
      }
    };

    /**
     * Determine the column width of the given character without considering East
     * Asian Ambiguous characters.
     *
     * @param {integer} ucs A unicode character code.
     *
     * @return {integer} The column width of the given character.
     */
    wc.charWidthDisregardAmbiguous = function(ucs) {
      // Test for 8-bit control characters.
      if (ucs === 0)
        return wc.nulWidth;
      if (ucs < 32 || (ucs >= 0x7f && ucs < 0xa0))
        return wc.controlWidth;

      // Optimize for ASCII characters.
      if (ucs < 0x7f)
        return 1;

      // Binary search in table of non-spacing characters.
      if (wc.isSpace(ucs))
        return 0;

      // If we arrive here, ucs is not a combining or C0/C1 control character.
      return 1 +
        (ucs >= 0x1100 &&
         (ucs <= 0x115f ||             // Hangul Jamo init. consonants
          ucs == 0x2329 || ucs == 0x232a ||
          (ucs >= 0x2e80 && ucs <= 0xa4cf &&
           ucs != 0x303f) ||           // CJK ... Yi
          (ucs >= 0xac00 && ucs <= 0xd7a3) ||  // Hangul Syllables
          (ucs >= 0xf900 && ucs <= 0xfaff) ||  // CJK Compatibility Ideographs
          (ucs >= 0xfe10 && ucs <= 0xfe19) ||  // Vertical forms
          (ucs >= 0xfe30 && ucs <= 0xfe6f) ||  // CJK Compatibility Forms
          (ucs >= 0xff00 && ucs <= 0xff60) ||  // Fullwidth Forms
          (ucs >= 0xffe0 && ucs <= 0xffe6) ||
          (ucs >= 0x20000 && ucs <= 0x2fffd) ||
          (ucs >= 0x30000 && ucs <= 0x3fffd)));
    };

    /**
     * Determine the column width of the given character considering East Asian
     * Ambiguous characters.
     *
     * @param {integer} ucs A unicode character code.
     *
     * @return {integer} The column width of the given character.
     */
    wc.charWidthRegardAmbiguous = function(ucs) {
      if (wc.isCjkAmbiguous(ucs))
        return wc.cjkAmbiguousWidth;

      return wc.charWidthDisregardAmbiguous(ucs);
    };

    /**
     * Determine the column width of the given string.
     *
     * @param {string} str A string.
     *
     * @return {integer} The column width of the given string.
     */
    wc.strWidth = function(str) {
      var width, rv = 0;

      for (var i = 0; i < str.length; i++) {
        width = wc.charWidth(str.charCodeAt(i));
        if (width < 0)
          return -1;
        rv += width;
      }

      return rv;
    };

    /**
     * Get the substring at the given column offset of the given column width.
     *
     * @param {string} str The string to get substring from.
     * @param {integer} start The starting column offset to get substring.
     * @param {integer} opt_width The column width of the substring.
     *
     * @return {string} The substring.
     */
    wc.substr = function(str, start, opt_width) {
      var startIndex, endIndex, width;

      for (startIndex = 0, width = 0; startIndex < str.length; startIndex++) {
        width += wc.charWidth(str.charCodeAt(startIndex));
        if (width > start)
          break;
      }

      if (opt_width !== undefined) {
        for (endIndex = startIndex, width = 0;
             endIndex < str.length && width < opt_width;
             width += wc.charWidth(str.charCodeAt(endIndex)), endIndex++);
        if (width > opt_width)
          endIndex--;
        return str.substring(startIndex, endIndex);
      }

      return str.substr(startIndex);
    };

    /**
     * Get substring at the given start and end column offset.
     *
     * @param {string} str The string to get substring from.
     * @param {integer} start The starting column offset.
     * @param {integer} end The ending column offset.
     *
     * @return {string} The substring.
     */
    wc.substring = function(str, start, end) {
      return wc.substr(str, start, end - start);
    };
  });
define("hterm/key_map", 
  ["hterm/struct/key_actions","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var keyActions = __dependency1__["default"];

    /**
     * The default key map for hterm.
     *
     * Contains a mapping of keyCodes to keyDefs (aka key definitions).  The key
     * definition tells the hterm.Keyboard class how to handle keycodes.
     *
     * This should work for most cases, as the printable characters get handled
     * in the keypress event.  In that case, even if the keycap is wrong in the
     * key map, the correct character should be sent.
     *
     * Different layouts, such as Dvorak should work with this keymap, as those
     * layouts typically move keycodes around on the keyboard without disturbing
     * the actual keycaps.
     *
     * There may be issues with control keys on non-US keyboards or with keyboards
     * that very significantly from the expectations here, in which case we may
     * have to invent new key maps.
     *
     * The sequences defined in this key map come from [XTERM] as referenced in
     * vt.js, starting with the section titled "Alt and Meta Keys".
     */
    var KeyMap = function(keyboard) {
      this.keyboard = keyboard;
      this.keyDefs = {};
      this.reset();
    };
    __exports__.KeyMap = KeyMap;
    __exports__["default"] = KeyMap;

    /**
     * Add a single key definition.
     *
     * The definition is a hash containing the following keys: 'keyCap', 'normal',
     * 'control', and 'alt'.
     *
     *  - keyCap is a string identifying the key.  For printable
     *    keys, the key cap should be exactly two characters, starting with the
     *    unshifted version.  For example, 'aA', 'bB', '1!' and '=+'.  For
     *    non-printable the key cap should be surrounded in square braces, as in
     *    '[INS]', '[LEFT]'.  By convention, non-printable keycaps are in uppercase
     *    but this is not a strict requirement.
     *
     *  - Normal is the action that should be performed when they key is pressed
     *    in the absence of any modifier.  See below for the supported actions.
     *
     *  - Control is the action that should be performed when they key is pressed
     *    along with the control modifier.  See below for the supported actions.
     *
     *  - Alt is the action that should be performed when they key is pressed
     *    along with the alt modifier.  See below for the supported actions.
     *
     *  - Meta is the action that should be performed when they key is pressed
     *    along with the meta modifier.  See below for the supported actions.
     *
     * Actions can be one of the keyActions as documented below,
     * a literal string, or an array.  If the action is a literal string then
     * the string is sent directly to the host.  If the action is an array it
     * is taken to be an escape sequence that may be altered by modifier keys.
     * The second-to-last element of the array will be overwritten with the
     * state of the modifier keys, as specified in the final table of "PC-Style
     * Function Keys" from [XTERM].
     */
    KeyMap.prototype.addKeyDef = function(keyCode, def) {
      if (keyCode in this.keyDefs)
        console.warn('Duplicate keyCode: ' + keyCode);

      this.keyDefs[keyCode] = def;
    };

    /**
     * Add mutiple key definitions in a single call.
     *
     * This function takes the key definitions as variable argument list.  Each
     * argument is the key definition specified as an array.
     *
     * (If the function took everything as one big hash we couldn't detect
     * duplicates, and there would be a lot more typing involved.)
     *
     * Each key definition should have 6 elements: (keyCode, keyCap, normal action,
     * control action, alt action and meta action).  See KeyMap.addKeyDef for the
     * meaning of these elements.
     */
    KeyMap.prototype.addKeyDefs = function(var_args) {
      for (var i = 0; i < arguments.length; i++) {
        this.addKeyDef(arguments[i][0],
                       { keyCap: arguments[i][1],
                         normal: arguments[i][2],
                         control: arguments[i][3],
                         alt: arguments[i][4],
                         meta: arguments[i][5]
                       });
      }
    };

    /**
     * Set up the default state for this keymap.
     */
    KeyMap.prototype.reset = function() {
      this.keyDefs = {};

      var self = this;

      // This function us used by the "macro" functions below.  It makes it
      // possible to use the call() macro as an argument to any other macro.
      function resolve(action, e, k) {
        if (typeof action == 'function')
          return action.apply(self, [e, k]);

        return action;
      }

      // If not application keypad a, else b.  The keys that care about
      // application keypad ignore it when the key is modified.
      function ak(a, b) {
        return function(e, k) {
          var action = (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey ||
                        !self.keyboard.applicationKeypad) ? a : b;
          return resolve(action, e, k);
        };
      }

      // If mod or not application cursor a, else b.  The keys that care about
      // application cursor ignore it when the key is modified.
      function ac(a, b) {
        return function(e, k) {
          var action = (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey ||
                        !self.keyboard.applicationCursor) ? a : b;
          return resolve(action, e, k);
        };
      }

      // If not backspace-sends-backspace keypad a, else b.
      function bs(a, b) {
        return function(e, k) {
          var action = !self.keyboard.backspaceSendsBackspace ? a : b;
          return resolve(action, e, k);
        };
      }

      // If not e.shiftKey a, else b.
      function sh(a, b) {
        return function(e, k) {
          var action = !e.shiftKey ? a : b;

          // Clear e.shiftKey so that the keyboard code doesn't try to apply
          // additional modifiers to the sequence.
          delete e.shiftKey;
          e.shiftKey = false;

          return resolve(action, e, k);
        };
      }

      // If not e.altKey a, else b.
      function alt(a, b) {
        return function(e, k) {
          var action = !e.altKey ? a : b;
          return resolve(action, e, k);
        };
      }

      // If no modifiers a, else b.
      function mod(a, b) {
        return function (e, k) {
          var action = !(e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) ? a : b;
          return resolve(action, e, k);
        };
      }

      // Compute a control character for a given character.
      function ctl(ch) { return String.fromCharCode(ch.charCodeAt(0) - 64) }

      // Call a method on the keymap instance.
      function c(m) { return function (e, k) { return this[m](e, k) } }

      // Ignore if not trapping media keys
      function med(fn) {
        return function(e, k) {
          if (!self.keyboard.mediaKeysAreFKeys) {
            return keyActions.PASS;
          }
          return resolve(fn, e, k);
        };
      }

      var ESC = '\x1b';
      var CSI = '\x1b[';
      var SS3 = '\x1bO';

      var CANCEL = keyActions.CANCEL;
      var DEFAULT = keyActions.DEFAULT;
      var PASS = keyActions.PASS;
      var STRIP = keyActions.STRIP;

      this.addKeyDefs(
        // These fields are: [keycode, keycap, normal, control, alt, meta]

        // The browser sends the keycode 0 for some keys.  We'll just assume it's
        // going to do the right thing by default for those keys.
        [0,   '[UNKNOWN]', PASS, PASS, PASS, PASS],

        // First row.
        [27,  '[ESC]', ESC,                       DEFAULT, DEFAULT,     DEFAULT],
        [112, '[F1]',  mod(SS3 + 'P', CSI + 'P'), DEFAULT, CSI + '23~', DEFAULT],
        [113, '[F2]',  mod(SS3 + 'Q', CSI + 'Q'), DEFAULT, CSI + '24~', DEFAULT],
        [114, '[F3]',  mod(SS3 + 'R', CSI + 'R'), DEFAULT, CSI + '25~', DEFAULT],
        [115, '[F4]',  mod(SS3 + 'S', CSI + 'S'), DEFAULT, CSI + '26~', DEFAULT],
        [116, '[F5]',  CSI + '15~',               DEFAULT, CSI + '28~', DEFAULT],
        [117, '[F6]',  CSI + '17~',               DEFAULT, CSI + '29~', DEFAULT],
        [118, '[F7]',  CSI + '18~',               DEFAULT, CSI + '31~', DEFAULT],
        [119, '[F8]',  CSI + '19~',               DEFAULT, CSI + '32~', DEFAULT],
        [120, '[F9]',  CSI + '20~',               DEFAULT, CSI + '33~', DEFAULT],
        [121, '[F10]', CSI + '21~',               DEFAULT, CSI + '34~', DEFAULT],
        [122, '[F11]', CSI + '23~',               DEFAULT, CSI + '42~', DEFAULT],
        [123, '[F12]', CSI + '24~',               DEFAULT, CSI + '43~', DEFAULT],

        // Second row.
        [192, '`~', DEFAULT, sh(ctl('@'), ctl('^')),     DEFAULT,           PASS],
        [49,  '1!', DEFAULT, c('onCtrlNum_'),    c('onAltNum_'), c('onMetaNum_')],
        [50,  '2@', DEFAULT, c('onCtrlNum_'),    c('onAltNum_'), c('onMetaNum_')],
        [51,  '3#', DEFAULT, c('onCtrlNum_'),    c('onAltNum_'), c('onMetaNum_')],
        [52,  '4$', DEFAULT, c('onCtrlNum_'),    c('onAltNum_'), c('onMetaNum_')],
        [53,  '5%', DEFAULT, c('onCtrlNum_'),    c('onAltNum_'), c('onMetaNum_')],
        [54,  '6^', DEFAULT, c('onCtrlNum_'),    c('onAltNum_'), c('onMetaNum_')],
        [55,  '7&', DEFAULT, c('onCtrlNum_'),    c('onAltNum_'), c('onMetaNum_')],
        [56,  '8*', DEFAULT, c('onCtrlNum_'),    c('onAltNum_'), c('onMetaNum_')],
        [57,  '9(', DEFAULT, c('onCtrlNum_'),    c('onAltNum_'), c('onMetaNum_')],
        [48,  '0)', DEFAULT, c('onPlusMinusZero_'),c('onAltNum_'),c('onPlusMinusZero_')],
        [189, '-_', DEFAULT, c('onPlusMinusZero_'), DEFAULT, c('onPlusMinusZero_')],
        [187, '=+', DEFAULT, c('onPlusMinusZero_'), DEFAULT, c('onPlusMinusZero_')],
        // Firefox -_ and =+
        [173, '-_', DEFAULT, c('onPlusMinusZero_'), DEFAULT, c('onPlusMinusZero_')],
        [61, '=+', DEFAULT, c('onPlusMinusZero_'), DEFAULT, c('onPlusMinusZero_')],
        // Firefox Italian +*
        [171, '+*', DEFAULT, c('onPlusMinusZero_'), DEFAULT, c('onPlusMinusZero_')],

        [8,   '[BKSP]', bs('\x7f', '\b'), bs('\b', '\x7f'), DEFAULT,     DEFAULT],

        // Third row.
        [9,   '[TAB]', sh('\t', CSI + 'Z'), STRIP,     PASS,    DEFAULT],
        [81,  'qQ',    DEFAULT,             ctl('Q'),  DEFAULT, DEFAULT],
        [87,  'wW',    DEFAULT,             ctl('W'),  DEFAULT, DEFAULT],
        [69,  'eE',    DEFAULT,             ctl('E'),  DEFAULT, DEFAULT],
        [82,  'rR',    DEFAULT,             ctl('R'),  DEFAULT, DEFAULT],
        [84,  'tT',    DEFAULT,             ctl('T'),  DEFAULT, DEFAULT],
        [89,  'yY',    DEFAULT,             ctl('Y'),  DEFAULT, DEFAULT],
        [85,  'uU',    DEFAULT,             ctl('U'),  DEFAULT, DEFAULT],
        [73,  'iI',    DEFAULT,             ctl('I'),  DEFAULT, DEFAULT],
        [79,  'oO',    DEFAULT,             ctl('O'),  DEFAULT, DEFAULT],
        [80,  'pP',    DEFAULT,             ctl('P'),  DEFAULT, DEFAULT],
        [219, '[{',    DEFAULT,             ctl('['),  DEFAULT, DEFAULT],
        [221, ']}',    DEFAULT,             ctl(']'),  DEFAULT, DEFAULT],
        [220, '\\|',   DEFAULT,             ctl('\\'), DEFAULT, DEFAULT],

        // Fourth row. (We let Ctrl-Shift-J pass for Chrome DevTools.)
        [20,  '[CAPS]',  PASS,    PASS,                           PASS,    DEFAULT],
        [65,  'aA',      DEFAULT, ctl('A'),                       DEFAULT, DEFAULT],
        [83,  'sS',      DEFAULT, ctl('S'),                       DEFAULT, DEFAULT],
        [68,  'dD',      DEFAULT, ctl('D'),                       DEFAULT, DEFAULT],
        [70,  'fF',      DEFAULT, ctl('F'),                       DEFAULT, DEFAULT],
        [71,  'gG',      DEFAULT, ctl('G'),                       DEFAULT, DEFAULT],
        [72,  'hH',      DEFAULT, ctl('H'),                       DEFAULT, DEFAULT],
        [74,  'jJ',      DEFAULT, sh(ctl('J'), PASS),             DEFAULT, DEFAULT],
        [75,  'kK',      DEFAULT, sh(ctl('K'), c('onClear_')),    DEFAULT, DEFAULT],
        [76,  'lL',      DEFAULT, sh(ctl('L'), PASS),             DEFAULT, DEFAULT],
        [186, ';:',      DEFAULT, STRIP,                          DEFAULT, DEFAULT],
        [222, '\'"',     DEFAULT, STRIP,                          DEFAULT, DEFAULT],
        [13,  '[ENTER]', '\r',    CANCEL,                         CANCEL,  DEFAULT],

        // Fifth row.  This includes the copy/paste shortcuts.  On some
        // platforms it's Ctrl-C/V, on others it's Meta-C/V.  We assume either
        // Ctrl-C/Meta-C should pass to the browser when there is a selection,
        // and Ctrl-Shift-V/Meta-*-V should always pass to the browser (since
        // these seem to be recognized as paste too).
        [16,  '[SHIFT]', PASS, PASS,                   PASS,    DEFAULT],
        [90,  'zZ',   DEFAULT, ctl('Z'),               DEFAULT, DEFAULT],
        [88,  'xX',   DEFAULT, ctl('X'),               DEFAULT, DEFAULT],
        [67,  'cC',   DEFAULT, c('onCtrlC_'),          DEFAULT, c('onMetaC_')],
        [86,  'vV',   DEFAULT, c('onCtrlV_'),          DEFAULT, c('onMetaV_')],
        [66,  'bB',   DEFAULT, sh(ctl('B'), PASS),     DEFAULT, sh(DEFAULT, PASS)],
        [78,  'nN',   DEFAULT, c('onCtrlN_'),          DEFAULT, c('onMetaN_')],
        [77,  'mM',   DEFAULT, ctl('M'),               DEFAULT, DEFAULT],
        [188, ',<',   DEFAULT, alt(STRIP, PASS),       DEFAULT, DEFAULT],
        [190, '.>',   DEFAULT, alt(STRIP, PASS),       DEFAULT, DEFAULT],
        [191, '/?',   DEFAULT, sh(ctl('_'), ctl('?')), DEFAULT, DEFAULT],

        // Sixth and final row.
        [17,  '[CTRL]', PASS,    PASS,     PASS,    PASS],
        [18,  '[ALT]',  PASS,    PASS,     PASS,    PASS],
        [91,  '[LAPL]', PASS,    PASS,     PASS,    PASS],
        [32,  ' ',      DEFAULT, ctl('@'), DEFAULT, DEFAULT],
        [92,  '[RAPL]', PASS,    PASS,     PASS,    PASS],

        // These things.
        [42,  '[PRTSCR]', PASS, PASS, PASS, PASS],
        [145, '[SCRLK]',  PASS, PASS, PASS, PASS],
        [19,  '[BREAK]',  PASS, PASS, PASS, PASS],

        // The block of six keys above the arrows.
        [45,  '[INSERT]', c('onKeyInsert_'),   DEFAULT, DEFAULT, DEFAULT],
        [36,  '[HOME]',   c('onKeyHome_'),     DEFAULT, DEFAULT, DEFAULT],
        [33,  '[PGUP]',   c('onKeyPageUp_'),   DEFAULT, DEFAULT, DEFAULT],
        [46,  '[DEL]',    c('onKeyDel_'),      DEFAULT, DEFAULT, DEFAULT],
        [35,  '[END]',    c('onKeyEnd_'),      DEFAULT, DEFAULT, DEFAULT],
        [34,  '[PGDOWN]', c('onKeyPageDown_'), DEFAULT, DEFAULT, DEFAULT],

        // Arrow keys.  When unmodified they respect the application cursor state,
        // otherwise they always send the CSI codes.
        [38, '[UP]',    ac(CSI + 'A', SS3 + 'A'), DEFAULT, DEFAULT, DEFAULT],
        [40, '[DOWN]',  ac(CSI + 'B', SS3 + 'B'), DEFAULT, DEFAULT, DEFAULT],
        [39, '[RIGHT]', ac(CSI + 'C', SS3 + 'C'), DEFAULT, DEFAULT, DEFAULT],
        [37, '[LEFT]',  ac(CSI + 'D', SS3 + 'D'), DEFAULT, DEFAULT, DEFAULT],

        [144, '[NUMLOCK]', PASS, PASS, PASS, PASS],

        // With numlock off, the keypad generates the same key codes as the arrows
        // and 'block of six' for some keys, and null key codes for the rest.

        // Keypad with numlock on generates unique key codes...
        [96,  '[KP0]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [97,  '[KP1]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [98,  '[KP2]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [99,  '[KP3]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [100, '[KP4]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [101, '[KP5]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [102, '[KP6]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [103, '[KP7]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [104, '[KP8]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [105, '[KP9]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [107, '[KP+]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [109, '[KP-]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [106, '[KP*]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [111, '[KP/]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],
        [110, '[KP.]', DEFAULT, DEFAULT, DEFAULT, DEFAULT],

        // Chrome OS keyboard top row.
        [166, '[BACK]',   med(mod(SS3+'P', CSI+'P')), DEFAULT, CSI+'23~', DEFAULT],
        [167, '[FWD]',    med(mod(SS3+'Q', CSI+'Q')), DEFAULT, CSI+'24~', DEFAULT],
        [168, '[RELOAD]', med(mod(SS3+'R', CSI+'R')), DEFAULT, CSI+'25~', DEFAULT],
        [183, '[FSCR]',   med(mod(SS3+'S', CSI+'S')), DEFAULT, CSI+'26~', DEFAULT],
        [182, '[WINS]',   med(CSI + '15~'),           DEFAULT, CSI+'28~', DEFAULT],
        [216, '[BRIT-]',  med(CSI + '17~'),           DEFAULT, CSI+'29~', DEFAULT],
        [217, '[BRIT+]',  med(CSI + '18~'),           DEFAULT, CSI+'31~', DEFAULT]

        // 173 [MUTE], 174 [VOL-] and 175 [VOL+] are trapped by the Chrome OS
        // window manager, so we'll never see them. Note that 173 is also
        // Firefox's -_ keycode.
      );
    };

    /**
     * Either allow the paste or send a key sequence.
     */
    KeyMap.prototype.onKeyInsert_ = function(e) {
      if (this.keyboard.shiftInsertPaste && e.shiftKey)
        return keyActions.PASS;

      return '\x1b[2~';
    };

    /**
     * Either scroll the scrollback buffer or send a key sequence.
     */
    KeyMap.prototype.onKeyHome_ = function(e) {
      if (!this.keyboard.homeKeysScroll ^ e.shiftKey) {
        if ((e.altey || e.ctrlKey || e.shiftKey) ||
            !this.keyboard.applicationCursor) {
          return '\x1b[H';
        }

        return '\x1bOH';
      }

      this.keyboard.terminal.scrollHome();
      return keyActions.CANCEL;
    };

    /**
     * Either scroll the scrollback buffer or send a key sequence.
     */
    KeyMap.prototype.onKeyEnd_ = function(e) {
      if (!this.keyboard.homeKeysScroll ^ e.shiftKey) {
        if ((e.altKey || e.ctrlKey || e.shiftKey) ||
            !this.keyboard.applicationCursor) {
          return '\x1b[F';
        }

        return '\x1bOF';
      }

      this.keyboard.terminal.scrollEnd();
      return keyActions.CANCEL;
    };

    /**
     * Either scroll the scrollback buffer or send a key sequence.
     */
    KeyMap.prototype.onKeyPageUp_ = function(e) {
      if (!this.keyboard.pageKeysScroll ^ e.shiftKey)
        return '\x1b[5~';

      this.keyboard.terminal.scrollPageUp();
      return keyActions.CANCEL;
    };

    /**
     * Either send a true DEL, or sub in meta-backspace.
     *
     * On Chrome OS, if we know the alt key is down, but we get a DEL event that
     * claims that the alt key is not pressed, we know the DEL was a synthetic
     * one from a user that hit alt-backspace. Based on a user pref, we can sub
     * in meta-backspace in this case.
     */
    KeyMap.prototype.onKeyDel_ = function(e) {
      if (this.keyboard.altBackspaceIsMetaBackspace &&
          this.keyboard.altIsPressed && !e.altKey)
        return '\x1b\x7f';
      return '\x1b[3~';
    };

    /**
     * Either scroll the scrollback buffer or send a key sequence.
     */
    KeyMap.prototype.onKeyPageDown_ = function(e) {
      if (!this.keyboard.pageKeysScroll ^ e.shiftKey)
        return '\x1b[6~';

      this.keyboard.terminal.scrollPageDown();
      return keyActions.CANCEL;
    };

    /**
     * Clear the primary/alternate screens and the scrollback buffer.
     */
    KeyMap.prototype.onClear_ = function(e, keyDef) {
      this.keyboard.terminal.wipeContents();
      return keyActions.CANCEL;
    };

    /**
     * Either pass Ctrl-1..9 to the browser or send them to the host.
     *
     * Note that Ctrl-1 and Ctrl-9 don't actually have special sequences mapped
     * to them in xterm or gnome-terminal.  The range is really Ctrl-2..8, but
     * we handle 1..9 since Chrome treats the whole range special.
     */
    KeyMap.prototype.onCtrlNum_ = function(e, keyDef) {
      // Compute a control character for a given character.
      function ctl(ch) { return String.fromCharCode(ch.charCodeAt(0) - 64) }

      if (this.keyboard.terminal.passCtrlNumber && !e.shiftKey)
        return keyActions.PASS;

      switch (keyDef.keyCap.substr(0, 1)) {
        case '1': return '1';
        case '2': return ctl('@');
        case '3': return ctl('[');
        case '4': return ctl('\\');
        case '5': return ctl(']');
        case '6': return ctl('^');
        case '7': return ctl('_');
        case '8': return '\x7f';
        case '9': return '9';
      }
    };

    /**
     * Either pass Alt-1..9 to the browser or send them to the host.
     */
    KeyMap.prototype.onAltNum_ = function(e, keyDef) {
      if (this.keyboard.terminal.passAltNumber && !e.shiftKey)
        return keyActions.PASS;

      return keyActions.DEFAULT;
    };

    /**
     * Either pass Meta-1..9 to the browser or send them to the host.
     */
    KeyMap.prototype.onMetaNum_ = function(e, keyDef) {
      if (this.keyboard.terminal.passMetaNumber && !e.shiftKey)
        return keyActions.PASS;

      return keyActions.DEFAULT;
    };

    /**
     * Either send a ^C or interpret the keystroke as a copy command.
     */
    KeyMap.prototype.onCtrlC_ = function(e, keyDef) {
      var selection = this.keyboard.terminal.getDocument().getSelection();

      if (!selection.isCollapsed) {
        if (this.keyboard.ctrlCCopy && !e.shiftKey) {
          // Ctrl-C should copy if there is a selection, send ^C otherwise.
          // Perform the copy by letting the browser handle Ctrl-C.  On most
          // browsers, this is the *only* way to place text on the clipboard from
          // the 'drive-by' web.
          if (this.keyboard.terminal.clearSelectionAfterCopy) {
            setTimeout(selection.collapseToEnd.bind(selection), 50);
          }
          return keyActions.PASS;
        }

        if (!this.keyboard.ctrlCCopy && e.shiftKey) {
          // Ctrl-Shift-C should copy if there is a selection, send ^C otherwise.
          // Perform the copy manually.  This only works in situations where
          // document.execCommand('copy') is allowed.
          if (this.keyboard.terminal.clearSelectionAfterCopy) {
            setTimeout(selection.collapseToEnd.bind(selection), 50);
          }
          this.keyboard.terminal.copySelectionToClipboard();
          return keyActions.CANCEL;
        }
      }

      return '\x03';
    };

    /**
     * Either send a ^N or open a new window to the same location.
     */
    KeyMap.prototype.onCtrlN_ = function(e, keyDef) {
      if (e.shiftKey) {
        window.open(document.location.href, '',
                    'chrome=no,close=yes,resize=yes,scrollbars=yes,' +
                    'minimizable=yes,width=' + window.innerWidth +
                    ',height=' + window.innerHeight);
        return keyActions.CANCEL;
      }

      return '\x0e';
    };

    /**
     * Either send a ^V or allow the browser to interpret the keystroke as a paste
     * command.
     *
     * The default behavior is to paste if the user presses Ctrl-Shift-V, and send
     * a ^V if the user presses Ctrl-V. This can be flipped with the
     * 'ctrl-v-paste' preference.
     */
    KeyMap.prototype.onCtrlV_ = function(e, keyDef) {
      if ((!e.shiftKey && this.keyboard.ctrlVPaste) ||
          (e.shiftKey && !this.keyboard.ctrlVPaste)) {
        return keyActions.PASS;
      }

      return '\x16';
    };

    /**
     * Either the default action or open a new window to the same location.
     */
    KeyMap.prototype.onMetaN_ = function(e, keyDef) {
      if (e.shiftKey) {
        window.open(document.location.href, '',
                    'chrome=no,close=yes,resize=yes,scrollbars=yes,' +
                    'minimizable=yes,width=' + window.outerWidth +
                    ',height=' + window.outerHeight);
        return keyActions.CANCEL;
      }

      return keyActions.DEFAULT;
    };

    /**
     * Either send a Meta-C or allow the browser to interpret the keystroke as a
     * copy command.
     *
     * If there is no selection, or if the user presses Meta-Shift-C, then we'll
     * transmit an '\x1b' (if metaSendsEscape is on) followed by 'c' or 'C'.
     *
     * If there is a selection, we defer to the browser.  In this case we clear out
     * the selection so the user knows we heard them, and also to give them a
     * chance to send a Meta-C by just hitting the key again.
     */
    KeyMap.prototype.onMetaC_ = function(e, keyDef) {
      var document = this.keyboard.terminal.getDocument();
      if (e.shiftKey || document.getSelection().isCollapsed) {
        // If the shift key is being held, or there is no document selection, send
        // a Meta-C.  The keyboard code will add the ESC if metaSendsEscape is true,
        // we just have to decide between 'c' and 'C'.
        return keyDef.keyCap.substr(e.shiftKey ? 1 : 0, 1);
      }

      // Otherwise let the browser handle it as a copy command.
      if (this.keyboard.terminal.clearSelectionAfterCopy) {
        setTimeout(function() { document.getSelection().collapseToEnd() }, 50);
      }
      return keyActions.PASS;
    };

    /**
     * Either PASS or DEFAULT Meta-V, depending on preference.
     *
     * Always PASS Meta-Shift-V to allow browser to interpret the keystroke as
     * a paste command.
     */
    KeyMap.prototype.onMetaV_ = function(e, keyDef) {
      if (e.shiftKey)
        return keyActions.PASS;

      return this.keyboard.passMetaV ? keyActions.PASS : keyActions.DEFAULT;
    };

    /**
     * Handle font zooming.
     *
     * The browser's built-in zoom has a bit of an issue at certain zoom levels.
     * At some magnifications, the measured height of a row of text differs from
     * the height that was explicitly set.
     *
     * We override the browser zoom keys to change the ScrollPort's font size to
     * avoid the issue.
     */
    KeyMap.prototype.onPlusMinusZero_ = function(e, keyDef) {
      if (!(this.keyboard.ctrlPlusMinusZeroZoom ^ e.shiftKey)) {
        // If ctrl-PMZ controls zoom and the shift key is pressed, or
        // ctrl-shift-PMZ controls zoom and this shift key is not pressed,
        // then we want to send the control code instead of affecting zoom.
        if (keyDef.keyCap == '-_')
          return '\x1f';  // ^_

        // Only ^_ is valid, the other sequences have no meaning.
        return keyActions.CANCEL;
      }

      if (this.keyboard.terminal.getZoomFactor() != 1) {
        // If we're not at 1:1 zoom factor, let the Ctrl +/-/0 keys control the
        // browser zoom, so it's easier to for the user to get back to 100%.
        return keyActions.PASS;
      }

      var cap = keyDef.keyCap.substr(0, 1);
      if (cap == '0') {
          this.keyboard.terminal.setFontSize(0);
      } else {
        var size = this.keyboard.terminal.getFontSize();

        if (cap == '-') {
          size -= 1;
        } else {
          size += 1;
        }

        this.keyboard.terminal.setFontSize(size);
      }

      return keyActions.CANCEL;
    };
  });
define("hterm/keyboard", 
  ["hterm/struct/key_actions","hterm/key_map","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var keyActions = __dependency1__["default"];

    var KeyMap = __dependency2__["default"];

    /**
     * Keyboard handler.
     *
     * Consumes onKey* events and invokes onVTKeystroke on the associated Terminal
     * object.
     *
     * See also: [XTERM] as referenced in vt.js.
     *
     * @param {Terminal} The Terminal object associated with this keyboard.
     */
    var Keyboard = function(terminal) {
      // The parent vt interpreter.
      this.terminal = terminal;

      // The element we're currently capturing keyboard events for.
      this.keyboardElement_ = null;

      // The event handlers we are interested in, and their bound callbacks, saved
      // so they can be uninstalled with removeEventListener, when required.
      this.handlers_ = [
          ['blur', this.onBlur_.bind(this)],
          ['keydown', this.onKeyDown_.bind(this)],
          ['keypress', this.onKeyPress_.bind(this)],
          ['keyup', this.onKeyUp_.bind(this)],
          ['textInput', this.onTextInput_.bind(this)]
      ];

      /**
       * The current key map.
       */
      this.keyMap = new KeyMap(this);

      /**
       * If true, Shift-Insert will fall through to the browser as a paste.
       * If false, the keystroke will be sent to the host.
       */
      this.shiftInsertPaste = true;

      /**
       * If true, home/end will control the terminal scrollbar and shift home/end
       * will send the VT keycodes.  If false then home/end sends VT codes and
       * shift home/end scrolls.
       */
      this.homeKeysScroll = false;

      /**
       * Same as above, except for page up/page down.
       */
      this.pageKeysScroll = false;

      /**
       * If true, Ctrl-Plus/Minus/Zero controls zoom.
       * If false, Ctrl-Shift-Plus/Minus/Zero controls zoom, Ctrl-Minus sends ^_,
       * Ctrl-Plus/Zero do nothing.
       */
      this.ctrlPlusMinusZeroZoom = true;

      /**
       * Ctrl+C copies if true, sends ^C to host if false.
       * Ctrl+Shift+C sends ^C to host if true, copies if false.
       */
      this.ctrlCCopy = false;

      /**
       * Ctrl+V pastes if true, sends ^V to host if false.
       * Ctrl+Shift+V sends ^V to host if true, pastes if false.
       */
      this.ctrlVPaste = false;

      /**
       * Enable/disable application keypad.
       *
       * This changes the way numeric keys are sent from the keyboard.
       */
      this.applicationKeypad = false;

      /**
       * Enable/disable the application cursor mode.
       *
       * This changes the way cursor keys are sent from the keyboard.
       */
      this.applicationCursor = false;

      /**
       * If true, the backspace should send BS ('\x08', aka ^H).  Otherwise
       * the backspace key should send '\x7f'.
       */
      this.backspaceSendsBackspace = false;

      /**
       * The encoding method for data sent to the host.
       */
      this.characterEncoding = 'utf-8';

      /**
       * Set whether the meta key sends a leading escape or not.
       */
      this.metaSendsEscape = true;

      /**
       * Set whether meta-V gets passed to host.
       */
      this.passMetaV = true;

      /**
       * Controls how the alt key is handled.
       *
       *  escape....... Send an ESC prefix.
       *  8-bit........ Add 128 to the unshifted character as in xterm.
       *  browser-key.. Wait for the keypress event and see what the browser says.
       *                (This won't work well on platforms where the browser
       *                 performs a default action for some alt sequences.)
       *
       * This setting only matters when alt is distinct from meta (altIsMeta is
       * false.)
       */
      this.altSendsWhat = 'escape';

      /**
       * Set whether the alt key acts as a meta key, instead of producing 8-bit
       * characters.
       *
       * True to enable, false to disable, null to autodetect based on platform.
       */
      this.altIsMeta = false;

      /**
       * If true, tries to detect DEL key events that are from alt-backspace on
       * Chrome OS vs from a true DEL key press.
       *
       * Background: At the time of writing, on Chrome OS, alt-backspace is mapped
       * to DEL. Some users may be happy with this, but others may be frustrated
       * that it's impossible to do meta-backspace. If the user enables this pref,
       * we use a trick to tell a true DEL keypress from alt-backspace: on
       * alt-backspace, we will see the alt key go down, then get a DEL keystroke
       * that indicates that alt is not pressed. See http://crbug.com/174410 .
       */
      this.altBackspaceIsMetaBackspace = false;

      /**
       * Used to keep track of the current alt-key state, which is necessary for
       * the altBackspaceIsMetaBackspace preference above.
       */
      this.altIsPressed = false;

      /**
       * If true, Chrome OS media keys will be mapped to their F-key equivalent.
       * E.g. "Back" will be mapped to F1. If false, Chrome will handle the keys.
       */
      this.mediaKeysAreFKeys = false;
    };
    __exports__.Keyboard = Keyboard;
    __exports__["default"] = Keyboard;

    /**
     * Encode a string according to the 'send-encoding' preference.
     */
    Keyboard.prototype.encode = function(str) {
      if (this.characterEncoding == 'utf-8')
        return this.terminal.vt.encodeUTF8(str);

      return str;
    };

    /**
     * Capture keyboard events sent to the associated element.
     *
     * This enables the keyboard.  Captured events are consumed by this class
     * and will not perform their default action or bubble to other elements.
     *
     * Passing a null element will uninstall the keyboard handlers.
     *
     * @param {HTMLElement} element The element whose events should be captured, or
     *     null to disable the keyboard.
     */
    Keyboard.prototype.installKeyboard = function(element) {
      if (element == this.keyboardElement_)
        return;

      if (element && this.keyboardElement_)
        this.installKeyboard(null);

      for (var i = 0; i < this.handlers_.length; i++) {
        var handler = this.handlers_[i];
        if (element) {
          element.addEventListener(handler[0], handler[1]);
        } else {
          this.keyboardElement_.removeEventListener(handler[0], handler[1]);
        }
      }

      this.keyboardElement_ = element;
    };

    /**
     * Disable keyboard event capture.
     *
     * This will allow the browser to process key events normally.
     */
    Keyboard.prototype.uninstallKeyboard = function() {
      this.installKeyboard(null);
    };

    /**
     * Handle onTextInput events.
     *
     * We're not actually supposed to get these, but we do on the Mac in the case
     * where a third party app sends synthetic keystrokes to Chrome.
     */
    Keyboard.prototype.onTextInput_ = function(e) {
      if (!e.data)
        return;

      e.data.split('').forEach(this.terminal.onVTKeystroke.bind(this.terminal));
    };

    /**
     * Handle onKeyPress events.
     */
    Keyboard.prototype.onKeyPress_ = function(e) {
      var code;

      var key = String.fromCharCode(e.which);
      var lowerKey = key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (lowerKey == 'c' || lowerKey == 'v')) {
        // On FF the key press (not key down) event gets fired for copy/paste.
        // Let it fall through for the default browser behaviour.
        return;
      }

      var ch;

      if (e.altKey && this.altSendsWhat == 'browser-key' && e.charCode === 0) {
        // If we got here because we were expecting the browser to handle an
        // alt sequence but it didn't do it, then we might be on an OS without
        // an enabled IME system.  In that case we fall back to xterm-like
        // behavior.
        //
        // This happens here only as a fallback.  Typically these platforms should
        // set altSendsWhat to either 'escape' or '8-bit'.
        ch = String.fromCharCode(e.keyCode);
        if (!e.shiftKey)
          ch = ch.toLowerCase();
        code = ch.charCodeAt(0) + 128;

      } else if (e.charCode >= 32) {
        ch = e.charCode;
      }

      if (ch)
        this.terminal.onVTKeystroke(String.fromCharCode(ch));

      e.preventDefault();
      e.stopPropagation();
    };

    Keyboard.prototype.onBlur_ = function(e) {
      this.altIsPressed = false;
    };

    Keyboard.prototype.onKeyUp_ = function(e) {
      if (e.keyCode == 18)
        this.altIsPressed = false;
    };

    /**
     * Handle onKeyDown events.
     */
    Keyboard.prototype.onKeyDown_ = function(e) {
      if (e.keyCode == 18)
        this.altIsPressed = true;

      var keyDef = this.keyMap.keyDefs[e.keyCode];
      if (!keyDef) {
        console.warn('No definition for keyCode: ' + e.keyCode);
        return;
      }

      // The type of action we're going to use.
      var resolvedActionType = null;

      var self = this;
      function getAction(name) {
        // Get the key action for the given action name.  If the action is a
        // function, dispatch it.  If the action defers to the normal action,
        // resolve that instead.

        resolvedActionType = name;

        var action = keyDef[name];
        if (typeof action == 'function')
          action = action.apply(self.keyMap, [e, keyDef]);

        if (action === DEFAULT && name != 'normal')
          action = getAction('normal');

        return action;
      }

      // Note that we use the triple-equals ('===') operator to test equality for
      // these constants, in order to distingush usage of the constant from usage
      // of a literal string that happens to contain the same bytes.
      var CANCEL = keyActions.CANCEL;
      var DEFAULT = keyActions.DEFAULT;
      var PASS = keyActions.PASS;
      var STRIP = keyActions.STRIP;

      var control = e.ctrlKey;
      var alt = this.altIsMeta ? false : e.altKey;
      var meta = this.altIsMeta ? (e.altKey || e.metaKey) : e.metaKey;

      var action;

      if (control) {
        action = getAction('control');
      } else if (alt) {
        action = getAction('alt');
      } else if (meta) {
        action = getAction('meta');
      } else {
        action = getAction('normal');
      }

      // The action may have cleared the e.shiftKey, so we wait until after
      // getAction to read it.
      var shift = e.shiftKey;

      if (alt && this.altSendsWhat == 'browser-key' && action == DEFAULT) {
        // When altSendsWhat is 'browser-key', we wait for the keypress event.
        // In keypress, the browser should have set the event.charCode to the
        // appropriate character.
        // TODO(rginda): Character compositions will need some black magic.
        action = PASS;
      }

      if (action === PASS || (action === DEFAULT && !(control || alt || meta))) {
        // If this key is supposed to be handled by the browser, or it is an
        // unmodified key with the default action, then exit this event handler.
        // If it's an unmodified key, it'll be handled in onKeyPress where we
        // can tell for sure which ASCII code to insert.
        //
        // This block needs to come before the STRIP test, otherwise we'll strip
        // the modifier and think it's ok to let the browser handle the keypress.
        // The browser won't know we're trying to ignore the modifiers and might
        // perform some default action.
        return;
      }

      if (action === STRIP) {
        alt = control = false;
        action = keyDef.normal;
        if (typeof action == 'function')
          action = action.apply(this.keyMap, [e, keyDef]);

        if (action == DEFAULT && keyDef.keyCap.length == 2)
          action = keyDef.keyCap.substr((e.shiftKey ? 1 : 0), 1);
      }

      e.preventDefault();
      e.stopPropagation();

      if (action === CANCEL)
        return;

      if (action !== DEFAULT && typeof action != 'string') {
        console.warn('Invalid action: ' + JSON.stringify(action));
        return;
      }

      // Strip the modifier that is associated with the action, since we assume that
      // modifier has already been accounted for in the action.
      if (resolvedActionType == 'control') {
        control = false;
      } else if (resolvedActionType == 'alt') {
        alt = false;
      } else if (resolvedActionType == 'meta') {
        meta = false;
      }

      if (action.substr(0, 2) == '\x1b[' && (alt || control || shift)) {
        // The action is an escape sequence that and it was triggered in the
        // presence of a keyboard modifier, we may need to alter the action to
        // include the modifier before sending it.

        var mod;

        if (shift && !(alt || control)) {
          mod = ';2';
        } else if (alt && !(shift || control)) {
          mod = ';3';
        } else if (shift && alt && !control) {
          mod = ';4';
        } else if (control && !(shift || alt)) {
          mod = ';5';
        } else if (shift && control && !alt) {
          mod = ';6';
        } else if (alt && control && !shift) {
          mod = ';7';
        } else if (shift && alt && control) {
          mod = ';8';
        }

        if (action.length == 3) {
          // Some of the CSI sequences have zero parameters unless modified.
          action = '\x1b[1' + mod + action.substr(2, 1);
        } else {
          // Others always have at least one parameter.
          action = action.substr(0, action.length - 1) + mod +
              action.substr(action.length - 1);
        }

      } else {
        var code;

        if (action === DEFAULT) {
          action = keyDef.keyCap.substr((e.shiftKey ? 1 : 0), 1);

          if (control) {
            var unshifted = keyDef.keyCap.substr(0, 1);
            code = unshifted.charCodeAt(0);
            if (code >= 64 && code <= 95) {
              action = String.fromCharCode(code - 64);
            }
          }
        }

        if (alt && this.altSendsWhat == '8-bit' && action.length == 1) {
          code = action.charCodeAt(0) + 128;
          action = String.fromCharCode(code);
        }

        // We respect alt/metaSendsEscape even if the keymap action was a literal
        // string.  Otherwise, every overridden alt/meta action would have to
        // check alt/metaSendsEscape.
        if ((alt && this.altSendsWhat == 'escape') ||
            (meta && this.metaSendsEscape)) {
          action = '\x1b' + action;
        }
      }

      this.terminal.onVTKeystroke(action);
    };
  });
define("hterm/public", 
  ["hterm/config","hterm/terminal","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var Config = __dependency1__["default"];
    var Terminal = __dependency2__["default"];

    var hterm = {
      Config: Config,
      Terminal: Terminal
    };
    __exports__.hterm = hterm;
    __exports__["default"] = hterm;
  });
define("hterm/resource/ding", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var ding = {};
    __exports__.ding = ding;__exports__["default"] = ding;

    ding.getDataUrl = function() {
      return 'data:audio/ogg;base64,' +
    'T2dnUwACAAAAAAAAAADhqW5KAAAAAMFvEjYBHgF2b3JiaXMAAAAAAYC7AAAAAAAAAHcBAAAAAAC4' +
    'AU9nZ1MAAAAAAAAAAAAA4aluSgEAAAAAesI3EC3//////////////////8kDdm9yYmlzHQAAAFhp' +
    'cGguT3JnIGxpYlZvcmJpcyBJIDIwMDkwNzA5AAAAAAEFdm9yYmlzKUJDVgEACAAAADFMIMWA0JBV' +
    'AAAQAABgJCkOk2ZJKaWUoSh5mJRISSmllMUwiZiUicUYY4wxxhhjjDHGGGOMIDRkFQAABACAKAmO' +
    'o+ZJas45ZxgnjnKgOWlOOKcgB4pR4DkJwvUmY26mtKZrbs4pJQgNWQUAAAIAQEghhRRSSCGFFGKI' +
    'IYYYYoghhxxyyCGnnHIKKqigggoyyCCDTDLppJNOOumoo4466ii00EILLbTSSkwx1VZjrr0GXXxz' +
    'zjnnnHPOOeecc84JQkNWAQAgAAAEQgYZZBBCCCGFFFKIKaaYcgoyyIDQkFUAACAAgAAAAABHkRRJ' +
    'sRTLsRzN0SRP8ixREzXRM0VTVE1VVVVVdV1XdmXXdnXXdn1ZmIVbuH1ZuIVb2IVd94VhGIZhGIZh' +
    'GIZh+H3f933f930gNGQVACABAKAjOZbjKaIiGqLiOaIDhIasAgBkAAAEACAJkiIpkqNJpmZqrmmb' +
    'tmirtm3LsizLsgyEhqwCAAABAAQAAAAAAKBpmqZpmqZpmqZpmqZpmqZpmqZpmmZZlmVZlmVZlmVZ' +
    'lmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZQGjIKgBAAgBAx3Ecx3EkRVIkx3IsBwgNWQUAyAAA' +
    'CABAUizFcjRHczTHczzHczxHdETJlEzN9EwPCA1ZBQAAAgAIAAAAAABAMRzFcRzJ0SRPUi3TcjVX' +
    'cz3Xc03XdV1XVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVYHQkFUAAAQAACGdZpZq' +
    'gAgzkGEgNGQVAIAAAAAYoQhDDAgNWQUAAAQAAIih5CCa0JrzzTkOmuWgqRSb08GJVJsnuamYm3PO' +
    'OeecbM4Z45xzzinKmcWgmdCac85JDJqloJnQmnPOeRKbB62p0ppzzhnnnA7GGWGcc85p0poHqdlY' +
    'm3POWdCa5qi5FJtzzomUmye1uVSbc84555xzzjnnnHPOqV6czsE54Zxzzonam2u5CV2cc875ZJzu' +
    'zQnhnHPOOeecc84555xzzglCQ1YBAEAAAARh2BjGnYIgfY4GYhQhpiGTHnSPDpOgMcgppB6NjkZK' +
    'qYNQUhknpXSC0JBVAAAgAACEEFJIIYUUUkghhRRSSCGGGGKIIaeccgoqqKSSiirKKLPMMssss8wy' +
    'y6zDzjrrsMMQQwwxtNJKLDXVVmONteaec645SGultdZaK6WUUkoppSA0ZBUAAAIAQCBkkEEGGYUU' +
    'UkghhphyyimnoIIKCA1ZBQAAAgAIAAAA8CTPER3RER3RER3RER3RER3P8RxREiVREiXRMi1TMz1V' +
    'VFVXdm1Zl3Xbt4Vd2HXf133f141fF4ZlWZZlWZZlWZZlWZZlWZZlCUJDVgEAIAAAAEIIIYQUUkgh' +
    'hZRijDHHnINOQgmB0JBVAAAgAIAAAAAAR3EUx5EcyZEkS7IkTdIszfI0T/M00RNFUTRNUxVd0RV1' +
    '0xZlUzZd0zVl01Vl1XZl2bZlW7d9WbZ93/d93/d93/d93/d939d1IDRkFQAgAQCgIzmSIimSIjmO' +
    '40iSBISGrAIAZAAABACgKI7iOI4jSZIkWZImeZZniZqpmZ7pqaIKhIasAgAAAQAEAAAAAACgaIqn' +
    'mIqniIrniI4oiZZpiZqquaJsyq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7rukBo' +
    'yCoAQAIAQEdyJEdyJEVSJEVyJAcIDVkFAMgAAAgAwDEcQ1Ikx7IsTfM0T/M00RM90TM9VXRFFwgN' +
    'WQUAAAIACAAAAAAAwJAMS7EczdEkUVIt1VI11VItVVQ9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
    'VVVVVVVVVVVV1TRN0zSB0JCVAAAZAAAjQQYZhBCKcpBCbj1YCDHmJAWhOQahxBiEpxAzDDkNInSQ' +
    'QSc9uJI5wwzz4FIoFURMg40lN44gDcKmXEnlOAhCQ1YEAFEAAIAxyDHEGHLOScmgRM4xCZ2UyDkn' +
    'pZPSSSktlhgzKSWmEmPjnKPSScmklBhLip2kEmOJrQAAgAAHAIAAC6HQkBUBQBQAAGIMUgophZRS' +
    'zinmkFLKMeUcUko5p5xTzjkIHYTKMQadgxAppRxTzinHHITMQeWcg9BBKAAAIMABACDAQig0ZEUA' +
    'ECcA4HAkz5M0SxQlSxNFzxRl1xNN15U0zTQ1UVRVyxNV1VRV2xZNVbYlTRNNTfRUVRNFVRVV05ZN' +
    'VbVtzzRl2VRV3RZV1bZl2xZ+V5Z13zNNWRZV1dZNVbV115Z9X9ZtXZg0zTQ1UVRVTRRV1VRV2zZV' +
    '17Y1UXRVUVVlWVRVWXZlWfdVV9Z9SxRV1VNN2RVVVbZV2fVtVZZ94XRVXVdl2fdVWRZ+W9eF4fZ9' +
    '4RhV1dZN19V1VZZ9YdZlYbd13yhpmmlqoqiqmiiqqqmqtm2qrq1bouiqoqrKsmeqrqzKsq+rrmzr' +
    'miiqrqiqsiyqqiyrsqz7qizrtqiquq3KsrCbrqvrtu8LwyzrunCqrq6rsuz7qizruq3rxnHrujB8' +
    'pinLpqvquqm6um7runHMtm0co6rqvirLwrDKsu/rui+0dSFRVXXdlF3jV2VZ921fd55b94WybTu/' +
    'rfvKceu60vg5z28cubZtHLNuG7+t+8bzKz9hOI6lZ5q2baqqrZuqq+uybivDrOtCUVV9XZVl3zdd' +
    'WRdu3zeOW9eNoqrquirLvrDKsjHcxm8cuzAcXds2jlvXnbKtC31jyPcJz2vbxnH7OuP2daOvDAnH' +
    'jwAAgAEHAIAAE8pAoSErAoA4AQAGIecUUxAqxSB0EFLqIKRUMQYhc05KxRyUUEpqIZTUKsYgVI5J' +
    'yJyTEkpoKZTSUgehpVBKa6GU1lJrsabUYu0gpBZKaS2U0lpqqcbUWowRYxAy56RkzkkJpbQWSmkt' +
    'c05K56CkDkJKpaQUS0otVsxJyaCj0kFIqaQSU0mptVBKa6WkFktKMbYUW24x1hxKaS2kEltJKcYU' +
    'U20txpojxiBkzknJnJMSSmktlNJa5ZiUDkJKmYOSSkqtlZJSzJyT0kFIqYOOSkkptpJKTKGU1kpK' +
    'sYVSWmwx1pxSbDWU0lpJKcaSSmwtxlpbTLV1EFoLpbQWSmmttVZraq3GUEprJaUYS0qxtRZrbjHm' +
    'GkppraQSW0mpxRZbji3GmlNrNabWam4x5hpbbT3WmnNKrdbUUo0txppjbb3VmnvvIKQWSmktlNJi' +
    'ai3G1mKtoZTWSiqxlZJabDHm2lqMOZTSYkmpxZJSjC3GmltsuaaWamwx5ppSi7Xm2nNsNfbUWqwt' +
    'xppTS7XWWnOPufVWAADAgAMAQIAJZaDQkJUAQBQAAEGIUs5JaRByzDkqCULMOSepckxCKSlVzEEI' +
    'JbXOOSkpxdY5CCWlFksqLcVWaykptRZrLQAAoMABACDABk2JxQEKDVkJAEQBACDGIMQYhAYZpRiD' +
    '0BikFGMQIqUYc05KpRRjzknJGHMOQioZY85BKCmEUEoqKYUQSkklpQIAAAocAAACbNCUWByg0JAV' +
    'AUAUAABgDGIMMYYgdFQyKhGETEonqYEQWgutddZSa6XFzFpqrbTYQAithdYySyXG1FpmrcSYWisA' +
    'AOzAAQDswEIoNGQlAJAHAEAYoxRjzjlnEGLMOegcNAgx5hyEDirGnIMOQggVY85BCCGEzDkIIYQQ' +
    'QuYchBBCCKGDEEIIpZTSQQghhFJK6SCEEEIppXQQQgihlFIKAAAqcAAACLBRZHOCkaBCQ1YCAHkA' +
    'AIAxSjkHoZRGKcYglJJSoxRjEEpJqXIMQikpxVY5B6GUlFrsIJTSWmw1dhBKaS3GWkNKrcVYa64h' +
    'pdZirDXX1FqMteaaa0otxlprzbkAANwFBwCwAxtFNicYCSo0ZCUAkAcAgCCkFGOMMYYUYoox55xD' +
    'CCnFmHPOKaYYc84555RijDnnnHOMMeecc845xphzzjnnHHPOOeecc44555xzzjnnnHPOOeecc845' +
    '55xzzgkAACpwAAAIsFFkc4KRoEJDVgIAqQAAABFWYowxxhgbCDHGGGOMMUYSYowxxhhjbDHGGGOM' +
    'McaYYowxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHG' +
    'GFtrrbXWWmuttdZaa6211lprrQBAvwoHAP8HG1ZHOCkaCyw0ZCUAEA4AABjDmHOOOQYdhIYp6KSE' +
    'DkIIoUNKOSglhFBKKSlzTkpKpaSUWkqZc1JSKiWlllLqIKTUWkottdZaByWl1lJqrbXWOgiltNRa' +
    'a6212EFIKaXWWostxlBKSq212GKMNYZSUmqtxdhirDGk0lJsLcYYY6yhlNZaazHGGGstKbXWYoy1' +
    'xlprSam11mKLNdZaCwDgbnAAgEiwcYaVpLPC0eBCQ1YCACEBAARCjDnnnHMQQgghUoox56CDEEII' +
    'IURKMeYcdBBCCCGEjDHnoIMQQgghhJAx5hx0EEIIIYQQOucchBBCCKGEUkrnHHQQQgghlFBC6SCE' +
    'EEIIoYRSSikdhBBCKKGEUkopJYQQQgmllFJKKaWEEEIIoYQSSimllBBCCKWUUkoppZQSQgghlFJK' +
    'KaWUUkIIoZRQSimllFJKCCGEUkoppZRSSgkhhFBKKaWUUkopIYQSSimllFJKKaUAAIADBwCAACPo' +
    'JKPKImw04cIDUGjISgCADAAAcdhq6ynWyCDFnISWS4SQchBiLhFSijlHsWVIGcUY1ZQxpRRTUmvo' +
    'nGKMUU+dY0oxw6yUVkookYLScqy1dswBAAAgCAAwECEzgUABFBjIAIADhAQpAKCwwNAxXAQE5BIy' +
    'CgwKx4Rz0mkDABCEyAyRiFgMEhOqgaJiOgBYXGDIB4AMjY20iwvoMsAFXdx1IIQgBCGIxQEUkICD' +
    'E2544g1PuMEJOkWlDgIAAAAA4AAAHgAAkg0gIiKaOY4Ojw+QEJERkhKTE5QAAAAAALABgA8AgCQF' +
    'iIiIZo6jw+MDJERkhKTE5AQlAAAAAAAAAAAACAgIAAAAAAAEAAAACAhPZ2dTAAQYOwAAAAAAAOGp' +
    'bkoCAAAAmc74DRgyNjM69TAzOTk74dnLubewsbagmZiNp4d0KbsExSY/I3XUTwJgkeZdn1HY4zoj' +
    '33/q9DFtv3Ui1/jmx7lCUtPt18/sYf9MkgAsAGRBd3gMGP4sU+qCPYBy9VrA3YqJosW3W2/ef1iO' +
    '/u3cg8ZG/57jU+pPmbGEJUgkfnaI39DbPqxddZphbMRmCc5rKlkUMkyx8iIoug5dJv1OYH9a59c+' +
    '3Gevqc7Z2XFdDjL/qHztRfjWEWxJ/aiGezjohu9HsCZdQBKbiH0VtU/3m85lDG2T/+xkZcYnX+E+' +
    'aqzv/xTgOoTFG+x7SNqQ4N+oAABSxuVXw77Jd5bmmTmuJakX7509HH0kGYKvARPpwfOSAPySPAc2' +
    'EkneDwB2HwAAJlQDYK5586N79GJCjx4+p6aDUd27XSvRyXLJkIC5YZ1jLv5lpOhZTz0s+DmnF1di' +
    'ptrnM6UDgIW11Xh8cHTd0/SmbgOAdxcyWwMAAGIrZ3fNSfZbzKiYrK4+tPqtnMVLOeWOG2kVvUY+' +
    'p2PJ/hkCl5aFRO4TLGYPZcIU3vYM1hohS4jHFlnyW/2T5J7kGsShXWT8N05V+3C/GPqJ1QdWisGP' +
    'xEzHqXISBPIinWDUt7IeJv/f5OtzBxpTzZZQ+CYEhHXfqG4aABQli72GJhN4oJv+hXcApAJSErAW' +
    '8G2raAX4NUcABnVt77CzZAB+LsHcVe+Q4h+QB1wh/ZrJTPxSBdI8mgTeAdTsQOoFUEng9BHcVPhx' +
    'SRRYkKWZJXOFYP6V4AEripJoEjXgA2wJRZHSExmJDm8F0A6gEXsg5a4ZsALItrMB7+fh7UKLvYWS' +
    'dtsDwFf1mzYzS1F82N1h2Oyt2e76B1QdS0SAsQigLPMOgJS9JRC7hFXA6kUsLFNKD5cA5cTRvgSq' +
    'Pc3Fl99xW3QTi/MHR8DEm6WnvaVQATwRqRKjywQ9BrrhugR2AKTsPQeQckrAOgDOhbTESyrXQ50C' +
    'kNpXdtWjW7W2/3UjeX3U95gIdalfRAoAmqUEiwp53hCdcCwlg47fcbfzlmQMAgaBkh7c+fcDgF+i' +
    'fwDXfzegLPcLYJsAAJQArTXjnh/uXGy3v1Hk3pV6/3t5ruW81f6prfbM2Q3WNVy98BwUtbCwhFhA' +
    'WuPev6Oe/4ZaFQUcgKrVs4defzh1TADA1DEh5b3VlDaECw5b+bPfkKos3tIAue3vJZOih3ga3l6O' +
    '3PSfIkrLv0PAS86PPdL7g8oc2KteNFKKzKRehOv2gJoFLBPXmaXvPBQILgJon0bbWBszrYZYYwE7' +
    'jl2j+vTdU7Vpk21LiU0QajPkywAAHqbUC0/YsYOdb4e6BOp7E0cCi04Ao/TgD8ZVAMid6h/A8IeB' +
    'Nkp6/xsAACZELEYIk+yvI6Qz1NN6lIftB/6IMWjWJNOqPTMedAmyaj6Es0QBklJpiSWWHnQ2CoYb' +
    'GWAmt+0gLQBFKCBnp2QUUQZ/1thtZDBJUpFWY82z34ocorB62oX7qB5y0oPAv/foxH25wVmgIHf2' +
    'xFOr8leZcBq1Kx3ZvCq9Bga639AxuHuPNL/71YCF4EywJpqHFAX6XF0sjVbuANnvvdLcrufYwOM/' +
    'iDa6iA468AYAAB6mNBMXcgTD8HSRqJ4vw8CjAlCEPACASlX/APwPOJKl9xQAAAPmnev2eWp33Xgy' +
    'w3Dvfz6myGk3oyP8YTKsCOvzAgALQi0o1c6Nzs2O2Pg2h4ACIJAgAGP0aNn5x0BDgVfH7u2TtyfD' +
    'cRIuYAyQhBF/lvSRAttgA6TPbWZA9gaUrZWAUEAA+Dx47Q3/r87HxUUqZmB0BmUuMlojFjHt1gDu' +
    'nnvuX8MImsjSq5WkzSzGS62OEIlOufWWezxWpv6FBgDgJVltfXFYtNAAnqU0xQoD0YLiXo5cF5QV' +
    '4CnY1tBLAkZCOABAhbk/AM+/AwSCCdlWAAAMcFjS7owb8GVDzveDiZvznbt2tF4bL5odN1YKl88T' +
    'AEABCZvufq9YCTBtMwVAQUEAwGtNltzSaHvADYC3TxLVjqiRA+OZAMhzcqEgRcAOwoCgvdTxsTHL' +
    'QEF6+oOb2+PAI8ciPQcXg7pOY+LjxQSv2fjmFuj34gGwz310/bGK6z3xgT887eomWULEaDd04wHe' +
    'tYxdjcgV2SxvSwn0VoZXJRqkRC5ASQ/muVoAUsX7AgAQMBNaVwAAlABRxT/1PmfqLqSRNDbhXb07' +
    'berpB3b94jpuWEZjBCD2OcdXFpCKEgCDfcFPMw8AAADUwT4lnUm50lmwrpMMhPQIKj6u0E8fr2vG' +
    'BngMNdIlrZsigjahljud6AFVg+tzXwUnXL3TJLpajaWKA4VAAAAMiFfqJgKAZ08XrtS3dxtQNYcp' +
    'PvYEG8ClvrQRJgBephwnNWJjtGqmp6VEPSvBe7EBiU3qgJbQAwD4Le8LAMDMhHbNAAAlgK+tFs5O' +
    '+YyJc9yCnJa3rxLPulGnxwsXV9Fsk2k4PisCAHC8FkwbGE9gJQAAoMnyksj0CdFMZLLgoz8M+Fxz' +
    'iwYBgIx+zHiCBAKAlBKNpF1sO9JpVcyEi9ar15YlHgrut5fPJnkdJ6vEwZPyAHQBIEDUrlMcBAAd' +
    '2KAS0Qq+JwRsE4AJZtMnAD6GnOYwYlOIZvtzUNdjreB7fiMkWI0CmBB6AIAKc38A9osEFlTSGECB' +
    '+cbeRDC0aRpLHqNPplcK/76Lxn2rpmqyXsYJWRi/FQAAAKBQk9MCAOibrQBQADCDsqpooPutd+05' +
    'Ce9g6iEdiYXgVmQAI4+4wskEBEiBloNQ6Ki0/KTQ0QjWfjxzi+AeuXKoMjEVfQOZzr0y941qLgM2' +
    'AExvbZOqcxZ6J6krlrj4y2j9AdgKDx6GnJsVLhbc42uq584+ouSdNBpoCiCVHrz+WzUA/DDtD8AT' +
    'gA3h0lMCAAzcFv+S+fSSNkeYWlTpb34mf2RfmqqJeMeklhHAfu7VoAEACgAApKRktL+KkQDWMwYC' +
    'UAAAAHCKsp80xhp91UjqQBw3x45cetqkjQEyu3G9B6N+R650Uq8OVig7wOm6Wun0ea4lKDPoabJs' +
    '6aLqgbhPzpv4KR4iODilw88ZpY7q1IOMcbASAOAVtmcCnobcrkG4KGS7/ZnskVWRNF9J0RUHKOnB' +
    'yy9WA8Dv6L4AAARMCQUA4GritfVM2lcZfH3Q3T/vZ47J2YHhcmBazjfdyuV25gLAzrc0cwAAAAAY' +
    'Ch6PdwAAAGyWjFW4yScjaWa2mGcofHxWxewKALglWBpLUvwwk+UOh5eNGyUOs1/EF+pZr+ud5Ozo' +
    'GwYdAABg2p52LiSgAY/ZVlOmilEgHn6G3OcwYjzI7vOj1t6xsx4S3lBY96EUQBF6AIBAmPYH4PoG' +
    'YCoJAADWe+OZJZi7/x76/yH7Lzf9M5XzRKnFPmveMsilQHwVAAAAAKB3LQD8PCIAAADga0QujBLy' +
    'wzeJ4a6Z/ERVBAUlAEDqvoM7BQBAuAguzFqILtmjH3Kd4wfKobnOhA3z85qWoRPm9hwoOHoDAAlC' +
    'bwDAA56FHAuXflHo3fe2ttG9XUDeA9YmYCBQ0oPr/1QC8IvuCwAAApbUAQCK22MmE3O78VAbHQT9' +
    'PIPNoT9zNc3l2Oe7TAVLANBufT8MAQAAAGzT4PS8AQAAoELGHb2uaCwwEv1EWhFriUkbAaAZ27/f' +
    'VZnTZXbWz3BwWpjUaMZKRj7dZ0J//gUeTdpVEwAAZOFsNxKAjQSgA+ABPoY8Jj5y2wje81jsXc/1' +
    'TOQWTDYZBmAkNDiqVwuA2NJ9AQAAEBKAt9Vrsfs/2N19MO91S9rd8EHTZHnzC5MYmfQEACy/FBcA' +
    'AADA5c4gi4z8RANs/m6FNXVo9DV46JG1BBDukqlw/Va5G7QbuGVSI+2aZaoLXJrdVj2zlC9Z5QEA' +
    'EFz/5QzgVZwAAAAA/oXcxyC6WfTu+09Ve/c766J4VTAGUFmA51+VANKi/QPoPwYgYAkA715OH4S0' +
    's5KDHvj99MMq8TPFc3roKZnGOoT1bmIhVgc7XAMBAAAAAMAW1VbQw3gapzOpJd+Kd2fc4iSO62fJ' +
    'v9+movui1wUNPAj059N3OVxzk4gV73PmE8FIA2F5mRq37Evc76vLXfF4rD5UJJAw46hW6LZCb5sN' +
    'Ldx+kzMCAAB+hfy95+965ZCLP7B3/VlTHCvDEKtQhTm4KiCgAEAbrfbWTPssAAAAXpee1tVrozYY' +
    'n41wD1aeYtkKfswN5/SXPO0JDnhO/4laUortv/s412fybe/nONdncoCHnBVliu0CQGBWlPY/5Kwo' +
    'm2L/kruPM6Q7oz4tvDQy+bZ3HzOi+gNHA4DZEgA=';
    };
  });
define("hterm/screen", 
  ["hterm/struct","hterm/util","hterm/i18n","hterm/text_attributes","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var struct = __dependency1__["default"];
    var util = __dependency2__["default"];
    var i18n = __dependency3__["default"];

    var TextAttributes = __dependency4__["default"];

    /**
     * @fileoverview This class represents a single terminal screen full of text.
     *
     * It maintains the current cursor position and has basic methods for text
     * insert and overwrite, and adding or removing rows from the screen.
     *
     * This class has no knowledge of the scrollback buffer.
     *
     * The number of rows on the screen is determined only by the number of rows
     * that the caller inserts into the screen.  If a caller wants to ensure a
     * constant number of rows on the screen, it's their responsibility to remove a
     * row for each row inserted.
     *
     * The screen width, in contrast, is enforced locally.
     *
     *
     * In practice...
     * - The Terminal class holds two Screen instances.  One for the primary screen
     * and one for the alternate screen.
     *
     * - The html.Screen class only cares that rows are HTMLElements.  In the
     * larger context of hterm, however, the rows happen to be displayed by an
     * ScrollPort and have to follow a few rules as a result.  Each row must be
     * rooted by the custom HTML tag 'x-row', and each must have a rowIndex
     * property that corresponds to the index of the row in the context of the
     * scrollback buffer.  These invariants are enforced by Terminal because
     * that is the class using the Screen in the context of an ScrollPort.
     */

    /**
     * Create a new screen instance.
     *
     * The screen initially has no rows and a maximum column count of 0.
     *
     * @param {integer} opt_columnCount The maximum number of columns for this
     *    screen.  See insertString() and overwriteString() for information about
     *    what happens when too many characters are added too a row.  Defaults to
     *    0 if not provided.
     */
    var Screen = function(opt_columnCount) {
      /**
       * Public, read-only access to the rows in this screen.
       */
      this.rowsArray = [];

      // The max column width for this screen.
      this.columnCount_ = opt_columnCount || 80;

      // The current color, bold, underline and blink attributes.
      this.textAttributes = new TextAttributes(window.document);

      // Current zero-based cursor coordinates.
      this.cursorPosition = new struct.RowCol(0, 0);

      // The node containing the row that the cursor is positioned on.
      this.cursorRowNode_ = null;

      // The node containing the span of text that the cursor is positioned on.
      this.cursorNode_ = null;

      // The offset in column width into cursorNode_ where the cursor is positioned.
      this.cursorOffset_ = null;
    };
    __exports__.Screen = Screen;
    __exports__["default"] = Screen;

    /**
     * Return the screen size as an struct.Size object.
     *
     * @return {struct.Size} struct.Size object representing the current number
     *     of rows and columns in this screen.
     */
    Screen.prototype.getSize = function() {
      return new struct.Size(this.columnCount_, this.rowsArray.length);
    };

    /**
     * Return the current number of rows in this screen.
     *
     * @return {integer} The number of rows in this screen.
     */
    Screen.prototype.getHeight = function() {
      return this.rowsArray.length;
    };

    /**
     * Return the current number of columns in this screen.
     *
     * @return {integer} The number of columns in this screen.
     */
    Screen.prototype.getWidth = function() {
      return this.columnCount_;
    };

    /**
     * Set the maximum number of columns per row.
     *
     * @param {integer} count The maximum number of columns per row.
     */
    Screen.prototype.setColumnCount = function(count) {
      this.columnCount_ = count;

      if (this.cursorPosition.column >= count)
        this.setCursorPosition(this.cursorPosition.row, count - 1);
    };

    /**
     * Remove the first row from the screen and return it.
     *
     * @return {HTMLElement} The first row in this screen.
     */
    Screen.prototype.shiftRow = function() {
      return this.shiftRows(1)[0];
    };

    /**
     * Remove rows from the top of the screen and return them as an array.
     *
     * @param {integer} count The number of rows to remove.
     * @return {Array.<HTMLElement>} The selected rows.
     */
    Screen.prototype.shiftRows = function(count) {
      return this.rowsArray.splice(0, count);
    };

    /**
     * Insert a row at the top of the screen.
     *
     * @param {HTMLElement} The row to insert.
     */
    Screen.prototype.unshiftRow = function(row) {
      this.rowsArray.splice(0, 0, row);
    };

    /**
     * Insert rows at the top of the screen.
     *
     * @param {Array.<HTMLElement>} The rows to insert.
     */
    Screen.prototype.unshiftRows = function(rows) {
      this.rowsArray.unshift.apply(this.rowsArray, rows);
    };

    /**
     * Remove the last row from the screen and return it.
     *
     * @return {HTMLElement} The last row in this screen.
     */
    Screen.prototype.popRow = function() {
      return this.popRows(1)[0];
    };

    /**
     * Remove rows from the bottom of the screen and return them as an array.
     *
     * @param {integer} count The number of rows to remove.
     * @return {Array.<HTMLElement>} The selected rows.
     */
    Screen.prototype.popRows = function(count) {
      return this.rowsArray.splice(this.rowsArray.length - count, count);
    };

    /**
     * Insert a row at the bottom of the screen.
     *
     * @param {HTMLElement} The row to insert.
     */
    Screen.prototype.pushRow = function(row) {
      this.rowsArray.push(row);
    };

    /**
     * Insert rows at the bottom of the screen.
     *
     * @param {Array.<HTMLElement>} The rows to insert.
     */
    Screen.prototype.pushRows = function(rows) {
      rows.push.apply(this.rowsArray, rows);
    };

    /**
     * Insert a row at the specified column of the screen.
     *
     * @param {HTMLElement} The row to insert.
     */
    Screen.prototype.insertRow = function(index, row) {
      this.rowsArray.splice(index, 0, row);
    };

    /**
     * Insert rows at the specified column of the screen.
     *
     * @param {Array.<HTMLElement>} The rows to insert.
     */
    Screen.prototype.insertRows = function(index, rows) {
      for (var i = 0; i < rows.length; i++) {
        this.rowsArray.splice(index + i, 0, rows[i]);
      }
    };

    /**
     * Remove a last row from the specified column of the screen and return it.
     *
     * @return {HTMLElement} The selected row.
     */
    Screen.prototype.removeRow = function(index) {
      return this.rowsArray.splice(index, 1)[0];
    };

    /**
     * Remove rows from the bottom of the screen and return them as an array.
     *
     * @param {integer} count The number of rows to remove.
     * @return {Array.<HTMLElement>} The selected rows.
     */
    Screen.prototype.removeRows = function(index, count) {
      return this.rowsArray.splice(index, count);
    };

    /**
     * Invalidate the current cursor position.
     *
     * This sets this.cursorPosition to (0, 0) and clears out some internal
     * data.
     *
     * Attempting to insert or overwrite text while the cursor position is invalid
     * will raise an obscure exception.
     */
    Screen.prototype.invalidateCursorPosition = function() {
      this.cursorPosition.move(0, 0);
      this.cursorRowNode_ = null;
      this.cursorNode_ = null;
      this.cursorOffset_ = null;
    };

    /**
     * Clear the contents of the cursor row.
     */
    Screen.prototype.clearCursorRow = function() {
      this.cursorRowNode_.innerHTML = '';
      this.cursorRowNode_.removeAttribute('line-overflow');
      this.cursorOffset_ = 0;
      this.cursorPosition.column = 0;
      this.cursorPosition.overflow = false;

      var text;
      if (this.textAttributes.isDefault()) {
        text = '';
      } else {
        text = util.string.getWhitespace(this.columnCount_);
      }

      // We shouldn't honour inverse colors when clearing an area, to match
      // xterm's back color erase behaviour.
      var inverse = this.textAttributes.inverse;
      this.textAttributes.inverse = false;
      this.textAttributes.syncColors();

      var node = this.textAttributes.createContainer(text);
      this.cursorRowNode_.appendChild(node);
      this.cursorNode_ = node;

      this.textAttributes.inverse = inverse;
      this.textAttributes.syncColors();
    };

    /**
     * Mark the current row as having overflowed to the next line.
     *
     * The line overflow state is used when converting a range of rows into text.
     * It makes it possible to recombine two or more overflow terminal rows into
     * a single line.
     *
     * This is distinct from the cursor being in the overflow state.  Cursor
     * overflow indicates that printing at the cursor position will commit a
     * line overflow, unless it is preceded by a repositioning of the cursor
     * to a non-overflow state.
     */
    Screen.prototype.commitLineOverflow = function() {
      this.cursorRowNode_.setAttribute('line-overflow', true);
    };

    /**
     * Relocate the cursor to a give row and column.
     *
     * @param {integer} row The zero based row.
     * @param {integer} column The zero based column.
     */
    Screen.prototype.setCursorPosition = function(row, column) {
      if (!this.rowsArray.length) {
        console.warn('Attempt to set cursor position on empty screen.');
        return;
      }

      if (row >= this.rowsArray.length) {
        console.error('Row out of bounds: ' + row);
        row = this.rowsArray.length - 1;
      } else if (row < 0) {
        console.error('Row out of bounds: ' + row);
        row = 0;
      }

      if (column >= this.columnCount_) {
        console.error('Column out of bounds: ' + column);
        column = this.columnCount_ - 1;
      } else if (column < 0) {
        console.error('Column out of bounds: ' + column);
        column = 0;
      }

      this.cursorPosition.overflow = false;

      var rowNode = this.rowsArray[row];
      var node = rowNode.firstChild;

      if (!node) {
        node = rowNode.ownerDocument.createTextNode('');
        rowNode.appendChild(node);
      }

      var currentColumn = 0;

      if (rowNode == this.cursorRowNode_) {
        if (column >= this.cursorPosition.column - this.cursorOffset_) {
          node = this.cursorNode_;
          currentColumn = this.cursorPosition.column - this.cursorOffset_;
        }
      } else {
        this.cursorRowNode_ = rowNode;
      }

      this.cursorPosition.move(row, column);

      while (node) {
        var offset = column - currentColumn;
        var width = TextAttributes.nodeWidth(node);
        if (!node.nextSibling || width > offset) {
          this.cursorNode_ = node;
          this.cursorOffset_ = offset;
          return;
        }

        currentColumn += width;
        node = node.nextSibling;
      }
    };

    /**
     * Set the provided selection object to be a caret selection at the current
     * cursor position.
     */
    Screen.prototype.syncSelectionCaret = function(selection) {
      try {
        selection.collapse(this.cursorNode_, this.cursorOffset_);
      } catch (firefoxIgnoredException) {
        // FF can throw an exception if the range is off, rather than just not
        // performing the collapse.
      }
    };

    /**
     * Split a single node into two nodes at the given offset.
     *
     * For example:
     * Given the DOM fragment '<div><span>Hello World</span></div>', call splitNode_
     * passing the span and an offset of 6.  This would modifiy the fragment to
     * become: '<div><span>Hello </span><span>World</span></div>'.  If the span
     * had any attributes they would have been copied to the new span as well.
     *
     * The to-be-split node must have a container, so that the new node can be
     * placed next to it.
     *
     * @param {HTMLNode} node The node to split.
     * @param {integer} offset The offset into the node where the split should
     *     occur.
     */
    Screen.prototype.splitNode_ = function(node, offset) {
      var afterNode = node.cloneNode(false);

      var textContent = node.textContent;
      node.textContent = TextAttributes.nodeSubstr(node, 0, offset);
      afterNode.textContent = i18n.wc.substr(textContent, offset);

      if (afterNode.textContent)
        node.parentNode.insertBefore(afterNode, node.nextSibling);
      if (!node.textContent)
        node.parentNode.removeChild(node);
    };

    /**
     * Ensure that text is clipped and the cursor is clamped to the column count.
     */
    Screen.prototype.maybeClipCurrentRow = function() {
      var width = TextAttributes.nodeWidth(this.cursorRowNode_);

      if (width <= this.columnCount_) {
        // Current row does not need clipping, but may need clamping.
        if (this.cursorPosition.column >= this.columnCount_) {
          this.setCursorPosition(this.cursorPosition.row, this.columnCount_ - 1);
          this.cursorPosition.overflow = true;
        }

        return;
      }

      // Save off the current column so we can maybe restore it later.
      var currentColumn = this.cursorPosition.column;

      // Move the cursor to the final column.
      this.setCursorPosition(this.cursorPosition.row, this.columnCount_ - 1);

      // Remove any text that partially overflows.
      width = TextAttributes.nodeWidth(this.cursorNode_);

      if (this.cursorOffset_ < width - 1) {
        this.cursorNode_.textContent = TextAttributes.nodeSubstr(
            this.cursorNode_, 0, this.cursorOffset_ + 1);
      }

      // Remove all nodes after the cursor.
      var rowNode = this.cursorRowNode_;
      var node = this.cursorNode_.nextSibling;

      while (node) {
        rowNode.removeChild(node);
        node = this.cursorNode_.nextSibling;
      }

      if (currentColumn < this.columnCount_) {
        // If the cursor was within the screen before we started then restore its
        // position.
        this.setCursorPosition(this.cursorPosition.row, currentColumn);
      } else {
        // Otherwise leave it at the the last column in the overflow state.
        this.cursorPosition.overflow = true;
      }
    };

    /**
     * Insert a string at the current character position using the current
     * text attributes.
     *
     * You must call maybeClipCurrentRow() after in order to clip overflowed
     * text and clamp the cursor.
     *
     * It is also up to the caller to properly maintain the line overflow state
     * using Screen..commitLineOverflow().
     */
    Screen.prototype.insertString = function(str) {
      var cursorNode = this.cursorNode_;
      var cursorNodeText = cursorNode.textContent;

      this.cursorRowNode_.removeAttribute('line-overflow');

      // We may alter the width of the string by prepending some missing
      // whitespaces, so we need to record the string width ahead of time.
      var strWidth = i18n.wc.strWidth(str);

      // No matter what, before this function exits the cursor column will have
      // moved this much.
      this.cursorPosition.column += strWidth;

      // Local cache of the cursor offset.
      var offset = this.cursorOffset_;

      // Reverse offset is the offset measured from the end of the string.
      // Zero implies that the cursor is at the end of the cursor node.
      var reverseOffset = TextAttributes.nodeWidth(cursorNode) - offset;

      if (reverseOffset < 0) {
        // A negative reverse offset means the cursor is positioned past the end
        // of the characters on this line.  We'll need to insert the missing
        // whitespace.
        var ws = util.string.getWhitespace(-reverseOffset);

        // This whitespace should be completely unstyled.  Underline and background
        // color would be visible on whitespace, so we can't use one of those
        // spans to hold the text.
        if (!(this.textAttributes.underline ||
              this.textAttributes.background ||
              this.textAttributes.wcNode ||
              this.textAttributes.tileData != null)) {
          // Best case scenario, we can just pretend the spaces were part of the
          // original string.
          str = ws + str;
        } else if (cursorNode.nodeType == 3 ||
                   !(cursorNode.wcNode ||
                     cursorNode.tileNode ||
                     cursorNode.style.textDecoration ||
                     cursorNode.style.backgroundColor)) {
          // Second best case, the current node is able to hold the whitespace.
          cursorNode.textContent = (cursorNodeText += ws);
        } else {
          // Worst case, we have to create a new node to hold the whitespace.
          var wsNode = cursorNode.ownerDocument.createTextNode(ws);
          this.cursorRowNode_.insertBefore(wsNode, cursorNode.nextSibling);
          this.cursorNode_ = cursorNode = wsNode;
          this.cursorOffset_ = offset = -reverseOffset;
          cursorNodeText = ws;
        }

        // We now know for sure that we're at the last character of the cursor node.
        reverseOffset = 0;
      }

      if (this.textAttributes.matchesContainer(cursorNode)) {
        // The new text can be placed directly in the cursor node.
        if (reverseOffset === 0) {
          cursorNode.textContent = cursorNodeText + str;
        } else if (offset === 0) {
          cursorNode.textContent = str + cursorNodeText;
        } else {
          cursorNode.textContent =
              TextAttributes.nodeSubstr(cursorNode, 0, offset) +
              str + TextAttributes.nodeSubstr(cursorNode, offset);
        }

        this.cursorOffset_ += strWidth;
        return;
      }

      // The cursor node is the wrong style for the new text.  If we're at the
      // beginning or end of the cursor node, then the adjacent node is also a
      // potential candidate.

      var newNode;

      if (offset === 0) {
        // At the beginning of the cursor node, the check the previous sibling.
        var previousSibling = cursorNode.previousSibling;
        if (previousSibling &&
            this.textAttributes.matchesContainer(previousSibling)) {
          previousSibling.textContent += str;
          this.cursorNode_ = previousSibling;
          this.cursorOffset_ = i18n.wc.strWidth(previousSibling.textContent);
          return;
        }

        newNode = this.textAttributes.createContainer(str);
        this.cursorRowNode_.insertBefore(newNode, cursorNode);
        this.cursorNode_ = newNode;
        this.cursorOffset_ = strWidth;
        return;
      }

      if (reverseOffset === 0) {
        // At the end of the cursor node, the check the next sibling.
        var nextSibling = cursorNode.nextSibling;
        if (nextSibling &&
            this.textAttributes.matchesContainer(nextSibling)) {
          nextSibling.textContent = str + nextSibling.textContent;
          this.cursorNode_ = nextSibling;
          this.cursorOffset_ = i18n.wc.strWidth(str);
          return;
        }

        newNode = this.textAttributes.createContainer(str);
        this.cursorRowNode_.insertBefore(newNode, nextSibling);
        this.cursorNode_ = newNode;
        // We specifically need to include any missing whitespace here, since it's
        // going in a new node.
        this.cursorOffset_ = TextAttributes.nodeWidth(newNode);
        return;
      }

      // Worst case, we're somewhere in the middle of the cursor node.  We'll
      // have to split it into two nodes and insert our new container in between.
      this.splitNode_(cursorNode, offset);
      newNode = this.textAttributes.createContainer(str);
      this.cursorRowNode_.insertBefore(newNode, cursorNode.nextSibling);
      this.cursorNode_ = newNode;
      this.cursorOffset_ = strWidth;
    };

    /**
     * Overwrite the text at the current cursor position.
     *
     * You must call maybeClipCurrentRow() after in order to clip overflowed
     * text and clamp the cursor.
     *
     * It is also up to the caller to properly maintain the line overflow state
     * using Screen..commitLineOverflow().
     */
    Screen.prototype.overwriteString = function(str) {
      var maxLength = this.columnCount_ - this.cursorPosition.column;
      if (!maxLength)
        return [str];

      var width = i18n.wc.strWidth(str);
      if (this.textAttributes.matchesContainer(this.cursorNode_) &&
          this.cursorNode_.textContent.substr(this.cursorOffset_) == str) {
        // This overwrite would be a no-op, just move the cursor and return.
        this.cursorOffset_ += width;
        this.cursorPosition.column += width;
        return;
      }

      this.deleteChars(Math.min(width, maxLength));
      this.insertString(str);
    };

    /**
     * Forward-delete one or more characters at the current cursor position.
     *
     * Text to the right of the deleted characters is shifted left.  Only affects
     * characters on the same row as the cursor.
     *
     * @param {integer} count The column width of characters to delete.  This is
     *     clamped to the column width minus the cursor column.
     * @return {integer} The column width of the characters actually deleted.
     */
    Screen.prototype.deleteChars = function(count) {
      var node = this.cursorNode_;
      var offset = this.cursorOffset_;

      var currentCursorColumn = this.cursorPosition.column;
      count = Math.min(count, this.columnCount_ - currentCursorColumn);
      if (!count)
        return 0;

      var rv = count;
      var startLength, endLength;

      while (node && count) {
        startLength = TextAttributes.nodeWidth(node);
        node.textContent = TextAttributes.nodeSubstr(node, 0, offset) +
            TextAttributes.nodeSubstr(node, offset + count);
        endLength = TextAttributes.nodeWidth(node);
        count -= startLength - endLength;
        if (offset < startLength && endLength && startLength == endLength) {
          // No characters were deleted when there should be.  We're probably trying
          // to delete one column width from a wide character node.  We remove the
          // wide character node here and replace it with a single space.
          var spaceNode = this.textAttributes.createContainer(' ');
          node.parentNode.insertBefore(spaceNode, node.nextSibling);
          node.textContent = '';
          endLength = 0;
          count -= 1;
        }

        var nextNode = node.nextSibling;
        if (endLength === 0 && node != this.cursorNode_) {
          node.parentNode.removeChild(node);
        }
        node = nextNode;
        offset = 0;
      }

      // Remove this.cursorNode_ if it is an empty non-text node.
      if (this.cursorNode_.nodeType != 3 && !this.cursorNode_.textContent) {
        var cursorNode = this.cursorNode_;
        if (cursorNode.previousSibling) {
          this.cursorNode_ = cursorNode.previousSibling;
          this.cursorOffset_ = TextAttributes.nodeWidth(
              cursorNode.previousSibling);
        } else if (cursorNode.nextSibling) {
          this.cursorNode_ = cursorNode.nextSibling;
          this.cursorOffset_ = 0;
        } else {
          var emptyNode = this.cursorRowNode_.ownerDocument.createTextNode('');
          this.cursorRowNode_.appendChild(emptyNode);
          this.cursorNode_ = emptyNode;
          this.cursorOffset_ = 0;
        }
        this.cursorRowNode_.removeChild(cursorNode);
      }

      return rv;
    };

    /**
     * Finds first X-ROW of a line containing specified X-ROW.
     * Used to support line overflow.
     *
     * @param {Node} row X-ROW to begin search for first row of line.
     * @return {Node} The X-ROW that is at the beginning of the line.
     **/
    Screen.prototype.getLineStartRow_ = function(row) {
      while (row.previousSibling &&
             row.previousSibling.hasAttribute('line-overflow')) {
        row = row.previousSibling;
      }
      return row;
    };

    /**
     * Gets text of a line beginning with row.
     * Supports line overflow.
     *
     * @param {Node} row First X-ROW of line.
     * @return {string} Text content of line.
     **/
    Screen.prototype.getLineText_ = function(row) {
      var rowText = '';
      while (row) {
        rowText += row.textContent;
        if (row.hasAttribute('line-overflow')) {
          row = row.nextSibling;
        } else {
          break;
        }
      }
      return rowText;
    };

    /**
     * Returns X-ROW that is ancestor of the node.
     *
     * @param {Node} node Node to get X-ROW ancestor for.
     * @return {Node} X-ROW ancestor of node, or null if not found.
     **/
    Screen.prototype.getXRowAncestor_ = function(node) {
      while (node) {
        if (node.nodeName === 'X-ROW')
          break;
        node = node.parentNode;
      }
      return node;
    };

    /**
     * Returns position within line of character at offset within node.
     * Supports line overflow.
     *
     * @param {Node} row X-ROW at beginning of line.
     * @param {Node} node Node to get position of.
     * @param {integer} offset Offset into node.
     *
     * @return {integer} Position within line of character at offset within node.
     **/
    Screen.prototype.getPositionWithOverflow_ = function(row, node, offset) {
      if (!node)
        return -1;
      var ancestorRow = this.getXRowAncestor_(node);
      if (!ancestorRow)
        return -1;
      var position = 0;
      while (ancestorRow != row) {
        position += TextAttributes.nodeWidth(row);
        if (row.hasAttribute('line-overflow') && row.nextSibling) {
          row = row.nextSibling;
        } else {
          return -1;
        }
      }
      return position + this.getPositionWithinRow_(row, node, offset);
    };

    /**
     * Returns position within row of character at offset within node.
     * Does not support line overflow.
     *
     * @param {Node} row X-ROW to get position within.
     * @param {Node} node Node to get position for.
     * @param {integer} offset Offset within node to get position for.
     * @return {integer} Position within row of character at offset within node.
     **/
    Screen.prototype.getPositionWithinRow_ = function(row, node, offset) {
      if (node.parentNode != row) {
        return this.getPositionWithinRow_(node.parentNode, node, offset) +
               this.getPositionWithinRow_(row, node.parentNode, 0);
      }
      var position = 0;
      for (var i = 0; i < row.childNodes.length; i++) {
        var currentNode = row.childNodes[i];
        if (currentNode == node)
          return position + offset;
        position += TextAttributes.nodeWidth(currentNode);
      }
      return -1;
    };

    /**
     * Returns the node and offset corresponding to position within line.
     * Supports line overflow.
     *
     * @param {Node} row X-ROW at beginning of line.
     * @param {integer} position Position within line to retrieve node and offset.
     * @return {Array} Two element array containing node and offset respectively.
     **/
    Screen.prototype.getNodeAndOffsetWithOverflow_ = function(row, position) {
      while (row && position > TextAttributes.nodeWidth(row)) {
        if (row.hasAttribute('line-overflow') && row.nextSibling) {
          position -= TextAttributes.nodeWidth(row);
          row = row.nextSibling;
        } else {
          return -1;
        }
      }
      return this.getNodeAndOffsetWithinRow_(row, position);
    };

    /**
     * Returns the node and offset corresponding to position within row.
     * Does not support line overflow.
     *
     * @param {Node} row X-ROW to get position within.
     * @param {integer} position Position within row to retrieve node and offset.
     * @return {Array} Two element array containing node and offset respectively.
     **/
    Screen.prototype.getNodeAndOffsetWithinRow_ = function(row, position) {
      for (var i = 0; i < row.childNodes.length; i++) {
        var node = row.childNodes[i];
        var nodeTextWidth = TextAttributes.nodeWidth(node);
        if (position <= nodeTextWidth) {
          if (node.nodeName === 'SPAN') {
            /** Drill down to node contained by SPAN. **/
            return this.getNodeAndOffsetWithinRow_(node, position);
          } else {
            return [node, position];
          }
        }
        position -= nodeTextWidth;
      }
      return null;
    };

    /**
     * Returns the node and offset corresponding to position within line.
     * Supports line overflow.
     *
     * @param {Node} row X-ROW at beginning of line.
     * @param {integer} start Start position of range within line.
     * @param {integer} end End position of range within line.
     * @param {Range} range Range to modify.
     **/
    Screen.prototype.setRange_ = function(row, start, end, range) {
      var startNodeAndOffset = this.getNodeAndOffsetWithOverflow_(row, start);
      if (startNodeAndOffset == null)
        return;
      var endNodeAndOffset = this.getNodeAndOffsetWithOverflow_(row, end);
      if (endNodeAndOffset == null)
        return;
      range.setStart(startNodeAndOffset[0], startNodeAndOffset[1]);
      range.setEnd(endNodeAndOffset[0], endNodeAndOffset[1]);
    };

    /**
     * Expands selection to surround URLs.
     *
     * @param {Selection} selection Selection to expand.
     **/
    Screen.prototype.expandSelection = function(selection) {
      if (!selection)
        return;

      var range = selection.getRangeAt(0);
      if (!range || range.toString().match(/\s/))
        return;

      var row = this.getLineStartRow_(this.getXRowAncestor_(range.startContainer));
      if (!row)
        return;

      var startPosition = this.getPositionWithOverflow_(row,
                                                        range.startContainer,
                                                        range.startOffset);
      if (startPosition == -1)
        return;
      var endPosition = this.getPositionWithOverflow_(row,
                                                      range.endContainer,
                                                      range.endOffset);
      if (endPosition == -1)
        return;

      // Matches can start with '~' or '.', since paths frequently do.
      var leftMatch   = '[^\\s\\[\\](){}<>"\'\\^!@#$%&*,;:`]';
      var rightMatch  = '[^\\s\\[\\](){}<>"\'\\^!@#$%&*,;:~.`]';
      var insideMatch = '[^\\s\\[\\](){}<>"\'\\^]*';

      //Move start to the left.
      var rowText = this.getLineText_(row);
      var lineUpToRange = i18n.wc.substring(rowText, 0, endPosition);
      var leftRegularExpression = new RegExp(leftMatch + insideMatch + '$');
      var expandedStart = lineUpToRange.search(leftRegularExpression);
      if (expandedStart == -1 || expandedStart > startPosition)
        return;

      //Move end to the right.
      var lineFromRange = i18n.wc.substring(rowText, startPosition,
                                           i18n.wc.strWidth(rowText));
      var rightRegularExpression = new RegExp('^' + insideMatch + rightMatch);
      var found = lineFromRange.match(rightRegularExpression);
      if (!found)
        return;
      var expandedEnd = startPosition + i18n.wc.strWidth(found[0]);
      if (expandedEnd == -1 || expandedEnd < endPosition)
        return;

      this.setRange_(row, expandedStart, expandedEnd, range);
      selection.addRange(range);
    };
  });
define("hterm/scrollport", 
  ["hterm/struct","hterm/util","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var struct = __dependency1__["default"];
    var util = __dependency2__["default"];

    /**
     * A 'viewport' view of fixed-height rows with support for selection and
     * copy-to-clipboard.
     *
     * 'Viewport' in this case means that only the visible rows are in the DOM.
     * If the rowProvider has 100,000 rows, but the ScrollPort is only 25 rows
     * tall, then only 25 dom nodes are created.  The ScrollPort will ask the
     * RowProvider to create new visible rows on demand as they are scrolled in
     * to the visible area.
     *
     * This viewport is designed so that select and copy-to-clipboard still works,
     * even when all or part of the selection is scrolled off screen.
     *
     * Note that the X11 mouse clipboard does not work properly when all or part
     * of the selection is off screen.  It would be difficult to fix this without
     * adding significant overhead to pathologically large selection cases.
     *
     * The RowProvider should return rows rooted by the custom tag name 'x-row'.
     * This ensures that we can quickly assign the correct display height
     * to the rows with css.
     *
     * @param {RowProvider} rowProvider An object capable of providing rows as
     *     raw text or row nodes.
     */
    var ScrollPort = function(rowProvider) {
      util.PubSub.addBehavior(this);

      this.rowProvider_ = rowProvider;

      // SWAG the character size until we can measure it.
      this.characterSize = new struct.Size(10, 10);

      // DOM node used for character measurement.
      this.ruler_ = null;

      this.selection = new ScrollPort.Selection(this);

      // A map of rowIndex => rowNode for each row that is drawn as part of a
      // pending redraw_() call.  Null if there is no pending redraw_ call.
      this.currentRowNodeCache_ = null;

      // A map of rowIndex => rowNode for each row that was drawn as part of the
      // previous redraw_() call.
      this.previousRowNodeCache_ = {};

      // Used during scroll events to detect when the underlying cause is a resize.
      this.lastScreenWidth_ = null;
      this.lastScreenHeight_ = null;

      // True if the user should be allowed to select text in the terminal.
      // This is disabled when the host requests mouse drag events so that we don't
      // end up with two notions of selection.
      this.selectionEnabled_ = true;

      // The last row count returned by the row provider, re-populated during
      // syncScrollHeight().
      this.lastRowCount_ = 0;

      /**
       * True if the last scroll caused the scrollport to show the final row.
       */
      this.isScrolledEnd = true;

      // The css rule that we use to control the height of a row.
      this.xrowCssRule_ = null;

      /**
       * A guess at the current scrollbar width, fixed in resize().
       */
      this.currentScrollbarWidthPx = 16;

      /**
       * Whether the ctrl-v key on the screen should paste.
       */
      this.ctrlVPaste = false;

      this.div_ = null;
      this.document_ = null;

      // Collection of active timeout handles.
      this.timeouts_ = {};

      this.observers_ = {};

      this.DEBUG_ = false;
    };
    __exports__.ScrollPort = ScrollPort;
    __exports__["default"] = ScrollPort;

    /**
     * Proxy for the native selection object which understands how to walk up the
     * DOM to find the containing row node and sort out which comes first.
     *
     * @param {ScrollPort} scrollPort The parent ScrollPort instance.
     */
    ScrollPort.Selection = function(scrollPort) {
      this.scrollPort_ = scrollPort;

      /**
       * The row containing the start of the selection.
       *
       * This may be partially or fully selected.  It may be the selection anchor
       * or the focus, but its rowIndex is guaranteed to be less-than-or-equal-to
       * that of the endRow.
       *
       * If only one row is selected then startRow == endRow.  If there is no
       * selection or the selection is collapsed then startRow == null.
       */
      this.startRow = null;

      /**
       * The row containing the end of the selection.
       *
       * This may be partially or fully selected.  It may be the selection anchor
       * or the focus, but its rowIndex is guaranteed to be greater-than-or-equal-to
       * that of the startRow.
       *
       * If only one row is selected then startRow == endRow.  If there is no
       * selection or the selection is collapsed then startRow == null.
       */
      this.endRow = null;

      /**
       * True if startRow != endRow.
       */
      this.isMultiline = null;

      /**
       * True if the selection is just a point rather than a range.
       */
      this.isCollapsed = null;
    };

    /**
     * Given a list of DOM nodes and a container, return the DOM node that
     * is first according to a depth-first search.
     *
     * Returns null if none of the children are found.
     */
    ScrollPort.Selection.prototype.findFirstChild = function(
        parent, childAry) {
      var node = parent.firstChild;

      while (node) {
        if (childAry.indexOf(node) != -1)
          return node;

        if (node.childNodes.length) {
          var rv = this.findFirstChild(node, childAry);
          if (rv)
            return rv;
        }

        node = node.nextSibling;
      }

      return null;
    };

    /**
     * Synchronize this object with the current DOM selection.
     *
     * This is a one-way synchronization, the DOM selection is copied to this
     * object, not the other way around.
     */
    ScrollPort.Selection.prototype.sync = function() {
      var self = this;

      // The dom selection object has no way to tell which nodes come first in
      // the document, so we have to figure that out.
      //
      // This function is used when we detect that the "anchor" node is first.
      function anchorFirst() {
        self.startRow = anchorRow;
        self.startNode = selection.anchorNode;
        self.startOffset = selection.anchorOffset;
        self.endRow = focusRow;
        self.endNode = selection.focusNode;
        self.endOffset = selection.focusOffset;
      }

      // This function is used when we detect that the "focus" node is first.
      function focusFirst() {
        self.startRow = focusRow;
        self.startNode = selection.focusNode;
        self.startOffset = selection.focusOffset;
        self.endRow = anchorRow;
        self.endNode = selection.anchorNode;
        self.endOffset = selection.anchorOffset;
      }

      var selection = this.scrollPort_.getDocument().getSelection();

      this.startRow = null;
      this.endRow = null;
      this.isMultiline = null;
      this.isCollapsed = !selection || selection.isCollapsed;

      if (this.isCollapsed)
        return;

      var anchorRow = selection.anchorNode;
      while (anchorRow && !('rowIndex' in anchorRow)) {
        anchorRow = anchorRow.parentNode;
      }

      if (!anchorRow) {
        console.error('Selection anchor is not rooted in a row node: ' +
                      selection.anchorNode.nodeName);
        return;
      }

      var focusRow = selection.focusNode;
      while (focusRow && !('rowIndex' in focusRow)) {
        focusRow = focusRow.parentNode;
      }

      if (!focusRow) {
        console.error('Selection focus is not rooted in a row node: ' +
                      selection.focusNode.nodeName);
        return;
      }

      if (anchorRow.rowIndex < focusRow.rowIndex) {
        anchorFirst();

      } else if (anchorRow.rowIndex > focusRow.rowIndex) {
        focusFirst();

      } else if (selection.focusNode == selection.anchorNode) {
        if (selection.anchorOffset < selection.focusOffset) {
          anchorFirst();
        } else {
          focusFirst();
        }

      } else {
        // The selection starts and ends in the same row, but isn't contained all
        // in a single node.
        var firstNode = this.findFirstChild(
            anchorRow, [selection.anchorNode, selection.focusNode]);

        if (!firstNode)
          throw new Error('Unexpected error syncing selection.');

        if (firstNode == selection.anchorNode) {
          anchorFirst();
        } else {
          focusFirst();
        }
      }

      this.isMultiline = anchorRow.rowIndex != focusRow.rowIndex;
    };


    /**
     * Turn a div into this ScrollPort.
     */
    ScrollPort.prototype.decorate = function(div) {
      this.div_ = div;

      this.iframe_ = div.ownerDocument.createElement('iframe');
      this.iframe_.style.cssText = (
          'border: 0;' +
          'height: 100%;' +
          'position: absolute;' +
          'width: 100%');

      // Set the iframe src to # in FF.  Otherwise when the frame's
      // load event fires in FF it clears out the content of the iframe.
      if ('mozInnerScreenX' in window)  // detect a FF only property
        this.iframe_.src = '#';

      div.appendChild(this.iframe_);

      this.iframe_.contentWindow.addEventListener('resize',
                                                  this.onResize_.bind(this));

      var doc = this.document_ = this.iframe_.contentDocument;
      doc.body.style.cssText = (
          'margin: 0px;' +
          'padding: 0px;' +
          'height: 100%;' +
          'width: 100%;' +
          'overflow: hidden;' +
          '-webkit-user-select: none;' +
          '-moz-user-select: none;');

      var style = doc.createElement('style');
      style.textContent = 'x-row {}';
      doc.head.appendChild(style);

      this.xrowCssRule_ = doc.styleSheets[0].cssRules[0];
      this.xrowCssRule_.style.display = 'block';

      this.userCssLink_ = doc.createElement('link');
      this.userCssLink_.setAttribute('rel', 'stylesheet');

      // TODO(rginda): Sorry, this 'screen_' isn't the same thing as Screen
      // from screen.js.  I need to pick a better name for one of them to avoid
      // the collision.
      this.screen_ = doc.createElement('x-screen');
      this.screen_.setAttribute('role', 'textbox');
      this.screen_.setAttribute('tabindex', '-1');
      this.screen_.style.cssText = (
          'display: block;' +
          'font-family: monospace;' +
          'font-size: 15px;' +
          'height: 100%;' +
          'overflow-y: scroll; overflow-x: hidden;' +
          'white-space: pre;' +
          'width: 100%;' +
          'outline: none !important');

      doc.body.appendChild(this.screen_);

      this.screen_.addEventListener('scroll', this.onScroll_.bind(this));
      this.screen_.addEventListener('mousewheel', this.onScrollWheel_.bind(this));
      this.screen_.addEventListener('copy', this.onCopy_.bind(this));
      this.screen_.addEventListener('paste', this.onPaste_.bind(this));

      doc.body.addEventListener('keydown', this.onBodyKeyDown_.bind(this));

      // This is the main container for the fixed rows.
      this.rowNodes_ = doc.createElement('div');
      this.rowNodes_.style.cssText = (
          'display: block;' +
          'position: fixed;' +
          'overflow: hidden;' +
          '-webkit-user-select: text;' +
          '-moz-user-select: text;');
      this.screen_.appendChild(this.rowNodes_);

      // Two nodes to hold offscreen text during the copy event.
      this.topSelectBag_ = doc.createElement('x-select-bag');
      this.topSelectBag_.style.cssText = (
          'display: block;' +
          'overflow: hidden;' +
          'white-space: pre;');

      this.bottomSelectBag_ = this.topSelectBag_.cloneNode();

      // Nodes above the top fold and below the bottom fold are hidden.  They are
      // only used to hold rows that are part of the selection but are currently
      // scrolled off the top or bottom of the visible range.
      this.topFold_ = doc.createElement('x-fold');
      this.topFold_.style.cssText = 'display: block;';
      this.rowNodes_.appendChild(this.topFold_);

      this.bottomFold_ = this.topFold_.cloneNode();
      this.rowNodes_.appendChild(this.bottomFold_);

      // This hidden div accounts for the vertical space that would be consumed by
      // all the rows in the buffer if they were visible.  It's what causes the
      // scrollbar to appear on the 'x-screen', and it moves within the screen when
      // the scrollbar is moved.
      //
      // It is set 'visibility: hidden' to keep the browser from trying to include
      // it in the selection when a user 'drag selects' upwards (drag the mouse to
      // select and scroll at the same time).  Without this, the selection gets
      // out of whack.
      this.scrollArea_ = doc.createElement('div');
      this.scrollArea_.style.cssText = 'visibility: hidden';
      this.screen_.appendChild(this.scrollArea_);

      // This svg element is used to detect when the browser is zoomed.  It must be
      // placed in the outermost document for currentScale to be correct.
      // TODO(rginda): This means that hterm nested in an iframe will not correctly
      // detect browser zoom level.  We should come up with a better solution.
      this.svg_ = this.div_.ownerDocument.createElementNS(
          'http://www.w3.org/2000/svg', 'svg');
      this.svg_.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      this.svg_.setAttribute('version', '1.1');
      this.svg_.style.cssText = (
          'position: absolute;' +
          'top: 0;' +
          'left: 0;' +
          'visibility: hidden');


      // We send focus to this element just before a paste happens, so we can
      // capture the pasted text and forward it on to someone who cares.
      this.pasteTarget_ = doc.createElement('textarea');
      this.pasteTarget_.setAttribute('tabindex', '-1');
      this.pasteTarget_.style.cssText = (
        'position: absolute;' +
        'height: 1px;' +
        'width: 1px;' +
        'left: 0px; ' +
        'bottom: 0px;' +
        'opacity: 0');
      this.pasteTarget_.contentEditable = true;

      this.screen_.appendChild(this.pasteTarget_);
      this.pasteTarget_.addEventListener(
          'textInput', this.handlePasteTargetTextInput_.bind(this));

      this.resize();
    };

    /**
     * Select the font-family for this scrollport.
     *
     * @param {string} fontFamily Value of the CSS 'font-family' to use for this
     *     scrollport.  Should be a monospace font.
     */
    ScrollPort.prototype.setFontFamily = function(fontFamily) {
      this.screen_.style.fontFamily = fontFamily;
      this.syncCharacterSize();
    };

    ScrollPort.prototype.getFontFamily = function() {
      return this.screen_.style.fontFamily;
    };

    /**
     * Select the font-family for this scrollport.
     *
     * @param {string} smoothing Value for '-webkit-font-smoothing'.
     */
    ScrollPort.prototype.setFontSmoothing = function(smoothing) {
      if (smoothing) {
        this.screen_.style.webkitFontSmoothing = smoothing;
      } else {
        this.screen_.style.webkitFontSmoothing = '';
      }

      this.syncCharacterSize();
    };

    /**
     * Set a custom stylesheet to include in the scrollport.
     *
     * Defaults to null, meaning no custom css is loaded.  Set it back to null or
     * the empty string to remove a previously applied custom css.
     */
    ScrollPort.prototype.setUserCss = function(url) {
      if (url) {
        this.userCssLink_.setAttribute('href', url);

        if (!this.userCssLink_.parentNode)
          this.document_.head.appendChild(this.userCssLink_);
      } else if (this.userCssLink_.parentNode) {
        this.document_.head.removeChild(this.userCssLink_);
      }
    };

    ScrollPort.prototype.focus = function() {
      this.iframe_.focus();
      this.screen_.focus();
    };

    ScrollPort.prototype.getForegroundColor = function() {
      return this.screen_.style.color;
    };

    ScrollPort.prototype.setForegroundColor = function(color) {
      this.screen_.style.color = color;
    };

    ScrollPort.prototype.getBackgroundColor = function() {
      return this.screen_.style.backgroundColor;
    };

    ScrollPort.prototype.setBackgroundColor = function(color) {
      this.screen_.style.backgroundColor = color;
    };

    ScrollPort.prototype.setBackgroundImage = function(image) {
      this.screen_.style.backgroundImage = image;
    };

    ScrollPort.prototype.setBackgroundSize = function(size) {
      this.screen_.style.backgroundSize = size;
    };

    ScrollPort.prototype.setBackgroundPosition = function(position) {
      this.screen_.style.backgroundPosition = position;
    };

    ScrollPort.prototype.setCtrlVPaste = function(ctrlVPaste) {
      this.ctrlVPaste = ctrlVPaste;
    };

    /**
     * Get the usable size of the scrollport screen.
     *
     * The width will not include the scrollbar width.
     */
    ScrollPort.prototype.getScreenSize = function() {
      var size = util.dom.getClientSize(this.screen_);
      return {
        height: size.height,
        width: size.width - this.currentScrollbarWidthPx
      };
    };

    /**
     * Get the usable width of the scrollport screen.
     *
     * This the widget width minus scrollbar width.
     */
    ScrollPort.prototype.getScreenWidth = function() {
      return this.getScreenSize().width ;
    };

    /**
     * Get the usable height of the scrollport screen.
     */
    ScrollPort.prototype.getScreenHeight = function() {
      return this.getScreenSize().height;
    };

    /**
     * Return the document that holds the visible rows of this ScrollPort.
     */
    ScrollPort.prototype.getDocument = function() {
      return this.document_;
    };

    /**
     * Returns the x-screen element that holds the rows of this ScrollPort.
     */
    ScrollPort.prototype.getScreenNode = function() {
      return this.screen_;
    };

    /**
     * Clear out any cached rowNodes.
     */
    ScrollPort.prototype.resetCache = function() {
      this.currentRowNodeCache_ = null;
      this.previousRowNodeCache_ = {};
    };

    /**
     * Change the current rowProvider.
     *
     * This will clear the row cache and cause a redraw.
     *
     * @param {Object} rowProvider An object capable of providing the rows
     *     in this ScrollPort.
     */
    ScrollPort.prototype.setRowProvider = function(rowProvider) {
      this.resetCache();
      this.rowProvider_ = rowProvider;
      this.scheduleRedraw();
    };

    /**
     * Inform the ScrollPort that the root DOM nodes for some or all of the visible
     * rows are no longer valid.
     *
     * Specifically, this should be called if this.rowProvider_.getRowNode() now
     * returns an entirely different node than it did before.  It does not
     * need to be called if the content of a row node is the only thing that
     * changed.
     *
     * This skips some of the overhead of a full redraw, but should not be used
     * in cases where the scrollport has been scrolled, or when the row count has
     * changed.
     */
    ScrollPort.prototype.invalidate = function() {
      var node = this.topFold_.nextSibling;
      while (node != this.bottomFold_) {
        var nextSibling = node.nextSibling;
        node.parentElement.removeChild(node);
        node = nextSibling;
      }

      this.previousRowNodeCache_ = null;
      var topRowIndex = this.getTopRowIndex();
      var bottomRowIndex = this.getBottomRowIndex(topRowIndex);

      this.drawVisibleRows_(topRowIndex, bottomRowIndex);
    };

    ScrollPort.prototype.scheduleInvalidate = function() {
      if (this.timeouts_.invalidate)
        return;

      var self = this;
      this.timeouts_.invalidate = setTimeout(function () {
          delete self.timeouts_.invalidate;
          self.invalidate();
        }, 0);
    };

    /**
     * Set the font size of the ScrollPort.
     */
    ScrollPort.prototype.setFontSize = function(px) {
      this.screen_.style.fontSize = px + 'px';
      this.syncCharacterSize();
    };

    /**
     * Return the current font size of the ScrollPort.
     */
    ScrollPort.prototype.getFontSize = function() {
      return parseInt(this.screen_.style.fontSize);
    };

    /**
     * Measure the size of a single character in pixels.
     *
     * @param {string} opt_weight The font weight to measure, or 'normal' if
     *     omitted.
     * @return {struct.Size} A new struct.Size object.
     */
    ScrollPort.prototype.measureCharacterSize = function(opt_weight) {
      if (!this.ruler_) {
        this.ruler_ = this.document_.createElement('div');
        this.ruler_.style.cssText = (
            'position: absolute;' +
            'top: 0;' +
            'left: 0;' +
            'visibility: hidden;' +
            'height: auto !important;' +
            'width: auto !important;');

        // We need to put the text in a span to make the size calculation
        // work properly in Firefox
        this.rulerSpan_ = this.document_.createElement('span');
        this.rulerSpan_.textContent = ('XXXXXXXXXXXXXXXXXXXX' +
                                       'XXXXXXXXXXXXXXXXXXXX' +
                                       'XXXXXXXXXXXXXXXXXXXX' +
                                       'XXXXXXXXXXXXXXXXXXXX' +
                                       'XXXXXXXXXXXXXXXXXXXX');
        this.ruler_.appendChild(this.rulerSpan_);

        this.rulerBaseline_ = this.document_.createElement('span');
        // We want to collapse it on the baseline
        this.rulerBaseline_.style.fontSize = '0px';
        this.rulerBaseline_.textContent = 'X';
      }

      this.rulerSpan_.style.fontWeight = opt_weight || '';

      this.rowNodes_.appendChild(this.ruler_);
      var rulerSize = util.dom.getClientSize(this.rulerSpan_);

      var size = new struct.Size(rulerSize.width / this.ruler_.textContent.length,
                                 rulerSize.height);

      this.ruler_.appendChild(this.rulerBaseline_);
      size.baseline = this.rulerBaseline_.offsetTop;
      this.ruler_.removeChild(this.rulerBaseline_);

      this.rowNodes_.removeChild(this.ruler_);

      this.div_.ownerDocument.body.appendChild(this.svg_);
      size.zoomFactor = this.svg_.currentScale;
      this.div_.ownerDocument.body.removeChild(this.svg_);

      return size;
    };

    /**
     * Synchronize the character size.
     *
     * This will re-measure the current character size and adjust the height
     * of an x-row to match.
     */
    ScrollPort.prototype.syncCharacterSize = function() {
      this.characterSize = this.measureCharacterSize();

      var lineHeight = this.characterSize.height + 'px';
      this.xrowCssRule_.style.height = lineHeight;
      this.topSelectBag_.style.height = lineHeight;
      this.bottomSelectBag_.style.height = lineHeight;

      this.resize();

      if (this.DEBUG_) {
        // When we're debugging we add padding to the body so that the offscreen
        // elements are visible.
        this.document_.body.style.paddingTop =
            this.document_.body.style.paddingBottom =
            3 * this.characterSize.height + 'px';
      }
    };

    /**
     * Reset dimensions and visible row count to account for a change in the
     * dimensions of the 'x-screen'.
     */
    ScrollPort.prototype.resize = function() {
      this.currentScrollbarWidthPx = util.dom.getClientWidth(this.screen_) -
        this.screen_.clientWidth;

      this.syncScrollHeight();
      this.syncRowNodesDimensions_();

      var self = this;
      this.publish(
          'resize', { scrollPort: this },
          function() {
            self.scrollRowToBottom(self.rowProvider_.getRowCount());
            self.scheduleRedraw();
          });
    };

    /**
     * Set the position and size of the row nodes element.
     */
    ScrollPort.prototype.syncRowNodesDimensions_ = function() {
      var screenSize = this.getScreenSize();

      this.lastScreenWidth_ = screenSize.width;
      this.lastScreenHeight_ = screenSize.height;

      // We don't want to show a partial row because it would be distracting
      // in a terminal, so we floor any fractional row count.
      this.visibleRowCount = Math.floor(
          screenSize.height / this.characterSize.height);

      // Then compute the height of our integral number of rows.
      var visibleRowsHeight = this.visibleRowCount * this.characterSize.height;

      // Then the difference between the screen height and total row height needs to
      // be made up for as top margin.  We need to record this value so it
      // can be used later to determine the topRowIndex.
      this.visibleRowTopMargin = 0;
      this.visibleRowBottomMargin = screenSize.height - visibleRowsHeight;

      this.topFold_.style.marginBottom = this.visibleRowTopMargin + 'px';


      var topFoldOffset = 0;
      var node = this.topFold_.previousSibling;
      while (node) {
        topFoldOffset += util.dom.getClientHeight(node);
        node = node.previousSibling;
      }

      // Set the dimensions of the visible rows container.
      this.rowNodes_.style.width = screenSize.width + 'px';
      this.rowNodes_.style.height = visibleRowsHeight + topFoldOffset + 'px';
      this.rowNodes_.style.left = this.screen_.offsetLeft + 'px';
      this.rowNodes_.style.top = this.screen_.offsetTop - topFoldOffset + 'px';
    };

    ScrollPort.prototype.syncScrollHeight = function() {
      // Resize the scroll area to appear as though it contains every row.
      this.lastRowCount_ = this.rowProvider_.getRowCount();
      this.scrollArea_.style.height = (this.characterSize.height *
                                       this.lastRowCount_ +
                                       this.visibleRowTopMargin +
                                       this.visibleRowBottomMargin +
                                       'px');
    };

    /**
     * Schedule a redraw to happen asynchronously.
     *
     * If this method is called multiple times before the redraw has a chance to
     * run only one redraw occurs.
     */
    ScrollPort.prototype.scheduleRedraw = function() {
      if (this.timeouts_.redraw)
        return;

      var self = this;
      this.timeouts_.redraw = setTimeout(function () {
          delete self.timeouts_.redraw;
          self.redraw_();
        }, 0);
    };

    /**
     * Redraw the current ScrollPort based on the current scrollbar position.
     *
     * When redrawing, we are careful to make sure that the rows that start or end
     * the current selection are not touched in any way.  Doing so would disturb
     * the selection, and cleaning up after that would cause flashes at best and
     * incorrect selection at worst.  Instead, we modify the DOM around these nodes.
     * We even stash the selection start/end outside of the visible area if
     * they are not supposed to be visible in the ScrollPort.
     */
    ScrollPort.prototype.redraw_ = function() {
      this.resetSelectBags_();
      this.selection.sync();

      this.syncScrollHeight();

      this.currentRowNodeCache_ = {};

      var topRowIndex = this.getTopRowIndex();
      var bottomRowIndex = this.getBottomRowIndex(topRowIndex);

      this.drawTopFold_(topRowIndex);
      this.drawBottomFold_(bottomRowIndex);
      this.drawVisibleRows_(topRowIndex, bottomRowIndex);

      this.syncRowNodesDimensions_();

      this.previousRowNodeCache_ = this.currentRowNodeCache_;
      this.currentRowNodeCache_ = null;

      this.isScrolledEnd = (
        this.getTopRowIndex() + this.visibleRowCount >= this.lastRowCount_);
    };

    /**
     * Ensure that the nodes above the top fold are as they should be.
     *
     * If the selection start and/or end nodes are above the visible range
     * of this ScrollPort then the dom will be adjusted so that they appear
     * before the top fold (the first x-fold element, aka this.topFold).
     *
     * If not, the top fold will be the first element.
     *
     * It is critical that this method does not move the selection nodes.  Doing
     * so would clear the current selection.  Instead, the rest of the DOM is
     * adjusted around them.
     */
    ScrollPort.prototype.drawTopFold_ = function(topRowIndex) {
      if (!this.selection.startRow ||
          this.selection.startRow.rowIndex >= topRowIndex) {
        // Selection is entirely below the top fold, just make sure the fold is
        // the first child.
        if (this.rowNodes_.firstChild != this.topFold_)
          this.rowNodes_.insertBefore(this.topFold_, this.rowNodes_.firstChild);

        return;
      }

      if (!this.selection.isMultiline ||
          this.selection.endRow.rowIndex >= topRowIndex) {
        // Only the startRow is above the fold.
        if (this.selection.startRow.nextSibling != this.topFold_)
          this.rowNodes_.insertBefore(this.topFold_,
                                      this.selection.startRow.nextSibling);
      } else {
        // Both rows are above the fold.
        if (this.selection.endRow.nextSibling != this.topFold_) {
          this.rowNodes_.insertBefore(this.topFold_,
                                      this.selection.endRow.nextSibling);
        }

        // Trim any intermediate lines.
        while (this.selection.startRow.nextSibling !=
               this.selection.endRow) {
          this.rowNodes_.removeChild(this.selection.startRow.nextSibling);
        }
      }

      while(this.rowNodes_.firstChild != this.selection.startRow) {
        this.rowNodes_.removeChild(this.rowNodes_.firstChild);
      }
    };

    /**
     * Ensure that the nodes below the bottom fold are as they should be.
     *
     * If the selection start and/or end nodes are below the visible range
     * of this ScrollPort then the dom will be adjusted so that they appear
     * after the bottom fold (the second x-fold element, aka this.bottomFold).
     *
     * If not, the bottom fold will be the last element.
     *
     * It is critical that this method does not move the selection nodes.  Doing
     * so would clear the current selection.  Instead, the rest of the DOM is
     * adjusted around them.
     */
    ScrollPort.prototype.drawBottomFold_ = function(bottomRowIndex) {
      if (!this.selection.endRow ||
          this.selection.endRow.rowIndex <= bottomRowIndex) {
        // Selection is entirely above the bottom fold, just make sure the fold is
        // the last child.
        if (this.rowNodes_.lastChild != this.bottomFold_)
          this.rowNodes_.appendChild(this.bottomFold_);

        return;
      }

      if (!this.selection.isMultiline ||
          this.selection.startRow.rowIndex <= bottomRowIndex) {
        // Only the endRow is below the fold.
        if (this.bottomFold_.nextSibling != this.selection.endRow)
          this.rowNodes_.insertBefore(this.bottomFold_,
                                      this.selection.endRow);
      } else {
        // Both rows are below the fold.
        if (this.bottomFold_.nextSibling != this.selection.startRow) {
          this.rowNodes_.insertBefore(this.bottomFold_,
                                      this.selection.startRow);
        }

        // Trim any intermediate lines.
        while (this.selection.startRow.nextSibling !=
               this.selection.endRow) {
          this.rowNodes_.removeChild(this.selection.startRow.nextSibling);
        }
      }

      while(this.rowNodes_.lastChild != this.selection.endRow) {
        this.rowNodes_.removeChild(this.rowNodes_.lastChild);
      }
    };

    /**
     * Ensure that the rows between the top and bottom folds are as they should be.
     *
     * This method assumes that drawTopFold_() and drawBottomFold_() have already
     * run, and that they have left any visible selection row (selection start
     * or selection end) between the folds.
     *
     * It recycles DOM nodes from the previous redraw where possible, but will ask
     * the rowSource to make new nodes if necessary.
     *
     * It is critical that this method does not move the selection nodes.  Doing
     * so would clear the current selection.  Instead, the rest of the DOM is
     * adjusted around them.
     */
    ScrollPort.prototype.drawVisibleRows_ = function(
        topRowIndex, bottomRowIndex) {
      var self = this;

      // Keep removing nodes, starting with currentNode, until we encounter
      // targetNode.  Throws on failure.
      function removeUntilNode(currentNode, targetNode) {
        while (currentNode != targetNode) {
          if (!currentNode)
            throw 'Did not encounter target node';

          if (currentNode == self.bottomFold_)
            throw 'Encountered bottom fold before target node';

          var deadNode = currentNode;
          currentNode = currentNode.nextSibling;
          deadNode.parentNode.removeChild(deadNode);
        }
      }

      // Shorthand for things we're going to use a lot.
      var selectionStartRow = this.selection.startRow;
      var selectionEndRow = this.selection.endRow;
      var bottomFold = this.bottomFold_;

      // The node we're examining during the current iteration.
      var node = this.topFold_.nextSibling;

      var targetDrawCount = Math.min(this.visibleRowCount,
                                     this.rowProvider_.getRowCount());

      for (var drawCount = 0; drawCount < targetDrawCount; drawCount++) {
        var rowIndex = topRowIndex + drawCount;

        var newNode;

        if (node == bottomFold) {
          // We've hit the bottom fold, we need to insert a new row.
          newNode = this.fetchRowNode_(rowIndex);
          if (!newNode) {
            console.log('Couldn\'t fetch row index: ' + rowIndex);
            break;
          }

          this.rowNodes_.insertBefore(newNode, node);
          continue;
        }

        if (node.rowIndex == rowIndex) {
          // This node is in the right place, move along.
          node = node.nextSibling;
          continue;
        }

        if (selectionStartRow && selectionStartRow.rowIndex == rowIndex) {
          // The selection start row is supposed to be here, remove nodes until
          // we find it.
          removeUntilNode(node, selectionStartRow);
          node = selectionStartRow.nextSibling;
          continue;
        }

        if (selectionEndRow && selectionEndRow.rowIndex == rowIndex) {
          // The selection end row is supposed to be here, remove nodes until
          // we find it.
          removeUntilNode(node, selectionEndRow);
          node = selectionEndRow.nextSibling;
          continue;
        }

        if (node == selectionStartRow || node == selectionEndRow) {
          // We encountered the start/end of the selection, but we don't want it
          // yet.  Insert a new row instead.
          newNode = this.fetchRowNode_(rowIndex);
          if (!newNode) {
            console.log('Couldn\'t fetch row index: ' + rowIndex);
            break;
          }

          this.rowNodes_.insertBefore(newNode, node);
          continue;
        }

        // There is nothing special about this node, but it's in our way.  Replace
        // it with the node that should be here.
        newNode = this.fetchRowNode_(rowIndex);
        if (!newNode) {
          console.log('Couldn\'t fetch row index: ' + rowIndex);
          break;
        }

        if (node == newNode) {
          node = node.nextSibling;
          continue;
        }

        this.rowNodes_.insertBefore(newNode, node);
        this.rowNodes_.removeChild(node);
        node = newNode.nextSibling;
      }

      if (node != this.bottomFold_)
        removeUntilNode(node, bottomFold);
    };

    /**
     * Empty out both select bags and remove them from the document.
     *
     * These nodes hold the text between the start and end of the selection
     * when that text is otherwise off screen.  They are filled out in the
     * onCopy_ event.
     */
    ScrollPort.prototype.resetSelectBags_ = function() {
      if (this.topSelectBag_.parentNode) {
        this.topSelectBag_.textContent = '';
        this.topSelectBag_.parentNode.removeChild(this.topSelectBag_);
      }

      if (this.bottomSelectBag_.parentNode) {
        this.bottomSelectBag_.textContent = '';
        this.bottomSelectBag_.parentNode.removeChild(this.bottomSelectBag_);
      }
    };

    /**
     * Place a row node in the cache of visible nodes.
     *
     * This method may only be used during a redraw_.
     */
    ScrollPort.prototype.cacheRowNode_ = function(rowNode) {
      this.currentRowNodeCache_[rowNode.rowIndex] = rowNode;
    };

    /**
     * Fetch the row node for the given index.
     *
     * This will return a node from the cache if possible, or will request one
     * from the RowProvider if not.
     *
     * If a redraw_ is in progress the row will be added to the current cache.
     */
    ScrollPort.prototype.fetchRowNode_ = function(rowIndex) {
      var node;

      if (this.previousRowNodeCache_ && rowIndex in this.previousRowNodeCache_) {
        node = this.previousRowNodeCache_[rowIndex];
      } else {
        node = this.rowProvider_.getRowNode(rowIndex);
      }

      if (this.currentRowNodeCache_)
        this.cacheRowNode_(node);

      return node;
    };

    /**
     * Select all rows in the viewport.
     */
    ScrollPort.prototype.selectAll = function() {
      var firstRow;

      if (this.topFold_.nextSibling.rowIndex !== 0) {
        while (this.topFold_.previousSibling) {
          this.rowNodes_.removeChild(this.topFold_.previousSibling);
        }

        firstRow = this.fetchRowNode_(0);
        this.rowNodes_.insertBefore(firstRow, this.topFold_);
        this.syncRowNodesDimensions_();
      } else {
        firstRow = this.topFold_.nextSibling;
      }

      var lastRowIndex = this.rowProvider_.getRowCount() - 1;
      var lastRow;

      if (this.bottomFold_.previousSibling.rowIndex != lastRowIndex) {
        while (this.bottomFold_.nextSibling) {
          this.rowNodes_.removeChild(this.bottomFold_.nextSibling);
        }

        lastRow = this.fetchRowNode_(lastRowIndex);
        this.rowNodes_.appendChild(lastRow);
      } else {
        lastRow = this.bottomFold_.previousSibling.rowIndex;
      }

      var selection = this.document_.getSelection();
      selection.collapse(firstRow, 0);
      selection.extend(lastRow, lastRow.childNodes.length);

      this.selection.sync();
    };

    /**
     * Return the maximum scroll position in pixels.
     */
    ScrollPort.prototype.getScrollMax_ = function(e) {
      return (util.dom.getClientHeight(this.scrollArea_) +
              this.visibleRowTopMargin + this.visibleRowBottomMargin -
              util.dom.getClientHeight(this.screen_));
    };

    /**
     * Scroll the given rowIndex to the top of the ScrollPort.
     *
     * @param {integer} rowIndex Index of the target row.
     */
    ScrollPort.prototype.scrollRowToTop = function(rowIndex) {
      this.syncScrollHeight();

      this.isScrolledEnd = (
        rowIndex + this.visibleRowCount >= this.lastRowCount_);

      var scrollTop = rowIndex * this.characterSize.height +
          this.visibleRowTopMargin;

      var scrollMax = this.getScrollMax_();
      if (scrollTop > scrollMax)
        scrollTop = scrollMax;

      if (this.screen_.scrollTop == scrollTop)
        return;

      this.screen_.scrollTop = scrollTop;
      this.scheduleRedraw();
    };

    /**
     * Scroll the given rowIndex to the bottom of the ScrollPort.
     *
     * @param {integer} rowIndex Index of the target row.
     */
    ScrollPort.prototype.scrollRowToBottom = function(rowIndex) {
      this.syncScrollHeight();

      this.isScrolledEnd = (
        rowIndex + this.visibleRowCount >= this.lastRowCount_);

      var scrollTop = rowIndex * this.characterSize.height +
          this.visibleRowTopMargin + this.visibleRowBottomMargin;
      scrollTop -= this.visibleRowCount * this.characterSize.height;

      if (scrollTop < 0)
        scrollTop = 0;

      if (this.screen_.scrollTop == scrollTop)
        return;

      this.screen_.scrollTop = scrollTop;
    };

    /**
     * Return the row index of the first visible row.
     *
     * This is based on the scroll position.  If a redraw_ is in progress this
     * returns the row that *should* be at the top.
     */
    ScrollPort.prototype.getTopRowIndex = function() {
      return Math.floor(this.screen_.scrollTop / this.characterSize.height);
    };

    /**
     * Return the row index of the last visible row.
     *
     * This is based on the scroll position.  If a redraw_ is in progress this
     * returns the row that *should* be at the bottom.
     */
    ScrollPort.prototype.getBottomRowIndex = function(topRowIndex) {
      return topRowIndex + this.visibleRowCount - 1;
    };

    /**
     * Handler for scroll events.
     *
     * The onScroll event fires when scrollArea's scrollTop property changes.  This
     * may be due to the user manually move the scrollbar, or a programmatic change.
     */
    ScrollPort.prototype.onScroll_ = function(e) {
      var screenSize = this.getScreenSize();
      if (screenSize.width != this.lastScreenWidth_ ||
          screenSize.height != this.lastScreenHeight_) {
        // This event may also fire during a resize (but before the resize event!).
        // This happens when the browser moves the scrollbar as part of the resize.
        // In these cases, we want to ignore the scroll event and let onResize
        // handle things.  If we don't, then we end up scrolling to the wrong
        // position after a resize.
        this.resize();
        return;
      }

      this.redraw_();
      this.publish('scroll', { scrollPort: this });
    };

    /**
     * Clients can override this if they want to hear scrollwheel events.
     *
     * Clients may call event.preventDefault() if they want to keep the scrollport
     * from also handling the events.
     */
    ScrollPort.prototype.onScrollWheel = function(e) {};

    /**
     * Handler for scroll-wheel events.
     *
     * The onScrollWheel event fires when the user moves their scrollwheel over this
     * ScrollPort.  Because the frontmost element in the ScrollPort is
     * a fixed position DIV, the scroll wheel does nothing by default.  Instead, we
     * have to handle it manually.
     */
    ScrollPort.prototype.onScrollWheel_ = function(e) {
      this.onScrollWheel(e);

      if (e.defaultPrevented)
        return;

      var top = this.screen_.scrollTop - e.wheelDeltaY;
      if (top < 0)
        top = 0;

      var scrollMax = this.getScrollMax_();
      if (top > scrollMax)
        top = scrollMax;

      if (top != this.screen_.scrollTop) {
        // Moving scrollTop causes a scroll event, which triggers the redraw.
        this.screen_.scrollTop = top;

        // Only preventDefault when we've actually scrolled.  If there's nothing
        // to scroll we want to pass the event through so Chrome can detect the
        // overscroll.
        e.preventDefault();
      }
    };

    /**
     * Handler for resize events.
     *
     * The browser will resize us such that the top row stays at the top, but we
     * prefer to the bottom row to stay at the bottom.
     */
    ScrollPort.prototype.onResize_ = function(e) {
      // Re-measure, since onResize also happens for browser zoom changes.
      this.syncCharacterSize();
      this.resize();
    };

    /**
     * Clients can override this if they want to hear copy events.
     *
     * Clients may call event.preventDefault() if they want to keep the scrollport
     * from also handling the events.
     */
    ScrollPort.prototype.onCopy = function(e) { };

    /**
     * Handler for copy-to-clipboard events.
     *
     * If some or all of the selected rows are off screen we may need to fill in
     * the rows between selection start and selection end.  This handler determines
     * if we're missing some of the selected text, and if so populates one or both
     * of the 'select bags' with the missing text.
     */
    ScrollPort.prototype.onCopy_ = function(e) {
      this.onCopy(e);

      if (e.defaultPrevented)
        return;

      this.resetSelectBags_();
      this.selection.sync();

      if (!this.selection.startRow ||
          this.selection.endRow.rowIndex - this.selection.startRow.rowIndex < 2) {
        return;
      }

      var topRowIndex = this.getTopRowIndex();
      var bottomRowIndex = this.getBottomRowIndex(topRowIndex);

      if (this.selection.startRow.rowIndex < topRowIndex) {
        // Start of selection is above the top fold.
        var endBackfillIndex;

        if (this.selection.endRow.rowIndex < topRowIndex) {
          // Entire selection is above the top fold.
          endBackfillIndex = this.selection.endRow.rowIndex;
        } else {
          // Selection extends below the top fold.
          endBackfillIndex = this.topFold_.nextSibling.rowIndex;
        }

        this.topSelectBag_.textContent = this.rowProvider_.getRowsText(
            this.selection.startRow.rowIndex + 1, endBackfillIndex);
        this.rowNodes_.insertBefore(this.topSelectBag_,
                                    this.selection.startRow.nextSibling);
        this.syncRowNodesDimensions_();
      }

      if (this.selection.endRow.rowIndex > bottomRowIndex) {
        // Selection ends below the bottom fold.
        var startBackfillIndex;

        if (this.selection.startRow.rowIndex > bottomRowIndex) {
          // Entire selection is below the bottom fold.
          startBackfillIndex = this.selection.startRow.rowIndex + 1;
        } else {
          // Selection starts above the bottom fold.
          startBackfillIndex = this.bottomFold_.previousSibling.rowIndex + 1;
        }

        this.bottomSelectBag_.textContent = this.rowProvider_.getRowsText(
            startBackfillIndex, this.selection.endRow.rowIndex);
        this.rowNodes_.insertBefore(this.bottomSelectBag_, this.selection.endRow);
      }
    };

    /**
     * Focuses on the paste target on a ctrl-v keydown event, as in
     * FF a content editable element must be focused before the paste event.
     */
    ScrollPort.prototype.onBodyKeyDown_ = function(e) {
      if (!this.ctrlVPaste)
        return;

      var key = String.fromCharCode(e.which);
      var lowerKey = key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && lowerKey == 'v')
        this.pasteTarget_.focus();
    };

    /**
     * Handle a paste event on the the ScrollPort's screen element.
     */
    ScrollPort.prototype.onPaste_ = function(e) {
      this.pasteTarget_.focus();

      var self = this;
      setTimeout(function() {
          self.publish('paste', { text: self.pasteTarget_.value });
          self.pasteTarget_.value = '';
          self.screen_.focus();
        }, 0);
    };

    /**
     * Handles a textInput event on the paste target. Stops this from
     * propagating as we want this to be handled in the onPaste_ method.
     */
    ScrollPort.prototype.handlePasteTargetTextInput_ = function(e) {
      e.stopPropagation();
    };

    /**
     * Set the vertical scrollbar mode of the ScrollPort.
     */
    ScrollPort.prototype.setScrollbarVisible = function(state) {
      this.screen_.style.overflowY = state ? 'scroll' : 'hidden';
    };
  });
define("hterm/struct", 
  ["hterm/struct/cursor_shape","hterm/struct/key_actions","hterm/struct/rowcol","hterm/struct/size","hterm/struct/terminal_options","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var cursorShape = __dependency1__["default"];
    var keyActions = __dependency2__["default"];

    var RowCol = __dependency3__["default"];
    var Size = __dependency4__["default"];
    var TerminalOptions = __dependency5__["default"];

    var struct = {
      cursorShape: cursorShape,
      keyActions: keyActions,
      RowCol: RowCol,
      Size: Size,
      TerminalOptions: TerminalOptions
    };
    __exports__.struct = struct;
    __exports__["default"] = struct;
  });
define("hterm/struct/cursor_shape", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    /**
     * Possible cursor shapes.
     */
    var cursorShape = {
      BLOCK: 'BLOCK',
      BEAM: 'BEAM',
      UNDERLINE: 'UNDERLINE'
    };
    __exports__.cursorShape = cursorShape;
    __exports__["default"] = cursorShape;
  });
define("hterm/struct/key_actions", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    /* jshint -W053 */ // Intentional use of `new String()` here.

    /**
     * Special handling for keyCodes in a keyboard layout.
     */
    var keyActions = {
      /**
       * Call preventDefault and stopPropagation for this key event and nothing
       * else.
       */
      CANCEL: new String('CANCEL'),

      /**
       * This performs the default terminal action for the key.  If used in the
       * 'normal' action and the the keystroke represents a printable key, the
       * character will be sent to the host.  If used in one of the modifier
       * actions, the terminal will perform the normal action after (possibly)
       * altering it.
       *
       *  - If the normal sequence starts with CSI, the sequence will be adjusted
       *    to include the modifier parameter as described in [XTERM] in the final
       *    table of the "PC-Style Function Keys" section.
       *
       *  - If the control key is down and the key represents a printable character,
       *    and the uppercase version of the unshifted keycap is between
       *    64 (ASCII '@') and 95 (ASCII '_'), then the uppercase version of the
       *    unshifted keycap minus 64 is sent.  This makes '^@' send '\x00' and
       *    '^_' send '\x1f'.  (Note that one higher that 0x1f is 0x20, which is
       *    the first printable ASCII value.)
       *
       *  - If the alt key is down and the key represents a printable character then
       *    the value of the character is shifted up by 128.
       *
       *  - If meta is down and configured to send an escape, '\x1b' will be sent
       *    before the normal action is performed.
       */
      DEFAULT: new String('DEFAULT'),

      /**
       * Causes the terminal to opt out of handling the key event, instead letting
       * the browser deal with it.
       */
      PASS: new String('PASS'),

      /**
       * Insert the first or second character of the keyCap, based on e.shiftKey.
       * The key will be handled in onKeyDown, and e.preventDefault() will be
       * called.
       *
       * It is useful for a modified key action, where it essentially strips the
       * modifier while preventing the browser from reacting to the key.
       */
      STRIP: new String('STRIP')
    };
    __exports__.keyActions = keyActions;
    __exports__["default"] = keyActions;
  });
define("hterm/struct/rowcol", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    /**
     * Constructor for a RowCol record.
     *
     * Instances of this class have public read/write members for row and column.
     *
     * This class includes an 'overflow' bit which is use to indicate that the an
     * attempt has been made to move the cursor column passed the end of the
     * screen.  When this happens we leave the cursor column set to the last column
     * of the screen but set the overflow bit.  In this state cursor movement
     * happens normally, but any attempt to print new characters causes a cr/lf
     * first.
     *
     * @param {integer} row The row of this record.
     * @param {integer} column The column of this record.
     * @param {boolean} opt_overflow Optional boolean indicating that the RowCol
     *     has overflowed.
     */
    var RowCol = function(row, column, opt_overflow) {
      this.row = row;
      this.column = column;
      this.overflow = !!opt_overflow;
    };
    __exports__.RowCol = RowCol;
    __exports__["default"] = RowCol;

    /**
     * Adjust the row and column of this record.
     *
     * @param {integer} row The new row of this record.
     * @param {integer} column The new column of this record.
     * @param {boolean} opt_overflow Optional boolean indicating that the RowCol
     *     has overflowed.
     */
    RowCol.prototype.move = function(row, column, opt_overflow) {
      this.row = row;
      this.column = column;
      this.overflow = !!opt_overflow;
    };

    /**
     * Return a copy of this record.
     *
     * @return {RowCol} A new RowCol instance with the same row and
     * column.
     */
    RowCol.prototype.clone = function() {
      return new RowCol(this.row, this.column, this.overflow);
    };

    /**
     * Set the row and column of this instance based on another RowCol.
     *
     * @param {RowCol} that The object to copy from.
     */
    RowCol.prototype.setTo = function(that) {
      this.row = that.row;
      this.column = that.column;
      this.overflow = that.overflow;
    };

    /**
     * Test if another RowCol instance is equal to this one.
     *
     * @param {RowCol} that The other RowCol instance.
     * @return {boolen} True if both instances have the same row/column, false
     *     otherwise.
     */
    RowCol.prototype.equals = function(that) {
      return (this.row == that.row && this.column == that.column &&
              this.overflow == that.overflow);
    };

    /**
     * Return a string representation of this instance.
     *
     * @return {string} A string that identifies the row and column of this
     *     instance.
     */
    RowCol.prototype.toString = function() {
      return ('[RowCol: ' + this.row + ', ' + this.column + ', ' +
              this.overflow + ']');
    };
  });
define("hterm/struct/size", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    /**
     * Constructor for a Size record.
     *
     * Instances of this class have public read/write members for width and height.
     *
     * @param {integer} width The width of this record.
     * @param {integer} height The height of this record.
     */
    var Size = function(width, height) {
      this.width = width;
      this.height = height;
    };
    __exports__.Size = Size;
    __exports__["default"] = Size;

    /**
     * Adjust the width and height of this record.
     *
     * @param {integer} width The new width of this record.
     * @param {integer} height The new height of this record.
     */
    Size.prototype.resize = function(width, height) {
      this.width = width;
      this.height = height;
    };

    /**
     * Return a copy of this record.
     *
     * @return {Size} A new Size instance with the same width and height.
     */
    Size.prototype.clone = function() {
      return new Size(this.width, this.height);
    };

    /**
     * Set the height and width of this instance based on another Size.
     *
     * @param {Size} that The object to copy from.
     */
    Size.prototype.setTo = function(that) {
      this.width = that.width;
      this.height = that.height;
    };

    /**
     * Test if another Size instance is equal to this one.
     *
     * @param {Size} that The other Size instance.
     * @return {boolen} True if both instances have the same width/height, false
     *     otherwise.
     */
    Size.prototype.equals = function(that) {
      return this.width == that.width && this.height == that.height;
    };

    /**
     * Return a string representation of this instance.
     *
     * @return {string} A string that identifies the width and height of this
     *     instance.
     */
    Size.prototype.toString = function() {
      return '[Size: ' + this.width + ', ' + this.height + ']';
    };
  });
define("hterm/struct/terminal_options", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    /**
     * The defaults are as defined in http://www.vt100.net/docs/vt510-rm/DECSTR
     * except that we enable autowrap (wraparound) by defaut since that seems to
     * be what xterm does.
     *
     * @param {hterm.Options=} opt_copy Optional instance to copy.
     * @constructor
     */
    var TerminalOptions = function(opt_copy) {
      // All attributes in this class are public to allow easy access by the
      // terminal.

      this.wraparound = opt_copy ? opt_copy.wraparound : true;
      this.reverseWraparound = opt_copy ? opt_copy.reverseWraparound : false;
      this.originMode = opt_copy ? opt_copy.originMode : false;
      this.autoCarriageReturn = opt_copy ? opt_copy.autoCarriageReturn : false;
      this.cursorVisible = opt_copy ? opt_copy.cursorVisible : false;
      this.cursorBlink = opt_copy ? opt_copy.cursorBlink : false;
      this.insertMode = opt_copy ? opt_copy.insertMode : false;
      this.reverseVideo = opt_copy ? opt_copy.reverseVideo : false;
      this.bracketedPaste = opt_copy ? opt_copy.bracketedPaste : false;
    };
    __exports__.TerminalOptions = TerminalOptions;
    __exports__["default"] = TerminalOptions;
  });
define("hterm/terminal", 
  ["hterm/resource/ding","hterm/i18n","hterm/struct","hterm/terminal_config_observers","hterm/util","hterm/config","hterm/keyboard","hterm/screen","hterm/scrollport","hterm/terminal_io","hterm/text_attributes","hterm/vt","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __dependency11__, __dependency12__, __exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var ding = __dependency1__["default"];
    var i18n = __dependency2__["default"];
    var struct = __dependency3__["default"];
    var terminalConfigObservers = __dependency4__["default"];
    var util = __dependency5__["default"];

    var Config = __dependency6__["default"];
    var Keyboard = __dependency7__["default"];
    var Screen = __dependency8__["default"];
    var ScrollPort = __dependency9__["default"];
    var TerminalIO = __dependency10__["default"];
    var TextAttributes = __dependency11__["default"];
    var VT = __dependency12__["default"];

    /**
     * Constructor for the Terminal class.
     *
     * A Terminal pulls together the ScrollPort, Screen and VT classes to provide
     * the complete terminal functionality.
     *
     * There are a number of lower-level Terminal methods that can be called
     * directly to manipulate the cursor, text, scroll region, and other terminal
     * attributes.  However, the primary method is interpret(), which parses VT
     * escape sequences and invokes the appropriate Terminal methods.
     */
    var Terminal = function(opt_config) {
      this.config = opt_config || new Config();

      // Two screen instances.
      this.primaryScreen_ = new Screen();
      this.alternateScreen_ = new Screen();

      // The "current" screen.
      this.screen_ = this.primaryScreen_;

      // The local notion of the screen size.  ScreenBuffers also have a size which
      // indicates their present size.  During size changes, the two may disagree.
      // Also, the inactive screen's size is not altered until it is made the active
      // screen.
      this.screenSize = new struct.Size(0, 0);

      // The scroll port we'll be using to display the visible rows.
      this.scrollPort_ = new ScrollPort(this);
      this.scrollPort_.subscribe('resize', this.onResize_.bind(this));
      this.scrollPort_.subscribe('scroll', this.onScroll_.bind(this));
      this.scrollPort_.subscribe('paste', this.onPaste_.bind(this));
      this.scrollPort_.onCopy = this.onCopy_.bind(this);

      // The div that contains this terminal.
      this.div_ = null;

      // The document that contains the scrollPort.  Defaulted to the global
      // document here so that the terminal is functional even if it hasn't been
      // inserted into a document yet, but re-set in decorate().
      this.document_ = window.document;

      // The rows that have scrolled off screen and are no longer addressable.
      this.scrollbackRows_ = [];

      // Saved tab stops.
      this.tabStops_ = [];

      // Keep track of whether default tab stops have been erased; after a TBC
      // clears all tab stops, defaults aren't restored on resize until a reset.
      this.defaultTabStops = true;

      // The VT's notion of the top and bottom rows.  Used during some VT
      // cursor positioning and scrolling commands.
      this.vtScrollTop_ = null;
      this.vtScrollBottom_ = null;

      // The DIV element for the visible cursor.
      this.cursorNode_ = null;

      // The current cursor shape of the terminal.
      this.cursorShape_ = struct.cursorShape.BLOCK;

      // The current color of the cursor.
      this.cursorColor_ = null;

      // Cursor blink on/off cycle in ms, overwritten by prefs once they're loaded.
      this.cursorBlinkCycle_ = this.config.get('cursor-blink-cycle');

      // Pre-bound onCursorBlink_ handler, so we don't have to do this for each
      // cursor on/off servicing.
      this.myOnCursorBlink_ = this.onCursorBlink_.bind(this);

      // These prefs are cached so we don't have to read from local storage with
      // each output and keystroke.
      this.backgroundColor_ = this.config.get('background-color');
      this.foregroundColor_ = this.config.get('foreground-color');
      this.scrollOnOutput_ = this.config.get('scroll-on-output');
      this.scrollOnKeystroke_ = this.config.get('scroll-on-keystroke');

      // True if we should send mouse events to the vt, false if we want them
      // to manage the local text selection.
      this.reportMouseEvents_ = false;

      // Terminal bell sound.
      this.bellAudio_ = this.document_.createElement('audio');
      this.bellAudio_.setAttribute('preload', 'auto');
      this.syncBellAudio_();

      // All terminal bell notifications that have been generated (not necessarily
      // shown).
      this.bellNotificationList_ = [];

      // Whether we have permission to display notifications.
      this.desktopNotificationBell_ = false;

      // Cursor position and attributes saved with DECSC.
      this.savedOptions_ = {};

      // The current mode bits for the terminal.
      this.options_ = new struct.TerminalOptions();

      // Timeouts we might need to clear.
      this.timeouts_ = {};

      // The VT escape sequence interpreter.
      this.vt = new VT(this);

      // The keyboard hander.
      this.keyboard = new Keyboard(this);

      // General IO interface that can be given to third parties without exposing
      // the entire terminal object.
      this.io = new TerminalIO(this);

      // True if mouse-click-drag should scroll the terminal.
      this.enableMouseDragScroll = true;

      this.copyOnSelect = this.config.get('copy-on-select');
      this.setMousePasteButton(this.config.get('mouse-paste-button'));

      // Whether to use the default window copy behaviour.
      this.useDefaultWindowCopy = false;

      this.clearSelectionAfterCopy = this.config.get('clear-selection-after-copy');

      this.realizeSize_(80, 24);
      this.setDefaultTabStops();
    };
    __exports__.Terminal = Terminal;
    __exports__["default"] = Terminal;

    /**
     * Default tab with of 8 to match xterm.
     */
    Terminal.prototype.tabWidth = 8;

    /**
     * Enable or disable bracketed paste mode.
     */
    Terminal.prototype.setBracketedPaste = function(state) {
      this.options_.bracketedPaste = state;
    };

    /**
     * Set the color for the cursor.
     */
    Terminal.prototype.setCursorColor = function(color) {
      this.cursorColor_ = color;
      this.cursorNode_.style.backgroundColor = color;
      this.cursorNode_.style.borderColor = color;
    };

    /**
     * Return the current cursor color as a string.
     */
    Terminal.prototype.getCursorColor = function() {
      return this.cursorColor_;
    };

    /**
     * Enable or disable mouse based text selection in the terminal.
     */
    Terminal.prototype.setSelectionEnabled = function(state) {
      this.enableMouseDragScroll = state;
    };

    /**
     * Set the background color.
     */
    Terminal.prototype.setBackgroundColor = function(color) {
      this.backgroundColor_ = util.colors.normalizeCSS(color);
      this.primaryScreen_.textAttributes.setDefaults(
          this.foregroundColor_, this.backgroundColor_);
      this.alternateScreen_.textAttributes.setDefaults(
          this.foregroundColor_, this.backgroundColor_);
      this.scrollPort_.setBackgroundColor(color);
    };

    /**
     * Return the current terminal background color.
     */
    Terminal.prototype.getBackgroundColor = function() {
      return this.backgroundColor_;
    };

    /**
     * Set the foreground color.
     */
    Terminal.prototype.setForegroundColor = function(color) {
      this.foregroundColor_ = util.colors.normalizeCSS(color);
      this.primaryScreen_.textAttributes.setDefaults(
          this.foregroundColor_, this.backgroundColor_);
      this.alternateScreen_.textAttributes.setDefaults(
          this.foregroundColor_, this.backgroundColor_);
      this.scrollPort_.setForegroundColor(color);
    };

    /**
     * Return the current terminal foreground color.
     */
    Terminal.prototype.getForegroundColor = function() {
      return this.foregroundColor_;
    };

    /**
     * Returns true if the current screen is the primary screen, false otherwise.
     */
    Terminal.prototype.isPrimaryScreen = function() {
      return this.screen_ == this.primaryScreen_;
    };

    /**
     * Install the keyboard handler for this terminal.
     *
     * This will prevent the browser from seeing any keystrokes sent to the
     * terminal.
     */
    Terminal.prototype.installKeyboard = function() {
      this.keyboard.installKeyboard(this.scrollPort_.getDocument().body);
    };

    /**
     * Uninstall the keyboard handler for this terminal.
     */
    Terminal.prototype.uninstallKeyboard = function() {
      this.keyboard.installKeyboard(null);
    };

    /**
     * Set the font size for this terminal.
     *
     * Call setFontSize(0) to reset to the default font size.
     *
     * This function does not modify the font-size preference.
     *
     * @param {number} px The desired font size, in pixels.
     */
    Terminal.prototype.setFontSize = function(px) {
      if (px === 0)
        px = this.config.get('font-size');

      this.scrollPort_.setFontSize(px);
      if (this.wcCssRule_) {
        this.wcCssRule_.style.width = this.scrollPort_.characterSize.width * 2 +
            'px';
      }
    };

    /**
     * Get the current font size.
     */
    Terminal.prototype.getFontSize = function() {
      return this.scrollPort_.getFontSize();
    };

    Terminal.prototype.setFontFamily = function(family) {
      this.scrollPort_.setFontFamily(family);
    };

    /**
     * Get the current font family.
     */
    Terminal.prototype.getFontFamily = function() {
      return this.scrollPort_.getFontFamily();
    };

    Terminal.prototype.setFontSmoothing = function(smoothing) {
      this.scrollPort_.setFontSmoothing(smoothing);
    };

    /**
     * Set this.mousePasteButton, autodetecting if necessary.
     */
    Terminal.prototype.setMousePasteButton = function(button) {
      if (typeof button == 'number') {
        this.mousePasteButton = button;
        return;
      }

      var ary = navigator.userAgent.match(/\(X11;\s+(\S+)/);
      if (!ary || ary[2] == 'CrOS') {
        this.mousePasteButton = 2;
      } else {
        this.mousePasteButton = 3;
      }
    };

    /**
     * Enable or disable bold based on the enable-bold pref, autodetecting if
     * necessary.
     */
    Terminal.prototype.setBoldSafeState = function(enableBold) {
      if (enableBold !== null) {
        this.primaryScreen_.textAttributes.enableBold = enableBold;
        this.alternateScreen_.textAttributes.enableBold = enableBold;
        return;
      }

      var normalSize = this.scrollPort_.measureCharacterSize();
      var boldSize = this.scrollPort_.measureCharacterSize('bold');

      var isBoldSafe = normalSize.equals(boldSize);
      if (!isBoldSafe) {
        console.warn('Bold characters disabled: Size of bold weight differs ' +
                     'from normal.  Font family is: ' +
                     this.scrollPort_.getFontFamily());
      }

      this.primaryScreen_.textAttributes.enableBold = isBoldSafe;
      this.alternateScreen_.textAttributes.enableBold = isBoldSafe;
    };

    /**
     * Return a copy of the current cursor position.
     *
     * @return {struct.RowCol} The RowCol object representing the current position.
     */
    Terminal.prototype.saveCursor = function() {
      return this.screen_.cursorPosition.clone();
    };

    Terminal.prototype.getTextAttributes = function() {
      return this.screen_.textAttributes;
    };

    Terminal.prototype.setTextAttributes = function(textAttributes) {
      this.screen_.textAttributes = textAttributes;
    };

    /**
     * Return the current browser zoom factor applied to the terminal.
     *
     * @return {number} The current browser zoom factor.
     */
    Terminal.prototype.getZoomFactor = function() {
      return this.scrollPort_.characterSize.zoomFactor;
    };

    /**
     * Change the title of this terminal's window.
     */
    Terminal.prototype.setWindowTitle = function(title) {
      window.document.title = title;
    };

    /**
     * Restore a previously saved cursor position.
     *
     * @param {struct.RowCol} cursor The position to restore.
     */
    Terminal.prototype.restoreCursor = function(cursor) {
      var row = util.f.clamp(cursor.row, 0, this.screenSize.height - 1);
      var column = util.f.clamp(cursor.column, 0, this.screenSize.width - 1);
      this.screen_.setCursorPosition(row, column);
      if (cursor.column > column ||
          cursor.column == column && cursor.overflow) {
        this.screen_.cursorPosition.overflow = true;
      }
    };

    /**
     * Clear the cursor's overflow flag.
     */
    Terminal.prototype.clearCursorOverflow = function() {
      this.screen_.cursorPosition.overflow = false;
    };

    /**
     * Sets the cursor shape
     */
    Terminal.prototype.setCursorShape = function(shape) {
      this.cursorShape_ = shape;
      this.restyleCursor_();
    };

    /**
     * Get the cursor shape
     */
    Terminal.prototype.getCursorShape = function() {
      return this.cursorShape_;
    };

    /**
     * Set the width of the terminal, resizing the UI to match.
     */
    Terminal.prototype.setWidth = function(columnCount) {
      if (columnCount == null) {
        this.div_.style.width = '100%';
        return;
      }

      this.div_.style.width = Math.ceil(
          this.scrollPort_.characterSize.width *
          columnCount + this.scrollPort_.currentScrollbarWidthPx) + 'px';
      this.realizeSize_(columnCount, this.screenSize.height);
      this.scheduleSyncCursorPosition_();
    };

    /**
     * Set the height of the terminal, resizing the UI to match.
     */
    Terminal.prototype.setHeight = function(rowCount) {
      if (rowCount == null) {
        this.div_.style.height = '100%';
        return;
      }

      this.div_.style.height =
          this.scrollPort_.characterSize.height * rowCount + 'px';
      this.realizeSize_(this.screenSize.width, rowCount);
      this.scheduleSyncCursorPosition_();
    };

    /**
     * Deal with terminal size changes.
     *
     */
    Terminal.prototype.realizeSize_ = function(columnCount, rowCount) {
      if (columnCount != this.screenSize.width)
        this.realizeWidth_(columnCount);

      if (rowCount != this.screenSize.height)
        this.realizeHeight_(rowCount);

      // Send new terminal size to plugin.
      this.io.onTerminalResize_(columnCount, rowCount);
    };

    /**
     * Deal with terminal width changes.
     *
     * This function does what needs to be done when the terminal width changes
     * out from under us.  It happens here rather than in onResize_() because this
     * code may need to run synchronously to handle programmatic changes of
     * terminal width.
     *
     * Relying on the browser to send us an async resize event means we may not be
     * in the correct state yet when the next escape sequence hits.
     */
    Terminal.prototype.realizeWidth_ = function(columnCount) {
      if (columnCount <= 0)
        throw new Error('Attempt to realize bad width: ' + columnCount);

      var deltaColumns = columnCount - this.screen_.getWidth();

      this.screenSize.width = columnCount;
      this.screen_.setColumnCount(columnCount);

      if (deltaColumns > 0) {
        if (this.defaultTabStops)
          this.setDefaultTabStops(this.screenSize.width - deltaColumns);
      } else {
        for (var i = this.tabStops_.length - 1; i >= 0; i--) {
          if (this.tabStops_[i] < columnCount)
            break;

          this.tabStops_.pop();
        }
      }

      this.screen_.setColumnCount(this.screenSize.width);
    };

    /**
     * Deal with terminal height changes.
     *
     * This function does what needs to be done when the terminal height changes
     * out from under us.  It happens here rather than in onResize_() because this
     * code may need to run synchronously to handle programmatic changes of
     * terminal height.
     *
     * Relying on the browser to send us an async resize event means we may not be
     * in the correct state yet when the next escape sequence hits.
     */
    Terminal.prototype.realizeHeight_ = function(rowCount) {
      if (rowCount <= 0)
        throw new Error('Attempt to realize bad height: ' + rowCount);

      var deltaRows = rowCount - this.screen_.getHeight();

      this.screenSize.height = rowCount;

      var cursor = this.saveCursor();

      if (deltaRows < 0) {
        // Screen got smaller.
        deltaRows *= -1;
        while (deltaRows) {
          var lastRow = this.getRowCount() - 1;
          if (lastRow - this.scrollbackRows_.length == cursor.row)
            break;

          if (this.getRowText(lastRow))
            break;

          this.screen_.popRow();
          deltaRows--;
        }

        var ary = this.screen_.shiftRows(deltaRows);
        this.scrollbackRows_.push.apply(this.scrollbackRows_, ary);

        // We just removed rows from the top of the screen, we need to update
        // the cursor to match.
        cursor.row = Math.max(cursor.row - deltaRows, 0);
      } else if (deltaRows > 0) {
        // Screen got larger.

        if (deltaRows <= this.scrollbackRows_.length) {
          var scrollbackCount = Math.min(deltaRows, this.scrollbackRows_.length);
          var rows = this.scrollbackRows_.splice(
              this.scrollbackRows_.length - scrollbackCount, scrollbackCount);
          this.screen_.unshiftRows(rows);
          deltaRows -= scrollbackCount;
          cursor.row += scrollbackCount;
        }

        if (deltaRows)
          this.appendRows_(deltaRows);
      }

      this.setVTScrollRegion(null, null);
      this.restoreCursor(cursor);
    };

    /**
     * Scroll the terminal to the top of the scrollback buffer.
     */
    Terminal.prototype.scrollHome = function() {
      this.scrollPort_.scrollRowToTop(0);
    };

    /**
     * Scroll the terminal to the end.
     */
    Terminal.prototype.scrollEnd = function() {
      this.scrollPort_.scrollRowToBottom(this.getRowCount());
    };

    /**
     * Scroll the terminal one page up (minus one line) relative to the current
     * position.
     */
    Terminal.prototype.scrollPageUp = function() {
      var i = this.scrollPort_.getTopRowIndex();
      this.scrollPort_.scrollRowToTop(i - this.screenSize.height + 1);
    };

    /**
     * Scroll the terminal one page down (minus one line) relative to the current
     * position.
     */
    Terminal.prototype.scrollPageDown = function() {
      var i = this.scrollPort_.getTopRowIndex();
      this.scrollPort_.scrollRowToTop(i + this.screenSize.height - 1);
    };

    /**
     * Clear primary screen, secondary screen, and the scrollback buffer.
     */
    Terminal.prototype.wipeContents = function() {
      this.scrollbackRows_.length = 0;
      this.scrollPort_.resetCache();

      [this.primaryScreen_, this.alternateScreen_].forEach(function(screen) {
        var bottom = screen.getHeight();
        if (bottom > 0) {
          this.renumberRows_(0, bottom);
          this.clearHome(screen);
        }
      }.bind(this));

      this.syncCursorPosition_();
      this.scrollPort_.invalidate();
    };

    /**
     * Full terminal reset.
     */
    Terminal.prototype.reset = function() {
      this.clearAllTabStops();
      this.setDefaultTabStops();

      this.clearHome(this.primaryScreen_);
      this.primaryScreen_.textAttributes.reset();

      this.clearHome(this.alternateScreen_);
      this.alternateScreen_.textAttributes.reset();

      this.setCursorBlink(!!this.config.get('cursor-blink'));

      this.vt.reset();

      this.softReset();
    };

    /**
     * Soft terminal reset.
     *
     * Perform a soft reset to the default values listed in
     * http://www.vt100.net/docs/vt510-rm/DECSTR#T5-9
     */
    Terminal.prototype.softReset = function() {
      // Reset terminal options to their default values.
      this.options_ = new struct.TerminalOptions();

      // Xterm also resets the color palette on soft reset, even though it doesn't
      // seem to be documented anywhere.
      this.primaryScreen_.textAttributes.resetColorPalette();
      this.alternateScreen_.textAttributes.resetColorPalette();

      // The xterm man page explicitly says this will happen on soft reset.
      this.setVTScrollRegion(null, null);

      // Xterm also shows the cursor on soft reset, but does not alter the blink
      // state.
      this.setCursorVisible(true);
    };

    /**
     * Move the cursor forward to the next tab stop, or to the last column
     * if no more tab stops are set.
     */
    Terminal.prototype.forwardTabStop = function() {
      var column = this.screen_.cursorPosition.column;

      for (var i = 0; i < this.tabStops_.length; i++) {
        if (this.tabStops_[i] > column) {
          this.setCursorColumn(this.tabStops_[i]);
          return;
        }
      }

      // xterm does not clear the overflow flag on HT or CHT.
      var overflow = this.screen_.cursorPosition.overflow;
      this.setCursorColumn(this.screenSize.width - 1);
      this.screen_.cursorPosition.overflow = overflow;
    };

    /**
     * Move the cursor backward to the previous tab stop, or to the first column
     * if no previous tab stops are set.
     */
    Terminal.prototype.backwardTabStop = function() {
      var column = this.screen_.cursorPosition.column;

      for (var i = this.tabStops_.length - 1; i >= 0; i--) {
        if (this.tabStops_[i] < column) {
          this.setCursorColumn(this.tabStops_[i]);
          return;
        }
      }

      this.setCursorColumn(1);
    };

    /**
     * Set a tab stop at the given column.
     *
     * @param {int} column Zero based column.
     */
    Terminal.prototype.setTabStop = function(column) {
      for (var i = this.tabStops_.length - 1; i >= 0; i--) {
        if (this.tabStops_[i] == column)
          return;

        if (this.tabStops_[i] < column) {
          this.tabStops_.splice(i + 1, 0, column);
          return;
        }
      }

      this.tabStops_.splice(0, 0, column);
    };

    /**
     * Clear the tab stop at the current cursor position.
     *
     * No effect if there is no tab stop at the current cursor position.
     */
    Terminal.prototype.clearTabStopAtCursor = function() {
      var column = this.screen_.cursorPosition.column;

      var i = this.tabStops_.indexOf(column);
      if (i == -1)
        return;

      this.tabStops_.splice(i, 1);
    };

    /**
     * Clear all tab stops.
     */
    Terminal.prototype.clearAllTabStops = function() {
      this.tabStops_.length = 0;
      this.defaultTabStops = false;
    };

    /**
     * Set up the default tab stops, starting from a given column.
     *
     * This sets a tabstop every (column % this.tabWidth) column, starting
     * from the specified column, or 0 if no column is provided.  It also flags
     * future resizes to set them up.
     *
     * This does not clear the existing tab stops first, use clearAllTabStops
     * for that.
     *
     * @param {int} opt_start Optional starting zero based starting column, useful
     *     for filling out missing tab stops when the terminal is resized.
     */
    Terminal.prototype.setDefaultTabStops = function(opt_start) {
      var start = opt_start || 0;
      var w = this.tabWidth;
      // Round start up to a default tab stop.
      start = start - 1 - ((start - 1) % w) + w;
      for (var i = start; i < this.screenSize.width; i += w) {
        this.setTabStop(i);
      }

      this.defaultTabStops = true;
    };

    /**
     * Interpret a sequence of characters.
     *
     * Incomplete escape sequences are buffered until the next call.
     *
     * @param {string} str Sequence of characters to interpret or pass through.
     */
    Terminal.prototype.interpret = function(str) {
      this.vt.interpret(str);
      this.scheduleSyncCursorPosition_();
    };

    /**
     * Take over the given DIV for use as the terminal display.
     *
     * @param {HTMLDivElement} div The div to use as the terminal display.
     */
    Terminal.prototype.decorate = function(div) {
      this.div_ = div;

      this.config.addObserver(function(name, value) {
          if (name in terminalConfigObservers) {
            terminalConfigObservers[name].call(this, value);
          }
        }.bind(this));

      this.scrollPort_.decorate(div);
      this.scrollPort_.setBackgroundImage(this.config.get('background-image'));
      this.scrollPort_.setBackgroundSize(this.config.get('background-size'));
      this.scrollPort_.setBackgroundPosition(
          this.config.get('background-position'));
      this.scrollPort_.setUserCss(this.config.get('user-css'));

      this.div_.focus = this.focus.bind(this);

      this.setFontSize(this.config.get('font-size'));
      this.setFontFamily(this.config.get('font-family'));
      this.setFontSmoothing(this.config.get('font-smoothing'));

      this.setScrollbarVisible(this.config.get('scrollbar-visible'));

      this.document_ = this.scrollPort_.getDocument();

      this.document_.body.oncontextmenu = function() { return false };

      var bound_onMouse = this.onMouse_.bind(this);

      var screenNode = this.scrollPort_.getScreenNode();
      screenNode.addEventListener('mousedown', bound_onMouse);
      screenNode.addEventListener('mouseup', bound_onMouse);
      screenNode.addEventListener('mousemove', bound_onMouse);
      this.scrollPort_.onScrollWheel = bound_onMouse;

      screenNode.addEventListener(
          'focus', this.onFocusChange_.bind(this, true));
      // Listen for mousedown events on the screenNode as in FF the focus
      // events don't bubble.
      screenNode.addEventListener('mousedown', function() {
        setTimeout(this.onFocusChange_.bind(this, true));
      }.bind(this));

      screenNode.addEventListener(
          'blur', this.onFocusChange_.bind(this, false));

      var style = this.document_.createElement('style');
      style.textContent =
          ('.cursor-node[focus="false"] {' +
           '  box-sizing: border-box;' +
           '  background-color: transparent !important;' +
           '  border-width: 2px;' +
           '  border-style: solid;' +
           '}' +
           '.wc-node {' +
           '  display: inline-block;' +
           '  text-align: center;' +
           '  width: ' + this.scrollPort_.characterSize.width * 2 + 'px;' +
           '}');
      this.document_.head.appendChild(style);

      var styleSheets = this.document_.styleSheets;
      var cssRules = styleSheets[styleSheets.length - 1].cssRules;
      this.wcCssRule_ = cssRules[cssRules.length - 1];

      this.cursorNode_ = this.document_.createElement('div');
      this.cursorNode_.className = 'cursor-node';
      this.cursorNode_.style.cssText =
          ('position: absolute;' +
           'top: -99px;' +
           'display: block;' +
           'width: ' + this.scrollPort_.characterSize.width + 'px;' +
           'height: ' + this.scrollPort_.characterSize.height + 'px;' +
           '-webkit-transition: opacity, background-color 100ms linear;' +
           '-moz-transition: opacity, background-color 100ms linear;');

      this.setCursorColor(this.config.get('cursor-color'));
      this.setCursorBlink(!!this.config.get('cursor-blink'));
      this.restyleCursor_();

      this.document_.body.appendChild(this.cursorNode_);

      // When 'enableMouseDragScroll' is off we reposition this element directly
      // under the mouse cursor after a click.  This makes Chrome associate
      // subsequent mousemove events with the scroll-blocker.  Since the
      // scroll-blocker is a peer (not a child) of the scrollport, the mousemove
      // events do not cause the scrollport to scroll.
      //
      // It's a hack, but it's the cleanest way I could find.
      this.scrollBlockerNode_ = this.document_.createElement('div');
      this.scrollBlockerNode_.style.cssText =
          ('position: absolute;' +
           'top: -99px;' +
           'display: block;' +
           'width: 10px;' +
           'height: 10px;');
      this.document_.body.appendChild(this.scrollBlockerNode_);

      this.scrollPort_.onScrollWheel = bound_onMouse;
      ['mousedown', 'mouseup', 'mousemove', 'click', 'dblclick',
       ].forEach(function(event) {
           this.scrollBlockerNode_.addEventListener(event, bound_onMouse);
           this.cursorNode_.addEventListener(event, bound_onMouse);
           this.document_.addEventListener(event, bound_onMouse);
         }.bind(this));

      this.cursorNode_.addEventListener('mousedown', function() {
          setTimeout(this.focus.bind(this));
        }.bind(this));

      this.setReverseVideo(false);

      this.scrollPort_.focus();
      this.scrollPort_.scheduleRedraw();
    };

    /**
     * Return the HTML document that contains the terminal DOM nodes.
     */
    Terminal.prototype.getDocument = function() {
      return this.document_;
    };

    /**
     * Focus the terminal.
     */
    Terminal.prototype.focus = function() {
      this.scrollPort_.focus();
    };

    /**
     * Return the HTML Element for a given row index.
     *
     * This is a method from the RowProvider interface.  The ScrollPort uses
     * it to fetch rows on demand as they are scrolled into view.
     *
     * TODO(rginda): Consider saving scrollback rows as (HTML source, text content)
     * pairs to conserve memory.
     *
     * @param {integer} index The zero-based row index, measured relative to the
     *     start of the scrollback buffer.  On-screen rows will always have the
     *     largest indicies.
     * @return {HTMLElement} The 'x-row' element containing for the requested row.
     */
    Terminal.prototype.getRowNode = function(index) {
      if (index < this.scrollbackRows_.length)
        return this.scrollbackRows_[index];

      var screenIndex = index - this.scrollbackRows_.length;
      return this.screen_.rowsArray[screenIndex];
    };

    /**
     * Return the text content for a given range of rows.
     *
     * This is a method from the RowProvider interface.  The ScrollPort uses
     * it to fetch text content on demand when the user attempts to copy their
     * selection to the clipboard.
     *
     * @param {integer} start The zero-based row index to start from, measured
     *     relative to the start of the scrollback buffer.  On-screen rows will
     *     always have the largest indicies.
     * @param {integer} end The zero-based row index to end on, measured
     *     relative to the start of the scrollback buffer.
     * @return {string} A single string containing the text value of the range of
     *     rows.  Lines will be newline delimited, with no trailing newline.
     */
    Terminal.prototype.getRowsText = function(start, end) {
      var ary = [];
      for (var i = start; i < end; i++) {
        var node = this.getRowNode(i);
        ary.push(node.textContent);
        if (i < end - 1 && !node.getAttribute('line-overflow'))
          ary.push('\n');
      }

      return ary.join('');
    };

    /**
     * Return the text content for a given row.
     *
     * This is a method from the RowProvider interface.  The ScrollPort uses
     * it to fetch text content on demand when the user attempts to copy their
     * selection to the clipboard.
     *
     * @param {integer} index The zero-based row index to return, measured
     *     relative to the start of the scrollback buffer.  On-screen rows will
     *     always have the largest indicies.
     * @return {string} A string containing the text value of the selected row.
     */
    Terminal.prototype.getRowText = function(index) {
      var node = this.getRowNode(index);
      return node.textContent;
    };

    /**
     * Return the total number of rows in the addressable screen and in the
     * scrollback buffer of this terminal.
     *
     * This is a method from the RowProvider interface.  The ScrollPort uses
     * it to compute the size of the scrollbar.
     *
     * @return {integer} The number of rows in this terminal.
     */
    Terminal.prototype.getRowCount = function() {
      return this.scrollbackRows_.length + this.screen_.rowsArray.length;
    };

    /**
     * Create DOM nodes for new rows and append them to the end of the terminal.
     *
     * This is the only correct way to add a new DOM node for a row.  Notice that
     * the new row is appended to the bottom of the list of rows, and does not
     * require renumbering (of the rowIndex property) of previous rows.
     *
     * If you think you want a new blank row somewhere in the middle of the
     * terminal, look into moveRows_().
     *
     * This method does not pay attention to vtScrollTop/Bottom, since you should
     * be using moveRows() in cases where they would matter.
     *
     * The cursor will be positioned at column 0 of the first inserted line.
     */
    Terminal.prototype.appendRows_ = function(count) {
      var cursorRow = this.screen_.rowsArray.length;
      var offset = this.scrollbackRows_.length + cursorRow;
      for (var i = 0; i < count; i++) {
        var row = this.document_.createElement('x-row');
        row.appendChild(this.document_.createTextNode(''));
        row.rowIndex = offset + i;
        this.screen_.pushRow(row);
      }

      var extraRows = this.screen_.rowsArray.length - this.screenSize.height;
      if (extraRows > 0) {
        var ary = this.screen_.shiftRows(extraRows);
        Array.prototype.push.apply(this.scrollbackRows_, ary);
        if (this.scrollPort_.isScrolledEnd)
          this.scheduleScrollDown_();
      }

      if (cursorRow >= this.screen_.rowsArray.length)
        cursorRow = this.screen_.rowsArray.length - 1;

      this.setAbsoluteCursorPosition(cursorRow, 0);
    };

    /**
     * Relocate rows from one part of the addressable screen to another.
     *
     * This is used to recycle rows during VT scrolls (those which are driven
     * by VT commands, rather than by the user manipulating the scrollbar.)
     *
     * In this case, the blank lines scrolled into the scroll region are made of
     * the nodes we scrolled off.  These have their rowIndex properties carefully
     * renumbered so as not to confuse the ScrollPort.
     */
    Terminal.prototype.moveRows_ = function(fromIndex, count, toIndex) {
      var ary = this.screen_.removeRows(fromIndex, count);
      this.screen_.insertRows(toIndex, ary);

      var start, end;
      if (fromIndex < toIndex) {
        start = fromIndex;
        end = toIndex + count;
      } else {
        start = toIndex;
        end = fromIndex + count;
      }

      this.renumberRows_(start, end);
      this.scrollPort_.scheduleInvalidate();
    };

    /**
     * Renumber the rowIndex property of the given range of rows.
     *
     * The start and end indicies are relative to the screen, not the scrollback.
     * Rows in the scrollback buffer cannot be renumbered.  Since they are not
     * addressable (you can't delete them, scroll them, etc), you should have
     * no need to renumber scrollback rows.
     */
    Terminal.prototype.renumberRows_ = function(start, end, opt_screen) {
      var screen = opt_screen || this.screen_;

      var offset = this.scrollbackRows_.length;
      for (var i = start; i < end; i++) {
        screen.rowsArray[i].rowIndex = offset + i;
      }
    };

    /**
     * Print a string to the terminal.
     *
     * This respects the current insert and wraparound modes.  It will add new lines
     * to the end of the terminal, scrolling off the top into the scrollback buffer
     * if necessary.
     *
     * The string is *not* parsed for escape codes.  Use the interpret() method if
     * that's what you're after.
     *
     * @param{string} str The string to print.
     */
    Terminal.prototype.print = function(str) {
      var startOffset = 0;

      var strWidth = i18n.wc.strWidth(str);

      while (startOffset < strWidth) {
        if (this.options_.wraparound && this.screen_.cursorPosition.overflow) {
          this.screen_.commitLineOverflow();
          this.newLine();
        }

        var count = strWidth - startOffset;
        var didOverflow = false;
        var substr;

        if (this.screen_.cursorPosition.column + count >= this.screenSize.width) {
          didOverflow = true;
          count = this.screenSize.width - this.screen_.cursorPosition.column;
        }

        if (didOverflow && !this.options_.wraparound) {
          // If the string overflowed the line but wraparound is off, then the
          // last printed character should be the last of the string.
          // TODO: This will add to our problems with multibyte UTF-16 characters.
          substr = i18n.wc.substr(str, startOffset, count - 1) +
              i18n.wc.substr(str, strWidth - 1);
          count = strWidth;
        } else {
          substr = i18n.wc.substr(str, startOffset, count);
        }

        var tokens = TextAttributes.splitWidecharString(substr);
        for (var i = 0; i < tokens.length; i++) {
          if (tokens[i].wcNode)
            this.screen_.textAttributes.wcNode = true;

          if (this.options_.insertMode) {
              this.screen_.insertString(tokens[i].str);
          } else {
            this.screen_.overwriteString(tokens[i].str);
          }
          this.screen_.textAttributes.wcNode = false;
        }

        this.screen_.maybeClipCurrentRow();
        startOffset += count;
      }

      this.scheduleSyncCursorPosition_();

      if (this.scrollOnOutput_)
        this.scrollPort_.scrollRowToBottom(this.getRowCount());
    };

    /**
     * Set the VT scroll region.
     *
     * This also resets the cursor position to the absolute (0, 0) position, since
     * that's what xterm appears to do.
     *
     * Setting the scroll region to the full height of the terminal will clear
     * the scroll region.  This is *NOT* what most terminals do.  We're explicitly
     * going "off-spec" here because it makes `screen` and `tmux` overflow into the
     * local scrollback buffer, which means the scrollbars and shift-pgup/pgdn
     * continue to work as most users would expect.
     *
     * @param {integer} scrollTop The zero-based top of the scroll region.
     * @param {integer} scrollBottom The zero-based bottom of the scroll region,
     *     inclusive.
     */
    Terminal.prototype.setVTScrollRegion = function(scrollTop, scrollBottom) {
      if (scrollTop === 0 && scrollBottom == this.screenSize.height - 1) {
        this.vtScrollTop_ = null;
        this.vtScrollBottom_ = null;
      } else {
        this.vtScrollTop_ = scrollTop;
        this.vtScrollBottom_ = scrollBottom;
      }
    };

    /**
     * Return the top row index according to the VT.
     *
     * This will return 0 unless the terminal has been told to restrict scrolling
     * to some lower row.  It is used for some VT cursor positioning and scrolling
     * commands.
     *
     * @return {integer} The topmost row in the terminal's scroll region.
     */
    Terminal.prototype.getVTScrollTop = function() {
      if (this.vtScrollTop_ != null)
        return this.vtScrollTop_;

      return 0;
    };

    /**
     * Return the bottom row index according to the VT.
     *
     * This will return the height of the terminal unless the it has been told to
     * restrict scrolling to some higher row.  It is used for some VT cursor
     * positioning and scrolling commands.
     *
     * @return {integer} The bottommost row in the terminal's scroll region.
     */
    Terminal.prototype.getVTScrollBottom = function() {
      if (this.vtScrollBottom_ != null)
        return this.vtScrollBottom_;

      return this.screenSize.height - 1;
    };

    /**
     * Process a '\n' character.
     *
     * If the cursor is on the final row of the terminal this will append a new
     * blank row to the screen and scroll the topmost row into the scrollback
     * buffer.
     *
     * Otherwise, this moves the cursor to column zero of the next row.
     */
    Terminal.prototype.newLine = function() {
      var cursorAtEndOfScreen = (this.screen_.cursorPosition.row ==
                                 this.screen_.rowsArray.length - 1);

      if (this.vtScrollBottom_ != null) {
        // A VT Scroll region is active, we never append new rows.
        if (this.screen_.cursorPosition.row == this.vtScrollBottom_) {
          // We're at the end of the VT Scroll Region, perform a VT scroll.
          this.vtScrollUp(1);
          this.setAbsoluteCursorPosition(this.screen_.cursorPosition.row, 0);
        } else if (cursorAtEndOfScreen) {
          // We're at the end of the screen, the only thing to do is put the
          // cursor to column 0.
          this.setAbsoluteCursorPosition(this.screen_.cursorPosition.row, 0);
        } else {
          // Anywhere else, advance the cursor row, and reset the column.
          this.setAbsoluteCursorPosition(this.screen_.cursorPosition.row + 1, 0);
        }
      } else if (cursorAtEndOfScreen) {
        // We're at the end of the screen.  Append a new row to the terminal,
        // shifting the top row into the scrollback.
        this.appendRows_(1);
      } else {
        // Anywhere else in the screen just moves the cursor.
        this.setAbsoluteCursorPosition(this.screen_.cursorPosition.row + 1, 0);
      }
    };

    /**
     * Like newLine(), except maintain the cursor column.
     */
    Terminal.prototype.lineFeed = function() {
      var column = this.screen_.cursorPosition.column;
      this.newLine();
      this.setCursorColumn(column);
    };

    /**
     * If autoCarriageReturn is set then newLine(), else lineFeed().
     */
    Terminal.prototype.formFeed = function() {
      if (this.options_.autoCarriageReturn) {
        this.newLine();
      } else {
        this.lineFeed();
      }
    };

    /**
     * Move the cursor up one row, possibly inserting a blank line.
     *
     * The cursor column is not changed.
     */
    Terminal.prototype.reverseLineFeed = function() {
      var scrollTop = this.getVTScrollTop();
      var currentRow = this.screen_.cursorPosition.row;

      if (currentRow == scrollTop) {
        this.insertLines(1);
      } else {
        this.setAbsoluteCursorRow(currentRow - 1);
      }
    };

    /**
     * Replace all characters to the left of the current cursor with the space
     * character.
     *
     * TODO(rginda): This should probably *remove* the characters (not just replace
     * with a space) if there are no characters at or beyond the current cursor
     * position.
     */
    Terminal.prototype.eraseToLeft = function() {
      var cursor = this.saveCursor();
      this.setCursorColumn(0);
      this.screen_.overwriteString(util.string.getWhitespace(cursor.column + 1));
      this.restoreCursor(cursor);
    };

    /**
     * Erase a given number of characters to the right of the cursor.
     *
     * The cursor position is unchanged.
     *
     * If the current background color is not the default background color this
     * will insert spaces rather than delete.  This is unfortunate because the
     * trailing space will affect text selection, but it's difficult to come up
     * with a way to style empty space that wouldn't trip up the Screen
     * code.
     *
     * eraseToRight is ignored in the presence of a cursor overflow.  This deviates
     * from xterm, but agrees with gnome-terminal and konsole, xfce4-terminal.  See
     * crbug.com/232390 for details.
     */
    Terminal.prototype.eraseToRight = function(opt_count) {
      if (this.screen_.cursorPosition.overflow)
        return;

      var maxCount = this.screenSize.width - this.screen_.cursorPosition.column;
      var count = opt_count ? Math.min(opt_count, maxCount) : maxCount;

      if (this.screen_.textAttributes.background ===
          this.screen_.textAttributes.DEFAULT_COLOR) {
        var cursorRow = this.screen_.rowsArray[this.screen_.cursorPosition.row];
        if (TextAttributes.nodeWidth(cursorRow) <=
            this.screen_.cursorPosition.column + count) {
          this.screen_.deleteChars(count);
          this.clearCursorOverflow();
          return;
        }
      }

      var cursor = this.saveCursor();
      this.screen_.overwriteString(util.string.getWhitespace(count));
      this.restoreCursor(cursor);
      this.clearCursorOverflow();
    };

    /**
     * Erase the current line.
     *
     * The cursor position is unchanged.
     */
    Terminal.prototype.eraseLine = function() {
      var cursor = this.saveCursor();
      this.screen_.clearCursorRow();
      this.restoreCursor(cursor);
      this.clearCursorOverflow();
    };

    /**
     * Erase all characters from the start of the screen to the current cursor
     * position, regardless of scroll region.
     *
     * The cursor position is unchanged.
     */
    Terminal.prototype.eraseAbove = function() {
      var cursor = this.saveCursor();

      this.eraseToLeft();

      for (var i = 0; i < cursor.row; i++) {
        this.setAbsoluteCursorPosition(i, 0);
        this.screen_.clearCursorRow();
      }

      this.restoreCursor(cursor);
      this.clearCursorOverflow();
    };

    /**
     * Erase all characters from the current cursor position to the end of the
     * screen, regardless of scroll region.
     *
     * The cursor position is unchanged.
     */
    Terminal.prototype.eraseBelow = function() {
      var cursor = this.saveCursor();

      this.eraseToRight();

      var bottom = this.screenSize.height - 1;
      for (var i = cursor.row + 1; i <= bottom; i++) {
        this.setAbsoluteCursorPosition(i, 0);
        this.screen_.clearCursorRow();
      }

      this.restoreCursor(cursor);
      this.clearCursorOverflow();
    };

    /**
     * Fill the terminal with a given character.
     *
     * This methods does not respect the VT scroll region.
     *
     * @param {string} ch The character to use for the fill.
     */
    Terminal.prototype.fill = function(ch) {
      var cursor = this.saveCursor();

      this.setAbsoluteCursorPosition(0, 0);
      for (var row = 0; row < this.screenSize.height; row++) {
        for (var col = 0; col < this.screenSize.width; col++) {
          this.setAbsoluteCursorPosition(row, col);
          this.screen_.overwriteString(ch);
        }
      }

      this.restoreCursor(cursor);
    };

    /**
     * Erase the entire display and leave the cursor at (0, 0).
     *
     * This does not respect the scroll region.
     *
     * @param {Screen} opt_screen Optional screen to operate on.  Defaults
     *     to the current screen.
     */
    Terminal.prototype.clearHome = function(opt_screen) {
      var screen = opt_screen || this.screen_;
      var bottom = screen.getHeight();

      if (bottom === 0) {
        // Empty screen, nothing to do.
        return;
      }

      for (var i = 0; i < bottom; i++) {
        screen.setCursorPosition(i, 0);
        screen.clearCursorRow();
      }

      screen.setCursorPosition(0, 0);
    };

    /**
     * Erase the entire display without changing the cursor position.
     *
     * The cursor position is unchanged.  This does not respect the scroll
     * region.
     *
     * @param {Screen} opt_screen Optional screen to operate on.  Defaults
     *     to the current screen.
     */
    Terminal.prototype.clear = function(opt_screen) {
      var screen = opt_screen || this.screen_;
      var cursor = screen.cursorPosition.clone();
      this.clearHome(screen);
      screen.setCursorPosition(cursor.row, cursor.column);
    };

    /**
     * VT command to insert lines at the current cursor row.
     *
     * This respects the current scroll region.  Rows pushed off the bottom are
     * lost (they won't show up in the scrollback buffer).
     *
     * @param {integer} count The number of lines to insert.
     */
    Terminal.prototype.insertLines = function(count) {
      var cursorRow = this.screen_.cursorPosition.row;

      var bottom = this.getVTScrollBottom();
      count = Math.min(count, bottom - cursorRow);

      // The moveCount is the number of rows we need to relocate to make room for
      // the new row(s).  The count is the distance to move them.
      var moveCount = bottom - cursorRow - count + 1;
      if (moveCount)
        this.moveRows_(cursorRow, moveCount, cursorRow + count);

      for (var i = count - 1; i >= 0; i--) {
        this.setAbsoluteCursorPosition(cursorRow + i, 0);
        this.screen_.clearCursorRow();
      }
    };

    /**
     * VT command to delete lines at the current cursor row.
     *
     * New rows are added to the bottom of scroll region to take their place.  New
     * rows are strictly there to take up space and have no content or style.
     */
    Terminal.prototype.deleteLines = function(count) {
      var cursor = this.saveCursor();

      var top = cursor.row;
      var bottom = this.getVTScrollBottom();

      var maxCount = bottom - top + 1;
      count = Math.min(count, maxCount);

      var moveStart = bottom - count + 1;
      if (count != maxCount)
        this.moveRows_(top, count, moveStart);

      for (var i = 0; i < count; i++) {
        this.setAbsoluteCursorPosition(moveStart + i, 0);
        this.screen_.clearCursorRow();
      }

      this.restoreCursor(cursor);
      this.clearCursorOverflow();
    };

    /**
     * Inserts the given number of spaces at the current cursor position.
     *
     * The cursor position is not changed.
     */
    Terminal.prototype.insertSpace = function(count) {
      var cursor = this.saveCursor();

      var ws = util.string.getWhitespace(count || 1);
      this.screen_.insertString(ws);
      this.screen_.maybeClipCurrentRow();

      this.restoreCursor(cursor);
      this.clearCursorOverflow();
    };

    /**
     * Forward-delete the specified number of characters starting at the cursor
     * position.
     *
     * @param {integer} count The number of characters to delete.
     */
    Terminal.prototype.deleteChars = function(count) {
      var deleted = this.screen_.deleteChars(count);
      if (deleted && !this.screen_.textAttributes.isDefault()) {
        var cursor = this.saveCursor();
        this.setCursorColumn(this.screenSize.width - deleted);
        this.screen_.insertString(util.string.getWhitespace(deleted));
        this.restoreCursor(cursor);
      }

      this.clearCursorOverflow();
    };

    /**
     * Shift rows in the scroll region upwards by a given number of lines.
     *
     * New rows are inserted at the bottom of the scroll region to fill the
     * vacated rows.  The new rows not filled out with the current text attributes.
     *
     * This function does not affect the scrollback rows at all.  Rows shifted
     * off the top are lost.
     *
     * The cursor position is not altered.
     *
     * @param {integer} count The number of rows to scroll.
     */
    Terminal.prototype.vtScrollUp = function(count) {
      var cursor = this.saveCursor();

      this.setAbsoluteCursorRow(this.getVTScrollTop());
      this.deleteLines(count);

      this.restoreCursor(cursor);
    };

    /**
     * Shift rows below the cursor down by a given number of lines.
     *
     * This function respects the current scroll region.
     *
     * New rows are inserted at the top of the scroll region to fill the
     * vacated rows.  The new rows not filled out with the current text attributes.
     *
     * This function does not affect the scrollback rows at all.  Rows shifted
     * off the bottom are lost.
     *
     * @param {integer} count The number of rows to scroll.
     */
    Terminal.prototype.vtScrollDown = function(opt_count) {
      var cursor = this.saveCursor();

      this.setAbsoluteCursorPosition(this.getVTScrollTop(), 0);
      this.insertLines(opt_count);

      this.restoreCursor(cursor);
    };


    /**
     * Set the cursor position.
     *
     * The cursor row is relative to the scroll region if the terminal has
     * 'origin mode' enabled, or relative to the addressable screen otherwise.
     *
     * @param {integer} row The new zero-based cursor row.
     * @param {integer} row The new zero-based cursor column.
     */
    Terminal.prototype.setCursorPosition = function(row, column) {
      if (this.options_.originMode) {
        this.setRelativeCursorPosition(row, column);
      } else {
        this.setAbsoluteCursorPosition(row, column);
      }
    };

    Terminal.prototype.setRelativeCursorPosition = function(row, column) {
      var scrollTop = this.getVTScrollTop();
      row = util.f.clamp(row + scrollTop, scrollTop, this.getVTScrollBottom());
      column = util.f.clamp(column, 0, this.screenSize.width - 1);
      this.screen_.setCursorPosition(row, column);
    };

    Terminal.prototype.setAbsoluteCursorPosition = function(row, column) {
      row = util.f.clamp(row, 0, this.screenSize.height - 1);
      column = util.f.clamp(column, 0, this.screenSize.width - 1);
      this.screen_.setCursorPosition(row, column);
    };

    /**
     * Set the cursor column.
     *
     * @param {integer} column The new zero-based cursor column.
     */
    Terminal.prototype.setCursorColumn = function(column) {
      this.setAbsoluteCursorPosition(this.screen_.cursorPosition.row, column);
    };

    /**
     * Return the cursor column.
     *
     * @return {integer} The zero-based cursor column.
     */
    Terminal.prototype.getCursorColumn = function() {
      return this.screen_.cursorPosition.column;
    };

    /**
     * Set the cursor row.
     *
     * The cursor row is relative to the scroll region if the terminal has
     * 'origin mode' enabled, or relative to the addressable screen otherwise.
     *
     * @param {integer} row The new cursor row.
     */
    Terminal.prototype.setAbsoluteCursorRow = function(row) {
      this.setAbsoluteCursorPosition(row, this.screen_.cursorPosition.column);
    };

    /**
     * Return the cursor row.
     *
     * @return {integer} The zero-based cursor row.
     */
    Terminal.prototype.getCursorRow = function(row) {
      return this.screen_.cursorPosition.row;
    };

    /**
     * Request that the ScrollPort redraw itself soon.
     *
     * The redraw will happen asynchronously, soon after the call stack winds down.
     * Multiple calls will be coalesced into a single redraw.
     */
    Terminal.prototype.scheduleRedraw_ = function() {
      if (this.timeouts_.redraw)
        return;

      var self = this;
      this.timeouts_.redraw = setTimeout(function() {
          delete self.timeouts_.redraw;
          self.scrollPort_.redraw_();
        }, 0);
    };

    /**
     * Request that the ScrollPort be scrolled to the bottom.
     *
     * The scroll will happen asynchronously, soon after the call stack winds down.
     * Multiple calls will be coalesced into a single scroll.
     *
     * This affects the scrollbar position of the ScrollPort, and has nothing to
     * do with the VT scroll commands.
     */
    Terminal.prototype.scheduleScrollDown_ = function() {
      if (this.timeouts_.scrollDown)
        return;

      var self = this;
      this.timeouts_.scrollDown = setTimeout(function() {
          delete self.timeouts_.scrollDown;
          self.scrollPort_.scrollRowToBottom(self.getRowCount());
        }, 10);
    };

    /**
     * Move the cursor up a specified number of rows.
     *
     * @param {integer} count The number of rows to move the cursor.
     */
    Terminal.prototype.cursorUp = function(count) {
      return this.cursorDown(-(count || 1));
    };

    /**
     * Move the cursor down a specified number of rows.
     *
     * @param {integer} count The number of rows to move the cursor.
     */
    Terminal.prototype.cursorDown = function(count) {
      count = count || 1;
      var minHeight = (this.options_.originMode ? this.getVTScrollTop() : 0);
      var maxHeight = (this.options_.originMode ? this.getVTScrollBottom() :
                       this.screenSize.height - 1);

      var row = util.f.clamp(this.screen_.cursorPosition.row + count,
                             minHeight, maxHeight);
      this.setAbsoluteCursorRow(row);
    };

    /**
     * Move the cursor left a specified number of columns.
     *
     * If reverse wraparound mode is enabled and the previous row wrapped into
     * the current row then we back up through the wraparound as well.
     *
     * @param {integer} count The number of columns to move the cursor.
     */
    Terminal.prototype.cursorLeft = function(count) {
      count = count || 1;

      if (count < 1)
        return;

      var currentColumn = this.screen_.cursorPosition.column;
      var newColumn;

      if (this.options_.reverseWraparound) {
        if (this.screen_.cursorPosition.overflow) {
          // If this cursor is in the right margin, consume one count to get it
          // back to the last column.  This only applies when we're in reverse
          // wraparound mode.
          count--;
          this.clearCursorOverflow();

          if (!count)
            return;
        }

        var newRow = this.screen_.cursorPosition.row;
        newColumn = currentColumn - count;
        if (newColumn < 0) {
          newRow = newRow - Math.floor(count / this.screenSize.width) - 1;
          if (newRow < 0) {
            // xterm also wraps from row 0 to the last row.
            newRow = this.screenSize.height + newRow % this.screenSize.height;
          }
          newColumn = this.screenSize.width + newColumn % this.screenSize.width;
        }

        this.setCursorPosition(Math.max(newRow, 0), newColumn);

      } else {
        newColumn = Math.max(currentColumn - count, 0);
        this.setCursorColumn(newColumn);
      }
    };

    /**
     * Move the cursor right a specified number of columns.
     *
     * @param {integer} count The number of columns to move the cursor.
     */
    Terminal.prototype.cursorRight = function(count) {
      count = count || 1;

      if (count < 1)
        return;

      var column = util.f.clamp(this.screen_.cursorPosition.column + count,
                                0, this.screenSize.width - 1);
      this.setCursorColumn(column);
    };

    /**
     * Reverse the foreground and background colors of the terminal.
     *
     * This only affects text that was drawn with no attributes.
     *
     * TODO(rginda): Test xterm to see if reverse is respected for text that has
     * been drawn with attributes that happen to coincide with the default
     * 'no-attribute' colors.  My guess is probably not.
     */
    Terminal.prototype.setReverseVideo = function(state) {
      this.options_.reverseVideo = state;
      if (state) {
        this.scrollPort_.setForegroundColor(this.config.get('background-color'));
        this.scrollPort_.setBackgroundColor(this.config.get('foreground-color'));
      } else {
        this.scrollPort_.setForegroundColor(this.config.get('foreground-color'));
        this.scrollPort_.setBackgroundColor(this.config.get('background-color'));
      }
    };

    /**
     * Ring the terminal bell.
     *
     * This will not play the bell audio more than once per second.
     */
    Terminal.prototype.ringBell = function() {
      this.cursorNode_.style.backgroundColor =
          this.scrollPort_.getForegroundColor();

      var self = this;
      setTimeout(function() {
          self.cursorNode_.style.backgroundColor = self.config.get('cursor-color');
        }, 200);

      // bellSquelchTimeout_ affects both audio and notification bells.
      if (this.bellSquelchTimeout_)
        return;

      if (this.bellAudio_.getAttribute('src')) {
        this.bellAudio_.play();
        this.bellSequelchTimeout_ = setTimeout(function() {
            delete this.bellSquelchTimeout_;
          }.bind(this), 500);
      } else {
        delete this.bellSquelchTimeout_;
      }

      if (this.desktopNotificationBell_ && !this.document_.hasFocus()) {
        var n = new Notification(
            util.string.replaceVars(i18n.msg.desktopNotificationTitle,
                                    {'title': window.document.title || 'hterm'}));
        this.bellNotificationList_.push(n);
        // TODO: Should we try to raise the window here?
        n.onclick = function() { self.closeBellNotifications_(); };
      }
    };

    Terminal.prototype.syncBellAudio_ = function() {
      var src = this.config.get('audible-bell-sound');
      if (src && src == 'x-resource:ding') {
        this.bellAudio_.setAttribute('src', ding.getDataUrl());
      } else {
        this.bellAudio_.setAttribute('src', src);
      }
    };

    /**
     * Set the origin mode bit.
     *
     * If origin mode is on, certain VT cursor and scrolling commands measure their
     * row parameter relative to the VT scroll region.  Otherwise, row 0 corresponds
     * to the top of the addressable screen.
     *
     * Defaults to off.
     *
     * @param {boolean} state True to set origin mode, false to unset.
     */
    Terminal.prototype.setOriginMode = function(state) {
      this.options_.originMode = state;
      this.setCursorPosition(0, 0);
    };

    /**
     * Set the insert mode bit.
     *
     * If insert mode is on, existing text beyond the cursor position will be
     * shifted right to make room for new text.  Otherwise, new text overwrites
     * any existing text.
     *
     * Defaults to off.
     *
     * @param {boolean} state True to set insert mode, false to unset.
     */
    Terminal.prototype.setInsertMode = function(state) {
      this.options_.insertMode = state;
    };

    /**
     * Set the auto carriage return bit.
     *
     * If auto carriage return is on then a formfeed character is interpreted
     * as a newline, otherwise it's the same as a linefeed.  The difference boils
     * down to whether or not the cursor column is reset.
     */
    Terminal.prototype.setAutoCarriageReturn = function(state) {
      this.options_.autoCarriageReturn = state;
    };

    /**
     * Set the wraparound mode bit.
     *
     * If wraparound mode is on, certain VT commands will allow the cursor to wrap
     * to the start of the following row.  Otherwise, the cursor is clamped to the
     * end of the screen and attempts to write past it are ignored.
     *
     * Defaults to on.
     *
     * @param {boolean} state True to set wraparound mode, false to unset.
     */
    Terminal.prototype.setWraparound = function(state) {
      this.options_.wraparound = state;
    };

    /**
     * Set the reverse-wraparound mode bit.
     *
     * If wraparound mode is off, certain VT commands will allow the cursor to wrap
     * to the end of the previous row.  Otherwise, the cursor is clamped to column
     * 0.
     *
     * Defaults to off.
     *
     * @param {boolean} state True to set reverse-wraparound mode, false to unset.
     */
    Terminal.prototype.setReverseWraparound = function(state) {
      this.options_.reverseWraparound = state;
    };

    /**
     * Selects between the primary and alternate screens.
     *
     * If alternate mode is on, the alternate screen is active.  Otherwise the
     * primary screen is active.
     *
     * Swapping screens has no effect on the scrollback buffer.
     *
     * Each screen maintains its own cursor position.
     *
     * Defaults to off.
     *
     * @param {boolean} state True to set alternate mode, false to unset.
     */
    Terminal.prototype.setAlternateMode = function(state) {
      var cursor = this.saveCursor();
      this.screen_ = state ? this.alternateScreen_ : this.primaryScreen_;

      if (this.screen_.rowsArray.length &&
          this.screen_.rowsArray[0].rowIndex != this.scrollbackRows_.length) {
        // If the screen changed sizes while we were away, our rowIndexes may
        // be incorrect.
        var offset = this.scrollbackRows_.length;
        var ary = this.screen_.rowsArray;
        for (var i = 0; i < ary.length; i++) {
          ary[i].rowIndex = offset + i;
        }
      }

      this.realizeWidth_(this.screenSize.width);
      this.realizeHeight_(this.screenSize.height);
      this.scrollPort_.syncScrollHeight();
      this.scrollPort_.invalidate();

      this.restoreCursor(cursor);
      this.scrollPort_.resize();
    };

    /**
     * Set the cursor-blink mode bit.
     *
     * If cursor-blink is on, the cursor will blink when it is visible.  Otherwise
     * a visible cursor does not blink.
     *
     * You should make sure to turn blinking off if you're going to dispose of a
     * terminal, otherwise you'll leak a timeout.
     *
     * Defaults to on.
     *
     * @param {boolean} state True to set cursor-blink mode, false to unset.
     */
    Terminal.prototype.setCursorBlink = function(state) {
      this.options_.cursorBlink = state;

      if (!state && this.timeouts_.cursorBlink) {
        clearTimeout(this.timeouts_.cursorBlink);
        delete this.timeouts_.cursorBlink;
      }

      if (this.options_.cursorVisible)
        this.setCursorVisible(true);
    };

    /**
     * Set the cursor-visible mode bit.
     *
     * If cursor-visible is on, the cursor will be visible.  Otherwise it will not.
     *
     * Defaults to on.
     *
     * @param {boolean} state True to set cursor-visible mode, false to unset.
     */
    Terminal.prototype.setCursorVisible = function(state) {
      this.options_.cursorVisible = state;

      if (!state) {
        this.cursorNode_.style.opacity = '0';
        return;
      }

      this.syncCursorPosition_();

      this.cursorNode_.style.opacity = '1';

      if (this.options_.cursorBlink) {
        if (this.timeouts_.cursorBlink)
          return;

        this.onCursorBlink_();
      } else {
        if (this.timeouts_.cursorBlink) {
          clearTimeout(this.timeouts_.cursorBlink);
          delete this.timeouts_.cursorBlink;
        }
      }
    };

    /**
     * Synchronizes the visible cursor and document selection with the current
     * cursor coordinates.
     */
    Terminal.prototype.syncCursorPosition_ = function() {
      var topRowIndex = this.scrollPort_.getTopRowIndex();
      var bottomRowIndex = this.scrollPort_.getBottomRowIndex(topRowIndex);
      var cursorRowIndex = this.scrollbackRows_.length +
          this.screen_.cursorPosition.row;

      if (cursorRowIndex > bottomRowIndex) {
        // Cursor is scrolled off screen, move it outside of the visible area.
        this.cursorNode_.style.top = -this.scrollPort_.characterSize.height + 'px';
        return;
      }

      if (this.options_.cursorVisible &&
          this.cursorNode_.style.display == 'none') {
        // Re-display the terminal cursor if it was hidden by the mouse cursor.
        this.cursorNode_.style.display = '';
      }


      this.cursorNode_.style.top = this.scrollPort_.visibleRowTopMargin +
          this.scrollPort_.characterSize.height * (cursorRowIndex - topRowIndex) +
          'px';
      this.cursorNode_.style.left = this.scrollPort_.characterSize.width *
          this.screen_.cursorPosition.column + 'px';

      this.cursorNode_.setAttribute('title',
                                    '(' + this.screen_.cursorPosition.row +
                                    ', ' + this.screen_.cursorPosition.column +
                                    ')');

      // Update the caret for a11y purposes.
      var selection = this.document_.getSelection();
      if (selection && selection.isCollapsed)
        this.screen_.syncSelectionCaret(selection);
    };

    /**
     * Adjusts the style of this.cursorNode_ according to the current cursor shape
     * and character cell dimensions.
     */
    Terminal.prototype.restyleCursor_ = function() {
      var shape = this.cursorShape_;

      if (this.cursorNode_.getAttribute('focus') == 'false') {
        // Always show a block cursor when unfocused.
        shape = struct.cursorShape.BLOCK;
      }

      var style = this.cursorNode_.style;

      style.width = this.scrollPort_.characterSize.width + 'px';

      switch (shape) {
        case struct.cursorShape.BEAM:
          style.height = this.scrollPort_.characterSize.height + 'px';
          style.backgroundColor = 'transparent';
          style.borderBottomStyle = null;
          style.borderLeftStyle = 'solid';
          break;

        case struct.cursorShape.UNDERLINE:
          style.height = this.scrollPort_.characterSize.baseline + 'px';
          style.backgroundColor = 'transparent';
          style.borderBottomStyle = 'solid';
          // correct the size to put it exactly at the baseline
          style.borderLeftStyle = null;
          break;

        default:
          style.height = this.scrollPort_.characterSize.height + 'px';
          style.backgroundColor = this.cursorColor_;
          style.borderBottomStyle = null;
          style.borderLeftStyle = null;
          break;
      }
    };

    /**
     * Synchronizes the visible cursor with the current cursor coordinates.
     *
     * The sync will happen asynchronously, soon after the call stack winds down.
     * Multiple calls will be coalesced into a single sync.
     */
    Terminal.prototype.scheduleSyncCursorPosition_ = function() {
      if (this.timeouts_.syncCursor)
        return;

      var self = this;
      this.timeouts_.syncCursor = setTimeout(function() {
          self.syncCursorPosition_();
          delete self.timeouts_.syncCursor;
        }, 0);
    };

    /**
     * Show or hide the zoom warning.
     *
     * The zoom warning is a message warning the user that their browser zoom must
     * be set to 100% in order for hterm to function properly.
     *
     * @param {boolean} state True to show the message, false to hide it.
     */
    Terminal.prototype.showZoomWarning_ = function(state) {
      if (!this.zoomWarningNode_) {
        if (!state)
          return;

        this.zoomWarningNode_ = this.document_.createElement('div');
        this.zoomWarningNode_.style.cssText = (
            'color: black;' +
            'background-color: #ff2222;' +
            'font-size: large;' +
            'border-radius: 8px;' +
            'opacity: 0.75;' +
            'padding: 0.2em 0.5em 0.2em 0.5em;' +
            'top: 0.5em;' +
            'right: 1.2em;' +
            'position: absolute;' +
            '-webkit-text-size-adjust: none;' +
            '-webkit-user-select: none;' +
            '-moz-text-size-adjust: none;' +
            '-moz-user-select: none;');
      }

      this.zoomWarningNode_.textContent = i18n.msg.zoomWarning;
      this.zoomWarningNode_.style.fontFamily = this.config.get('font-family');

      if (state) {
        if (!this.zoomWarningNode_.parentNode)
          this.div_.parentNode.appendChild(this.zoomWarningNode_);
      } else if (this.zoomWarningNode_.parentNode) {
        this.zoomWarningNode_.parentNode.removeChild(this.zoomWarningNode_);
      }
    };

    /**
     * Show the terminal overlay for a given amount of time.
     *
     * The terminal overlay appears in inverse video in a large font, centered
     * over the terminal.  You should probably keep the overlay message brief,
     * since it's in a large font and you probably aren't going to check the size
     * of the terminal first.
     *
     * @param {string} msg The text (not HTML) message to display in the overlay.
     * @param {number} opt_timeout The amount of time to wait before fading out
     *     the overlay.  Defaults to 1.5 seconds.  Pass null to have the overlay
     *     stay up forever (or until the next overlay).
     */
    Terminal.prototype.showOverlay = function(msg, opt_timeout) {
      if (!this.overlayNode_) {
        if (!this.div_)
          return;

        this.overlayNode_ = this.document_.createElement('div');
        this.overlayNode_.style.cssText = (
            'border-radius: 15px;' +
            'font-size: xx-large;' +
            'opacity: 0.75;' +
            'padding: 0.2em 0.5em 0.2em 0.5em;' +
            'position: absolute;' +
            '-webkit-user-select: none;' +
            '-webkit-transition: opacity 180ms ease-in;' +
            '-moz-user-select: none;' +
            '-moz-transition: opacity 180ms ease-in;');

        this.overlayNode_.addEventListener('mousedown', function(e) {
          e.preventDefault();
          e.stopPropagation();
        }, true);
      }

      this.overlayNode_.style.color = this.config.get('background-color');
      this.overlayNode_.style.backgroundColor = this.config.get('foreground-color');
      this.overlayNode_.style.fontFamily = this.config.get('font-family');

      this.overlayNode_.textContent = msg;
      this.overlayNode_.style.opacity = '0.75';

      if (!this.overlayNode_.parentNode)
        this.div_.appendChild(this.overlayNode_);

      var divSize = util.dom.getClientSize(this.div_);
      var overlaySize = util.dom.getClientSize(this.overlayNode_);

      this.overlayNode_.style.top =
          (divSize.height - overlaySize.height) / 2 + 'px';
      this.overlayNode_.style.left = (divSize.width - overlaySize.width -
          this.scrollPort_.currentScrollbarWidthPx) / 2 + 'px';

      var self = this;

      if (this.overlayTimeout_)
        clearTimeout(this.overlayTimeout_);

      if (opt_timeout === null)
        return;

      this.overlayTimeout_ = setTimeout(function() {
          self.overlayNode_.style.opacity = '0';
          self.overlayTimeout_ = setTimeout(function() {
              if (self.overlayNode_.parentNode)
                self.overlayNode_.parentNode.removeChild(self.overlayNode_);
              self.overlayTimeout_ = null;
              self.overlayNode_.style.opacity = '0.75';
            }, 200);
        }, opt_timeout || 1500);
    };

    /**
     * Paste from the system clipboard to the terminal.
     */
    Terminal.prototype.paste = function() {
      util.dom.pasteFromClipboard(this.document_);
    };

    /**
     * Copy a string to the system clipboard.
     *
     * Note: If there is a selected range in the terminal, it'll be cleared.
     */
    Terminal.prototype.copyStringToClipboard = function(str) {
      if (this.config.get('enable-clipboard-notice'))
        setTimeout(this.showOverlay.bind(this, i18n.msg.notifyCopy, 500), 200);

      var copySource = this.document_.createElement('pre');
      copySource.textContent = str;
      copySource.style.cssText = (
          '-webkit-user-select: text;' +
          '-moz-user-select: text;' +
          'position: absolute;' +
          'top: -99px');

      this.document_.body.appendChild(copySource);

      var selection = this.document_.getSelection();
      var anchorNode = selection.anchorNode;
      var anchorOffset = selection.anchorOffset;
      var focusNode = selection.focusNode;
      var focusOffset = selection.focusOffset;

      selection.selectAllChildren(copySource);

      util.dom.copySelectionToClipboard(this.document_);

      // IE doesn't support selection.extend. This means that the selection
      // won't return on IE.
      if (selection.extend) {
        selection.collapse(anchorNode, anchorOffset);
        selection.extend(focusNode, focusOffset);
      }

      copySource.parentNode.removeChild(copySource);
    };

    Terminal.prototype.getSelectionText = function() {
      var selection = this.scrollPort_.selection;
      selection.sync();

      if (selection.isCollapsed)
        return null;


      // Start offset measures from the beginning of the line.
      var startOffset = selection.startOffset;
      var node = selection.startNode;

      if (node.nodeName != 'X-ROW') {
        // If the selection doesn't start on an x-row node, then it must be
        // somewhere inside the x-row.  Add any characters from previous siblings
        // into the start offset.

        if (node.nodeName == '#text' && node.parentNode.nodeName == 'SPAN') {
          // If node is the text node in a styled span, move up to the span node.
          node = node.parentNode;
        }

        while (node.previousSibling) {
          node = node.previousSibling;
          startOffset += TextAttributes.nodeWidth(node);
        }
      }

      // End offset measures from the end of the line.
      var endOffset = (TextAttributes.nodeWidth(selection.endNode) -
                       selection.endOffset);
      node = selection.endNode;

      if (node.nodeName != 'X-ROW') {
        // If the selection doesn't end on an x-row node, then it must be
        // somewhere inside the x-row.  Add any characters from following siblings
        // into the end offset.

        if (node.nodeName == '#text' && node.parentNode.nodeName == 'SPAN') {
          // If node is the text node in a styled span, move up to the span node.
          node = node.parentNode;
        }

        while (node.nextSibling) {
          node = node.nextSibling;
          endOffset += TextAttributes.nodeWidth(node);
        }
      }

      var rv = this.getRowsText(selection.startRow.rowIndex,
                                selection.endRow.rowIndex + 1);
      return i18n.wc.substring(rv, startOffset, i18n.wc.strWidth(rv) - endOffset);
    };

    /**
     * Copy the current selection to the system clipboard, then clear it after a
     * short delay.
     */
    Terminal.prototype.copySelectionToClipboard = function() {
      var text = this.getSelectionText();
      if (text != null)
        this.copyStringToClipboard(text);
    };

    Terminal.prototype.overlaySize = function() {
      this.showOverlay(this.screenSize.width + 'x' + this.screenSize.height);
    };

    /**
     * Invoked by Terminal.Keyboard when a VT keystroke is detected.
     *
     * @param {string} string The VT string representing the keystroke, in UTF-16.
     */
    Terminal.prototype.onVTKeystroke = function(string) {
      if (this.scrollOnKeystroke_)
        this.scrollPort_.scrollRowToBottom(this.getRowCount());

      this.io.onVTKeystroke(this.keyboard.encode(string));
    };

    /**
     * Add the terminalRow and terminalColumn properties to mouse events and
     * then forward on to onMouse().
     *
     * The terminalRow and terminalColumn properties contain the (row, column)
     * coordinates for the mouse event.
     */
    Terminal.prototype.onMouse_ = function(e) {
      if (e.processedByTerminalHandler_) {
        // We register our event handlers on the document, as well as the cursor
        // and the scroll blocker.  Mouse events that occur on the cursor or
        // scroll blocker will also appear on the document, but we don't want to
        // process them twice.
        //
        // We can't just prevent bubbling because that has other side effects, so
        // we decorate the event object with this property instead.
        return;
      }

      e.processedByTerminalHandler_ = true;

      // One based row/column stored on the mouse event.
      e.terminalRow = parseInt((e.clientY - this.scrollPort_.visibleRowTopMargin) /
                               this.scrollPort_.characterSize.height) + 1;
      e.terminalColumn = parseInt(e.clientX /
                                  this.scrollPort_.characterSize.width) + 1;

      if (e.type == 'mousedown' && e.terminalColumn > this.screenSize.width) {
        // Mousedown in the scrollbar area.
        return;
      }

      if (this.options_.cursorVisible &&
          this.vt.mouseReport == this.vt.MOUSE_REPORT_DISABLED) {
        // If the cursor is visible and we're not sending mouse events to the
        // host app, then we want to hide the terminal cursor when the mouse
        // cursor is over top.  This keeps the terminal cursor from interfering
        // with local text selection.
        if (e.terminalRow - 1 == this.screen_.cursorPosition.row &&
            e.terminalColumn - 1 == this.screen_.cursorPosition.column) {
          this.cursorNode_.style.display = 'none';
        } else if (this.cursorNode_.style.display == 'none') {
          this.cursorNode_.style.display = '';
        }
      }

      if (e.type == 'mousedown') {
        if (e.altKey || this.vt.mouseReport == this.vt.MOUSE_REPORT_DISABLED) {
          // If VT mouse reporting is disabled, or has been defeated with
          // alt-mousedown, then the mouse will act on the local selection.
          this.reportMouseEvents_ = false;
          this.setSelectionEnabled(true);
        } else {
          // Otherwise we defer ownership of the mouse to the VT.
          this.reportMouseEvents_ = true;
          this.document_.getSelection().collapseToEnd();
          this.setSelectionEnabled(false);
          e.preventDefault();
        }
      }

      if (!this.reportMouseEvents_) {
        if (e.type == 'dblclick') {
          this.screen_.expandSelection(this.document_.getSelection());
          util.dom.copySelectionToClipboard(this.document_);
        }

        if (e.type == 'mousedown' && e.which == this.mousePasteButton)
          this.paste();

        if (e.type == 'mouseup' && e.which == 1 && this.copyOnSelect &&
            !this.document_.getSelection().isCollapsed) {
          util.dom.copySelectionToClipboard(this.document_);
        }

        if ((e.type == 'mousemove' || e.type == 'mouseup') &&
            this.scrollBlockerNode_.engaged) {
          // Disengage the scroll-blocker after one of these events.
          this.scrollBlockerNode_.engaged = false;
          this.scrollBlockerNode_.style.top = '-99px';
        }

      } else /* if (this.reportMouseEvents) */ {
        if (!this.scrollBlockerNode_.engaged) {
          if (e.type == 'mousedown') {
            // Move the scroll-blocker into place if we want to keep the scrollport
            // from scrolling.
            this.scrollBlockerNode_.engaged = true;
            this.scrollBlockerNode_.style.top = (e.clientY - 5) + 'px';
            this.scrollBlockerNode_.style.left = (e.clientX - 5) + 'px';
          } else if (e.type == 'mousemove') {
            // Oh.  This means that drag-scroll was disabled AFTER the mouse down,
            // in which case it's too late to engage the scroll-blocker.
            this.document_.getSelection().collapseToEnd();
            e.preventDefault();
          }
        }

        this.onMouse(e);
      }

      if (e.type == 'mouseup' && this.document_.getSelection().isCollapsed) {
        // Restore this on mouseup in case it was temporarily defeated with a
        // alt-mousedown.  Only do this when the selection is empty so that
        // we don't immediately kill the users selection.
        this.reportMouseEvents_ = (this.vt.mouseReport !=
                                   this.vt.MOUSE_REPORT_DISABLED);
      }
    };

    /**
     * Clients should override this if they care to know about mouse events.
     *
     * The event parameter will be a normal DOM mouse click event with additional
     * 'terminalRow' and 'terminalColumn' properties.
     */
    Terminal.prototype.onMouse = function(e) { };

    /**
     * React when focus changes.
     */
    Terminal.prototype.onFocusChange_ = function(focused) {
      this.cursorNode_.setAttribute('focus', focused);
      this.restyleCursor_();
      if (focused === true)
        this.closeBellNotifications_();
    };

    /**
     * React when the ScrollPort is scrolled.
     */
    Terminal.prototype.onScroll_ = function() {
      this.scheduleSyncCursorPosition_();
    };

    /**
     * React when text is pasted into the scrollPort.
     */
    Terminal.prototype.onPaste_ = function(e) {
      var data = e.text.replace(/\n/mg, '\r');
      data = this.keyboard.encode(data);
      if (this.options_.bracketedPaste)
        data = '\x1b[200~' + data + '\x1b[201~';

      this.io.sendString(data);
    };

    /**
     * React when the user tries to copy from the scrollPort.
     */
    Terminal.prototype.onCopy_ = function(e) {
      if (!this.useDefaultWindowCopy) {
        e.preventDefault();
        setTimeout(this.copySelectionToClipboard.bind(this), 0);
      }
    };

    /**
     * React when the ScrollPort is resized.
     *
     * Note: This function should not directly contain code that alters the internal
     * state of the terminal.  That kind of code belongs in realizeWidth or
     * realizeHeight, so that it can be executed synchronously in the case of a
     * programmatic width change.
     */
    Terminal.prototype.onResize_ = function() {
      var columnCount = Math.floor(this.scrollPort_.getScreenWidth() /
                                   this.scrollPort_.characterSize.width);
      var rowCount = Math.floor(this.scrollPort_.getScreenHeight() /
                                this.scrollPort_.characterSize.height);

      if (columnCount <= 0 || rowCount <= 0) {
        // We avoid these situations since they happen sometimes when the terminal
        // gets removed from the document or during the initial load, and we can't
        // deal with that.
        return;
      }

      var isNewSize = (columnCount != this.screenSize.width ||
                       rowCount != this.screenSize.height);

      // We do this even if the size didn't change, just to be sure everything is
      // in sync.
      this.realizeSize_(columnCount, rowCount);
      this.showZoomWarning_(this.scrollPort_.characterSize.zoomFactor != 1);

      if (isNewSize)
        this.overlaySize();

      this.restyleCursor_();
      this.scheduleSyncCursorPosition_();
    };

    /**
     * Service the cursor blink timeout.
     */
    Terminal.prototype.onCursorBlink_ = function() {
      if (!this.options_.cursorBlink) {
        delete this.timeouts_.cursorBlink;
        return;
      }

      if (this.cursorNode_.getAttribute('focus') == 'false' ||
          this.cursorNode_.style.opacity == '0') {
        this.cursorNode_.style.opacity = '1';
        this.timeouts_.cursorBlink = setTimeout(this.myOnCursorBlink_,
                                                this.cursorBlinkCycle_[0]);
      } else {
        this.cursorNode_.style.opacity = '0';
        this.timeouts_.cursorBlink = setTimeout(this.myOnCursorBlink_,
                                                this.cursorBlinkCycle_[1]);
      }
    };

    /**
     * Set the scrollbar-visible mode bit.
     *
     * If scrollbar-visible is on, the vertical scrollbar will be visible.
     * Otherwise it will not.
     *
     * Defaults to on.
     *
     * @param {boolean} state True to set scrollbar-visible mode, false to unset.
     */
    Terminal.prototype.setScrollbarVisible = function(state) {
      this.scrollPort_.setScrollbarVisible(state);
    };

    /**
     * Close all web notifications created by terminal bells.
     */
    Terminal.prototype.closeBellNotifications_ = function() {
      this.bellNotificationList_.forEach(function(n) {
          n.close();
        });
      this.bellNotificationList_.length = 0;
    };
  });
define("hterm/terminal_config_observers", 
  ["hterm/util","hterm/i18n","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var util = __dependency1__["default"];
    var i18n = __dependency2__["default"];

    var terminalConfigObservers = {
      'alt-backspace-is-meta-backspace': function(v) {
        this.keyboard.altBackspaceIsMetaBackspace = v;
      },

      'alt-is-meta': function(v) {
        this.keyboard.altIsMeta = v;
      },

      'alt-sends-what': function(v) {
        if (!/^(escape|8-bit|browser-key)$/.test(v))
          v = 'escape';

        this.keyboard.altSendsWhat = v;
      },

      'audible-bell-sound': function(v) {
        this.syncBellAudio_();
      },

      'desktop-notification-bell': function(v) {
        if (v && window.Notification) {
          this.desktopNotificationBell_ =
              window.Notification.permission === 'granted';
          if (!this.desktopNotificationBell_) {
            // Note: We don't call Notification.requestPermission here because
            // Chrome requires the call be the result of a user action (such as an
            // onclick handler), and pref listeners are run asynchronously.
            //
            // A way of working around this would be to display a dialog in the
            // this with a "click-to-request-permission" button.
            console.warn('desktop-notification-bell is true but we do not have ' +
                'permission to display notifications.');
          }
        } else {
          this.desktopNotificationBell_ = false;
        }
      },

      'background-color': function(v) {
        this.setBackgroundColor(v);
      },

      'background-image': function(v) {
        this.scrollPort_.setBackgroundImage(v);
      },

      'background-size': function(v) {
        this.scrollPort_.setBackgroundSize(v);
      },

      'background-position': function(v) {
        this.scrollPort_.setBackgroundPosition(v);
      },

      'backspace-sends-backspace': function(v) {
        this.keyboard.backspaceSendsBackspace = v;
      },

      'cursor-blink': function(v) {
        this.setCursorBlink(!!v);
      },

      'cursor-blink-cycle': function(v) {
        if (v instanceof Array &&
            typeof v[0] == 'number' &&
            typeof v[1] == 'number') {
          this.cursorBlinkCycle_ = v;
        } else if (typeof v == 'number') {
          this.cursorBlinkCycle_ = [v, v];
        } else {
          // Fast blink indicates an error.
          this.cursorBlinkCycle_ = [100, 100];
        }
      },

      'cursor-color': function(v) {
        this.setCursorColor(v);
      },

      'color-palette-overrides': function(v) {
        if (!(v == null || v instanceof Object || v instanceof Array)) {
          console.warn('Preference color-palette-overrides is not an array or ' +
              'object: ' + v);
          return;
        }

        util.colors.colorPalette = util.colors.stockColorPalette.concat();

        if (v) {
          for (var key in v) {
            var i = parseInt(key);
            if (isNaN(i) || i < 0 || i > 255) {
              console.log('Invalid value in palette: ' + key + ': ' + v[key]);
              continue;
            }

            if (v[i]) {
              var rgb = util.colors.normalizeCSS(v[i]);
              if (rgb)
              util.colors.colorPalette[i] = rgb;
            }
          }
        }

        this.primaryScreen_.textAttributes.resetColorPalette();
        this.alternateScreen_.textAttributes.resetColorPalette();
      },

      'copy-on-select': function(v) {
        this.copyOnSelect = !!v;
      },

      'use-default-window-copy': function(v) {
        this.useDefaultWindowCopy = !!v;
      },

      'clear-selection-after-copy': function(v) {
        this.clearSelectionAfterCopy = !!v;
      },

      'ctrl-plus-minus-zero-zoom': function(v) {
        this.keyboard.ctrlPlusMinusZeroZoom = v;
      },

      'ctrl-c-copy': function(v) {
        this.keyboard.ctrlCCopy = v;
      },

      'ctrl-v-paste': function(v) {
        this.keyboard.ctrlVPaste = v;
        this.scrollPort_.setCtrlVPaste(v);
      },

      'east-asian-ambiguous-as-two-column': function(v) {
        i18n.wc.regardCjkAmbiguous = v;
      },

      'enable-8-bit-control': function(v) {
        this.vt.enable8BitControl = !!v;
      },

      'enable-bold': function(v) {
        this.setBoldSafeState(v);
      },

      'enable-bold-as-bright': function(v) {
        this.primaryScreen_.textAttributes.enableBoldAsBright = !!v;
        this.alternateScreen_.textAttributes.enableBoldAsBright = !!v;
      },

      'enable-clipboard-write': function(v) {
        this.vt.enableClipboardWrite = !!v;
      },

      'enable-dec12': function(v) {
        this.vt.enableDec12 = !!v;
      },

      'font-family': function(v) {
        this.setFontFamily(v);
      },

      'font-size': function(v) {
        this.setFontSize(v);
      },

      'font-smoothing': function(v) {
        this.setFontSmoothing(v);
      },

      'foreground-color': function(v) {
        this.setForegroundColor(v);
      },

      'home-keys-scroll': function(v) {
        this.keyboard.homeKeysScroll = v;
      },

      'max-string-sequence': function(v) {
        this.vt.maxStringSequence = v;
      },

      'media-keys-are-fkeys': function(v) {
        this.keyboard.mediaKeysAreFKeys = v;
      },

      'meta-sends-escape': function(v) {
        this.keyboard.metaSendsEscape = v;
      },

      'mouse-paste-button': function(v) {
        this.setMousePasteButton(v);
      },

      'page-keys-scroll': function(v) {
        this.keyboard.pageKeysScroll = v;
      },

      'pass-alt-number': function(v) {
        this.passAltNumber = v;
      },

      'pass-ctrl-number': function(v) {
        this.passCtrlNumber = v;
      },

      'pass-meta-number': function(v) {
        this.passMetaNumber = v;
      },

      'pass-meta-v': function(v) {
        this.keyboard.passMetaV = v;
      },

      'receive-encoding': function(v) {
        if (!(/^(utf-8|raw)$/).test(v)) {
          console.warn('Invalid value for "receive-encoding": ' + v);
          v = 'utf-8';
        }

        this.vt.characterEncoding = v;
      },

      'scroll-on-keystroke': function(v) {
        this.scrollOnKeystroke_ = v;
      },

      'scroll-on-output': function(v) {
        this.scrollOnOutput_ = v;
      },

      'scrollbar-visible': function(v) {
        this.setScrollbarVisible(v);
      },

      'send-encoding': function(v) {
        if (!(/^(utf-8|raw)$/).test(v)) {
          console.warn('Invalid value for "send-encoding": ' + v);
          v = 'utf-8';
        }

        this.keyboard.characterEncoding = v;
      },

      'shift-insert-paste': function(v) {
        this.keyboard.shiftInsertPaste = v;
      },

      'user-css': function(v) {
        this.scrollPort_.setUserCss(v);
      }
    };
    __exports__.terminalConfigObservers = terminalConfigObservers;
    __exports__["default"] = terminalConfigObservers;
  });
define("hterm/terminal_io", 
  ["hterm/i18n/utf8","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var utf8 = __dependency1__["default"];

    /**
     * Input/Output interface used by commands to communicate with the terminal.
     *
     * The active command must override the onVTKeystroke() and sendString() methods
     * of this class in order to receive keystrokes and send output to the correct
     * destination.
     *
     * Isolating commands from the terminal provides the following benefits:
     * - Provides a mechanism to save and restore onVTKeystroke and sendString
     *   handlers when invoking subcommands (see the push() and pop() methods).
     * - The isolation makes it easier to make changes in Terminal and supporting
     *   classes without affecting commands.
     *
     * @param {Terminal}
     */
    var TerminalIO = function(terminal) {
      this.terminal_ = terminal;

      // The IO object to restore on IO.pop().
      this.previousIO_ = null;
    };
    __exports__.TerminalIO = TerminalIO;
    __exports__["default"] = TerminalIO;

    /**
     * Show the terminal overlay for a given amount of time.
     *
     * The terminal overlay appears in inverse video in a large font, centered
     * over the terminal.  You should probably keep the overlay message brief,
     * since it's in a large font and you probably aren't going to check the size
     * of the terminal first.
     *
     * @param {string} msg The text (not HTML) message to display in the overlay.
     * @param {number} opt_timeout The amount of time to wait before fading out
     *     the overlay.  Defaults to 1.5 seconds.  Pass null to have the overlay
     *     stay up forever (or until the next overlay).
     */
    TerminalIO.prototype.showOverlay = function(message, opt_timeout) {
      this.terminal_.showOverlay(message, opt_timeout);
    };

    /**
     * Change the preference profile for the terminal.
     *
     * @param profileName {string} The name of the preference profile to activate.
     */
    TerminalIO.prototype.setTerminalProfile = function(profileName) {
      this.terminal_.setProfile(profileName);
    };

    /**
     * Create a new TerminalIO instance and make it active on the Terminal
     * object associated with this instance.
     *
     * This is used to pass control of the terminal IO off to a subcommand.  The
     * IO.pop() method can be used to restore control when the subcommand completes.
     */
    TerminalIO.prototype.push = function() {
      var io = new TerminalIO(this.terminal_);
      io.keyboardCaptured_ = this.keyboardCaptured_;

      io.columnCount = this.columnCount;
      io.rowCount = this.rowCount;

      io.previousIO_ = this.terminal_.io;
      this.terminal_.io = io;

      return io;
    };

    /**
     * Restore the Terminal's previous IO object.
     */
    TerminalIO.prototype.pop = function() {
      this.terminal_.io = this.previousIO_;
    };

    /**
     * Called when data needs to be sent to the current command.
     *
     * Clients should override this to receive notification of pending data.
     *
     * @param {string} string The data to send.
     */
    TerminalIO.prototype.sendString = function(string) {
      // Override this.
      console.log('Unhandled sendString: ' + string);
    };

    /**
     * Called when a terminal keystroke is detected.
     *
     * Clients should override this to receive notification of keystrokes.
     *
     * The keystroke data will be encoded according to the 'send-encoding'
     * preference.
     *
     * @param {string} string The VT key sequence.
     */
    TerminalIO.prototype.onVTKeystroke = function(string) {
      // Override this.
      console.log('Unobserverd VT keystroke: ' + JSON.stringify(string));
    };

    TerminalIO.prototype.onTerminalResize_ = function(width, height) {
      var obj = this;
      while (obj) {
        obj.columnCount = width;
        obj.rowCount = height;
        obj = obj.previousIO_;
      }

      this.onTerminalResize(width, height);
    };

    /**
     * Called when terminal size is changed.
     *
     * Clients should override this to receive notification of resize.
     *
     * @param {string|integer} terminal width.
     * @param {string|integer} terminal height.
     */
    TerminalIO.prototype.onTerminalResize = function(width, height) {
      // Override this.
    };

    /**
     * Write a UTF-8 encoded byte string to the terminal.
     *
     * @param {string} string The UTF-8 encoded string to print.
     */
    TerminalIO.prototype.writeUTF8 = function(string) {
      if (this.terminal_.io != this)
        throw 'Attempt to print from inactive IO object.';

      this.terminal_.interpret(string);
    };

    /**
     * Write a UTF-8 encoded byte string to the terminal followed by crlf.
     *
     * @param {string} string The UTF-8 encoded string to print.
     */
    TerminalIO.prototype.writelnUTF8 = function(string) {
      if (this.terminal_.io != this)
        throw 'Attempt to print from inactive IO object.';

      this.terminal_.interpret(string + '\r\n');
    };

    /**
     * Write a UTF-16 JavaScript string to the terminal.
     *
     * @param {string} string The string to print.
     */
    TerminalIO.prototype.print =
    TerminalIO.prototype.writeUTF16 = function(string) {
      this.writeUTF8(utf8.encode(string));
    };

    /**
     * Print a UTF-16 JavaScript string to the terminal followed by a newline.
     *
     * @param {string} string The string to print.
     */
    TerminalIO.prototype.println =
    TerminalIO.prototype.writelnUTF16 = function(string) {
      this.writelnUTF8(utf8.encode(string));
    };
  });
define("hterm/text_attributes", 
  ["hterm/i18n","hterm/util","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var i18n = __dependency1__["default"];
    var util = __dependency2__["default"];

    /* jshint -W053 */ // Intentional use of `new String()` in here.

    /**
     * Constructor for TextAttribute objects.
     *
     * These objects manage a set of text attributes such as foreground/
     * background color, bold, italic, blink and underline.
     *
     * TextAttribute instances can be used to construct a DOM container implementing
     * the current attributes, or to test an existing DOM container for
     * compatibility with the current attributes.
     *
     * @constructor
     * @param {HTMLDocument} document The parent document to use when creating
     *     new DOM containers.
     */
    var TextAttributes = function(document) {
      this.document_ = document;
      // These variables contain the source of the color as either:
      // SRC_DEFAULT  (use context default)
      // SRC_RGB      (specified in 'rgb( r, g, b)' form)
      // number       (representing the index from color palette to use)
      this.foregroundSource = this.SRC_DEFAULT;
      this.backgroundSource = this.SRC_DEFAULT;

      // These properties cache the value in the color table, but foregroundSource
      // and backgroundSource contain the canonical values.
      this.foreground = this.DEFAULT_COLOR;
      this.background = this.DEFAULT_COLOR;

      this.defaultForeground = 'rgb(255, 255, 255)';
      this.defaultBackground = 'rgb(0, 0, 0)';

      this.bold = false;
      this.italic = false;
      this.blink = false;
      this.underline = false;
      this.inverse = false;
      this.invisible = false;
      this.wcNode = false;
      this.tileData = null;

      this.colorPalette = null;
      this.resetColorPalette();
    };
    __exports__.TextAttributes = TextAttributes;
    __exports__["default"] = TextAttributes;

    /**
     * If false, we ignore the bold attribute.
     *
     * This is used for fonts that have a bold version that is a different size
     * than the normal weight version.
     */
    TextAttributes.prototype.enableBold = true;

    /**
     * If true, use bright colors (if available) for bold text.
     *
     * This setting is independent of the enableBold setting.
     */
    TextAttributes.prototype.enableBoldAsBright = true;

    /**
     * A sentinel constant meaning "whatever the default color is in this context".
     */
    TextAttributes.prototype.DEFAULT_COLOR = new String('');

    /**
     * A constant string used to specify that source color is context default.
     */
    TextAttributes.prototype.SRC_DEFAULT = 'default';


    /**
     * A constant string used to specify that the source of a color is a valid
     * rgb( r, g, b) specifier.
     */
    TextAttributes.prototype.SRC_RGB = 'rgb';

    /**
     * The document object which should own the DOM nodes created by this instance.
     *
     * @param {HTMLDocument} document The parent document.
     */
    TextAttributes.prototype.setDocument = function(document) {
      this.document_ = document;
    };

    /**
     * Create a deep copy of this object.
     *
     * @return {TextAttributes} A deep copy of this object.
     */
    TextAttributes.prototype.clone = function() {
      var rv = new TextAttributes(null);

      for (var key in this) {
        rv[key] = this[key];
      }

      rv.colorPalette = this.colorPalette.concat();
      return rv;
    };

    /**
     * Reset the current set of attributes.
     *
     * This does not affect the palette.  Use resetColorPalette() for that.
     * It also doesn't affect the tile data, it's not meant to.
     */
    TextAttributes.prototype.reset = function() {
      this.foregroundSource = this.SRC_DEFAULT;
      this.backgroundSource = this.SRC_DEFAULT;
      this.foreground = this.DEFAULT_COLOR;
      this.background = this.DEFAULT_COLOR;
      this.bold = false;
      this.italic = false;
      this.blink = false;
      this.underline = false;
      this.inverse = false;
      this.invisible = false;
      this.wcNode = false;
    };

    /**
     * Reset the color palette to the default state.
     */
    TextAttributes.prototype.resetColorPalette = function() {
      this.colorPalette = util.colors.colorPalette.concat();
      this.syncColors();
    };

    /**
     * Test if the current attributes describe unstyled text.
     *
     * @return {boolean} True if the current attributes describe unstyled text.
     */
    TextAttributes.prototype.isDefault = function() {
      return (this.foregroundSource == this.SRC_DEFAULT &&
              this.backgroundSource == this.SRC_DEFAULT &&
              !this.bold &&
              !this.italic &&
              !this.blink &&
              !this.underline &&
              !this.inverse &&
              !this.invisible &&
              !this.wcNode &&
              this.tileData == null);
    };

    /**
     * Create a DOM container (a span or a text node) with a style to match the
     * current set of attributes.
     *
     * This method will create a plain text node if the text is unstyled, or
     * an HTML span if the text is styled.  Due to lack of monospace wide character
     * fonts on certain systems (e.g. Chrome OS), we need to put each wide character
     * in a span of CSS class '.wc-node' which has double column width.
     * Each vt_tiledata tile is also represented by a span with a single
     * character, with CSS classes '.tile' and '.tile_<glyph number>'.
     *
     * @param {string} opt_textContent Optional text content for the new container.
     * @return {HTMLNode} An HTML span or text nodes styled to match the current
     *     attributes.
     */
    TextAttributes.prototype.createContainer = function(opt_textContent) {
      if (this.isDefault())
        return this.document_.createTextNode(opt_textContent);

      var span = this.document_.createElement('span');
      var style = span.style;

      if (this.foreground != this.DEFAULT_COLOR)
        style.color = this.foreground;

      if (this.background != this.DEFAULT_COLOR)
        style.backgroundColor = this.background;

      if (this.enableBold && this.bold)
        style.fontWeight = 'bold';

      if (this.italic)
        style.fontStyle = 'italic';

      if (this.blink)
        style.fontStyle = 'italic';

      if (this.underline)
        style.textDecoration = 'underline';

      if (this.wcNode) {
        span.className = 'wc-node';
        span.wcNode = true;
      }

      if (this.tileData != null) {
        // This could be a wcNode too, so we add to the className here.
        span.className += ' tile tile_' + this.tileData;
        span.tileNode = true;
      }

      if (opt_textContent)
        span.textContent = opt_textContent;

      return span;
    };

    /**
     * Tests if the provided object (string, span or text node) has the same
     * style as this TextAttributes instance.
     *
     * This indicates that text with these attributes could be inserted directly
     * into the target DOM node.
     *
     * For the purposes of this method, a string is considered a text node.
     *
     * @param {string|HTMLNode} obj The object to test.
     * @return {boolean} True if the provided container has the same style as
     *     this attributes instance.
     */
    TextAttributes.prototype.matchesContainer = function(obj) {
      if (typeof obj == 'string' || obj.nodeType == 3)
        return this.isDefault();

      var style = obj.style;

      // We don't want to put multiple characters in a wcNode or a tile.
      // See the comments in createContainer.
      /* jshint -W018 */ // TODO: Address "Confusing use of !!".
      return (!(this.wcNode || obj.wcNode) &&
              !(this.tileData != null || obj.tileNode) &&
              this.foreground == style.color &&
              this.background == style.backgroundColor &&
              (this.enableBold && this.bold) == !!style.fontWeight &&
              (this.blink || this.italic) == !!style.fontStyle &&
              this.underline == !!style.textDecoration);
    };

    TextAttributes.prototype.setDefaults = function(foreground, background) {
      this.defaultForeground = foreground;
      this.defaultBackground = background;

      this.syncColors();
    };

    /**
     * Updates foreground and background properties based on current indices and
     * other state.
     *
     * @param {string} terminalForeground The terminal foreground color for use as
     *     inverse text background.
     * @param {string} terminalBackground The terminal background color for use as
     *     inverse text foreground.
     *
     */
    TextAttributes.prototype.syncColors = function() {
      function getBrightIndex(i) {
        if (i < 8) {
          // If the color is from the lower half of the ANSI 16, add 8.
          return i + 8;
        }

        // If it's not from the 16 color palette, ignore bold requests.  This
        // matches the behavior of gnome-terminal.
        return i;
      }

      var foregroundSource = this.foregroundSource;
      var backgroundSource = this.backgroundSource;
      var defaultForeground = this.DEFAULT_COLOR;
      var defaultBackground = this.DEFAULT_COLOR;

      if (this.inverse) {
        foregroundSource = this.backgroundSource;
        backgroundSource = this.foregroundSource;
        // We can't inherit the container's color anymore.
        defaultForeground = this.defaultBackground;
        defaultBackground = this.defaultForeground;
      }

      if (this.enableBoldAsBright && this.bold) {
        if (foregroundSource != this.SRC_DEFAULT &&
            foregroundSource != this.SRC_RGB) {
          foregroundSource = getBrightIndex(foregroundSource);
        }
      }

      if (this.invisible)
        foregroundSource = backgroundSource;

      // Set fore/background colors unless already specified in rgb(r, g, b) form.
      if (foregroundSource != this.SRC_RGB) {
        this.foreground = ((foregroundSource == this.SRC_DEFAULT) ?
                           defaultForeground : this.colorPalette[foregroundSource]);
      }

      if (backgroundSource != this.SRC_RGB) {
        this.background = ((backgroundSource == this.SRC_DEFAULT) ?
                           defaultBackground : this.colorPalette[backgroundSource]);
      }
    };

    /**
     * Static method used to test if the provided objects (strings, spans or
     * text nodes) have the same style.
     *
     * For the purposes of this method, a string is considered a text node.
     *
     * @param {string|HTMLNode} obj1 An object to test.
     * @param {string|HTMLNode} obj2 Another object to test.
     * @return {boolean} True if the containers have the same style.
     */
    TextAttributes.containersMatch = function(obj1, obj2) {
      if (typeof obj1 == 'string')
        return TextAttributes.containerIsDefault(obj2);

      if (obj1.nodeType != obj2.nodeType)
        return false;

      if (obj1.nodeType == 3)
        return true;

      var style1 = obj1.style;
      var style2 = obj2.style;

      return (style1.color == style2.color &&
              style1.backgroundColor == style2.backgroundColor &&
              style1.fontWeight == style2.fontWeight &&
              style1.fontStyle == style2.fontStyle &&
              style1.textDecoration == style2.textDecoration);
    };

    /**
     * Static method to test if a given DOM container represents unstyled text.
     *
     * For the purposes of this method, a string is considered a text node.
     *
     * @param {string|HTMLNode} obj1 An object to test.
     * @return {boolean} True if the object is unstyled.
     */
    TextAttributes.containerIsDefault = function(obj) {
      return typeof obj == 'string'  || obj.nodeType == 3;
    };

    /**
     * Static method to get the column width of a node's textContent.
     *
     * @param {HTMLElement} node The HTML element to get the width of textContent
     *     from.
     * @return {integer} The column width of the node's textContent.
     */
    TextAttributes.nodeWidth = function(node) {
      if (node.wcNode) {
        return i18n.wc.strWidth(node.textContent);
      } else {
        return node.textContent.length;
      }
    };

    /**
     * Static method to get the substr of a node's textContent.  The start index
     * and substr width are computed in column width.
     *
     * @param {HTMLElement} node The HTML element to get the substr of textContent
     *     from.
     * @param {integer} start The starting offset in column width.
     * @param {integer} width The width to capture in column width.
     * @return {integer} The extracted substr of the node's textContent.
     */
    TextAttributes.nodeSubstr = function(node, start, width) {
      if (node.wcNode) {
        return i18n.wc.substr(node.textContent, start, width);
      } else {
        return node.textContent.substr(start, width);
      }
    };

    /**
     * Static method to get the substring based of a node's textContent.  The
     * start index of end index are computed in column width.
     *
     * @param {HTMLElement} node The HTML element to get the substr of textContent
     *     from.
     * @param {integer} start The starting offset in column width.
     * @param {integer} end The ending offset in column width.
     * @return {integer} The extracted substring of the node's textContent.
     */
    TextAttributes.nodeSubstring = function(node, start, end) {
      if (node.wcNode) {
        return i18n.wc.substring(node.textContent, start, end);
      } else {
        return node.textContent.substring(start, end);
      }
    };

    /**
     * Static method to split a string into contiguous runs of single-width
     * characters and runs of double-width characters.
     *
     * @param {string} str The string to split.
     * @return {Array} An array of objects that contain substrings of str, where
     *     each substring is either a contiguous runs of single-width characters
     *     or a double-width character.  For object that contains a double-width
     *     character, its wcNode property is set to true.
     */
    TextAttributes.splitWidecharString = function(str) {
      var rv = [];
      var base = 0, length = 0;

      for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128 || i18n.wc.charWidth(c) == 1) {
          length++;
        } else {
          if (length) {
            rv.push({str: str.substr(base, length)});
          }
          rv.push({str: str.substr(i, 1), wcNode: true});
          base = i + 1;
          length = 0;
        }
      }

      if (length)
        rv.push({str: str.substr(base, length)});

      return rv;
    };
  });
define("hterm/util", 
  ["hterm/util/colors","hterm/util/dom","hterm/util/f","hterm/util/pubsub","hterm/util/string","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var colors = __dependency1__["default"];
    var dom = __dependency2__["default"];
    var f = __dependency3__["default"];
    var PubSub = __dependency4__["default"];
    var string = __dependency5__["default"];

    var util = {
      colors: colors,
      dom: dom,
      f: f,
      PubSub: PubSub,
      string: string
    };
    __exports__.util = util;
    __exports__["default"] = util;
  });
define("hterm/util/colors", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var colors = {};
    __exports__.colors = colors;__exports__["default"] = colors;

    /**
     * First, some canned regular expressions we're going to use in this file.
     *
     *
     *                              BRACE YOURSELF
     *
     *                                 ,~~~~.
     *                                 |>_< ~~
     *                                3`---'-/.
     *                                3:::::\v\
     *                               =o=:::::\,\
     *                                | :::::\,,\
     *
     *                        THE REGULAR EXPRESSIONS
     *                               ARE COMING.
     *
     * There's no way to break long RE literals in JavaScript.  Fix that why don't
     * you?  Oh, and also there's no way to write a string that doesn't interpret
     * escapes.
     *
     * Instead, we stoop to this .replace() trick.
     */
    colors.re_ = {
      // CSS hex color, #RGB.
      hex16: /#([a-f0-9])([a-f0-9])([a-f0-9])/i,

      // CSS hex color, #RRGGBB.
      hex24: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/i,

      // CSS rgb color, rgb(rrr,ggg,bbb).
      rgb: new RegExp(
          ('^/s*rgb/s*/(/s*(/d{1,3})/s*,/s*(/d{1,3})/s*,' +
           '/s*(/d{1,3})/s*/)/s*$'
           ).replace(/\//g, '\\'), 'i'),

      // CSS rgb color, rgb(rrr,ggg,bbb,aaa).
      rgba: new RegExp(
          ('^/s*rgba/s*' +
           '/(/s*(/d{1,3})/s*,/s*(/d{1,3})/s*,/s*(/d{1,3})/s*' +
           '(?:,/s*(/d+(?:/./d+)?)/s*)/)/s*$'
           ).replace(/\//g, '\\'), 'i'),

      // Either RGB or RGBA.
      rgbx: new RegExp(
          ('^/s*rgba?/s*' +
           '/(/s*(/d{1,3})/s*,/s*(/d{1,3})/s*,/s*(/d{1,3})/s*' +
           '(?:,/s*(/d+(?:/./d+)?)/s*)?/)/s*$'
           ).replace(/\//g, '\\'), 'i'),

      // An X11 'rgb:ddd/ddd/ddd' value.
      x11rgb: /^\s*rgb:([a-f0-9]{1,4})\/([a-f0-9]{1,4})\/([a-f0-9]{1,4})\s*$/i,

      // English color name.
      name: /[a-z][a-z0-9\s]+/,
    };

    /**
     * Convert a CSS rgb(ddd,ddd,ddd) color value into an X11 color value.
     *
     * Other CSS color values are ignored to ensure sanitary data handling.
     *
     * Each 'ddd' component is a one byte value specified in decimal.
     *
     * @param {string} value The CSS color value to convert.
     * @return {string} The X11 color value or null if the value could not be
     *     converted.
     */
    colors.rgbToX11 = function(value) {
      function scale(v) {
        v = (Math.min(v, 255) * 257).toString(16);
        while (v.length < 4)
          v = '0' + v;

        return v;
      }

      var ary = value.match(colors.re_.rgbx);
      if (!ary)
        return null;

      return 'rgb:' + scale(ary[1]) + '/' + scale(ary[2]) + '/' + scale(ary[3]);
    };

    /**
     * Convert an X11 color value into an CSS rgb(...) color value.
     *
     * The X11 value may be an X11 color name, or an RGB value of the form
     * rgb:hhhh/hhhh/hhhh.  If a component value is less than 4 digits it is
     * padded out to 4, then scaled down to fit in a single byte.
     *
     * @param {string} value The X11 color value to convert.
     * @return {string} The CSS color value or null if the value could not be
     *     converted.
     */
    colors.x11ToCSS = function(v) {
      function scale(v) {
        // Pad out values with less than four digits.  This padding (probably)
        // matches xterm.  It's difficult to say for sure since xterm seems to
        // arrive at a padded value and then perform some combination of
        // gamma correction, color space tranformation, and quantization.

        if (v.length == 1) {
          // Single digits pad out to four by repeating the character.  'f' becomes
          // 'ffff'.  Scaling down a hex value of this pattern by 257 is the same
          // as cutting off one byte.  We skip the middle step and just double
          // the character.
          return parseInt(v + v, 16);
        }

        if (v.length == 2) {
          // Similar deal here.  X11 pads two digit values by repeating the
          // byte (or scale up by 257).  Since we're going to scale it back
          // down anyway, we can just return the original value.
          return parseInt(v, 16);
        }

        if (v.length == 3) {
          // Three digit values seem to be padded by repeating the final digit.
          // e.g. 10f becomes 10ff.
          v = v + v.substr(2);
        }

        // Scale down the 2 byte value.
        return Math.round(parseInt(v, 16) / 257);
      }

      var ary = v.match(colors.re_.x11rgb);
      if (!ary)
        return colors.nameToRGB(v);

      ary.splice(0, 1);
      return colors.arrayToRGBA(ary.map(scale));
    };

    /**
     * Converts one or more CSS '#RRGGBB' color values into their rgb(...)
     * form.
     *
     * Arrays are converted in place. If a value cannot be converted, it is
     * replaced with null.
     *
     * @param {string|Array.<string>} A single RGB value or array of RGB values to
     *     convert.
     * @return {string|Array.<string>} The converted value or values.
     */
    colors.hexToRGB = function(arg) {
      function convert(hex) {
        var re = (hex.length == 4) ?
            colors.re_.hex16 : colors.re_.hex24;
        var ary = hex.match(re);
        if (!ary)
          return null;

        return 'rgb(' + parseInt(ary[1], 16) + ', ' +
            parseInt(ary[2], 16) + ', ' +
            parseInt(ary[3], 16) + ')';
      }

      if (arg instanceof Array) {
        for (var i = 0; i < arg.length; i++) {
          arg[i] = convert(arg[i]);
        }
      } else {
        arg = convert(arg);
      }

      return arg;
    };

    /**
     * Converts one or more CSS rgb(...) forms into their '#RRGGBB' color values.
     *
     * If given an rgba(...) form, the alpha field is thrown away.
     *
     * Arrays are converted in place. If a value cannot be converted, it is
     * replaced with null.
     *
     * @param {string|Array.<string>} A single rgb(...) value or array of rgb(...)
     *     values to convert.
     * @return {string|Array.<string>} The converted value or values.
     */
    colors.rgbToHex = function(arg) {
      function convert(rgb) {
        var ary = colors.crackRGB(rgb);
        return '#' + ((parseInt(ary[0]) << 16) |
                      (parseInt(ary[1]) <<  8) |
                      (parseInt(ary[2]) <<  0)).toString(16);
      }

      if (arg instanceof Array) {
        for (var i = 0; i < arg.length; i++) {
          arg[i] = convert(arg[i]);
        }
      } else {
        arg = convert(arg);
      }

      return arg;
    };

    /**
     * Take any valid css color definition and turn it into an rgb or rgba value.
     *
     * Returns null if the value could not be normalized.
     */
    colors.normalizeCSS = function(def) {
      if (def.substr(0, 1) == '#')
        return colors.hexToRGB(def);

      if (colors.re_.rgbx.test(def))
        return def;

      return colors.nameToRGB(def);
    };

    /**
     * Convert a 3 or 4 element array into an rgba(...) string.
     */
    colors.arrayToRGBA = function(ary) {
      var alpha = (ary.length > 3) ? ary[3] : 1;
      return 'rgba(' + ary[0] + ', ' + ary[1] + ', ' + ary[2] + ', ' + alpha + ')';
    };

    /**
     * Overwrite the alpha channel of an rgb/rgba color.
     */
    colors.setAlpha = function(rgb, alpha) {
      var ary = colors.crackRGB(rgb);
      ary[3] = alpha;
      return colors.arrayToRGBA(ary);
    };

    /**
     * Mix a percentage of a tint color into a base color.
     */
    colors.mix = function(base, tint, percent) {
      var ary1 = colors.crackRGB(base);
      var ary2 = colors.crackRGB(tint);

      for (var i = 0; i < 4; ++i) {
        var diff = ary1[i] - ary2[i];
        ary1[i] += diff * percent;
      }

      return colors.arrayToRGBA(ary1);
    };

    /**
     * Split an rgb/rgba color into an array of its components.
     *
     * On success, a 4 element array will be returned.  For rgb values, the alpha
     * will be set to 1.
     */
    colors.crackRGB = function(color) {
      var ary;

      if (color.substr(0, 4) == 'rgba') {
        ary = color.match(colors.re_.rgba);
        if (ary) {
          ary.shift();
          return ary;
        }
      } else {
        ary = color.match(colors.re_.rgb);
        if (ary) {
          ary.shift();
          ary.push(1);
          return ary;
        }
      }

      console.error('Couldn\'t crack: ' + color);
      return null;
    };

    /**
     * Convert an X11 color name into a CSS rgb(...) value.
     *
     * Names are stripped of spaces and converted to lowercase.  If the name is
     * unknown, null is returned.
     *
     * This list of color name to RGB mapping is derived from the stock X11
     * rgb.txt file.
     *
     * @param {string} name The color name to convert.
     * @return {string} The corresponding CSS rgb(...) value.
     */
    colors.nameToRGB = function(name) {
      if (name in colors.colorNames)
        return colors.colorNames[name];

      name = name.toLowerCase();
      if (name in colors.colorNames)
        return colors.colorNames[name];

      name = name.replace(/\s+/g, '');
      if (name in colors.colorNames)
        return colors.colorNames[name];

      return null;
    };

    /**
     * The stock color palette.
     */
    colors.stockColorPalette = colors.hexToRGB
      ([// The 'ANSI 16'...
        '#000000', '#CC0000', '#4E9A06', '#C4A000',
        '#3465A4', '#75507B', '#06989A', '#D3D7CF',
        '#555753', '#EF2929', '#00BA13', '#FCE94F',
        '#729FCF', '#F200CB', '#00B5BD', '#EEEEEC',

        // The 6x6 color cubes...
        '#000000', '#00005F', '#000087', '#0000AF', '#0000D7', '#0000FF',
        '#005F00', '#005F5F', '#005F87', '#005FAF', '#005FD7', '#005FFF',
        '#008700', '#00875F', '#008787', '#0087AF', '#0087D7', '#0087FF',
        '#00AF00', '#00AF5F', '#00AF87', '#00AFAF', '#00AFD7', '#00AFFF',
        '#00D700', '#00D75F', '#00D787', '#00D7AF', '#00D7D7', '#00D7FF',
        '#00FF00', '#00FF5F', '#00FF87', '#00FFAF', '#00FFD7', '#00FFFF',

        '#5F0000', '#5F005F', '#5F0087', '#5F00AF', '#5F00D7', '#5F00FF',
        '#5F5F00', '#5F5F5F', '#5F5F87', '#5F5FAF', '#5F5FD7', '#5F5FFF',
        '#5F8700', '#5F875F', '#5F8787', '#5F87AF', '#5F87D7', '#5F87FF',
        '#5FAF00', '#5FAF5F', '#5FAF87', '#5FAFAF', '#5FAFD7', '#5FAFFF',
        '#5FD700', '#5FD75F', '#5FD787', '#5FD7AF', '#5FD7D7', '#5FD7FF',
        '#5FFF00', '#5FFF5F', '#5FFF87', '#5FFFAF', '#5FFFD7', '#5FFFFF',

        '#870000', '#87005F', '#870087', '#8700AF', '#8700D7', '#8700FF',
        '#875F00', '#875F5F', '#875F87', '#875FAF', '#875FD7', '#875FFF',
        '#878700', '#87875F', '#878787', '#8787AF', '#8787D7', '#8787FF',
        '#87AF00', '#87AF5F', '#87AF87', '#87AFAF', '#87AFD7', '#87AFFF',
        '#87D700', '#87D75F', '#87D787', '#87D7AF', '#87D7D7', '#87D7FF',
        '#87FF00', '#87FF5F', '#87FF87', '#87FFAF', '#87FFD7', '#87FFFF',

        '#AF0000', '#AF005F', '#AF0087', '#AF00AF', '#AF00D7', '#AF00FF',
        '#AF5F00', '#AF5F5F', '#AF5F87', '#AF5FAF', '#AF5FD7', '#AF5FFF',
        '#AF8700', '#AF875F', '#AF8787', '#AF87AF', '#AF87D7', '#AF87FF',
        '#AFAF00', '#AFAF5F', '#AFAF87', '#AFAFAF', '#AFAFD7', '#AFAFFF',
        '#AFD700', '#AFD75F', '#AFD787', '#AFD7AF', '#AFD7D7', '#AFD7FF',
        '#AFFF00', '#AFFF5F', '#AFFF87', '#AFFFAF', '#AFFFD7', '#AFFFFF',

        '#D70000', '#D7005F', '#D70087', '#D700AF', '#D700D7', '#D700FF',
        '#D75F00', '#D75F5F', '#D75F87', '#D75FAF', '#D75FD7', '#D75FFF',
        '#D78700', '#D7875F', '#D78787', '#D787AF', '#D787D7', '#D787FF',
        '#D7AF00', '#D7AF5F', '#D7AF87', '#D7AFAF', '#D7AFD7', '#D7AFFF',
        '#D7D700', '#D7D75F', '#D7D787', '#D7D7AF', '#D7D7D7', '#D7D7FF',
        '#D7FF00', '#D7FF5F', '#D7FF87', '#D7FFAF', '#D7FFD7', '#D7FFFF',

        '#FF0000', '#FF005F', '#FF0087', '#FF00AF', '#FF00D7', '#FF00FF',
        '#FF5F00', '#FF5F5F', '#FF5F87', '#FF5FAF', '#FF5FD7', '#FF5FFF',
        '#FF8700', '#FF875F', '#FF8787', '#FF87AF', '#FF87D7', '#FF87FF',
        '#FFAF00', '#FFAF5F', '#FFAF87', '#FFAFAF', '#FFAFD7', '#FFAFFF',
        '#FFD700', '#FFD75F', '#FFD787', '#FFD7AF', '#FFD7D7', '#FFD7FF',
        '#FFFF00', '#FFFF5F', '#FFFF87', '#FFFFAF', '#FFFFD7', '#FFFFFF',

        // The greyscale ramp...
        '#080808', '#121212', '#1C1C1C', '#262626', '#303030', '#3A3A3A',
        '#444444', '#4E4E4E', '#585858', '#626262', '#6C6C6C', '#767676',
        '#808080', '#8A8A8A', '#949494', '#9E9E9E', '#A8A8A8', '#B2B2B2',
        '#BCBCBC', '#C6C6C6', '#D0D0D0', '#DADADA', '#E4E4E4', '#EEEEEE'
       ]);

    /**
     * The current color palette, possibly with user changes.
     */
    colors.colorPalette = colors.stockColorPalette;

    /**
     * Named colors according to the stock X11 rgb.txt file.
     */
    colors.colorNames = {
      'aliceblue': 'rgb(240, 248, 255)',
      'antiquewhite': 'rgb(250, 235, 215)',
      'antiquewhite1': 'rgb(255, 239, 219)',
      'antiquewhite2': 'rgb(238, 223, 204)',
      'antiquewhite3': 'rgb(205, 192, 176)',
      'antiquewhite4': 'rgb(139, 131, 120)',
      'aquamarine': 'rgb(127, 255, 212)',
      'aquamarine1': 'rgb(127, 255, 212)',
      'aquamarine2': 'rgb(118, 238, 198)',
      'aquamarine3': 'rgb(102, 205, 170)',
      'aquamarine4': 'rgb(69, 139, 116)',
      'azure': 'rgb(240, 255, 255)',
      'azure1': 'rgb(240, 255, 255)',
      'azure2': 'rgb(224, 238, 238)',
      'azure3': 'rgb(193, 205, 205)',
      'azure4': 'rgb(131, 139, 139)',
      'beige': 'rgb(245, 245, 220)',
      'bisque': 'rgb(255, 228, 196)',
      'bisque1': 'rgb(255, 228, 196)',
      'bisque2': 'rgb(238, 213, 183)',
      'bisque3': 'rgb(205, 183, 158)',
      'bisque4': 'rgb(139, 125, 107)',
      'black': 'rgb(0, 0, 0)',
      'blanchedalmond': 'rgb(255, 235, 205)',
      'blue': 'rgb(0, 0, 255)',
      'blue1': 'rgb(0, 0, 255)',
      'blue2': 'rgb(0, 0, 238)',
      'blue3': 'rgb(0, 0, 205)',
      'blue4': 'rgb(0, 0, 139)',
      'blueviolet': 'rgb(138, 43, 226)',
      'brown': 'rgb(165, 42, 42)',
      'brown1': 'rgb(255, 64, 64)',
      'brown2': 'rgb(238, 59, 59)',
      'brown3': 'rgb(205, 51, 51)',
      'brown4': 'rgb(139, 35, 35)',
      'burlywood': 'rgb(222, 184, 135)',
      'burlywood1': 'rgb(255, 211, 155)',
      'burlywood2': 'rgb(238, 197, 145)',
      'burlywood3': 'rgb(205, 170, 125)',
      'burlywood4': 'rgb(139, 115, 85)',
      'cadetblue': 'rgb(95, 158, 160)',
      'cadetblue1': 'rgb(152, 245, 255)',
      'cadetblue2': 'rgb(142, 229, 238)',
      'cadetblue3': 'rgb(122, 197, 205)',
      'cadetblue4': 'rgb(83, 134, 139)',
      'chartreuse': 'rgb(127, 255, 0)',
      'chartreuse1': 'rgb(127, 255, 0)',
      'chartreuse2': 'rgb(118, 238, 0)',
      'chartreuse3': 'rgb(102, 205, 0)',
      'chartreuse4': 'rgb(69, 139, 0)',
      'chocolate': 'rgb(210, 105, 30)',
      'chocolate1': 'rgb(255, 127, 36)',
      'chocolate2': 'rgb(238, 118, 33)',
      'chocolate3': 'rgb(205, 102, 29)',
      'chocolate4': 'rgb(139, 69, 19)',
      'coral': 'rgb(255, 127, 80)',
      'coral1': 'rgb(255, 114, 86)',
      'coral2': 'rgb(238, 106, 80)',
      'coral3': 'rgb(205, 91, 69)',
      'coral4': 'rgb(139, 62, 47)',
      'cornflowerblue': 'rgb(100, 149, 237)',
      'cornsilk': 'rgb(255, 248, 220)',
      'cornsilk1': 'rgb(255, 248, 220)',
      'cornsilk2': 'rgb(238, 232, 205)',
      'cornsilk3': 'rgb(205, 200, 177)',
      'cornsilk4': 'rgb(139, 136, 120)',
      'cyan': 'rgb(0, 255, 255)',
      'cyan1': 'rgb(0, 255, 255)',
      'cyan2': 'rgb(0, 238, 238)',
      'cyan3': 'rgb(0, 205, 205)',
      'cyan4': 'rgb(0, 139, 139)',
      'darkblue': 'rgb(0, 0, 139)',
      'darkcyan': 'rgb(0, 139, 139)',
      'darkgoldenrod': 'rgb(184, 134, 11)',
      'darkgoldenrod1': 'rgb(255, 185, 15)',
      'darkgoldenrod2': 'rgb(238, 173, 14)',
      'darkgoldenrod3': 'rgb(205, 149, 12)',
      'darkgoldenrod4': 'rgb(139, 101, 8)',
      'darkgray': 'rgb(169, 169, 169)',
      'darkgreen': 'rgb(0, 100, 0)',
      'darkgrey': 'rgb(169, 169, 169)',
      'darkkhaki': 'rgb(189, 183, 107)',
      'darkmagenta': 'rgb(139, 0, 139)',
      'darkolivegreen': 'rgb(85, 107, 47)',
      'darkolivegreen1': 'rgb(202, 255, 112)',
      'darkolivegreen2': 'rgb(188, 238, 104)',
      'darkolivegreen3': 'rgb(162, 205, 90)',
      'darkolivegreen4': 'rgb(110, 139, 61)',
      'darkorange': 'rgb(255, 140, 0)',
      'darkorange1': 'rgb(255, 127, 0)',
      'darkorange2': 'rgb(238, 118, 0)',
      'darkorange3': 'rgb(205, 102, 0)',
      'darkorange4': 'rgb(139, 69, 0)',
      'darkorchid': 'rgb(153, 50, 204)',
      'darkorchid1': 'rgb(191, 62, 255)',
      'darkorchid2': 'rgb(178, 58, 238)',
      'darkorchid3': 'rgb(154, 50, 205)',
      'darkorchid4': 'rgb(104, 34, 139)',
      'darkred': 'rgb(139, 0, 0)',
      'darksalmon': 'rgb(233, 150, 122)',
      'darkseagreen': 'rgb(143, 188, 143)',
      'darkseagreen1': 'rgb(193, 255, 193)',
      'darkseagreen2': 'rgb(180, 238, 180)',
      'darkseagreen3': 'rgb(155, 205, 155)',
      'darkseagreen4': 'rgb(105, 139, 105)',
      'darkslateblue': 'rgb(72, 61, 139)',
      'darkslategray': 'rgb(47, 79, 79)',
      'darkslategray1': 'rgb(151, 255, 255)',
      'darkslategray2': 'rgb(141, 238, 238)',
      'darkslategray3': 'rgb(121, 205, 205)',
      'darkslategray4': 'rgb(82, 139, 139)',
      'darkslategrey': 'rgb(47, 79, 79)',
      'darkturquoise': 'rgb(0, 206, 209)',
      'darkviolet': 'rgb(148, 0, 211)',
      'debianred': 'rgb(215, 7, 81)',
      'deeppink': 'rgb(255, 20, 147)',
      'deeppink1': 'rgb(255, 20, 147)',
      'deeppink2': 'rgb(238, 18, 137)',
      'deeppink3': 'rgb(205, 16, 118)',
      'deeppink4': 'rgb(139, 10, 80)',
      'deepskyblue': 'rgb(0, 191, 255)',
      'deepskyblue1': 'rgb(0, 191, 255)',
      'deepskyblue2': 'rgb(0, 178, 238)',
      'deepskyblue3': 'rgb(0, 154, 205)',
      'deepskyblue4': 'rgb(0, 104, 139)',
      'dimgray': 'rgb(105, 105, 105)',
      'dimgrey': 'rgb(105, 105, 105)',
      'dodgerblue': 'rgb(30, 144, 255)',
      'dodgerblue1': 'rgb(30, 144, 255)',
      'dodgerblue2': 'rgb(28, 134, 238)',
      'dodgerblue3': 'rgb(24, 116, 205)',
      'dodgerblue4': 'rgb(16, 78, 139)',
      'firebrick': 'rgb(178, 34, 34)',
      'firebrick1': 'rgb(255, 48, 48)',
      'firebrick2': 'rgb(238, 44, 44)',
      'firebrick3': 'rgb(205, 38, 38)',
      'firebrick4': 'rgb(139, 26, 26)',
      'floralwhite': 'rgb(255, 250, 240)',
      'forestgreen': 'rgb(34, 139, 34)',
      'gainsboro': 'rgb(220, 220, 220)',
      'ghostwhite': 'rgb(248, 248, 255)',
      'gold': 'rgb(255, 215, 0)',
      'gold1': 'rgb(255, 215, 0)',
      'gold2': 'rgb(238, 201, 0)',
      'gold3': 'rgb(205, 173, 0)',
      'gold4': 'rgb(139, 117, 0)',
      'goldenrod': 'rgb(218, 165, 32)',
      'goldenrod1': 'rgb(255, 193, 37)',
      'goldenrod2': 'rgb(238, 180, 34)',
      'goldenrod3': 'rgb(205, 155, 29)',
      'goldenrod4': 'rgb(139, 105, 20)',
      'gray': 'rgb(190, 190, 190)',
      'gray0': 'rgb(0, 0, 0)',
      'gray1': 'rgb(3, 3, 3)',
      'gray10': 'rgb(26, 26, 26)',
      'gray100': 'rgb(255, 255, 255)',
      'gray11': 'rgb(28, 28, 28)',
      'gray12': 'rgb(31, 31, 31)',
      'gray13': 'rgb(33, 33, 33)',
      'gray14': 'rgb(36, 36, 36)',
      'gray15': 'rgb(38, 38, 38)',
      'gray16': 'rgb(41, 41, 41)',
      'gray17': 'rgb(43, 43, 43)',
      'gray18': 'rgb(46, 46, 46)',
      'gray19': 'rgb(48, 48, 48)',
      'gray2': 'rgb(5, 5, 5)',
      'gray20': 'rgb(51, 51, 51)',
      'gray21': 'rgb(54, 54, 54)',
      'gray22': 'rgb(56, 56, 56)',
      'gray23': 'rgb(59, 59, 59)',
      'gray24': 'rgb(61, 61, 61)',
      'gray25': 'rgb(64, 64, 64)',
      'gray26': 'rgb(66, 66, 66)',
      'gray27': 'rgb(69, 69, 69)',
      'gray28': 'rgb(71, 71, 71)',
      'gray29': 'rgb(74, 74, 74)',
      'gray3': 'rgb(8, 8, 8)',
      'gray30': 'rgb(77, 77, 77)',
      'gray31': 'rgb(79, 79, 79)',
      'gray32': 'rgb(82, 82, 82)',
      'gray33': 'rgb(84, 84, 84)',
      'gray34': 'rgb(87, 87, 87)',
      'gray35': 'rgb(89, 89, 89)',
      'gray36': 'rgb(92, 92, 92)',
      'gray37': 'rgb(94, 94, 94)',
      'gray38': 'rgb(97, 97, 97)',
      'gray39': 'rgb(99, 99, 99)',
      'gray4': 'rgb(10, 10, 10)',
      'gray40': 'rgb(102, 102, 102)',
      'gray41': 'rgb(105, 105, 105)',
      'gray42': 'rgb(107, 107, 107)',
      'gray43': 'rgb(110, 110, 110)',
      'gray44': 'rgb(112, 112, 112)',
      'gray45': 'rgb(115, 115, 115)',
      'gray46': 'rgb(117, 117, 117)',
      'gray47': 'rgb(120, 120, 120)',
      'gray48': 'rgb(122, 122, 122)',
      'gray49': 'rgb(125, 125, 125)',
      'gray5': 'rgb(13, 13, 13)',
      'gray50': 'rgb(127, 127, 127)',
      'gray51': 'rgb(130, 130, 130)',
      'gray52': 'rgb(133, 133, 133)',
      'gray53': 'rgb(135, 135, 135)',
      'gray54': 'rgb(138, 138, 138)',
      'gray55': 'rgb(140, 140, 140)',
      'gray56': 'rgb(143, 143, 143)',
      'gray57': 'rgb(145, 145, 145)',
      'gray58': 'rgb(148, 148, 148)',
      'gray59': 'rgb(150, 150, 150)',
      'gray6': 'rgb(15, 15, 15)',
      'gray60': 'rgb(153, 153, 153)',
      'gray61': 'rgb(156, 156, 156)',
      'gray62': 'rgb(158, 158, 158)',
      'gray63': 'rgb(161, 161, 161)',
      'gray64': 'rgb(163, 163, 163)',
      'gray65': 'rgb(166, 166, 166)',
      'gray66': 'rgb(168, 168, 168)',
      'gray67': 'rgb(171, 171, 171)',
      'gray68': 'rgb(173, 173, 173)',
      'gray69': 'rgb(176, 176, 176)',
      'gray7': 'rgb(18, 18, 18)',
      'gray70': 'rgb(179, 179, 179)',
      'gray71': 'rgb(181, 181, 181)',
      'gray72': 'rgb(184, 184, 184)',
      'gray73': 'rgb(186, 186, 186)',
      'gray74': 'rgb(189, 189, 189)',
      'gray75': 'rgb(191, 191, 191)',
      'gray76': 'rgb(194, 194, 194)',
      'gray77': 'rgb(196, 196, 196)',
      'gray78': 'rgb(199, 199, 199)',
      'gray79': 'rgb(201, 201, 201)',
      'gray8': 'rgb(20, 20, 20)',
      'gray80': 'rgb(204, 204, 204)',
      'gray81': 'rgb(207, 207, 207)',
      'gray82': 'rgb(209, 209, 209)',
      'gray83': 'rgb(212, 212, 212)',
      'gray84': 'rgb(214, 214, 214)',
      'gray85': 'rgb(217, 217, 217)',
      'gray86': 'rgb(219, 219, 219)',
      'gray87': 'rgb(222, 222, 222)',
      'gray88': 'rgb(224, 224, 224)',
      'gray89': 'rgb(227, 227, 227)',
      'gray9': 'rgb(23, 23, 23)',
      'gray90': 'rgb(229, 229, 229)',
      'gray91': 'rgb(232, 232, 232)',
      'gray92': 'rgb(235, 235, 235)',
      'gray93': 'rgb(237, 237, 237)',
      'gray94': 'rgb(240, 240, 240)',
      'gray95': 'rgb(242, 242, 242)',
      'gray96': 'rgb(245, 245, 245)',
      'gray97': 'rgb(247, 247, 247)',
      'gray98': 'rgb(250, 250, 250)',
      'gray99': 'rgb(252, 252, 252)',
      'green': 'rgb(0, 255, 0)',
      'green1': 'rgb(0, 255, 0)',
      'green2': 'rgb(0, 238, 0)',
      'green3': 'rgb(0, 205, 0)',
      'green4': 'rgb(0, 139, 0)',
      'greenyellow': 'rgb(173, 255, 47)',
      'grey': 'rgb(190, 190, 190)',
      'grey0': 'rgb(0, 0, 0)',
      'grey1': 'rgb(3, 3, 3)',
      'grey10': 'rgb(26, 26, 26)',
      'grey100': 'rgb(255, 255, 255)',
      'grey11': 'rgb(28, 28, 28)',
      'grey12': 'rgb(31, 31, 31)',
      'grey13': 'rgb(33, 33, 33)',
      'grey14': 'rgb(36, 36, 36)',
      'grey15': 'rgb(38, 38, 38)',
      'grey16': 'rgb(41, 41, 41)',
      'grey17': 'rgb(43, 43, 43)',
      'grey18': 'rgb(46, 46, 46)',
      'grey19': 'rgb(48, 48, 48)',
      'grey2': 'rgb(5, 5, 5)',
      'grey20': 'rgb(51, 51, 51)',
      'grey21': 'rgb(54, 54, 54)',
      'grey22': 'rgb(56, 56, 56)',
      'grey23': 'rgb(59, 59, 59)',
      'grey24': 'rgb(61, 61, 61)',
      'grey25': 'rgb(64, 64, 64)',
      'grey26': 'rgb(66, 66, 66)',
      'grey27': 'rgb(69, 69, 69)',
      'grey28': 'rgb(71, 71, 71)',
      'grey29': 'rgb(74, 74, 74)',
      'grey3': 'rgb(8, 8, 8)',
      'grey30': 'rgb(77, 77, 77)',
      'grey31': 'rgb(79, 79, 79)',
      'grey32': 'rgb(82, 82, 82)',
      'grey33': 'rgb(84, 84, 84)',
      'grey34': 'rgb(87, 87, 87)',
      'grey35': 'rgb(89, 89, 89)',
      'grey36': 'rgb(92, 92, 92)',
      'grey37': 'rgb(94, 94, 94)',
      'grey38': 'rgb(97, 97, 97)',
      'grey39': 'rgb(99, 99, 99)',
      'grey4': 'rgb(10, 10, 10)',
      'grey40': 'rgb(102, 102, 102)',
      'grey41': 'rgb(105, 105, 105)',
      'grey42': 'rgb(107, 107, 107)',
      'grey43': 'rgb(110, 110, 110)',
      'grey44': 'rgb(112, 112, 112)',
      'grey45': 'rgb(115, 115, 115)',
      'grey46': 'rgb(117, 117, 117)',
      'grey47': 'rgb(120, 120, 120)',
      'grey48': 'rgb(122, 122, 122)',
      'grey49': 'rgb(125, 125, 125)',
      'grey5': 'rgb(13, 13, 13)',
      'grey50': 'rgb(127, 127, 127)',
      'grey51': 'rgb(130, 130, 130)',
      'grey52': 'rgb(133, 133, 133)',
      'grey53': 'rgb(135, 135, 135)',
      'grey54': 'rgb(138, 138, 138)',
      'grey55': 'rgb(140, 140, 140)',
      'grey56': 'rgb(143, 143, 143)',
      'grey57': 'rgb(145, 145, 145)',
      'grey58': 'rgb(148, 148, 148)',
      'grey59': 'rgb(150, 150, 150)',
      'grey6': 'rgb(15, 15, 15)',
      'grey60': 'rgb(153, 153, 153)',
      'grey61': 'rgb(156, 156, 156)',
      'grey62': 'rgb(158, 158, 158)',
      'grey63': 'rgb(161, 161, 161)',
      'grey64': 'rgb(163, 163, 163)',
      'grey65': 'rgb(166, 166, 166)',
      'grey66': 'rgb(168, 168, 168)',
      'grey67': 'rgb(171, 171, 171)',
      'grey68': 'rgb(173, 173, 173)',
      'grey69': 'rgb(176, 176, 176)',
      'grey7': 'rgb(18, 18, 18)',
      'grey70': 'rgb(179, 179, 179)',
      'grey71': 'rgb(181, 181, 181)',
      'grey72': 'rgb(184, 184, 184)',
      'grey73': 'rgb(186, 186, 186)',
      'grey74': 'rgb(189, 189, 189)',
      'grey75': 'rgb(191, 191, 191)',
      'grey76': 'rgb(194, 194, 194)',
      'grey77': 'rgb(196, 196, 196)',
      'grey78': 'rgb(199, 199, 199)',
      'grey79': 'rgb(201, 201, 201)',
      'grey8': 'rgb(20, 20, 20)',
      'grey80': 'rgb(204, 204, 204)',
      'grey81': 'rgb(207, 207, 207)',
      'grey82': 'rgb(209, 209, 209)',
      'grey83': 'rgb(212, 212, 212)',
      'grey84': 'rgb(214, 214, 214)',
      'grey85': 'rgb(217, 217, 217)',
      'grey86': 'rgb(219, 219, 219)',
      'grey87': 'rgb(222, 222, 222)',
      'grey88': 'rgb(224, 224, 224)',
      'grey89': 'rgb(227, 227, 227)',
      'grey9': 'rgb(23, 23, 23)',
      'grey90': 'rgb(229, 229, 229)',
      'grey91': 'rgb(232, 232, 232)',
      'grey92': 'rgb(235, 235, 235)',
      'grey93': 'rgb(237, 237, 237)',
      'grey94': 'rgb(240, 240, 240)',
      'grey95': 'rgb(242, 242, 242)',
      'grey96': 'rgb(245, 245, 245)',
      'grey97': 'rgb(247, 247, 247)',
      'grey98': 'rgb(250, 250, 250)',
      'grey99': 'rgb(252, 252, 252)',
      'honeydew': 'rgb(240, 255, 240)',
      'honeydew1': 'rgb(240, 255, 240)',
      'honeydew2': 'rgb(224, 238, 224)',
      'honeydew3': 'rgb(193, 205, 193)',
      'honeydew4': 'rgb(131, 139, 131)',
      'hotpink': 'rgb(255, 105, 180)',
      'hotpink1': 'rgb(255, 110, 180)',
      'hotpink2': 'rgb(238, 106, 167)',
      'hotpink3': 'rgb(205, 96, 144)',
      'hotpink4': 'rgb(139, 58, 98)',
      'indianred': 'rgb(205, 92, 92)',
      'indianred1': 'rgb(255, 106, 106)',
      'indianred2': 'rgb(238, 99, 99)',
      'indianred3': 'rgb(205, 85, 85)',
      'indianred4': 'rgb(139, 58, 58)',
      'ivory': 'rgb(255, 255, 240)',
      'ivory1': 'rgb(255, 255, 240)',
      'ivory2': 'rgb(238, 238, 224)',
      'ivory3': 'rgb(205, 205, 193)',
      'ivory4': 'rgb(139, 139, 131)',
      'khaki': 'rgb(240, 230, 140)',
      'khaki1': 'rgb(255, 246, 143)',
      'khaki2': 'rgb(238, 230, 133)',
      'khaki3': 'rgb(205, 198, 115)',
      'khaki4': 'rgb(139, 134, 78)',
      'lavender': 'rgb(230, 230, 250)',
      'lavenderblush': 'rgb(255, 240, 245)',
      'lavenderblush1': 'rgb(255, 240, 245)',
      'lavenderblush2': 'rgb(238, 224, 229)',
      'lavenderblush3': 'rgb(205, 193, 197)',
      'lavenderblush4': 'rgb(139, 131, 134)',
      'lawngreen': 'rgb(124, 252, 0)',
      'lemonchiffon': 'rgb(255, 250, 205)',
      'lemonchiffon1': 'rgb(255, 250, 205)',
      'lemonchiffon2': 'rgb(238, 233, 191)',
      'lemonchiffon3': 'rgb(205, 201, 165)',
      'lemonchiffon4': 'rgb(139, 137, 112)',
      'lightblue': 'rgb(173, 216, 230)',
      'lightblue1': 'rgb(191, 239, 255)',
      'lightblue2': 'rgb(178, 223, 238)',
      'lightblue3': 'rgb(154, 192, 205)',
      'lightblue4': 'rgb(104, 131, 139)',
      'lightcoral': 'rgb(240, 128, 128)',
      'lightcyan': 'rgb(224, 255, 255)',
      'lightcyan1': 'rgb(224, 255, 255)',
      'lightcyan2': 'rgb(209, 238, 238)',
      'lightcyan3': 'rgb(180, 205, 205)',
      'lightcyan4': 'rgb(122, 139, 139)',
      'lightgoldenrod': 'rgb(238, 221, 130)',
      'lightgoldenrod1': 'rgb(255, 236, 139)',
      'lightgoldenrod2': 'rgb(238, 220, 130)',
      'lightgoldenrod3': 'rgb(205, 190, 112)',
      'lightgoldenrod4': 'rgb(139, 129, 76)',
      'lightgoldenrodyellow': 'rgb(250, 250, 210)',
      'lightgray': 'rgb(211, 211, 211)',
      'lightgreen': 'rgb(144, 238, 144)',
      'lightgrey': 'rgb(211, 211, 211)',
      'lightpink': 'rgb(255, 182, 193)',
      'lightpink1': 'rgb(255, 174, 185)',
      'lightpink2': 'rgb(238, 162, 173)',
      'lightpink3': 'rgb(205, 140, 149)',
      'lightpink4': 'rgb(139, 95, 101)',
      'lightsalmon': 'rgb(255, 160, 122)',
      'lightsalmon1': 'rgb(255, 160, 122)',
      'lightsalmon2': 'rgb(238, 149, 114)',
      'lightsalmon3': 'rgb(205, 129, 98)',
      'lightsalmon4': 'rgb(139, 87, 66)',
      'lightseagreen': 'rgb(32, 178, 170)',
      'lightskyblue': 'rgb(135, 206, 250)',
      'lightskyblue1': 'rgb(176, 226, 255)',
      'lightskyblue2': 'rgb(164, 211, 238)',
      'lightskyblue3': 'rgb(141, 182, 205)',
      'lightskyblue4': 'rgb(96, 123, 139)',
      'lightslateblue': 'rgb(132, 112, 255)',
      'lightslategray': 'rgb(119, 136, 153)',
      'lightslategrey': 'rgb(119, 136, 153)',
      'lightsteelblue': 'rgb(176, 196, 222)',
      'lightsteelblue1': 'rgb(202, 225, 255)',
      'lightsteelblue2': 'rgb(188, 210, 238)',
      'lightsteelblue3': 'rgb(162, 181, 205)',
      'lightsteelblue4': 'rgb(110, 123, 139)',
      'lightyellow': 'rgb(255, 255, 224)',
      'lightyellow1': 'rgb(255, 255, 224)',
      'lightyellow2': 'rgb(238, 238, 209)',
      'lightyellow3': 'rgb(205, 205, 180)',
      'lightyellow4': 'rgb(139, 139, 122)',
      'limegreen': 'rgb(50, 205, 50)',
      'linen': 'rgb(250, 240, 230)',
      'magenta': 'rgb(255, 0, 255)',
      'magenta1': 'rgb(255, 0, 255)',
      'magenta2': 'rgb(238, 0, 238)',
      'magenta3': 'rgb(205, 0, 205)',
      'magenta4': 'rgb(139, 0, 139)',
      'maroon': 'rgb(176, 48, 96)',
      'maroon1': 'rgb(255, 52, 179)',
      'maroon2': 'rgb(238, 48, 167)',
      'maroon3': 'rgb(205, 41, 144)',
      'maroon4': 'rgb(139, 28, 98)',
      'mediumaquamarine': 'rgb(102, 205, 170)',
      'mediumblue': 'rgb(0, 0, 205)',
      'mediumorchid': 'rgb(186, 85, 211)',
      'mediumorchid1': 'rgb(224, 102, 255)',
      'mediumorchid2': 'rgb(209, 95, 238)',
      'mediumorchid3': 'rgb(180, 82, 205)',
      'mediumorchid4': 'rgb(122, 55, 139)',
      'mediumpurple': 'rgb(147, 112, 219)',
      'mediumpurple1': 'rgb(171, 130, 255)',
      'mediumpurple2': 'rgb(159, 121, 238)',
      'mediumpurple3': 'rgb(137, 104, 205)',
      'mediumpurple4': 'rgb(93, 71, 139)',
      'mediumseagreen': 'rgb(60, 179, 113)',
      'mediumslateblue': 'rgb(123, 104, 238)',
      'mediumspringgreen': 'rgb(0, 250, 154)',
      'mediumturquoise': 'rgb(72, 209, 204)',
      'mediumvioletred': 'rgb(199, 21, 133)',
      'midnightblue': 'rgb(25, 25, 112)',
      'mintcream': 'rgb(245, 255, 250)',
      'mistyrose': 'rgb(255, 228, 225)',
      'mistyrose1': 'rgb(255, 228, 225)',
      'mistyrose2': 'rgb(238, 213, 210)',
      'mistyrose3': 'rgb(205, 183, 181)',
      'mistyrose4': 'rgb(139, 125, 123)',
      'moccasin': 'rgb(255, 228, 181)',
      'navajowhite': 'rgb(255, 222, 173)',
      'navajowhite1': 'rgb(255, 222, 173)',
      'navajowhite2': 'rgb(238, 207, 161)',
      'navajowhite3': 'rgb(205, 179, 139)',
      'navajowhite4': 'rgb(139, 121, 94)',
      'navy': 'rgb(0, 0, 128)',
      'navyblue': 'rgb(0, 0, 128)',
      'oldlace': 'rgb(253, 245, 230)',
      'olivedrab': 'rgb(107, 142, 35)',
      'olivedrab1': 'rgb(192, 255, 62)',
      'olivedrab2': 'rgb(179, 238, 58)',
      'olivedrab3': 'rgb(154, 205, 50)',
      'olivedrab4': 'rgb(105, 139, 34)',
      'orange': 'rgb(255, 165, 0)',
      'orange1': 'rgb(255, 165, 0)',
      'orange2': 'rgb(238, 154, 0)',
      'orange3': 'rgb(205, 133, 0)',
      'orange4': 'rgb(139, 90, 0)',
      'orangered': 'rgb(255, 69, 0)',
      'orangered1': 'rgb(255, 69, 0)',
      'orangered2': 'rgb(238, 64, 0)',
      'orangered3': 'rgb(205, 55, 0)',
      'orangered4': 'rgb(139, 37, 0)',
      'orchid': 'rgb(218, 112, 214)',
      'orchid1': 'rgb(255, 131, 250)',
      'orchid2': 'rgb(238, 122, 233)',
      'orchid3': 'rgb(205, 105, 201)',
      'orchid4': 'rgb(139, 71, 137)',
      'palegoldenrod': 'rgb(238, 232, 170)',
      'palegreen': 'rgb(152, 251, 152)',
      'palegreen1': 'rgb(154, 255, 154)',
      'palegreen2': 'rgb(144, 238, 144)',
      'palegreen3': 'rgb(124, 205, 124)',
      'palegreen4': 'rgb(84, 139, 84)',
      'paleturquoise': 'rgb(175, 238, 238)',
      'paleturquoise1': 'rgb(187, 255, 255)',
      'paleturquoise2': 'rgb(174, 238, 238)',
      'paleturquoise3': 'rgb(150, 205, 205)',
      'paleturquoise4': 'rgb(102, 139, 139)',
      'palevioletred': 'rgb(219, 112, 147)',
      'palevioletred1': 'rgb(255, 130, 171)',
      'palevioletred2': 'rgb(238, 121, 159)',
      'palevioletred3': 'rgb(205, 104, 137)',
      'palevioletred4': 'rgb(139, 71, 93)',
      'papayawhip': 'rgb(255, 239, 213)',
      'peachpuff': 'rgb(255, 218, 185)',
      'peachpuff1': 'rgb(255, 218, 185)',
      'peachpuff2': 'rgb(238, 203, 173)',
      'peachpuff3': 'rgb(205, 175, 149)',
      'peachpuff4': 'rgb(139, 119, 101)',
      'peru': 'rgb(205, 133, 63)',
      'pink': 'rgb(255, 192, 203)',
      'pink1': 'rgb(255, 181, 197)',
      'pink2': 'rgb(238, 169, 184)',
      'pink3': 'rgb(205, 145, 158)',
      'pink4': 'rgb(139, 99, 108)',
      'plum': 'rgb(221, 160, 221)',
      'plum1': 'rgb(255, 187, 255)',
      'plum2': 'rgb(238, 174, 238)',
      'plum3': 'rgb(205, 150, 205)',
      'plum4': 'rgb(139, 102, 139)',
      'powderblue': 'rgb(176, 224, 230)',
      'purple': 'rgb(160, 32, 240)',
      'purple1': 'rgb(155, 48, 255)',
      'purple2': 'rgb(145, 44, 238)',
      'purple3': 'rgb(125, 38, 205)',
      'purple4': 'rgb(85, 26, 139)',
      'red': 'rgb(255, 0, 0)',
      'red1': 'rgb(255, 0, 0)',
      'red2': 'rgb(238, 0, 0)',
      'red3': 'rgb(205, 0, 0)',
      'red4': 'rgb(139, 0, 0)',
      'rosybrown': 'rgb(188, 143, 143)',
      'rosybrown1': 'rgb(255, 193, 193)',
      'rosybrown2': 'rgb(238, 180, 180)',
      'rosybrown3': 'rgb(205, 155, 155)',
      'rosybrown4': 'rgb(139, 105, 105)',
      'royalblue': 'rgb(65, 105, 225)',
      'royalblue1': 'rgb(72, 118, 255)',
      'royalblue2': 'rgb(67, 110, 238)',
      'royalblue3': 'rgb(58, 95, 205)',
      'royalblue4': 'rgb(39, 64, 139)',
      'saddlebrown': 'rgb(139, 69, 19)',
      'salmon': 'rgb(250, 128, 114)',
      'salmon1': 'rgb(255, 140, 105)',
      'salmon2': 'rgb(238, 130, 98)',
      'salmon3': 'rgb(205, 112, 84)',
      'salmon4': 'rgb(139, 76, 57)',
      'sandybrown': 'rgb(244, 164, 96)',
      'seagreen': 'rgb(46, 139, 87)',
      'seagreen1': 'rgb(84, 255, 159)',
      'seagreen2': 'rgb(78, 238, 148)',
      'seagreen3': 'rgb(67, 205, 128)',
      'seagreen4': 'rgb(46, 139, 87)',
      'seashell': 'rgb(255, 245, 238)',
      'seashell1': 'rgb(255, 245, 238)',
      'seashell2': 'rgb(238, 229, 222)',
      'seashell3': 'rgb(205, 197, 191)',
      'seashell4': 'rgb(139, 134, 130)',
      'sienna': 'rgb(160, 82, 45)',
      'sienna1': 'rgb(255, 130, 71)',
      'sienna2': 'rgb(238, 121, 66)',
      'sienna3': 'rgb(205, 104, 57)',
      'sienna4': 'rgb(139, 71, 38)',
      'skyblue': 'rgb(135, 206, 235)',
      'skyblue1': 'rgb(135, 206, 255)',
      'skyblue2': 'rgb(126, 192, 238)',
      'skyblue3': 'rgb(108, 166, 205)',
      'skyblue4': 'rgb(74, 112, 139)',
      'slateblue': 'rgb(106, 90, 205)',
      'slateblue1': 'rgb(131, 111, 255)',
      'slateblue2': 'rgb(122, 103, 238)',
      'slateblue3': 'rgb(105, 89, 205)',
      'slateblue4': 'rgb(71, 60, 139)',
      'slategray': 'rgb(112, 128, 144)',
      'slategray1': 'rgb(198, 226, 255)',
      'slategray2': 'rgb(185, 211, 238)',
      'slategray3': 'rgb(159, 182, 205)',
      'slategray4': 'rgb(108, 123, 139)',
      'slategrey': 'rgb(112, 128, 144)',
      'snow': 'rgb(255, 250, 250)',
      'snow1': 'rgb(255, 250, 250)',
      'snow2': 'rgb(238, 233, 233)',
      'snow3': 'rgb(205, 201, 201)',
      'snow4': 'rgb(139, 137, 137)',
      'springgreen': 'rgb(0, 255, 127)',
      'springgreen1': 'rgb(0, 255, 127)',
      'springgreen2': 'rgb(0, 238, 118)',
      'springgreen3': 'rgb(0, 205, 102)',
      'springgreen4': 'rgb(0, 139, 69)',
      'steelblue': 'rgb(70, 130, 180)',
      'steelblue1': 'rgb(99, 184, 255)',
      'steelblue2': 'rgb(92, 172, 238)',
      'steelblue3': 'rgb(79, 148, 205)',
      'steelblue4': 'rgb(54, 100, 139)',
      'tan': 'rgb(210, 180, 140)',
      'tan1': 'rgb(255, 165, 79)',
      'tan2': 'rgb(238, 154, 73)',
      'tan3': 'rgb(205, 133, 63)',
      'tan4': 'rgb(139, 90, 43)',
      'thistle': 'rgb(216, 191, 216)',
      'thistle1': 'rgb(255, 225, 255)',
      'thistle2': 'rgb(238, 210, 238)',
      'thistle3': 'rgb(205, 181, 205)',
      'thistle4': 'rgb(139, 123, 139)',
      'tomato': 'rgb(255, 99, 71)',
      'tomato1': 'rgb(255, 99, 71)',
      'tomato2': 'rgb(238, 92, 66)',
      'tomato3': 'rgb(205, 79, 57)',
      'tomato4': 'rgb(139, 54, 38)',
      'turquoise': 'rgb(64, 224, 208)',
      'turquoise1': 'rgb(0, 245, 255)',
      'turquoise2': 'rgb(0, 229, 238)',
      'turquoise3': 'rgb(0, 197, 205)',
      'turquoise4': 'rgb(0, 134, 139)',
      'violet': 'rgb(238, 130, 238)',
      'violetred': 'rgb(208, 32, 144)',
      'violetred1': 'rgb(255, 62, 150)',
      'violetred2': 'rgb(238, 58, 140)',
      'violetred3': 'rgb(205, 50, 120)',
      'violetred4': 'rgb(139, 34, 82)',
      'wheat': 'rgb(245, 222, 179)',
      'wheat1': 'rgb(255, 231, 186)',
      'wheat2': 'rgb(238, 216, 174)',
      'wheat3': 'rgb(205, 186, 150)',
      'wheat4': 'rgb(139, 126, 102)',
      'white': 'rgb(255, 255, 255)',
      'whitesmoke': 'rgb(245, 245, 245)',
      'yellow': 'rgb(255, 255, 0)',
      'yellow1': 'rgb(255, 255, 0)',
      'yellow2': 'rgb(238, 238, 0)',
      'yellow3': 'rgb(205, 205, 0)',
      'yellow4': 'rgb(139, 139, 0)',
      'yellowgreen': 'rgb(154, 205, 50)'
    };
  });
define("hterm/util/dom", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var dom = {};
    __exports__.dom = dom;__exports__["default"] = dom;

    /**
     * Return decimal { width, height } for a given dom node.
     */
    dom.getClientSize = function(elem) {
      return elem.getBoundingClientRect();
    };

    /**
     * Return decimal width for a given dom node.
     */
    dom.getClientWidth = function(elem) {
      return elem.getBoundingClientRect().width;
    };

    /**
     * Return decimal height for a given dom node.
     */
    dom.getClientHeight = function(elem) {
      return elem.getBoundingClientRect().height;
    };

    /**
     * Copy the current selection to the system clipboard.
     *
     * @param {HTMLDocument} The document with the selection to copy.
     */
    dom.copySelectionToClipboard = function(document) {
      try {
        document.execCommand('copy');
      } catch (firefoxException) {
        // Ignore this. FF throws an exception if there was an error, even though
        // the spec says just return false.
      }
    };

    /**
     * Paste the system clipboard into the element with focus.
     *
     * @param {HTMLDocument} The document to paste into.
     */
    dom.pasteFromClipboard = function(document) {
      try {
        document.execCommand('paste');
      } catch (firefoxException) {
        // Ignore this. FF throws an exception if there was an error, even though
        // the spec says just return false.
      }
    };
  });
define("hterm/util/f", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    /**
     * Grab bag of utility functions.
     */
    var f = {};
    __exports__.f = f;__exports__["default"] = f;

    /**
     * Get the list of accepted UI languages.
     *
     * @param {function(Array)} callback Function to invoke with the results.  The
     *     parameter is a list of locale names.
     */
    f.getAcceptLanguages = function(callback) {
      if (window.chrome && window.chrome.i18n) {
        window.chrome.i18n.getAcceptLanguages(callback);
      } else {
        setTimeout(function() {
            callback([navigator.language.replace(/-/g, '_')]);
          }, 0);
      }
    };

    /**
     * Parse a query string into a hash.
     *
     * This takes a url query string in the form 'name1=value&name2=value' and
     * converts it into an object of the form { name1: 'value', name2: 'value' }.
     * If a given name appears multiple times in the query string, only the
     * last value will appear in the result.
     *
     * Names and values are passed through decodeURIComponent before being added
     * to the result object.
     *
     * @param {string} queryString The string to parse.  If it starts with a
     *     leading '?', the '?' will be ignored.
     */
    f.parseQuery = function(queryString) {
      if (queryString.substr(0, 1) == '?')
        queryString = queryString.substr(1);

      var rv = {};

      var pairs = queryString.split('&');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        rv[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }

      return rv;
    };

    /**
     * Clamp a given integer to a specified range.
     *
     * @param {integer} v The value to be clamped.
     * @param {integer} min The minimum acceptable value.
     * @param {integer} max The maximum acceptable value.
     */
    f.clamp = function(v, min, max) {
      if (v < min)
        return min;
      if (v > max)
        return max;
      return v;
    };

     /**
     * Ensure that a function is called within a certain time limit.
     *
     * Simple usage looks like this...
     *
     *  asyncWithOneCallback(f.alarm(myCallback));
     *
     * This will log a warning to the console if onInit() is not invoked within
     * 5 seconds.
     *
     * If you're performing some operation that may take longer than 5 seconds you
     * can pass a duration in milliseconds as the optional second parameter.
     *
     * If you pass a string identifier instead of a callback function, you'll get a
     * wrapper generator rather than a single wrapper.  Each call to the
     * generator will return a wrapped version of the callback wired to
     * a shared timeout.  This is for cases where you want to ensure that at least
     * one of a set of callbacks is invoked before a timeout expires.
     *
     *   var alarm = f.alarm('fetch object');
     *   asyncWithTwoCallbacks(alarm(onSuccess), alarm(onFailure));
     *
     * @param {function(*)} callback The function to wrap in an alarm.
     * @param {int} opt_ms Optional number of milliseconds to wait before raising
     *     an alarm.  Default is 5000 (5 seconds).
     * @return {function} If callback is a function then the return value will be
     *     the wrapped callback.  If callback is a string then the return value will
     *     be a function that generates new wrapped callbacks.
     */
    f.alarm = function(callback, opt_ms) {
      var ms = opt_ms || 5 * 1000;
      var stack = f.getStack(1);

      return (function() {
        // This outer function is called immediately.  It's here to capture a new
        // scope for the timeout variable.

        // The 'timeout' variable is shared by this timeout function, and the
        // callback wrapper.
        var timeout = setTimeout(function() {
          var name = (typeof callback == 'string') ? name : callback.name;
          name = name ? (': ' + name) : '';
          console.warn('f.alarm: timeout expired: ' + (ms / 1000) + 's' + name);
          console.log(stack);
          timeout = null;
        }, ms);

        var wrapperGenerator = function(callback) {
          return function() {
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }

            return callback.apply(null, arguments);
          };
        };

        if (typeof callback == 'string')
          return wrapperGenerator;

        return wrapperGenerator(callback);
      })();
    };

    /**
     * Return the current call stack after skipping a given number of frames.
     *
     * This method is intended to be used for debugging only.  It returns an
     * Object instead of an Array, because the console stringifies arrays by
     * default and that's not what we want.
     *
     * A typical call might look like...
     *
     *    console.log('Something wicked this way came', f.getStack());
     *    //                         Notice the comma ^
     *
     * This would print the message to the js console, followed by an object
     * which can be clicked to reveal the stack.
     *
     * @param {number} opt_ignoreFrames The optional number of stack frames to
     *     ignore.  The actual 'getStack' call is always ignored.
     */
    f.getStack = function(opt_ignoreFrames) {
      var ignoreFrames = opt_ignoreFrames ? opt_ignoreFrames + 2 : 2;

      var stackArray;

      try {
        throw new Error();
      } catch (ex) {
        stackArray = ex.stack.split('\n');
      }

      var stackObject = {};
      for (var i = ignoreFrames; i < stackArray.length; i++) {
        stackObject[i - ignoreFrames] = stackArray[i].replace(/^\s*at\s+/, '');
      }

      return stackObject;
    };
  });
define("hterm/util/pubsub", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    /**
     * Utility class used to add publish/subscribe/unsubscribe functionality to
     * an existing object.
     */
    var PubSub = function() {
      this.observers_ = {};
    };
    __exports__.PubSub = PubSub;
    __exports__["default"] = PubSub;

    /**
     * Add publish, subscribe, and unsubscribe methods to an existing object.
     *
     * No other properties of the object are touched, so there is no need to
     * worry about clashing private properties.
     *
     * @param {Object} obj The object to add this behavior to.
     */
    PubSub.addBehavior = function(obj) {
      var pubsub = new PubSub();
      for (var m in PubSub.prototype) {
        obj[m] = PubSub.prototype[m].bind(pubsub);
      }
    };

    /**
     * Subscribe to be notified of messages about a subject.
     *
     * @param {string} subject The subject to subscribe to.
     * @param {function(Object)} callback The function to invoke for notifications.
     */
    PubSub.prototype.subscribe = function(subject, callback) {
      if (!(subject in this.observers_))
        this.observers_[subject] = [];

      this.observers_[subject].push(callback);
    };

    /**
     * Unsubscribe from a subject.
     *
     * @param {string} subject The subject to unsubscribe from.
     * @param {function(Object)} callback A callback previously registered via
     *     subscribe().
     */
    PubSub.prototype.unsubscribe = function(subject, callback) {
      var list = this.observers_[subject];
      if (!list)
        throw 'Invalid subject: ' + subject;

      var i = list.indexOf(callback);
      if (i < 0)
        throw 'Not subscribed: ' + subject;

      list.splice(i, 1);
    };

    /**
     * Publish a message about a subject.
     *
     * Subscribers (and the optional final callback) are invoked asynchronously.
     * This method will return before anyone is actually notified.
     *
     * @param {string} subject The subject to publish about.
     * @param {Object} e An arbitrary object associated with this notification.
     * @param {function(Object)} opt_lastCallback An optional function to call after
     *     all subscribers have been notified.
     */
    PubSub.prototype.publish = function(subject, e, opt_lastCallback) {
      function notifyList(i) {
        // Set this timeout before invoking the callback, so we don't have to
        // concern ourselves with exceptions.
        if (i < list.length - 1)
          setTimeout(notifyList, 0, i + 1);

        list[i](e);
      }

      var list = this.observers_[subject];
      if (list) {
        // Copy the list, in case it changes while we're notifying.
        list = [].concat(list);
      }

      if (opt_lastCallback) {
        if (list) {
          list.push(opt_lastCallback);
        } else {
          list = [opt_lastCallback];
        }
      }

      if (list)
        setTimeout(notifyList, 0, 0);
    };
  });
define("hterm/util/string", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // Copyright (c) 2014 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var string = {};
    __exports__.string = string;__exports__["default"] = string;

    /**
     * Replace variable references in a string.
     *
     * Variables are of the form %FUNCTION(VARNAME).  FUNCTION is an optional
     * escape function to apply to the value.
     *
     * For example
     *   string.replaceVars("%(greeting), %encodeURIComponent(name)",
     *                      { greeting: "Hello",
     *                        name: "Google+" });
     *
     * Will result in "Hello, Google%2B".
     */
    string.replaceVars = function(str, vars) {
      return str.replace(/%([a-z]*)\(([^\)]+)\)/gi, function(match, fn, varname) {
          if (typeof vars[varname] == 'undefined')
            throw 'Unknown variable: ' + varname;

          var rv = vars[varname];

          if (fn in string.replaceVars.functions) {
            rv = string.replaceVars.functions[fn](rv);
          } else if (fn) {
            throw 'Unknown escape function: ' + fn;
          }

          return rv;
        });
    };

    /**
     * Functions that can be used with replaceVars.
     *
     * Clients can add to this list to extend string.replaceVars().
     */
    string.replaceVars.functions = {
      encodeURI: encodeURI,
      encodeURIComponent: encodeURIComponent,
      escapeHTML: function(str) {
        var map = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          '\'': '&#39;'
        };

        return str.replace(/[<>&\"\']/g, function(m) { return map[m] });
      }
    };

    /**
     * Left pad a string to a given length using a given character.
     *
     * @param {string} str The string to pad.
     * @param {integer} length The desired length.
     * @param {string} opt_ch The optional padding character, defaults to ' '.
     * @return {string} The padded string.
     */
    string.lpad = function(str, length, opt_ch) {
      str = String(str);
      opt_ch = opt_ch || ' ';

      while (str.length < length)
        str = opt_ch + str;

      return str;
    };

    /**
     * Left pad a number to a given length with leading zeros.
     *
     * @param {string|integer} number The number to pad.
     * @param {integer} length The desired length.
     * @return {string} The padded number as a string.
     */
    string.zpad = function(number, length) {
      return string.lpad(number, length, '0');
    };

    /**
     * Return a string containing a given number of space characters.
     *
     * This method maintains a static cache of the largest amount of whitespace
     * ever requested.  It shouldn't be used to generate an insanely huge amount of
     * whitespace.
     *
     * @param {integer} length The desired amount of whitespace.
     * @param {string} A string of spaces of the requested length.
     */
    string.getWhitespace = function(length) {
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
  });
define("hterm/vt", 
  ["hterm/i18n/utf8","hterm/util","hterm/struct/cursor_shape","hterm/character_map","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    // Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    var utf8 = __dependency1__["default"];
    var util = __dependency2__["default"];
    var cursorShape = __dependency3__["default"];

    var CharacterMap = __dependency4__["default"];

    /**
     * Constructor for the VT escape sequence interpreter.
     *
     * The interpreter operates on a terminal object capable of performing cursor
     * move operations, painting characters, etc.
     *
     * This interpreter is intended to be compatible with xterm, though it
     * ignores some of the more esoteric escape sequences.
     *
     * Some sequences are marked "Will not implement", meaning that they aren't
     * considered relevant to hterm and will probably never be implemented.
     *
     * Others are marked "Not currently implemented", meaning that they are lower
     * priority items that may be useful to implement at some point.
     *
     * See also:
     *   [VT100] VT100 User Guide
     *           http://vt100.net/docs/vt100-ug/chapter3.html
     *   [VT510] VT510 Video Terminal Programmer Information
     *           http://vt100.net/docs/vt510-rm/contents
     *   [XTERM] Xterm Control Sequences
     *           http://invisible-island.net/xterm/ctlseqs/ctlseqs.html
     *   [CTRL]  Wikipedia: C0 and C1 Control Codes
     *           http://en.wikipedia.org/wiki/C0_and_C1_control_codes
     *   [CSI]   Wikipedia: ANSI Escape Code
     *           http://en.wikipedia.org/wiki/Control_Sequence_Introducer
     *   man 5 terminfo, man infocmp, infocmp -L xterm-new
     *
     * @param {Terminal} terminal Terminal to use with the interpreter.
     */
    var VT = function(terminal) {
      /**
       * The display terminal object associated with this virtual terminal.
       */
      this.terminal = terminal;

      terminal.onMouse = this.onTerminalMouse_.bind(this);
      this.mouseReport = this.MOUSE_REPORT_DISABLED;

      // Parse state left over from the last parse.  You should use the parseState
      // instance passed into your parse routine, rather than reading
      // this.parseState_ directly.
      this.parseState_ = new VT.ParseState(this.parseUnknown_);

      // Any "leading modifiers" for the escape sequence, such as '?', ' ', or the
      // other modifiers handled in this.parseCSI_.
      this.leadingModifier_ = '';

      // Any "trailing modifiers".  Same character set as a leading modifier,
      // except these are found after the numeric arguments.
      this.trailingModifier_ = '';

      // Whether or not to respect the escape codes for setting terminal width.
      this.allowColumnWidthChanges_ = false;

      // The amount of time we're willing to wait for the end of an OSC sequence.
      this.oscTimeLimit_ = 20000;

      // Construct a regular expression to match the known one-byte control chars.
      // This is used in parseUnknown_ to quickly scan a string for the next
      // control character.
      var cc1 = Object.keys(VT.CC1).map(
          function(e) {
            return '\\x' + util.string.zpad(e.charCodeAt().toString(16), 2);
          }).join('');
      this.cc1Pattern_ = new RegExp('[' + cc1 + ']');

      // Decoder to maintain UTF-8 decode state.
      this.utf8Decoder_ = new utf8.Decoder();

      /**
       * Whether to accept the 8-bit control characters.
       *
       * An 8-bit control character is one with the eighth bit set.  These
       * didn't work on 7-bit terminals so they all have two byte equivalents.
       * Most hosts still only use the two-byte versions.
       *
       * We ignore 8-bit control codes by default.  This is in order to avoid
       * issues with "accidental" usage of codes that need to be terminated.
       * The "accident" usually involves cat'ing binary data.
       */
      this.enable8BitControl = false;

      /**
       * Whether to allow the OSC 52 sequence to write to the system clipboard.
       */
      this.enableClipboardWrite = true;

      /**
       * Respect the host's attempt to change the cursor blink status using
       * the DEC Private mode 12.
       */
      this.enableDec12 = false;

      /**
       * The expected encoding method for data received from the host.
       */
      this.characterEncoding = 'utf-8';

      /**
       * Max length of an unterminated DCS, OSC, PM or APC sequence before we give
       * up and ignore the code.
       *
       * These all end with a String Terminator (ST, '\x9c', ESC '\\') or
       * (BEL, '\x07') character, hence the "string sequence" moniker.
       */
      this.maxStringSequence = terminal.config.get('max-string-sequence');

      /**
       * If true, emit warnings when we encounter a control character or escape
       * sequence that we don't recognize or explicitly ignore.
       */
      this.warnUnimplemented = true;

      /**
       * The default G0...G3 character maps.
       */
      this.G0 = CharacterMap.maps['B'];
      this.G1 = CharacterMap.maps['0'];
      this.G2 = CharacterMap.maps['B'];
      this.G3 = CharacterMap.maps['B'];

      /**
       * The 7-bit visible character set.
       *
       * This is a mapping from inbound data to display glyph.  The GL set
       * contains the 94 bytes from 0x21 to 0x7e.
       *
       * The default GL set is 'B', US ASCII.
       */
      this.GL = 'G0';

      /**
       * The 8-bit visible character set.
       *
       * This is a mapping from inbound data to display glyph.  The GR set
       * contains the 94 bytes from 0xa1 to 0xfe.
       */
      this.GR = 'G0';

      // Saved state used in DECSC.
      //
      // This is a place to store a copy VT state, it is *not* the active state.
      this.savedState_ = new VT.CursorState(this);
    };
    __exports__.VT = VT;
    __exports__["default"] = VT;

    /**
     * No mouse events.
     */
    VT.prototype.MOUSE_REPORT_DISABLED = 0;

    /**
     * DECSET mode 1000.
     *
     * Report mouse down/up events only.
     */
    VT.prototype.MOUSE_REPORT_CLICK = 1;

    /**
     * DECSET mode 1002.
     *
     * Report mouse down/up and movement while a button is down.
     */
    VT.prototype.MOUSE_REPORT_DRAG = 3;

    /**
     * ParseState constructor.
     *
     * This object tracks the current state of the parse.  It has fields for the
     * current buffer, position in the buffer, and the parse function.
     *
     * @param {function} defaultFunc The default parser function.
     * @param {string} opt_buf Optional string to use as the current buffer.
     */
    VT.ParseState = function(defaultFunction, opt_buf) {
      this.defaultFunction = defaultFunction;
      this.buf = opt_buf || null;
      this.pos = 0;
      this.func = defaultFunction;
      this.args = [];
    };

    /**
     * Reset the parser function, buffer, and position.
     */
    VT.ParseState.prototype.reset = function(opt_buf) {
      this.resetParseFunction();
      this.resetBuf(opt_buf || '');
      this.resetArguments();
    };

    /**
     * Reset the parser function only.
     */
    VT.ParseState.prototype.resetParseFunction = function() {
      this.func = this.defaultFunction;
    };

    /**
     * Reset the buffer and position only.
     *
     * @param {string} buf Optional new value for buf, defaults to null.
     */
    VT.ParseState.prototype.resetBuf = function(opt_buf) {
      this.buf = (typeof opt_buf == 'string') ? opt_buf : null;
      this.pos = 0;
    };

    /**
     * Reset the arguments list only.
     *
     * @param {string} opt_arg_zero Optional initial value for args[0].
     */
    VT.ParseState.prototype.resetArguments = function(opt_arg_zero) {
      this.args.length = 0;
      if (typeof opt_arg_zero != 'undefined')
        this.args[0] = opt_arg_zero;
    };

    /**
     * Get an argument as an integer.
     *
     * @param {number} argnum The argument number to retreive.
     */
    VT.ParseState.prototype.iarg = function(argnum, defaultValue) {
      var str = this.args[argnum];
      if (str) {
        var ret = parseInt(str, 10);
        // An argument of zero is treated as the default value.
        if (ret === 0)
          ret = defaultValue;
        return ret;
      }
      return defaultValue;
    };

    /**
     * Advance the parse postion.
     *
     * @param {integer} count The number of bytes to advance.
     */
    VT.ParseState.prototype.advance = function(count) {
      this.pos += count;
    };

    /**
     * Return the remaining portion of the buffer without affecting the parse
     * position.
     *
     * @return {string} The remaining portion of the buffer.
     */
    VT.ParseState.prototype.peekRemainingBuf = function() {
      return this.buf.substr(this.pos);
    };

    /**
     * Return the next single character in the buffer without affecting the parse
     * position.
     *
     * @return {string} The next character in the buffer.
     */
    VT.ParseState.prototype.peekChar = function() {
      return this.buf.substr(this.pos, 1);
    };

    /**
     * Return the next single character in the buffer and advance the parse
     * position one byte.
     *
     * @return {string} The next character in the buffer.
     */
    VT.ParseState.prototype.consumeChar = function() {
      return this.buf.substr(this.pos++, 1);
    };

    /**
     * Return true if the buffer is empty, or the position is past the end.
     */
    VT.ParseState.prototype.isComplete = function() {
      return this.buf == null || this.buf.length <= this.pos;
    };

    VT.CursorState = function(vt) {
      this.vt_ = vt;
      this.save();
    };

    VT.CursorState.prototype.save = function() {
      this.cursor = this.vt_.terminal.saveCursor();

      this.textAttributes = this.vt_.terminal.getTextAttributes().clone();

      this.GL = this.vt_.GL;
      this.GR = this.vt_.GR;

      this.G0 = this.vt_.G0;
      this.G1 = this.vt_.G1;
      this.G2 = this.vt_.G2;
      this.G3 = this.vt_.G3;
    };

    VT.CursorState.prototype.restore = function() {
      this.vt_.terminal.restoreCursor(this.cursor);

      this.vt_.terminal.setTextAttributes(this.textAttributes.clone());

      this.vt_.GL = this.GL;
      this.vt_.GR = this.GR;

      this.vt_.G0 = this.G0;
      this.vt_.G1 = this.G1;
      this.vt_.G2 = this.G2;
      this.vt_.G3 = this.G3;
    };

    VT.prototype.reset = function() {
      this.G0 = CharacterMap.maps['B'];
      this.G1 = CharacterMap.maps['0'];
      this.G2 = CharacterMap.maps['B'];
      this.G3 = CharacterMap.maps['B'];

      this.GL = 'G0';
      this.GR = 'G0';

      this.savedState_ = new VT.CursorState(this);

      this.mouseReport = this.MOUSE_REPORT_DISABLED;
    };

    /**
     * Handle terminal mouse events.
     *
     * See the "Mouse Tracking" section of [xterm].
     */
    VT.prototype.onTerminalMouse_ = function(e) {
      if (this.mouseReport == this.MOUSE_REPORT_DISABLED)
        return;

      // Temporary storage for our response.
      var response;

      // Modifier key state.
      var mod = 0;
      if (e.shiftKey)
        mod |= 4;
      if (e.metaKey || (this.terminal.keyboard.altIsMeta && e.altKey))
        mod |= 8;
      if (e.ctrlKey)
        mod |= 16;

      // TODO(rginda): We should also support mode 1005 and/or 1006 to extend the
      // coordinate space.  Though, after poking around just a little, I wasn't
      // able to get vi or emacs to use either of these modes.
      var x = String.fromCharCode(util.f.clamp(e.terminalColumn + 32, 32, 255));
      var y = String.fromCharCode(util.f.clamp(e.terminalRow + 32, 32, 255));
      var b;

      switch (e.type) {
        case 'mousewheel':
          // Mouse wheel is treated as button 1 or 2 plus an additional 64.
          b = ((e.wheelDeltaY > 0) ? 0 : 1) + 96;
          b |= mod;
          response = '\x1b[M' + String.fromCharCode(b) + x + y;

          // Keep the terminal from scrolling.
          e.preventDefault();
          break;

        case 'mousedown':
          // Buttons are encoded as button number plus 32.
          b = Math.min(e.which - 1, 2) + 32;

          // And mix in the modifier keys.
          b |= mod;

          response = '\x1b[M' + String.fromCharCode(b) + x + y;
          break;

        case 'mouseup':
          // Mouse up has no indication of which button was released.
          response = '\x1b[M\x23' + x + y;
          break;

        case 'mousemove':
          if (this.mouseReport == this.MOUSE_REPORT_DRAG && e.which) {
            // Standard button bits.
            b = 32 + Math.min(e.which - 1, 2);

            // Add 32 to indicate mouse motion.
            b += 32;

            // And mix in the modifier keys.
            b |= mod;

            response = '\x1b[M' + String.fromCharCode(b) + x + y;
          }

          break;

        case 'click':
        case 'dblclick':
          break;

        default:
          console.error('Unknown mouse event: ' + e.type, e);
          break;
      }

      if (response)
        this.terminal.io.sendString(response);
    };

    /**
     * Interpret a string of characters, displaying the results on the associated
     * terminal object.
     *
     * The buffer will be decoded according to the 'receive-encoding' preference.
     */
    VT.prototype.interpret = function(buf) {
      this.parseState_.resetBuf(this.decode(buf));

      while (!this.parseState_.isComplete()) {
        var func = this.parseState_.func;
        var pos = this.parseState_.pos;
        buf = this.parseState_.buf;

        this.parseState_.func.call(this, this.parseState_);

        if (this.parseState_.func == func && this.parseState_.pos == pos &&
            this.parseState_.buf == buf) {
          throw 'Parser did not alter the state!';
        }
      }
    };

    /**
     * Decode a string according to the 'receive-encoding' preference.
     */
    VT.prototype.decode = function(str) {
      if (this.characterEncoding == 'utf-8')
        return this.decodeUTF8(str);

      return str;
    };

    /**
     * Encode a UTF-16 string as UTF-8.
     *
     * See also: http://en.wikipedia.org/wiki/UTF-16
     */
    VT.prototype.encodeUTF8 = function(str) {
      return utf8.encode(str);
    };

    /**
     * Decode a UTF-8 string into UTF-16.
     */
    VT.prototype.decodeUTF8 = function(str) {
      return this.utf8Decoder_.decode(str);
    };

    /**
     * The default parse function.
     *
     * This will scan the string for the first 1-byte control character (C0/C1
     * characters from [CTRL]).  Any plain text coming before the code will be
     * printed to the terminal, then the control character will be dispatched.
     */
    VT.prototype.parseUnknown_ = function(parseState) {
      var self = this;

      var print = function(str) {
        if (self[self.GL].GL)
          str = self[self.GL].GL(str);

        if (self[self.GR].GR)
          str = self[self.GR].GR(str);

        self.terminal.print(str);
      };

      // Search for the next contiguous block of plain text.
      var buf = parseState.peekRemainingBuf();
      var nextControl = buf.search(this.cc1Pattern_);

      if (nextControl === 0) {
        // We've stumbled right into a control character.
        this.dispatch('CC1', buf.substr(0, 1), parseState);
        parseState.advance(1);
        return;
      }

      if (nextControl == -1) {
        // There are no control characters in this string.
        print(buf);
        parseState.reset();
        return;
      }

      print(buf.substr(0, nextControl));
      this.dispatch('CC1', buf.substr(nextControl, 1), parseState);
      parseState.advance(nextControl + 1);
    };

    /**
     * Parse a Control Sequence Introducer code and dispatch it.
     *
     * See [CSI] for some useful information about these codes.
     */
    VT.prototype.parseCSI_ = function(parseState) {
      var ch = parseState.peekChar();
      var args = parseState.args;

      if (ch >= '@' && ch <= '~') {
        // This is the final character.
        this.dispatch('CSI', this.leadingModifier_ + this.trailingModifier_ + ch,
                      parseState);
        parseState.resetParseFunction();

      } else if (ch == ';') {
        // Parameter delimeter.
        if (this.trailingModifier_) {
          // Parameter delimiter after the trailing modifier.  That's a paddlin'.
          parseState.resetParseFunction();

        } else {
          if (!args.length) {
            // They omitted the first param, we need to supply it.
            args.push('');
          }

          args.push('');
        }

      } else if (ch >= '0' && ch <= '9') {
        // Next byte in the current parameter.

        if (this.trailingModifier_) {
          // Numeric parameter after the trailing modifier.  That's a paddlin'.
          parseState.resetParseFunction();
        } else {
          if (!args.length) {
            args[0] = ch;
          } else {
            args[args.length - 1] += ch;
          }
        }

      } else if (ch >= ' ' && ch <= '?' && ch != ':') {
        // Modifier character.
        if (!args.length) {
          this.leadingModifier_ += ch;
        } else {
          this.trailingModifier_ += ch;
        }

      } else if (this.cc1Pattern_.test(ch)) {
        // Control character.
        this.dispatch('CC1', ch, parseState);

      } else {
        // Unexpected character in sequence, bail out.
        parseState.resetParseFunction();
      }

      parseState.advance(1);
    };

    /**
     * Skip over the string until the next String Terminator (ST, 'ESC \') or
     * Bell (BEL, '\x07').
     *
     * The string is accumulated in parseState.args[0].  Make sure to reset the
     * arguments (with parseState.resetArguments) before starting the parse.
     *
     * You can detect that parsing in complete by checking that the parse
     * function has changed back to the default parse function.
     *
     * If we encounter more than maxStringSequence characters, we send back
     * the unterminated sequence to be re-parsed with the default parser function.
     *
     * @return {boolean} If true, parsing is ongoing or complete.  If false, we've
     *     exceeded the max string sequence.
     */
    VT.prototype.parseUntilStringTerminator_ = function(parseState) {
      var buf = parseState.peekRemainingBuf();
      var nextTerminator = buf.search(/(\x1b\\|\x07)/);
      var args = parseState.args;

      if (!args.length) {
        args[0] = '';
        args[1] = new Date();
      }

      if (nextTerminator == -1) {
        // No terminator here, have to wait for the next string.

        args[0] += buf;

        var abortReason;

        if (args[0].length > this.maxStringSequence)
          abortReason = 'too long: ' + args[0].length;

        if (args[0].indexOf('\x1b') != -1)
          abortReason = 'embedded escape: ' + args[0].indexOf('\x1b');

        if (new Date() - args[1] > this.oscTimeLimit_)
          abortReason = 'timeout expired: ' + new Date() - args[1];

        if (abortReason) {
          console.log('parseUntilStringTerminator_: aborting: ' + abortReason,
                      args[0]);
          parseState.reset(args[0]);
          return false;
        }

        parseState.advance(buf.length);
        return true;
      }

      if (args[0].length + nextTerminator > this.maxStringSequence) {
        // We found the end of the sequence, but we still think it's too long.
        parseState.reset(args[0] + buf);
        return false;
      }

      args[0] += buf.substr(0, nextTerminator);

      parseState.resetParseFunction();
      parseState.advance(nextTerminator +
                         (buf.substr(nextTerminator, 1) == '\x1b' ? 2 : 1));

      return true;
    };

    /**
     * Dispatch to the function that handles a given CC1, ESC, or CSI or VT52 code.
     */
    VT.prototype.dispatch = function(type, code, parseState) {
      var handler = VT[type][code];
      if (!handler) {
        if (this.warnUnimplemented)
          console.warn('Unknown ' + type + ' code: ' + JSON.stringify(code));
        return;
      }

      if (handler == VT.ignore) {
        if (this.warnUnimplemented)
          console.warn('Ignored ' + type + ' code: ' + JSON.stringify(code));
        return;
      }

      if (type == 'CC1' && code > '\x7f' && !this.enable8BitControl) {
        // It's kind of a hack to put this here, but...
        //
        // If we're dispatching a 'CC1' code, and it's got the eighth bit set,
        // but we're not supposed to handle 8-bit codes?  Just ignore it.
        //
        // This prevents an errant (DCS, '\x90'), (OSC, '\x9d'), (PM, '\x9e') or
        // (APC, '\x9f') from locking up the terminal waiting for its expected
        // (ST, '\x9c') or (BEL, '\x07').
        console.warn('Ignoring 8-bit control code: 0x' +
                     code.charCodeAt(0).toString(16));
        return;
      }

      handler.apply(this, [parseState, code]);
    };

    /**
     * Set one of the ANSI defined terminal mode bits.
     *
     * Invoked in response to SM/RM.
     *
     * Expected values for code:
     *   2 - Keyboard Action Mode (AM).  Will not implement.
     *   4 - Insert Mode (IRM).
     *   12 - Send/receive (SRM).  Will not implement.
     *   20 - Automatic Newline (LNM).
     *
     * Unexpected and unimplemented values are silently ignored.
     */
    VT.prototype.setANSIMode = function(code, state) {
      if (code == '4') {
        this.terminal.setInsertMode(state);
      } else if (code == '20') {
        this.terminal.setAutoCarriageReturn(state);
      } else if (this.warnUnimplemented) {
        console.warn('Unimplemented ANSI Mode: ' + code);
      }
    };

    /**
     * Set or reset one of the DEC Private modes.
     *
     * Invoked in response to DECSET/DECRST.
     *
     * Expected values for code:
     *      1 - Application Cursor Keys (DECCKM).
     *      2 - [!] Designate USASCII for character sets G0-G3 (DECANM), and set
     *          VT100 mode.
     *      3 - 132 Column Mode (DECCOLM).
     *      4 - [x] Smooth (Slow) Scroll (DECSCLM).
     *      5 - Reverse Video (DECSCNM).
     *      6 - Origin Mode (DECOM).
     *      7 - Wraparound Mode (DECAWM).
     *      8 - [x] Auto-repeat Keys (DECARM).
     *      9 - [!] Send Mouse X & Y on button press.
     *     10 - [x] Show toolbar (rxvt).
     *     12 - Start Blinking Cursor (att610).
     *     18 - [!] Print form feed (DECPFF).
     *     19 - [x] Set print extent to full screen (DECPEX).
     *     25 - Show Cursor (DECTCEM).
     *     30 - [!] Show scrollbar (rxvt).
     *     35 - [x] Enable font-shifting functions (rxvt).
     *     38 - [x] Enter Tektronix Mode (DECTEK).
     *     40 - Allow 80 - 132 Mode.
     *     41 - [!] more(1) fix (see curses resource).
     *     42 - [!] Enable Nation Replacement Character sets (DECNRCM).
     *     44 - [!] Turn On Margin Bell.
     *     45 - Reverse-wraparound Mode.
     *     46 - [x] Start Logging.
     *     47 - [!] Use Alternate Screen Buffer.
     *     66 - [!] Application keypad (DECNKM).
     *     67 - Backarrow key sends backspace (DECBKM).
     *   1000 - Send Mouse X & Y on button press and release.  (MOUSE_REPORT_CLICK)
     *   1001 - [!] Use Hilite Mouse Tracking.
     *   1002 - Use Cell Motion Mouse Tracking.  (MOUSE_REPORT_DRAG)
     *   1003 - [!] Use All Motion Mouse Tracking.
     *   1004 - [!] Send FocusIn/FocusOut events.
     *   1005 - [!] Enable Extended Mouse Mode.
     *   1010 - Scroll to bottom on tty output (rxvt).
     *   1011 - Scroll to bottom on key press (rxvt).
     *   1034 - [x] Interpret "meta" key, sets eighth bit.
     *   1035 - [x] Enable special modifiers for Alt and NumLock keys.
     *   1036 - Send ESC when Meta modifies a key.
     *   1037 - [!] Send DEL from the editing-keypad Delete key.
     *   1039 - Send ESC when Alt modifies a key.
     *   1040 - [x] Keep selection even if not highlighted.
     *   1041 - [x] Use the CLIPBOARD selection.
     *   1042 - [!] Enable Urgency window manager hint when Control-G is received.
     *   1043 - [!] Enable raising of the window when Control-G is received.
     *   1047 - [!] Use Alternate Screen Buffer.
     *   1048 - Save cursor as in DECSC.
     *   1049 - Save cursor as in DECSC and use Alternate Screen Buffer, clearing
     *          it first. (This may be disabled by the titeInhibit resource). This
     *          combines the effects of the 1047 and 1048 modes. Use this with
     *          terminfo-based applications rather than the 47 mode.
     *   1050 - [!] Set terminfo/termcap function-key mode.
     *   1051 - [x] Set Sun function-key mode.
     *   1052 - [x] Set HP function-key mode.
     *   1053 - [x] Set SCO function-key mode.
     *   1060 - [x] Set legacy keyboard emulation (X11R6).
     *   1061 - [!] Set VT220 keyboard emulation.
     *   2004 - Set bracketed paste mode.
     *
     * [!] - Not currently implemented, may be in the future.
     * [x] - Will not implement.
     */
    VT.prototype.setDECMode = function(code, state) {
      switch (code) {
        case '1':  // DECCKM
          this.terminal.keyboard.applicationCursor = state;
          break;

        case '3':  // DECCOLM
          if (this.allowColumnWidthChanges_) {
            this.terminal.setWidth(state ? 132 : 80);

            this.terminal.clearHome();
            this.terminal.setVTScrollRegion(null, null);
          }
          break;

        case '5':  // DECSCNM
          this.terminal.setReverseVideo(state);
          break;

        case '6':  // DECOM
          this.terminal.setOriginMode(state);
          break;

        case '7':  // DECAWM
          this.terminal.setWraparound(state);
          break;

        case '12':  // att610
          if (this.enableDec12)
            this.terminal.setCursorBlink(state);
          break;

        case '25':  // DECTCEM
          this.terminal.setCursorVisible(state);
          break;

        case '40':  // no-spec
          this.terminal.allowColumnWidthChanges_ = state;
          break;

        case '45':  // no-spec
          this.terminal.setReverseWraparound(state);
          break;

        case '67':  // DECBKM
          this.terminal.keyboard.backspaceSendsBackspace = state;
          break;

        case '1000':  // Report on mouse clicks only.
          this.mouseReport = (
              state ? this.MOUSE_REPORT_CLICK : this.MOUSE_REPORT_DISABLED);
          break;

        case '1002':  // Report on mouse clicks and drags
          this.mouseReport = (
              state ? this.MOUSE_REPORT_DRAG : this.MOUSE_REPORT_DISABLED);
          break;

        case '1010':  // rxvt
          this.terminal.scrollOnOutput = state;
          break;

        case '1011':  // rxvt
          this.terminal.scrollOnKeystroke = state;
          break;

        case '1036':  // no-spec
          this.terminal.keyboard.metaSendsEscape = state;
          break;

        case '1039':  // no-spec
          this.terminal.keyboard.altSendsEscape = state;
          break;

        case '47':
        case '1047':  // no-spec
          this.terminal.setAlternateMode(state);
          break;

        case '1048':  // Save cursor as in DECSC.
          this.savedState_.save();

          /* falls through */
        case '1049':  // 1047 + 1048 + clear.
          if (state) {
            this.savedState_.save();
            this.terminal.setAlternateMode(state);
            this.terminal.clear();
          } else {
            this.terminal.setAlternateMode(state);
            this.savedState_.restore();
          }

          break;

        case '2004':  // Bracketed paste mode.
          this.terminal.setBracketedPaste(state);
          break;

        default:
          if (this.warnUnimplemented)
            console.warn('Unimplemented DEC Private Mode: ' + code);
          break;
      }
    };

    /**
     * Function shared by control characters and escape sequences that are
     * ignored.
     */
    VT.ignore = function() {};

    /**
     * Collection of control characters expressed in a single byte.
     *
     * This includes the characters from the C0 and C1 sets (see [CTRL]) that we
     * care about.  Two byte versions of the C1 codes are defined in the
     * VT.ESC collection.
     *
     * The 'CC1' mnemonic here refers to the fact that these are one-byte Control
     * Codes.  It's only used in this source file and not defined in any of the
     * referenced documents.
     */
    VT.CC1 = {};

    /**
     * Collection of two-byte and three-byte sequences starting with ESC.
     */
    VT.ESC = {};

    /**
     * Collection of CSI (Control Sequence Introducer) sequences.
     *
     * These sequences begin with 'ESC [', and may take zero or more arguments.
     */
    VT.CSI = {};

    /**
     * Collection of OSC (Operating System Control) sequences.
     *
     * These sequences begin with 'ESC ]', followed by a function number and a
     * string terminated by either ST or BEL.
     */
    VT.OSC = {};

    /**
     * Collection of VT52 sequences.
     *
     * When in VT52 mode, other sequences are disabled.
     */
    VT.VT52 = {};

    /**
     * Null (NUL).
     *
     * Silently ignored.
     */
    VT.CC1['\x00'] = function () {};

    /**
     * Enquiry (ENQ).
     *
     * Transmit answerback message.
     *
     * The default answerback message in xterm is an empty string, so we just
     * ignore this.
     */
    VT.CC1['\x05'] = VT.ignore;

    /**
     * Ring Bell (BEL).
     */
    VT.CC1['\x07'] = function() {
      this.terminal.ringBell();
    };

    /**
     * Backspace (BS).
     *
     * Move the cursor to the left one character position, unless it is at the
     * left margin, in which case no action occurs.
     */
    VT.CC1['\x08'] = function() {
      this.terminal.cursorLeft(1);
    };

    /**
     * Horizontal Tab (HT).
     *
     * Move the cursor to the next tab stop, or to the right margin if no further
     * tab stops are present on the line.
     */
    VT.CC1['\x09'] = function() {
      this.terminal.forwardTabStop();
    };

    /**
     * Line Feed (LF).
     *
     * This code causes a line feed or a new line operation.  See Automatic
     * Newline (LNM).
     */
    VT.CC1['\x0a'] = function() {
      this.terminal.formFeed();
    };

    /**
     * Vertical Tab (VT).
     *
     * Interpreted as LF.
     */
    VT.CC1['\x0b'] = VT.CC1['\x0a'];

    /**
     * Form Feed (FF).
     *
     * Interpreted as LF.
     */
    VT.CC1['\x0c'] = function() {
      this.terminal.formFeed();
    };

    /**
     * Carriage Return (CR).
     *
     * Move cursor to the left margin on the current line.
     */
    VT.CC1['\x0d'] = function() {
      this.terminal.setCursorColumn(0);
    };

    /**
     * Shift Out (SO), aka Lock Shift 0 (LS1).
     *
     * Invoke G1 character set in GL.
     */
    VT.CC1['\x0e'] = function() {
      this.GL = 'G1';
    };

    /**
     * Shift In (SI), aka Lock Shift 0 (LS0).
     *
     * Invoke G0 character set in GL.
     */
    VT.CC1['\x0f'] = function() {
      this.GL = 'G0';
    };

    /**
     * Transmit On (XON).
     *
     * Not currently implemented.
     *
     * TODO(rginda): Implement?
     */
    VT.CC1['\x11'] = VT.ignore;

    /**
     * Transmit Off (XOFF).
     *
     * Not currently implemented.
     *
     * TODO(rginda): Implement?
     */
    VT.CC1['\x13'] = VT.ignore;

    /**
     * Cancel (CAN).
     *
     * If sent during a control sequence, the sequence is immediately terminated
     * and not executed.
     *
     * It also causes the error character to be displayed.
     */
    VT.CC1['\x18'] = function(parseState) {
      parseState.resetParseFunction();
      this.terminal.print('?');
    };

    /**
     * Substitute (SUB).
     *
     * Interpreted as CAN.
     */
    VT.CC1['\x1a'] = VT.CC1['\x18'];

    /**
     * Escape (ESC).
     */
    VT.CC1['\x1b'] = function(parseState) {
      var parseESC = function(parseState) {
        var ch = parseState.consumeChar();

        if (ch == '\x1b')
          return;

        this.dispatch('ESC', ch, parseState);

        if (parseState.func == parseESC)
          parseState.resetParseFunction();
      };

      parseState.func = parseESC;
    };

    /**
     * Delete (DEL).
     */
    VT.CC1['\x7f'] = VT.ignore;

    // 8 bit control characters and their two byte equivalents, below...

    /**
     * Index (IND).
     *
     * Like newline, only keep the X position
     */
    VT.CC1['\x84'] =
    VT.ESC['D'] = function() {
      this.terminal.lineFeed();
    };

    /**
     * Next Line (NEL).
     *
     * Like newline, but doesn't add lines.
     */
    VT.CC1['\x85'] =
    VT.ESC['E'] = function() {
      this.terminal.setCursorColumn(0);
      this.terminal.cursorDown(1);
    };

    /**
     * Horizontal Tabulation Set (HTS).
     */
    VT.CC1['\x88'] =
    VT.ESC['H'] = function() {
      this.terminal.setTabStop(this.terminal.getCursorColumn());
    };

    /**
     * Reverse Index (RI).
     *
     * Move up one line.
     */
    VT.CC1['\x8d'] =
    VT.ESC['M'] = function() {
      this.terminal.reverseLineFeed();
    };

    /**
     * Single Shift 2 (SS2).
     *
     * Select of G2 Character Set for the next character only.
     *
     * Not currently implemented.
     */
    VT.CC1['\x8e'] =
    VT.ESC['N'] = VT.ignore;

    /**
     * Single Shift 3 (SS3).
     *
     * Select of G3 Character Set for the next character only.
     *
     * Not currently implemented.
     */
    VT.CC1['\x8f'] =
    VT.ESC['O'] = VT.ignore;

    /**
     * Device Control String (DCS).
     *
     * Indicate a DCS sequence.  See Device-Control functions in [XTERM].
     * Not currently implemented.
     *
     * TODO(rginda): Consider implementing DECRQSS, the rest don't seem applicable.
     */
    VT.CC1['\x90'] =
    VT.ESC['P'] = function(parseState) {
      parseState.resetArguments();
      parseState.func = this.parseUntilStringTerminator_;
    };

    /**
     * Start of Protected Area (SPA).
     *
     * Will not implement.
     */
    VT.CC1['\x96'] =
    VT.ESC['V'] = VT.ignore;

    /**
     * End of Protected Area (EPA).
     *
     * Will not implement.
     */
    VT.CC1['\x97'] =
    VT.ESC['W'] = VT.ignore;

    /**
     * Start of String (SOS).
     *
     * Will not implement.
     */
    VT.CC1['\x98'] =
    VT.ESC['X'] = VT.ignore;

    /**
     * Single Character Introducer (SCI, also DECID).
     *
     * Return Terminal ID.  Obsolete form of 'ESC [ c' (DA).
     */
    VT.CC1['\x9a'] =
    VT.ESC['Z'] = function() {
      this.terminal.io.sendString('\x1b[?1;2c');
    };

    /**
     * Control Sequence Introducer (CSI).
     *
     * The lead into most escape sequences.  See [CSI].
     */
    VT.CC1['\x9b'] =
    VT.ESC['['] = function(parseState) {
      parseState.resetArguments();
      this.leadingModifier_ = '';
      this.trailingModifier_ = '';
      parseState.func = this.parseCSI_;
    };

    /**
     * String Terminator (ST).
     *
     * Used to terminate DCS/OSC/PM/APC commands which may take string arguments.
     *
     * We don't directly handle it here, as it's only used to terminate other
     * sequences.  See the 'parseUntilStringTerminator_' method.
     */
    VT.CC1['\x9c'] =
    VT.ESC['\\'] = VT.ignore;

    /**
     * Operating System Command (OSC).
     *
     * Commands relating to the operating system.
     */
    VT.CC1['\x9d'] =
    VT.ESC[']'] = function(parseState) {
      parseState.resetArguments();

      var parseOSC = function(parseState) {
        if (!this.parseUntilStringTerminator_(parseState)) {
          // The string sequence was too long.
          return;
        }

        if (parseState.func == parseOSC) {
          // We're not done parsing the string yet.
          return;
        }

        // We're done.
        var ary = parseState.args[0].match(/^(\d+);(.*)$/);
        if (ary) {
          parseState.args[0] = ary[2];
          this.dispatch('OSC', ary[1], parseState);
        } else {
          console.warn('Invalid OSC: ' + JSON.stringify(parseState.args[0]));
        }
      };

      parseState.func = parseOSC;
    };

    /**
     * Privacy Message (PM).
     *
     * Will not implement.
     */
    VT.CC1['\x9e'] =
    VT.ESC['^'] = function(parseState) {
      parseState.resetArguments();
      parseState.func = this.parseUntilStringTerminator_;
    };

    /**
     * Application Program Control (APC).
     *
     * Will not implement.
     */
    VT.CC1['\x9f'] =
    VT.ESC['_'] = function(parseState) {
      parseState.resetArguments();
      parseState.func = this.parseUntilStringTerminator_;
    };

    /**
     * ESC \x20 - Unclear to me where these originated, possibly in xterm.
     *
     * Not currently implemented:
     *   ESC \x20 F - Select 7 bit escape codes in responses (S7C1T).
     *   ESC \x20 G - Select 8 bit escape codes in responses (S8C1T).
     *                NB: We currently assume S7C1T always.
     *
     * Will not implement:
     *   ESC \x20 L - Set ANSI conformance level 1.
     *   ESC \x20 M - Set ANSI conformance level 2.
     *   ESC \x20 N - Set ANSI conformance level 3.
     */
    VT.ESC['\x20'] = function(parseState) {
      parseState.func = function(parseState) {
        var ch = parseState.consumeChar();
        if (this.warnUnimplemented)
          console.warn('Unimplemented sequence: ESC 0x20 ' + ch);
        parseState.resetParseFunction();
      };
    };

    /**
     * DEC 'ESC #' sequences.
     *
     * Handled:
     *   ESC # 8 - DEC Screen Alignment Test (DECALN).
     *             Fills the terminal with 'E's.  Used liberally by vttest.
     *
     * Ignored:
     *   ESC # 3 - DEC double-height line, top half (DECDHL).
     *   ESC # 4 - DEC double-height line, bottom half (DECDHL).
     *   ESC # 5 - DEC single-width line (DECSWL).
     *   ESC # 6 - DEC double-width line (DECDWL).
     */
    VT.ESC['#'] = function(parseState) {
      parseState.func = function(parseState) {
        var ch = parseState.consumeChar();
        if (ch == '8')
          this.terminal.fill('E');

        parseState.resetParseFunction();
      };
    };

    /**
     * 'ESC %' sequences, character set control.  Not currently implemented.
     *
     * To be implemented (currently ignored):
     *   ESC % @ - Set ISO 8859-1 character set.
     *   ESC % G - Set UTF-8 character set.
     *
     * All other ESC # sequences are echoed to the terminal.
     *
     * TODO(rginda): Implement.
     */
    VT.ESC['%'] = function(parseState) {
      parseState.func = function(parseState) {
        var ch = parseState.consumeChar();
        if (ch != '@' && ch != 'G' && this.warnUnimplemented)
          console.warn('Unknown ESC % argument: ' + JSON.stringify(ch));
        parseState.resetParseFunction();
      };
    };

    /**
     * Character Set Selection (SCS).
     *
     *   ESC ( Ps - Set G0 character set (VT100).
     *   ESC ) Ps - Set G1 character set (VT220).
     *   ESC * Ps - Set G2 character set (VT220).
     *   ESC + Ps - Set G3 character set (VT220).
     *   ESC - Ps - Set G1 character set (VT300).
     *   ESC . Ps - Set G2 character set (VT300).
     *   ESC / Ps - Set G3 character set (VT300).
     *
     * Values for Ps are:
     *   0 - DEC Special Character and Line Drawing Set.
     *   A - United Kingdom (UK).
     *   B - United States (USASCII).
     *   4 - Dutch.
     *   C or 5 - Finnish.
     *   R - French.
     *   Q - French Canadian.
     *   K - German.
     *   Y - Italian.
     *   E or 6 - Norwegian/Danish.
     *   Z - Spanish.
     *   H or 7 - Swedish.
     *   = - Swiss.
     *
     * All other sequences are echoed to the terminal.
     *
     * TODO(rginda): Implement.
     */
    VT.ESC['('] =
    VT.ESC[')'] =
    VT.ESC['*'] =
    VT.ESC['+'] =
    VT.ESC['-'] =
    VT.ESC['.'] =
    VT.ESC['/'] = function(parseState, code) {
      parseState.func = function(parseState) {
        var ch = parseState.consumeChar();
        if (ch == '\x1b') {
          parseState.resetParseFunction();
          parseState.func();
          return;
        }

        if (ch in CharacterMap.maps) {
          if (code == '(') {
            this.G0 = CharacterMap.maps[ch];
          } else if (code == ')' || code == '-') {
            this.G1 = CharacterMap.maps[ch];
          } else if (code == '*' || code == '.') {
            this.G2 = CharacterMap.maps[ch];
          } else if (code == '+' || code == '/') {
            this.G3 = CharacterMap.maps[ch];
          }
        } else if (this.warnUnimplemented) {
          console.log('Invalid character set for "' + code + '": ' + ch);
        }

        parseState.resetParseFunction();
      };
    };

    /**
     * Back Index (DECBI).
     *
     * VT420 and up.  Not currently implemented.
     */
    VT.ESC['6'] = VT.ignore;

    /**
     * Save Cursor (DECSC).
     */
    VT.ESC['7'] = function() {
      this.savedState_.save();
    };

    /**
     * Restore Cursor (DECSC).
     */
    VT.ESC['8'] = function() {
      this.savedState_.restore();
    };

    /**
     * Forward Index (DECFI).
     *
     * VT210 and up.  Not currently implemented.
     */
    VT.ESC['9'] = VT.ignore;

    /**
     * Application keypad (DECPAM).
     */
    VT.ESC['='] = function() {
      this.terminal.keyboard.applicationKeypad = true;
    };

    /**
     * Normal keypad (DECPNM).
     */
    VT.ESC['>'] = function() {
      this.terminal.keyboard.applicationKeypad = false;
    };

    /**
     * Cursor to lower left corner of screen.
     *
     * Will not implement.
     *
     * This is only recognized by xterm when the hpLowerleftBugCompat resource is
     * set.
     */
    VT.ESC['F'] = VT.ignore;

    /**
     * Full Reset (RIS).
     */
    VT.ESC['c'] = function() {
      this.reset();
      this.terminal.reset();
    };

    /**
     * Memory lock/unlock.
     *
     * Will not implement.
     */
    VT.ESC['l'] =
    VT.ESC['m'] = VT.ignore;

    /**
     * Lock Shift 2 (LS2)
     *
     * Invoke the G2 Character Set as GL.
     */
    VT.ESC['n'] = function() {
      this.GL = 'G2';
    };

    /**
     * Lock Shift 3 (LS3)
     *
     * Invoke the G3 Character Set as GL.
     */
    VT.ESC['o'] = function() {
      this.GL = 'G3';
    };

    /**
     * Lock Shift 2, Right (LS3R)
     *
     * Invoke the G3 Character Set as GR.
     */
    VT.ESC['|'] = function() {
      this.GR = 'G3';
    };

    /**
     * Lock Shift 2, Right (LS2R)
     *
     * Invoke the G2 Character Set as GR.
     */
    VT.ESC['}'] = function() {
      this.GR = 'G2';
    };

    /**
     * Lock Shift 1, Right (LS1R)
     *
     * Invoke the G1 Character Set as GR.
     */
    VT.ESC['~'] = function() {
      this.GR = 'G1';
    };

    /**
     * Change icon name and window title.
     *
     * We only change the window title.
     */
    VT.OSC['0'] = function(parseState) {
      this.terminal.setWindowTitle(parseState.args[0]);
    };

    /**
     * Change window title.
     */
    VT.OSC['2'] = VT.OSC['0'];

    /**
     * Set/read color palette.
     */
    VT.OSC['4'] = function(parseState) {
      // Args come in as a single 'index1;rgb1 ... ;indexN;rgbN' string.
      // We split on the semicolon and iterate through the pairs.
      var args = parseState.args[0].split(';');

      var pairCount = parseInt(args.length / 2);
      var colorPalette = this.terminal.getTextAttributes().colorPalette;
      var responseArray = [];

      for (var pairNumber = 0; pairNumber < pairCount; ++pairNumber) {
        var colorIndex = parseInt(args[pairNumber * 2]);
        var colorValue = args[pairNumber * 2 + 1];

        if (colorIndex >= colorPalette.length)
          continue;

        if (colorValue == '?') {
          // '?' means we should report back the current color value.
          colorValue = util.colors.rgbToX11(colorPalette[colorIndex]);
          if (colorValue)
            responseArray.push(colorIndex + ';' + colorValue);

          continue;
        }

        colorValue = util.colors.x11ToCSS(colorValue);
        if (colorValue)
          colorPalette[colorIndex] = colorValue;
      }

      if (responseArray.length)
        this.terminal.io.sendString('\x1b]4;' + responseArray.join(';') + '\x07');
    };

    /**
     * Set the cursor shape.
     *
     * Parameter is expected to be in the form "CursorShape=number", where number is
     * one of:
     *
     *   0 - Block
     *   1 - I-Beam
     *   2 - Underline
     *
     * This is a bit of a de-facto standard supported by iTerm 2 and Konsole.  See
     * also: DECSCUSR.
     *
     * Invalid numbers will restore the cursor to the block shape.
     */
    VT.OSC['50'] = function(parseState) {
      var args = parseState.args[0].match(/CursorShape=(.)/i);
      if (!args) {
        console.warn('Could not parse OSC 50 args: ' + parseState.args[0]);
        return;
      }

      switch (args[1]) {
        case '1':
          this.terminal.setCursorShape(cursorShape.BEAM);
          break;

        case '2':
          this.terminal.setCursorShape(cursorShape.UNDERLINE);
          break;

        default:
          this.terminal.setCursorShape(cursorShape.BLOCK);
      }
    };

    /**
     * Set/read system clipboard.
     *
     * Read is not implemented due to security considerations.  A remote app
     * that is able to both write and read to the clipboard could essentially
     * take over your session.
     *
     * The clipboard data will be decoded according to the 'receive-encoding'
     * preference.
     */
    VT.OSC['52'] = function(parseState) {
      // Args come in as a single 'clipboard;b64-data' string.  The clipboard
      // parameter is used to select which of the X clipboards to address.  Since
      // we're not integrating with X, we treat them all the same.
      var args = parseState.args[0].match(/^[cps01234567]*;(.*)/);
      if (!args)
        return;

      var data = window.atob(args[1]);
      if (data)
        this.terminal.copyStringToClipboard(this.decode(data));
    };

    /**
     * Insert (blank) characters (ICH).
     */
    VT.CSI['@'] = function(parseState) {
      this.terminal.insertSpace(parseState.iarg(0, 1));
    };

    /**
     * Cursor Up (CUU).
     */
    VT.CSI['A'] = function(parseState) {
      this.terminal.cursorUp(parseState.iarg(0, 1));
    };

    /**
     * Cursor Down (CUD).
     */
    VT.CSI['B'] = function(parseState) {
      this.terminal.cursorDown(parseState.iarg(0, 1));
    };

    /**
     * Cursor Forward (CUF).
     */
    VT.CSI['C'] = function(parseState) {
      this.terminal.cursorRight(parseState.iarg(0, 1));
    };

    /**
     * Cursor Backward (CUB).
     */
    VT.CSI['D'] = function(parseState) {
      this.terminal.cursorLeft(parseState.iarg(0, 1));
    };

    /**
     * Cursor Next Line (CNL).
     *
     * This is like Cursor Down, except the cursor moves to the beginning of the
     * line as well.
     */
    VT.CSI['E'] = function(parseState) {
      this.terminal.cursorDown(parseState.iarg(0, 1));
      this.terminal.setCursorColumn(0);
    };

    /**
     * Cursor Preceding Line (CPL).
     *
     * This is like Cursor Up, except the cursor moves to the beginning of the
     * line as well.
     */
    VT.CSI['F'] = function(parseState) {
      this.terminal.cursorUp(parseState.iarg(0, 1));
      this.terminal.setCursorColumn(0);
    };

    /**
     * Cursor Character Absolute (CHA).
     */
    VT.CSI['G'] = function(parseState) {
      this.terminal.setCursorColumn(parseState.iarg(0, 1) - 1);
    };

    /**
     * Cursor Position (CUP).
     */
    VT.CSI['H'] = function(parseState) {
      this.terminal.setCursorPosition(parseState.iarg(0, 1) - 1,
                                      parseState.iarg(1, 1) - 1);
    };

    /**
     * Cursor Forward Tabulation (CHT).
     */
    VT.CSI['I'] = function(parseState) {
      var count = parseState.iarg(0, 1);
      count = util.f.clamp(count, 1, this.terminal.screenSize.width);
      for (var i = 0; i < count; i++) {
        this.terminal.forwardTabStop();
      }
    };

    /**
     * Erase in Display (ED, DECSED).
     */
    VT.CSI['J'] =
    VT.CSI['?J'] = function(parseState, code) {
      var arg = parseState.args[0];

      if (!arg || arg == '0') {
          this.terminal.eraseBelow();
      } else if (arg == '1') {
        this.terminal.eraseAbove();
      } else if (arg == '2') {
        this.terminal.clear();
      } else if (arg == '3') {
        // The xterm docs say this means "Erase saved lines", but we'll just clear
        // the display since killing the scrollback seems rude.
        this.terminal.clear();
      }
    };

    /**
     * Erase in line (EL, DECSEL).
     */
    VT.CSI['K'] =
    VT.CSI['?K'] = function(parseState, code) {
      var arg = parseState.args[0];

      if (!arg || arg == '0') {
        this.terminal.eraseToRight();
      } else if (arg == '1'){
        this.terminal.eraseToLeft();
      } else if (arg == '2') {
        this.terminal.eraseLine();
      }
    };

    /**
     * Insert Lines (IL).
     */
    VT.CSI['L'] = function(parseState) {
      this.terminal.insertLines(parseState.iarg(0, 1));
    };

    /**
     * Delete Lines (DL).
     */
    VT.CSI['M'] = function(parseState) {
      this.terminal.deleteLines(parseState.iarg(0, 1));
    };

    /**
     * Delete Characters (DCH).
     *
     * This command shifts the line contents left, starting at the cursor position.
     */
    VT.CSI['P'] = function(parseState) {
      this.terminal.deleteChars(parseState.iarg(0, 1));
    };

    /**
     * Scroll Up (SU).
     */
    VT.CSI['S'] = function(parseState) {
      this.terminal.vtScrollUp(parseState.iarg(0, 1));
    };

    /**
     * Scroll Down (SD).
     * Also 'Initiate highlight mouse tracking'.  Will not implement this part.
     */
    VT.CSI['T'] = function(parseState) {
      if (parseState.args.length <= 1)
        this.terminal.vtScrollDown(parseState.iarg(0, 1));
    };

    /**
     * Reset one or more features of the title modes to the default value.
     *
     *   ESC [ > Ps T
     *
     * Normally, "reset" disables the feature. It is possible to disable the
     * ability to reset features by compiling a different default for the title
     * modes into xterm.
     *
     * Ps values:
     *   0 - Do not set window/icon labels using hexadecimal.
     *   1 - Do not query window/icon labels using hexadecimal.
     *   2 - Do not set window/icon labels using UTF-8.
     *   3 - Do not query window/icon labels using UTF-8.
     *
     * Will not implement.
     */
    VT.CSI['>T'] = VT.ignore;

    /**
     * Erase Characters (ECH).
     */
    VT.CSI['X'] = function(parseState) {
      this.terminal.eraseToRight(parseState.iarg(0, 1));
    };

    /**
     * Cursor Backward Tabulation (CBT).
     */
    VT.CSI['Z'] = function(parseState) {
      var count = parseState.iarg(0, 1);
      count = util.f.clamp(count, 1, this.terminal.screenSize.width);
      for (var i = 0; i < count; i++) {
        this.terminal.backwardTabStop();
      }
    };

    /**
     * Character Position Absolute (HPA).
     */
    VT.CSI['`'] = function(parseState) {
      this.terminal.setCursorColumn(parseState.iarg(0, 1) - 1);
    };

    /**
     * Repeat the preceding graphic character.
     *
     * Not currently implemented.
     */
    VT.CSI['b'] = VT.ignore;

    /**
     * Send Device Attributes (Primary DA).
     *
     * TODO(rginda): This is hardcoded to send back 'VT100 with Advanced Video
     * Option', but it may be more correct to send a VT220 response once
     * we fill out the 'Not currently implemented' parts.
     */
    VT.CSI['c'] = function(parseState) {
      if (!parseState.args[0] || parseState.args[0] == '0') {
        this.terminal.io.sendString('\x1b[?1;2c');
      }
    };

    /**
     * Send Device Attributes (Secondary DA).
     *
     * TODO(rginda): This is hardcoded to send back 'VT100' but it may be more
     * correct to send a VT220 response once we fill out more 'Not currently
     * implemented' parts.
     */
    VT.CSI['>c'] = function(parseState) {
      this.terminal.io.sendString('\x1b[>0;256;0c');
    };

    /**
     * Line Position Absolute (VPA).
     */
    VT.CSI['d'] = function(parseState) {
      this.terminal.setAbsoluteCursorRow(parseState.iarg(0, 1) - 1);
    };

    /**
     * Horizontal and Vertical Position (HVP).
     *
     * Same as Cursor Position (CUP).
     */
    VT.CSI['f'] = VT.CSI['H'];

    /**
     * Tab Clear (TBC).
     */
    VT.CSI['g'] = function(parseState) {
      if (!parseState.args[0] || parseState.args[0] == '0') {
        // Clear tab stop at cursor.
        this.terminal.clearTabStopAtCursor(false);
      } else if (parseState.args[0] == '3') {
        // Clear all tab stops.
        this.terminal.clearAllTabStops();
      }
    };

    /**
     * Set Mode (SM).
     */
    VT.CSI['h'] = function(parseState) {
      for (var i = 0; i < parseState.args.length; i++) {
        this.setANSIMode(parseState.args[i], true);
      }
    };

    /**
     * DEC Private Mode Set (DECSET).
     */
    VT.CSI['?h'] = function(parseState) {
      for (var i = 0; i < parseState.args.length; i++) {
        this.setDECMode(parseState.args[i], true);
      }
    };

    /**
     * Media Copy (MC).
     * Media Copy (MC, DEC Specific).
     *
     * These commands control the printer.  Will not implement.
     */
    VT.CSI['i'] =
    VT.CSI['?i'] = VT.ignore;

    /**
     * Reset Mode (RM).
     */
    VT.CSI['l'] = function(parseState) {
      for (var i = 0; i < parseState.args.length; i++) {
        this.setANSIMode(parseState.args[i], false);
      }
    };

    /**
     * DEC Private Mode Reset (DECRST).
     */
    VT.CSI['?l'] = function(parseState) {
      for (var i = 0; i < parseState.args.length; i++) {
        this.setDECMode(parseState.args[i], false);
      }
    };

    /**
     * Character Attributes (SGR).
     *
     * Iterate through the list of arguments, applying the following attribute
     * changes based on the argument value...
     *
     *    0 Normal (default).
     *    1 Bold.
     *    3 Italic (non-xterm).
     *    4 Underlined.
     *    5 Blink (appears as Bold).
     *    7 Inverse.
     *    8 Invisible, i.e., hidden (VT300).
     *   22 Normal (neither bold nor faint).
     *   23 Not italic (non-xterm).
     *   24 Not underlined.
     *   25 Steady (not blinking).
     *   27 Positive (not inverse).
     *   28 Visible, i.e., not hidden (VT300).
     *   30 Set foreground color to Black.
     *   31 Set foreground color to Red.
     *   32 Set foreground color to Green.
     *   33 Set foreground color to Yellow.
     *   34 Set foreground color to Blue.
     *   35 Set foreground color to Magenta.
     *   36 Set foreground color to Cyan.
     *   37 Set foreground color to White.
     *   39 Set foreground color to default (original).
     *   40 Set background color to Black.
     *   41 Set background color to Red.
     *   42 Set background color to Green.
     *   43 Set background color to Yellow.
     *   44 Set background color to Blue.
     *   45 Set background color to Magenta.
     *   46 Set background color to Cyan.
     *   47 Set background color to White.
     *   49 Set background color to default (original)
     *
     * Non-xterm (italic) codes have mixed support, but are supported by both
     * gnome-terminal and rxvt and are recognized as CSI codes on Wikipedia
     * (http://en.wikipedia.org/wiki/ANSI_escape_code).
     *
     * For 16-color support, the following apply.
     *
     *   90 Set foreground color to Bright Black.
     *   91 Set foreground color to Bright Red.
     *   92 Set foreground color to Bright Green.
     *   93 Set foreground color to Bright Yellow.
     *   94 Set foreground color to Bright Blue.
     *   95 Set foreground color to Bright Magenta.
     *   96 Set foreground color to Bright Cyan.
     *   97 Set foreground color to Bright White.
     *  100 Set background color to Bright Black.
     *  101 Set background color to Bright Red.
     *  102 Set background color to Bright Green.
     *  103 Set background color to Bright Yellow.
     *  104 Set background color to Bright Blue.
     *  105 Set background color to Bright Magenta.
     *  106 Set background color to Bright Cyan.
     *  107 Set background color to Bright White.
     *
     * For 88- or 256-color support, the following apply.
     *  38 ; 5 ; P Set foreground color to P.
     *  48 ; 5 ; P Set background color to P.
     *
     *  For true color (24-bit) support, the following apply.
     *  38 ; 2 ; R ; G ; B Set foreground color to rgb(R, G, B)
     *  48 ; 2 ; R ; G ; B Set background color to rgb(R, G, B)
     *
     * Note that most terminals consider "bold" to be "bold and bright".  In
     * some documents the bold state is even referred to as bright.  We interpret
     * bold as bold-bright here too, but only when the "bold" setting comes before
     * the color selection.
     */
    VT.CSI['m'] = function(parseState) {
      function get256(i) {
        if (parseState.args.length < i + 2 || parseState.args[i + 1] != '5')
          return null;

        return parseState.iarg(i + 2, 0);
      }

      function getTrueColor(i) {
        if (parseState.args.length < i + 5 || parseState.args[i + 1] != '2')
          return null;
        var r = parseState.iarg(i + 2, 0);
        var g = parseState.iarg(i + 3, 0);
        var b = parseState.iarg(i + 4, 0);

        return 'rgb(' + r + ' ,' + g + ' ,' + b + ')';
      }

      var attrs = this.terminal.getTextAttributes();

      if (!parseState.args.length) {
        attrs.reset();
        return;
      }

      var trueColor, c;

      for (var i = 0; i < parseState.args.length; i++) {
        var arg = parseState.iarg(i, 0);

        if (arg < 30) {
          if (arg === 0) {
            attrs.reset();
          } else if (arg == 1) {
            attrs.bold = true;
          } else if (arg == 3) {
            attrs.italic = true;
          } else if (arg == 4) {
            attrs.underline = true;
          } else if (arg == 5) {
            attrs.blink = true;
          } else if (arg == 7) {  // Inverse.
            attrs.inverse = true;
          } else if (arg == 8) {  // Invisible.
            attrs.invisible = true;
          } else if (arg == 22) {
            attrs.bold = false;
          } else if (arg == 23) {
            attrs.italic = false;
          } else if (arg == 24) {
            attrs.underline = false;
          } else if (arg == 25) {
            attrs.blink = false;
          } else if (arg == 27) {
            attrs.inverse = false;
          } else if (arg == 28) {
            attrs.invisible = false;
          }

        } else if (arg < 50) {
          // Select fore/background color from bottom half of 16 color palette
          // or from the 256 color palette or alternative specify color in fully
          // qualified rgb(r, g, b) form.
          if (arg < 38) {
            attrs.foregroundSource = arg - 30;

          } else if (arg == 38) {
            // First check for true color definition
            trueColor = getTrueColor(i);
            if (trueColor != null) {
              attrs.foregroundSource = attrs.SRC_RGB;
              attrs.foreground = trueColor;

              i += 5;
            } else {
              // Check for 256 color
              c = get256(i);
              if (c == null)
                break;

              i += 2;

              if (c >= attrs.colorPalette.length)
                continue;

              attrs.foregroundSource = c;
            }

          } else if (arg == 39) {
            attrs.foregroundSource = attrs.SRC_DEFAULT;

          } else if (arg < 48) {
            attrs.backgroundSource = arg - 40;

          } else if (arg == 48) {
            // First check for true color definition
            trueColor = getTrueColor(i);
            if (trueColor != null) {
              attrs.backgroundSource = attrs.SRC_RGB;
              attrs.background = trueColor;

              i += 5;
            } else {
              // Check for 256 color
              c = get256(i);
              if (c == null)
                break;

              i += 2;

              if (c >= attrs.colorPalette.length)
                continue;

              attrs.backgroundSource = c;
            }
          } else {
            attrs.backgroundSource = attrs.SRC_DEFAULT;
          }

        } else if (arg >= 90 && arg <= 97) {
          attrs.foregroundSource = arg - 90 + 8;

        } else if (arg >= 100 && arg <= 107) {
          attrs.backgroundSource = arg - 100 + 8;
        }
      }

      attrs.setDefaults(this.terminal.getForegroundColor(),
                        this.terminal.getBackgroundColor());
    };

    /**
     * Set xterm-specific keyboard modes.
     *
     * Will not implement.
     */
    VT.CSI['>m'] = VT.ignore;

    /**
     * Device Status Report (DSR, DEC Specific).
     *
     * 5 - Status Report. Result (OK) is CSI 0 n
     * 6 - Report Cursor Position (CPR) [row;column]. Result is CSI r ; c R
     */
    VT.CSI['n'] = function(parseState) {
      if (parseState.args[0] == '5') {
        this.terminal.io.sendString('\x1b0n');
      } else if (parseState.args[0] == '6') {
        var row = this.terminal.getCursorRow() + 1;
        var col = this.terminal.getCursorColumn() + 1;
        this.terminal.io.sendString('\x1b[' + row + ';' + col + 'R');
      }
    };

    /**
     * Disable modifiers which may be enabled via CSI['>m'].
     *
     * Will not implement.
     */
    VT.CSI['>n'] = VT.ignore;

    /**
     * Device Status Report (DSR, DEC Specific).
     *
     * 6  - Report Cursor Position (CPR) [row;column] as CSI ? r ; c R
     * 15 - Report Printer status as CSI ? 1 0 n (ready) or
     *      CSI ? 1 1 n (not ready).
     * 25 - Report UDK status as CSI ? 2 0 n (unlocked) or CSI ? 2 1 n (locked).
     * 26 - Report Keyboard status as CSI ? 2 7 ; 1 ; 0 ; 0 n (North American).
     *      The last two parameters apply to VT400 & up, and denote keyboard ready
     *      and LK01 respectively.
     * 53 - Report Locator status as CSI ? 5 3 n Locator available, if compiled-in,
     *      or CSI ? 5 0 n No Locator, if not.
     */
    VT.CSI['?n'] = function(parseState) {
      if (parseState.args[0] == '6') {
        var row = this.terminal.getCursorRow() + 1;
        var col = this.terminal.getCursorColumn() + 1;
        this.terminal.io.sendString('\x1b[' + row + ';' + col + 'R');
      } else if (parseState.args[0] == '15') {
        this.terminal.io.sendString('\x1b[?11n');
      } else if (parseState.args[0] == '25') {
        this.terminal.io.sendString('\x1b[?21n');
      } else if (parseState.args[0] == '26') {
        this.terminal.io.sendString('\x1b[?12;1;0;0n');
      } else if (parseState.args[0] == '53') {
        this.terminal.io.sendString('\x1b[?50n');
      }
    };

    /**
     * This is used by xterm to decide whether to hide the pointer cursor as the
     * user types.
     *
     * Valid values for the parameter:
     *   0 - Never hide the pointer.
     *   1 - Hide if the mouse tracking mode is not enabled.
     *   2 - Always hide the pointer.
     *
     * If no parameter is given, xterm uses the default, which is 1.
     *
     * Not currently implemented.
     */
    VT.CSI['>p'] = VT.ignore;

    /**
     * Soft terminal reset (DECSTR).
     */
    VT.CSI['!p'] = function() {
      this.reset();
      this.terminal.softReset();
    };

    /**
     * Request ANSI Mode (DECRQM).
     *
     * Not currently implemented.
     */
    VT.CSI['$p'] = VT.ignore;
    VT.CSI['?$p'] = VT.ignore;

    /**
     * Set conformance level (DECSCL).
     *
     * Not currently implemented.
     */
    VT.CSI['"p'] = VT.ignore;

    /**
     * Load LEDs (DECLL).
     *
     * Not currently implemented.  Could be implemented as virtual LEDs overlaying
     * the terminal if anyone cares.
     */
    VT.CSI['q'] = VT.ignore;

    /**
     * Set cursor style (DECSCUSR, VT520).
     *
     *   0 - Blinking block.
     *   1 - Blinking block (default).
     *   2 - Steady block.
     *   3 - Blinking underline.
     *   4 - Steady underline.
     */
    VT.CSI[' q'] = function(parseState) {
      var arg = parseState.args[0];

      if (arg == '0' || arg == '1') {
        this.terminal.setCursorShape(cursorShape.BLOCK);
        this.terminal.setCursorBlink(true);
      } else if (arg == '2') {
        this.terminal.setCursorShape(cursorShape.BLOCK);
        this.terminal.setCursorBlink(false);
      } else if (arg == '3') {
        this.terminal.setCursorShape(cursorShape.UNDERLINE);
        this.terminal.setCursorBlink(true);
      } else if (arg == '4') {
        this.terminal.setCursorShape(cursorShape.UNDERLINE);
        this.terminal.setCursorBlink(false);
      } else {
        console.warn('Unknown cursor style: ' + arg);
      }
    };

    /**
     * Select character protection attribute (DECSCA).
     *
     * Will not implement.
     */
    VT.CSI['"q'] = VT.ignore;

    /**
     * Set Scrolling Region (DECSTBM).
     */
    VT.CSI['r'] = function(parseState) {
      var args = parseState.args;
      var scrollTop = args[0] ? parseInt(args[0], 10) -1 : null;
      var scrollBottom = args[1] ? parseInt(args[1], 10) - 1 : null;
      this.terminal.setVTScrollRegion(scrollTop, scrollBottom);
      this.terminal.setCursorPosition(0, 0);
    };

    /**
     * Restore DEC Private Mode Values.
     *
     * Will not implement.
     */
    VT.CSI['?r'] = VT.ignore;

    /**
     * Change Attributes in Rectangular Area (DECCARA)
     *
     * Will not implement.
     */
    VT.CSI['$r'] = VT.ignore;

    /**
     * Save cursor (ANSI.SYS)
     */
    VT.CSI['s'] = function() {
      this.savedState_.save();
    };

    /**
     * Save DEC Private Mode Values.
     *
     * Will not implement.
     */
    VT.CSI['?s'] = VT.ignore;

    /**
     * Window manipulation (from dtterm, as well as extensions).
     *
     * Will not implement.
     */
    VT.CSI['t'] = VT.ignore;

    /**
     * Reverse Attributes in Rectangular Area (DECRARA).
     *
     * Will not implement.
     */
    VT.CSI['$t'] = VT.ignore;

    /**
     * Set one or more features of the title modes.
     *
     * Will not implement.
     */
    VT.CSI['>t'] = VT.ignore;

    /**
     * Set warning-bell volume (DECSWBV, VT520).
     *
     * Will not implement.
     */
    VT.CSI[' t'] = VT.ignore;

    /**
     * Restore cursor (ANSI.SYS).
     */
    VT.CSI['u'] = function() {
      this.savedState_.restore();
    };

    /**
     * Set margin-bell volume (DECSMBV, VT520).
     *
     * Will not implement.
     */
    VT.CSI[' u'] = VT.ignore;

    /**
     * Copy Rectangular Area (DECCRA, VT400 and up).
     *
     * Will not implement.
     */
    VT.CSI['$v'] = VT.ignore;

    /**
     * Enable Filter Rectangle (DECEFR).
     *
     * Will not implement.
     */
    VT.CSI['\'w'] = VT.ignore;

    /**
     * Request Terminal Parameters (DECREQTPARM).
     *
     * Not currently implemented.
     */
    VT.CSI['x'] = VT.ignore;

    /**
     * Select Attribute Change Extent (DECSACE).
     *
     * Will not implement.
     */
    VT.CSI['*x'] = VT.ignore;

    /**
     * Fill Rectangular Area (DECFRA), VT420 and up.
     *
     * Will not implement.
     */
    VT.CSI['$x'] = VT.ignore;

    /**
     * vt_tiledata (as used by NAOhack and UnNetHack)
     * (see http://nethackwiki.com/wiki/Vt_tiledata for more info)
     *
     * Implemented as far as we care (start a glyph and end a glyph).
     */
    VT.CSI['z'] = function(parseState) {
      if (parseState.args.length < 1)
        return;
      var arg = parseState.args[0];
      if (arg == '0') {
        // Start a glyph (one parameter, the glyph number).
        if (parseState.args.length < 2)
          return;
        this.terminal.getTextAttributes().tileData = parseState.args[1];
      } else if (arg == '1') {
        // End a glyph.
        this.terminal.getTextAttributes().tileData = null;
      }
    };

    /**
     * Enable Locator Reporting (DECELR).
     *
     * Not currently implemented.
     */
    VT.CSI['\'z'] = VT.ignore;

    /**
     * Erase Rectangular Area (DECERA), VT400 and up.
     *
     * Will not implement.
     */
    VT.CSI['$z'] = VT.ignore;

    /**
     * Select Locator Events (DECSLE).
     *
     * Not currently implemented.
     */
    VT.CSI['\'{'] = VT.ignore;

    /**
     * Request Locator Position (DECRQLP).
     *
     * Not currently implemented.
     */
    VT.CSI['\'|'] = VT.ignore;

    /**
     * Insert Columns (DECIC), VT420 and up.
     *
     * Will not implement.
     */
    VT.CSI[' }'] = VT.ignore;

    /**
     * Delete P s Columns (DECDC), VT420 and up.
     *
     * Will not implement.
     */
    VT.CSI[' ~'] = VT.ignore;
  });