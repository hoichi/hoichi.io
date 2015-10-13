## streams

Mostly quoting the [stream-handbook](https://github.com/substack/stream-handbook)

### pipe
.pipe() is just a function that takes a readable source stream src and hooks the output to a destination writable stream dst:

```js
src.pipe(dst)
```

.pipe(dst) returns dst so that you can chain together multiple .pipe() calls together:

```js
a.pipe(b).pipe(c).pipe(d)
```

### readable stream ###


```js
var Readable = require('stream').Readable,
    rs = new Readable;

rs.push('beep ');
rs.push('boop\n');
rs.push(null);

rs.pipe(process.stdout);
```

Or, we could wait before the writable stream _asks_ for data:

```js
rs._read = function () {
    rs.push(String.fromCharCode(c++));
    if (c > 'z'.charCodeAt(0)) rs.push(null);
};

rs.pipe(process.stdout);
```

Also, [some details on dealing with os](https://github.com/substack/stream-handbook#creating-a-readable-stream).

### writable stream ###

```js
var Writable = require('stream').Writable;
var ws = Writable();
ws._write = function (chunk, enc, next) {
    console.dir(chunk);
    next();
};

process.stdin.pipe(ws);
```

Writing:

```js
var fs = require('fs');
var ws = fs.createWriteStream('message.txt');

ws.write('beep ');

setTimeout(function () {
    ws.end('boop\n');
}, 1000);
```

If you care about high water marks and buffering, `.write()` returns false when there is more data than the `opts.highWaterMark` option passed to `Writable()` in the incoming buffer.

If you want to wait for the buffer to empty again, listen for a `'drain'` event.

### transform ###

Through streams are simple readable/writable (duplex) filters that transform input and produce output.

## Vinyl ##

(See https://medium.com/@contrahacks/gulp-3828e8126466)

[Vinyl](https://github.com/wearefractal/vinyl) is a very simple metadata object that describes a file. When you think of a file, two attributes come to mind: path and contents. These are the main attributes on a Vinyl object.

### Vinyl Adapters ###

https://github.com/wearefractal/vinyl

Each file source needs what I call a “Vinyl adapter”. A Vinyl adapter simply exposes a .src(globs), a .dest(folder), and a .watch(globs, fn). The src stream produces file objects, and the dest stream consumes file objects.

### vinyl-fs ###

https://github.com/wearefractal/vinyl-fs

A vinyl adapter for a local file system.

This stream emits matching vinyl File objects.

## Through2 ##

https://www.npmjs.com/package/through2

### API ###

```through2([ options, ] [ transformFunction ] [, flushFunction ])```

On transform:
https://nodejs.org/docs/latest/api/stream.html#stream_transform_transform_chunk_encoding_callback