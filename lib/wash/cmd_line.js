// Copyright (c) 2014 The Axiom Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import AxiomError from 'axiom/core/error';
import {unescape} from 'wash/string_utils';
// import minimist from 'minimist';

// TODO(ussuri): Support command substitutions that use the $(command) syntax.

/**
 * Class used to interpolate and parse command lines.
 *
 * @param {object} envVars Dictionary of environment variables.
 * @param {ExecuteContext} executeContext The current execute context. Used
 *    to interpole environment variables in the command line.
// * @param {object} opt_options Dictionary of parsing options as defined by
// * minimist (see https://www.npmjs.com/package/minimist):
// *    opts.string - a string or array of strings - argument names
// *        to always treat as strings;
// *    opts.boolean - a boolean, string or array of strings to always
// *        treat as booleans. if true will treat all double hyphenated arguments
// *        without equal signs as boolean (e.g. --foo, but not -f or --foo=bar);
// *    opts.alias - an object mapping string names to strings or arrays of
// *        string argument names to use as aliases;
// *    opts.default - an object mapping string argument names to
// *        default values;
// *    opts.stopEarly - when true, populate argv._ with everything after
// *        the first non-option
// *    opts['--'] - when true, populate argv._ with everything before
// *        the -- and argv['--'] with everything after the --.
// *    opts.unknown - a function which is invoked with a command line
// *        parameter not defined in the opts configuration object. If the
// *        function returns false, the unknown option is not added to argv.
 */
export var CmdLine = function(executeContext, opt_options) {
  this.executeContext_ = executeContext;
  this.options_ = opt_options || {};
};
export default CmdLine;

/**
 * A wrapper class representing a backticked `subcommand`.
 */
CmdLine.Subcommand = function(subCmdLine) {
  this.CmdLine = subCmdLine;
};

/**
 * Private constants used for command line parsing.
 *
 * NOTE: A literal backslash in the input has to be escaped twice: once for
 * regexes and once for JavaScript.
 */
// Core: a backslash-escaped character or a character that's not a backslash:
// abc$def-123\'
CmdLine.SIMPLE_VAL_ = '(?:\\\\.|[^\'"`\\\\])+?';
// ' abc "def" $xyz \' - single-quotes protect even against escaping.
CmdLine.SINGLE_QUOTED_VAL_ = '\'[^\']*?\'';
// " abc 'def' $xyz \" "
CmdLine.DOUBLE_QUOTED_VAL_ = '"(?:\\\\.|[^"\\\\])*?"';
// `cat $fname.txt`
CmdLine.BACKTICK_CMD_ = '`(?:\\\\.|[^`\\\\])*?`';
CmdLine.ANY_VAL_ =
    '(?:' +
    CmdLine.SINGLE_QUOTED_VAL_ + '|' +
    CmdLine.DOUBLE_QUOTED_VAL_ + '|' +
    CmdLine.BACKTICK_CMD_ + '|' +
    CmdLine.SIMPLE_VAL_ +
    ')';
// abc_123-def$xyz
CmdLine.OPT_ATOM_ = '[$\\w][$\\w-]';
// -a7 || -abc || -abc7 || ...
CmdLine.SHORT_OPT_BLOCK_ = '-' + CmdLine.OPT_ATOM_ + '+';
// --long-opt val || --long-opt=val || --long-opt=" val " || ...
CmdLine.LONG_OPT_ = '--' + CmdLine.OPT_ATOM_ + '+(?:=' + CmdLine.ANY_VAL_ + ')?';
CmdLine.OPTS_STOP_ = '--';
CmdLine.TOKEN_ =
    '(?:^|\\s+)(' +
    CmdLine.SHORT_OPT_BLOCK_ + '|' +
    CmdLine.LONG_OPT_ + '|' +
    CmdLine.ANY_VAL_ + '|' +
    CmdLine.OPTS_STOP_ +
    ')(?:$|\\s+)';

CmdLine.SINGLE_QUOTED_VAL_RE_ = new RegExp(CmdLine.SINGLE_QUOTED_VAL_);
CmdLine.DOUBLE_QUOTED_VAL_RE_ = new RegExp(CmdLine.DOUBLE_QUOTED_VAL_);
CmdLine.BACKTICK_CMD_RE_ = new RegExp(CmdLine.BACKTICK_CMD_);
// The resulting regex (slightly modified to be suitable for a full string
// repeated search) is here: https://www.regex101.com/r/uN6zW4/2
CmdLine.NEXT_TOKEN_RE_ = new RegExp('^' + CmdLine.TOKEN_);

/**
 * Tokenize a command line.
 *
 * @param {string} cmdLine Input raw command line.
 * @return {Array} A list of command line tokens: option names, option values,
 *    arguments. Note that the long option form --opt=val is returned as
 *    a single token, while the form --opt val is split into two tokens.
 */
CmdLine.prototype.tokenize_ = function(cmdLine) {
  // Repeatedly look for a token match in the line until the whole line is
  // parsed or we can't match anymore.
  var unparsed = cmdLine;
  var tokens = [];
  var match;
  while ((match = CmdLine.NEXT_TOKEN_RE_.exec(unparsed)) !== null) {
    // Check.ne(unparsed.length, 0);
    tokens.push(match[1]);
    unparsed = unparsed.substr(match[0].length);
  }

  // Some part of the line couldn't be parsed: throw a diagnostic error.
  if (unparsed.length !== 0) {
    var parsedLength = cmdLine.length - unparsed.length;
    throw new AxiomError(
        'Malformed command line:\n' +
        cmdLine + '\n' +
        ' '.repeat(parsedLength) + '^'.repeat(unparsed.length));
  }
  return tokens;
};

