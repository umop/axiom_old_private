#!/usr/bin/env nodejs

if (!process.env.NODE_PATH) {
  console.log('Please set NODE_PATH to an absolute /path/to/axiom/tmp/cjs/lib');
  process.exit(-1);
}

global.Promise = require('es6-promise').Promise;

require('source-map-support').install();

var AxiomError = require('axiom/core/error').default;
var Path = require('axiom/fs/path').default;
var FileSystemManager = require('axiom/fs/base/file_system_manager').default;
var JsFileSystem = require('axiom/fs/js/file_system').default;
var NodeFileSystem = require('axiom/fs/node/file_system').default;
var TTYState = require('axiom/fs/tty_state').default;
var washExecutables = require('wash/exe_modules').dir;

if ('setRawMode' in process.stdin) {
  // Stdin seems to be missing setRawMode under grunt.
  process.stdin.setRawMode(true);
}

function onResize(cx) {
  var tty = new TTYState();
  tty.isatty = process.stdout.isTTY;
  tty.rows = process.stdout.rows;
  tty.columns = process.stdout.columns;
  cx.setTTY(tty);
}

function startWash(fsm) {
  return fsm.createExecuteContext(new Path('jsfs:exe/wash'), {}).then(
    function(cx) {
      cx.stdoutStream.onData.addListener(function(value) {
        process.stdout.write(value);
      });

      cx.stderrStream.onData.addListener(function(value) {
        process.stderr.write(value);
      });

      cx.onClose.addListener(function(reason, value) {
        console.log('wash closed: ' + reason + ', ' + value);
      });

      process.stdin.on('data', function(buffer) {
        if (buffer == '\x03')
          cx.closeError(new AxiomError.Interrupt());

        cx.stdin(buffer.toString());
      });

      onResize(cx);
      process.stdout.on('resize', onResize.bind(null, cx));

      cx.setEnv('@PATH', ['jsfs:exe']);

      return cx.execute();
    });
}

function main() {
  var jsfs = new JsFileSystem();
  var fsm = jsfs.fileSystemManager;
  return jsfs.rootDirectory.mkdir('exe').then(function(jsdir) {
    jsdir.install(washExecutables);
    mountNodefs(fsm);
    return startWash(fsm);
  });
}

function mountNodefs(fsm) {
  var fs = require('fs');
  NodeFileSystem.mount(fsm, 'nodefs', fs);
}

module.exports = { main: main };

if (/wash.js$/.test(process.argv[1])) {
  // Keep node from exiting due to lack of events.
  var aliveInterval = setInterval(function() {}, 60 * 1000);

  main().then(function(value) {
    console.log('exit:', value);
    process.exit();
  }).catch(function(err) {
    console.log('Uncaught exception:', err, err.stack);
    process.exit();
  });
}