/**
 * Interpolate environment variables inside double-quoted and naked values in
 * a tokenized ARGV array before it goes into parsing.
 *
 * @param {Array} argvTokens ARGV dictionary.
 * @return {Array} Interpolated ARGV dictionary.
 */
CmdLine.prototype.interpolate_ = function(argvTokens) {
  var interpTokens = [];

  for (var i = 0; i < argvTokens.length; ++i) {
    var token = argvTokens[i];
    if (CmdLine.SINGLE_QUOTED_VAL_RE_.test(token)) {
      // Return unchanged: single-quotes protect against interpolation.
      interpTokens.push(token);
    } else if (CmdLine.DOUBLE_QUOTED_VAL_RE_.test(token)) {
      // Interpolate: double-quotes don't protect.
      interpTokens.push(this.interpolateToken_(token));
    } else if (CmdLine.BACKTICK_CMD_RE_.test(token)) {
      // Return unchanged: this will be converted into a [Subcommand] in
      // [finalize_] so the client can recursively process it the same way as
      // the top-level command, thus indirectly interpolating later.
      interpTokens.push(token);
    } else {
      // Interpolate: can be an option name or a value, an argument, or
      // something else unprotected by single-quotes or backticks.
      // In this case, we also pass the result through a secondary tokenization,
      // since environment variables containing whitespace may have to be
      // expanded into multiple final tokens.
      interpTokens.push.apply(interpTokens,
          this.tokenize_(this.interpolateToken_(token)));
    }
  }

  return interpTokens;
};

CmdLine.prototype.interpolateToken_ = function(token) {
  return this.executeContext_.interpolateEnvs(token);
};

/**
 * Finalize option and argument string values in an ARGV array:
 * - Trim the enclosing quotes around single- and double-quoted values.
 * - Unescape escaped character sequences.
 * - Convert backtick-quoted command substitutions into [Subcommand] objects
 *
 * @param {Object} argv Parsed and interpolated ARGV dictionary.
 * @return {Object} Finalized ARGV dictionary.
 */
CmdLine.prototype.finalize_ = function(argv) {
  for (var key in argv) {
    var val = argv[key];
    if (typeof val === 'object') {
      argv[key] = this.finalize_(val);
    } else if (typeof val === 'string') {
      argv[key] = this.finalizeToken_(val);
    } else {
      // Do nothing.
      argv[key] = val;
    }
  }
  return argv;
};

CmdLine.prototype.finalizeToken_ = function(token) {
  if (CmdLine.SINGLE_QUOTED_VAL_RE_.test(token)) {
    return this.unquote_(token);
  } else if (CmdLine.DOUBLE_QUOTED_VAL_RE_.test(token)) {
    return this.unquoteAndUnescape_(token);
  } else if (CmdLine.BACKTICK_CMD_RE_.test(token)) {
    return new CmdLine.Subcommand(this.unquote_(token));
  } else {
    return this.unescape_(token);
  }
};

CmdLine.prototype.unquote_ = function(str) {
  return str.slice(1, -1);
};

CmdLine.prototype.unescape_ = function(str) {
  return unescape(str);
};

CmdLine.prototype.unquoteAndUnescape_ = function(str) {
  return this.unescape_(this.unquote_(str));
};

/**
 * Parse a command line into a dictionary of options with values and arguments.
 *
 * @param {String} cmdLineStr
 * @return {Object} ARGV dictionary, with one key-value pair per option:
 * - Argv._ contains all the arguments that didn't have an option associated
 *    with them.
 * - Numeric-looking arguments will be returned as numbers unless
 *    opts.string or opts.boolean is set for that argument name.
 * - Any arguments after '--' will not be parsed and will end up in argv._.
 * - Command substitution is not performed for `command`:
 *    the entire enclosed string is returned as a single entity, either as an
 *    element of Argv._ or as a value of an option, with the backticks
 *    preserved. The client should find such enclosed commands, recursively
 *    parse them using this function, execute them, and replace the original
 *    value with the result.
 * - NOTE: command substitution via the $(command) syntax isn't supported yet.
 *
 * Example:
 *   new CmdLine().parse('-x 3 -y 4 -n5 -abc 6 --beep=boop foo bar baz')
 * =>
 *   { _: [ 'foo', 'bar', 'baz' ],
 *     x: 3,
 *     y: 4,
 *     n: 5,
 *     a: true,
 *     b: true,
 *     c: 6,
 *     beep: 'boop'
 *   }
 */
CmdLine.prototype.parse = function(cmdLine) {
  var tokenizedArgv = this.tokenize_(cmdLine);
  var interpolatedArgv = this.interpolate_(tokenizedArgv);
  // var parsedArgv = minimist(interpolatedArgv, this.options_);
  var parsedArgv = {};
  var finalArgv = this.finalize_(parsedArgv);
  return finalArgv;
};
