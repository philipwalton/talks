(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _getPageStyles = require('../src/get-page-styles');

var _getPageStyles2 = _interopRequireDefault(_getPageStyles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _getPageStyles2.default)().then(function (css) {
  return _postcss2.default.parse(css);
}).then(function (ast) {
  return console.log(ast);
});

},{"../src/get-page-styles":2,"postcss":27}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  // Query the document for any element that could have styles.
  var styleElements = [].concat(_toConsumableArray(document.querySelectorAll('style, link[rel="stylesheet"]')));

  // Fetch all styles and ensure the results are in document order.
  // Resolve with a single string of CSS text.
  return Promise.all(styleElements.map(function (el) {
    if (el.href) {
      return fetch(el.href).then(function (response) {
        return response.text();
      });
    } else {
      return el.innerText;
    }
  })).then(function (stylesArray) {
    return stylesArray.join('\n');
  });
};

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

;

},{}],3:[function(require,module,exports){
'use strict';
module.exports = function () {
	return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
};

},{}],4:[function(require,module,exports){
'use strict';

function assembleStyles () {
	var styles = {
		modifiers: {
			reset: [0, 0],
			bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		colors: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39]
		},
		bgColors: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49]
		}
	};

	// fix humans
	styles.colors.grey = styles.colors.gray;

	Object.keys(styles).forEach(function (groupName) {
		var group = styles[groupName];

		Object.keys(group).forEach(function (styleName) {
			var style = group[styleName];

			styles[styleName] = group[styleName] = {
				open: '\u001b[' + style[0] + 'm',
				close: '\u001b[' + style[1] + 'm'
			};
		});

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	});

	return styles;
}

Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});

},{}],5:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"base64-js":5,"ieee754":11,"isarray":12}],8:[function(require,module,exports){
(function (process){
'use strict';
var escapeStringRegexp = require('escape-string-regexp');
var ansiStyles = require('ansi-styles');
var stripAnsi = require('strip-ansi');
var hasAnsi = require('has-ansi');
var supportsColor = require('supports-color');
var defineProps = Object.defineProperties;
var isSimpleWindowsTerm = process.platform === 'win32' && !/^xterm/i.test(process.env.TERM);

function Chalk(options) {
	// detect mode if not set manually
	this.enabled = !options || options.enabled === undefined ? supportsColor : options.enabled;
}

// use bright blue on Windows as the normal blue color is illegible
if (isSimpleWindowsTerm) {
	ansiStyles.blue.open = '\u001b[94m';
}

var styles = (function () {
	var ret = {};

	Object.keys(ansiStyles).forEach(function (key) {
		ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');

		ret[key] = {
			get: function () {
				return build.call(this, this._styles.concat(key));
			}
		};
	});

	return ret;
})();

var proto = defineProps(function chalk() {}, styles);

function build(_styles) {
	var builder = function () {
		return applyStyle.apply(builder, arguments);
	};

	builder._styles = _styles;
	builder.enabled = this.enabled;
	// __proto__ is used because we must return a function, but there is
	// no way to create a function with a different prototype.
	/* eslint-disable no-proto */
	builder.__proto__ = proto;

	return builder;
}

function applyStyle() {
	// support varags, but simply cast to string in case there's only one arg
	var args = arguments;
	var argsLen = args.length;
	var str = argsLen !== 0 && String(arguments[0]);

	if (argsLen > 1) {
		// don't slice `arguments`, it prevents v8 optimizations
		for (var a = 1; a < argsLen; a++) {
			str += ' ' + args[a];
		}
	}

	if (!this.enabled || !str) {
		return str;
	}

	var nestedStyles = this._styles;
	var i = nestedStyles.length;

	// Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
	// see https://github.com/chalk/chalk/issues/58
	// If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
	var originalDim = ansiStyles.dim.open;
	if (isSimpleWindowsTerm && (nestedStyles.indexOf('gray') !== -1 || nestedStyles.indexOf('grey') !== -1)) {
		ansiStyles.dim.open = '';
	}

	while (i--) {
		var code = ansiStyles[nestedStyles[i]];

		// Replace any instances already present with a re-opening code
		// otherwise only the part of the string until said closing code
		// will be colored, and the rest will simply be 'plain'.
		str = code.open + str.replace(code.closeRe, code.open) + code.close;
	}

	// Reset the original 'dim' if we changed it to work around the Windows dimmed gray issue.
	ansiStyles.dim.open = originalDim;

	return str;
}

function init() {
	var ret = {};

	Object.keys(styles).forEach(function (name) {
		ret[name] = {
			get: function () {
				return build.call(this, [name]);
			}
		};
	});

	return ret;
}

defineProps(Chalk.prototype, init());

module.exports = new Chalk();
module.exports.styles = ansiStyles;
module.exports.hasColor = hasAnsi;
module.exports.stripColor = stripAnsi;
module.exports.supportsColor = supportsColor;

}).call(this,require('_process'))

},{"_process":41,"ansi-styles":4,"escape-string-regexp":9,"has-ansi":10,"strip-ansi":53,"supports-color":54}],9:[function(require,module,exports){
'use strict';

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

module.exports = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe, '\\$&');
};

},{}],10:[function(require,module,exports){
'use strict';
var ansiRegex = require('ansi-regex');
var re = new RegExp(ansiRegex().source); // remove the `g` flag
module.exports = re.test.bind(re);

},{"ansi-regex":3}],11:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],12:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],13:[function(require,module,exports){
/*
 * $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *    http://opensource.org/licenses/mit-license
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

(function(global) {
    'use strict';
    // existing version for noConflict()
    var _Base64 = global.Base64;
    var version = "2.1.9";
    // if node.js, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        try {
            buffer = require('buffer').Buffer;
        } catch (err) {}
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer ? function (u) {
        return (u.constructor === buffer.constructor ? u : new buffer(u))
        .toString('base64')
    }
    : function (u) { return btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe
            ? _encode(String(u))
            : _encode(String(u)).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
    var _decode = buffer ? function(a) {
        return (a.constructor === buffer.constructor
                ? a : new buffer(a, 'base64')).toString();
    }
    : function(a) { return btou(atob(a)) };
    var decode = function(a){
        return _decode(
            String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    // that's it!
    if (global['Meteor']) {
       Base64 = global.Base64; // for normal export in Meteor.js
    }
})(this);

},{"buffer":7}],14:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":41}],15:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _warnOnce = require('./warn-once');

var _warnOnce2 = _interopRequireDefault(_warnOnce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Represents an at-rule.
 *
 * If it’s followed in the CSS by a {} block, this node will have
 * a nodes property representing its children.
 *
 * @extends Container
 *
 * @example
 * const root = postcss.parse('@charset "UTF-8"; @media print {}');
 *
 * const charset = root.first;
 * charset.type  //=> 'atrule'
 * charset.nodes //=> undefined
 *
 * const media = root.last;
 * media.nodes   //=> []
 */
var AtRule = function (_Container) {
    _inherits(AtRule, _Container);

    function AtRule(defaults) {
        _classCallCheck(this, AtRule);

        var _this = _possibleConstructorReturn(this, _Container.call(this, defaults));

        _this.type = 'atrule';
        return _this;
    }

    AtRule.prototype.append = function append() {
        var _Container$prototype$;

        if (!this.nodes) this.nodes = [];

        for (var _len = arguments.length, children = Array(_len), _key = 0; _key < _len; _key++) {
            children[_key] = arguments[_key];
        }

        return (_Container$prototype$ = _Container.prototype.append).call.apply(_Container$prototype$, [this].concat(children));
    };

    AtRule.prototype.prepend = function prepend() {
        var _Container$prototype$2;

        if (!this.nodes) this.nodes = [];

        for (var _len2 = arguments.length, children = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            children[_key2] = arguments[_key2];
        }

        return (_Container$prototype$2 = _Container.prototype.prepend).call.apply(_Container$prototype$2, [this].concat(children));
    };

    _createClass(AtRule, [{
        key: 'afterName',
        get: function get() {
            (0, _warnOnce2.default)('AtRule#afterName was deprecated. Use AtRule#raws.afterName');
            return this.raws.afterName;
        },
        set: function set(val) {
            (0, _warnOnce2.default)('AtRule#afterName was deprecated. Use AtRule#raws.afterName');
            this.raws.afterName = val;
        }
    }, {
        key: '_params',
        get: function get() {
            (0, _warnOnce2.default)('AtRule#_params was deprecated. Use AtRule#raws.params');
            return this.raws.params;
        },
        set: function set(val) {
            (0, _warnOnce2.default)('AtRule#_params was deprecated. Use AtRule#raws.params');
            this.raws.params = val;
        }

        /**
         * @memberof AtRule#
         * @member {string} name - the at-rule’s name immediately follows the `@`
         *
         * @example
         * const root  = postcss.parse('@media print {}');
         * media.name //=> 'media'
         * const media = root.first;
         */

        /**
         * @memberof AtRule#
         * @member {string} params - the at-rule’s parameters, the values
         *                           that follow the at-rule’s name but precede
         *                           any {} block
         *
         * @example
         * const root  = postcss.parse('@media print, screen {}');
         * const media = root.first;
         * media.params //=> 'print, screen'
         */

        /**
         * @memberof AtRule#
         * @member {object} raws - Information to generate byte-to-byte equal
         *                         node string as it was in the origin input.
         *
         * Every parser saves its own properties,
         * but the default CSS parser uses:
         *
         * * `before`: the space symbols before the node. It also stores `*`
         *   and `_` symbols before the declaration (IE hack).
         * * `after`: the space symbols after the last child of the node
         *   to the end of the node.
         * * `between`: the symbols between the property and value
         *   for declarations, selector and `{` for rules, or last parameter
         *   and `{` for at-rules.
         * * `semicolon`: contains true if the last child has
         *   an (optional) semicolon.
         * * `afterName`: the space between the at-rule name and its parameters.
         *
         * PostCSS cleans at-rule parameters from comments and extra spaces,
         * but it stores origin content in raws properties.
         * As such, if you don’t change a declaration’s value,
         * PostCSS will use the raw value with comments.
         *
         * @example
         * const root = postcss.parse('  @media\nprint {\n}')
         * root.first.first.raws //=> { before: '  ',
         *                       //     between: ' ',
         *                       //     afterName: '\n',
         *                       //     after: '\n' }
         */

    }]);

    return AtRule;
}(_container2.default);

exports.default = AtRule;
module.exports = exports['default'];


},{"./container":17,"./warn-once":38}],16:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _warnOnce = require('./warn-once');

var _warnOnce2 = _interopRequireDefault(_warnOnce);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Represents a comment between declarations or statements (rule and at-rules).
 *
 * Comments inside selectors, at-rule parameters, or declaration values
 * will be stored in the `raws` properties explained above.
 *
 * @extends Node
 */
var Comment = function (_Node) {
    _inherits(Comment, _Node);

    function Comment(defaults) {
        _classCallCheck(this, Comment);

        var _this = _possibleConstructorReturn(this, _Node.call(this, defaults));

        _this.type = 'comment';
        return _this;
    }

    _createClass(Comment, [{
        key: 'left',
        get: function get() {
            (0, _warnOnce2.default)('Comment#left was deprecated. Use Comment#raws.left');
            return this.raws.left;
        },
        set: function set(val) {
            (0, _warnOnce2.default)('Comment#left was deprecated. Use Comment#raws.left');
            this.raws.left = val;
        }
    }, {
        key: 'right',
        get: function get() {
            (0, _warnOnce2.default)('Comment#right was deprecated. Use Comment#raws.right');
            return this.raws.right;
        },
        set: function set(val) {
            (0, _warnOnce2.default)('Comment#right was deprecated. Use Comment#raws.right');
            this.raws.right = val;
        }

        /**
         * @memberof Comment#
         * @member {string} text - the comment’s text
         */

        /**
         * @memberof Comment#
         * @member {object} raws - Information to generate byte-to-byte equal
         *                         node string as it was in the origin input.
         *
         * Every parser saves its own properties,
         * but the default CSS parser uses:
         *
         * * `before`: the space symbols before the node.
         * * `left`: the space symbols between `/*` and the comment’s text.
         * * `right`: the space symbols between the comment’s text.
         */

    }]);

    return Comment;
}(_node2.default);

exports.default = Comment;
module.exports = exports['default'];


},{"./node":24,"./warn-once":38}],17:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _declaration = require('./declaration');

var _declaration2 = _interopRequireDefault(_declaration);

var _warnOnce = require('./warn-once');

var _warnOnce2 = _interopRequireDefault(_warnOnce);

var _comment = require('./comment');

var _comment2 = _interopRequireDefault(_comment);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function cleanSource(nodes) {
    return nodes.map(function (i) {
        if (i.nodes) i.nodes = cleanSource(i.nodes);
        delete i.source;
        return i;
    });
}

/**
 * The {@link Root}, {@link AtRule}, and {@link Rule} container nodes
 * inherit some common methods to help work with their children.
 *
 * Note that all containers can store any content. If you write a rule inside
 * a rule, PostCSS will parse it.
 *
 * @extends Node
 * @abstract
 */

var Container = function (_Node) {
    _inherits(Container, _Node);

    function Container() {
        _classCallCheck(this, Container);

        return _possibleConstructorReturn(this, _Node.apply(this, arguments));
    }

    Container.prototype.push = function push(child) {
        child.parent = this;
        this.nodes.push(child);
        return this;
    };

    /**
     * Iterates through the container’s immediate children,
     * calling `callback` for each child.
     *
     * Returning `false` in the callback will break iteration.
     *
     * This method only iterates through the container’s immediate children.
     * If you need to recursively iterate through all the container’s descendant
     * nodes, use {@link Container#walk}.
     *
     * Unlike the for `{}`-cycle or `Array#forEach` this iterator is safe
     * if you are mutating the array of child nodes during iteration.
     * PostCSS will adjust the current index to match the mutations.
     *
     * @param {childIterator} callback - iterator receives each node and index
     *
     * @return {false|undefined} returns `false` if iteration was broke
     *
     * @example
     * const root = postcss.parse('a { color: black; z-index: 1 }');
     * const rule = root.first;
     *
     * for ( let decl of rule.nodes ) {
     *     decl.cloneBefore({ prop: '-webkit-' + decl.prop });
     *     // Cycle will be infinite, because cloneBefore moves the current node
     *     // to the next index
     * }
     *
     * rule.each(decl => {
     *     decl.cloneBefore({ prop: '-webkit-' + decl.prop });
     *     // Will be executed only for color and z-index
     * });
     */


    Container.prototype.each = function each(callback) {
        if (!this.lastEach) this.lastEach = 0;
        if (!this.indexes) this.indexes = {};

        this.lastEach += 1;
        var id = this.lastEach;
        this.indexes[id] = 0;

        if (!this.nodes) return undefined;

        var index = void 0,
            result = void 0;
        while (this.indexes[id] < this.nodes.length) {
            index = this.indexes[id];
            result = callback(this.nodes[index], index);
            if (result === false) break;

            this.indexes[id] += 1;
        }

        delete this.indexes[id];

        return result;
    };

    /**
     * Traverses the container’s descendant nodes, calling callback
     * for each node.
     *
     * Like container.each(), this method is safe to use
     * if you are mutating arrays during iteration.
     *
     * If you only need to iterate through the container’s immediate children,
     * use {@link Container#each}.
     *
     * @param {childIterator} callback - iterator receives each node and index
     *
     * @return {false|undefined} returns `false` if iteration was broke
     *
     * @example
     * root.walk(node => {
     *   // Traverses all descendant nodes.
     * });
     */


    Container.prototype.walk = function walk(callback) {
        return this.each(function (child, i) {
            var result = callback(child, i);
            if (result !== false && child.walk) {
                result = child.walk(callback);
            }
            return result;
        });
    };

    /**
     * Traverses the container’s descendant nodes, calling callback
     * for each declaration node.
     *
     * If you pass a filter, iteration will only happen over declarations
     * with matching properties.
     *
     * Like {@link Container#each}, this method is safe
     * to use if you are mutating arrays during iteration.
     *
     * @param {string|RegExp} [prop]   - string or regular expression
     *                                   to filter declarations by property name
     * @param {childIterator} callback - iterator receives each node and index
     *
     * @return {false|undefined} returns `false` if iteration was broke
     *
     * @example
     * root.walkDecls(decl => {
     *   checkPropertySupport(decl.prop);
     * });
     *
     * root.walkDecls('border-radius', decl => {
     *   decl.remove();
     * });
     *
     * root.walkDecls(/^background/, decl => {
     *   decl.value = takeFirstColorFromGradient(decl.value);
     * });
     */


    Container.prototype.walkDecls = function walkDecls(prop, callback) {
        if (!callback) {
            callback = prop;
            return this.walk(function (child, i) {
                if (child.type === 'decl') {
                    return callback(child, i);
                }
            });
        } else if (prop instanceof RegExp) {
            return this.walk(function (child, i) {
                if (child.type === 'decl' && prop.test(child.prop)) {
                    return callback(child, i);
                }
            });
        } else {
            return this.walk(function (child, i) {
                if (child.type === 'decl' && child.prop === prop) {
                    return callback(child, i);
                }
            });
        }
    };

    /**
     * Traverses the container’s descendant nodes, calling callback
     * for each rule node.
     *
     * If you pass a filter, iteration will only happen over rules
     * with matching selectors.
     *
     * Like {@link Container#each}, this method is safe
     * to use if you are mutating arrays during iteration.
     *
     * @param {string|RegExp} [selector] - string or regular expression
     *                                     to filter rules by selector
     * @param {childIterator} callback   - iterator receives each node and index
     *
     * @return {false|undefined} returns `false` if iteration was broke
     *
     * @example
     * const selectors = [];
     * root.walkRules(rule => {
     *   selectors.push(rule.selector);
     * });
     * console.log(`Your CSS uses ${selectors.length} selectors`);
     */


    Container.prototype.walkRules = function walkRules(selector, callback) {
        if (!callback) {
            callback = selector;

            return this.walk(function (child, i) {
                if (child.type === 'rule') {
                    return callback(child, i);
                }
            });
        } else if (selector instanceof RegExp) {
            return this.walk(function (child, i) {
                if (child.type === 'rule' && selector.test(child.selector)) {
                    return callback(child, i);
                }
            });
        } else {
            return this.walk(function (child, i) {
                if (child.type === 'rule' && child.selector === selector) {
                    return callback(child, i);
                }
            });
        }
    };

    /**
     * Traverses the container’s descendant nodes, calling callback
     * for each at-rule node.
     *
     * If you pass a filter, iteration will only happen over at-rules
     * that have matching names.
     *
     * Like {@link Container#each}, this method is safe
     * to use if you are mutating arrays during iteration.
     *
     * @param {string|RegExp} [name]   - string or regular expression
     *                                   to filter at-rules by name
     * @param {childIterator} callback - iterator receives each node and index
     *
     * @return {false|undefined} returns `false` if iteration was broke
     *
     * @example
     * root.walkAtRules(rule => {
     *   if ( isOld(rule.name) ) rule.remove();
     * });
     *
     * let first = false;
     * root.walkAtRules('charset', rule => {
     *   if ( !first ) {
     *     first = true;
     *   } else {
     *     rule.remove();
     *   }
     * });
     */


    Container.prototype.walkAtRules = function walkAtRules(name, callback) {
        if (!callback) {
            callback = name;
            return this.walk(function (child, i) {
                if (child.type === 'atrule') {
                    return callback(child, i);
                }
            });
        } else if (name instanceof RegExp) {
            return this.walk(function (child, i) {
                if (child.type === 'atrule' && name.test(child.name)) {
                    return callback(child, i);
                }
            });
        } else {
            return this.walk(function (child, i) {
                if (child.type === 'atrule' && child.name === name) {
                    return callback(child, i);
                }
            });
        }
    };

    /**
     * Traverses the container’s descendant nodes, calling callback
     * for each comment node.
     *
     * Like {@link Container#each}, this method is safe
     * to use if you are mutating arrays during iteration.
     *
     * @param {childIterator} callback - iterator receives each node and index
     *
     * @return {false|undefined} returns `false` if iteration was broke
     *
     * @example
     * root.walkComments(comment => {
     *   comment.remove();
     * });
     */


    Container.prototype.walkComments = function walkComments(callback) {
        return this.walk(function (child, i) {
            if (child.type === 'comment') {
                return callback(child, i);
            }
        });
    };

    /**
     * Inserts new nodes to the start of the container.
     *
     * @param {...(Node|object|string|Node[])} children - new nodes
     *
     * @return {Node} this node for methods chain
     *
     * @example
     * const decl1 = postcss.decl({ prop: 'color', value: 'black' });
     * const decl2 = postcss.decl({ prop: 'background-color', value: 'white' });
     * rule.append(decl1, decl2);
     *
     * root.append({ name: 'charset', params: '"UTF-8"' });  // at-rule
     * root.append({ selector: 'a' });                       // rule
     * rule.append({ prop: 'color', value: 'black' });       // declaration
     * rule.append({ text: 'Comment' })                      // comment
     *
     * root.append('a {}');
     * root.first.append('color: black; z-index: 1');
     */


    Container.prototype.append = function append() {
        for (var _len = arguments.length, children = Array(_len), _key = 0; _key < _len; _key++) {
            children[_key] = arguments[_key];
        }

        for (var _iterator = children, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var child = _ref;

            var nodes = this.normalize(child, this.last);
            for (var _iterator2 = nodes, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
                var _ref2;

                if (_isArray2) {
                    if (_i2 >= _iterator2.length) break;
                    _ref2 = _iterator2[_i2++];
                } else {
                    _i2 = _iterator2.next();
                    if (_i2.done) break;
                    _ref2 = _i2.value;
                }

                var node = _ref2;
                this.nodes.push(node);
            }
        }
        return this;
    };

    /**
     * Inserts new nodes to the end of the container.
     *
     * @param {...(Node|object|string|Node[])} children - new nodes
     *
     * @return {Node} this node for methods chain
     *
     * @example
     * const decl1 = postcss.decl({ prop: 'color', value: 'black' });
     * const decl2 = postcss.decl({ prop: 'background-color', value: 'white' });
     * rule.prepend(decl1, decl2);
     *
     * root.append({ name: 'charset', params: '"UTF-8"' });  // at-rule
     * root.append({ selector: 'a' });                       // rule
     * rule.append({ prop: 'color', value: 'black' });       // declaration
     * rule.append({ text: 'Comment' })                      // comment
     *
     * root.append('a {}');
     * root.first.append('color: black; z-index: 1');
     */


    Container.prototype.prepend = function prepend() {
        for (var _len2 = arguments.length, children = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            children[_key2] = arguments[_key2];
        }

        children = children.reverse();
        for (var _iterator3 = children, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
            var _ref3;

            if (_isArray3) {
                if (_i3 >= _iterator3.length) break;
                _ref3 = _iterator3[_i3++];
            } else {
                _i3 = _iterator3.next();
                if (_i3.done) break;
                _ref3 = _i3.value;
            }

            var child = _ref3;

            var nodes = this.normalize(child, this.first, 'prepend').reverse();
            for (var _iterator4 = nodes, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
                var _ref4;

                if (_isArray4) {
                    if (_i4 >= _iterator4.length) break;
                    _ref4 = _iterator4[_i4++];
                } else {
                    _i4 = _iterator4.next();
                    if (_i4.done) break;
                    _ref4 = _i4.value;
                }

                var node = _ref4;
                this.nodes.unshift(node);
            }for (var id in this.indexes) {
                this.indexes[id] = this.indexes[id] + nodes.length;
            }
        }
        return this;
    };

    Container.prototype.cleanRaws = function cleanRaws(keepBetween) {
        _Node.prototype.cleanRaws.call(this, keepBetween);
        if (this.nodes) {
            for (var _iterator5 = this.nodes, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
                var _ref5;

                if (_isArray5) {
                    if (_i5 >= _iterator5.length) break;
                    _ref5 = _iterator5[_i5++];
                } else {
                    _i5 = _iterator5.next();
                    if (_i5.done) break;
                    _ref5 = _i5.value;
                }

                var node = _ref5;
                node.cleanRaws(keepBetween);
            }
        }
    };

    /**
     * Insert new node before old node within the container.
     *
     * @param {Node|number} exist             - child or child’s index.
     * @param {Node|object|string|Node[]} add - new node
     *
     * @return {Node} this node for methods chain
     *
     * @example
     * rule.insertBefore(decl, decl.clone({ prop: '-webkit-' + decl.prop }));
     */


    Container.prototype.insertBefore = function insertBefore(exist, add) {
        exist = this.index(exist);

        var type = exist === 0 ? 'prepend' : false;
        var nodes = this.normalize(add, this.nodes[exist], type).reverse();
        for (var _iterator6 = nodes, _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : _iterator6[Symbol.iterator]();;) {
            var _ref6;

            if (_isArray6) {
                if (_i6 >= _iterator6.length) break;
                _ref6 = _iterator6[_i6++];
            } else {
                _i6 = _iterator6.next();
                if (_i6.done) break;
                _ref6 = _i6.value;
            }

            var node = _ref6;
            this.nodes.splice(exist, 0, node);
        }var index = void 0;
        for (var id in this.indexes) {
            index = this.indexes[id];
            if (exist <= index) {
                this.indexes[id] = index + nodes.length;
            }
        }

        return this;
    };

    /**
     * Insert new node after old node within the container.
     *
     * @param {Node|number} exist             - child or child’s index
     * @param {Node|object|string|Node[]} add - new node
     *
     * @return {Node} this node for methods chain
     */


    Container.prototype.insertAfter = function insertAfter(exist, add) {
        exist = this.index(exist);

        var nodes = this.normalize(add, this.nodes[exist]).reverse();
        for (var _iterator7 = nodes, _isArray7 = Array.isArray(_iterator7), _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator]();;) {
            var _ref7;

            if (_isArray7) {
                if (_i7 >= _iterator7.length) break;
                _ref7 = _iterator7[_i7++];
            } else {
                _i7 = _iterator7.next();
                if (_i7.done) break;
                _ref7 = _i7.value;
            }

            var node = _ref7;
            this.nodes.splice(exist + 1, 0, node);
        }var index = void 0;
        for (var id in this.indexes) {
            index = this.indexes[id];
            if (exist < index) {
                this.indexes[id] = index + nodes.length;
            }
        }

        return this;
    };

    Container.prototype.remove = function remove(child) {
        if (typeof child !== 'undefined') {
            (0, _warnOnce2.default)('Container#remove is deprecated. ' + 'Use Container#removeChild');
            this.removeChild(child);
        } else {
            _Node.prototype.remove.call(this);
        }
        return this;
    };

    /**
     * Removes node from the container and cleans the parent properties
     * from the node and its children.
     *
     * @param {Node|number} child - child or child’s index
     *
     * @return {Node} this node for methods chain
     *
     * @example
     * rule.nodes.length  //=> 5
     * rule.removeChild(decl);
     * rule.nodes.length  //=> 4
     * decl.parent        //=> undefined
     */


    Container.prototype.removeChild = function removeChild(child) {
        child = this.index(child);
        this.nodes[child].parent = undefined;
        this.nodes.splice(child, 1);

        var index = void 0;
        for (var id in this.indexes) {
            index = this.indexes[id];
            if (index >= child) {
                this.indexes[id] = index - 1;
            }
        }

        return this;
    };

    /**
     * Removes all children from the container
     * and cleans their parent properties.
     *
     * @return {Node} this node for methods chain
     *
     * @example
     * rule.removeAll();
     * rule.nodes.length //=> 0
     */


    Container.prototype.removeAll = function removeAll() {
        for (var _iterator8 = this.nodes, _isArray8 = Array.isArray(_iterator8), _i8 = 0, _iterator8 = _isArray8 ? _iterator8 : _iterator8[Symbol.iterator]();;) {
            var _ref8;

            if (_isArray8) {
                if (_i8 >= _iterator8.length) break;
                _ref8 = _iterator8[_i8++];
            } else {
                _i8 = _iterator8.next();
                if (_i8.done) break;
                _ref8 = _i8.value;
            }

            var node = _ref8;
            node.parent = undefined;
        }this.nodes = [];
        return this;
    };

    /**
     * Passes all declaration values within the container that match pattern
     * through callback, replacing those values with the returned result
     * of callback.
     *
     * This method is useful if you are using a custom unit or function
     * and need to iterate through all values.
     *
     * @param {string|RegExp} pattern      - replace pattern
     * @param {object} opts                - options to speed up the search
     * @param {string|string[]} opts.props - an array of property names
     * @param {string} opts.fast           - string that’s used
     *                                       to narrow down values and speed up
                                             the regexp search
     * @param {function|string} callback   - string to replace pattern
     *                                       or callback that returns a new
     *                                       value.
     *                                       The callback will receive
     *                                       the same arguments as those
     *                                       passed to a function parameter
     *                                       of `String#replace`.
     *
     * @return {Node} this node for methods chain
     *
     * @example
     * root.replaceValues(/\d+rem/, { fast: 'rem' }, string => {
     *   return 15 * parseInt(string) + 'px';
     * });
     */


    Container.prototype.replaceValues = function replaceValues(pattern, opts, callback) {
        if (!callback) {
            callback = opts;
            opts = {};
        }

        this.walkDecls(function (decl) {
            if (opts.props && opts.props.indexOf(decl.prop) === -1) return;
            if (opts.fast && decl.value.indexOf(opts.fast) === -1) return;

            decl.value = decl.value.replace(pattern, callback);
        });

        return this;
    };

    /**
     * Returns `true` if callback returns `true`
     * for all of the container’s children.
     *
     * @param {childCondition} condition - iterator returns true or false.
     *
     * @return {boolean} is every child pass condition
     *
     * @example
     * const noPrefixes = rule.every(i => i.prop[0] !== '-');
     */


    Container.prototype.every = function every(condition) {
        return this.nodes.every(condition);
    };

    /**
     * Returns `true` if callback returns `true` for (at least) one
     * of the container’s children.
     *
     * @param {childCondition} condition - iterator returns true or false.
     *
     * @return {boolean} is some child pass condition
     *
     * @example
     * const hasPrefix = rule.some(i => i.prop[0] === '-');
     */


    Container.prototype.some = function some(condition) {
        return this.nodes.some(condition);
    };

    /**
     * Returns a `child`’s index within the {@link Container#nodes} array.
     *
     * @param {Node} child - child of the current container.
     *
     * @return {number} child index
     *
     * @example
     * rule.index( rule.nodes[2] ) //=> 2
     */


    Container.prototype.index = function index(child) {
        if (typeof child === 'number') {
            return child;
        } else {
            return this.nodes.indexOf(child);
        }
    };

    /**
     * The container’s first child.
     *
     * @type {Node}
     *
     * @example
     * rule.first == rules.nodes[0];
     */


    Container.prototype.normalize = function normalize(nodes, sample) {
        var _this2 = this;

        if (typeof nodes === 'string') {
            var parse = require('./parse');
            nodes = cleanSource(parse(nodes).nodes);
        } else if (!Array.isArray(nodes)) {
            if (nodes.type === 'root') {
                nodes = nodes.nodes;
            } else if (nodes.type) {
                nodes = [nodes];
            } else if (nodes.prop) {
                if (typeof nodes.value === 'undefined') {
                    throw new Error('Value field is missed in node creation');
                } else if (typeof nodes.value !== 'string') {
                    nodes.value = String(nodes.value);
                }
                nodes = [new _declaration2.default(nodes)];
            } else if (nodes.selector) {
                var Rule = require('./rule');
                nodes = [new Rule(nodes)];
            } else if (nodes.name) {
                var AtRule = require('./at-rule');
                nodes = [new AtRule(nodes)];
            } else if (nodes.text) {
                nodes = [new _comment2.default(nodes)];
            } else {
                throw new Error('Unknown node type in node creation');
            }
        }

        var processed = nodes.map(function (i) {
            if (typeof i.raws === 'undefined') i = _this2.rebuild(i);

            if (i.parent) i = i.clone();
            if (typeof i.raws.before === 'undefined') {
                if (sample && typeof sample.raws.before !== 'undefined') {
                    i.raws.before = sample.raws.before.replace(/[^\s]/g, '');
                }
            }
            i.parent = _this2;
            return i;
        });

        return processed;
    };

    Container.prototype.rebuild = function rebuild(node, parent) {
        var _this3 = this;

        var fix = void 0;
        if (node.type === 'root') {
            var Root = require('./root');
            fix = new Root();
        } else if (node.type === 'atrule') {
            var AtRule = require('./at-rule');
            fix = new AtRule();
        } else if (node.type === 'rule') {
            var Rule = require('./rule');
            fix = new Rule();
        } else if (node.type === 'decl') {
            fix = new _declaration2.default();
        } else if (node.type === 'comment') {
            fix = new _comment2.default();
        }

        for (var i in node) {
            if (i === 'nodes') {
                fix.nodes = node.nodes.map(function (j) {
                    return _this3.rebuild(j, fix);
                });
            } else if (i === 'parent' && parent) {
                fix.parent = parent;
            } else if (node.hasOwnProperty(i)) {
                fix[i] = node[i];
            }
        }

        return fix;
    };

    Container.prototype.eachInside = function eachInside(callback) {
        (0, _warnOnce2.default)('Container#eachInside is deprecated. ' + 'Use Container#walk instead.');
        return this.walk(callback);
    };

    Container.prototype.eachDecl = function eachDecl(prop, callback) {
        (0, _warnOnce2.default)('Container#eachDecl is deprecated. ' + 'Use Container#walkDecls instead.');
        return this.walkDecls(prop, callback);
    };

    Container.prototype.eachRule = function eachRule(selector, callback) {
        (0, _warnOnce2.default)('Container#eachRule is deprecated. ' + 'Use Container#walkRules instead.');
        return this.walkRules(selector, callback);
    };

    Container.prototype.eachAtRule = function eachAtRule(name, callback) {
        (0, _warnOnce2.default)('Container#eachAtRule is deprecated. ' + 'Use Container#walkAtRules instead.');
        return this.walkAtRules(name, callback);
    };

    Container.prototype.eachComment = function eachComment(callback) {
        (0, _warnOnce2.default)('Container#eachComment is deprecated. ' + 'Use Container#walkComments instead.');
        return this.walkComments(callback);
    };

    _createClass(Container, [{
        key: 'first',
        get: function get() {
            if (!this.nodes) return undefined;
            return this.nodes[0];
        }

        /**
         * The container’s last child.
         *
         * @type {Node}
         *
         * @example
         * rule.last == rule.nodes[rule.nodes.length - 1];
         */

    }, {
        key: 'last',
        get: function get() {
            if (!this.nodes) return undefined;
            return this.nodes[this.nodes.length - 1];
        }
    }, {
        key: 'semicolon',
        get: function get() {
            (0, _warnOnce2.default)('Node#semicolon is deprecated. Use Node#raws.semicolon');
            return this.raws.semicolon;
        },
        set: function set(val) {
            (0, _warnOnce2.default)('Node#semicolon is deprecated. Use Node#raws.semicolon');
            this.raws.semicolon = val;
        }
    }, {
        key: 'after',
        get: function get() {
            (0, _warnOnce2.default)('Node#after is deprecated. Use Node#raws.after');
            return this.raws.after;
        },
        set: function set(val) {
            (0, _warnOnce2.default)('Node#after is deprecated. Use Node#raws.after');
            this.raws.after = val;
        }

        /**
         * @memberof Container#
         * @member {Node[]} nodes - an array containing the container’s children
         *
         * @example
         * const root = postcss.parse('a { color: black }');
         * root.nodes.length           //=> 1
         * root.nodes[0].selector      //=> 'a'
         * root.nodes[0].nodes[0].prop //=> 'color'
         */

    }]);

    return Container;
}(_node2.default);

exports.default = Container;

/**
 * @callback childCondition
 * @param {Node} node    - container child
 * @param {number} index - child index
 * @param {Node[]} nodes - all container children
 * @return {boolean}
 */

/**
 * @callback childIterator
 * @param {Node} node    - container child
 * @param {number} index - child index
 * @return {false|undefined} returning `false` will break iteration
 */

module.exports = exports['default'];


},{"./at-rule":15,"./comment":16,"./declaration":19,"./node":24,"./parse":25,"./root":31,"./rule":32,"./warn-once":38}],18:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _supportsColor = require('supports-color');

var _supportsColor2 = _interopRequireDefault(_supportsColor);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _terminalHighlight = require('./terminal-highlight');

var _terminalHighlight2 = _interopRequireDefault(_terminalHighlight);

var _warnOnce = require('./warn-once');

var _warnOnce2 = _interopRequireDefault(_warnOnce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The CSS parser throws this error for broken CSS.
 *
 * Custom parsers can throw this error for broken custom syntax using
 * the {@link Node#error} method.
 *
 * PostCSS will use the input source map to detect the original error location.
 * If you wrote a Sass file, compiled it to CSS and then parsed it with PostCSS,
 * PostCSS will show the original position in the Sass file.
 *
 * If you need the position in the PostCSS input
 * (e.g., to debug the previous compiler), use `error.input.file`.
 *
 * @example
 * // Catching and checking syntax error
 * try {
 *   postcss.parse('a{')
 * } catch (error) {
 *   if ( error.name === 'CssSyntaxError' ) {
 *     error //=> CssSyntaxError
 *   }
 * }
 *
 * @example
 * // Raising error from plugin
 * throw node.error('Unknown variable', { plugin: 'postcss-vars' });
 */
var CssSyntaxError = function () {

    /**
     * @param {string} message  - error message
     * @param {number} [line]   - source line of the error
     * @param {number} [column] - source column of the error
     * @param {string} [source] - source code of the broken file
     * @param {string} [file]   - absolute path to the broken file
     * @param {string} [plugin] - PostCSS plugin name, if error came from plugin
     */
    function CssSyntaxError(message, line, column, source, file, plugin) {
        _classCallCheck(this, CssSyntaxError);

        /**
         * @member {string} - Always equal to `'CssSyntaxError'`. You should
         *                    always check error type
         *                    by `error.name === 'CssSyntaxError'` instead of
         *                    `error instanceof CssSyntaxError`, because
         *                    npm could have several PostCSS versions.
         *
         * @example
         * if ( error.name === 'CssSyntaxError' ) {
         *   error //=> CssSyntaxError
         * }
         */
        this.name = 'CssSyntaxError';
        /**
         * @member {string} - Error message.
         *
         * @example
         * error.message //=> 'Unclosed block'
         */
        this.reason = message;

        if (file) {
            /**
             * @member {string} - Absolute path to the broken file.
             *
             * @example
             * error.file       //=> 'a.sass'
             * error.input.file //=> 'a.css'
             */
            this.file = file;
        }
        if (source) {
            /**
             * @member {string} - Source code of the broken file.
             *
             * @example
             * error.source       //=> 'a { b {} }'
             * error.input.column //=> 'a b { }'
             */
            this.source = source;
        }
        if (plugin) {
            /**
             * @member {string} - Plugin name, if error came from plugin.
             *
             * @example
             * error.plugin //=> 'postcss-vars'
             */
            this.plugin = plugin;
        }
        if (typeof line !== 'undefined' && typeof column !== 'undefined') {
            /**
             * @member {number} - Source line of the error.
             *
             * @example
             * error.line       //=> 2
             * error.input.line //=> 4
             */
            this.line = line;
            /**
             * @member {number} - Source column of the error.
             *
             * @example
             * error.column       //=> 1
             * error.input.column //=> 4
             */
            this.column = column;
        }

        this.setMessage();

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CssSyntaxError);
        }
    }

    CssSyntaxError.prototype.setMessage = function setMessage() {
        /**
         * @member {string} - Full error text in the GNU error format
         *                    with plugin, file, line and column.
         *
         * @example
         * error.message //=> 'a.css:1:1: Unclosed block'
         */
        this.message = this.plugin ? this.plugin + ': ' : '';
        this.message += this.file ? this.file : '<css input>';
        if (typeof this.line !== 'undefined') {
            this.message += ':' + this.line + ':' + this.column;
        }
        this.message += ': ' + this.reason;
    };

    /**
     * Returns a few lines of CSS source that caused the error.
     *
     * If the CSS has an input source map without `sourceContent`,
     * this method will return an empty string.
     *
     * @param {boolean} [color] whether arrow will be colored red by terminal
     *                          color codes. By default, PostCSS will detect
     *                          color support by `process.stdout.isTTY`
     *                          and `process.env.NODE_DISABLE_COLORS`.
     *
     * @example
     * error.showSourceCode() //=> "  4 | }
     *                        //      5 | a {
     *                        //    > 6 |   bad
     *                        //        |   ^
     *                        //      7 | }
     *                        //      8 | b {"
     *
     * @return {string} few lines of CSS source that caused the error
     */


    CssSyntaxError.prototype.showSourceCode = function showSourceCode(color) {
        var _this = this;

        if (!this.source) return '';

        var css = this.source;
        if (typeof color === 'undefined') color = _supportsColor2.default;
        if (color) css = (0, _terminalHighlight2.default)(css);

        var lines = css.split(/\r?\n/);
        var start = Math.max(this.line - 3, 0);
        var end = Math.min(this.line + 2, lines.length);

        var maxWidth = String(end).length;
        var colors = new _chalk2.default.constructor({ enabled: true });

        function mark(text) {
            if (color) {
                return colors.red.bold(text);
            } else {
                return text;
            }
        }
        function aside(text) {
            if (color) {
                return colors.gray(text);
            } else {
                return text;
            }
        }

        return lines.slice(start, end).map(function (line, index) {
            var number = start + 1 + index;
            var gutter = ' ' + (' ' + number).slice(-maxWidth) + ' | ';
            if (number === _this.line) {
                var spacing = aside(gutter.replace(/\d/g, ' ')) + line.slice(0, _this.column - 1).replace(/[^\t]/g, ' ');
                return mark('>') + aside(gutter) + line + '\n ' + spacing + mark('^');
            } else {
                return ' ' + aside(gutter) + line;
            }
        }).join('\n');
    };

    /**
     * Returns error position, message and source code of the broken part.
     *
     * @example
     * error.toString() //=> "CssSyntaxError: app.css:1:1: Unclosed block
     *                  //    > 1 | a {
     *                  //        | ^"
     *
     * @return {string} error position, message and source code
     */


    CssSyntaxError.prototype.toString = function toString() {
        var code = this.showSourceCode();
        if (code) {
            code = '\n\n' + code + '\n';
        }
        return this.name + ': ' + this.message + code;
    };

    _createClass(CssSyntaxError, [{
        key: 'generated',
        get: function get() {
            (0, _warnOnce2.default)('CssSyntaxError#generated is depreacted. Use input instead.');
            return this.input;
        }

        /**
         * @memberof CssSyntaxError#
         * @member {Input} input - Input object with PostCSS internal information
         *                         about input file. If input has source map
         *                         from previous tool, PostCSS will use origin
         *                         (for example, Sass) source. You can use this
         *                         object to get PostCSS input source.
         *
         * @example
         * error.input.file //=> 'a.css'
         * error.file       //=> 'a.sass'
         */

    }]);

    return CssSyntaxError;
}();

exports.default = CssSyntaxError;
module.exports = exports['default'];


},{"./terminal-highlight":35,"./warn-once":38,"chalk":8,"supports-color":40}],19:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _warnOnce = require('./warn-once');

var _warnOnce2 = _interopRequireDefault(_warnOnce);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Represents a CSS declaration.
 *
 * @extends Node
 *
 * @example
 * const root = postcss.parse('a { color: black }');
 * const decl = root.first.first;
 * decl.type       //=> 'decl'
 * decl.toString() //=> ' color: black'
 */
var Declaration = function (_Node) {
    _inherits(Declaration, _Node);

    function Declaration(defaults) {
        _classCallCheck(this, Declaration);

        var _this = _possibleConstructorReturn(this, _Node.call(this, defaults));

        _this.type = 'decl';
        return _this;
    }

    _createClass(Declaration, [{
        key: '_value',
        get: function get() {
            (0, _warnOnce2.default)('Node#_value was deprecated. Use Node#raws.value');
            return this.raws.value;
        },
        set: function set(val) {
            (0, _warnOnce2.default)('Node#_value was deprecated. Use Node#raws.value');
            this.raws.value = val;
        }
    }, {
        key: '_important',
        get: function get() {
            (0, _warnOnce2.default)('Node#_important was deprecated. Use Node#raws.important');
            return this.raws.important;
        },
        set: function set(val) {
            (0, _warnOnce2.default)('Node#_important was deprecated. Use Node#raws.important');
            this.raws.important = val;
        }

        /**
         * @memberof Declaration#
         * @member {string} prop - the declaration’s property name
         *
         * @example
         * const root = postcss.parse('a { color: black }');
         * const decl = root.first.first;
         * decl.prop //=> 'color'
         */

        /**
         * @memberof Declaration#
         * @member {string} value - the declaration’s value
         *
         * @example
         * const root = postcss.parse('a { color: black }');
         * const decl = root.first.first;
         * decl.value //=> 'black'
         */

        /**
         * @memberof Declaration#
         * @member {boolean} important - `true` if the declaration
         *                               has an !important annotation.
         *
         * @example
         * const root = postcss.parse('a { color: black !important; color: red }');
         * root.first.first.important //=> true
         * root.first.last.important  //=> undefined
         */

        /**
         * @memberof Declaration#
         * @member {object} raws - Information to generate byte-to-byte equal
         *                         node string as it was in the origin input.
         *
         * Every parser saves its own properties,
         * but the default CSS parser uses:
         *
         * * `before`: the space symbols before the node. It also stores `*`
         *   and `_` symbols before the declaration (IE hack).
         * * `between`: the symbols between the property and value
         *   for declarations, selector and `{` for rules, or last parameter
         *   and `{` for at-rules.
         * * `important`: the content of the important statement,
         *   if it is not just `!important`.
         *
         * PostCSS cleans declaration from comments and extra spaces,
         * but it stores origin content in raws properties.
         * As such, if you don’t change a declaration’s value,
         * PostCSS will use the raw value with comments.
         *
         * @example
         * const root = postcss.parse('a {\n  color:black\n}')
         * root.first.first.raws //=> { before: '\n  ', between: ':' }
         */

    }]);

    return Declaration;
}(_node2.default);

exports.default = Declaration;
module.exports = exports['default'];


},{"./node":24,"./warn-once":38}],20:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cssSyntaxError = require('./css-syntax-error');

var _cssSyntaxError2 = _interopRequireDefault(_cssSyntaxError);

var _previousMap = require('./previous-map');

var _previousMap2 = _interopRequireDefault(_previousMap);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sequence = 0;

/**
 * Represents the source CSS.
 *
 * @example
 * const root  = postcss.parse(css, { from: file });
 * const input = root.source.input;
 */

var Input = function () {

    /**
     * @param {string} css    - input CSS source
     * @param {object} [opts] - {@link Processor#process} options
     */
    function Input(css) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Input);

        /**
         * @member {string} - input CSS source
         *
         * @example
         * const input = postcss.parse('a{}', { from: file }).input;
         * input.css //=> "a{}";
         */
        this.css = css.toString();

        if (this.css[0] === '\uFEFF' || this.css[0] === '\uFFFE') {
            this.css = this.css.slice(1);
        }

        if (opts.from) {
            if (/^\w+:\/\//.test(opts.from)) {
                /**
                 * @member {string} - The absolute path to the CSS source file
                 *                    defined with the `from` option.
                 *
                 * @example
                 * const root = postcss.parse(css, { from: 'a.css' });
                 * root.source.input.file //=> '/home/ai/a.css'
                 */
                this.file = opts.from;
            } else {
                this.file = _path2.default.resolve(opts.from);
            }
        }

        var map = new _previousMap2.default(this.css, opts);
        if (map.text) {
            /**
             * @member {PreviousMap} - The input source map passed from
             *                         a compilation step before PostCSS
             *                         (for example, from Sass compiler).
             *
             * @example
             * root.source.input.map.consumer().sources //=> ['a.sass']
             */
            this.map = map;
            var file = map.consumer().file;
            if (!this.file && file) this.file = this.mapResolve(file);
        }

        if (!this.file) {
            sequence += 1;
            /**
             * @member {string} - The unique ID of the CSS source. It will be
             *                    created if `from` option is not provided
             *                    (because PostCSS does not know the file path).
             *
             * @example
             * const root = postcss.parse(css);
             * root.source.input.file //=> undefined
             * root.source.input.id   //=> "<input css 1>"
             */
            this.id = '<input css ' + sequence + '>';
        }
        if (this.map) this.map.file = this.from;
    }

    Input.prototype.error = function error(message, line, column) {
        var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        var result = void 0;
        var origin = this.origin(line, column);
        if (origin) {
            result = new _cssSyntaxError2.default(message, origin.line, origin.column, origin.source, origin.file, opts.plugin);
        } else {
            result = new _cssSyntaxError2.default(message, line, column, this.css, this.file, opts.plugin);
        }

        result.input = { line: line, column: column, source: this.css };
        if (this.file) result.input.file = this.file;

        return result;
    };

    /**
     * Reads the input source map and returns a symbol position
     * in the input source (e.g., in a Sass file that was compiled
     * to CSS before being passed to PostCSS).
     *
     * @param {number} line   - line in input CSS
     * @param {number} column - column in input CSS
     *
     * @return {filePosition} position in input source
     *
     * @example
     * root.source.input.origin(1, 1) //=> { file: 'a.css', line: 3, column: 1 }
     */


    Input.prototype.origin = function origin(line, column) {
        if (!this.map) return false;
        var consumer = this.map.consumer();

        var from = consumer.originalPositionFor({ line: line, column: column });
        if (!from.source) return false;

        var result = {
            file: this.mapResolve(from.source),
            line: from.line,
            column: from.column
        };

        var source = consumer.sourceContentFor(from.source);
        if (source) result.source = source;

        return result;
    };

    Input.prototype.mapResolve = function mapResolve(file) {
        if (/^\w+:\/\//.test(file)) {
            return file;
        } else {
            return _path2.default.resolve(this.map.consumer().sourceRoot || '.', file);
        }
    };

    /**
     * The CSS source identifier. Contains {@link Input#file} if the user
     * set the `from` option, or {@link Input#id} if they did not.
     * @type {string}
     *
     * @example
     * const root = postcss.parse(css, { from: 'a.css' });
     * root.source.input.from //=> "/home/ai/a.css"
     *
     * const root = postcss.parse(css);
     * root.source.input.from //=> "<input css 1>"
     */


    _createClass(Input, [{
        key: 'from',
        get: function get() {
            return this.file || this.id;
        }
    }]);

    return Input;
}();

exports.default = Input;

/**
 * @typedef  {object} filePosition
 * @property {string} file   - path to file
 * @property {number} line   - source line in file
 * @property {number} column - source column in file
 */

module.exports = exports['default'];


},{"./css-syntax-error":18,"./previous-map":28,"path":14}],21:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _mapGenerator = require('./map-generator');

var _mapGenerator2 = _interopRequireDefault(_mapGenerator);

var _stringify2 = require('./stringify');

var _stringify3 = _interopRequireDefault(_stringify2);

var _warnOnce = require('./warn-once');

var _warnOnce2 = _interopRequireDefault(_warnOnce);

var _result = require('./result');

var _result2 = _interopRequireDefault(_result);

var _parse = require('./parse');

var _parse2 = _interopRequireDefault(_parse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function isPromise(obj) {
    return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && typeof obj.then === 'function';
}

/**
 * A Promise proxy for the result of PostCSS transformations.
 *
 * A `LazyResult` instance is returned by {@link Processor#process}.
 *
 * @example
 * const lazy = postcss([cssnext]).process(css);
 */

var LazyResult = function () {
    function LazyResult(processor, css, opts) {
        _classCallCheck(this, LazyResult);

        this.stringified = false;
        this.processed = false;

        var root = void 0;
        if ((typeof css === 'undefined' ? 'undefined' : _typeof(css)) === 'object' && css.type === 'root') {
            root = css;
        } else if (css instanceof LazyResult || css instanceof _result2.default) {
            root = css.root;
            if (css.map) {
                if (typeof opts.map === 'undefined') opts.map = {};
                if (!opts.map.inline) opts.map.inline = false;
                opts.map.prev = css.map;
            }
        } else {
            var parser = _parse2.default;
            if (opts.syntax) parser = opts.syntax.parse;
            if (opts.parser) parser = opts.parser;
            if (parser.parse) parser = parser.parse;

            try {
                root = parser(css, opts);
            } catch (error) {
                this.error = error;
            }
        }

        this.result = new _result2.default(processor, root, opts);
    }

    /**
     * Returns a {@link Processor} instance, which will be used
     * for CSS transformations.
     * @type {Processor}
     */


    /**
     * Processes input CSS through synchronous plugins
     * and calls {@link Result#warnings()}.
     *
     * @return {Warning[]} warnings from plugins
     */
    LazyResult.prototype.warnings = function warnings() {
        return this.sync().warnings();
    };

    /**
     * Alias for the {@link LazyResult#css} property.
     *
     * @example
     * lazy + '' === lazy.css;
     *
     * @return {string} output CSS
     */


    LazyResult.prototype.toString = function toString() {
        return this.css;
    };

    /**
     * Processes input CSS through synchronous and asynchronous plugins
     * and calls `onFulfilled` with a Result instance. If a plugin throws
     * an error, the `onRejected` callback will be executed.
     *
     * It implements standard Promise API.
     *
     * @param {onFulfilled} onFulfilled - callback will be executed
     *                                    when all plugins will finish work
     * @param {onRejected}  onRejected  - callback will be executed on any error
     *
     * @return {Promise} Promise API to make queue
     *
     * @example
     * postcss([cssnext]).process(css).then(result => {
     *   console.log(result.css);
     * });
     */


    LazyResult.prototype.then = function then(onFulfilled, onRejected) {
        return this.async().then(onFulfilled, onRejected);
    };

    /**
     * Processes input CSS through synchronous and asynchronous plugins
     * and calls onRejected for each error thrown in any plugin.
     *
     * It implements standard Promise API.
     *
     * @param {onRejected} onRejected - callback will be executed on any error
     *
     * @return {Promise} Promise API to make queue
     *
     * @example
     * postcss([cssnext]).process(css).then(result => {
     *   console.log(result.css);
     * }).catch(error => {
     *   console.error(error);
     * });
     */


    LazyResult.prototype.catch = function _catch(onRejected) {
        return this.async().catch(onRejected);
    };

    LazyResult.prototype.handleError = function handleError(error, plugin) {
        try {
            this.error = error;
            if (error.name === 'CssSyntaxError' && !error.plugin) {
                error.plugin = plugin.postcssPlugin;
                error.setMessage();
            } else if (plugin.postcssVersion) {
                var pluginName = plugin.postcssPlugin;
                var pluginVer = plugin.postcssVersion;
                var runtimeVer = this.result.processor.version;
                var a = pluginVer.split('.');
                var b = runtimeVer.split('.');

                if (a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1])) {
                    (0, _warnOnce2.default)('Your current PostCSS version ' + 'is ' + runtimeVer + ', but ' + pluginName + ' ' + 'uses ' + pluginVer + '. Perhaps this is ' + 'the source of the error below.');
                }
            }
        } catch (err) {
            if (console && console.error) console.error(err);
        }
    };

    LazyResult.prototype.asyncTick = function asyncTick(resolve, reject) {
        var _this = this;

        if (this.plugin >= this.processor.plugins.length) {
            this.processed = true;
            return resolve();
        }

        try {
            (function () {
                var plugin = _this.processor.plugins[_this.plugin];
                var promise = _this.run(plugin);
                _this.plugin += 1;

                if (isPromise(promise)) {
                    promise.then(function () {
                        _this.asyncTick(resolve, reject);
                    }).catch(function (error) {
                        _this.handleError(error, plugin);
                        _this.processed = true;
                        reject(error);
                    });
                } else {
                    _this.asyncTick(resolve, reject);
                }
            })();
        } catch (error) {
            this.processed = true;
            reject(error);
        }
    };

    LazyResult.prototype.async = function async() {
        var _this2 = this;

        if (this.processed) {
            return new Promise(function (resolve, reject) {
                if (_this2.error) {
                    reject(_this2.error);
                } else {
                    resolve(_this2.stringify());
                }
            });
        }
        if (this.processing) {
            return this.processing;
        }

        this.processing = new Promise(function (resolve, reject) {
            if (_this2.error) return reject(_this2.error);
            _this2.plugin = 0;
            _this2.asyncTick(resolve, reject);
        }).then(function () {
            _this2.processed = true;
            return _this2.stringify();
        });

        return this.processing;
    };

    LazyResult.prototype.sync = function sync() {
        if (this.processed) return this.result;
        this.processed = true;

        if (this.processing) {
            throw new Error('Use process(css).then(cb) to work with async plugins');
        }

        if (this.error) throw this.error;

        for (var _iterator = this.result.processor.plugins, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var plugin = _ref;

            var promise = this.run(plugin);
            if (isPromise(promise)) {
                throw new Error('Use process(css).then(cb) to work with async plugins');
            }
        }

        return this.result;
    };

    LazyResult.prototype.run = function run(plugin) {
        this.result.lastPlugin = plugin;

        try {
            return plugin(this.result.root, this.result);
        } catch (error) {
            this.handleError(error, plugin);
            throw error;
        }
    };

    LazyResult.prototype.stringify = function stringify() {
        if (this.stringified) return this.result;
        this.stringified = true;

        this.sync();

        var opts = this.result.opts;
        var str = _stringify3.default;
        if (opts.syntax) str = opts.syntax.stringify;
        if (opts.stringifier) str = opts.stringifier;
        if (str.stringify) str = str.stringify;

        var map = new _mapGenerator2.default(str, this.result.root, this.result.opts);
        var data = map.generate();
        this.result.css = data[0];
        this.result.map = data[1];

        return this.result;
    };

    _createClass(LazyResult, [{
        key: 'processor',
        get: function get() {
            return this.result.processor;
        }

        /**
         * Options from the {@link Processor#process} call.
         * @type {processOptions}
         */

    }, {
        key: 'opts',
        get: function get() {
            return this.result.opts;
        }

        /**
         * Processes input CSS through synchronous plugins, converts `Root`
         * to a CSS string and returns {@link Result#css}.
         *
         * This property will only work with synchronous plugins.
         * If the processor contains any asynchronous plugins
         * it will throw an error. This is why this method is only
         * for debug purpose, you should always use {@link LazyResult#then}.
         *
         * @type {string}
         * @see Result#css
         */

    }, {
        key: 'css',
        get: function get() {
            return this.stringify().css;
        }

        /**
         * An alias for the `css` property. Use it with syntaxes
         * that generate non-CSS output.
         *
         * This property will only work with synchronous plugins.
         * If the processor contains any asynchronous plugins
         * it will throw an error. This is why this method is only
         * for debug purpose, you should always use {@link LazyResult#then}.
         *
         * @type {string}
         * @see Result#content
         */

    }, {
        key: 'content',
        get: function get() {
            return this.stringify().content;
        }

        /**
         * Processes input CSS through synchronous plugins
         * and returns {@link Result#map}.
         *
         * This property will only work with synchronous plugins.
         * If the processor contains any asynchronous plugins
         * it will throw an error. This is why this method is only
         * for debug purpose, you should always use {@link LazyResult#then}.
         *
         * @type {SourceMapGenerator}
         * @see Result#map
         */

    }, {
        key: 'map',
        get: function get() {
            return this.stringify().map;
        }

        /**
         * Processes input CSS through synchronous plugins
         * and returns {@link Result#root}.
         *
         * This property will only work with synchronous plugins. If the processor
         * contains any asynchronous plugins it will throw an error.
         *
         * This is why this method is only for debug purpose,
         * you should always use {@link LazyResult#then}.
         *
         * @type {Root}
         * @see Result#root
         */

    }, {
        key: 'root',
        get: function get() {
            return this.sync().root;
        }

        /**
         * Processes input CSS through synchronous plugins
         * and returns {@link Result#messages}.
         *
         * This property will only work with synchronous plugins. If the processor
         * contains any asynchronous plugins it will throw an error.
         *
         * This is why this method is only for debug purpose,
         * you should always use {@link LazyResult#then}.
         *
         * @type {Message[]}
         * @see Result#messages
         */

    }, {
        key: 'messages',
        get: function get() {
            return this.sync().messages;
        }
    }]);

    return LazyResult;
}();

exports.default = LazyResult;

/**
 * @callback onFulfilled
 * @param {Result} result
 */

/**
 * @callback onRejected
 * @param {Error} error
 */

module.exports = exports['default'];


},{"./map-generator":23,"./parse":25,"./result":30,"./stringify":34,"./warn-once":38}],22:[function(require,module,exports){
'use strict';

exports.__esModule = true;
/**
 * Contains helpers for safely splitting lists of CSS values,
 * preserving parentheses and quotes.
 *
 * @example
 * const list = postcss.list;
 *
 * @namespace list
 */
var list = {
    split: function split(string, separators, last) {
        var array = [];
        var current = '';
        var split = false;

        var func = 0;
        var quote = false;
        var escape = false;

        for (var i = 0; i < string.length; i++) {
            var letter = string[i];

            if (quote) {
                if (escape) {
                    escape = false;
                } else if (letter === '\\') {
                    escape = true;
                } else if (letter === quote) {
                    quote = false;
                }
            } else if (letter === '"' || letter === '\'') {
                quote = letter;
            } else if (letter === '(') {
                func += 1;
            } else if (letter === ')') {
                if (func > 0) func -= 1;
            } else if (func === 0) {
                if (separators.indexOf(letter) !== -1) split = true;
            }

            if (split) {
                if (current !== '') array.push(current.trim());
                current = '';
                split = false;
            } else {
                current += letter;
            }
        }

        if (last || current !== '') array.push(current.trim());
        return array;
    },


    /**
     * Safely splits space-separated values (such as those for `background`,
     * `border-radius`, and other shorthand properties).
     *
     * @param {string} string - space-separated values
     *
     * @return {string[]} split values
     *
     * @example
     * postcss.list.space('1px calc(10% + 1px)') //=> ['1px', 'calc(10% + 1px)']
     */
    space: function space(string) {
        var spaces = [' ', '\n', '\t'];
        return list.split(string, spaces);
    },


    /**
     * Safely splits comma-separated values (such as those for `transition-*`
     * and `background` properties).
     *
     * @param {string} string - comma-separated values
     *
     * @return {string[]} split values
     *
     * @example
     * postcss.list.comma('black, linear-gradient(white, black)')
     * //=> ['black', 'linear-gradient(white, black)']
     */
    comma: function comma(string) {
        var comma = ',';
        return list.split(string, [comma], true);
    }
};

exports.default = list;
module.exports = exports['default'];


},{}],23:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _jsBase = require('js-base64');

var _sourceMap = require('source-map');

var _sourceMap2 = _interopRequireDefault(_sourceMap);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapGenerator = function () {
    function MapGenerator(stringify, root, opts) {
        _classCallCheck(this, MapGenerator);

        this.stringify = stringify;
        this.mapOpts = opts.map || {};
        this.root = root;
        this.opts = opts;
    }

    MapGenerator.prototype.isMap = function isMap() {
        if (typeof this.opts.map !== 'undefined') {
            return !!this.opts.map;
        } else {
            return this.previous().length > 0;
        }
    };

    MapGenerator.prototype.previous = function previous() {
        var _this = this;

        if (!this.previousMaps) {
            this.previousMaps = [];
            this.root.walk(function (node) {
                if (node.source && node.source.input.map) {
                    var map = node.source.input.map;
                    if (_this.previousMaps.indexOf(map) === -1) {
                        _this.previousMaps.push(map);
                    }
                }
            });
        }

        return this.previousMaps;
    };

    MapGenerator.prototype.isInline = function isInline() {
        if (typeof this.mapOpts.inline !== 'undefined') {
            return this.mapOpts.inline;
        }

        var annotation = this.mapOpts.annotation;
        if (typeof annotation !== 'undefined' && annotation !== true) {
            return false;
        }

        if (this.previous().length) {
            return this.previous().some(function (i) {
                return i.inline;
            });
        } else {
            return true;
        }
    };

    MapGenerator.prototype.isSourcesContent = function isSourcesContent() {
        if (typeof this.mapOpts.sourcesContent !== 'undefined') {
            return this.mapOpts.sourcesContent;
        }
        if (this.previous().length) {
            return this.previous().some(function (i) {
                return i.withContent();
            });
        } else {
            return true;
        }
    };

    MapGenerator.prototype.clearAnnotation = function clearAnnotation() {
        if (this.mapOpts.annotation === false) return;

        var node = void 0;
        for (var i = this.root.nodes.length - 1; i >= 0; i--) {
            node = this.root.nodes[i];
            if (node.type !== 'comment') continue;
            if (node.text.indexOf('# sourceMappingURL=') === 0) {
                this.root.removeChild(i);
            }
        }
    };

    MapGenerator.prototype.setSourcesContent = function setSourcesContent() {
        var _this2 = this;

        var already = {};
        this.root.walk(function (node) {
            if (node.source) {
                var from = node.source.input.from;
                if (from && !already[from]) {
                    already[from] = true;
                    var relative = _this2.relative(from);
                    _this2.map.setSourceContent(relative, node.source.input.css);
                }
            }
        });
    };

    MapGenerator.prototype.applyPrevMaps = function applyPrevMaps() {
        for (var _iterator = this.previous(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var prev = _ref;

            var from = this.relative(prev.file);
            var root = prev.root || _path2.default.dirname(prev.file);
            var map = void 0;

            if (this.mapOpts.sourcesContent === false) {
                map = new _sourceMap2.default.SourceMapConsumer(prev.text);
                if (map.sourcesContent) {
                    map.sourcesContent = map.sourcesContent.map(function () {
                        return null;
                    });
                }
            } else {
                map = prev.consumer();
            }

            this.map.applySourceMap(map, from, this.relative(root));
        }
    };

    MapGenerator.prototype.isAnnotation = function isAnnotation() {
        if (this.isInline()) {
            return true;
        } else if (typeof this.mapOpts.annotation !== 'undefined') {
            return this.mapOpts.annotation;
        } else if (this.previous().length) {
            return this.previous().some(function (i) {
                return i.annotation;
            });
        } else {
            return true;
        }
    };

    MapGenerator.prototype.addAnnotation = function addAnnotation() {
        var content = void 0;

        if (this.isInline()) {
            content = 'data:application/json;base64,' + _jsBase.Base64.encode(this.map.toString());
        } else if (typeof this.mapOpts.annotation === 'string') {
            content = this.mapOpts.annotation;
        } else {
            content = this.outputFile() + '.map';
        }

        var eol = '\n';
        if (this.css.indexOf('\r\n') !== -1) eol = '\r\n';

        this.css += eol + '/*# sourceMappingURL=' + content + ' */';
    };

    MapGenerator.prototype.outputFile = function outputFile() {
        if (this.opts.to) {
            return this.relative(this.opts.to);
        } else if (this.opts.from) {
            return this.relative(this.opts.from);
        } else {
            return 'to.css';
        }
    };

    MapGenerator.prototype.generateMap = function generateMap() {
        this.generateString();
        if (this.isSourcesContent()) this.setSourcesContent();
        if (this.previous().length > 0) this.applyPrevMaps();
        if (this.isAnnotation()) this.addAnnotation();

        if (this.isInline()) {
            return [this.css];
        } else {
            return [this.css, this.map];
        }
    };

    MapGenerator.prototype.relative = function relative(file) {
        if (file.indexOf('<') === 0) return file;
        if (/^\w+:\/\//.test(file)) return file;

        var from = this.opts.to ? _path2.default.dirname(this.opts.to) : '.';

        if (typeof this.mapOpts.annotation === 'string') {
            from = _path2.default.dirname(_path2.default.resolve(from, this.mapOpts.annotation));
        }

        file = _path2.default.relative(from, file);
        if (_path2.default.sep === '\\') {
            return file.replace(/\\/g, '/');
        } else {
            return file;
        }
    };

    MapGenerator.prototype.sourcePath = function sourcePath(node) {
        if (this.mapOpts.from) {
            return this.mapOpts.from;
        } else {
            return this.relative(node.source.input.from);
        }
    };

    MapGenerator.prototype.generateString = function generateString() {
        var _this3 = this;

        this.css = '';
        this.map = new _sourceMap2.default.SourceMapGenerator({ file: this.outputFile() });

        var line = 1;
        var column = 1;

        var lines = void 0,
            last = void 0;
        this.stringify(this.root, function (str, node, type) {
            _this3.css += str;

            if (node && type !== 'end') {
                if (node.source && node.source.start) {
                    _this3.map.addMapping({
                        source: _this3.sourcePath(node),
                        generated: { line: line, column: column - 1 },
                        original: {
                            line: node.source.start.line,
                            column: node.source.start.column - 1
                        }
                    });
                } else {
                    _this3.map.addMapping({
                        source: '<no source>',
                        original: { line: 1, column: 0 },
                        generated: { line: line, column: column - 1 }
                    });
                }
            }

            lines = str.match(/\n/g);
            if (lines) {
                line += lines.length;
                last = str.lastIndexOf('\n');
                column = str.length - last;
            } else {
                column += str.length;
            }

            if (node && type !== 'start') {
                if (node.source && node.source.end) {
                    _this3.map.addMapping({
                        source: _this3.sourcePath(node),
                        generated: { line: line, column: column - 1 },
                        original: {
                            line: node.source.end.line,
                            column: node.source.end.column
                        }
                    });
                } else {
                    _this3.map.addMapping({
                        source: '<no source>',
                        original: { line: 1, column: 0 },
                        generated: { line: line, column: column - 1 }
                    });
                }
            }
        });
    };

    MapGenerator.prototype.generate = function generate() {
        this.clearAnnotation();

        if (this.isMap()) {
            return this.generateMap();
        } else {
            var result = '';
            this.stringify(this.root, function (i) {
                result += i;
            });
            return [result];
        }
    };

    return MapGenerator;
}();

exports.default = MapGenerator;
module.exports = exports['default'];


},{"js-base64":13,"path":14,"source-map":52}],24:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _cssSyntaxError = require('./css-syntax-error');

var _cssSyntaxError2 = _interopRequireDefault(_cssSyntaxError);

var _stringifier = require('./stringifier');

var _stringifier2 = _interopRequireDefault(_stringifier);

var _stringify = require('./stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _warnOnce = require('./warn-once');

var _warnOnce2 = _interopRequireDefault(_warnOnce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cloneNode = function cloneNode(obj, parent) {
    var cloned = new obj.constructor();

    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        var value = obj[i];
        var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

        if (i === 'parent' && type === 'object') {
            if (parent) cloned[i] = parent;
        } else if (i === 'source') {
            cloned[i] = value;
        } else if (value instanceof Array) {
            cloned[i] = value.map(function (j) {
                return cloneNode(j, cloned);
            });
        } else if (i !== 'before' && i !== 'after' && i !== 'between' && i !== 'semicolon') {
            if (type === 'object' && value !== null) value = cloneNode(value);
            cloned[i] = value;
        }
    }

    return cloned;
};

/**
 * All node classes inherit the following common methods.
 *
 * @abstract
 */

var Node = function () {

    /**
     * @param {object} [defaults] - value for node properties
     */
    function Node() {
        var defaults = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Node);

        this.raws = {};
        for (var name in defaults) {
            this[name] = defaults[name];
        }
    }

    /**
     * Returns a CssSyntaxError instance containing the original position
     * of the node in the source, showing line and column numbers and also
     * a small excerpt to facilitate debugging.
     *
     * If present, an input source map will be used to get the original position
     * of the source, even from a previous compilation step
     * (e.g., from Sass compilation).
     *
     * This method produces very useful error messages.
     *
     * @param {string} message     - error description
     * @param {object} [opts]      - options
     * @param {string} opts.plugin - plugin name that created this error.
     *                               PostCSS will set it automatically.
     * @param {string} opts.word   - a word inside a node’s string that should
     *                               be highlighted as the source of the error
     * @param {number} opts.index  - an index inside a node’s string that should
     *                               be highlighted as the source of the error
     *
     * @return {CssSyntaxError} error object to throw it
     *
     * @example
     * if ( !variables[name] ) {
     *   throw decl.error('Unknown variable ' + name, { word: name });
     *   // CssSyntaxError: postcss-vars:a.sass:4:3: Unknown variable $black
     *   //   color: $black
     *   // a
     *   //          ^
     *   //   background: white
     * }
     */


    Node.prototype.error = function error(message) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (this.source) {
            var pos = this.positionBy(opts);
            return this.source.input.error(message, pos.line, pos.column, opts);
        } else {
            return new _cssSyntaxError2.default(message);
        }
    };

    /**
     * This method is provided as a convenience wrapper for {@link Result#warn}.
     *
     * @param {Result} result      - the {@link Result} instance
     *                               that will receive the warning
     * @param {string} text        - warning message
     * @param {object} [opts]      - options
     * @param {string} opts.plugin - plugin name that created this warning.
     *                               PostCSS will set it automatically.
     * @param {string} opts.word   - a word inside a node’s string that should
     *                               be highlighted as the source of the warning
     * @param {number} opts.index  - an index inside a node’s string that should
     *                               be highlighted as the source of the warning
     *
     * @return {Warning} created warning object
     *
     * @example
     * const plugin = postcss.plugin('postcss-deprecated', () => {
     *   return (root, result) => {
     *     root.walkDecls('bad', decl => {
     *       decl.warn(result, 'Deprecated property bad');
     *     });
     *   };
     * });
     */


    Node.prototype.warn = function warn(result, text, opts) {
        var data = { node: this };
        for (var i in opts) {
            data[i] = opts[i];
        }return result.warn(text, data);
    };

    /**
     * Removes the node from its parent and cleans the parent properties
     * from the node and its children.
     *
     * @example
     * if ( decl.prop.match(/^-webkit-/) ) {
     *   decl.remove();
     * }
     *
     * @return {Node} node to make calls chain
     */


    Node.prototype.remove = function remove() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.parent = undefined;
        return this;
    };

    /**
     * Returns a CSS string representing the node.
     *
     * @param {stringifier|syntax} [stringifier] - a syntax to use
     *                                             in string generation
     *
     * @return {string} CSS string of this node
     *
     * @example
     * postcss.rule({ selector: 'a' }).toString() //=> "a {}"
     */


    Node.prototype.toString = function toString() {
        var stringifier = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _stringify2.default;

        if (stringifier.stringify) stringifier = stringifier.stringify;
        var result = '';
        stringifier(this, function (i) {
            result += i;
        });
        return result;
    };

    /**
     * Returns a clone of the node.
     *
     * The resulting cloned node and its (cloned) children will have
     * a clean parent and code style properties.
     *
     * @param {object} [overrides] - new properties to override in the clone.
     *
     * @example
     * const cloned = decl.clone({ prop: '-moz-' + decl.prop });
     * cloned.raws.before  //=> undefined
     * cloned.parent       //=> undefined
     * cloned.toString()   //=> -moz-transform: scale(0)
     *
     * @return {Node} clone of the node
     */


    Node.prototype.clone = function clone() {
        var overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var cloned = cloneNode(this);
        for (var name in overrides) {
            cloned[name] = overrides[name];
        }
        return cloned;
    };

    /**
     * Shortcut to clone the node and insert the resulting cloned node
     * before the current node.
     *
     * @param {object} [overrides] - new properties to override in the clone.
     *
     * @example
     * decl.cloneBefore({ prop: '-moz-' + decl.prop });
     *
     * @return {Node} - new node
     */


    Node.prototype.cloneBefore = function cloneBefore() {
        var overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var cloned = this.clone(overrides);
        this.parent.insertBefore(this, cloned);
        return cloned;
    };

    /**
     * Shortcut to clone the node and insert the resulting cloned node
     * after the current node.
     *
     * @param {object} [overrides] - new properties to override in the clone.
     *
     * @return {Node} - new node
     */


    Node.prototype.cloneAfter = function cloneAfter() {
        var overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var cloned = this.clone(overrides);
        this.parent.insertAfter(this, cloned);
        return cloned;
    };

    /**
     * Inserts node(s) before the current node and removes the current node.
     *
     * @param {...Node} nodes - node(s) to replace current one
     *
     * @example
     * if ( atrule.name == 'mixin' ) {
     *   atrule.replaceWith(mixinRules[atrule.params]);
     * }
     *
     * @return {Node} current node to methods chain
     */


    Node.prototype.replaceWith = function replaceWith() {
        if (this.parent) {
            for (var _len = arguments.length, nodes = Array(_len), _key = 0; _key < _len; _key++) {
                nodes[_key] = arguments[_key];
            }

            for (var _iterator = nodes, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var node = _ref;

                this.parent.insertBefore(this, node);
            }

            this.remove();
        }

        return this;
    };

    /**
     * Removes the node from its current parent and inserts it
     * at the end of `newParent`.
     *
     * This will clean the `before` and `after` code {@link Node#raws} data
     * from the node and replace them with the indentation style of `newParent`.
     * It will also clean the `between` property
     * if `newParent` is in another {@link Root}.
     *
     * @param {Container} newParent - container node where the current node
     *                                will be moved
     *
     * @example
     * atrule.moveTo(atrule.root());
     *
     * @return {Node} current node to methods chain
     */


    Node.prototype.moveTo = function moveTo(newParent) {
        this.cleanRaws(this.root() === newParent.root());
        this.remove();
        newParent.append(this);
        return this;
    };

    /**
     * Removes the node from its current parent and inserts it into
     * a new parent before `otherNode`.
     *
     * This will also clean the node’s code style properties just as it would
     * in {@link Node#moveTo}.
     *
     * @param {Node} otherNode - node that will be before current node
     *
     * @return {Node} current node to methods chain
     */


    Node.prototype.moveBefore = function moveBefore(otherNode) {
        this.cleanRaws(this.root() === otherNode.root());
        this.remove();
        otherNode.parent.insertBefore(otherNode, this);
        return this;
    };

    /**
     * Removes the node from its current parent and inserts it into
     * a new parent after `otherNode`.
     *
     * This will also clean the node’s code style properties just as it would
     * in {@link Node#moveTo}.
     *
     * @param {Node} otherNode - node that will be after current node
     *
     * @return {Node} current node to methods chain
     */


    Node.prototype.moveAfter = function moveAfter(otherNode) {
        this.cleanRaws(this.root() === otherNode.root());
        this.remove();
        otherNode.parent.insertAfter(otherNode, this);
        return this;
    };

    /**
     * Returns the next child of the node’s parent.
     * Returns `undefined` if the current node is the last child.
     *
     * @return {Node|undefined} next node
     *
     * @example
     * if ( comment.text === 'delete next' ) {
     *   const next = comment.next();
     *   if ( next ) {
     *     next.remove();
     *   }
     * }
     */


    Node.prototype.next = function next() {
        var index = this.parent.index(this);
        return this.parent.nodes[index + 1];
    };

    /**
     * Returns the previous child of the node’s parent.
     * Returns `undefined` if the current node is the first child.
     *
     * @return {Node|undefined} previous node
     *
     * @example
     * const annotation = decl.prev();
     * if ( annotation.type == 'comment' ) {
     *  readAnnotation(annotation.text);
     * }
     */


    Node.prototype.prev = function prev() {
        var index = this.parent.index(this);
        return this.parent.nodes[index - 1];
    };

    Node.prototype.toJSON = function toJSON() {
        var fixed = {};

        for (var name in this) {
            if (!this.hasOwnProperty(name)) continue;
            if (name === 'parent') continue;
            var value = this[name];

            if (value instanceof Array) {
                fixed[name] = value.map(function (i) {
                    if ((typeof i === 'undefined' ? 'undefined' : _typeof(i)) === 'object' && i.toJSON) {
                        return i.toJSON();
                    } else {
                        return i;
                    }
                });
            } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.toJSON) {
                fixed[name] = value.toJSON();
            } else {
                fixed[name] = value;
            }
        }

        return fixed;
    };

    /**
     * Returns a {@link Node#raws} value. If the node is missing
     * the code style property (because the node was manually built or cloned),
     * PostCSS will try to autodetect the code style property by looking
     * at other nodes in the tree.
     *
     * @param {string} prop          - name of code style property
     * @param {string} [defaultType] - name of default value, it can be missed
     *                                 if the value is the same as prop
     *
     * @example
     * const root = postcss.parse('a { background: white }');
     * root.nodes[0].append({ prop: 'color', value: 'black' });
     * root.nodes[0].nodes[1].raws.before   //=> undefined
     * root.nodes[0].nodes[1].raw('before') //=> ' '
     *
     * @return {string} code style value
     */


    Node.prototype.raw = function raw(prop, defaultType) {
        var str = new _stringifier2.default();
        return str.raw(this, prop, defaultType);
    };

    /**
     * Finds the Root instance of the node’s tree.
     *
     * @example
     * root.nodes[0].nodes[0].root() === root
     *
     * @return {Root} root parent
     */


    Node.prototype.root = function root() {
        var result = this;
        while (result.parent) {
            result = result.parent;
        }return result;
    };

    Node.prototype.cleanRaws = function cleanRaws(keepBetween) {
        delete this.raws.before;
        delete this.raws.after;
        if (!keepBetween) delete this.raws.between;
    };

    Node.prototype.positionInside = function positionInside(index) {
        var string = this.toString();
        var column = this.source.start.column;
        var line = this.source.start.line;

        for (var i = 0; i < index; i++) {
            if (string[i] === '\n') {
                column = 1;
                line += 1;
            } else {
                column += 1;
            }
        }

        return { line: line, column: column };
    };

    Node.prototype.positionBy = function positionBy(opts) {
        var pos = this.source.start;
        if (opts.index) {
            pos = this.positionInside(opts.index);
        } else if (opts.word) {
            var index = this.toString().indexOf(opts.word);
            if (index !== -1) pos = this.positionInside(index);
        }
        return pos;
    };

    Node.prototype.removeSelf = function removeSelf() {
        (0, _warnOnce2.default)('Node#removeSelf is deprecated. Use Node#remove.');
        return this.remove();
    };

    Node.prototype.replace = function replace(nodes) {
        (0, _warnOnce2.default)('Node#replace is deprecated. Use Node#replaceWith');
        return this.replaceWith(nodes);
    };

    Node.prototype.style = function style(own, detect) {
        (0, _warnOnce2.default)('Node#style() is deprecated. Use Node#raw()');
        return this.raw(own, detect);
    };

    Node.prototype.cleanStyles = function cleanStyles(keepBetween) {
        (0, _warnOnce2.default)('Node#cleanStyles() is deprecated. Use Node#cleanRaws()');
        return this.cleanRaws(keepBetween);
    };

    _createClass(Node, [{
        key: 'before',
        get: function get() {
            (0, _warnOnce2.default)('Node#before is deprecated. Use Node#raws.before');
            return this.raws.before;
        },
        set: function set(val) {
            (0, _warnOnce2.default)('Node#before is deprecated. Use Node#raws.before');
            this.raws.before = val;
        }
    }, {
        key: 'between',
        get: function get() {
            (0, _warnOnce2.default)('Node#between is deprecated. Use Node#raws.between');
            return this.raws.between;
        },
        set: function set(val) {
            (0, _warnOnce2.default)('Node#between is deprecated. Use Node#raws.between');
            this.raws.between = val;
        }

        /**
         * @memberof Node#
         * @member {string} type - String representing the node’s type.
         *                         Possible values are `root`, `atrule`, `rule`,
         *                         `decl`, or `comment`.
         *
         * @example
         * postcss.decl({ prop: 'color', value: 'black' }).type //=> 'decl'
         */

        /**
         * @memberof Node#
         * @member {Container} parent - the node’s parent node.
         *
         * @example
         * root.nodes[0].parent == root;
         */

        /**
         * @memberof Node#
         * @member {source} source - the input source of the node
         *
         * The property is used in source map generation.
         *
         * If you create a node manually (e.g., with `postcss.decl()`),
         * that node will not have a `source` property and will be absent
         * from the source map. For this reason, the plugin developer should
         * consider cloning nodes to create new ones (in which case the new node’s
         * source will reference the original, cloned node) or setting
         * the `source` property manually.
         *
         * ```js
         * // Bad
         * const prefixed = postcss.decl({
         *   prop: '-moz-' + decl.prop,
         *   value: decl.value
         * });
         *
         * // Good
         * const prefixed = decl.clone({ prop: '-moz-' + decl.prop });
         * ```
         *
         * ```js
         * if ( atrule.name == 'add-link' ) {
         *   const rule = postcss.rule({ selector: 'a', source: atrule.source });
         *   atrule.parent.insertBefore(atrule, rule);
         * }
         * ```
         *
         * @example
         * decl.source.input.from //=> '/home/ai/a.sass'
         * decl.source.start      //=> { line: 10, column: 2 }
         * decl.source.end        //=> { line: 10, column: 12 }
         */

        /**
         * @memberof Node#
         * @member {object} raws - Information to generate byte-to-byte equal
         *                         node string as it was in the origin input.
         *
         * Every parser saves its own properties,
         * but the default CSS parser uses:
         *
         * * `before`: the space symbols before the node. It also stores `*`
         *   and `_` symbols before the declaration (IE hack).
         * * `after`: the space symbols after the last child of the node
         *   to the end of the node.
         * * `between`: the symbols between the property and value
         *   for declarations, selector and `{` for rules, or last parameter
         *   and `{` for at-rules.
         * * `semicolon`: contains true if the last child has
         *   an (optional) semicolon.
         * * `afterName`: the space between the at-rule name and its parameters.
         * * `left`: the space symbols between `/*` and the comment’s text.
         * * `right`: the space symbols between the comment’s text
         *   and <code>*&#47;</code>.
         * * `important`: the content of the important statement,
         *   if it is not just `!important`.
         *
         * PostCSS cleans selectors, declaration values and at-rule parameters
         * from comments and extra spaces, but it stores origin content in raws
         * properties. As such, if you don’t change a declaration’s value,
         * PostCSS will use the raw value with comments.
         *
         * @example
         * const root = postcss.parse('a {\n  color:black\n}')
         * root.first.first.raws //=> { before: '\n  ', between: ':' }
         */

    }]);

    return Node;
}();

exports.default = Node;

/**
 * @typedef {object} position
 * @property {number} line   - source line in file
 * @property {number} column - source column in file
 */

/**
 * @typedef {object} source
 * @property {Input} input    - {@link Input} with input file
 * @property {position} start - The starting position of the node’s source
 * @property {position} end   - The ending position of the node’s source
 */

module.exports = exports['default'];


},{"./css-syntax-error":18,"./stringifier":33,"./stringify":34,"./warn-once":38}],25:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = parse;

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _input = require('./input');

var _input2 = _interopRequireDefault(_input);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(css, opts) {
    if (opts && opts.safe) {
        throw new Error('Option safe was removed. ' + 'Use parser: require("postcss-safe-parser")');
    }

    var input = new _input2.default(css, opts);

    var parser = new _parser2.default(input);
    try {
        parser.tokenize();
        parser.loop();
    } catch (e) {
        if (e.name === 'CssSyntaxError' && opts && opts.from) {
            if (/\.scss$/i.test(opts.from)) {
                e.message += '\nYou tried to parse SCSS with ' + 'the standard CSS parser; ' + 'try again with the postcss-scss parser';
            } else if (/\.less$/i.test(opts.from)) {
                e.message += '\nYou tried to parse Less with ' + 'the standard CSS parser; ' + 'try again with the postcss-less parser';
            }
        }
        throw e;
    }

    return parser.root;
}
module.exports = exports['default'];


},{"./input":20,"./parser":26}],26:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _declaration = require('./declaration');

var _declaration2 = _interopRequireDefault(_declaration);

var _tokenize = require('./tokenize');

var _tokenize2 = _interopRequireDefault(_tokenize);

var _comment = require('./comment');

var _comment2 = _interopRequireDefault(_comment);

var _atRule = require('./at-rule');

var _atRule2 = _interopRequireDefault(_atRule);

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

var _rule = require('./rule');

var _rule2 = _interopRequireDefault(_rule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Parser = function () {
    function Parser(input) {
        _classCallCheck(this, Parser);

        this.input = input;

        this.pos = 0;
        this.root = new _root2.default();
        this.current = this.root;
        this.spaces = '';
        this.semicolon = false;

        this.root.source = { input: input, start: { line: 1, column: 1 } };
    }

    Parser.prototype.tokenize = function tokenize() {
        this.tokens = (0, _tokenize2.default)(this.input);
    };

    Parser.prototype.loop = function loop() {
        var token = void 0;
        while (this.pos < this.tokens.length) {
            token = this.tokens[this.pos];

            switch (token[0]) {

                case 'space':
                case ';':
                    this.spaces += token[1];
                    break;

                case '}':
                    this.end(token);
                    break;

                case 'comment':
                    this.comment(token);
                    break;

                case 'at-word':
                    this.atrule(token);
                    break;

                case '{':
                    this.emptyRule(token);
                    break;

                default:
                    this.other();
                    break;
            }

            this.pos += 1;
        }
        this.endFile();
    };

    Parser.prototype.comment = function comment(token) {
        var node = new _comment2.default();
        this.init(node, token[2], token[3]);
        node.source.end = { line: token[4], column: token[5] };

        var text = token[1].slice(2, -2);
        if (/^\s*$/.test(text)) {
            node.text = '';
            node.raws.left = text;
            node.raws.right = '';
        } else {
            var match = text.match(/^(\s*)([^]*[^\s])(\s*)$/);
            node.text = match[2];
            node.raws.left = match[1];
            node.raws.right = match[3];
        }
    };

    Parser.prototype.emptyRule = function emptyRule(token) {
        var node = new _rule2.default();
        this.init(node, token[2], token[3]);
        node.selector = '';
        node.raws.between = '';
        this.current = node;
    };

    Parser.prototype.other = function other() {
        var token = void 0;
        var end = false;
        var type = null;
        var colon = false;
        var bracket = null;
        var brackets = [];

        var start = this.pos;
        while (this.pos < this.tokens.length) {
            token = this.tokens[this.pos];
            type = token[0];

            if (type === '(' || type === '[') {
                if (!bracket) bracket = token;
                brackets.push(type === '(' ? ')' : ']');
            } else if (brackets.length === 0) {
                if (type === ';') {
                    if (colon) {
                        this.decl(this.tokens.slice(start, this.pos + 1));
                        return;
                    } else {
                        break;
                    }
                } else if (type === '{') {
                    this.rule(this.tokens.slice(start, this.pos + 1));
                    return;
                } else if (type === '}') {
                    this.pos -= 1;
                    end = true;
                    break;
                } else if (type === ':') {
                    colon = true;
                }
            } else if (type === brackets[brackets.length - 1]) {
                brackets.pop();
                if (brackets.length === 0) bracket = null;
            }

            this.pos += 1;
        }
        if (this.pos === this.tokens.length) {
            this.pos -= 1;
            end = true;
        }

        if (brackets.length > 0) this.unclosedBracket(bracket);

        if (end && colon) {
            while (this.pos > start) {
                token = this.tokens[this.pos][0];
                if (token !== 'space' && token !== 'comment') break;
                this.pos -= 1;
            }
            this.decl(this.tokens.slice(start, this.pos + 1));
            return;
        }

        this.unknownWord(start);
    };

    Parser.prototype.rule = function rule(tokens) {
        tokens.pop();

        var node = new _rule2.default();
        this.init(node, tokens[0][2], tokens[0][3]);

        node.raws.between = this.spacesFromEnd(tokens);
        this.raw(node, 'selector', tokens);
        this.current = node;
    };

    Parser.prototype.decl = function decl(tokens) {
        var node = new _declaration2.default();
        this.init(node);

        var last = tokens[tokens.length - 1];
        if (last[0] === ';') {
            this.semicolon = true;
            tokens.pop();
        }
        if (last[4]) {
            node.source.end = { line: last[4], column: last[5] };
        } else {
            node.source.end = { line: last[2], column: last[3] };
        }

        while (tokens[0][0] !== 'word') {
            node.raws.before += tokens.shift()[1];
        }
        node.source.start = { line: tokens[0][2], column: tokens[0][3] };

        node.prop = '';
        while (tokens.length) {
            var type = tokens[0][0];
            if (type === ':' || type === 'space' || type === 'comment') {
                break;
            }
            node.prop += tokens.shift()[1];
        }

        node.raws.between = '';

        var token = void 0;
        while (tokens.length) {
            token = tokens.shift();

            if (token[0] === ':') {
                node.raws.between += token[1];
                break;
            } else {
                node.raws.between += token[1];
            }
        }

        if (node.prop[0] === '_' || node.prop[0] === '*') {
            node.raws.before += node.prop[0];
            node.prop = node.prop.slice(1);
        }
        node.raws.between += this.spacesFromStart(tokens);
        this.precheckMissedSemicolon(tokens);

        for (var i = tokens.length - 1; i > 0; i--) {
            token = tokens[i];
            if (token[1] === '!important') {
                node.important = true;
                var string = this.stringFrom(tokens, i);
                string = this.spacesFromEnd(tokens) + string;
                if (string !== ' !important') node.raws.important = string;
                break;
            } else if (token[1] === 'important') {
                var cache = tokens.slice(0);
                var str = '';
                for (var j = i; j > 0; j--) {
                    var _type = cache[j][0];
                    if (str.trim().indexOf('!') === 0 && _type !== 'space') {
                        break;
                    }
                    str = cache.pop()[1] + str;
                }
                if (str.trim().indexOf('!') === 0) {
                    node.important = true;
                    node.raws.important = str;
                    tokens = cache;
                }
            }

            if (token[0] !== 'space' && token[0] !== 'comment') {
                break;
            }
        }

        this.raw(node, 'value', tokens);

        if (node.value.indexOf(':') !== -1) this.checkMissedSemicolon(tokens);
    };

    Parser.prototype.atrule = function atrule(token) {
        var node = new _atRule2.default();
        node.name = token[1].slice(1);
        if (node.name === '') {
            this.unnamedAtrule(node, token);
        }
        this.init(node, token[2], token[3]);

        var last = false;
        var open = false;
        var params = [];

        this.pos += 1;
        while (this.pos < this.tokens.length) {
            token = this.tokens[this.pos];

            if (token[0] === ';') {
                node.source.end = { line: token[2], column: token[3] };
                this.semicolon = true;
                break;
            } else if (token[0] === '{') {
                open = true;
                break;
            } else if (token[0] === '}') {
                this.end(token);
                break;
            } else {
                params.push(token);
            }

            this.pos += 1;
        }
        if (this.pos === this.tokens.length) {
            last = true;
        }

        node.raws.between = this.spacesFromEnd(params);
        if (params.length) {
            node.raws.afterName = this.spacesFromStart(params);
            this.raw(node, 'params', params);
            if (last) {
                token = params[params.length - 1];
                node.source.end = { line: token[4], column: token[5] };
                this.spaces = node.raws.between;
                node.raws.between = '';
            }
        } else {
            node.raws.afterName = '';
            node.params = '';
        }

        if (open) {
            node.nodes = [];
            this.current = node;
        }
    };

    Parser.prototype.end = function end(token) {
        if (this.current.nodes && this.current.nodes.length) {
            this.current.raws.semicolon = this.semicolon;
        }
        this.semicolon = false;

        this.current.raws.after = (this.current.raws.after || '') + this.spaces;
        this.spaces = '';

        if (this.current.parent) {
            this.current.source.end = { line: token[2], column: token[3] };
            this.current = this.current.parent;
        } else {
            this.unexpectedClose(token);
        }
    };

    Parser.prototype.endFile = function endFile() {
        if (this.current.parent) this.unclosedBlock();
        if (this.current.nodes && this.current.nodes.length) {
            this.current.raws.semicolon = this.semicolon;
        }
        this.current.raws.after = (this.current.raws.after || '') + this.spaces;
    };

    // Helpers

    Parser.prototype.init = function init(node, line, column) {
        this.current.push(node);

        node.source = { start: { line: line, column: column }, input: this.input };
        node.raws.before = this.spaces;
        this.spaces = '';
        if (node.type !== 'comment') this.semicolon = false;
    };

    Parser.prototype.raw = function raw(node, prop, tokens) {
        var token = void 0,
            type = void 0;
        var length = tokens.length;
        var value = '';
        var clean = true;
        for (var i = 0; i < length; i += 1) {
            token = tokens[i];
            type = token[0];
            if (type === 'comment' || type === 'space' && i === length - 1) {
                clean = false;
            } else {
                value += token[1];
            }
        }
        if (!clean) {
            var raw = tokens.reduce(function (all, i) {
                return all + i[1];
            }, '');
            node.raws[prop] = { value: value, raw: raw };
        }
        node[prop] = value;
    };

    Parser.prototype.spacesFromEnd = function spacesFromEnd(tokens) {
        var lastTokenType = void 0;
        var spaces = '';
        while (tokens.length) {
            lastTokenType = tokens[tokens.length - 1][0];
            if (lastTokenType !== 'space' && lastTokenType !== 'comment') break;
            spaces = tokens.pop()[1] + spaces;
        }
        return spaces;
    };

    Parser.prototype.spacesFromStart = function spacesFromStart(tokens) {
        var next = void 0;
        var spaces = '';
        while (tokens.length) {
            next = tokens[0][0];
            if (next !== 'space' && next !== 'comment') break;
            spaces += tokens.shift()[1];
        }
        return spaces;
    };

    Parser.prototype.stringFrom = function stringFrom(tokens, from) {
        var result = '';
        for (var i = from; i < tokens.length; i++) {
            result += tokens[i][1];
        }
        tokens.splice(from, tokens.length - from);
        return result;
    };

    Parser.prototype.colon = function colon(tokens) {
        var brackets = 0;
        var token = void 0,
            type = void 0,
            prev = void 0;
        for (var i = 0; i < tokens.length; i++) {
            token = tokens[i];
            type = token[0];

            if (type === '(') {
                brackets += 1;
            } else if (type === ')') {
                brackets -= 1;
            } else if (brackets === 0 && type === ':') {
                if (!prev) {
                    this.doubleColon(token);
                } else if (prev[0] === 'word' && prev[1] === 'progid') {
                    continue;
                } else {
                    return i;
                }
            }

            prev = token;
        }
        return false;
    };

    // Errors

    Parser.prototype.unclosedBracket = function unclosedBracket(bracket) {
        throw this.input.error('Unclosed bracket', bracket[2], bracket[3]);
    };

    Parser.prototype.unknownWord = function unknownWord(start) {
        var token = this.tokens[start];
        throw this.input.error('Unknown word', token[2], token[3]);
    };

    Parser.prototype.unexpectedClose = function unexpectedClose(token) {
        throw this.input.error('Unexpected }', token[2], token[3]);
    };

    Parser.prototype.unclosedBlock = function unclosedBlock() {
        var pos = this.current.source.start;
        throw this.input.error('Unclosed block', pos.line, pos.column);
    };

    Parser.prototype.doubleColon = function doubleColon(token) {
        throw this.input.error('Double colon', token[2], token[3]);
    };

    Parser.prototype.unnamedAtrule = function unnamedAtrule(node, token) {
        throw this.input.error('At-rule without name', token[2], token[3]);
    };

    Parser.prototype.precheckMissedSemicolon = function precheckMissedSemicolon(tokens) {
        // Hook for Safe Parser
        tokens;
    };

    Parser.prototype.checkMissedSemicolon = function checkMissedSemicolon(tokens) {
        var colon = this.colon(tokens);
        if (colon === false) return;

        var founded = 0;
        var token = void 0;
        for (var j = colon - 1; j >= 0; j--) {
            token = tokens[j];
            if (token[0] !== 'space') {
                founded += 1;
                if (founded === 2) break;
            }
        }
        throw this.input.error('Missed semicolon', token[2], token[3]);
    };

    return Parser;
}();

exports.default = Parser;
module.exports = exports['default'];


},{"./at-rule":15,"./comment":16,"./declaration":19,"./root":31,"./rule":32,"./tokenize":36}],27:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _declaration = require('./declaration');

var _declaration2 = _interopRequireDefault(_declaration);

var _processor = require('./processor');

var _processor2 = _interopRequireDefault(_processor);

var _stringify = require('./stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _comment = require('./comment');

var _comment2 = _interopRequireDefault(_comment);

var _atRule = require('./at-rule');

var _atRule2 = _interopRequireDefault(_atRule);

var _vendor = require('./vendor');

var _vendor2 = _interopRequireDefault(_vendor);

var _parse = require('./parse');

var _parse2 = _interopRequireDefault(_parse);

var _list = require('./list');

var _list2 = _interopRequireDefault(_list);

var _rule = require('./rule');

var _rule2 = _interopRequireDefault(_rule);

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a new {@link Processor} instance that will apply `plugins`
 * as CSS processors.
 *
 * @param {Array.<Plugin|pluginFunction>|Processor} plugins - PostCSS
 *        plugins. See {@link Processor#use} for plugin format.
 *
 * @return {Processor} Processor to process multiple CSS
 *
 * @example
 * import postcss from 'postcss';
 *
 * postcss(plugins).process(css, { from, to }).then(result => {
 *   console.log(result.css);
 * });
 *
 * @namespace postcss
 */
function postcss() {
  for (var _len = arguments.length, plugins = Array(_len), _key = 0; _key < _len; _key++) {
    plugins[_key] = arguments[_key];
  }

  if (plugins.length === 1 && Array.isArray(plugins[0])) {
    plugins = plugins[0];
  }
  return new _processor2.default(plugins);
}

/**
 * Creates a PostCSS plugin with a standard API.
 *
 * The newly-wrapped function will provide both the name and PostCSS
 * version of the plugin.
 *
 * ```js
 *  const processor = postcss([replace]);
 *  processor.plugins[0].postcssPlugin  //=> 'postcss-replace'
 *  processor.plugins[0].postcssVersion //=> '5.1.0'
 * ```
 *
 * The plugin function receives 2 arguments: {@link Root}
 * and {@link Result} instance. The function should mutate the provided
 * `Root` node. Alternatively, you can create a new `Root` node
 * and override the `result.root` property.
 *
 * ```js
 * const cleaner = postcss.plugin('postcss-cleaner', () => {
 *   return (root, result) => {
 *     result.root = postcss.root();
 *   };
 * });
 * ```
 *
 * As a convenience, plugins also expose a `process` method so that you can use
 * them as standalone tools.
 *
 * ```js
 * cleaner.process(css, options);
 * // This is equivalent to:
 * postcss([ cleaner(options) ]).process(css);
 * ```
 *
 * Asynchronous plugins should return a `Promise` instance.
 *
 * ```js
 * postcss.plugin('postcss-import', () => {
 *   return (root, result) => {
 *     return new Promise( (resolve, reject) => {
 *       fs.readFile('base.css', (base) => {
 *         root.prepend(base);
 *         resolve();
 *       });
 *     });
 *   };
 * });
 * ```
 *
 * Add warnings using the {@link Node#warn} method.
 * Send data to other plugins using the {@link Result#messages} array.
 *
 * ```js
 * postcss.plugin('postcss-caniuse-test', () => {
 *   return (root, result) => {
 *     css.walkDecls(decl => {
 *       if ( !caniuse.support(decl.prop) ) {
 *         decl.warn(result, 'Some browsers do not support ' + decl.prop);
 *       }
 *     });
 *   };
 * });
 * ```
 *
 * @param {string} name          - PostCSS plugin name. Same as in `name`
 *                                 property in `package.json`. It will be saved
 *                                 in `plugin.postcssPlugin` property.
 * @param {function} initializer - will receive plugin options
 *                                 and should return {@link pluginFunction}
 *
 * @return {Plugin} PostCSS plugin
 */
postcss.plugin = function plugin(name, initializer) {
  var creator = function creator() {
    var transformer = initializer.apply(undefined, arguments);
    transformer.postcssPlugin = name;
    transformer.postcssVersion = new _processor2.default().version;
    return transformer;
  };

  var cache = void 0;
  Object.defineProperty(creator, 'postcss', {
    get: function get() {
      if (!cache) cache = creator();
      return cache;
    }
  });

  creator.process = function (root, opts) {
    return postcss([creator(opts)]).process(root, opts);
  };

  return creator;
};

/**
 * Default function to convert a node tree into a CSS string.
 *
 * @param {Node} node       - start node for stringifing. Usually {@link Root}.
 * @param {builder} builder - function to concatenate CSS from node’s parts
 *                            or generate string and source map
 *
 * @return {void}
 *
 * @function
 */
postcss.stringify = _stringify2.default;

/**
 * Parses source css and returns a new {@link Root} node,
 * which contains the source CSS nodes.
 *
 * @param {string|toString} css   - string with input CSS or any object
 *                                  with toString() method, like a Buffer
 * @param {processOptions} [opts] - options with only `from` and `map` keys
 *
 * @return {Root} PostCSS AST
 *
 * @example
 * // Simple CSS concatenation with source map support
 * const root1 = postcss.parse(css1, { from: file1 });
 * const root2 = postcss.parse(css2, { from: file2 });
 * root1.append(root2).toResult().css;
 *
 * @function
 */
postcss.parse = _parse2.default;

/**
 * @member {vendor} - Contains the {@link vendor} module.
 *
 * @example
 * postcss.vendor.unprefixed('-moz-tab') //=> ['tab']
 */
postcss.vendor = _vendor2.default;

/**
 * @member {list} - Contains the {@link list} module.
 *
 * @example
 * postcss.list.space('5px calc(10% + 5px)') //=> ['5px', 'calc(10% + 5px)']
 */
postcss.list = _list2.default;

/**
 * Creates a new {@link Comment} node.
 *
 * @param {object} [defaults] - properties for the new node.
 *
 * @return {Comment} new Comment node
 *
 * @example
 * postcss.comment({ text: 'test' })
 */
postcss.comment = function (defaults) {
  return new _comment2.default(defaults);
};

/**
 * Creates a new {@link AtRule} node.
 *
 * @param {object} [defaults] - properties for the new node.
 *
 * @return {AtRule} new AtRule node
 *
 * @example
 * postcss.atRule({ name: 'charset' }).toString() //=> "@charset"
 */
postcss.atRule = function (defaults) {
  return new _atRule2.default(defaults);
};

/**
 * Creates a new {@link Declaration} node.
 *
 * @param {object} [defaults] - properties for the new node.
 *
 * @return {Declaration} new Declaration node
 *
 * @example
 * postcss.decl({ prop: 'color', value: 'red' }).toString() //=> "color: red"
 */
postcss.decl = function (defaults) {
  return new _declaration2.default(defaults);
};

/**
 * Creates a new {@link Rule} node.
 *
 * @param {object} [defaults] - properties for the new node.
 *
 * @return {AtRule} new Rule node
 *
 * @example
 * postcss.rule({ selector: 'a' }).toString() //=> "a {\n}"
 */
postcss.rule = function (defaults) {
  return new _rule2.default(defaults);
};

/**
 * Creates a new {@link Root} node.
 *
 * @param {object} [defaults] - properties for the new node.
 *
 * @return {Root} new Root node
 *
 * @example
 * postcss.root({ after: '\n' }).toString() //=> "\n"
 */
postcss.root = function (defaults) {
  return new _root2.default(defaults);
};

exports.default = postcss;
module.exports = exports['default'];


},{"./at-rule":15,"./comment":16,"./declaration":19,"./list":22,"./parse":25,"./processor":29,"./root":31,"./rule":32,"./stringify":34,"./vendor":37}],28:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _jsBase = require('js-base64');

var _sourceMap = require('source-map');

var _sourceMap2 = _interopRequireDefault(_sourceMap);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Source map information from input CSS.
 * For example, source map after Sass compiler.
 *
 * This class will automatically find source map in input CSS or in file system
 * near input file (according `from` option).
 *
 * @example
 * const root = postcss.parse(css, { from: 'a.sass.css' });
 * root.input.map //=> PreviousMap
 */
var PreviousMap = function () {

    /**
     * @param {string}         css    - input CSS source
     * @param {processOptions} [opts] - {@link Processor#process} options
     */
    function PreviousMap(css, opts) {
        _classCallCheck(this, PreviousMap);

        this.loadAnnotation(css);
        /**
         * @member {boolean} - Was source map inlined by data-uri to input CSS.
         */
        this.inline = this.startWith(this.annotation, 'data:');

        var prev = opts.map ? opts.map.prev : undefined;
        var text = this.loadMap(opts.from, prev);
        if (text) this.text = text;
    }

    /**
     * Create a instance of `SourceMapGenerator` class
     * from the `source-map` library to work with source map information.
     *
     * It is lazy method, so it will create object only on first call
     * and then it will use cache.
     *
     * @return {SourceMapGenerator} object with source map information
     */


    PreviousMap.prototype.consumer = function consumer() {
        if (!this.consumerCache) {
            this.consumerCache = new _sourceMap2.default.SourceMapConsumer(this.text);
        }
        return this.consumerCache;
    };

    /**
     * Does source map contains `sourcesContent` with input source text.
     *
     * @return {boolean} Is `sourcesContent` present
     */


    PreviousMap.prototype.withContent = function withContent() {
        return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    };

    PreviousMap.prototype.startWith = function startWith(string, start) {
        if (!string) return false;
        return string.substr(0, start.length) === start;
    };

    PreviousMap.prototype.loadAnnotation = function loadAnnotation(css) {
        var match = css.match(/\/\*\s*# sourceMappingURL=(.*)\s*\*\//);
        if (match) this.annotation = match[1].trim();
    };

    PreviousMap.prototype.decodeInline = function decodeInline(text) {
        var utfd64 = 'data:application/json;charset=utf-8;base64,';
        var utf64 = 'data:application/json;charset=utf8;base64,';
        var b64 = 'data:application/json;base64,';
        var uri = 'data:application/json,';

        if (this.startWith(text, uri)) {
            return decodeURIComponent(text.substr(uri.length));
        } else if (this.startWith(text, b64)) {
            return _jsBase.Base64.decode(text.substr(b64.length));
        } else if (this.startWith(text, utf64)) {
            return _jsBase.Base64.decode(text.substr(utf64.length));
        } else if (this.startWith(text, utfd64)) {
            return _jsBase.Base64.decode(text.substr(utfd64.length));
        } else {
            var encoding = text.match(/data:application\/json;([^,]+),/)[1];
            throw new Error('Unsupported source map encoding ' + encoding);
        }
    };

    PreviousMap.prototype.loadMap = function loadMap(file, prev) {
        if (prev === false) return false;

        if (prev) {
            if (typeof prev === 'string') {
                return prev;
            } else if (typeof prev === 'function') {
                var prevPath = prev(file);
                if (prevPath && _fs2.default.existsSync && _fs2.default.existsSync(prevPath)) {
                    return _fs2.default.readFileSync(prevPath, 'utf-8').toString().trim();
                } else {
                    throw new Error('Unable to load previous source map: ' + prevPath.toString());
                }
            } else if (prev instanceof _sourceMap2.default.SourceMapConsumer) {
                return _sourceMap2.default.SourceMapGenerator.fromSourceMap(prev).toString();
            } else if (prev instanceof _sourceMap2.default.SourceMapGenerator) {
                return prev.toString();
            } else if (this.isMap(prev)) {
                return JSON.stringify(prev);
            } else {
                throw new Error('Unsupported previous source map format: ' + prev.toString());
            }
        } else if (this.inline) {
            return this.decodeInline(this.annotation);
        } else if (this.annotation) {
            var map = this.annotation;
            if (file) map = _path2.default.join(_path2.default.dirname(file), map);

            this.root = _path2.default.dirname(map);
            if (_fs2.default.existsSync && _fs2.default.existsSync(map)) {
                return _fs2.default.readFileSync(map, 'utf-8').toString().trim();
            } else {
                return false;
            }
        }
    };

    PreviousMap.prototype.isMap = function isMap(map) {
        if ((typeof map === 'undefined' ? 'undefined' : _typeof(map)) !== 'object') return false;
        return typeof map.mappings === 'string' || typeof map._mappings === 'string';
    };

    return PreviousMap;
}();

exports.default = PreviousMap;
module.exports = exports['default'];


},{"fs":6,"js-base64":13,"path":14,"source-map":52}],29:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _lazyResult = require('./lazy-result');

var _lazyResult2 = _interopRequireDefault(_lazyResult);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Contains plugins to process CSS. Create one `Processor` instance,
 * initialize its plugins, and then use that instance on numerous CSS files.
 *
 * @example
 * const processor = postcss([autoprefixer, precss]);
 * processor.process(css1).then(result => console.log(result.css));
 * processor.process(css2).then(result => console.log(result.css));
 */
var Processor = function () {

  /**
   * @param {Array.<Plugin|pluginFunction>|Processor} plugins - PostCSS
   *        plugins. See {@link Processor#use} for plugin format.
   */
  function Processor() {
    var plugins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, Processor);

    /**
     * @member {string} - Current PostCSS version.
     *
     * @example
     * if ( result.processor.version.split('.')[0] !== '5' ) {
     *   throw new Error('This plugin works only with PostCSS 5');
     * }
     */
    this.version = '5.2.6';
    /**
     * @member {pluginFunction[]} - Plugins added to this processor.
     *
     * @example
     * const processor = postcss([autoprefixer, precss]);
     * processor.plugins.length //=> 2
     */
    this.plugins = this.normalize(plugins);
  }

  /**
   * Adds a plugin to be used as a CSS processor.
   *
   * PostCSS plugin can be in 4 formats:
   * * A plugin created by {@link postcss.plugin} method.
   * * A function. PostCSS will pass the function a @{link Root}
   *   as the first argument and current {@link Result} instance
   *   as the second.
   * * An object with a `postcss` method. PostCSS will use that method
   *   as described in #2.
   * * Another {@link Processor} instance. PostCSS will copy plugins
   *   from that instance into this one.
   *
   * Plugins can also be added by passing them as arguments when creating
   * a `postcss` instance (see [`postcss(plugins)`]).
   *
   * Asynchronous plugins should return a `Promise` instance.
   *
   * @param {Plugin|pluginFunction|Processor} plugin - PostCSS plugin
   *                                                   or {@link Processor}
   *                                                   with plugins
   *
   * @example
   * const processor = postcss()
   *   .use(autoprefixer)
   *   .use(precss);
   *
   * @return {Processes} current processor to make methods chain
   */


  Processor.prototype.use = function use(plugin) {
    this.plugins = this.plugins.concat(this.normalize([plugin]));
    return this;
  };

  /**
   * Parses source CSS and returns a {@link LazyResult} Promise proxy.
   * Because some plugins can be asynchronous it doesn’t make
   * any transformations. Transformations will be applied
   * in the {@link LazyResult} methods.
   *
   * @param {string|toString|Result} css - String with input CSS or
   *                                       any object with a `toString()`
   *                                       method, like a Buffer.
   *                                       Optionally, send a {@link Result}
   *                                       instance and the processor will
   *                                       take the {@link Root} from it.
   * @param {processOptions} [opts]      - options
   *
   * @return {LazyResult} Promise proxy
   *
   * @example
   * processor.process(css, { from: 'a.css', to: 'a.out.css' })
   *   .then(result => {
   *      console.log(result.css);
   *   });
   */


  Processor.prototype.process = function process(css) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return new _lazyResult2.default(this, css, opts);
  };

  Processor.prototype.normalize = function normalize(plugins) {
    var normalized = [];
    for (var _iterator = plugins, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var i = _ref;

      if (i.postcss) i = i.postcss;

      if ((typeof i === 'undefined' ? 'undefined' : _typeof(i)) === 'object' && Array.isArray(i.plugins)) {
        normalized = normalized.concat(i.plugins);
      } else if (typeof i === 'function') {
        normalized.push(i);
      } else {
        throw new Error(i + ' is not a PostCSS plugin');
      }
    }
    return normalized;
  };

  return Processor;
}();

exports.default = Processor;

/**
 * @callback builder
 * @param {string} part          - part of generated CSS connected to this node
 * @param {Node}   node          - AST node
 * @param {"start"|"end"} [type] - node’s part type
 */

/**
 * @callback parser
 *
 * @param {string|toString} css   - string with input CSS or any object
 *                                  with toString() method, like a Buffer
 * @param {processOptions} [opts] - options with only `from` and `map` keys
 *
 * @return {Root} PostCSS AST
 */

/**
 * @callback stringifier
 *
 * @param {Node} node       - start node for stringifing. Usually {@link Root}.
 * @param {builder} builder - function to concatenate CSS from node’s parts
 *                            or generate string and source map
 *
 * @return {void}
 */

/**
 * @typedef {object} syntax
 * @property {parser} parse          - function to generate AST by string
 * @property {stringifier} stringify - function to generate string by AST
 */

/**
 * @typedef {object} toString
 * @property {function} toString
 */

/**
 * @callback pluginFunction
 * @param {Root} root     - parsed input CSS
 * @param {Result} result - result to set warnings or check other plugins
 */

/**
 * @typedef {object} Plugin
 * @property {function} postcss - PostCSS plugin function
 */

/**
 * @typedef {object} processOptions
 * @property {string} from             - the path of the CSS source file.
 *                                       You should always set `from`,
 *                                       because it is used in source map
 *                                       generation and syntax error messages.
 * @property {string} to               - the path where you’ll put the output
 *                                       CSS file. You should always set `to`
 *                                       to generate correct source maps.
 * @property {parser} parser           - function to generate AST by string
 * @property {stringifier} stringifier - class to generate string by AST
 * @property {syntax} syntax           - object with `parse` and `stringify`
 * @property {object} map              - source map options
 * @property {boolean} map.inline                    - does source map should
 *                                                     be embedded in the output
 *                                                     CSS as a base64-encoded
 *                                                     comment
 * @property {string|object|false|function} map.prev - source map content
 *                                                     from a previous
 *                                                     processing step
 *                                                     (for example, Sass).
 *                                                     PostCSS will try to find
 *                                                     previous map
 *                                                     automatically, so you
 *                                                     could disable it by
 *                                                     `false` value.
 * @property {boolean} map.sourcesContent            - does PostCSS should set
 *                                                     the origin content to map
 * @property {string|false} map.annotation           - does PostCSS should set
 *                                                     annotation comment to map
 * @property {string} map.from                       - override `from` in map’s
 *                                                     `sources`
 */

module.exports = exports['default'];


},{"./lazy-result":21}],30:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _warning = require('./warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Provides the result of the PostCSS transformations.
 *
 * A Result instance is returned by {@link LazyResult#then}
 * or {@link Root#toResult} methods.
 *
 * @example
 * postcss([cssnext]).process(css).then(function (result) {
 *    console.log(result.css);
 * });
 *
 * @example
 * var result2 = postcss.parse(css).toResult();
 */
var Result = function () {

  /**
   * @param {Processor} processor - processor used for this transformation.
   * @param {Root}      root      - Root node after all transformations.
   * @param {processOptions} opts - options from the {@link Processor#process}
   *                                or {@link Root#toResult}
   */
  function Result(processor, root, opts) {
    _classCallCheck(this, Result);

    /**
     * @member {Processor} - The Processor instance used
     *                       for this transformation.
     *
     * @example
     * for ( let plugin of result.processor.plugins) {
     *   if ( plugin.postcssPlugin === 'postcss-bad' ) {
     *     throw 'postcss-good is incompatible with postcss-bad';
     *   }
     * });
     */
    this.processor = processor;
    /**
     * @member {Message[]} - Contains messages from plugins
     *                       (e.g., warnings or custom messages).
     *                       Each message should have type
     *                       and plugin properties.
     *
     * @example
     * postcss.plugin('postcss-min-browser', () => {
     *   return (root, result) => {
     *     var browsers = detectMinBrowsersByCanIUse(root);
     *     result.messages.push({
     *       type:    'min-browser',
     *       plugin:  'postcss-min-browser',
     *       browsers: browsers
     *     });
     *   };
     * });
     */
    this.messages = [];
    /**
     * @member {Root} - Root node after all transformations.
     *
     * @example
     * root.toResult().root == root;
     */
    this.root = root;
    /**
     * @member {processOptions} - Options from the {@link Processor#process}
     *                            or {@link Root#toResult} call
     *                            that produced this Result instance.
     *
     * @example
     * root.toResult(opts).opts == opts;
     */
    this.opts = opts;
    /**
     * @member {string} - A CSS string representing of {@link Result#root}.
     *
     * @example
     * postcss.parse('a{}').toResult().css //=> "a{}"
     */
    this.css = undefined;
    /**
     * @member {SourceMapGenerator} - An instance of `SourceMapGenerator`
     *                                class from the `source-map` library,
     *                                representing changes
     *                                to the {@link Result#root} instance.
     *
     * @example
     * result.map.toJSON() //=> { version: 3, file: 'a.css', … }
     *
     * @example
     * if ( result.map ) {
     *   fs.writeFileSync(result.opts.to + '.map', result.map.toString());
     * }
     */
    this.map = undefined;
  }

  /**
   * Returns for @{link Result#css} content.
   *
   * @example
   * result + '' === result.css
   *
   * @return {string} string representing of {@link Result#root}
   */


  Result.prototype.toString = function toString() {
    return this.css;
  };

  /**
   * Creates an instance of {@link Warning} and adds it
   * to {@link Result#messages}.
   *
   * @param {string} text        - warning message
   * @param {Object} [opts]      - warning options
   * @param {Node}   opts.node   - CSS node that caused the warning
   * @param {string} opts.word   - word in CSS source that caused the warning
   * @param {number} opts.index  - index in CSS node string that caused
   *                               the warning
   * @param {string} opts.plugin - name of the plugin that created
   *                               this warning. {@link Result#warn} fills
   *                               this property automatically.
   *
   * @return {Warning} created warning
   */


  Result.prototype.warn = function warn(text) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!opts.plugin) {
      if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
        opts.plugin = this.lastPlugin.postcssPlugin;
      }
    }

    var warning = new _warning2.default(text, opts);
    this.messages.push(warning);

    return warning;
  };

  /**
   * Returns warnings from plugins. Filters {@link Warning} instances
   * from {@link Result#messages}.
   *
   * @example
   * result.warnings().forEach(warn => {
   *   console.warn(warn.toString());
   * });
   *
   * @return {Warning[]} warnings from plugins
   */


  Result.prototype.warnings = function warnings() {
    return this.messages.filter(function (i) {
      return i.type === 'warning';
    });
  };

  /**
   * An alias for the {@link Result#css} property.
   * Use it with syntaxes that generate non-CSS output.
   * @type {string}
   *
   * @example
   * result.css === result.content;
   */


  _createClass(Result, [{
    key: 'content',
    get: function get() {
      return this.css;
    }
  }]);

  return Result;
}();

exports.default = Result;

/**
 * @typedef  {object} Message
 * @property {string} type   - message type
 * @property {string} plugin - source PostCSS plugin name
 */

module.exports = exports['default'];


},{"./warning":39}],31:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _warnOnce = require('./warn-once');

var _warnOnce2 = _interopRequireDefault(_warnOnce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Represents a CSS file and contains all its parsed nodes.
 *
 * @extends Container
 *
 * @example
 * const root = postcss.parse('a{color:black} b{z-index:2}');
 * root.type         //=> 'root'
 * root.nodes.length //=> 2
 */
var Root = function (_Container) {
    _inherits(Root, _Container);

    function Root(defaults) {
        _classCallCheck(this, Root);

        var _this = _possibleConstructorReturn(this, _Container.call(this, defaults));

        _this.type = 'root';
        if (!_this.nodes) _this.nodes = [];
        return _this;
    }

    Root.prototype.removeChild = function removeChild(child) {
        child = this.index(child);

        if (child === 0 && this.nodes.length > 1) {
            this.nodes[1].raws.before = this.nodes[child].raws.before;
        }

        return _Container.prototype.removeChild.call(this, child);
    };

    Root.prototype.normalize = function normalize(child, sample, type) {
        var nodes = _Container.prototype.normalize.call(this, child);

        if (sample) {
            if (type === 'prepend') {
                if (this.nodes.length > 1) {
                    sample.raws.before = this.nodes[1].raws.before;
                } else {
                    delete sample.raws.before;
                }
            } else if (this.first !== sample) {
                for (var _iterator = nodes, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                    var _ref;

                    if (_isArray) {
                        if (_i >= _iterator.length) break;
                        _ref = _iterator[_i++];
                    } else {
                        _i = _iterator.next();
                        if (_i.done) break;
                        _ref = _i.value;
                    }

                    var node = _ref;

                    node.raws.before = sample.raws.before;
                }
            }
        }

        return nodes;
    };

    /**
     * Returns a {@link Result} instance representing the root’s CSS.
     *
     * @param {processOptions} [opts] - options with only `to` and `map` keys
     *
     * @return {Result} result with current root’s CSS
     *
     * @example
     * const root1 = postcss.parse(css1, { from: 'a.css' });
     * const root2 = postcss.parse(css2, { from: 'b.css' });
     * root1.append(root2);
     * const result = root1.toResult({ to: 'all.css', map: true });
     */


    Root.prototype.toResult = function toResult() {
        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var LazyResult = require('./lazy-result');
        var Processor = require('./processor');

        var lazy = new LazyResult(new Processor(), this, opts);
        return lazy.stringify();
    };

    Root.prototype.remove = function remove(child) {
        (0, _warnOnce2.default)('Root#remove is deprecated. Use Root#removeChild');
        this.removeChild(child);
    };

    Root.prototype.prevMap = function prevMap() {
        (0, _warnOnce2.default)('Root#prevMap is deprecated. Use Root#source.input.map');
        return this.source.input.map;
    };

    /**
     * @memberof Root#
     * @member {object} raws - Information to generate byte-to-byte equal
     *                         node string as it was in the origin input.
     *
     * Every parser saves its own properties,
     * but the default CSS parser uses:
     *
     * * `after`: the space symbols after the last child to the end of file.
     * * `semicolon`: is the last child has an (optional) semicolon.
     *
     * @example
     * postcss.parse('a {}\n').raws //=> { after: '\n' }
     * postcss.parse('a {}').raws   //=> { after: '' }
     */

    return Root;
}(_container2.default);

exports.default = Root;
module.exports = exports['default'];


},{"./container":17,"./lazy-result":21,"./processor":29,"./warn-once":38}],32:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _warnOnce = require('./warn-once');

var _warnOnce2 = _interopRequireDefault(_warnOnce);

var _list = require('./list');

var _list2 = _interopRequireDefault(_list);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Represents a CSS rule: a selector followed by a declaration block.
 *
 * @extends Container
 *
 * @example
 * const root = postcss.parse('a{}');
 * const rule = root.first;
 * rule.type       //=> 'rule'
 * rule.toString() //=> 'a{}'
 */
var Rule = function (_Container) {
    _inherits(Rule, _Container);

    function Rule(defaults) {
        _classCallCheck(this, Rule);

        var _this = _possibleConstructorReturn(this, _Container.call(this, defaults));

        _this.type = 'rule';
        if (!_this.nodes) _this.nodes = [];
        return _this;
    }

    /**
     * An array containing the rule’s individual selectors.
     * Groups of selectors are split at commas.
     *
     * @type {string[]}
     *
     * @example
     * const root = postcss.parse('a, b { }');
     * const rule = root.first;
     *
     * rule.selector  //=> 'a, b'
     * rule.selectors //=> ['a', 'b']
     *
     * rule.selectors = ['a', 'strong'];
     * rule.selector //=> 'a, strong'
     */


    _createClass(Rule, [{
        key: 'selectors',
        get: function get() {
            return _list2.default.comma(this.selector);
        },
        set: function set(values) {
            var match = this.selector ? this.selector.match(/,\s*/) : null;
            var sep = match ? match[0] : ',' + this.raw('between', 'beforeOpen');
            this.selector = values.join(sep);
        }
    }, {
        key: '_selector',
        get: function get() {
            (0, _warnOnce2.default)('Rule#_selector is deprecated. Use Rule#raws.selector');
            return this.raws.selector;
        },
        set: function set(val) {
            (0, _warnOnce2.default)('Rule#_selector is deprecated. Use Rule#raws.selector');
            this.raws.selector = val;
        }

        /**
         * @memberof Rule#
         * @member {string} selector - the rule’s full selector represented
         *                             as a string
         *
         * @example
         * const root = postcss.parse('a, b { }');
         * const rule = root.first;
         * rule.selector //=> 'a, b'
         */

        /**
         * @memberof Rule#
         * @member {object} raws - Information to generate byte-to-byte equal
         *                         node string as it was in the origin input.
         *
         * Every parser saves its own properties,
         * but the default CSS parser uses:
         *
         * * `before`: the space symbols before the node. It also stores `*`
         *   and `_` symbols before the declaration (IE hack).
         * * `after`: the space symbols after the last child of the node
         *   to the end of the node.
         * * `between`: the symbols between the property and value
         *   for declarations, selector and `{` for rules, or last parameter
         *   and `{` for at-rules.
         * * `semicolon`: contains true if the last child has
         *   an (optional) semicolon.
         *
         * PostCSS cleans selectors from comments and extra spaces,
         * but it stores origin content in raws properties.
         * As such, if you don’t change a declaration’s value,
         * PostCSS will use the raw value with comments.
         *
         * @example
         * const root = postcss.parse('a {\n  color:black\n}')
         * root.first.first.raws //=> { before: '', between: ' ', after: '\n' }
         */

    }]);

    return Rule;
}(_container2.default);

exports.default = Rule;
module.exports = exports['default'];


},{"./container":17,"./list":22,"./warn-once":38}],33:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultRaw = {
    colon: ': ',
    indent: '    ',
    beforeDecl: '\n',
    beforeRule: '\n',
    beforeOpen: ' ',
    beforeClose: '\n',
    beforeComment: '\n',
    after: '\n',
    emptyBody: '',
    commentLeft: ' ',
    commentRight: ' '
};

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}

var Stringifier = function () {
    function Stringifier(builder) {
        _classCallCheck(this, Stringifier);

        this.builder = builder;
    }

    Stringifier.prototype.stringify = function stringify(node, semicolon) {
        this[node.type](node, semicolon);
    };

    Stringifier.prototype.root = function root(node) {
        this.body(node);
        if (node.raws.after) this.builder(node.raws.after);
    };

    Stringifier.prototype.comment = function comment(node) {
        var left = this.raw(node, 'left', 'commentLeft');
        var right = this.raw(node, 'right', 'commentRight');
        this.builder('/*' + left + node.text + right + '*/', node);
    };

    Stringifier.prototype.decl = function decl(node, semicolon) {
        var between = this.raw(node, 'between', 'colon');
        var string = node.prop + between + this.rawValue(node, 'value');

        if (node.important) {
            string += node.raws.important || ' !important';
        }

        if (semicolon) string += ';';
        this.builder(string, node);
    };

    Stringifier.prototype.rule = function rule(node) {
        this.block(node, this.rawValue(node, 'selector'));
    };

    Stringifier.prototype.atrule = function atrule(node, semicolon) {
        var name = '@' + node.name;
        var params = node.params ? this.rawValue(node, 'params') : '';

        if (typeof node.raws.afterName !== 'undefined') {
            name += node.raws.afterName;
        } else if (params) {
            name += ' ';
        }

        if (node.nodes) {
            this.block(node, name + params);
        } else {
            var end = (node.raws.between || '') + (semicolon ? ';' : '');
            this.builder(name + params + end, node);
        }
    };

    Stringifier.prototype.body = function body(node) {
        var last = node.nodes.length - 1;
        while (last > 0) {
            if (node.nodes[last].type !== 'comment') break;
            last -= 1;
        }

        var semicolon = this.raw(node, 'semicolon');
        for (var i = 0; i < node.nodes.length; i++) {
            var child = node.nodes[i];
            var before = this.raw(child, 'before');
            if (before) this.builder(before);
            this.stringify(child, last !== i || semicolon);
        }
    };

    Stringifier.prototype.block = function block(node, start) {
        var between = this.raw(node, 'between', 'beforeOpen');
        this.builder(start + between + '{', node, 'start');

        var after = void 0;
        if (node.nodes && node.nodes.length) {
            this.body(node);
            after = this.raw(node, 'after');
        } else {
            after = this.raw(node, 'after', 'emptyBody');
        }

        if (after) this.builder(after);
        this.builder('}', node, 'end');
    };

    Stringifier.prototype.raw = function raw(node, own, detect) {
        var value = void 0;
        if (!detect) detect = own;

        // Already had
        if (own) {
            value = node.raws[own];
            if (typeof value !== 'undefined') return value;
        }

        var parent = node.parent;

        // Hack for first rule in CSS
        if (detect === 'before') {
            if (!parent || parent.type === 'root' && parent.first === node) {
                return '';
            }
        }

        // Floating child without parent
        if (!parent) return defaultRaw[detect];

        // Detect style by other nodes
        var root = node.root();
        if (!root.rawCache) root.rawCache = {};
        if (typeof root.rawCache[detect] !== 'undefined') {
            return root.rawCache[detect];
        }

        if (detect === 'before' || detect === 'after') {
            return this.beforeAfter(node, detect);
        } else {
            var method = 'raw' + capitalize(detect);
            if (this[method]) {
                value = this[method](root, node);
            } else {
                root.walk(function (i) {
                    value = i.raws[own];
                    if (typeof value !== 'undefined') return false;
                });
            }
        }

        if (typeof value === 'undefined') value = defaultRaw[detect];

        root.rawCache[detect] = value;
        return value;
    };

    Stringifier.prototype.rawSemicolon = function rawSemicolon(root) {
        var value = void 0;
        root.walk(function (i) {
            if (i.nodes && i.nodes.length && i.last.type === 'decl') {
                value = i.raws.semicolon;
                if (typeof value !== 'undefined') return false;
            }
        });
        return value;
    };

    Stringifier.prototype.rawEmptyBody = function rawEmptyBody(root) {
        var value = void 0;
        root.walk(function (i) {
            if (i.nodes && i.nodes.length === 0) {
                value = i.raws.after;
                if (typeof value !== 'undefined') return false;
            }
        });
        return value;
    };

    Stringifier.prototype.rawIndent = function rawIndent(root) {
        if (root.raws.indent) return root.raws.indent;
        var value = void 0;
        root.walk(function (i) {
            var p = i.parent;
            if (p && p !== root && p.parent && p.parent === root) {
                if (typeof i.raws.before !== 'undefined') {
                    var parts = i.raws.before.split('\n');
                    value = parts[parts.length - 1];
                    value = value.replace(/[^\s]/g, '');
                    return false;
                }
            }
        });
        return value;
    };

    Stringifier.prototype.rawBeforeComment = function rawBeforeComment(root, node) {
        var value = void 0;
        root.walkComments(function (i) {
            if (typeof i.raws.before !== 'undefined') {
                value = i.raws.before;
                if (value.indexOf('\n') !== -1) {
                    value = value.replace(/[^\n]+$/, '');
                }
                return false;
            }
        });
        if (typeof value === 'undefined') {
            value = this.raw(node, null, 'beforeDecl');
        }
        return value;
    };

    Stringifier.prototype.rawBeforeDecl = function rawBeforeDecl(root, node) {
        var value = void 0;
        root.walkDecls(function (i) {
            if (typeof i.raws.before !== 'undefined') {
                value = i.raws.before;
                if (value.indexOf('\n') !== -1) {
                    value = value.replace(/[^\n]+$/, '');
                }
                return false;
            }
        });
        if (typeof value === 'undefined') {
            value = this.raw(node, null, 'beforeRule');
        }
        return value;
    };

    Stringifier.prototype.rawBeforeRule = function rawBeforeRule(root) {
        var value = void 0;
        root.walk(function (i) {
            if (i.nodes && (i.parent !== root || root.first !== i)) {
                if (typeof i.raws.before !== 'undefined') {
                    value = i.raws.before;
                    if (value.indexOf('\n') !== -1) {
                        value = value.replace(/[^\n]+$/, '');
                    }
                    return false;
                }
            }
        });
        return value;
    };

    Stringifier.prototype.rawBeforeClose = function rawBeforeClose(root) {
        var value = void 0;
        root.walk(function (i) {
            if (i.nodes && i.nodes.length > 0) {
                if (typeof i.raws.after !== 'undefined') {
                    value = i.raws.after;
                    if (value.indexOf('\n') !== -1) {
                        value = value.replace(/[^\n]+$/, '');
                    }
                    return false;
                }
            }
        });
        return value;
    };

    Stringifier.prototype.rawBeforeOpen = function rawBeforeOpen(root) {
        var value = void 0;
        root.walk(function (i) {
            if (i.type !== 'decl') {
                value = i.raws.between;
                if (typeof value !== 'undefined') return false;
            }
        });
        return value;
    };

    Stringifier.prototype.rawColon = function rawColon(root) {
        var value = void 0;
        root.walkDecls(function (i) {
            if (typeof i.raws.between !== 'undefined') {
                value = i.raws.between.replace(/[^\s:]/g, '');
                return false;
            }
        });
        return value;
    };

    Stringifier.prototype.beforeAfter = function beforeAfter(node, detect) {
        var value = void 0;
        if (node.type === 'decl') {
            value = this.raw(node, null, 'beforeDecl');
        } else if (node.type === 'comment') {
            value = this.raw(node, null, 'beforeComment');
        } else if (detect === 'before') {
            value = this.raw(node, null, 'beforeRule');
        } else {
            value = this.raw(node, null, 'beforeClose');
        }

        var buf = node.parent;
        var depth = 0;
        while (buf && buf.type !== 'root') {
            depth += 1;
            buf = buf.parent;
        }

        if (value.indexOf('\n') !== -1) {
            var indent = this.raw(node, null, 'indent');
            if (indent.length) {
                for (var step = 0; step < depth; step++) {
                    value += indent;
                }
            }
        }

        return value;
    };

    Stringifier.prototype.rawValue = function rawValue(node, prop) {
        var value = node[prop];
        var raw = node.raws[prop];
        if (raw && raw.value === value) {
            return raw.raw;
        } else {
            return value;
        }
    };

    return Stringifier;
}();

exports.default = Stringifier;
module.exports = exports['default'];


},{}],34:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = stringify;

var _stringifier = require('./stringifier');

var _stringifier2 = _interopRequireDefault(_stringifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stringify(node, builder) {
    var str = new _stringifier2.default(builder);
    str.stringify(node);
}
module.exports = exports['default'];


},{"./stringifier":33}],35:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _tokenize = require('./tokenize');

var _tokenize2 = _interopRequireDefault(_tokenize);

var _input = require('./input');

var _input2 = _interopRequireDefault(_input);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var colors = new _chalk2.default.constructor({ enabled: true });

var HIGHLIGHT_THEME = {
    'brackets': colors.cyan,
    'at-word': colors.cyan,
    'call': colors.cyan,
    'comment': colors.gray,
    'string': colors.green,
    'class': colors.yellow,
    'hash': colors.magenta,
    '(': colors.cyan,
    ')': colors.cyan,
    '{': colors.yellow,
    '}': colors.yellow,
    '[': colors.yellow,
    ']': colors.yellow,
    ':': colors.yellow,
    ';': colors.yellow
};

function getTokenType(_ref, index, tokens) {
    var type = _ref[0],
        value = _ref[1];

    if (type === 'word') {
        if (value[0] === '.') {
            return 'class';
        }
        if (value[0] === '#') {
            return 'hash';
        }
    }

    var nextToken = tokens[index + 1];
    if (nextToken && (nextToken[0] === 'brackets' || nextToken[0] === '(')) {
        return 'call';
    }

    return type;
}

function terminalHighlight(css) {
    var tokens = (0, _tokenize2.default)(new _input2.default(css), { ignoreErrors: true });
    return tokens.map(function (token, index) {
        var color = HIGHLIGHT_THEME[getTokenType(token, index, tokens)];
        if (color) {
            return token[1].split(/\r?\n/).map(function (i) {
                return color(i);
            }).join('\n');
        } else {
            return token[1];
        }
    }).join('');
}

exports.default = terminalHighlight;
module.exports = exports['default'];


},{"./input":20,"./tokenize":36,"chalk":8}],36:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = tokenize;
var SINGLE_QUOTE = 39;
var DOUBLE_QUOTE = 34;
var BACKSLASH = 92;
var SLASH = 47;
var NEWLINE = 10;
var SPACE = 32;
var FEED = 12;
var TAB = 9;
var CR = 13;
var OPEN_SQUARE = 91;
var CLOSE_SQUARE = 93;
var OPEN_PARENTHESES = 40;
var CLOSE_PARENTHESES = 41;
var OPEN_CURLY = 123;
var CLOSE_CURLY = 125;
var SEMICOLON = 59;
var ASTERISK = 42;
var COLON = 58;
var AT = 64;

var RE_AT_END = /[ \n\t\r\f\{\(\)'"\\;/\[\]#]/g;
var RE_WORD_END = /[ \n\t\r\f\(\)\{\}:;@!'"\\\]\[#]|\/(?=\*)/g;
var RE_BAD_BRACKET = /.[\\\/\("'\n]/;

function tokenize(input) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var tokens = [];
    var css = input.css.valueOf();

    var ignore = options.ignoreErrors;

    var code = void 0,
        next = void 0,
        quote = void 0,
        lines = void 0,
        last = void 0,
        content = void 0,
        escape = void 0,
        nextLine = void 0,
        nextOffset = void 0,
        escaped = void 0,
        escapePos = void 0,
        prev = void 0,
        n = void 0;

    var length = css.length;
    var offset = -1;
    var line = 1;
    var pos = 0;

    function unclosed(what) {
        throw input.error('Unclosed ' + what, line, pos - offset);
    }

    while (pos < length) {
        code = css.charCodeAt(pos);

        if (code === NEWLINE || code === FEED || code === CR && css.charCodeAt(pos + 1) !== NEWLINE) {
            offset = pos;
            line += 1;
        }

        switch (code) {
            case NEWLINE:
            case SPACE:
            case TAB:
            case CR:
            case FEED:
                next = pos;
                do {
                    next += 1;
                    code = css.charCodeAt(next);
                    if (code === NEWLINE) {
                        offset = next;
                        line += 1;
                    }
                } while (code === SPACE || code === NEWLINE || code === TAB || code === CR || code === FEED);

                tokens.push(['space', css.slice(pos, next)]);
                pos = next - 1;
                break;

            case OPEN_SQUARE:
                tokens.push(['[', '[', line, pos - offset]);
                break;

            case CLOSE_SQUARE:
                tokens.push([']', ']', line, pos - offset]);
                break;

            case OPEN_CURLY:
                tokens.push(['{', '{', line, pos - offset]);
                break;

            case CLOSE_CURLY:
                tokens.push(['}', '}', line, pos - offset]);
                break;

            case COLON:
                tokens.push([':', ':', line, pos - offset]);
                break;

            case SEMICOLON:
                tokens.push([';', ';', line, pos - offset]);
                break;

            case OPEN_PARENTHESES:
                prev = tokens.length ? tokens[tokens.length - 1][1] : '';
                n = css.charCodeAt(pos + 1);
                if (prev === 'url' && n !== SINGLE_QUOTE && n !== DOUBLE_QUOTE && n !== SPACE && n !== NEWLINE && n !== TAB && n !== FEED && n !== CR) {
                    next = pos;
                    do {
                        escaped = false;
                        next = css.indexOf(')', next + 1);
                        if (next === -1) {
                            if (ignore) {
                                next = pos;
                                break;
                            } else {
                                unclosed('bracket');
                            }
                        }
                        escapePos = next;
                        while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
                            escapePos -= 1;
                            escaped = !escaped;
                        }
                    } while (escaped);

                    tokens.push(['brackets', css.slice(pos, next + 1), line, pos - offset, line, next - offset]);
                    pos = next;
                } else {
                    next = css.indexOf(')', pos + 1);
                    content = css.slice(pos, next + 1);

                    if (next === -1 || RE_BAD_BRACKET.test(content)) {
                        tokens.push(['(', '(', line, pos - offset]);
                    } else {
                        tokens.push(['brackets', content, line, pos - offset, line, next - offset]);
                        pos = next;
                    }
                }

                break;

            case CLOSE_PARENTHESES:
                tokens.push([')', ')', line, pos - offset]);
                break;

            case SINGLE_QUOTE:
            case DOUBLE_QUOTE:
                quote = code === SINGLE_QUOTE ? '\'' : '"';
                next = pos;
                do {
                    escaped = false;
                    next = css.indexOf(quote, next + 1);
                    if (next === -1) {
                        if (ignore) {
                            next = pos + 1;
                            break;
                        } else {
                            unclosed('string');
                        }
                    }
                    escapePos = next;
                    while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
                        escapePos -= 1;
                        escaped = !escaped;
                    }
                } while (escaped);

                content = css.slice(pos, next + 1);
                lines = content.split('\n');
                last = lines.length - 1;

                if (last > 0) {
                    nextLine = line + last;
                    nextOffset = next - lines[last].length;
                } else {
                    nextLine = line;
                    nextOffset = offset;
                }

                tokens.push(['string', css.slice(pos, next + 1), line, pos - offset, nextLine, next - nextOffset]);

                offset = nextOffset;
                line = nextLine;
                pos = next;
                break;

            case AT:
                RE_AT_END.lastIndex = pos + 1;
                RE_AT_END.test(css);
                if (RE_AT_END.lastIndex === 0) {
                    next = css.length - 1;
                } else {
                    next = RE_AT_END.lastIndex - 2;
                }
                tokens.push(['at-word', css.slice(pos, next + 1), line, pos - offset, line, next - offset]);
                pos = next;
                break;

            case BACKSLASH:
                next = pos;
                escape = true;
                while (css.charCodeAt(next + 1) === BACKSLASH) {
                    next += 1;
                    escape = !escape;
                }
                code = css.charCodeAt(next + 1);
                if (escape && code !== SLASH && code !== SPACE && code !== NEWLINE && code !== TAB && code !== CR && code !== FEED) {
                    next += 1;
                }
                tokens.push(['word', css.slice(pos, next + 1), line, pos - offset, line, next - offset]);
                pos = next;
                break;

            default:
                if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
                    next = css.indexOf('*/', pos + 2) + 1;
                    if (next === 0) {
                        if (ignore) {
                            next = css.length;
                        } else {
                            unclosed('comment');
                        }
                    }

                    content = css.slice(pos, next + 1);
                    lines = content.split('\n');
                    last = lines.length - 1;

                    if (last > 0) {
                        nextLine = line + last;
                        nextOffset = next - lines[last].length;
                    } else {
                        nextLine = line;
                        nextOffset = offset;
                    }

                    tokens.push(['comment', content, line, pos - offset, nextLine, next - nextOffset]);

                    offset = nextOffset;
                    line = nextLine;
                    pos = next;
                } else {
                    RE_WORD_END.lastIndex = pos + 1;
                    RE_WORD_END.test(css);
                    if (RE_WORD_END.lastIndex === 0) {
                        next = css.length - 1;
                    } else {
                        next = RE_WORD_END.lastIndex - 2;
                    }

                    tokens.push(['word', css.slice(pos, next + 1), line, pos - offset, line, next - offset]);
                    pos = next;
                }

                break;
        }

        pos++;
    }

    return tokens;
}
module.exports = exports['default'];


},{}],37:[function(require,module,exports){
'use strict';

exports.__esModule = true;
/**
 * Contains helpers for working with vendor prefixes.
 *
 * @example
 * const vendor = postcss.vendor;
 *
 * @namespace vendor
 */
var vendor = {

    /**
     * Returns the vendor prefix extracted from an input string.
     *
     * @param {string} prop - string with or without vendor prefix
     *
     * @return {string} vendor prefix or empty string
     *
     * @example
     * postcss.vendor.prefix('-moz-tab-size') //=> '-moz-'
     * postcss.vendor.prefix('tab-size')      //=> ''
     */
    prefix: function prefix(prop) {
        var match = prop.match(/^(-\w+-)/);
        if (match) {
            return match[0];
        } else {
            return '';
        }
    },


    /**
     * Returns the input string stripped of its vendor prefix.
     *
     * @param {string} prop - string with or without vendor prefix
     *
     * @return {string} string name without vendor prefixes
     *
     * @example
     * postcss.vendor.unprefixed('-moz-tab-size') //=> 'tab-size'
     */
    unprefixed: function unprefixed(prop) {
        return prop.replace(/^-\w+-/, '');
    }
};

exports.default = vendor;
module.exports = exports['default'];


},{}],38:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = warnOnce;
var printed = {};

function warnOnce(message) {
    if (printed[message]) return;
    printed[message] = true;

    if (typeof console !== 'undefined' && console.warn) console.warn(message);
}
module.exports = exports['default'];


},{}],39:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a plugin’s warning. It can be created using {@link Node#warn}.
 *
 * @example
 * if ( decl.important ) {
 *     decl.warn(result, 'Avoid !important', { word: '!important' });
 * }
 */
var Warning = function () {

  /**
   * @param {string} text        - warning message
   * @param {Object} [opts]      - warning options
   * @param {Node}   opts.node   - CSS node that caused the warning
   * @param {string} opts.word   - word in CSS source that caused the warning
   * @param {number} opts.index  - index in CSS node string that caused
   *                               the warning
   * @param {string} opts.plugin - name of the plugin that created
   *                               this warning. {@link Result#warn} fills
   *                               this property automatically.
   */
  function Warning(text) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Warning);

    /**
     * @member {string} - Type to filter warnings from
     *                    {@link Result#messages}. Always equal
     *                    to `"warning"`.
     *
     * @example
     * const nonWarning = result.messages.filter(i => i.type !== 'warning')
     */
    this.type = 'warning';
    /**
     * @member {string} - The warning message.
     *
     * @example
     * warning.text //=> 'Try to avoid !important'
     */
    this.text = text;

    if (opts.node && opts.node.source) {
      var pos = opts.node.positionBy(opts);
      /**
       * @member {number} - Line in the input file
       *                    with this warning’s source
       *
       * @example
       * warning.line //=> 5
       */
      this.line = pos.line;
      /**
       * @member {number} - Column in the input file
       *                    with this warning’s source.
       *
       * @example
       * warning.column //=> 6
       */
      this.column = pos.column;
    }

    for (var opt in opts) {
      this[opt] = opts[opt];
    }
  }

  /**
   * Returns a warning position and message.
   *
   * @example
   * warning.toString() //=> 'postcss-lint:a.css:10:14: Avoid !important'
   *
   * @return {string} warning position and message
   */


  Warning.prototype.toString = function toString() {
    if (this.node) {
      return this.node.error(this.text, {
        plugin: this.plugin,
        index: this.index,
        word: this.word
      }).message;
    } else if (this.plugin) {
      return this.plugin + ': ' + this.text;
    } else {
      return this.text;
    }
  };

  /**
   * @memberof Warning#
   * @member {string} plugin - The name of the plugin that created
   *                           it will fill this property automatically.
   *                           this warning. When you call {@link Node#warn}
   *
   * @example
   * warning.plugin //=> 'postcss-important'
   */

  /**
   * @memberof Warning#
   * @member {Node} node - Contains the CSS node that caused the warning.
   *
   * @example
   * warning.node.toString() //=> 'color: white !important'
   */

  return Warning;
}();

exports.default = Warning;
module.exports = exports['default'];


},{}],40:[function(require,module,exports){
'use strict';
module.exports = false;

},{}],41:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],42:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');
var has = Object.prototype.hasOwnProperty;

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = util.toSetString(aStr);
  var isDuplicate = has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    this._set[sStr] = idx;
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  var sStr = util.toSetString(aStr);
  return has.call(this._set, sStr);
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  var sStr = util.toSetString(aStr);
  if (has.call(this._set, sStr)) {
    return this._set[sStr];
  }
  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

exports.ArraySet = ArraySet;

},{"./util":51}],43:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var base64 = require('./base64');

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
exports.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

},{"./base64":44}],44:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
exports.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
exports.decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

},{}],45:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};

},{}],46:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

exports.MappingList = MappingList;

},{"./util":51}],47:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
exports.quickSort = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

},{}],48:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');
var binarySearch = require('./binary-search');
var ArraySet = require('./array-set').ArraySet;
var base64VLQ = require('./base64-vlq');
var quickSort = require('./quick-sort').quickSort;

function SourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap)
    : new BasicSourceMapConsumer(sourceMap);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
}

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      if (source != null && sourceRoot != null) {
        source = util.join(sourceRoot, source);
      }
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: Optional. the column number in the original source.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    if (this.sourceRoot != null) {
      needle.source = util.relative(this.sourceRoot, needle.source);
    }
    if (!this._sources.has(needle.source)) {
      return [];
    }
    needle.source = this._sources.indexOf(needle.source);

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

exports.SourceMapConsumer = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The only parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet.fromArray(names.map(String), true);
  this._sources = ArraySet.fromArray(sources, true);

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._sources.toArray().map(function (s) {
      return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
    }, this);
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64VLQ.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          if (this.sourceRoot != null) {
            source = util.join(this.sourceRoot, source);
          }
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    if (this.sourceRoot != null) {
      aSource = util.relative(this.sourceRoot, aSource);
    }

    if (this._sources.has(aSource)) {
      return this.sourcesContent[this._sources.indexOf(aSource)];
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + aSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + aSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    if (this.sourceRoot != null) {
      source = util.relative(this.sourceRoot, source);
    }
    if (!this._sources.has(source)) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }
    source = this._sources.indexOf(source);

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

exports.BasicSourceMapConsumer = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The only parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet();
  this._names = new ArraySet();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'))
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer.sources.indexOf(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        if (section.consumer.sourceRoot !== null) {
          source = util.join(section.consumer.sourceRoot, source);
        }
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = section.consumer._names.at(mapping.name);
        this._names.add(name);
        name = this._names.indexOf(name);

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util.compareByOriginalPositions);
  };

exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;

},{"./array-set":42,"./base64-vlq":43,"./binary-search":45,"./quick-sort":47,"./util":51}],49:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var base64VLQ = require('./base64-vlq');
var util = require('./util');
var ArraySet = require('./array-set').ArraySet;
var MappingList = require('./mapping-list').MappingList;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util.getArg(aArgs, 'file', null);
  this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet();
  this._names = new ArraySet();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator({
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    });
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util.getArg(aArgs, 'generated');
    var original = util.getArg(aArgs, 'original', null);
    var source = util.getArg(aArgs, 'source', null);
    var name = util.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet();
    var newNames = new ArraySet();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util.join(aSourceMapPath, mapping.source)
          }
          if (sourceRoot != null) {
            mapping.source = util.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      throw new Error('Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = ''

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64VLQ.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util.relative(aSourceRoot, source);
      }
      var key = util.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

exports.SourceMapGenerator = SourceMapGenerator;

},{"./array-set":42,"./base64-vlq":43,"./mapping-list":46,"./util":51}],50:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
var util = require('./util');

// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
SourceNode.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are removed from this array, by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var shiftNextLine = function() {
      var lineContents = remainingLines.shift();
      // The last line of a file might not have a newline.
      var newLine = remainingLines.shift() || "";
      return lineContents + newLine;
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[0];
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[0];
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[0] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLines.length > 0) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? util.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  };

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length-1; i >= 0; i--) {
      this.prepend(aChunk[i]);
    }
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walk = function SourceNode_walk(aFn) {
  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this.children[i];
    if (chunk[isSourceNode]) {
      chunk.walk(aFn);
    }
    else {
      if (chunk !== '') {
        aFn(chunk, { source: this.source,
                     line: this.line,
                     column: this.column,
                     name: this.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
SourceNode.prototype.join = function SourceNode_join(aSep) {
  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len-1; i++) {
      newChildren.push(this.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  }
  else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  }
  else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
SourceNode.prototype.setSourceContent =
  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
  };

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walkSourceContents =
  function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }

    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length; i < len; i++) {
      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
SourceNode.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new SourceMapGenerator(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null
        && original.line !== null
        && original.column !== null) {
      if(lastOriginalSource !== original.source
         || lastOriginalLine !== original.line
         || lastOriginalColumn !== original.column
         || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

exports.SourceNode = SourceNode;

},{"./source-map-generator":49,"./util":51}],51:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || !!aPath.match(urlRegexp);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

},{}],52:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./lib/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./lib/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./lib/source-node').SourceNode;

},{"./lib/source-map-consumer":48,"./lib/source-map-generator":49,"./lib/source-node":50}],53:[function(require,module,exports){
'use strict';
var ansiRegex = require('ansi-regex')();

module.exports = function (str) {
	return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
};

},{"ansi-regex":3}],54:[function(require,module,exports){
(function (process){
'use strict';
var argv = process.argv;

var terminator = argv.indexOf('--');
var hasFlag = function (flag) {
	flag = '--' + flag;
	var pos = argv.indexOf(flag);
	return pos !== -1 && (terminator !== -1 ? pos < terminator : true);
};

module.exports = (function () {
	if ('FORCE_COLOR' in process.env) {
		return true;
	}

	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false')) {
		return false;
	}

	if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		return true;
	}

	if (process.stdout && !process.stdout.isTTY) {
		return false;
	}

	if (process.platform === 'win32') {
		return true;
	}

	if ('COLORTERM' in process.env) {
		return true;
	}

	if (process.env.TERM === 'dumb') {
		return false;
	}

	if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
		return true;
	}

	return false;
})();

}).call(this,require('_process'))

},{"_process":41}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZW1vcy80L2luZGV4LmpzIiwiZGVtb3Mvc3JjL2dldC1wYWdlLXN0eWxlcy5qcyIsIm5vZGVfbW9kdWxlcy9hbnNpLXJlZ2V4L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Fuc2ktc3R5bGVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCJub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NoYWxrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2VzY2FwZS1zdHJpbmctcmVnZXhwL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2hhcy1hbnNpL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9qcy1iYXNlNjQvYmFzZTY0LmpzIiwibm9kZV9tb2R1bGVzL3BhdGgtYnJvd3NlcmlmeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9hdC1ydWxlLmVzNiIsIm5vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9jb21tZW50LmVzNiIsIm5vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9jb250YWluZXIuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL2Nzcy1zeW50YXgtZXJyb3IuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL2RlY2xhcmF0aW9uLmVzNiIsIm5vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9pbnB1dC5lczYiLCJub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvbGF6eS1yZXN1bHQuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL2xpc3QuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL21hcC1nZW5lcmF0b3IuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL25vZGUuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL3BhcnNlLmVzNiIsIm5vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9wYXJzZXIuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL3Bvc3Rjc3MuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL3ByZXZpb3VzLW1hcC5lczYiLCJub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvcHJvY2Vzc29yLmVzNiIsIm5vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9yZXN1bHQuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL3Jvb3QuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL3J1bGUuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL3N0cmluZ2lmaWVyLmVzNiIsIm5vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi9zdHJpbmdpZnkuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL3Rlcm1pbmFsLWhpZ2hsaWdodC5lczYiLCJub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvdG9rZW5pemUuZXM2Iiwibm9kZV9tb2R1bGVzL3Bvc3Rjc3MvbGliL3ZlbmRvci5lczYiLCJub2RlX21vZHVsZXMvcG9zdGNzcy9saWIvd2Fybi1vbmNlLmVzNiIsIm5vZGVfbW9kdWxlcy9wb3N0Y3NzL2xpYi93YXJuaW5nLmVzNiIsIm5vZGVfbW9kdWxlcy9wb3N0Y3NzL25vZGVfbW9kdWxlcy9zdXBwb3J0cy1jb2xvci9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9zb3VyY2UtbWFwL2xpYi9hcnJheS1zZXQuanMiLCJub2RlX21vZHVsZXMvc291cmNlLW1hcC9saWIvYmFzZTY0LXZscS5qcyIsIm5vZGVfbW9kdWxlcy9zb3VyY2UtbWFwL2xpYi9iYXNlNjQuanMiLCJub2RlX21vZHVsZXMvc291cmNlLW1hcC9saWIvYmluYXJ5LXNlYXJjaC5qcyIsIm5vZGVfbW9kdWxlcy9zb3VyY2UtbWFwL2xpYi9tYXBwaW5nLWxpc3QuanMiLCJub2RlX21vZHVsZXMvc291cmNlLW1hcC9saWIvcXVpY2stc29ydC5qcyIsIm5vZGVfbW9kdWxlcy9zb3VyY2UtbWFwL2xpYi9zb3VyY2UtbWFwLWNvbnN1bWVyLmpzIiwibm9kZV9tb2R1bGVzL3NvdXJjZS1tYXAvbGliL3NvdXJjZS1tYXAtZ2VuZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL3NvdXJjZS1tYXAvbGliL3NvdXJjZS1ub2RlLmpzIiwibm9kZV9tb2R1bGVzL3NvdXJjZS1tYXAvbGliL3V0aWwuanMiLCJub2RlX21vZHVsZXMvc291cmNlLW1hcC9zb3VyY2UtbWFwLmpzIiwibm9kZV9tb2R1bGVzL3N0cmlwLWFuc2kvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3VwcG9ydHMtY29sb3IvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7O0FBQ0E7Ozs7OztBQUVBLCtCQUNHLElBREgsQ0FDUSxVQUFDLEdBQUQ7QUFBQSxTQUFTLGtCQUFRLEtBQVIsQ0FBYyxHQUFkLENBQVQ7QUFBQSxDQURSLEVBRUcsSUFGSCxDQUVRLFVBQUMsR0FBRDtBQUFBLFNBQVMsUUFBUSxHQUFSLENBQVksR0FBWixDQUFUO0FBQUEsQ0FGUjs7Ozs7Ozs7O2tCQ0hlLFlBQVc7QUFDeEI7QUFDQSxNQUFJLDZDQUNJLFNBQVMsZ0JBQVQsQ0FBMEIsK0JBQTFCLENBREosRUFBSjs7QUFHQTtBQUNBO0FBQ0EsU0FBTyxRQUFRLEdBQVIsQ0FBWSxjQUFjLEdBQWQsQ0FBa0IsVUFBQyxFQUFELEVBQVE7QUFDM0MsUUFBSSxHQUFHLElBQVAsRUFBYTtBQUNYLGFBQU8sTUFBTSxHQUFHLElBQVQsRUFBZSxJQUFmLENBQW9CLFVBQUMsUUFBRDtBQUFBLGVBQWMsU0FBUyxJQUFULEVBQWQ7QUFBQSxPQUFwQixDQUFQO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsYUFBTyxHQUFHLFNBQVY7QUFDRDtBQUNGLEdBTmtCLENBQVosRUFNSCxJQU5HLENBTUUsVUFBQyxXQUFEO0FBQUEsV0FBaUIsWUFBWSxJQUFaLENBQWlCLElBQWpCLENBQWpCO0FBQUEsR0FORixDQUFQO0FBT0QsQzs7OztBQUFBOzs7QUNkRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzd2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHBvc3Rjc3MgZnJvbSAncG9zdGNzcyc7XG5pbXBvcnQgZ2V0UGFnZVN0eWxlcyBmcm9tICcuLi9zcmMvZ2V0LXBhZ2Utc3R5bGVzJztcblxuZ2V0UGFnZVN0eWxlcygpXG4gIC50aGVuKChjc3MpID0+IHBvc3Rjc3MucGFyc2UoY3NzKSlcbiAgLnRoZW4oKGFzdCkgPT4gY29uc29sZS5sb2coYXN0KSk7XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgLy8gUXVlcnkgdGhlIGRvY3VtZW50IGZvciBhbnkgZWxlbWVudCB0aGF0IGNvdWxkIGhhdmUgc3R5bGVzLlxuICB2YXIgc3R5bGVFbGVtZW50cyA9XG4gICAgICBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc3R5bGUsIGxpbmtbcmVsPVwic3R5bGVzaGVldFwiXScpXTtcblxuICAvLyBGZXRjaCBhbGwgc3R5bGVzIGFuZCBlbnN1cmUgdGhlIHJlc3VsdHMgYXJlIGluIGRvY3VtZW50IG9yZGVyLlxuICAvLyBSZXNvbHZlIHdpdGggYSBzaW5nbGUgc3RyaW5nIG9mIENTUyB0ZXh0LlxuICByZXR1cm4gUHJvbWlzZS5hbGwoc3R5bGVFbGVtZW50cy5tYXAoKGVsKSA9PiB7XG4gICAgaWYgKGVsLmhyZWYpIHtcbiAgICAgIHJldHVybiBmZXRjaChlbC5ocmVmKS50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UudGV4dCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGVsLmlubmVyVGV4dDtcbiAgICB9XG4gIH0pKS50aGVuKChzdHlsZXNBcnJheSkgPT4gc3R5bGVzQXJyYXkuam9pbignXFxuJykpO1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gL1tcXHUwMDFiXFx1MDA5Yl1bWygpIzs/XSooPzpbMC05XXsxLDR9KD86O1swLTldezAsNH0pKik/WzAtOUEtT1JaY2YtbnFyeT0+PF0vZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGFzc2VtYmxlU3R5bGVzICgpIHtcblx0dmFyIHN0eWxlcyA9IHtcblx0XHRtb2RpZmllcnM6IHtcblx0XHRcdHJlc2V0OiBbMCwgMF0sXG5cdFx0XHRib2xkOiBbMSwgMjJdLCAvLyAyMSBpc24ndCB3aWRlbHkgc3VwcG9ydGVkIGFuZCAyMiBkb2VzIHRoZSBzYW1lIHRoaW5nXG5cdFx0XHRkaW06IFsyLCAyMl0sXG5cdFx0XHRpdGFsaWM6IFszLCAyM10sXG5cdFx0XHR1bmRlcmxpbmU6IFs0LCAyNF0sXG5cdFx0XHRpbnZlcnNlOiBbNywgMjddLFxuXHRcdFx0aGlkZGVuOiBbOCwgMjhdLFxuXHRcdFx0c3RyaWtldGhyb3VnaDogWzksIDI5XVxuXHRcdH0sXG5cdFx0Y29sb3JzOiB7XG5cdFx0XHRibGFjazogWzMwLCAzOV0sXG5cdFx0XHRyZWQ6IFszMSwgMzldLFxuXHRcdFx0Z3JlZW46IFszMiwgMzldLFxuXHRcdFx0eWVsbG93OiBbMzMsIDM5XSxcblx0XHRcdGJsdWU6IFszNCwgMzldLFxuXHRcdFx0bWFnZW50YTogWzM1LCAzOV0sXG5cdFx0XHRjeWFuOiBbMzYsIDM5XSxcblx0XHRcdHdoaXRlOiBbMzcsIDM5XSxcblx0XHRcdGdyYXk6IFs5MCwgMzldXG5cdFx0fSxcblx0XHRiZ0NvbG9yczoge1xuXHRcdFx0YmdCbGFjazogWzQwLCA0OV0sXG5cdFx0XHRiZ1JlZDogWzQxLCA0OV0sXG5cdFx0XHRiZ0dyZWVuOiBbNDIsIDQ5XSxcblx0XHRcdGJnWWVsbG93OiBbNDMsIDQ5XSxcblx0XHRcdGJnQmx1ZTogWzQ0LCA0OV0sXG5cdFx0XHRiZ01hZ2VudGE6IFs0NSwgNDldLFxuXHRcdFx0YmdDeWFuOiBbNDYsIDQ5XSxcblx0XHRcdGJnV2hpdGU6IFs0NywgNDldXG5cdFx0fVxuXHR9O1xuXG5cdC8vIGZpeCBodW1hbnNcblx0c3R5bGVzLmNvbG9ycy5ncmV5ID0gc3R5bGVzLmNvbG9ycy5ncmF5O1xuXG5cdE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChmdW5jdGlvbiAoZ3JvdXBOYW1lKSB7XG5cdFx0dmFyIGdyb3VwID0gc3R5bGVzW2dyb3VwTmFtZV07XG5cblx0XHRPYmplY3Qua2V5cyhncm91cCkuZm9yRWFjaChmdW5jdGlvbiAoc3R5bGVOYW1lKSB7XG5cdFx0XHR2YXIgc3R5bGUgPSBncm91cFtzdHlsZU5hbWVdO1xuXG5cdFx0XHRzdHlsZXNbc3R5bGVOYW1lXSA9IGdyb3VwW3N0eWxlTmFtZV0gPSB7XG5cdFx0XHRcdG9wZW46ICdcXHUwMDFiWycgKyBzdHlsZVswXSArICdtJyxcblx0XHRcdFx0Y2xvc2U6ICdcXHUwMDFiWycgKyBzdHlsZVsxXSArICdtJ1xuXHRcdFx0fTtcblx0XHR9KTtcblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdHlsZXMsIGdyb3VwTmFtZSwge1xuXHRcdFx0dmFsdWU6IGdyb3VwLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2Vcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgJ2V4cG9ydHMnLCB7XG5cdGVudW1lcmFibGU6IHRydWUsXG5cdGdldDogYXNzZW1ibGVTdHlsZXNcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcbmV4cG9ydHMudG9CeXRlQXJyYXkgPSB0b0J5dGVBcnJheVxuZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gZnJvbUJ5dGVBcnJheVxuXG52YXIgbG9va3VwID0gW11cbnZhciByZXZMb29rdXAgPSBbXVxudmFyIEFyciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJyA/IFVpbnQ4QXJyYXkgOiBBcnJheVxuXG52YXIgY29kZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJ1xuZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgbG9va3VwW2ldID0gY29kZVtpXVxuICByZXZMb29rdXBbY29kZS5jaGFyQ29kZUF0KGkpXSA9IGlcbn1cblxucmV2TG9va3VwWyctJy5jaGFyQ29kZUF0KDApXSA9IDYyXG5yZXZMb29rdXBbJ18nLmNoYXJDb2RlQXQoMCldID0gNjNcblxuZnVuY3Rpb24gcGxhY2VIb2xkZXJzQ291bnQgKGI2NCkge1xuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuICBpZiAobGVuICUgNCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuICB9XG5cbiAgLy8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcbiAgLy8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuICAvLyByZXByZXNlbnQgb25lIGJ5dGVcbiAgLy8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG4gIC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2VcbiAgcmV0dXJuIGI2NFtsZW4gLSAyXSA9PT0gJz0nID8gMiA6IGI2NFtsZW4gLSAxXSA9PT0gJz0nID8gMSA6IDBcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoYjY0KSB7XG4gIC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuICByZXR1cm4gYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxufVxuXG5mdW5jdGlvbiB0b0J5dGVBcnJheSAoYjY0KSB7XG4gIHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG4gIHBsYWNlSG9sZGVycyA9IHBsYWNlSG9sZGVyc0NvdW50KGI2NClcblxuICBhcnIgPSBuZXcgQXJyKGxlbiAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG4gIC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcbiAgbCA9IHBsYWNlSG9sZGVycyA+IDAgPyBsZW4gLSA0IDogbGVuXG5cbiAgdmFyIEwgPSAwXG5cbiAgZm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuICAgIHRtcCA9IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDE4KSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCAxMikgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPDwgNikgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDMpXVxuICAgIGFycltMKytdID0gKHRtcCA+PiAxNikgJiAweEZGXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltMKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgaWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuICAgIHRtcCA9IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDIpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldID4+IDQpXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTApIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDQpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildID4+IDIpXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltMKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuICByZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDB4M0ZdICsgbG9va3VwW251bSA+PiAxMiAmIDB4M0ZdICsgbG9va3VwW251bSA+PiA2ICYgMHgzRl0gKyBsb29rdXBbbnVtICYgMHgzRl1cbn1cblxuZnVuY3Rpb24gZW5jb2RlQ2h1bmsgKHVpbnQ4LCBzdGFydCwgZW5kKSB7XG4gIHZhciB0bXBcbiAgdmFyIG91dHB1dCA9IFtdXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgdG1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuICAgIG91dHB1dC5wdXNoKHRyaXBsZXRUb0Jhc2U2NCh0bXApKVxuICB9XG4gIHJldHVybiBvdXRwdXQuam9pbignJylcbn1cblxuZnVuY3Rpb24gZnJvbUJ5dGVBcnJheSAodWludDgpIHtcbiAgdmFyIHRtcFxuICB2YXIgbGVuID0gdWludDgubGVuZ3RoXG4gIHZhciBleHRyYUJ5dGVzID0gbGVuICUgMyAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuICB2YXIgb3V0cHV0ID0gJydcbiAgdmFyIHBhcnRzID0gW11cbiAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODMgLy8gbXVzdCBiZSBtdWx0aXBsZSBvZiAzXG5cbiAgLy8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuICBmb3IgKHZhciBpID0gMCwgbGVuMiA9IGxlbiAtIGV4dHJhQnl0ZXM7IGkgPCBsZW4yOyBpICs9IG1heENodW5rTGVuZ3RoKSB7XG4gICAgcGFydHMucHVzaChlbmNvZGVDaHVuayh1aW50OCwgaSwgKGkgKyBtYXhDaHVua0xlbmd0aCkgPiBsZW4yID8gbGVuMiA6IChpICsgbWF4Q2h1bmtMZW5ndGgpKSlcbiAgfVxuXG4gIC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcbiAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcbiAgICB0bXAgPSB1aW50OFtsZW4gLSAxXVxuICAgIG91dHB1dCArPSBsb29rdXBbdG1wID4+IDJdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFsodG1wIDw8IDQpICYgMHgzRl1cbiAgICBvdXRwdXQgKz0gJz09J1xuICB9IGVsc2UgaWYgKGV4dHJhQnl0ZXMgPT09IDIpIHtcbiAgICB0bXAgPSAodWludDhbbGVuIC0gMl0gPDwgOCkgKyAodWludDhbbGVuIC0gMV0pXG4gICAgb3V0cHV0ICs9IGxvb2t1cFt0bXAgPj4gMTBdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFsodG1wID4+IDQpICYgMHgzRl1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPDwgMikgJiAweDNGXVxuICAgIG91dHB1dCArPSAnPSdcbiAgfVxuXG4gIHBhcnRzLnB1c2gob3V0cHV0KVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCcnKVxufVxuIiwiIiwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBTbG93QnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogRHVlIHRvIHZhcmlvdXMgYnJvd3NlciBidWdzLCBzb21ldGltZXMgdGhlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiB3aWxsIGJlIHVzZWQgZXZlblxuICogd2hlbiB0aGUgYnJvd3NlciBzdXBwb3J0cyB0eXBlZCBhcnJheXMuXG4gKlxuICogTm90ZTpcbiAqXG4gKiAgIC0gRmlyZWZveCA0LTI5IGxhY2tzIHN1cHBvcnQgZm9yIGFkZGluZyBuZXcgcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLFxuICogICAgIFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4LlxuICpcbiAqICAgLSBDaHJvbWUgOS0xMCBpcyBtaXNzaW5nIHRoZSBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uLlxuICpcbiAqICAgLSBJRTEwIGhhcyBhIGJyb2tlbiBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYXJyYXlzIG9mXG4gKiAgICAgaW5jb3JyZWN0IGxlbmd0aCBpbiBzb21lIHNpdHVhdGlvbnMuXG5cbiAqIFdlIGRldGVjdCB0aGVzZSBidWdneSBicm93c2VycyBhbmQgc2V0IGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGAgdG8gYGZhbHNlYCBzbyB0aGV5XG4gKiBnZXQgdGhlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggaXMgc2xvd2VyIGJ1dCBiZWhhdmVzIGNvcnJlY3RseS5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSBnbG9iYWwuVFlQRURfQVJSQVlfU1VQUE9SVCAhPT0gdW5kZWZpbmVkXG4gID8gZ2xvYmFsLlRZUEVEX0FSUkFZX1NVUFBPUlRcbiAgOiB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbi8qXG4gKiBFeHBvcnQga01heExlbmd0aCBhZnRlciB0eXBlZCBhcnJheSBzdXBwb3J0IGlzIGRldGVybWluZWQuXG4gKi9cbmV4cG9ydHMua01heExlbmd0aCA9IGtNYXhMZW5ndGgoKVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KDEpXG4gICAgYXJyLl9fcHJvdG9fXyA9IHtfX3Byb3RvX186IFVpbnQ4QXJyYXkucHJvdG90eXBlLCBmb286IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH19XG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDIgJiYgLy8gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWRcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAmJiAvLyBjaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgICAgICAgYXJyLnN1YmFycmF5KDEsIDEpLmJ5dGVMZW5ndGggPT09IDAgLy8gaWUxMCBoYXMgYnJva2VuIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGtNYXhMZW5ndGggKCkge1xuICByZXR1cm4gQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRcbiAgICA/IDB4N2ZmZmZmZmZcbiAgICA6IDB4M2ZmZmZmZmZcbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyICh0aGF0LCBsZW5ndGgpIHtcbiAgaWYgKGtNYXhMZW5ndGgoKSA8IGxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHR5cGVkIGFycmF5IGxlbmd0aCcpXG4gIH1cbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UsIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgdGhhdCA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgICB0aGF0Ll9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIGFuIG9iamVjdCBpbnN0YW5jZSBvZiB0aGUgQnVmZmVyIGNsYXNzXG4gICAgaWYgKHRoYXQgPT09IG51bGwpIHtcbiAgICAgIHRoYXQgPSBuZXcgQnVmZmVyKGxlbmd0aClcbiAgICB9XG4gICAgdGhhdC5sZW5ndGggPSBsZW5ndGhcbiAgfVxuXG4gIHJldHVybiB0aGF0XG59XG5cbi8qKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBoYXZlIHRoZWlyXG4gKiBwcm90b3R5cGUgY2hhbmdlZCB0byBgQnVmZmVyLnByb3RvdHlwZWAuIEZ1cnRoZXJtb3JlLCBgQnVmZmVyYCBpcyBhIHN1YmNsYXNzIG9mXG4gKiBgVWludDhBcnJheWAsIHNvIHRoZSByZXR1cm5lZCBpbnN0YW5jZXMgd2lsbCBoYXZlIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBtZXRob2RzXG4gKiBhbmQgdGhlIGBVaW50OEFycmF5YCBtZXRob2RzLiBTcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdFxuICogcmV0dXJucyBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBUaGUgYFVpbnQ4QXJyYXlgIHByb3RvdHlwZSByZW1haW5zIHVubW9kaWZpZWQuXG4gKi9cblxuZnVuY3Rpb24gQnVmZmVyIChhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmICEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIC8vIENvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAodHlwZW9mIGVuY29kaW5nT3JPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdJZiBlbmNvZGluZyBpcyBzcGVjaWZpZWQgdGhlbiB0aGUgZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZydcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jVW5zYWZlKHRoaXMsIGFyZylcbiAgfVxuICByZXR1cm4gZnJvbSh0aGlzLCBhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnBvb2xTaXplID0gODE5MiAvLyBub3QgdXNlZCBieSB0aGlzIGltcGxlbWVudGF0aW9uXG5cbi8vIFRPRE86IExlZ2FjeSwgbm90IG5lZWRlZCBhbnltb3JlLiBSZW1vdmUgaW4gbmV4dCBtYWpvciB2ZXJzaW9uLlxuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIGZyb20gKHRoYXQsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgYSBudW1iZXInKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodGhhdCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodGhhdCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQpXG4gIH1cblxuICByZXR1cm4gZnJvbU9iamVjdCh0aGF0LCB2YWx1ZSlcbn1cblxuLyoqXG4gKiBGdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB0byBCdWZmZXIoYXJnLCBlbmNvZGluZykgYnV0IHRocm93cyBhIFR5cGVFcnJvclxuICogaWYgdmFsdWUgaXMgYSBudW1iZXIuXG4gKiBCdWZmZXIuZnJvbShzdHJbLCBlbmNvZGluZ10pXG4gKiBCdWZmZXIuZnJvbShhcnJheSlcbiAqIEJ1ZmZlci5mcm9tKGJ1ZmZlcilcbiAqIEJ1ZmZlci5mcm9tKGFycmF5QnVmZmVyWywgYnl0ZU9mZnNldFssIGxlbmd0aF1dKVxuICoqL1xuQnVmZmVyLmZyb20gPSBmdW5jdGlvbiAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gZnJvbShudWxsLCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG5pZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgQnVmZmVyLnByb3RvdHlwZS5fX3Byb3RvX18gPSBVaW50OEFycmF5LnByb3RvdHlwZVxuICBCdWZmZXIuX19wcm90b19fID0gVWludDhBcnJheVxuICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnNwZWNpZXMgJiZcbiAgICAgIEJ1ZmZlcltTeW1ib2wuc3BlY2llc10gPT09IEJ1ZmZlcikge1xuICAgIC8vIEZpeCBzdWJhcnJheSgpIGluIEVTMjAxNi4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzk3XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlciwgU3ltYm9sLnNwZWNpZXMsIHtcbiAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IGJlIGEgbnVtYmVyJylcbiAgfSBlbHNlIGlmIChzaXplIDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBuZWdhdGl2ZScpXG4gIH1cbn1cblxuZnVuY3Rpb24gYWxsb2MgKHRoYXQsIHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgaWYgKHNpemUgPD0gMCkge1xuICAgIHJldHVybiBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSlcbiAgfVxuICBpZiAoZmlsbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gT25seSBwYXkgYXR0ZW50aW9uIHRvIGVuY29kaW5nIGlmIGl0J3MgYSBzdHJpbmcuIFRoaXNcbiAgICAvLyBwcmV2ZW50cyBhY2NpZGVudGFsbHkgc2VuZGluZyBpbiBhIG51bWJlciB0aGF0IHdvdWxkXG4gICAgLy8gYmUgaW50ZXJwcmV0dGVkIGFzIGEgc3RhcnQgb2Zmc2V0LlxuICAgIHJldHVybiB0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnXG4gICAgICA/IGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKS5maWxsKGZpbGwsIGVuY29kaW5nKVxuICAgICAgOiBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSkuZmlsbChmaWxsKVxuICB9XG4gIHJldHVybiBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSlcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiBhbGxvYyhzaXplWywgZmlsbFssIGVuY29kaW5nXV0pXG4gKiovXG5CdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGFsbG9jKG51bGwsIHNpemUsIGZpbGwsIGVuY29kaW5nKVxufVxuXG5mdW5jdGlvbiBhbGxvY1Vuc2FmZSAodGhhdCwgc2l6ZSkge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSA8IDAgPyAwIDogY2hlY2tlZChzaXplKSB8IDApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpemU7ICsraSkge1xuICAgICAgdGhhdFtpXSA9IDBcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIEJ1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZSA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShudWxsLCBzaXplKVxufVxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIFNsb3dCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlU2xvdyA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShudWxsLCBzaXplKVxufVxuXG5mdW5jdGlvbiBmcm9tU3RyaW5nICh0aGF0LCBzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmICh0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnIHx8IGVuY29kaW5nID09PSAnJykge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gIH1cblxuICBpZiAoIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZW5jb2RpbmdcIiBtdXN0IGJlIGEgdmFsaWQgc3RyaW5nIGVuY29kaW5nJylcbiAgfVxuXG4gIHZhciBsZW5ndGggPSBieXRlTGVuZ3RoKHN0cmluZywgZW5jb2RpbmcpIHwgMFxuICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbmd0aClcblxuICB2YXIgYWN0dWFsID0gdGhhdC53cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuXG4gIGlmIChhY3R1YWwgIT09IGxlbmd0aCkge1xuICAgIC8vIFdyaXRpbmcgYSBoZXggc3RyaW5nLCBmb3IgZXhhbXBsZSwgdGhhdCBjb250YWlucyBpbnZhbGlkIGNoYXJhY3RlcnMgd2lsbFxuICAgIC8vIGNhdXNlIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIGZpcnN0IGludmFsaWQgY2hhcmFjdGVyIHRvIGJlIGlnbm9yZWQuIChlLmcuXG4gICAgLy8gJ2FieHhjZCcgd2lsbCBiZSB0cmVhdGVkIGFzICdhYicpXG4gICAgdGhhdCA9IHRoYXQuc2xpY2UoMCwgYWN0dWFsKVxuICB9XG5cbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5TGlrZSAodGhhdCwgYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbmd0aClcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIHRoYXRbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAodGhhdCwgYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aCkge1xuICBhcnJheS5ieXRlTGVuZ3RoIC8vIHRoaXMgdGhyb3dzIGlmIGBhcnJheWAgaXMgbm90IGEgdmFsaWQgQXJyYXlCdWZmZXJcblxuICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXFwnb2Zmc2V0XFwnIGlzIG91dCBvZiBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0ICsgKGxlbmd0aCB8fCAwKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdsZW5ndGhcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYnl0ZU9mZnNldCA9PT0gdW5kZWZpbmVkICYmIGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheSlcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UsIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgdGhhdCA9IGFycmF5XG4gICAgdGhhdC5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBhbiBvYmplY3QgaW5zdGFuY2Ugb2YgdGhlIEJ1ZmZlciBjbGFzc1xuICAgIHRoYXQgPSBmcm9tQXJyYXlMaWtlKHRoYXQsIGFycmF5KVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21PYmplY3QgKHRoYXQsIG9iaikge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKG9iaikpIHtcbiAgICB2YXIgbGVuID0gY2hlY2tlZChvYmoubGVuZ3RoKSB8IDBcbiAgICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbilcblxuICAgIGlmICh0aGF0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoYXRcbiAgICB9XG5cbiAgICBvYmouY29weSh0aGF0LCAwLCAwLCBsZW4pXG4gICAgcmV0dXJuIHRoYXRcbiAgfVxuXG4gIGlmIChvYmopIHtcbiAgICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgb2JqLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB8fCAnbGVuZ3RoJyBpbiBvYmopIHtcbiAgICAgIGlmICh0eXBlb2Ygb2JqLmxlbmd0aCAhPT0gJ251bWJlcicgfHwgaXNuYW4ob2JqLmxlbmd0aCkpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcih0aGF0LCAwKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2UodGhhdCwgb2JqKVxuICAgIH1cblxuICAgIGlmIChvYmoudHlwZSA9PT0gJ0J1ZmZlcicgJiYgaXNBcnJheShvYmouZGF0YSkpIHtcbiAgICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKHRoYXQsIG9iai5kYXRhKVxuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcsIEJ1ZmZlciwgQXJyYXlCdWZmZXIsIEFycmF5LCBvciBhcnJheS1saWtlIG9iamVjdC4nKVxufVxuXG5mdW5jdGlvbiBjaGVja2VkIChsZW5ndGgpIHtcbiAgLy8gTm90ZTogY2Fubm90IHVzZSBgbGVuZ3RoIDwga01heExlbmd0aCgpYCBoZXJlIGJlY2F1c2UgdGhhdCBmYWlscyB3aGVuXG4gIC8vIGxlbmd0aCBpcyBOYU4gKHdoaWNoIGlzIG90aGVyd2lzZSBjb2VyY2VkIHRvIHplcm8uKVxuICBpZiAobGVuZ3RoID49IGtNYXhMZW5ndGgoKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIGFsbG9jYXRlIEJ1ZmZlciBsYXJnZXIgdGhhbiBtYXhpbXVtICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdzaXplOiAweCcgKyBrTWF4TGVuZ3RoKCkudG9TdHJpbmcoMTYpICsgJyBieXRlcycpXG4gIH1cbiAgcmV0dXJuIGxlbmd0aCB8IDBcbn1cblxuZnVuY3Rpb24gU2xvd0J1ZmZlciAobGVuZ3RoKSB7XG4gIGlmICgrbGVuZ3RoICE9IGxlbmd0aCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGVxZXFlcVxuICAgIGxlbmd0aCA9IDBcbiAgfVxuICByZXR1cm4gQnVmZmVyLmFsbG9jKCtsZW5ndGgpXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIGlzQnVmZmVyIChiKSB7XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAoYSwgYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIG11c3QgYmUgQnVmZmVycycpXG4gIH1cblxuICBpZiAoYSA9PT0gYikgcmV0dXJuIDBcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gTWF0aC5taW4oeCwgeSk7IGkgPCBsZW47ICsraSkge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICB4ID0gYVtpXVxuICAgICAgeSA9IGJbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIGlzRW5jb2RpbmcgKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gY29uY2F0IChsaXN0LCBsZW5ndGgpIHtcbiAgaWYgKCFpc0FycmF5KGxpc3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBCdWZmZXIuYWxsb2MoMClcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGxlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgbGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShsZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGJ1ZiA9IGxpc3RbaV1cbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICAgIH1cbiAgICBidWYuY29weShidWZmZXIsIHBvcylcbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBBcnJheUJ1ZmZlci5pc1ZpZXcgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIChBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKSB8fCBzdHJpbmcgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikpIHtcbiAgICByZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZ1xuICB9XG5cbiAgdmFyIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBVc2UgYSBmb3IgbG9vcCB0byBhdm9pZCByZWN1cnNpb25cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGVuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG5mdW5jdGlvbiBzbG93VG9TdHJpbmcgKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG5cbiAgLy8gTm8gbmVlZCB0byB2ZXJpZnkgdGhhdCBcInRoaXMubGVuZ3RoIDw9IE1BWF9VSU5UMzJcIiBzaW5jZSBpdCdzIGEgcmVhZC1vbmx5XG4gIC8vIHByb3BlcnR5IG9mIGEgdHlwZWQgYXJyYXkuXG5cbiAgLy8gVGhpcyBiZWhhdmVzIG5laXRoZXIgbGlrZSBTdHJpbmcgbm9yIFVpbnQ4QXJyYXkgaW4gdGhhdCB3ZSBzZXQgc3RhcnQvZW5kXG4gIC8vIHRvIHRoZWlyIHVwcGVyL2xvd2VyIGJvdW5kcyBpZiB0aGUgdmFsdWUgcGFzc2VkIGlzIG91dCBvZiByYW5nZS5cbiAgLy8gdW5kZWZpbmVkIGlzIGhhbmRsZWQgc3BlY2lhbGx5IGFzIHBlciBFQ01BLTI2MiA2dGggRWRpdGlvbixcbiAgLy8gU2VjdGlvbiAxMy4zLjMuNyBSdW50aW1lIFNlbWFudGljczogS2V5ZWRCaW5kaW5nSW5pdGlhbGl6YXRpb24uXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIC8vIFJldHVybiBlYXJseSBpZiBzdGFydCA+IHRoaXMubGVuZ3RoLiBEb25lIGhlcmUgdG8gcHJldmVudCBwb3RlbnRpYWwgdWludDMyXG4gIC8vIGNvZXJjaW9uIGZhaWwgYmVsb3cuXG4gIGlmIChzdGFydCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoZW5kID09PSB1bmRlZmluZWQgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKGVuZCA8PSAwKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICAvLyBGb3JjZSBjb2Vyc2lvbiB0byB1aW50MzIuIFRoaXMgd2lsbCBhbHNvIGNvZXJjZSBmYWxzZXkvTmFOIHZhbHVlcyB0byAwLlxuICBlbmQgPj4+PSAwXG4gIHN0YXJ0ID4+Pj0gMFxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9IChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBUaGUgcHJvcGVydHkgaXMgdXNlZCBieSBgQnVmZmVyLmlzQnVmZmVyYCBhbmQgYGlzLWJ1ZmZlcmAgKGluIFNhZmFyaSA1LTcpIHRvIGRldGVjdFxuLy8gQnVmZmVyIGluc3RhbmNlcy5cbkJ1ZmZlci5wcm90b3R5cGUuX2lzQnVmZmVyID0gdHJ1ZVxuXG5mdW5jdGlvbiBzd2FwIChiLCBuLCBtKSB7XG4gIHZhciBpID0gYltuXVxuICBiW25dID0gYlttXVxuICBiW21dID0gaVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAxNiA9IGZ1bmN0aW9uIHN3YXAxNiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDMyLWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAzKVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyAyKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDY0ID0gZnVuY3Rpb24gc3dhcDY0ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA4ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA2NC1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA4KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgNylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgNilcbiAgICBzd2FwKHRoaXMsIGkgKyAyLCBpICsgNSlcbiAgICBzd2FwKHRoaXMsIGkgKyAzLCBpICsgNClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGggfCAwXG4gIGlmIChsZW5ndGggPT09IDApIHJldHVybiAnJ1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCAwLCBsZW5ndGgpXG4gIHJldHVybiBzbG93VG9TdHJpbmcuYXBwbHkodGhpcywgYXJndW1lbnRzKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyAoYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIGlmICh0aGlzID09PSBiKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcywgYikgPT09IDBcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5tYXRjaCgvLnsyfS9nKS5qb2luKCcgJylcbiAgICBpZiAodGhpcy5sZW5ndGggPiBtYXgpIHN0ciArPSAnIC4uLiAnXG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBzdHIgKyAnPidcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAodGFyZ2V0LCBzdGFydCwgZW5kLCB0aGlzU3RhcnQsIHRoaXNFbmQpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICB9XG5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICBpZiAoZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmQgPSB0YXJnZXQgPyB0YXJnZXQubGVuZ3RoIDogMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNTdGFydCA9IDBcbiAgfVxuICBpZiAodGhpc0VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc0VuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoc3RhcnQgPCAwIHx8IGVuZCA+IHRhcmdldC5sZW5ndGggfHwgdGhpc1N0YXJ0IDwgMCB8fCB0aGlzRW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCAmJiBzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCkge1xuICAgIHJldHVybiAtMVxuICB9XG4gIGlmIChzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMVxuICB9XG5cbiAgc3RhcnQgPj4+PSAwXG4gIGVuZCA+Pj49IDBcbiAgdGhpc1N0YXJ0ID4+Pj0gMFxuICB0aGlzRW5kID4+Pj0gMFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQpIHJldHVybiAwXG5cbiAgdmFyIHggPSB0aGlzRW5kIC0gdGhpc1N0YXJ0XG4gIHZhciB5ID0gZW5kIC0gc3RhcnRcbiAgdmFyIGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgdmFyIHRoaXNDb3B5ID0gdGhpcy5zbGljZSh0aGlzU3RhcnQsIHRoaXNFbmQpXG4gIHZhciB0YXJnZXRDb3B5ID0gdGFyZ2V0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIGlmICh0aGlzQ29weVtpXSAhPT0gdGFyZ2V0Q29weVtpXSkge1xuICAgICAgeCA9IHRoaXNDb3B5W2ldXG4gICAgICB5ID0gdGFyZ2V0Q29weVtpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbi8vIEZpbmRzIGVpdGhlciB0aGUgZmlyc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0ID49IGBieXRlT2Zmc2V0YCxcbi8vIE9SIHRoZSBsYXN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA8PSBgYnl0ZU9mZnNldGAuXG4vL1xuLy8gQXJndW1lbnRzOlxuLy8gLSBidWZmZXIgLSBhIEJ1ZmZlciB0byBzZWFyY2hcbi8vIC0gdmFsIC0gYSBzdHJpbmcsIEJ1ZmZlciwgb3IgbnVtYmVyXG4vLyAtIGJ5dGVPZmZzZXQgLSBhbiBpbmRleCBpbnRvIGBidWZmZXJgOyB3aWxsIGJlIGNsYW1wZWQgdG8gYW4gaW50MzJcbi8vIC0gZW5jb2RpbmcgLSBhbiBvcHRpb25hbCBlbmNvZGluZywgcmVsZXZhbnQgaXMgdmFsIGlzIGEgc3RyaW5nXG4vLyAtIGRpciAtIHRydWUgZm9yIGluZGV4T2YsIGZhbHNlIGZvciBsYXN0SW5kZXhPZlxuZnVuY3Rpb24gYmlkaXJlY3Rpb25hbEluZGV4T2YgKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIC8vIEVtcHR5IGJ1ZmZlciBtZWFucyBubyBtYXRjaFxuICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xXG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXRcbiAgaWYgKHR5cGVvZiBieXRlT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gYnl0ZU9mZnNldFxuICAgIGJ5dGVPZmZzZXQgPSAwXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA+IDB4N2ZmZmZmZmYpIHtcbiAgICBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAtMHg4MDAwMDAwMCkge1xuICAgIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICB9XG4gIGJ5dGVPZmZzZXQgPSArYnl0ZU9mZnNldCAgLy8gQ29lcmNlIHRvIE51bWJlci5cbiAgaWYgKGlzTmFOKGJ5dGVPZmZzZXQpKSB7XG4gICAgLy8gYnl0ZU9mZnNldDogaXQgaXQncyB1bmRlZmluZWQsIG51bGwsIE5hTiwgXCJmb29cIiwgZXRjLCBzZWFyY2ggd2hvbGUgYnVmZmVyXG4gICAgYnl0ZU9mZnNldCA9IGRpciA/IDAgOiAoYnVmZmVyLmxlbmd0aCAtIDEpXG4gIH1cblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldDogbmVnYXRpdmUgb2Zmc2V0cyBzdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICBpZiAoYnl0ZU9mZnNldCA8IDApIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoICsgYnl0ZU9mZnNldFxuICBpZiAoYnl0ZU9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgaWYgKGRpcikgcmV0dXJuIC0xXG4gICAgZWxzZSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCAtIDFcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgMCkge1xuICAgIGlmIChkaXIpIGJ5dGVPZmZzZXQgPSAwXG4gICAgZWxzZSByZXR1cm4gLTFcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB2YWxcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsID0gQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgfVxuXG4gIC8vIEZpbmFsbHksIHNlYXJjaCBlaXRoZXIgaW5kZXhPZiAoaWYgZGlyIGlzIHRydWUpIG9yIGxhc3RJbmRleE9mXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogbG9va2luZyBmb3IgZW1wdHkgc3RyaW5nL2J1ZmZlciBhbHdheXMgZmFpbHNcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAweEZGIC8vIFNlYXJjaCBmb3IgYSBieXRlIHZhbHVlIFswLTI1NV1cbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiZcbiAgICAgICAgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgWyB2YWwgXSwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbCBtdXN0IGJlIHN0cmluZywgbnVtYmVyIG9yIEJ1ZmZlcicpXG59XG5cbmZ1bmN0aW9uIGFycmF5SW5kZXhPZiAoYXJyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgdmFyIGluZGV4U2l6ZSA9IDFcbiAgdmFyIGFyckxlbmd0aCA9IGFyci5sZW5ndGhcbiAgdmFyIHZhbExlbmd0aCA9IHZhbC5sZW5ndGhcblxuICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKGVuY29kaW5nID09PSAndWNzMicgfHwgZW5jb2RpbmcgPT09ICd1Y3MtMicgfHxcbiAgICAgICAgZW5jb2RpbmcgPT09ICd1dGYxNmxlJyB8fCBlbmNvZGluZyA9PT0gJ3V0Zi0xNmxlJykge1xuICAgICAgaWYgKGFyci5sZW5ndGggPCAyIHx8IHZhbC5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuICAgICAgaW5kZXhTaXplID0gMlxuICAgICAgYXJyTGVuZ3RoIC89IDJcbiAgICAgIHZhbExlbmd0aCAvPSAyXG4gICAgICBieXRlT2Zmc2V0IC89IDJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWFkIChidWYsIGkpIHtcbiAgICBpZiAoaW5kZXhTaXplID09PSAxKSB7XG4gICAgICByZXR1cm4gYnVmW2ldXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBidWYucmVhZFVJbnQxNkJFKGkgKiBpbmRleFNpemUpXG4gICAgfVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGRpcikge1xuICAgIHZhciBmb3VuZEluZGV4ID0gLTFcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpIDwgYXJyTGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChyZWFkKGFyciwgaSkgPT09IHJlYWQodmFsLCBmb3VuZEluZGV4ID09PSAtMSA/IDAgOiBpIC0gZm91bmRJbmRleCkpIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSBmb3VuZEluZGV4ID0gaVxuICAgICAgICBpZiAoaSAtIGZvdW5kSW5kZXggKyAxID09PSB2YWxMZW5ndGgpIHJldHVybiBmb3VuZEluZGV4ICogaW5kZXhTaXplXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZm91bmRJbmRleCAhPT0gLTEpIGkgLT0gaSAtIGZvdW5kSW5kZXhcbiAgICAgICAgZm91bmRJbmRleCA9IC0xXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChieXRlT2Zmc2V0ICsgdmFsTGVuZ3RoID4gYXJyTGVuZ3RoKSBieXRlT2Zmc2V0ID0gYXJyTGVuZ3RoIC0gdmFsTGVuZ3RoXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBmb3VuZCA9IHRydWVcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKHJlYWQoYXJyLCBpICsgaikgIT09IHJlYWQodmFsLCBqKSkge1xuICAgICAgICAgIGZvdW5kID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZm91bmQpIHJldHVybiBpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlcyAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gdGhpcy5pbmRleE9mKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpICE9PSAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCB0cnVlKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmxhc3RJbmRleE9mID0gZnVuY3Rpb24gbGFzdEluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiBoZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChzdHJMZW4gJSAyICE9PSAwKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgcGFyc2VkID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChpc05hTihwYXJzZWQpKSByZXR1cm4gaVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gbGF0aW4xV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB1Y3MyV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgb2Zmc2V0WywgbGVuZ3RoXVssIGVuY29kaW5nXSlcbiAgfSBlbHNlIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggfCAwXG4gICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCkgZW5jb2RpbmcgPSAndXRmOCdcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgLy8gbGVnYWN5IHdyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKSAtIHJlbW92ZSBpbiB2MC4xM1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdCdWZmZXIud3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0WywgbGVuZ3RoXSkgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCdcbiAgICApXG4gIH1cblxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICAvLyBXYXJuaW5nOiBtYXhMZW5ndGggbm90IHRha2VuIGludG8gYWNjb3VudCBpbiBiYXNlNjRXcml0ZVxuICAgICAgICByZXR1cm4gYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHVjczJXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG4gIHZhciByZXMgPSBbXVxuXG4gIHZhciBpID0gc3RhcnRcbiAgd2hpbGUgKGkgPCBlbmQpIHtcbiAgICB2YXIgZmlyc3RCeXRlID0gYnVmW2ldXG4gICAgdmFyIGNvZGVQb2ludCA9IG51bGxcbiAgICB2YXIgYnl0ZXNQZXJTZXF1ZW5jZSA9IChmaXJzdEJ5dGUgPiAweEVGKSA/IDRcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4REYpID8gM1xuICAgICAgOiAoZmlyc3RCeXRlID4gMHhCRikgPyAyXG4gICAgICA6IDFcblxuICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA8PSBlbmQpIHtcbiAgICAgIHZhciBzZWNvbmRCeXRlLCB0aGlyZEJ5dGUsIGZvdXJ0aEJ5dGUsIHRlbXBDb2RlUG9pbnRcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4MUYpIDw8IDB4NiB8IChzZWNvbmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Rikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweEMgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGRiAmJiAodGVtcENvZGVQb2ludCA8IDB4RDgwMCB8fCB0ZW1wQ29kZVBvaW50ID4gMHhERkZGKSkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBmb3VydGhCeXRlID0gYnVmW2kgKyAzXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAoZm91cnRoQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHgxMiB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHhDIHwgKHRoaXJkQnl0ZSAmIDB4M0YpIDw8IDB4NiB8IChmb3VydGhCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhGRkZGICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlUG9pbnQgPT09IG51bGwpIHtcbiAgICAgIC8vIHdlIGRpZCBub3QgZ2VuZXJhdGUgYSB2YWxpZCBjb2RlUG9pbnQgc28gaW5zZXJ0IGFcbiAgICAgIC8vIHJlcGxhY2VtZW50IGNoYXIgKFUrRkZGRCkgYW5kIGFkdmFuY2Ugb25seSAxIGJ5dGVcbiAgICAgIGNvZGVQb2ludCA9IDB4RkZGRFxuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDFcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuICAgICAgLy8gZW5jb2RlIHRvIHV0ZjE2IChzdXJyb2dhdGUgcGFpciBkYW5jZSlcbiAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwXG4gICAgICByZXMucHVzaChjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApXG4gICAgICBjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRlxuICAgIH1cblxuICAgIHJlcy5wdXNoKGNvZGVQb2ludClcbiAgICBpICs9IGJ5dGVzUGVyU2VxdWVuY2VcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKVxufVxuXG4vLyBCYXNlZCBvbiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjc0NzI3Mi82ODA3NDIsIHRoZSBicm93c2VyIHdpdGhcbi8vIHRoZSBsb3dlc3QgbGltaXQgaXMgQ2hyb21lLCB3aXRoIDB4MTAwMDAgYXJncy5cbi8vIFdlIGdvIDEgbWFnbml0dWRlIGxlc3MsIGZvciBzYWZldHlcbnZhciBNQVhfQVJHVU1FTlRTX0xFTkdUSCA9IDB4MTAwMFxuXG5mdW5jdGlvbiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkgKGNvZGVQb2ludHMpIHtcbiAgdmFyIGxlbiA9IGNvZGVQb2ludHMubGVuZ3RoXG4gIGlmIChsZW4gPD0gTUFYX0FSR1VNRU5UU19MRU5HVEgpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShTdHJpbmcsIGNvZGVQb2ludHMpIC8vIGF2b2lkIGV4dHJhIHNsaWNlKClcbiAgfVxuXG4gIC8vIERlY29kZSBpbiBjaHVua3MgdG8gYXZvaWQgXCJjYWxsIHN0YWNrIHNpemUgZXhjZWVkZWRcIi5cbiAgdmFyIHJlcyA9ICcnXG4gIHZhciBpID0gMFxuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFxuICAgICAgU3RyaW5nLFxuICAgICAgY29kZVBvaW50cy5zbGljZShpLCBpICs9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKVxuICAgIClcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldICYgMHg3RilcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGxhdGluMVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGhleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpICsgMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gfn5zdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IH5+ZW5kXG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ICs9IGxlblxuICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICB9IGVsc2UgaWYgKHN0YXJ0ID4gbGVuKSB7XG4gICAgc3RhcnQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCAwKSB7XG4gICAgZW5kICs9IGxlblxuICAgIGlmIChlbmQgPCAwKSBlbmQgPSAwXG4gIH0gZWxzZSBpZiAoZW5kID4gbGVuKSB7XG4gICAgZW5kID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgdmFyIG5ld0J1ZlxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gICAgbmV3QnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyArK2kpIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXdCdWZcbn1cblxuLypcbiAqIE5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYnVmZmVyIGlzbid0IHRyeWluZyB0byB3cml0ZSBvdXQgb2YgYm91bmRzLlxuICovXG5mdW5jdGlvbiBjaGVja09mZnNldCAob2Zmc2V0LCBleHQsIGxlbmd0aCkge1xuICBpZiAoKG9mZnNldCAlIDEpICE9PSAwIHx8IG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVHJ5aW5nIHRvIGFjY2VzcyBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRCRSA9IGZ1bmN0aW9uIHJlYWRVSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG4gIH1cblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdXG4gIHZhciBtdWwgPSAxXG4gIHdoaWxlIChieXRlTGVuZ3RoID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiByZWFkVUludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICgodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikpICtcbiAgICAgICh0aGlzW29mZnNldCArIDNdICogMHgxMDAwMDAwKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdICogMHgxMDAwMDAwKSArXG4gICAgKCh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgIHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludExFID0gZnVuY3Rpb24gcmVhZEludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludEJFID0gZnVuY3Rpb24gcmVhZEludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoXG4gIHZhciBtdWwgPSAxXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0taV1cbiAgd2hpbGUgKGkgPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1pXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiByZWFkSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiByZWFkSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDI0KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiByZWFkRmxvYXRMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiByZWFkRmxvYXRCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gcmVhZERvdWJsZUJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgNTIsIDgpXG59XG5cbmZ1bmN0aW9uIGNoZWNrSW50IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJidWZmZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSA8IGo7ICsraSkge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIG9mZnNldCwgNCk7IGkgPCBqOyArK2kpIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEUgPSBmdW5jdGlvbiB3cml0ZUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gMFxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgLSAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50QkUgPSBmdW5jdGlvbiB3cml0ZUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgKyAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uIHdyaXRlSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweDdmLCAtMHg4MClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuZnVuY3Rpb24gY2hlY2tJRUVFNzU0IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAob2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gd3JpdGVGbG9hdExFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG4gIHZhciBpXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2UgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gYXNjZW5kaW5nIGNvcHkgZnJvbSBzdGFydFxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgVWludDhBcnJheS5wcm90b3R5cGUuc2V0LmNhbGwoXG4gICAgICB0YXJnZXQsXG4gICAgICB0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksXG4gICAgICB0YXJnZXRTdGFydFxuICAgIClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gVXNhZ2U6XG4vLyAgICBidWZmZXIuZmlsbChudW1iZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKGJ1ZmZlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoc3RyaW5nWywgb2Zmc2V0WywgZW5kXV1bLCBlbmNvZGluZ10pXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWwsIHN0YXJ0LCBlbmQsIGVuY29kaW5nKSB7XG4gIC8vIEhhbmRsZSBzdHJpbmcgY2FzZXM6XG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IHN0YXJ0XG4gICAgICBzdGFydCA9IDBcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5kID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBlbmRcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfVxuICAgIGlmICh2YWwubGVuZ3RoID09PSAxKSB7XG4gICAgICB2YXIgY29kZSA9IHZhbC5jaGFyQ29kZUF0KDApXG4gICAgICBpZiAoY29kZSA8IDI1Nikge1xuICAgICAgICB2YWwgPSBjb2RlXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuY29kaW5nIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMjU1XG4gIH1cblxuICAvLyBJbnZhbGlkIHJhbmdlcyBhcmUgbm90IHNldCB0byBhIGRlZmF1bHQsIHNvIGNhbiByYW5nZSBjaGVjayBlYXJseS5cbiAgaWYgKHN0YXJ0IDwgMCB8fCB0aGlzLmxlbmd0aCA8IHN0YXJ0IHx8IHRoaXMubGVuZ3RoIDwgZW5kKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ091dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHN0YXJ0ID0gc3RhcnQgPj4+IDBcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghdmFsKSB2YWwgPSAwXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpc1tpXSA9IHZhbFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogdXRmOFRvQnl0ZXMobmV3IEJ1ZmZlcih2YWwsIGVuY29kaW5nKS50b1N0cmluZygpKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBmb3IgKGkgPSAwOyBpIDwgZW5kIC0gc3RhcnQ7ICsraSkge1xuICAgICAgdGhpc1tpICsgc3RhcnRdID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXitcXC8wLTlBLVphLXotX10vZ1xuXG5mdW5jdGlvbiBiYXNlNjRjbGVhbiAoc3RyKSB7XG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHJpbmd0cmltKHN0cikucmVwbGFjZShJTlZBTElEX0JBU0U2NF9SRSwgJycpXG4gIC8vIE5vZGUgY29udmVydHMgc3RyaW5ncyB3aXRoIGxlbmd0aCA8IDIgdG8gJydcbiAgaWYgKHN0ci5sZW5ndGggPCAyKSByZXR1cm4gJydcbiAgLy8gTm9kZSBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgYmFzZTY0IHN0cmluZ3MgKG1pc3NpbmcgdHJhaWxpbmcgPT09KSwgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHdoaWxlIChzdHIubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgIHN0ciA9IHN0ciArICc9J1xuICB9XG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyaW5nLCB1bml0cykge1xuICB1bml0cyA9IHVuaXRzIHx8IEluZmluaXR5XG4gIHZhciBjb2RlUG9pbnRcbiAgdmFyIGxlbmd0aCA9IHN0cmluZy5sZW5ndGhcbiAgdmFyIGxlYWRTdXJyb2dhdGUgPSBudWxsXG4gIHZhciBieXRlcyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIsIHVuaXRzKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG5cbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShiYXNlNjRjbGVhbihzdHIpKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBpc25hbiAodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IHZhbCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGVzY2FwZVN0cmluZ1JlZ2V4cCA9IHJlcXVpcmUoJ2VzY2FwZS1zdHJpbmctcmVnZXhwJyk7XG52YXIgYW5zaVN0eWxlcyA9IHJlcXVpcmUoJ2Fuc2ktc3R5bGVzJyk7XG52YXIgc3RyaXBBbnNpID0gcmVxdWlyZSgnc3RyaXAtYW5zaScpO1xudmFyIGhhc0Fuc2kgPSByZXF1aXJlKCdoYXMtYW5zaScpO1xudmFyIHN1cHBvcnRzQ29sb3IgPSByZXF1aXJlKCdzdXBwb3J0cy1jb2xvcicpO1xudmFyIGRlZmluZVByb3BzID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXM7XG52YXIgaXNTaW1wbGVXaW5kb3dzVGVybSA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgJiYgIS9eeHRlcm0vaS50ZXN0KHByb2Nlc3MuZW52LlRFUk0pO1xuXG5mdW5jdGlvbiBDaGFsayhvcHRpb25zKSB7XG5cdC8vIGRldGVjdCBtb2RlIGlmIG5vdCBzZXQgbWFudWFsbHlcblx0dGhpcy5lbmFibGVkID0gIW9wdGlvbnMgfHwgb3B0aW9ucy5lbmFibGVkID09PSB1bmRlZmluZWQgPyBzdXBwb3J0c0NvbG9yIDogb3B0aW9ucy5lbmFibGVkO1xufVxuXG4vLyB1c2UgYnJpZ2h0IGJsdWUgb24gV2luZG93cyBhcyB0aGUgbm9ybWFsIGJsdWUgY29sb3IgaXMgaWxsZWdpYmxlXG5pZiAoaXNTaW1wbGVXaW5kb3dzVGVybSkge1xuXHRhbnNpU3R5bGVzLmJsdWUub3BlbiA9ICdcXHUwMDFiWzk0bSc7XG59XG5cbnZhciBzdHlsZXMgPSAoZnVuY3Rpb24gKCkge1xuXHR2YXIgcmV0ID0ge307XG5cblx0T2JqZWN0LmtleXMoYW5zaVN0eWxlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0YW5zaVN0eWxlc1trZXldLmNsb3NlUmUgPSBuZXcgUmVnRXhwKGVzY2FwZVN0cmluZ1JlZ2V4cChhbnNpU3R5bGVzW2tleV0uY2xvc2UpLCAnZycpO1xuXG5cdFx0cmV0W2tleV0gPSB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIGJ1aWxkLmNhbGwodGhpcywgdGhpcy5fc3R5bGVzLmNvbmNhdChrZXkpKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcblxuXHRyZXR1cm4gcmV0O1xufSkoKTtcblxudmFyIHByb3RvID0gZGVmaW5lUHJvcHMoZnVuY3Rpb24gY2hhbGsoKSB7fSwgc3R5bGVzKTtcblxuZnVuY3Rpb24gYnVpbGQoX3N0eWxlcykge1xuXHR2YXIgYnVpbGRlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gYXBwbHlTdHlsZS5hcHBseShidWlsZGVyLCBhcmd1bWVudHMpO1xuXHR9O1xuXG5cdGJ1aWxkZXIuX3N0eWxlcyA9IF9zdHlsZXM7XG5cdGJ1aWxkZXIuZW5hYmxlZCA9IHRoaXMuZW5hYmxlZDtcblx0Ly8gX19wcm90b19fIGlzIHVzZWQgYmVjYXVzZSB3ZSBtdXN0IHJldHVybiBhIGZ1bmN0aW9uLCBidXQgdGhlcmUgaXNcblx0Ly8gbm8gd2F5IHRvIGNyZWF0ZSBhIGZ1bmN0aW9uIHdpdGggYSBkaWZmZXJlbnQgcHJvdG90eXBlLlxuXHQvKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXHRidWlsZGVyLl9fcHJvdG9fXyA9IHByb3RvO1xuXG5cdHJldHVybiBidWlsZGVyO1xufVxuXG5mdW5jdGlvbiBhcHBseVN0eWxlKCkge1xuXHQvLyBzdXBwb3J0IHZhcmFncywgYnV0IHNpbXBseSBjYXN0IHRvIHN0cmluZyBpbiBjYXNlIHRoZXJlJ3Mgb25seSBvbmUgYXJnXG5cdHZhciBhcmdzID0gYXJndW1lbnRzO1xuXHR2YXIgYXJnc0xlbiA9IGFyZ3MubGVuZ3RoO1xuXHR2YXIgc3RyID0gYXJnc0xlbiAhPT0gMCAmJiBTdHJpbmcoYXJndW1lbnRzWzBdKTtcblxuXHRpZiAoYXJnc0xlbiA+IDEpIHtcblx0XHQvLyBkb24ndCBzbGljZSBgYXJndW1lbnRzYCwgaXQgcHJldmVudHMgdjggb3B0aW1pemF0aW9uc1xuXHRcdGZvciAodmFyIGEgPSAxOyBhIDwgYXJnc0xlbjsgYSsrKSB7XG5cdFx0XHRzdHIgKz0gJyAnICsgYXJnc1thXTtcblx0XHR9XG5cdH1cblxuXHRpZiAoIXRoaXMuZW5hYmxlZCB8fCAhc3RyKSB7XG5cdFx0cmV0dXJuIHN0cjtcblx0fVxuXG5cdHZhciBuZXN0ZWRTdHlsZXMgPSB0aGlzLl9zdHlsZXM7XG5cdHZhciBpID0gbmVzdGVkU3R5bGVzLmxlbmd0aDtcblxuXHQvLyBUdXJucyBvdXQgdGhhdCBvbiBXaW5kb3dzIGRpbW1lZCBncmF5IHRleHQgYmVjb21lcyBpbnZpc2libGUgaW4gY21kLmV4ZSxcblx0Ly8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGFsay9jaGFsay9pc3N1ZXMvNThcblx0Ly8gSWYgd2UncmUgb24gV2luZG93cyBhbmQgd2UncmUgZGVhbGluZyB3aXRoIGEgZ3JheSBjb2xvciwgdGVtcG9yYXJpbHkgbWFrZSAnZGltJyBhIG5vb3AuXG5cdHZhciBvcmlnaW5hbERpbSA9IGFuc2lTdHlsZXMuZGltLm9wZW47XG5cdGlmIChpc1NpbXBsZVdpbmRvd3NUZXJtICYmIChuZXN0ZWRTdHlsZXMuaW5kZXhPZignZ3JheScpICE9PSAtMSB8fCBuZXN0ZWRTdHlsZXMuaW5kZXhPZignZ3JleScpICE9PSAtMSkpIHtcblx0XHRhbnNpU3R5bGVzLmRpbS5vcGVuID0gJyc7XG5cdH1cblxuXHR3aGlsZSAoaS0tKSB7XG5cdFx0dmFyIGNvZGUgPSBhbnNpU3R5bGVzW25lc3RlZFN0eWxlc1tpXV07XG5cblx0XHQvLyBSZXBsYWNlIGFueSBpbnN0YW5jZXMgYWxyZWFkeSBwcmVzZW50IHdpdGggYSByZS1vcGVuaW5nIGNvZGVcblx0XHQvLyBvdGhlcndpc2Ugb25seSB0aGUgcGFydCBvZiB0aGUgc3RyaW5nIHVudGlsIHNhaWQgY2xvc2luZyBjb2RlXG5cdFx0Ly8gd2lsbCBiZSBjb2xvcmVkLCBhbmQgdGhlIHJlc3Qgd2lsbCBzaW1wbHkgYmUgJ3BsYWluJy5cblx0XHRzdHIgPSBjb2RlLm9wZW4gKyBzdHIucmVwbGFjZShjb2RlLmNsb3NlUmUsIGNvZGUub3BlbikgKyBjb2RlLmNsb3NlO1xuXHR9XG5cblx0Ly8gUmVzZXQgdGhlIG9yaWdpbmFsICdkaW0nIGlmIHdlIGNoYW5nZWQgaXQgdG8gd29yayBhcm91bmQgdGhlIFdpbmRvd3MgZGltbWVkIGdyYXkgaXNzdWUuXG5cdGFuc2lTdHlsZXMuZGltLm9wZW4gPSBvcmlnaW5hbERpbTtcblxuXHRyZXR1cm4gc3RyO1xufVxuXG5mdW5jdGlvbiBpbml0KCkge1xuXHR2YXIgcmV0ID0ge307XG5cblx0T2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG5cdFx0cmV0W25hbWVdID0ge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBidWlsZC5jYWxsKHRoaXMsIFtuYW1lXSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG5cblx0cmV0dXJuIHJldDtcbn1cblxuZGVmaW5lUHJvcHMoQ2hhbGsucHJvdG90eXBlLCBpbml0KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBDaGFsaygpO1xubW9kdWxlLmV4cG9ydHMuc3R5bGVzID0gYW5zaVN0eWxlcztcbm1vZHVsZS5leHBvcnRzLmhhc0NvbG9yID0gaGFzQW5zaTtcbm1vZHVsZS5leHBvcnRzLnN0cmlwQ29sb3IgPSBzdHJpcEFuc2k7XG5tb2R1bGUuZXhwb3J0cy5zdXBwb3J0c0NvbG9yID0gc3VwcG9ydHNDb2xvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1hdGNoT3BlcmF0b3JzUmUgPSAvW3xcXFxce30oKVtcXF1eJCsqPy5dL2c7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIHN0cmluZycpO1xuXHR9XG5cblx0cmV0dXJuIHN0ci5yZXBsYWNlKG1hdGNoT3BlcmF0b3JzUmUsICdcXFxcJCYnKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgYW5zaVJlZ2V4ID0gcmVxdWlyZSgnYW5zaS1yZWdleCcpO1xudmFyIHJlID0gbmV3IFJlZ0V4cChhbnNpUmVnZXgoKS5zb3VyY2UpOyAvLyByZW1vdmUgdGhlIGBnYCBmbGFnXG5tb2R1bGUuZXhwb3J0cyA9IHJlLnRlc3QuYmluZChyZSk7XG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cbiIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChhcnIpID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLypcbiAqICRJZDogYmFzZTY0LmpzLHYgMi4xNSAyMDE0LzA0LzA1IDEyOjU4OjU3IGRhbmtvZ2FpIEV4cCBkYW5rb2dhaSAkXG4gKlxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqICAgIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZVxuICpcbiAqICBSZWZlcmVuY2VzOlxuICogICAgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CYXNlNjRcbiAqL1xuXG4oZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIC8vIGV4aXN0aW5nIHZlcnNpb24gZm9yIG5vQ29uZmxpY3QoKVxuICAgIHZhciBfQmFzZTY0ID0gZ2xvYmFsLkJhc2U2NDtcbiAgICB2YXIgdmVyc2lvbiA9IFwiMi4xLjlcIjtcbiAgICAvLyBpZiBub2RlLmpzLCB3ZSB1c2UgQnVmZmVyXG4gICAgdmFyIGJ1ZmZlcjtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7fVxuICAgIH1cbiAgICAvLyBjb25zdGFudHNcbiAgICB2YXIgYjY0Y2hhcnNcbiAgICAgICAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG4gICAgdmFyIGI2NHRhYiA9IGZ1bmN0aW9uKGJpbikge1xuICAgICAgICB2YXIgdCA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGJpbi5sZW5ndGg7IGkgPCBsOyBpKyspIHRbYmluLmNoYXJBdChpKV0gPSBpO1xuICAgICAgICByZXR1cm4gdDtcbiAgICB9KGI2NGNoYXJzKTtcbiAgICB2YXIgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcbiAgICAvLyBlbmNvZGVyIHN0dWZmXG4gICAgdmFyIGNiX3V0b2IgPSBmdW5jdGlvbihjKSB7XG4gICAgICAgIGlmIChjLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIHZhciBjYyA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgIHJldHVybiBjYyA8IDB4ODAgPyBjXG4gICAgICAgICAgICAgICAgOiBjYyA8IDB4ODAwID8gKGZyb21DaGFyQ29kZSgweGMwIHwgKGNjID4+PiA2KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoMHg4MCB8IChjYyAmIDB4M2YpKSlcbiAgICAgICAgICAgICAgICA6IChmcm9tQ2hhckNvZGUoMHhlMCB8ICgoY2MgPj4+IDEyKSAmIDB4MGYpKVxuICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKDB4ODAgfCAoKGNjID4+PiAgNikgJiAweDNmKSlcbiAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgweDgwIHwgKCBjYyAgICAgICAgICYgMHgzZikpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBjYyA9IDB4MTAwMDBcbiAgICAgICAgICAgICAgICArIChjLmNoYXJDb2RlQXQoMCkgLSAweEQ4MDApICogMHg0MDBcbiAgICAgICAgICAgICAgICArIChjLmNoYXJDb2RlQXQoMSkgLSAweERDMDApO1xuICAgICAgICAgICAgcmV0dXJuIChmcm9tQ2hhckNvZGUoMHhmMCB8ICgoY2MgPj4+IDE4KSAmIDB4MDcpKVxuICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgweDgwIHwgKChjYyA+Pj4gMTIpICYgMHgzZikpXG4gICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKDB4ODAgfCAoKGNjID4+PiAgNikgJiAweDNmKSlcbiAgICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoMHg4MCB8ICggY2MgICAgICAgICAmIDB4M2YpKSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHZhciByZV91dG9iID0gL1tcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRkZdfFteXFx4MDAtXFx4N0ZdL2c7XG4gICAgdmFyIHV0b2IgPSBmdW5jdGlvbih1KSB7XG4gICAgICAgIHJldHVybiB1LnJlcGxhY2UocmVfdXRvYiwgY2JfdXRvYik7XG4gICAgfTtcbiAgICB2YXIgY2JfZW5jb2RlID0gZnVuY3Rpb24oY2NjKSB7XG4gICAgICAgIHZhciBwYWRsZW4gPSBbMCwgMiwgMV1bY2NjLmxlbmd0aCAlIDNdLFxuICAgICAgICBvcmQgPSBjY2MuY2hhckNvZGVBdCgwKSA8PCAxNlxuICAgICAgICAgICAgfCAoKGNjYy5sZW5ndGggPiAxID8gY2NjLmNoYXJDb2RlQXQoMSkgOiAwKSA8PCA4KVxuICAgICAgICAgICAgfCAoKGNjYy5sZW5ndGggPiAyID8gY2NjLmNoYXJDb2RlQXQoMikgOiAwKSksXG4gICAgICAgIGNoYXJzID0gW1xuICAgICAgICAgICAgYjY0Y2hhcnMuY2hhckF0KCBvcmQgPj4+IDE4KSxcbiAgICAgICAgICAgIGI2NGNoYXJzLmNoYXJBdCgob3JkID4+PiAxMikgJiA2MyksXG4gICAgICAgICAgICBwYWRsZW4gPj0gMiA/ICc9JyA6IGI2NGNoYXJzLmNoYXJBdCgob3JkID4+PiA2KSAmIDYzKSxcbiAgICAgICAgICAgIHBhZGxlbiA+PSAxID8gJz0nIDogYjY0Y2hhcnMuY2hhckF0KG9yZCAmIDYzKVxuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gICAgfTtcbiAgICB2YXIgYnRvYSA9IGdsb2JhbC5idG9hID8gZnVuY3Rpb24oYikge1xuICAgICAgICByZXR1cm4gZ2xvYmFsLmJ0b2EoYik7XG4gICAgfSA6IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgcmV0dXJuIGIucmVwbGFjZSgvW1xcc1xcU117MSwzfS9nLCBjYl9lbmNvZGUpO1xuICAgIH07XG4gICAgdmFyIF9lbmNvZGUgPSBidWZmZXIgPyBmdW5jdGlvbiAodSkge1xuICAgICAgICByZXR1cm4gKHUuY29uc3RydWN0b3IgPT09IGJ1ZmZlci5jb25zdHJ1Y3RvciA/IHUgOiBuZXcgYnVmZmVyKHUpKVxuICAgICAgICAudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gKHUpIHsgcmV0dXJuIGJ0b2EodXRvYih1KSkgfVxuICAgIDtcbiAgICB2YXIgZW5jb2RlID0gZnVuY3Rpb24odSwgdXJpc2FmZSkge1xuICAgICAgICByZXR1cm4gIXVyaXNhZmVcbiAgICAgICAgICAgID8gX2VuY29kZShTdHJpbmcodSkpXG4gICAgICAgICAgICA6IF9lbmNvZGUoU3RyaW5nKHUpKS5yZXBsYWNlKC9bK1xcL10vZywgZnVuY3Rpb24obTApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbTAgPT0gJysnID8gJy0nIDogJ18nO1xuICAgICAgICAgICAgfSkucmVwbGFjZSgvPS9nLCAnJyk7XG4gICAgfTtcbiAgICB2YXIgZW5jb2RlVVJJID0gZnVuY3Rpb24odSkgeyByZXR1cm4gZW5jb2RlKHUsIHRydWUpIH07XG4gICAgLy8gZGVjb2RlciBzdHVmZlxuICAgIHZhciByZV9idG91ID0gbmV3IFJlZ0V4cChbXG4gICAgICAgICdbXFx4QzAtXFx4REZdW1xceDgwLVxceEJGXScsXG4gICAgICAgICdbXFx4RTAtXFx4RUZdW1xceDgwLVxceEJGXXsyfScsXG4gICAgICAgICdbXFx4RjAtXFx4RjddW1xceDgwLVxceEJGXXszfSdcbiAgICBdLmpvaW4oJ3wnKSwgJ2cnKTtcbiAgICB2YXIgY2JfYnRvdSA9IGZ1bmN0aW9uKGNjY2MpIHtcbiAgICAgICAgc3dpdGNoKGNjY2MubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHZhciBjcCA9ICgoMHgwNyAmIGNjY2MuY2hhckNvZGVBdCgwKSkgPDwgMTgpXG4gICAgICAgICAgICAgICAgfCAgICAoKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpIDw8IDEyKVxuICAgICAgICAgICAgICAgIHwgICAgKCgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDIpKSA8PCAgNilcbiAgICAgICAgICAgICAgICB8ICAgICAoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgzKSksXG4gICAgICAgICAgICBvZmZzZXQgPSBjcCAtIDB4MTAwMDA7XG4gICAgICAgICAgICByZXR1cm4gKGZyb21DaGFyQ29kZSgob2Zmc2V0ICA+Pj4gMTApICsgMHhEODAwKVxuICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgob2Zmc2V0ICYgMHgzRkYpICsgMHhEQzAwKSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBmcm9tQ2hhckNvZGUoXG4gICAgICAgICAgICAgICAgKCgweDBmICYgY2NjYy5jaGFyQ29kZUF0KDApKSA8PCAxMilcbiAgICAgICAgICAgICAgICAgICAgfCAoKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpIDw8IDYpXG4gICAgICAgICAgICAgICAgICAgIHwgICgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDIpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAgZnJvbUNoYXJDb2RlKFxuICAgICAgICAgICAgICAgICgoMHgxZiAmIGNjY2MuY2hhckNvZGVBdCgwKSkgPDwgNilcbiAgICAgICAgICAgICAgICAgICAgfCAgKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgYnRvdSA9IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgcmV0dXJuIGIucmVwbGFjZShyZV9idG91LCBjYl9idG91KTtcbiAgICB9O1xuICAgIHZhciBjYl9kZWNvZGUgPSBmdW5jdGlvbihjY2NjKSB7XG4gICAgICAgIHZhciBsZW4gPSBjY2NjLmxlbmd0aCxcbiAgICAgICAgcGFkbGVuID0gbGVuICUgNCxcbiAgICAgICAgbiA9IChsZW4gPiAwID8gYjY0dGFiW2NjY2MuY2hhckF0KDApXSA8PCAxOCA6IDApXG4gICAgICAgICAgICB8IChsZW4gPiAxID8gYjY0dGFiW2NjY2MuY2hhckF0KDEpXSA8PCAxMiA6IDApXG4gICAgICAgICAgICB8IChsZW4gPiAyID8gYjY0dGFiW2NjY2MuY2hhckF0KDIpXSA8PCAgNiA6IDApXG4gICAgICAgICAgICB8IChsZW4gPiAzID8gYjY0dGFiW2NjY2MuY2hhckF0KDMpXSAgICAgICA6IDApLFxuICAgICAgICBjaGFycyA9IFtcbiAgICAgICAgICAgIGZyb21DaGFyQ29kZSggbiA+Pj4gMTYpLFxuICAgICAgICAgICAgZnJvbUNoYXJDb2RlKChuID4+PiAgOCkgJiAweGZmKSxcbiAgICAgICAgICAgIGZyb21DaGFyQ29kZSggbiAgICAgICAgICYgMHhmZilcbiAgICAgICAgXTtcbiAgICAgICAgY2hhcnMubGVuZ3RoIC09IFswLCAwLCAyLCAxXVtwYWRsZW5dO1xuICAgICAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gICAgfTtcbiAgICB2YXIgYXRvYiA9IGdsb2JhbC5hdG9iID8gZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gZ2xvYmFsLmF0b2IoYSk7XG4gICAgfSA6IGZ1bmN0aW9uKGEpe1xuICAgICAgICByZXR1cm4gYS5yZXBsYWNlKC9bXFxzXFxTXXsxLDR9L2csIGNiX2RlY29kZSk7XG4gICAgfTtcbiAgICB2YXIgX2RlY29kZSA9IGJ1ZmZlciA/IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgcmV0dXJuIChhLmNvbnN0cnVjdG9yID09PSBidWZmZXIuY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICA/IGEgOiBuZXcgYnVmZmVyKGEsICdiYXNlNjQnKSkudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgOiBmdW5jdGlvbihhKSB7IHJldHVybiBidG91KGF0b2IoYSkpIH07XG4gICAgdmFyIGRlY29kZSA9IGZ1bmN0aW9uKGEpe1xuICAgICAgICByZXR1cm4gX2RlY29kZShcbiAgICAgICAgICAgIFN0cmluZyhhKS5yZXBsYWNlKC9bLV9dL2csIGZ1bmN0aW9uKG0wKSB7IHJldHVybiBtMCA9PSAnLScgPyAnKycgOiAnLycgfSlcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9dL2csICcnKVxuICAgICAgICApO1xuICAgIH07XG4gICAgdmFyIG5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIEJhc2U2NCA9IGdsb2JhbC5CYXNlNjQ7XG4gICAgICAgIGdsb2JhbC5CYXNlNjQgPSBfQmFzZTY0O1xuICAgICAgICByZXR1cm4gQmFzZTY0O1xuICAgIH07XG4gICAgLy8gZXhwb3J0IEJhc2U2NFxuICAgIGdsb2JhbC5CYXNlNjQgPSB7XG4gICAgICAgIFZFUlNJT046IHZlcnNpb24sXG4gICAgICAgIGF0b2I6IGF0b2IsXG4gICAgICAgIGJ0b2E6IGJ0b2EsXG4gICAgICAgIGZyb21CYXNlNjQ6IGRlY29kZSxcbiAgICAgICAgdG9CYXNlNjQ6IGVuY29kZSxcbiAgICAgICAgdXRvYjogdXRvYixcbiAgICAgICAgZW5jb2RlOiBlbmNvZGUsXG4gICAgICAgIGVuY29kZVVSSTogZW5jb2RlVVJJLFxuICAgICAgICBidG91OiBidG91LFxuICAgICAgICBkZWNvZGU6IGRlY29kZSxcbiAgICAgICAgbm9Db25mbGljdDogbm9Db25mbGljdFxuICAgIH07XG4gICAgLy8gaWYgRVM1IGlzIGF2YWlsYWJsZSwgbWFrZSBCYXNlNjQuZXh0ZW5kU3RyaW5nKCkgYXZhaWxhYmxlXG4gICAgaWYgKHR5cGVvZiBPYmplY3QuZGVmaW5lUHJvcGVydHkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFyIG5vRW51bSA9IGZ1bmN0aW9uKHYpe1xuICAgICAgICAgICAgcmV0dXJuIHt2YWx1ZTp2LGVudW1lcmFibGU6ZmFsc2Usd3JpdGFibGU6dHJ1ZSxjb25maWd1cmFibGU6dHJ1ZX07XG4gICAgICAgIH07XG4gICAgICAgIGdsb2JhbC5CYXNlNjQuZXh0ZW5kU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgIFN0cmluZy5wcm90b3R5cGUsICdmcm9tQmFzZTY0Jywgbm9FbnVtKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlY29kZSh0aGlzKVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICBTdHJpbmcucHJvdG90eXBlLCAndG9CYXNlNjQnLCBub0VudW0oZnVuY3Rpb24gKHVyaXNhZmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVuY29kZSh0aGlzLCB1cmlzYWZlKVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICBTdHJpbmcucHJvdG90eXBlLCAndG9CYXNlNjRVUkknLCBub0VudW0oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW5jb2RlKHRoaXMsIHRydWUpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyB0aGF0J3MgaXQhXG4gICAgaWYgKGdsb2JhbFsnTWV0ZW9yJ10pIHtcbiAgICAgICBCYXNlNjQgPSBnbG9iYWwuQmFzZTY0OyAvLyBmb3Igbm9ybWFsIGV4cG9ydCBpbiBNZXRlb3IuanNcbiAgICB9XG59KSh0aGlzKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyByZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggYXJyYXkgd2l0aCBkaXJlY3RvcnkgbmFtZXMgdGhlcmVcbi8vIG11c3QgYmUgbm8gc2xhc2hlcywgZW1wdHkgZWxlbWVudHMsIG9yIGRldmljZSBuYW1lcyAoYzpcXCkgaW4gdGhlIGFycmF5XG4vLyAoc28gYWxzbyBubyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzIC0gaXQgZG9lcyBub3QgZGlzdGluZ3Vpc2hcbi8vIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBwYXRocylcbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KHBhcnRzLCBhbGxvd0Fib3ZlUm9vdCkge1xuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgbGFzdCA9IHBhcnRzW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFNwbGl0IGEgZmlsZW5hbWUgaW50byBbcm9vdCwgZGlyLCBiYXNlbmFtZSwgZXh0XSwgdW5peCB2ZXJzaW9uXG4vLyAncm9vdCcgaXMganVzdCBhIHNsYXNoLCBvciBub3RoaW5nLlxudmFyIHNwbGl0UGF0aFJlID1cbiAgICAvXihcXC8/fCkoW1xcc1xcU10qPykoKD86XFwuezEsMn18W15cXC9dKz98KShcXC5bXi5cXC9dKnwpKSg/OltcXC9dKikkLztcbnZhciBzcGxpdFBhdGggPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICByZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhmaWxlbmFtZSkuc2xpY2UoMSk7XG59O1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmVkUGF0aCA9ICcnLFxuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgdmFyIHBhdGggPSAoaSA+PSAwKSA/IGFyZ3VtZW50c1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5yZXNvbHZlIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH0gZWxzZSBpZiAoIXBhdGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckF0KDApID09PSAnLyc7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocmVzb2x2ZWRQYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIXJlc29sdmVkQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICByZXR1cm4gKChyZXNvbHZlZEFic29sdXRlID8gJy8nIDogJycpICsgcmVzb2x2ZWRQYXRoKSB8fCAnLic7XG59O1xuXG4vLyBwYXRoLm5vcm1hbGl6ZShwYXRoKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5ub3JtYWxpemUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciBpc0Fic29sdXRlID0gZXhwb3J0cy5pc0Fic29sdXRlKHBhdGgpLFxuICAgICAgdHJhaWxpbmdTbGFzaCA9IHN1YnN0cihwYXRoLCAtMSkgPT09ICcvJztcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihwYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIWlzQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICBpZiAoIXBhdGggJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBwYXRoID0gJy4nO1xuICB9XG4gIGlmIChwYXRoICYmIHRyYWlsaW5nU2xhc2gpIHtcbiAgICBwYXRoICs9ICcvJztcbiAgfVxuXG4gIHJldHVybiAoaXNBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHBhdGg7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmlzQWJzb2x1dGUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5qb2luID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwYXRocyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gIHJldHVybiBleHBvcnRzLm5vcm1hbGl6ZShmaWx0ZXIocGF0aHMsIGZ1bmN0aW9uKHAsIGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBwICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGguam9pbiBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH0pLmpvaW4oJy8nKSk7XG59O1xuXG5cbi8vIHBhdGgucmVsYXRpdmUoZnJvbSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgZnJvbSA9IGV4cG9ydHMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7XG4gIHRvID0gZXhwb3J0cy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7XG5cbiAgZnVuY3Rpb24gdHJpbShhcnIpIHtcbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIGZvciAoOyBzdGFydCA8IGFyci5sZW5ndGg7IHN0YXJ0KyspIHtcbiAgICAgIGlmIChhcnJbc3RhcnRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgdmFyIGVuZCA9IGFyci5sZW5ndGggLSAxO1xuICAgIGZvciAoOyBlbmQgPj0gMDsgZW5kLS0pIHtcbiAgICAgIGlmIChhcnJbZW5kXSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+IGVuZCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCAtIHN0YXJ0ICsgMSk7XG4gIH1cblxuICB2YXIgZnJvbVBhcnRzID0gdHJpbShmcm9tLnNwbGl0KCcvJykpO1xuICB2YXIgdG9QYXJ0cyA9IHRyaW0odG8uc3BsaXQoJy8nKSk7XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsIHRvUGFydHMubGVuZ3RoKTtcbiAgdmFyIHNhbWVQYXJ0c0xlbmd0aCA9IGxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChmcm9tUGFydHNbaV0gIT09IHRvUGFydHNbaV0pIHtcbiAgICAgIHNhbWVQYXJ0c0xlbmd0aCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0cHV0UGFydHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHNhbWVQYXJ0c0xlbmd0aDsgaSA8IGZyb21QYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFBhcnRzLnB1c2goJy4uJyk7XG4gIH1cblxuICBvdXRwdXRQYXJ0cyA9IG91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO1xuXG4gIHJldHVybiBvdXRwdXRQYXJ0cy5qb2luKCcvJyk7XG59O1xuXG5leHBvcnRzLnNlcCA9ICcvJztcbmV4cG9ydHMuZGVsaW1pdGVyID0gJzonO1xuXG5leHBvcnRzLmRpcm5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciByZXN1bHQgPSBzcGxpdFBhdGgocGF0aCksXG4gICAgICByb290ID0gcmVzdWx0WzBdLFxuICAgICAgZGlyID0gcmVzdWx0WzFdO1xuXG4gIGlmICghcm9vdCAmJiAhZGlyKSB7XG4gICAgLy8gTm8gZGlybmFtZSB3aGF0c29ldmVyXG4gICAgcmV0dXJuICcuJztcbiAgfVxuXG4gIGlmIChkaXIpIHtcbiAgICAvLyBJdCBoYXMgYSBkaXJuYW1lLCBzdHJpcCB0cmFpbGluZyBzbGFzaFxuICAgIGRpciA9IGRpci5zdWJzdHIoMCwgZGlyLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHJvb3QgKyBkaXI7XG59O1xuXG5cbmV4cG9ydHMuYmFzZW5hbWUgPSBmdW5jdGlvbihwYXRoLCBleHQpIHtcbiAgdmFyIGYgPSBzcGxpdFBhdGgocGF0aClbMl07XG4gIC8vIFRPRE86IG1ha2UgdGhpcyBjb21wYXJpc29uIGNhc2UtaW5zZW5zaXRpdmUgb24gd2luZG93cz9cbiAgaWYgKGV4dCAmJiBmLnN1YnN0cigtMSAqIGV4dC5sZW5ndGgpID09PSBleHQpIHtcbiAgICBmID0gZi5zdWJzdHIoMCwgZi5sZW5ndGggLSBleHQubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gZjtcbn07XG5cblxuZXhwb3J0cy5leHRuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gc3BsaXRQYXRoKHBhdGgpWzNdO1xufTtcblxuZnVuY3Rpb24gZmlsdGVyICh4cywgZikge1xuICAgIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZik7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGYoeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG52YXIgc3Vic3RyID0gJ2FiJy5zdWJzdHIoLTEpID09PSAnYidcbiAgICA/IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHsgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbikgfVxuICAgIDogZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikge1xuICAgICAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcbiAgICAgICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbik7XG4gICAgfVxuO1xuIiwiaW1wb3J0IENvbnRhaW5lciBmcm9tICcuL2NvbnRhaW5lcic7XG5pbXBvcnQgd2Fybk9uY2UgIGZyb20gJy4vd2Fybi1vbmNlJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIGF0LXJ1bGUuXG4gKlxuICogSWYgaXTigJlzIGZvbGxvd2VkIGluIHRoZSBDU1MgYnkgYSB7fSBibG9jaywgdGhpcyBub2RlIHdpbGwgaGF2ZVxuICogYSBub2RlcyBwcm9wZXJ0eSByZXByZXNlbnRpbmcgaXRzIGNoaWxkcmVuLlxuICpcbiAqIEBleHRlbmRzIENvbnRhaW5lclxuICpcbiAqIEBleGFtcGxlXG4gKiBjb25zdCByb290ID0gcG9zdGNzcy5wYXJzZSgnQGNoYXJzZXQgXCJVVEYtOFwiOyBAbWVkaWEgcHJpbnQge30nKTtcbiAqXG4gKiBjb25zdCBjaGFyc2V0ID0gcm9vdC5maXJzdDtcbiAqIGNoYXJzZXQudHlwZSAgLy89PiAnYXRydWxlJ1xuICogY2hhcnNldC5ub2RlcyAvLz0+IHVuZGVmaW5lZFxuICpcbiAqIGNvbnN0IG1lZGlhID0gcm9vdC5sYXN0O1xuICogbWVkaWEubm9kZXMgICAvLz0+IFtdXG4gKi9cbmNsYXNzIEF0UnVsZSBleHRlbmRzIENvbnRhaW5lciB7XG5cbiAgICBjb25zdHJ1Y3RvcihkZWZhdWx0cykge1xuICAgICAgICBzdXBlcihkZWZhdWx0cyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdhdHJ1bGUnO1xuICAgIH1cblxuICAgIGFwcGVuZCguLi5jaGlsZHJlbikge1xuICAgICAgICBpZiAoICF0aGlzLm5vZGVzICkgdGhpcy5ub2RlcyA9IFtdO1xuICAgICAgICByZXR1cm4gc3VwZXIuYXBwZW5kKC4uLmNoaWxkcmVuKTtcbiAgICB9XG5cbiAgICBwcmVwZW5kKC4uLmNoaWxkcmVuKSB7XG4gICAgICAgIGlmICggIXRoaXMubm9kZXMgKSB0aGlzLm5vZGVzID0gW107XG4gICAgICAgIHJldHVybiBzdXBlci5wcmVwZW5kKC4uLmNoaWxkcmVuKTtcbiAgICB9XG5cbiAgICBnZXQgYWZ0ZXJOYW1lKCkge1xuICAgICAgICB3YXJuT25jZSgnQXRSdWxlI2FmdGVyTmFtZSB3YXMgZGVwcmVjYXRlZC4gVXNlIEF0UnVsZSNyYXdzLmFmdGVyTmFtZScpO1xuICAgICAgICByZXR1cm4gdGhpcy5yYXdzLmFmdGVyTmFtZTtcbiAgICB9XG5cbiAgICBzZXQgYWZ0ZXJOYW1lKHZhbCkge1xuICAgICAgICB3YXJuT25jZSgnQXRSdWxlI2FmdGVyTmFtZSB3YXMgZGVwcmVjYXRlZC4gVXNlIEF0UnVsZSNyYXdzLmFmdGVyTmFtZScpO1xuICAgICAgICB0aGlzLnJhd3MuYWZ0ZXJOYW1lID0gdmFsO1xuICAgIH1cblxuICAgIGdldCBfcGFyYW1zKCkge1xuICAgICAgICB3YXJuT25jZSgnQXRSdWxlI19wYXJhbXMgd2FzIGRlcHJlY2F0ZWQuIFVzZSBBdFJ1bGUjcmF3cy5wYXJhbXMnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmF3cy5wYXJhbXM7XG4gICAgfVxuXG4gICAgc2V0IF9wYXJhbXModmFsKSB7XG4gICAgICAgIHdhcm5PbmNlKCdBdFJ1bGUjX3BhcmFtcyB3YXMgZGVwcmVjYXRlZC4gVXNlIEF0UnVsZSNyYXdzLnBhcmFtcycpO1xuICAgICAgICB0aGlzLnJhd3MucGFyYW1zID0gdmFsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBBdFJ1bGUjXG4gICAgICogQG1lbWJlciB7c3RyaW5nfSBuYW1lIC0gdGhlIGF0LXJ1bGXigJlzIG5hbWUgaW1tZWRpYXRlbHkgZm9sbG93cyB0aGUgYEBgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHJvb3QgID0gcG9zdGNzcy5wYXJzZSgnQG1lZGlhIHByaW50IHt9Jyk7XG4gICAgICogbWVkaWEubmFtZSAvLz0+ICdtZWRpYSdcbiAgICAgKiBjb25zdCBtZWRpYSA9IHJvb3QuZmlyc3Q7XG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgQXRSdWxlI1xuICAgICAqIEBtZW1iZXIge3N0cmluZ30gcGFyYW1zIC0gdGhlIGF0LXJ1bGXigJlzIHBhcmFtZXRlcnMsIHRoZSB2YWx1ZXNcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQgZm9sbG93IHRoZSBhdC1ydWxl4oCZcyBuYW1lIGJ1dCBwcmVjZWRlXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBhbnkge30gYmxvY2tcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3Qgcm9vdCAgPSBwb3N0Y3NzLnBhcnNlKCdAbWVkaWEgcHJpbnQsIHNjcmVlbiB7fScpO1xuICAgICAqIGNvbnN0IG1lZGlhID0gcm9vdC5maXJzdDtcbiAgICAgKiBtZWRpYS5wYXJhbXMgLy89PiAncHJpbnQsIHNjcmVlbidcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBBdFJ1bGUjXG4gICAgICogQG1lbWJlciB7b2JqZWN0fSByYXdzIC0gSW5mb3JtYXRpb24gdG8gZ2VuZXJhdGUgYnl0ZS10by1ieXRlIGVxdWFsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSBzdHJpbmcgYXMgaXQgd2FzIGluIHRoZSBvcmlnaW4gaW5wdXQuXG4gICAgICpcbiAgICAgKiBFdmVyeSBwYXJzZXIgc2F2ZXMgaXRzIG93biBwcm9wZXJ0aWVzLFxuICAgICAqIGJ1dCB0aGUgZGVmYXVsdCBDU1MgcGFyc2VyIHVzZXM6XG4gICAgICpcbiAgICAgKiAqIGBiZWZvcmVgOiB0aGUgc3BhY2Ugc3ltYm9scyBiZWZvcmUgdGhlIG5vZGUuIEl0IGFsc28gc3RvcmVzIGAqYFxuICAgICAqICAgYW5kIGBfYCBzeW1ib2xzIGJlZm9yZSB0aGUgZGVjbGFyYXRpb24gKElFIGhhY2spLlxuICAgICAqICogYGFmdGVyYDogdGhlIHNwYWNlIHN5bWJvbHMgYWZ0ZXIgdGhlIGxhc3QgY2hpbGQgb2YgdGhlIG5vZGVcbiAgICAgKiAgIHRvIHRoZSBlbmQgb2YgdGhlIG5vZGUuXG4gICAgICogKiBgYmV0d2VlbmA6IHRoZSBzeW1ib2xzIGJldHdlZW4gdGhlIHByb3BlcnR5IGFuZCB2YWx1ZVxuICAgICAqICAgZm9yIGRlY2xhcmF0aW9ucywgc2VsZWN0b3IgYW5kIGB7YCBmb3IgcnVsZXMsIG9yIGxhc3QgcGFyYW1ldGVyXG4gICAgICogICBhbmQgYHtgIGZvciBhdC1ydWxlcy5cbiAgICAgKiAqIGBzZW1pY29sb25gOiBjb250YWlucyB0cnVlIGlmIHRoZSBsYXN0IGNoaWxkIGhhc1xuICAgICAqICAgYW4gKG9wdGlvbmFsKSBzZW1pY29sb24uXG4gICAgICogKiBgYWZ0ZXJOYW1lYDogdGhlIHNwYWNlIGJldHdlZW4gdGhlIGF0LXJ1bGUgbmFtZSBhbmQgaXRzIHBhcmFtZXRlcnMuXG4gICAgICpcbiAgICAgKiBQb3N0Q1NTIGNsZWFucyBhdC1ydWxlIHBhcmFtZXRlcnMgZnJvbSBjb21tZW50cyBhbmQgZXh0cmEgc3BhY2VzLFxuICAgICAqIGJ1dCBpdCBzdG9yZXMgb3JpZ2luIGNvbnRlbnQgaW4gcmF3cyBwcm9wZXJ0aWVzLlxuICAgICAqIEFzIHN1Y2gsIGlmIHlvdSBkb27igJl0IGNoYW5nZSBhIGRlY2xhcmF0aW9u4oCZcyB2YWx1ZSxcbiAgICAgKiBQb3N0Q1NTIHdpbGwgdXNlIHRoZSByYXcgdmFsdWUgd2l0aCBjb21tZW50cy5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3Qgcm9vdCA9IHBvc3Rjc3MucGFyc2UoJyAgQG1lZGlhXFxucHJpbnQge1xcbn0nKVxuICAgICAqIHJvb3QuZmlyc3QuZmlyc3QucmF3cyAvLz0+IHsgYmVmb3JlOiAnICAnLFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgYmV0d2VlbjogJyAnLFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgYWZ0ZXJOYW1lOiAnXFxuJyxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIGFmdGVyOiAnXFxuJyB9XG4gICAgICovXG59XG5cbmV4cG9ydCBkZWZhdWx0IEF0UnVsZTtcbiIsImltcG9ydCB3YXJuT25jZSBmcm9tICcuL3dhcm4tb25jZSc7XG5pbXBvcnQgTm9kZSAgICAgZnJvbSAnLi9ub2RlJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgY29tbWVudCBiZXR3ZWVuIGRlY2xhcmF0aW9ucyBvciBzdGF0ZW1lbnRzIChydWxlIGFuZCBhdC1ydWxlcykuXG4gKlxuICogQ29tbWVudHMgaW5zaWRlIHNlbGVjdG9ycywgYXQtcnVsZSBwYXJhbWV0ZXJzLCBvciBkZWNsYXJhdGlvbiB2YWx1ZXNcbiAqIHdpbGwgYmUgc3RvcmVkIGluIHRoZSBgcmF3c2AgcHJvcGVydGllcyBleHBsYWluZWQgYWJvdmUuXG4gKlxuICogQGV4dGVuZHMgTm9kZVxuICovXG5jbGFzcyBDb21tZW50IGV4dGVuZHMgTm9kZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihkZWZhdWx0cykge1xuICAgICAgICBzdXBlcihkZWZhdWx0cyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdjb21tZW50JztcbiAgICB9XG5cbiAgICBnZXQgbGVmdCgpIHtcbiAgICAgICAgd2Fybk9uY2UoJ0NvbW1lbnQjbGVmdCB3YXMgZGVwcmVjYXRlZC4gVXNlIENvbW1lbnQjcmF3cy5sZWZ0Jyk7XG4gICAgICAgIHJldHVybiB0aGlzLnJhd3MubGVmdDtcbiAgICB9XG5cbiAgICBzZXQgbGVmdCh2YWwpIHtcbiAgICAgICAgd2Fybk9uY2UoJ0NvbW1lbnQjbGVmdCB3YXMgZGVwcmVjYXRlZC4gVXNlIENvbW1lbnQjcmF3cy5sZWZ0Jyk7XG4gICAgICAgIHRoaXMucmF3cy5sZWZ0ID0gdmFsO1xuICAgIH1cblxuICAgIGdldCByaWdodCgpIHtcbiAgICAgICAgd2Fybk9uY2UoJ0NvbW1lbnQjcmlnaHQgd2FzIGRlcHJlY2F0ZWQuIFVzZSBDb21tZW50I3Jhd3MucmlnaHQnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmF3cy5yaWdodDtcbiAgICB9XG5cbiAgICBzZXQgcmlnaHQodmFsKSB7XG4gICAgICAgIHdhcm5PbmNlKCdDb21tZW50I3JpZ2h0IHdhcyBkZXByZWNhdGVkLiBVc2UgQ29tbWVudCNyYXdzLnJpZ2h0Jyk7XG4gICAgICAgIHRoaXMucmF3cy5yaWdodCA9IHZhbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgQ29tbWVudCNcbiAgICAgKiBAbWVtYmVyIHtzdHJpbmd9IHRleHQgLSB0aGUgY29tbWVudOKAmXMgdGV4dFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIENvbW1lbnQjXG4gICAgICogQG1lbWJlciB7b2JqZWN0fSByYXdzIC0gSW5mb3JtYXRpb24gdG8gZ2VuZXJhdGUgYnl0ZS10by1ieXRlIGVxdWFsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSBzdHJpbmcgYXMgaXQgd2FzIGluIHRoZSBvcmlnaW4gaW5wdXQuXG4gICAgICpcbiAgICAgKiBFdmVyeSBwYXJzZXIgc2F2ZXMgaXRzIG93biBwcm9wZXJ0aWVzLFxuICAgICAqIGJ1dCB0aGUgZGVmYXVsdCBDU1MgcGFyc2VyIHVzZXM6XG4gICAgICpcbiAgICAgKiAqIGBiZWZvcmVgOiB0aGUgc3BhY2Ugc3ltYm9scyBiZWZvcmUgdGhlIG5vZGUuXG4gICAgICogKiBgbGVmdGA6IHRoZSBzcGFjZSBzeW1ib2xzIGJldHdlZW4gYC8qYCBhbmQgdGhlIGNvbW1lbnTigJlzIHRleHQuXG4gICAgICogKiBgcmlnaHRgOiB0aGUgc3BhY2Ugc3ltYm9scyBiZXR3ZWVuIHRoZSBjb21tZW504oCZcyB0ZXh0LlxuICAgICAqL1xufVxuXG5leHBvcnQgZGVmYXVsdCBDb21tZW50O1xuIiwiaW1wb3J0IERlY2xhcmF0aW9uIGZyb20gJy4vZGVjbGFyYXRpb24nO1xuaW1wb3J0IHdhcm5PbmNlICAgIGZyb20gJy4vd2Fybi1vbmNlJztcbmltcG9ydCBDb21tZW50ICAgICBmcm9tICcuL2NvbW1lbnQnO1xuaW1wb3J0IE5vZGUgICAgICAgIGZyb20gJy4vbm9kZSc7XG5cbmZ1bmN0aW9uIGNsZWFuU291cmNlKG5vZGVzKSB7XG4gICAgcmV0dXJuIG5vZGVzLm1hcCggaSA9PiB7XG4gICAgICAgIGlmICggaS5ub2RlcyApIGkubm9kZXMgPSBjbGVhblNvdXJjZShpLm5vZGVzKTtcbiAgICAgICAgZGVsZXRlIGkuc291cmNlO1xuICAgICAgICByZXR1cm4gaTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBUaGUge0BsaW5rIFJvb3R9LCB7QGxpbmsgQXRSdWxlfSwgYW5kIHtAbGluayBSdWxlfSBjb250YWluZXIgbm9kZXNcbiAqIGluaGVyaXQgc29tZSBjb21tb24gbWV0aG9kcyB0byBoZWxwIHdvcmsgd2l0aCB0aGVpciBjaGlsZHJlbi5cbiAqXG4gKiBOb3RlIHRoYXQgYWxsIGNvbnRhaW5lcnMgY2FuIHN0b3JlIGFueSBjb250ZW50LiBJZiB5b3Ugd3JpdGUgYSBydWxlIGluc2lkZVxuICogYSBydWxlLCBQb3N0Q1NTIHdpbGwgcGFyc2UgaXQuXG4gKlxuICogQGV4dGVuZHMgTm9kZVxuICogQGFic3RyYWN0XG4gKi9cbmNsYXNzIENvbnRhaW5lciBleHRlbmRzIE5vZGUge1xuXG4gICAgcHVzaChjaGlsZCkge1xuICAgICAgICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xuICAgICAgICB0aGlzLm5vZGVzLnB1c2goY2hpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyB0aHJvdWdoIHRoZSBjb250YWluZXLigJlzIGltbWVkaWF0ZSBjaGlsZHJlbixcbiAgICAgKiBjYWxsaW5nIGBjYWxsYmFja2AgZm9yIGVhY2ggY2hpbGQuXG4gICAgICpcbiAgICAgKiBSZXR1cm5pbmcgYGZhbHNlYCBpbiB0aGUgY2FsbGJhY2sgd2lsbCBicmVhayBpdGVyYXRpb24uXG4gICAgICpcbiAgICAgKiBUaGlzIG1ldGhvZCBvbmx5IGl0ZXJhdGVzIHRocm91Z2ggdGhlIGNvbnRhaW5lcuKAmXMgaW1tZWRpYXRlIGNoaWxkcmVuLlxuICAgICAqIElmIHlvdSBuZWVkIHRvIHJlY3Vyc2l2ZWx5IGl0ZXJhdGUgdGhyb3VnaCBhbGwgdGhlIGNvbnRhaW5lcuKAmXMgZGVzY2VuZGFudFxuICAgICAqIG5vZGVzLCB1c2Uge0BsaW5rIENvbnRhaW5lciN3YWxrfS5cbiAgICAgKlxuICAgICAqIFVubGlrZSB0aGUgZm9yIGB7fWAtY3ljbGUgb3IgYEFycmF5I2ZvckVhY2hgIHRoaXMgaXRlcmF0b3IgaXMgc2FmZVxuICAgICAqIGlmIHlvdSBhcmUgbXV0YXRpbmcgdGhlIGFycmF5IG9mIGNoaWxkIG5vZGVzIGR1cmluZyBpdGVyYXRpb24uXG4gICAgICogUG9zdENTUyB3aWxsIGFkanVzdCB0aGUgY3VycmVudCBpbmRleCB0byBtYXRjaCB0aGUgbXV0YXRpb25zLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtjaGlsZEl0ZXJhdG9yfSBjYWxsYmFjayAtIGl0ZXJhdG9yIHJlY2VpdmVzIGVhY2ggbm9kZSBhbmQgaW5kZXhcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2ZhbHNlfHVuZGVmaW5lZH0gcmV0dXJucyBgZmFsc2VgIGlmIGl0ZXJhdGlvbiB3YXMgYnJva2VcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3Qgcm9vdCA9IHBvc3Rjc3MucGFyc2UoJ2EgeyBjb2xvcjogYmxhY2s7IHotaW5kZXg6IDEgfScpO1xuICAgICAqIGNvbnN0IHJ1bGUgPSByb290LmZpcnN0O1xuICAgICAqXG4gICAgICogZm9yICggbGV0IGRlY2wgb2YgcnVsZS5ub2RlcyApIHtcbiAgICAgKiAgICAgZGVjbC5jbG9uZUJlZm9yZSh7IHByb3A6ICctd2Via2l0LScgKyBkZWNsLnByb3AgfSk7XG4gICAgICogICAgIC8vIEN5Y2xlIHdpbGwgYmUgaW5maW5pdGUsIGJlY2F1c2UgY2xvbmVCZWZvcmUgbW92ZXMgdGhlIGN1cnJlbnQgbm9kZVxuICAgICAqICAgICAvLyB0byB0aGUgbmV4dCBpbmRleFxuICAgICAqIH1cbiAgICAgKlxuICAgICAqIHJ1bGUuZWFjaChkZWNsID0+IHtcbiAgICAgKiAgICAgZGVjbC5jbG9uZUJlZm9yZSh7IHByb3A6ICctd2Via2l0LScgKyBkZWNsLnByb3AgfSk7XG4gICAgICogICAgIC8vIFdpbGwgYmUgZXhlY3V0ZWQgb25seSBmb3IgY29sb3IgYW5kIHotaW5kZXhcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBlYWNoKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICggIXRoaXMubGFzdEVhY2ggKSB0aGlzLmxhc3RFYWNoID0gMDtcbiAgICAgICAgaWYgKCAhdGhpcy5pbmRleGVzICkgdGhpcy5pbmRleGVzID0geyB9O1xuXG4gICAgICAgIHRoaXMubGFzdEVhY2ggKz0gMTtcbiAgICAgICAgbGV0IGlkID0gdGhpcy5sYXN0RWFjaDtcbiAgICAgICAgdGhpcy5pbmRleGVzW2lkXSA9IDA7XG5cbiAgICAgICAgaWYgKCAhdGhpcy5ub2RlcyApIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICAgICAgbGV0IGluZGV4LCByZXN1bHQ7XG4gICAgICAgIHdoaWxlICggdGhpcy5pbmRleGVzW2lkXSA8IHRoaXMubm9kZXMubGVuZ3RoICkge1xuICAgICAgICAgICAgaW5kZXggID0gdGhpcy5pbmRleGVzW2lkXTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGNhbGxiYWNrKHRoaXMubm9kZXNbaW5kZXhdLCBpbmRleCk7XG4gICAgICAgICAgICBpZiAoIHJlc3VsdCA9PT0gZmFsc2UgKSBicmVhaztcblxuICAgICAgICAgICAgdGhpcy5pbmRleGVzW2lkXSArPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVsZXRlIHRoaXMuaW5kZXhlc1tpZF07XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmF2ZXJzZXMgdGhlIGNvbnRhaW5lcuKAmXMgZGVzY2VuZGFudCBub2RlcywgY2FsbGluZyBjYWxsYmFja1xuICAgICAqIGZvciBlYWNoIG5vZGUuXG4gICAgICpcbiAgICAgKiBMaWtlIGNvbnRhaW5lci5lYWNoKCksIHRoaXMgbWV0aG9kIGlzIHNhZmUgdG8gdXNlXG4gICAgICogaWYgeW91IGFyZSBtdXRhdGluZyBhcnJheXMgZHVyaW5nIGl0ZXJhdGlvbi5cbiAgICAgKlxuICAgICAqIElmIHlvdSBvbmx5IG5lZWQgdG8gaXRlcmF0ZSB0aHJvdWdoIHRoZSBjb250YWluZXLigJlzIGltbWVkaWF0ZSBjaGlsZHJlbixcbiAgICAgKiB1c2Uge0BsaW5rIENvbnRhaW5lciNlYWNofS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Y2hpbGRJdGVyYXRvcn0gY2FsbGJhY2sgLSBpdGVyYXRvciByZWNlaXZlcyBlYWNoIG5vZGUgYW5kIGluZGV4XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtmYWxzZXx1bmRlZmluZWR9IHJldHVybnMgYGZhbHNlYCBpZiBpdGVyYXRpb24gd2FzIGJyb2tlXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHJvb3Qud2Fsayhub2RlID0+IHtcbiAgICAgKiAgIC8vIFRyYXZlcnNlcyBhbGwgZGVzY2VuZGFudCBub2Rlcy5cbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICB3YWxrKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGNhbGxiYWNrKGNoaWxkLCBpKTtcbiAgICAgICAgICAgIGlmICggcmVzdWx0ICE9PSBmYWxzZSAmJiBjaGlsZC53YWxrICkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGNoaWxkLndhbGsoY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJhdmVyc2VzIHRoZSBjb250YWluZXLigJlzIGRlc2NlbmRhbnQgbm9kZXMsIGNhbGxpbmcgY2FsbGJhY2tcbiAgICAgKiBmb3IgZWFjaCBkZWNsYXJhdGlvbiBub2RlLlxuICAgICAqXG4gICAgICogSWYgeW91IHBhc3MgYSBmaWx0ZXIsIGl0ZXJhdGlvbiB3aWxsIG9ubHkgaGFwcGVuIG92ZXIgZGVjbGFyYXRpb25zXG4gICAgICogd2l0aCBtYXRjaGluZyBwcm9wZXJ0aWVzLlxuICAgICAqXG4gICAgICogTGlrZSB7QGxpbmsgQ29udGFpbmVyI2VhY2h9LCB0aGlzIG1ldGhvZCBpcyBzYWZlXG4gICAgICogdG8gdXNlIGlmIHlvdSBhcmUgbXV0YXRpbmcgYXJyYXlzIGR1cmluZyBpdGVyYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xSZWdFeHB9IFtwcm9wXSAgIC0gc3RyaW5nIG9yIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byBmaWx0ZXIgZGVjbGFyYXRpb25zIGJ5IHByb3BlcnR5IG5hbWVcbiAgICAgKiBAcGFyYW0ge2NoaWxkSXRlcmF0b3J9IGNhbGxiYWNrIC0gaXRlcmF0b3IgcmVjZWl2ZXMgZWFjaCBub2RlIGFuZCBpbmRleFxuICAgICAqXG4gICAgICogQHJldHVybiB7ZmFsc2V8dW5kZWZpbmVkfSByZXR1cm5zIGBmYWxzZWAgaWYgaXRlcmF0aW9uIHdhcyBicm9rZVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiByb290LndhbGtEZWNscyhkZWNsID0+IHtcbiAgICAgKiAgIGNoZWNrUHJvcGVydHlTdXBwb3J0KGRlY2wucHJvcCk7XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiByb290LndhbGtEZWNscygnYm9yZGVyLXJhZGl1cycsIGRlY2wgPT4ge1xuICAgICAqICAgZGVjbC5yZW1vdmUoKTtcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIHJvb3Qud2Fsa0RlY2xzKC9eYmFja2dyb3VuZC8sIGRlY2wgPT4ge1xuICAgICAqICAgZGVjbC52YWx1ZSA9IHRha2VGaXJzdENvbG9yRnJvbUdyYWRpZW50KGRlY2wudmFsdWUpO1xuICAgICAqIH0pO1xuICAgICAqL1xuICAgIHdhbGtEZWNscyhwcm9wLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoICFjYWxsYmFjayApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gcHJvcDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndhbGsoIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggY2hpbGQudHlwZSA9PT0gJ2RlY2wnICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soY2hpbGQsIGkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKCBwcm9wIGluc3RhbmNlb2YgUmVnRXhwICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2FsayggKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCBjaGlsZC50eXBlID09PSAnZGVjbCcgJiYgcHJvcC50ZXN0KGNoaWxkLnByb3ApICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soY2hpbGQsIGkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2FsayggKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCBjaGlsZC50eXBlID09PSAnZGVjbCcgJiYgY2hpbGQucHJvcCA9PT0gcHJvcCApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNoaWxkLCBpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYXZlcnNlcyB0aGUgY29udGFpbmVy4oCZcyBkZXNjZW5kYW50IG5vZGVzLCBjYWxsaW5nIGNhbGxiYWNrXG4gICAgICogZm9yIGVhY2ggcnVsZSBub2RlLlxuICAgICAqXG4gICAgICogSWYgeW91IHBhc3MgYSBmaWx0ZXIsIGl0ZXJhdGlvbiB3aWxsIG9ubHkgaGFwcGVuIG92ZXIgcnVsZXNcbiAgICAgKiB3aXRoIG1hdGNoaW5nIHNlbGVjdG9ycy5cbiAgICAgKlxuICAgICAqIExpa2Uge0BsaW5rIENvbnRhaW5lciNlYWNofSwgdGhpcyBtZXRob2QgaXMgc2FmZVxuICAgICAqIHRvIHVzZSBpZiB5b3UgYXJlIG11dGF0aW5nIGFycmF5cyBkdXJpbmcgaXRlcmF0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd8UmVnRXhwfSBbc2VsZWN0b3JdIC0gc3RyaW5nIG9yIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGZpbHRlciBydWxlcyBieSBzZWxlY3RvclxuICAgICAqIEBwYXJhbSB7Y2hpbGRJdGVyYXRvcn0gY2FsbGJhY2sgICAtIGl0ZXJhdG9yIHJlY2VpdmVzIGVhY2ggbm9kZSBhbmQgaW5kZXhcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2ZhbHNlfHVuZGVmaW5lZH0gcmV0dXJucyBgZmFsc2VgIGlmIGl0ZXJhdGlvbiB3YXMgYnJva2VcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3Qgc2VsZWN0b3JzID0gW107XG4gICAgICogcm9vdC53YWxrUnVsZXMocnVsZSA9PiB7XG4gICAgICogICBzZWxlY3RvcnMucHVzaChydWxlLnNlbGVjdG9yKTtcbiAgICAgKiB9KTtcbiAgICAgKiBjb25zb2xlLmxvZyhgWW91ciBDU1MgdXNlcyAke3NlbGVjdG9ycy5sZW5ndGh9IHNlbGVjdG9yc2ApO1xuICAgICAqL1xuICAgIHdhbGtSdWxlcyhzZWxlY3RvciwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IHNlbGVjdG9yO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy53YWxrKCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIGNoaWxkLnR5cGUgPT09ICdydWxlJyApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNoaWxkLCBpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICggc2VsZWN0b3IgaW5zdGFuY2VvZiBSZWdFeHAgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53YWxrKCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIGNoaWxkLnR5cGUgPT09ICdydWxlJyAmJiBzZWxlY3Rvci50ZXN0KGNoaWxkLnNlbGVjdG9yKSApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNoaWxkLCBpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndhbGsoIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggY2hpbGQudHlwZSA9PT0gJ3J1bGUnICYmIGNoaWxkLnNlbGVjdG9yID09PSBzZWxlY3RvciApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNoaWxkLCBpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYXZlcnNlcyB0aGUgY29udGFpbmVy4oCZcyBkZXNjZW5kYW50IG5vZGVzLCBjYWxsaW5nIGNhbGxiYWNrXG4gICAgICogZm9yIGVhY2ggYXQtcnVsZSBub2RlLlxuICAgICAqXG4gICAgICogSWYgeW91IHBhc3MgYSBmaWx0ZXIsIGl0ZXJhdGlvbiB3aWxsIG9ubHkgaGFwcGVuIG92ZXIgYXQtcnVsZXNcbiAgICAgKiB0aGF0IGhhdmUgbWF0Y2hpbmcgbmFtZXMuXG4gICAgICpcbiAgICAgKiBMaWtlIHtAbGluayBDb250YWluZXIjZWFjaH0sIHRoaXMgbWV0aG9kIGlzIHNhZmVcbiAgICAgKiB0byB1c2UgaWYgeW91IGFyZSBtdXRhdGluZyBhcnJheXMgZHVyaW5nIGl0ZXJhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfFJlZ0V4cH0gW25hbWVdICAgLSBzdHJpbmcgb3IgcmVndWxhciBleHByZXNzaW9uXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGZpbHRlciBhdC1ydWxlcyBieSBuYW1lXG4gICAgICogQHBhcmFtIHtjaGlsZEl0ZXJhdG9yfSBjYWxsYmFjayAtIGl0ZXJhdG9yIHJlY2VpdmVzIGVhY2ggbm9kZSBhbmQgaW5kZXhcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2ZhbHNlfHVuZGVmaW5lZH0gcmV0dXJucyBgZmFsc2VgIGlmIGl0ZXJhdGlvbiB3YXMgYnJva2VcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogcm9vdC53YWxrQXRSdWxlcyhydWxlID0+IHtcbiAgICAgKiAgIGlmICggaXNPbGQocnVsZS5uYW1lKSApIHJ1bGUucmVtb3ZlKCk7XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBsZXQgZmlyc3QgPSBmYWxzZTtcbiAgICAgKiByb290LndhbGtBdFJ1bGVzKCdjaGFyc2V0JywgcnVsZSA9PiB7XG4gICAgICogICBpZiAoICFmaXJzdCApIHtcbiAgICAgKiAgICAgZmlyc3QgPSB0cnVlO1xuICAgICAqICAgfSBlbHNlIHtcbiAgICAgKiAgICAgcnVsZS5yZW1vdmUoKTtcbiAgICAgKiAgIH1cbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICB3YWxrQXRSdWxlcyhuYW1lLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoICFjYWxsYmFjayApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gbmFtZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndhbGsoIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggY2hpbGQudHlwZSA9PT0gJ2F0cnVsZScgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhjaGlsZCwgaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIG5hbWUgaW5zdGFuY2VvZiBSZWdFeHAgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53YWxrKCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIGNoaWxkLnR5cGUgPT09ICdhdHJ1bGUnICYmIG5hbWUudGVzdChjaGlsZC5uYW1lKSApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNoaWxkLCBpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndhbGsoIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggY2hpbGQudHlwZSA9PT0gJ2F0cnVsZScgJiYgY2hpbGQubmFtZSA9PT0gbmFtZSApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNoaWxkLCBpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYXZlcnNlcyB0aGUgY29udGFpbmVy4oCZcyBkZXNjZW5kYW50IG5vZGVzLCBjYWxsaW5nIGNhbGxiYWNrXG4gICAgICogZm9yIGVhY2ggY29tbWVudCBub2RlLlxuICAgICAqXG4gICAgICogTGlrZSB7QGxpbmsgQ29udGFpbmVyI2VhY2h9LCB0aGlzIG1ldGhvZCBpcyBzYWZlXG4gICAgICogdG8gdXNlIGlmIHlvdSBhcmUgbXV0YXRpbmcgYXJyYXlzIGR1cmluZyBpdGVyYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2NoaWxkSXRlcmF0b3J9IGNhbGxiYWNrIC0gaXRlcmF0b3IgcmVjZWl2ZXMgZWFjaCBub2RlIGFuZCBpbmRleFxuICAgICAqXG4gICAgICogQHJldHVybiB7ZmFsc2V8dW5kZWZpbmVkfSByZXR1cm5zIGBmYWxzZWAgaWYgaXRlcmF0aW9uIHdhcyBicm9rZVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiByb290LndhbGtDb21tZW50cyhjb21tZW50ID0+IHtcbiAgICAgKiAgIGNvbW1lbnQucmVtb3ZlKCk7XG4gICAgICogfSk7XG4gICAgICovXG4gICAgd2Fsa0NvbW1lbnRzKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGsoIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKCBjaGlsZC50eXBlID09PSAnY29tbWVudCcgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNoaWxkLCBpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBuZXcgbm9kZXMgdG8gdGhlIHN0YXJ0IG9mIHRoZSBjb250YWluZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gey4uLihOb2RlfG9iamVjdHxzdHJpbmd8Tm9kZVtdKX0gY2hpbGRyZW4gLSBuZXcgbm9kZXNcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge05vZGV9IHRoaXMgbm9kZSBmb3IgbWV0aG9kcyBjaGFpblxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBkZWNsMSA9IHBvc3Rjc3MuZGVjbCh7IHByb3A6ICdjb2xvcicsIHZhbHVlOiAnYmxhY2snIH0pO1xuICAgICAqIGNvbnN0IGRlY2wyID0gcG9zdGNzcy5kZWNsKHsgcHJvcDogJ2JhY2tncm91bmQtY29sb3InLCB2YWx1ZTogJ3doaXRlJyB9KTtcbiAgICAgKiBydWxlLmFwcGVuZChkZWNsMSwgZGVjbDIpO1xuICAgICAqXG4gICAgICogcm9vdC5hcHBlbmQoeyBuYW1lOiAnY2hhcnNldCcsIHBhcmFtczogJ1wiVVRGLThcIicgfSk7ICAvLyBhdC1ydWxlXG4gICAgICogcm9vdC5hcHBlbmQoeyBzZWxlY3RvcjogJ2EnIH0pOyAgICAgICAgICAgICAgICAgICAgICAgLy8gcnVsZVxuICAgICAqIHJ1bGUuYXBwZW5kKHsgcHJvcDogJ2NvbG9yJywgdmFsdWU6ICdibGFjaycgfSk7ICAgICAgIC8vIGRlY2xhcmF0aW9uXG4gICAgICogcnVsZS5hcHBlbmQoeyB0ZXh0OiAnQ29tbWVudCcgfSkgICAgICAgICAgICAgICAgICAgICAgLy8gY29tbWVudFxuICAgICAqXG4gICAgICogcm9vdC5hcHBlbmQoJ2Ege30nKTtcbiAgICAgKiByb290LmZpcnN0LmFwcGVuZCgnY29sb3I6IGJsYWNrOyB6LWluZGV4OiAxJyk7XG4gICAgICovXG4gICAgYXBwZW5kKC4uLmNoaWxkcmVuKSB7XG4gICAgICAgIGZvciAoIGxldCBjaGlsZCBvZiBjaGlsZHJlbiApIHtcbiAgICAgICAgICAgIGxldCBub2RlcyA9IHRoaXMubm9ybWFsaXplKGNoaWxkLCB0aGlzLmxhc3QpO1xuICAgICAgICAgICAgZm9yICggbGV0IG5vZGUgb2Ygbm9kZXMgKSB0aGlzLm5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBuZXcgbm9kZXMgdG8gdGhlIGVuZCBvZiB0aGUgY29udGFpbmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHsuLi4oTm9kZXxvYmplY3R8c3RyaW5nfE5vZGVbXSl9IGNoaWxkcmVuIC0gbmV3IG5vZGVzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOb2RlfSB0aGlzIG5vZGUgZm9yIG1ldGhvZHMgY2hhaW5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZGVjbDEgPSBwb3N0Y3NzLmRlY2woeyBwcm9wOiAnY29sb3InLCB2YWx1ZTogJ2JsYWNrJyB9KTtcbiAgICAgKiBjb25zdCBkZWNsMiA9IHBvc3Rjc3MuZGVjbCh7IHByb3A6ICdiYWNrZ3JvdW5kLWNvbG9yJywgdmFsdWU6ICd3aGl0ZScgfSk7XG4gICAgICogcnVsZS5wcmVwZW5kKGRlY2wxLCBkZWNsMik7XG4gICAgICpcbiAgICAgKiByb290LmFwcGVuZCh7IG5hbWU6ICdjaGFyc2V0JywgcGFyYW1zOiAnXCJVVEYtOFwiJyB9KTsgIC8vIGF0LXJ1bGVcbiAgICAgKiByb290LmFwcGVuZCh7IHNlbGVjdG9yOiAnYScgfSk7ICAgICAgICAgICAgICAgICAgICAgICAvLyBydWxlXG4gICAgICogcnVsZS5hcHBlbmQoeyBwcm9wOiAnY29sb3InLCB2YWx1ZTogJ2JsYWNrJyB9KTsgICAgICAgLy8gZGVjbGFyYXRpb25cbiAgICAgKiBydWxlLmFwcGVuZCh7IHRleHQ6ICdDb21tZW50JyB9KSAgICAgICAgICAgICAgICAgICAgICAvLyBjb21tZW50XG4gICAgICpcbiAgICAgKiByb290LmFwcGVuZCgnYSB7fScpO1xuICAgICAqIHJvb3QuZmlyc3QuYXBwZW5kKCdjb2xvcjogYmxhY2s7IHotaW5kZXg6IDEnKTtcbiAgICAgKi9cbiAgICBwcmVwZW5kKC4uLmNoaWxkcmVuKSB7XG4gICAgICAgIGNoaWxkcmVuID0gY2hpbGRyZW4ucmV2ZXJzZSgpO1xuICAgICAgICBmb3IgKCBsZXQgY2hpbGQgb2YgY2hpbGRyZW4gKSB7XG4gICAgICAgICAgICBsZXQgbm9kZXMgPSB0aGlzLm5vcm1hbGl6ZShjaGlsZCwgdGhpcy5maXJzdCwgJ3ByZXBlbmQnKS5yZXZlcnNlKCk7XG4gICAgICAgICAgICBmb3IgKCBsZXQgbm9kZSBvZiBub2RlcyApIHRoaXMubm9kZXMudW5zaGlmdChub2RlKTtcbiAgICAgICAgICAgIGZvciAoIGxldCBpZCBpbiB0aGlzLmluZGV4ZXMgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleGVzW2lkXSA9IHRoaXMuaW5kZXhlc1tpZF0gKyBub2Rlcy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY2xlYW5SYXdzKGtlZXBCZXR3ZWVuKSB7XG4gICAgICAgIHN1cGVyLmNsZWFuUmF3cyhrZWVwQmV0d2Vlbik7XG4gICAgICAgIGlmICggdGhpcy5ub2RlcyApIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBub2RlIG9mIHRoaXMubm9kZXMgKSBub2RlLmNsZWFuUmF3cyhrZWVwQmV0d2Vlbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnNlcnQgbmV3IG5vZGUgYmVmb3JlIG9sZCBub2RlIHdpdGhpbiB0aGUgY29udGFpbmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtOb2RlfG51bWJlcn0gZXhpc3QgICAgICAgICAgICAgLSBjaGlsZCBvciBjaGlsZOKAmXMgaW5kZXguXG4gICAgICogQHBhcmFtIHtOb2RlfG9iamVjdHxzdHJpbmd8Tm9kZVtdfSBhZGQgLSBuZXcgbm9kZVxuICAgICAqXG4gICAgICogQHJldHVybiB7Tm9kZX0gdGhpcyBub2RlIGZvciBtZXRob2RzIGNoYWluXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHJ1bGUuaW5zZXJ0QmVmb3JlKGRlY2wsIGRlY2wuY2xvbmUoeyBwcm9wOiAnLXdlYmtpdC0nICsgZGVjbC5wcm9wIH0pKTtcbiAgICAgKi9cbiAgICBpbnNlcnRCZWZvcmUoZXhpc3QsIGFkZCkge1xuICAgICAgICBleGlzdCA9IHRoaXMuaW5kZXgoZXhpc3QpO1xuXG4gICAgICAgIGxldCB0eXBlICA9IGV4aXN0ID09PSAwID8gJ3ByZXBlbmQnIDogZmFsc2U7XG4gICAgICAgIGxldCBub2RlcyA9IHRoaXMubm9ybWFsaXplKGFkZCwgdGhpcy5ub2Rlc1tleGlzdF0sIHR5cGUpLnJldmVyc2UoKTtcbiAgICAgICAgZm9yICggbGV0IG5vZGUgb2Ygbm9kZXMgKSB0aGlzLm5vZGVzLnNwbGljZShleGlzdCwgMCwgbm9kZSk7XG5cbiAgICAgICAgbGV0IGluZGV4O1xuICAgICAgICBmb3IgKCBsZXQgaWQgaW4gdGhpcy5pbmRleGVzICkge1xuICAgICAgICAgICAgaW5kZXggPSB0aGlzLmluZGV4ZXNbaWRdO1xuICAgICAgICAgICAgaWYgKCBleGlzdCA8PSBpbmRleCApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4ZXNbaWRdID0gaW5kZXggKyBub2Rlcy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnNlcnQgbmV3IG5vZGUgYWZ0ZXIgb2xkIG5vZGUgd2l0aGluIHRoZSBjb250YWluZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge05vZGV8bnVtYmVyfSBleGlzdCAgICAgICAgICAgICAtIGNoaWxkIG9yIGNoaWxk4oCZcyBpbmRleFxuICAgICAqIEBwYXJhbSB7Tm9kZXxvYmplY3R8c3RyaW5nfE5vZGVbXX0gYWRkIC0gbmV3IG5vZGVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge05vZGV9IHRoaXMgbm9kZSBmb3IgbWV0aG9kcyBjaGFpblxuICAgICAqL1xuICAgIGluc2VydEFmdGVyKGV4aXN0LCBhZGQpIHtcbiAgICAgICAgZXhpc3QgPSB0aGlzLmluZGV4KGV4aXN0KTtcblxuICAgICAgICBsZXQgbm9kZXMgPSB0aGlzLm5vcm1hbGl6ZShhZGQsIHRoaXMubm9kZXNbZXhpc3RdKS5yZXZlcnNlKCk7XG4gICAgICAgIGZvciAoIGxldCBub2RlIG9mIG5vZGVzICkgdGhpcy5ub2Rlcy5zcGxpY2UoZXhpc3QgKyAxLCAwLCBub2RlKTtcblxuICAgICAgICBsZXQgaW5kZXg7XG4gICAgICAgIGZvciAoIGxldCBpZCBpbiB0aGlzLmluZGV4ZXMgKSB7XG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuaW5kZXhlc1tpZF07XG4gICAgICAgICAgICBpZiAoIGV4aXN0IDwgaW5kZXggKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleGVzW2lkXSA9IGluZGV4ICsgbm9kZXMubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVtb3ZlKGNoaWxkKSB7XG4gICAgICAgIGlmICggdHlwZW9mIGNoaWxkICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgIHdhcm5PbmNlKCdDb250YWluZXIjcmVtb3ZlIGlzIGRlcHJlY2F0ZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgJ1VzZSBDb250YWluZXIjcmVtb3ZlQ2hpbGQnKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQoY2hpbGQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBub2RlIGZyb20gdGhlIGNvbnRhaW5lciBhbmQgY2xlYW5zIHRoZSBwYXJlbnQgcHJvcGVydGllc1xuICAgICAqIGZyb20gdGhlIG5vZGUgYW5kIGl0cyBjaGlsZHJlbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Tm9kZXxudW1iZXJ9IGNoaWxkIC0gY2hpbGQgb3IgY2hpbGTigJlzIGluZGV4XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOb2RlfSB0aGlzIG5vZGUgZm9yIG1ldGhvZHMgY2hhaW5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogcnVsZS5ub2Rlcy5sZW5ndGggIC8vPT4gNVxuICAgICAqIHJ1bGUucmVtb3ZlQ2hpbGQoZGVjbCk7XG4gICAgICogcnVsZS5ub2Rlcy5sZW5ndGggIC8vPT4gNFxuICAgICAqIGRlY2wucGFyZW50ICAgICAgICAvLz0+IHVuZGVmaW5lZFxuICAgICAqL1xuICAgIHJlbW92ZUNoaWxkKGNoaWxkKSB7XG4gICAgICAgIGNoaWxkID0gdGhpcy5pbmRleChjaGlsZCk7XG4gICAgICAgIHRoaXMubm9kZXNbY2hpbGRdLnBhcmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5ub2Rlcy5zcGxpY2UoY2hpbGQsIDEpO1xuXG4gICAgICAgIGxldCBpbmRleDtcbiAgICAgICAgZm9yICggbGV0IGlkIGluIHRoaXMuaW5kZXhlcyApIHtcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5pbmRleGVzW2lkXTtcbiAgICAgICAgICAgIGlmICggaW5kZXggPj0gY2hpbGQgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleGVzW2lkXSA9IGluZGV4IC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGNoaWxkcmVuIGZyb20gdGhlIGNvbnRhaW5lclxuICAgICAqIGFuZCBjbGVhbnMgdGhlaXIgcGFyZW50IHByb3BlcnRpZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOb2RlfSB0aGlzIG5vZGUgZm9yIG1ldGhvZHMgY2hhaW5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogcnVsZS5yZW1vdmVBbGwoKTtcbiAgICAgKiBydWxlLm5vZGVzLmxlbmd0aCAvLz0+IDBcbiAgICAgKi9cbiAgICByZW1vdmVBbGwoKSB7XG4gICAgICAgIGZvciAoIGxldCBub2RlIG9mIHRoaXMubm9kZXMgKSBub2RlLnBhcmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5ub2RlcyA9IFtdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYXNzZXMgYWxsIGRlY2xhcmF0aW9uIHZhbHVlcyB3aXRoaW4gdGhlIGNvbnRhaW5lciB0aGF0IG1hdGNoIHBhdHRlcm5cbiAgICAgKiB0aHJvdWdoIGNhbGxiYWNrLCByZXBsYWNpbmcgdGhvc2UgdmFsdWVzIHdpdGggdGhlIHJldHVybmVkIHJlc3VsdFxuICAgICAqIG9mIGNhbGxiYWNrLlxuICAgICAqXG4gICAgICogVGhpcyBtZXRob2QgaXMgdXNlZnVsIGlmIHlvdSBhcmUgdXNpbmcgYSBjdXN0b20gdW5pdCBvciBmdW5jdGlvblxuICAgICAqIGFuZCBuZWVkIHRvIGl0ZXJhdGUgdGhyb3VnaCBhbGwgdmFsdWVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd8UmVnRXhwfSBwYXR0ZXJuICAgICAgLSByZXBsYWNlIHBhdHRlcm5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0cyAgICAgICAgICAgICAgICAtIG9wdGlvbnMgdG8gc3BlZWQgdXAgdGhlIHNlYXJjaFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfHN0cmluZ1tdfSBvcHRzLnByb3BzIC0gYW4gYXJyYXkgb2YgcHJvcGVydHkgbmFtZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb3B0cy5mYXN0ICAgICAgICAgICAtIHN0cmluZyB0aGF04oCZcyB1c2VkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byBuYXJyb3cgZG93biB2YWx1ZXMgYW5kIHNwZWVkIHVwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgcmVnZXhwIHNlYXJjaFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb258c3RyaW5nfSBjYWxsYmFjayAgIC0gc3RyaW5nIHRvIHJlcGxhY2UgcGF0dGVyblxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3IgY2FsbGJhY2sgdGhhdCByZXR1cm5zIGEgbmV3XG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBjYWxsYmFjayB3aWxsIHJlY2VpdmVcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyB0aG9zZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFzc2VkIHRvIGEgZnVuY3Rpb24gcGFyYW1ldGVyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZiBgU3RyaW5nI3JlcGxhY2VgLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Tm9kZX0gdGhpcyBub2RlIGZvciBtZXRob2RzIGNoYWluXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHJvb3QucmVwbGFjZVZhbHVlcygvXFxkK3JlbS8sIHsgZmFzdDogJ3JlbScgfSwgc3RyaW5nID0+IHtcbiAgICAgKiAgIHJldHVybiAxNSAqIHBhcnNlSW50KHN0cmluZykgKyAncHgnO1xuICAgICAqIH0pO1xuICAgICAqL1xuICAgIHJlcGxhY2VWYWx1ZXMocGF0dGVybiwgb3B0cywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdHM7XG4gICAgICAgICAgICBvcHRzID0geyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53YWxrRGVjbHMoIGRlY2wgPT4ge1xuICAgICAgICAgICAgaWYgKCBvcHRzLnByb3BzICYmIG9wdHMucHJvcHMuaW5kZXhPZihkZWNsLnByb3ApID09PSAtMSApIHJldHVybjtcbiAgICAgICAgICAgIGlmICggb3B0cy5mYXN0ICAmJiBkZWNsLnZhbHVlLmluZGV4T2Yob3B0cy5mYXN0KSA9PT0gLTEgKSByZXR1cm47XG5cbiAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UocGF0dGVybiwgY2FsbGJhY2spO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBjYWxsYmFjayByZXR1cm5zIGB0cnVlYFxuICAgICAqIGZvciBhbGwgb2YgdGhlIGNvbnRhaW5lcuKAmXMgY2hpbGRyZW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2NoaWxkQ29uZGl0aW9ufSBjb25kaXRpb24gLSBpdGVyYXRvciByZXR1cm5zIHRydWUgb3IgZmFsc2UuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBpcyBldmVyeSBjaGlsZCBwYXNzIGNvbmRpdGlvblxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBub1ByZWZpeGVzID0gcnVsZS5ldmVyeShpID0+IGkucHJvcFswXSAhPT0gJy0nKTtcbiAgICAgKi9cbiAgICBldmVyeShjb25kaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZXMuZXZlcnkoY29uZGl0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBjYWxsYmFjayByZXR1cm5zIGB0cnVlYCBmb3IgKGF0IGxlYXN0KSBvbmVcbiAgICAgKiBvZiB0aGUgY29udGFpbmVy4oCZcyBjaGlsZHJlbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Y2hpbGRDb25kaXRpb259IGNvbmRpdGlvbiAtIGl0ZXJhdG9yIHJldHVybnMgdHJ1ZSBvciBmYWxzZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IGlzIHNvbWUgY2hpbGQgcGFzcyBjb25kaXRpb25cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgaGFzUHJlZml4ID0gcnVsZS5zb21lKGkgPT4gaS5wcm9wWzBdID09PSAnLScpO1xuICAgICAqL1xuICAgIHNvbWUoY29uZGl0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVzLnNvbWUoY29uZGl0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgYGNoaWxkYOKAmXMgaW5kZXggd2l0aGluIHRoZSB7QGxpbmsgQ29udGFpbmVyI25vZGVzfSBhcnJheS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Tm9kZX0gY2hpbGQgLSBjaGlsZCBvZiB0aGUgY3VycmVudCBjb250YWluZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IGNoaWxkIGluZGV4XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHJ1bGUuaW5kZXgoIHJ1bGUubm9kZXNbMl0gKSAvLz0+IDJcbiAgICAgKi9cbiAgICBpbmRleChjaGlsZCkge1xuICAgICAgICBpZiAoIHR5cGVvZiBjaGlsZCA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ub2Rlcy5pbmRleE9mKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBjb250YWluZXLigJlzIGZpcnN0IGNoaWxkLlxuICAgICAqXG4gICAgICogQHR5cGUge05vZGV9XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHJ1bGUuZmlyc3QgPT0gcnVsZXMubm9kZXNbMF07XG4gICAgICovXG4gICAgZ2V0IGZpcnN0KCkge1xuICAgICAgICBpZiAoICF0aGlzLm5vZGVzICkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZXNbMF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbnRhaW5lcuKAmXMgbGFzdCBjaGlsZC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOb2RlfVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBydWxlLmxhc3QgPT0gcnVsZS5ub2Rlc1tydWxlLm5vZGVzLmxlbmd0aCAtIDFdO1xuICAgICAqL1xuICAgIGdldCBsYXN0KCkge1xuICAgICAgICBpZiAoICF0aGlzLm5vZGVzICkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZXNbdGhpcy5ub2Rlcy5sZW5ndGggLSAxXTtcbiAgICB9XG5cbiAgICBub3JtYWxpemUobm9kZXMsIHNhbXBsZSkge1xuICAgICAgICBpZiAoIHR5cGVvZiBub2RlcyA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBsZXQgcGFyc2UgPSByZXF1aXJlKCcuL3BhcnNlJyk7XG4gICAgICAgICAgICBub2RlcyA9IGNsZWFuU291cmNlKHBhcnNlKG5vZGVzKS5ub2Rlcyk7XG4gICAgICAgIH0gZWxzZSBpZiAoICFBcnJheS5pc0FycmF5KG5vZGVzKSApIHtcbiAgICAgICAgICAgIGlmICggbm9kZXMudHlwZSA9PT0gJ3Jvb3QnICkge1xuICAgICAgICAgICAgICAgIG5vZGVzID0gbm9kZXMubm9kZXM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBub2Rlcy50eXBlICkge1xuICAgICAgICAgICAgICAgIG5vZGVzID0gW25vZGVzXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIG5vZGVzLnByb3AgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCB0eXBlb2Ygbm9kZXMudmFsdWUgPT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIGZpZWxkIGlzIG1pc3NlZCBpbiBub2RlIGNyZWF0aW9uJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mIG5vZGVzLnZhbHVlICE9PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMudmFsdWUgPSBTdHJpbmcobm9kZXMudmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBub2RlcyA9IFtuZXcgRGVjbGFyYXRpb24obm9kZXMpXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIG5vZGVzLnNlbGVjdG9yICkge1xuICAgICAgICAgICAgICAgIGxldCBSdWxlID0gcmVxdWlyZSgnLi9ydWxlJyk7XG4gICAgICAgICAgICAgICAgbm9kZXMgPSBbbmV3IFJ1bGUobm9kZXMpXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIG5vZGVzLm5hbWUgKSB7XG4gICAgICAgICAgICAgICAgbGV0IEF0UnVsZSA9IHJlcXVpcmUoJy4vYXQtcnVsZScpO1xuICAgICAgICAgICAgICAgIG5vZGVzID0gW25ldyBBdFJ1bGUobm9kZXMpXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIG5vZGVzLnRleHQgKSB7XG4gICAgICAgICAgICAgICAgbm9kZXMgPSBbbmV3IENvbW1lbnQobm9kZXMpXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIG5vZGUgdHlwZSBpbiBub2RlIGNyZWF0aW9uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcHJvY2Vzc2VkID0gbm9kZXMubWFwKCBpID0+IHtcbiAgICAgICAgICAgIGlmICggdHlwZW9mIGkucmF3cyA9PT0gJ3VuZGVmaW5lZCcgKSBpID0gdGhpcy5yZWJ1aWxkKGkpO1xuXG4gICAgICAgICAgICBpZiAoIGkucGFyZW50ICkgaSA9IGkuY2xvbmUoKTtcbiAgICAgICAgICAgIGlmICggdHlwZW9mIGkucmF3cy5iZWZvcmUgPT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICAgICAgICAgIGlmICggc2FtcGxlICYmIHR5cGVvZiBzYW1wbGUucmF3cy5iZWZvcmUgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICAgICAgICAgICAgICBpLnJhd3MuYmVmb3JlID0gc2FtcGxlLnJhd3MuYmVmb3JlLnJlcGxhY2UoL1teXFxzXS9nLCAnJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaS5wYXJlbnQgPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBwcm9jZXNzZWQ7XG4gICAgfVxuXG4gICAgcmVidWlsZChub2RlLCBwYXJlbnQpIHtcbiAgICAgICAgbGV0IGZpeDtcbiAgICAgICAgaWYgKCBub2RlLnR5cGUgPT09ICdyb290JyApIHtcbiAgICAgICAgICAgIGxldCBSb290ID0gcmVxdWlyZSgnLi9yb290Jyk7XG4gICAgICAgICAgICBmaXggPSBuZXcgUm9vdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKCBub2RlLnR5cGUgPT09ICdhdHJ1bGUnICkge1xuICAgICAgICAgICAgbGV0IEF0UnVsZSA9IHJlcXVpcmUoJy4vYXQtcnVsZScpO1xuICAgICAgICAgICAgZml4ID0gbmV3IEF0UnVsZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKCBub2RlLnR5cGUgPT09ICdydWxlJyApIHtcbiAgICAgICAgICAgIGxldCBSdWxlID0gcmVxdWlyZSgnLi9ydWxlJyk7XG4gICAgICAgICAgICBmaXggPSBuZXcgUnVsZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKCBub2RlLnR5cGUgPT09ICdkZWNsJyApIHtcbiAgICAgICAgICAgIGZpeCA9IG5ldyBEZWNsYXJhdGlvbigpO1xuICAgICAgICB9IGVsc2UgaWYgKCBub2RlLnR5cGUgPT09ICdjb21tZW50JyApIHtcbiAgICAgICAgICAgIGZpeCA9IG5ldyBDb21tZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKCBsZXQgaSBpbiBub2RlICkge1xuICAgICAgICAgICAgaWYgKCBpID09PSAnbm9kZXMnICkge1xuICAgICAgICAgICAgICAgIGZpeC5ub2RlcyA9IG5vZGUubm9kZXMubWFwKCBqID0+IHRoaXMucmVidWlsZChqLCBmaXgpICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBpID09PSAncGFyZW50JyAmJiBwYXJlbnQgKSB7XG4gICAgICAgICAgICAgICAgZml4LnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIG5vZGUuaGFzT3duUHJvcGVydHkoaSkgKSB7XG4gICAgICAgICAgICAgICAgZml4W2ldID0gbm9kZVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaXg7XG4gICAgfVxuXG4gICAgZWFjaEluc2lkZShjYWxsYmFjaykge1xuICAgICAgICB3YXJuT25jZSgnQ29udGFpbmVyI2VhY2hJbnNpZGUgaXMgZGVwcmVjYXRlZC4gJyArXG4gICAgICAgICAgICAgICAgICdVc2UgQ29udGFpbmVyI3dhbGsgaW5zdGVhZC4nKTtcbiAgICAgICAgcmV0dXJuIHRoaXMud2FsayhjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZWFjaERlY2wocHJvcCwgY2FsbGJhY2spIHtcbiAgICAgICAgd2Fybk9uY2UoJ0NvbnRhaW5lciNlYWNoRGVjbCBpcyBkZXByZWNhdGVkLiAnICtcbiAgICAgICAgICAgICAgICAgJ1VzZSBDb250YWluZXIjd2Fsa0RlY2xzIGluc3RlYWQuJyk7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGtEZWNscyhwcm9wLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgZWFjaFJ1bGUoc2VsZWN0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHdhcm5PbmNlKCdDb250YWluZXIjZWFjaFJ1bGUgaXMgZGVwcmVjYXRlZC4gJyArXG4gICAgICAgICAgICAgICAgICdVc2UgQ29udGFpbmVyI3dhbGtSdWxlcyBpbnN0ZWFkLicpO1xuICAgICAgICByZXR1cm4gdGhpcy53YWxrUnVsZXMoc2VsZWN0b3IsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBlYWNoQXRSdWxlKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHdhcm5PbmNlKCdDb250YWluZXIjZWFjaEF0UnVsZSBpcyBkZXByZWNhdGVkLiAnICtcbiAgICAgICAgICAgICAgICAgJ1VzZSBDb250YWluZXIjd2Fsa0F0UnVsZXMgaW5zdGVhZC4nKTtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa0F0UnVsZXMobmFtZSwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGVhY2hDb21tZW50KGNhbGxiYWNrKSB7XG4gICAgICAgIHdhcm5PbmNlKCdDb250YWluZXIjZWFjaENvbW1lbnQgaXMgZGVwcmVjYXRlZC4gJyArXG4gICAgICAgICAgICAgICAgICdVc2UgQ29udGFpbmVyI3dhbGtDb21tZW50cyBpbnN0ZWFkLicpO1xuICAgICAgICByZXR1cm4gdGhpcy53YWxrQ29tbWVudHMoY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGdldCBzZW1pY29sb24oKSB7XG4gICAgICAgIHdhcm5PbmNlKCdOb2RlI3NlbWljb2xvbiBpcyBkZXByZWNhdGVkLiBVc2UgTm9kZSNyYXdzLnNlbWljb2xvbicpO1xuICAgICAgICByZXR1cm4gdGhpcy5yYXdzLnNlbWljb2xvbjtcbiAgICB9XG5cbiAgICBzZXQgc2VtaWNvbG9uKHZhbCkge1xuICAgICAgICB3YXJuT25jZSgnTm9kZSNzZW1pY29sb24gaXMgZGVwcmVjYXRlZC4gVXNlIE5vZGUjcmF3cy5zZW1pY29sb24nKTtcbiAgICAgICAgdGhpcy5yYXdzLnNlbWljb2xvbiA9IHZhbDtcbiAgICB9XG5cbiAgICBnZXQgYWZ0ZXIoKSB7XG4gICAgICAgIHdhcm5PbmNlKCdOb2RlI2FmdGVyIGlzIGRlcHJlY2F0ZWQuIFVzZSBOb2RlI3Jhd3MuYWZ0ZXInKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmF3cy5hZnRlcjtcbiAgICB9XG5cbiAgICBzZXQgYWZ0ZXIodmFsKSB7XG4gICAgICAgIHdhcm5PbmNlKCdOb2RlI2FmdGVyIGlzIGRlcHJlY2F0ZWQuIFVzZSBOb2RlI3Jhd3MuYWZ0ZXInKTtcbiAgICAgICAgdGhpcy5yYXdzLmFmdGVyID0gdmFsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBDb250YWluZXIjXG4gICAgICogQG1lbWJlciB7Tm9kZVtdfSBub2RlcyAtIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIGNvbnRhaW5lcuKAmXMgY2hpbGRyZW5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3Qgcm9vdCA9IHBvc3Rjc3MucGFyc2UoJ2EgeyBjb2xvcjogYmxhY2sgfScpO1xuICAgICAqIHJvb3Qubm9kZXMubGVuZ3RoICAgICAgICAgICAvLz0+IDFcbiAgICAgKiByb290Lm5vZGVzWzBdLnNlbGVjdG9yICAgICAgLy89PiAnYSdcbiAgICAgKiByb290Lm5vZGVzWzBdLm5vZGVzWzBdLnByb3AgLy89PiAnY29sb3InXG4gICAgICovXG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29udGFpbmVyO1xuXG5cbi8qKlxuICogQGNhbGxiYWNrIGNoaWxkQ29uZGl0aW9uXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgICAgLSBjb250YWluZXIgY2hpbGRcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCAtIGNoaWxkIGluZGV4XG4gKiBAcGFyYW0ge05vZGVbXX0gbm9kZXMgLSBhbGwgY29udGFpbmVyIGNoaWxkcmVuXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5cbi8qKlxuICogQGNhbGxiYWNrIGNoaWxkSXRlcmF0b3JcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZSAgICAtIGNvbnRhaW5lciBjaGlsZFxuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gY2hpbGQgaW5kZXhcbiAqIEByZXR1cm4ge2ZhbHNlfHVuZGVmaW5lZH0gcmV0dXJuaW5nIGBmYWxzZWAgd2lsbCBicmVhayBpdGVyYXRpb25cbiAqL1xuIiwiaW1wb3J0IHN1cHBvcnRzQ29sb3IgZnJvbSAnc3VwcG9ydHMtY29sb3InO1xuaW1wb3J0IGNoYWxrICAgICAgICAgZnJvbSAnY2hhbGsnO1xuXG5pbXBvcnQgdGVybWluYWxIaWdobGlnaHQgZnJvbSAnLi90ZXJtaW5hbC1oaWdobGlnaHQnO1xuaW1wb3J0IHdhcm5PbmNlICAgICAgICAgIGZyb20gJy4vd2Fybi1vbmNlJztcblxuLyoqXG4gKiBUaGUgQ1NTIHBhcnNlciB0aHJvd3MgdGhpcyBlcnJvciBmb3IgYnJva2VuIENTUy5cbiAqXG4gKiBDdXN0b20gcGFyc2VycyBjYW4gdGhyb3cgdGhpcyBlcnJvciBmb3IgYnJva2VuIGN1c3RvbSBzeW50YXggdXNpbmdcbiAqIHRoZSB7QGxpbmsgTm9kZSNlcnJvcn0gbWV0aG9kLlxuICpcbiAqIFBvc3RDU1Mgd2lsbCB1c2UgdGhlIGlucHV0IHNvdXJjZSBtYXAgdG8gZGV0ZWN0IHRoZSBvcmlnaW5hbCBlcnJvciBsb2NhdGlvbi5cbiAqIElmIHlvdSB3cm90ZSBhIFNhc3MgZmlsZSwgY29tcGlsZWQgaXQgdG8gQ1NTIGFuZCB0aGVuIHBhcnNlZCBpdCB3aXRoIFBvc3RDU1MsXG4gKiBQb3N0Q1NTIHdpbGwgc2hvdyB0aGUgb3JpZ2luYWwgcG9zaXRpb24gaW4gdGhlIFNhc3MgZmlsZS5cbiAqXG4gKiBJZiB5b3UgbmVlZCB0aGUgcG9zaXRpb24gaW4gdGhlIFBvc3RDU1MgaW5wdXRcbiAqIChlLmcuLCB0byBkZWJ1ZyB0aGUgcHJldmlvdXMgY29tcGlsZXIpLCB1c2UgYGVycm9yLmlucHV0LmZpbGVgLlxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBDYXRjaGluZyBhbmQgY2hlY2tpbmcgc3ludGF4IGVycm9yXG4gKiB0cnkge1xuICogICBwb3N0Y3NzLnBhcnNlKCdheycpXG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoIGVycm9yLm5hbWUgPT09ICdDc3NTeW50YXhFcnJvcicgKSB7XG4gKiAgICAgZXJyb3IgLy89PiBDc3NTeW50YXhFcnJvclxuICogICB9XG4gKiB9XG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIFJhaXNpbmcgZXJyb3IgZnJvbSBwbHVnaW5cbiAqIHRocm93IG5vZGUuZXJyb3IoJ1Vua25vd24gdmFyaWFibGUnLCB7IHBsdWdpbjogJ3Bvc3Rjc3MtdmFycycgfSk7XG4gKi9cbmNsYXNzIENzc1N5bnRheEVycm9yIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlICAtIGVycm9yIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2xpbmVdICAgLSBzb3VyY2UgbGluZSBvZiB0aGUgZXJyb3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2NvbHVtbl0gLSBzb3VyY2UgY29sdW1uIG9mIHRoZSBlcnJvclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc291cmNlXSAtIHNvdXJjZSBjb2RlIG9mIHRoZSBicm9rZW4gZmlsZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbZmlsZV0gICAtIGFic29sdXRlIHBhdGggdG8gdGhlIGJyb2tlbiBmaWxlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtwbHVnaW5dIC0gUG9zdENTUyBwbHVnaW4gbmFtZSwgaWYgZXJyb3IgY2FtZSBmcm9tIHBsdWdpblxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIGxpbmUsIGNvbHVtbiwgc291cmNlLCBmaWxlLCBwbHVnaW4pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge3N0cmluZ30gLSBBbHdheXMgZXF1YWwgdG8gYCdDc3NTeW50YXhFcnJvcidgLiBZb3Ugc2hvdWxkXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICBhbHdheXMgY2hlY2sgZXJyb3IgdHlwZVxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgYnkgYGVycm9yLm5hbWUgPT09ICdDc3NTeW50YXhFcnJvcidgIGluc3RlYWQgb2ZcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgIGBlcnJvciBpbnN0YW5jZW9mIENzc1N5bnRheEVycm9yYCwgYmVjYXVzZVxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgbnBtIGNvdWxkIGhhdmUgc2V2ZXJhbCBQb3N0Q1NTIHZlcnNpb25zLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBpZiAoIGVycm9yLm5hbWUgPT09ICdDc3NTeW50YXhFcnJvcicgKSB7XG4gICAgICAgICAqICAgZXJyb3IgLy89PiBDc3NTeW50YXhFcnJvclxuICAgICAgICAgKiB9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm5hbWUgICA9ICdDc3NTeW50YXhFcnJvcic7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtzdHJpbmd9IC0gRXJyb3IgbWVzc2FnZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogZXJyb3IubWVzc2FnZSAvLz0+ICdVbmNsb3NlZCBibG9jaydcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVhc29uID0gbWVzc2FnZTtcblxuICAgICAgICBpZiAoIGZpbGUgKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXIge3N0cmluZ30gLSBBYnNvbHV0ZSBwYXRoIHRvIHRoZSBicm9rZW4gZmlsZS5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICogZXJyb3IuZmlsZSAgICAgICAvLz0+ICdhLnNhc3MnXG4gICAgICAgICAgICAgKiBlcnJvci5pbnB1dC5maWxlIC8vPT4gJ2EuY3NzJ1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmZpbGUgPSBmaWxlO1xuICAgICAgICB9XG4gICAgICAgIGlmICggc291cmNlICkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyIHtzdHJpbmd9IC0gU291cmNlIGNvZGUgb2YgdGhlIGJyb2tlbiBmaWxlLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgKiBlcnJvci5zb3VyY2UgICAgICAgLy89PiAnYSB7IGIge30gfSdcbiAgICAgICAgICAgICAqIGVycm9yLmlucHV0LmNvbHVtbiAvLz0+ICdhIGIgeyB9J1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHBsdWdpbiApIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlciB7c3RyaW5nfSAtIFBsdWdpbiBuYW1lLCBpZiBlcnJvciBjYW1lIGZyb20gcGx1Z2luLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgKiBlcnJvci5wbHVnaW4gLy89PiAncG9zdGNzcy12YXJzJ1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHR5cGVvZiBsaW5lICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29sdW1uICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlciB7bnVtYmVyfSAtIFNvdXJjZSBsaW5lIG9mIHRoZSBlcnJvci5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICogZXJyb3IubGluZSAgICAgICAvLz0+IDJcbiAgICAgICAgICAgICAqIGVycm9yLmlucHV0LmxpbmUgLy89PiA0XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMubGluZSAgID0gbGluZTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlciB7bnVtYmVyfSAtIFNvdXJjZSBjb2x1bW4gb2YgdGhlIGVycm9yLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgKiBlcnJvci5jb2x1bW4gICAgICAgLy89PiAxXG4gICAgICAgICAgICAgKiBlcnJvci5pbnB1dC5jb2x1bW4gLy89PiA0XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRNZXNzYWdlKCk7XG5cbiAgICAgICAgaWYgKCBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSApIHtcbiAgICAgICAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIENzc1N5bnRheEVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldE1lc3NhZ2UoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtzdHJpbmd9IC0gRnVsbCBlcnJvciB0ZXh0IGluIHRoZSBHTlUgZXJyb3IgZm9ybWF0XG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICB3aXRoIHBsdWdpbiwgZmlsZSwgbGluZSBhbmQgY29sdW1uLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBlcnJvci5tZXNzYWdlIC8vPT4gJ2EuY3NzOjE6MTogVW5jbG9zZWQgYmxvY2snXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm1lc3NhZ2UgID0gdGhpcy5wbHVnaW4gPyB0aGlzLnBsdWdpbiArICc6ICcgOiAnJztcbiAgICAgICAgdGhpcy5tZXNzYWdlICs9IHRoaXMuZmlsZSA/IHRoaXMuZmlsZSA6ICc8Y3NzIGlucHV0Pic7XG4gICAgICAgIGlmICggdHlwZW9mIHRoaXMubGluZSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UgKz0gJzonICsgdGhpcy5saW5lICsgJzonICsgdGhpcy5jb2x1bW47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tZXNzYWdlICs9ICc6ICcgKyB0aGlzLnJlYXNvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgZmV3IGxpbmVzIG9mIENTUyBzb3VyY2UgdGhhdCBjYXVzZWQgdGhlIGVycm9yLlxuICAgICAqXG4gICAgICogSWYgdGhlIENTUyBoYXMgYW4gaW5wdXQgc291cmNlIG1hcCB3aXRob3V0IGBzb3VyY2VDb250ZW50YCxcbiAgICAgKiB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiBhbiBlbXB0eSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjb2xvcl0gd2hldGhlciBhcnJvdyB3aWxsIGJlIGNvbG9yZWQgcmVkIGJ5IHRlcm1pbmFsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yIGNvZGVzLiBCeSBkZWZhdWx0LCBQb3N0Q1NTIHdpbGwgZGV0ZWN0XG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yIHN1cHBvcnQgYnkgYHByb2Nlc3Muc3Rkb3V0LmlzVFRZYFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICBhbmQgYHByb2Nlc3MuZW52Lk5PREVfRElTQUJMRV9DT0xPUlNgLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBlcnJvci5zaG93U291cmNlQ29kZSgpIC8vPT4gXCIgIDQgfCB9XG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgIDUgfCBhIHtcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgID4gNiB8ICAgYmFkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgfCAgIF5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgNyB8IH1cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgOCB8IGIge1wiXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IGZldyBsaW5lcyBvZiBDU1Mgc291cmNlIHRoYXQgY2F1c2VkIHRoZSBlcnJvclxuICAgICAqL1xuICAgIHNob3dTb3VyY2VDb2RlKGNvbG9yKSB7XG4gICAgICAgIGlmICggIXRoaXMuc291cmNlICkgcmV0dXJuICcnO1xuXG4gICAgICAgIGxldCBjc3MgPSB0aGlzLnNvdXJjZTtcbiAgICAgICAgaWYgKCB0eXBlb2YgY29sb3IgPT09ICd1bmRlZmluZWQnICkgY29sb3IgPSBzdXBwb3J0c0NvbG9yO1xuICAgICAgICBpZiAoIGNvbG9yICkgY3NzID0gdGVybWluYWxIaWdobGlnaHQoY3NzKTtcblxuICAgICAgICBsZXQgbGluZXMgPSBjc3Muc3BsaXQoL1xccj9cXG4vKTtcbiAgICAgICAgbGV0IHN0YXJ0ID0gTWF0aC5tYXgodGhpcy5saW5lIC0gMywgMCk7XG4gICAgICAgIGxldCBlbmQgICA9IE1hdGgubWluKHRoaXMubGluZSArIDIsIGxpbmVzLmxlbmd0aCk7XG5cbiAgICAgICAgbGV0IG1heFdpZHRoID0gU3RyaW5nKGVuZCkubGVuZ3RoO1xuICAgICAgICBsZXQgY29sb3JzID0gbmV3IGNoYWxrLmNvbnN0cnVjdG9yKHsgZW5hYmxlZDogdHJ1ZSB9KTtcblxuICAgICAgICBmdW5jdGlvbiBtYXJrKHRleHQpIHtcbiAgICAgICAgICAgIGlmICggY29sb3IgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9ycy5yZWQuYm9sZCh0ZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gYXNpZGUodGV4dCkge1xuICAgICAgICAgICAgaWYgKCBjb2xvciApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sb3JzLmdyYXkodGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpbmVzLnNsaWNlKHN0YXJ0LCBlbmQpLm1hcCggKGxpbmUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBsZXQgbnVtYmVyID0gc3RhcnQgKyAxICsgaW5kZXg7XG4gICAgICAgICAgICBsZXQgZ3V0dGVyID0gJyAnICsgKCcgJyArIG51bWJlcikuc2xpY2UoLW1heFdpZHRoKSArICcgfCAnO1xuICAgICAgICAgICAgaWYgKCBudW1iZXIgPT09IHRoaXMubGluZSApIHtcbiAgICAgICAgICAgICAgICBsZXQgc3BhY2luZyA9XG4gICAgICAgICAgICAgICAgICAgIGFzaWRlKGd1dHRlci5yZXBsYWNlKC9cXGQvZywgJyAnKSkgK1xuICAgICAgICAgICAgICAgICAgICBsaW5lLnNsaWNlKDAsIHRoaXMuY29sdW1uIC0gMSkucmVwbGFjZSgvW15cXHRdL2csICcgJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcmsoJz4nKSArIGFzaWRlKGd1dHRlcikgKyBsaW5lICsgJ1xcbiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgc3BhY2luZyArIG1hcmsoJ14nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcgJyArIGFzaWRlKGd1dHRlcikgKyBsaW5lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGVycm9yIHBvc2l0aW9uLCBtZXNzYWdlIGFuZCBzb3VyY2UgY29kZSBvZiB0aGUgYnJva2VuIHBhcnQuXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGVycm9yLnRvU3RyaW5nKCkgLy89PiBcIkNzc1N5bnRheEVycm9yOiBhcHAuY3NzOjE6MTogVW5jbG9zZWQgYmxvY2tcbiAgICAgKiAgICAgICAgICAgICAgICAgIC8vICAgID4gMSB8IGEge1xuICAgICAqICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHwgXlwiXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IGVycm9yIHBvc2l0aW9uLCBtZXNzYWdlIGFuZCBzb3VyY2UgY29kZVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBsZXQgY29kZSA9IHRoaXMuc2hvd1NvdXJjZUNvZGUoKTtcbiAgICAgICAgaWYgKCBjb2RlICkge1xuICAgICAgICAgICAgY29kZSA9ICdcXG5cXG4nICsgY29kZSArICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWUgKyAnOiAnICsgdGhpcy5tZXNzYWdlICsgY29kZTtcbiAgICB9XG5cbiAgICBnZXQgZ2VuZXJhdGVkKCkge1xuICAgICAgICB3YXJuT25jZSgnQ3NzU3ludGF4RXJyb3IjZ2VuZXJhdGVkIGlzIGRlcHJlYWN0ZWQuIFVzZSBpbnB1dCBpbnN0ZWFkLicpO1xuICAgICAgICByZXR1cm4gdGhpcy5pbnB1dDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgQ3NzU3ludGF4RXJyb3IjXG4gICAgICogQG1lbWJlciB7SW5wdXR9IGlucHV0IC0gSW5wdXQgb2JqZWN0IHdpdGggUG9zdENTUyBpbnRlcm5hbCBpbmZvcm1hdGlvblxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0IGlucHV0IGZpbGUuIElmIGlucHV0IGhhcyBzb3VyY2UgbWFwXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBwcmV2aW91cyB0b29sLCBQb3N0Q1NTIHdpbGwgdXNlIG9yaWdpblxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgIChmb3IgZXhhbXBsZSwgU2Fzcykgc291cmNlLiBZb3UgY2FuIHVzZSB0aGlzXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0IHRvIGdldCBQb3N0Q1NTIGlucHV0IHNvdXJjZS5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogZXJyb3IuaW5wdXQuZmlsZSAvLz0+ICdhLmNzcydcbiAgICAgKiBlcnJvci5maWxlICAgICAgIC8vPT4gJ2Euc2FzcydcbiAgICAgKi9cblxufVxuXG5leHBvcnQgZGVmYXVsdCBDc3NTeW50YXhFcnJvcjtcbiIsImltcG9ydCB3YXJuT25jZSBmcm9tICcuL3dhcm4tb25jZSc7XG5pbXBvcnQgTm9kZSAgICAgZnJvbSAnLi9ub2RlJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgQ1NTIGRlY2xhcmF0aW9uLlxuICpcbiAqIEBleHRlbmRzIE5vZGVcbiAqXG4gKiBAZXhhbXBsZVxuICogY29uc3Qgcm9vdCA9IHBvc3Rjc3MucGFyc2UoJ2EgeyBjb2xvcjogYmxhY2sgfScpO1xuICogY29uc3QgZGVjbCA9IHJvb3QuZmlyc3QuZmlyc3Q7XG4gKiBkZWNsLnR5cGUgICAgICAgLy89PiAnZGVjbCdcbiAqIGRlY2wudG9TdHJpbmcoKSAvLz0+ICcgY29sb3I6IGJsYWNrJ1xuICovXG5jbGFzcyBEZWNsYXJhdGlvbiBleHRlbmRzIE5vZGUge1xuXG4gICAgY29uc3RydWN0b3IoZGVmYXVsdHMpIHtcbiAgICAgICAgc3VwZXIoZGVmYXVsdHMpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnZGVjbCc7XG4gICAgfVxuXG4gICAgZ2V0IF92YWx1ZSgpIHtcbiAgICAgICAgd2Fybk9uY2UoJ05vZGUjX3ZhbHVlIHdhcyBkZXByZWNhdGVkLiBVc2UgTm9kZSNyYXdzLnZhbHVlJyk7XG4gICAgICAgIHJldHVybiB0aGlzLnJhd3MudmFsdWU7XG4gICAgfVxuXG4gICAgc2V0IF92YWx1ZSh2YWwpIHtcbiAgICAgICAgd2Fybk9uY2UoJ05vZGUjX3ZhbHVlIHdhcyBkZXByZWNhdGVkLiBVc2UgTm9kZSNyYXdzLnZhbHVlJyk7XG4gICAgICAgIHRoaXMucmF3cy52YWx1ZSA9IHZhbDtcbiAgICB9XG5cbiAgICBnZXQgX2ltcG9ydGFudCgpIHtcbiAgICAgICAgd2Fybk9uY2UoJ05vZGUjX2ltcG9ydGFudCB3YXMgZGVwcmVjYXRlZC4gVXNlIE5vZGUjcmF3cy5pbXBvcnRhbnQnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmF3cy5pbXBvcnRhbnQ7XG4gICAgfVxuXG4gICAgc2V0IF9pbXBvcnRhbnQodmFsKSB7XG4gICAgICAgIHdhcm5PbmNlKCdOb2RlI19pbXBvcnRhbnQgd2FzIGRlcHJlY2F0ZWQuIFVzZSBOb2RlI3Jhd3MuaW1wb3J0YW50Jyk7XG4gICAgICAgIHRoaXMucmF3cy5pbXBvcnRhbnQgPSB2YWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIERlY2xhcmF0aW9uI1xuICAgICAqIEBtZW1iZXIge3N0cmluZ30gcHJvcCAtIHRoZSBkZWNsYXJhdGlvbuKAmXMgcHJvcGVydHkgbmFtZVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCByb290ID0gcG9zdGNzcy5wYXJzZSgnYSB7IGNvbG9yOiBibGFjayB9Jyk7XG4gICAgICogY29uc3QgZGVjbCA9IHJvb3QuZmlyc3QuZmlyc3Q7XG4gICAgICogZGVjbC5wcm9wIC8vPT4gJ2NvbG9yJ1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIERlY2xhcmF0aW9uI1xuICAgICAqIEBtZW1iZXIge3N0cmluZ30gdmFsdWUgLSB0aGUgZGVjbGFyYXRpb27igJlzIHZhbHVlXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHJvb3QgPSBwb3N0Y3NzLnBhcnNlKCdhIHsgY29sb3I6IGJsYWNrIH0nKTtcbiAgICAgKiBjb25zdCBkZWNsID0gcm9vdC5maXJzdC5maXJzdDtcbiAgICAgKiBkZWNsLnZhbHVlIC8vPT4gJ2JsYWNrJ1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIERlY2xhcmF0aW9uI1xuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59IGltcG9ydGFudCAtIGB0cnVlYCBpZiB0aGUgZGVjbGFyYXRpb25cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXMgYW4gIWltcG9ydGFudCBhbm5vdGF0aW9uLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCByb290ID0gcG9zdGNzcy5wYXJzZSgnYSB7IGNvbG9yOiBibGFjayAhaW1wb3J0YW50OyBjb2xvcjogcmVkIH0nKTtcbiAgICAgKiByb290LmZpcnN0LmZpcnN0LmltcG9ydGFudCAvLz0+IHRydWVcbiAgICAgKiByb290LmZpcnN0Lmxhc3QuaW1wb3J0YW50ICAvLz0+IHVuZGVmaW5lZFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIERlY2xhcmF0aW9uI1xuICAgICAqIEBtZW1iZXIge29iamVjdH0gcmF3cyAtIEluZm9ybWF0aW9uIHRvIGdlbmVyYXRlIGJ5dGUtdG8tYnl0ZSBlcXVhbFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgc3RyaW5nIGFzIGl0IHdhcyBpbiB0aGUgb3JpZ2luIGlucHV0LlxuICAgICAqXG4gICAgICogRXZlcnkgcGFyc2VyIHNhdmVzIGl0cyBvd24gcHJvcGVydGllcyxcbiAgICAgKiBidXQgdGhlIGRlZmF1bHQgQ1NTIHBhcnNlciB1c2VzOlxuICAgICAqXG4gICAgICogKiBgYmVmb3JlYDogdGhlIHNwYWNlIHN5bWJvbHMgYmVmb3JlIHRoZSBub2RlLiBJdCBhbHNvIHN0b3JlcyBgKmBcbiAgICAgKiAgIGFuZCBgX2Agc3ltYm9scyBiZWZvcmUgdGhlIGRlY2xhcmF0aW9uIChJRSBoYWNrKS5cbiAgICAgKiAqIGBiZXR3ZWVuYDogdGhlIHN5bWJvbHMgYmV0d2VlbiB0aGUgcHJvcGVydHkgYW5kIHZhbHVlXG4gICAgICogICBmb3IgZGVjbGFyYXRpb25zLCBzZWxlY3RvciBhbmQgYHtgIGZvciBydWxlcywgb3IgbGFzdCBwYXJhbWV0ZXJcbiAgICAgKiAgIGFuZCBge2AgZm9yIGF0LXJ1bGVzLlxuICAgICAqICogYGltcG9ydGFudGA6IHRoZSBjb250ZW50IG9mIHRoZSBpbXBvcnRhbnQgc3RhdGVtZW50LFxuICAgICAqICAgaWYgaXQgaXMgbm90IGp1c3QgYCFpbXBvcnRhbnRgLlxuICAgICAqXG4gICAgICogUG9zdENTUyBjbGVhbnMgZGVjbGFyYXRpb24gZnJvbSBjb21tZW50cyBhbmQgZXh0cmEgc3BhY2VzLFxuICAgICAqIGJ1dCBpdCBzdG9yZXMgb3JpZ2luIGNvbnRlbnQgaW4gcmF3cyBwcm9wZXJ0aWVzLlxuICAgICAqIEFzIHN1Y2gsIGlmIHlvdSBkb27igJl0IGNoYW5nZSBhIGRlY2xhcmF0aW9u4oCZcyB2YWx1ZSxcbiAgICAgKiBQb3N0Q1NTIHdpbGwgdXNlIHRoZSByYXcgdmFsdWUgd2l0aCBjb21tZW50cy5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3Qgcm9vdCA9IHBvc3Rjc3MucGFyc2UoJ2Ege1xcbiAgY29sb3I6YmxhY2tcXG59JylcbiAgICAgKiByb290LmZpcnN0LmZpcnN0LnJhd3MgLy89PiB7IGJlZm9yZTogJ1xcbiAgJywgYmV0d2VlbjogJzonIH1cbiAgICAgKi9cblxufVxuXG5leHBvcnQgZGVmYXVsdCBEZWNsYXJhdGlvbjtcbiIsImltcG9ydCBDc3NTeW50YXhFcnJvciBmcm9tICcuL2Nzcy1zeW50YXgtZXJyb3InO1xuaW1wb3J0IFByZXZpb3VzTWFwICAgIGZyb20gJy4vcHJldmlvdXMtbWFwJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmxldCBzZXF1ZW5jZSA9IDA7XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgc291cmNlIENTUy5cbiAqXG4gKiBAZXhhbXBsZVxuICogY29uc3Qgcm9vdCAgPSBwb3N0Y3NzLnBhcnNlKGNzcywgeyBmcm9tOiBmaWxlIH0pO1xuICogY29uc3QgaW5wdXQgPSByb290LnNvdXJjZS5pbnB1dDtcbiAqL1xuY2xhc3MgSW5wdXQge1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNzcyAgICAtIGlucHV0IENTUyBzb3VyY2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdHNdIC0ge0BsaW5rIFByb2Nlc3NvciNwcm9jZXNzfSBvcHRpb25zXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY3NzLCBvcHRzID0geyB9KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtzdHJpbmd9IC0gaW5wdXQgQ1NTIHNvdXJjZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBjb25zdCBpbnB1dCA9IHBvc3Rjc3MucGFyc2UoJ2F7fScsIHsgZnJvbTogZmlsZSB9KS5pbnB1dDtcbiAgICAgICAgICogaW5wdXQuY3NzIC8vPT4gXCJhe31cIjtcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY3NzID0gY3NzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgaWYgKCB0aGlzLmNzc1swXSA9PT0gJ1xcdUZFRkYnIHx8IHRoaXMuY3NzWzBdID09PSAnXFx1RkZGRScgKSB7XG4gICAgICAgICAgICB0aGlzLmNzcyA9IHRoaXMuY3NzLnNsaWNlKDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBvcHRzLmZyb20gKSB7XG4gICAgICAgICAgICBpZiAoIC9eXFx3KzpcXC9cXC8vLnRlc3Qob3B0cy5mcm9tKSApIHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBAbWVtYmVyIHtzdHJpbmd9IC0gVGhlIGFic29sdXRlIHBhdGggdG8gdGhlIENTUyBzb3VyY2UgZmlsZVxuICAgICAgICAgICAgICAgICAqICAgICAgICAgICAgICAgICAgICBkZWZpbmVkIHdpdGggdGhlIGBmcm9tYCBvcHRpb24uXG4gICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICAgICAqIGNvbnN0IHJvb3QgPSBwb3N0Y3NzLnBhcnNlKGNzcywgeyBmcm9tOiAnYS5jc3MnIH0pO1xuICAgICAgICAgICAgICAgICAqIHJvb3Quc291cmNlLmlucHV0LmZpbGUgLy89PiAnL2hvbWUvYWkvYS5jc3MnXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy5maWxlID0gb3B0cy5mcm9tO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGUgPSBwYXRoLnJlc29sdmUob3B0cy5mcm9tKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtYXAgPSBuZXcgUHJldmlvdXNNYXAodGhpcy5jc3MsIG9wdHMpO1xuICAgICAgICBpZiAoIG1hcC50ZXh0ICkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyIHtQcmV2aW91c01hcH0gLSBUaGUgaW5wdXQgc291cmNlIG1hcCBwYXNzZWQgZnJvbVxuICAgICAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgYSBjb21waWxhdGlvbiBzdGVwIGJlZm9yZSBQb3N0Q1NTXG4gICAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAoZm9yIGV4YW1wbGUsIGZyb20gU2FzcyBjb21waWxlcikuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAqIHJvb3Quc291cmNlLmlucHV0Lm1hcC5jb25zdW1lcigpLnNvdXJjZXMgLy89PiBbJ2Euc2FzcyddXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMubWFwID0gbWFwO1xuICAgICAgICAgICAgbGV0IGZpbGUgPSBtYXAuY29uc3VtZXIoKS5maWxlO1xuICAgICAgICAgICAgaWYgKCAhdGhpcy5maWxlICYmIGZpbGUgKSB0aGlzLmZpbGUgPSB0aGlzLm1hcFJlc29sdmUoZmlsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoICF0aGlzLmZpbGUgKSB7XG4gICAgICAgICAgICBzZXF1ZW5jZSArPSAxO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyIHtzdHJpbmd9IC0gVGhlIHVuaXF1ZSBJRCBvZiB0aGUgQ1NTIHNvdXJjZS4gSXQgd2lsbCBiZVxuICAgICAgICAgICAgICogICAgICAgICAgICAgICAgICAgIGNyZWF0ZWQgaWYgYGZyb21gIG9wdGlvbiBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgICAgICAqICAgICAgICAgICAgICAgICAgICAoYmVjYXVzZSBQb3N0Q1NTIGRvZXMgbm90IGtub3cgdGhlIGZpbGUgcGF0aCkuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAqIGNvbnN0IHJvb3QgPSBwb3N0Y3NzLnBhcnNlKGNzcyk7XG4gICAgICAgICAgICAgKiByb290LnNvdXJjZS5pbnB1dC5maWxlIC8vPT4gdW5kZWZpbmVkXG4gICAgICAgICAgICAgKiByb290LnNvdXJjZS5pbnB1dC5pZCAgIC8vPT4gXCI8aW5wdXQgY3NzIDE+XCJcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5pZCAgID0gJzxpbnB1dCBjc3MgJyArIHNlcXVlbmNlICsgJz4nO1xuICAgICAgICB9XG4gICAgICAgIGlmICggdGhpcy5tYXAgKSB0aGlzLm1hcC5maWxlID0gdGhpcy5mcm9tO1xuICAgIH1cblxuICAgIGVycm9yKG1lc3NhZ2UsIGxpbmUsIGNvbHVtbiwgb3B0cyA9IHsgfSkge1xuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICBsZXQgb3JpZ2luID0gdGhpcy5vcmlnaW4obGluZSwgY29sdW1uKTtcbiAgICAgICAgaWYgKCBvcmlnaW4gKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgQ3NzU3ludGF4RXJyb3IobWVzc2FnZSwgb3JpZ2luLmxpbmUsIG9yaWdpbi5jb2x1bW4sXG4gICAgICAgICAgICAgICAgb3JpZ2luLnNvdXJjZSwgb3JpZ2luLmZpbGUsIG9wdHMucGx1Z2luKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBDc3NTeW50YXhFcnJvcihtZXNzYWdlLCBsaW5lLCBjb2x1bW4sXG4gICAgICAgICAgICAgICAgdGhpcy5jc3MsIHRoaXMuZmlsZSwgb3B0cy5wbHVnaW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0LmlucHV0ID0geyBsaW5lLCBjb2x1bW4sIHNvdXJjZTogdGhpcy5jc3MgfTtcbiAgICAgICAgaWYgKCB0aGlzLmZpbGUgKSByZXN1bHQuaW5wdXQuZmlsZSA9IHRoaXMuZmlsZTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIHRoZSBpbnB1dCBzb3VyY2UgbWFwIGFuZCByZXR1cm5zIGEgc3ltYm9sIHBvc2l0aW9uXG4gICAgICogaW4gdGhlIGlucHV0IHNvdXJjZSAoZS5nLiwgaW4gYSBTYXNzIGZpbGUgdGhhdCB3YXMgY29tcGlsZWRcbiAgICAgKiB0byBDU1MgYmVmb3JlIGJlaW5nIHBhc3NlZCB0byBQb3N0Q1NTKS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lICAgLSBsaW5lIGluIGlucHV0IENTU1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW4gLSBjb2x1bW4gaW4gaW5wdXQgQ1NTXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtmaWxlUG9zaXRpb259IHBvc2l0aW9uIGluIGlucHV0IHNvdXJjZVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiByb290LnNvdXJjZS5pbnB1dC5vcmlnaW4oMSwgMSkgLy89PiB7IGZpbGU6ICdhLmNzcycsIGxpbmU6IDMsIGNvbHVtbjogMSB9XG4gICAgICovXG4gICAgb3JpZ2luKGxpbmUsIGNvbHVtbikge1xuICAgICAgICBpZiAoICF0aGlzLm1hcCApIHJldHVybiBmYWxzZTtcbiAgICAgICAgbGV0IGNvbnN1bWVyID0gdGhpcy5tYXAuY29uc3VtZXIoKTtcblxuICAgICAgICBsZXQgZnJvbSA9IGNvbnN1bWVyLm9yaWdpbmFsUG9zaXRpb25Gb3IoeyBsaW5lLCBjb2x1bW4gfSk7XG4gICAgICAgIGlmICggIWZyb20uc291cmNlICkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICBmaWxlOiAgIHRoaXMubWFwUmVzb2x2ZShmcm9tLnNvdXJjZSksXG4gICAgICAgICAgICBsaW5lOiAgIGZyb20ubGluZSxcbiAgICAgICAgICAgIGNvbHVtbjogZnJvbS5jb2x1bW5cbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgc291cmNlID0gY29uc3VtZXIuc291cmNlQ29udGVudEZvcihmcm9tLnNvdXJjZSk7XG4gICAgICAgIGlmICggc291cmNlICkgcmVzdWx0LnNvdXJjZSA9IHNvdXJjZTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIG1hcFJlc29sdmUoZmlsZSkge1xuICAgICAgICBpZiAoIC9eXFx3KzpcXC9cXC8vLnRlc3QoZmlsZSkgKSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBwYXRoLnJlc29sdmUodGhpcy5tYXAuY29uc3VtZXIoKS5zb3VyY2VSb290IHx8ICcuJywgZmlsZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgQ1NTIHNvdXJjZSBpZGVudGlmaWVyLiBDb250YWlucyB7QGxpbmsgSW5wdXQjZmlsZX0gaWYgdGhlIHVzZXJcbiAgICAgKiBzZXQgdGhlIGBmcm9tYCBvcHRpb24sIG9yIHtAbGluayBJbnB1dCNpZH0gaWYgdGhleSBkaWQgbm90LlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHJvb3QgPSBwb3N0Y3NzLnBhcnNlKGNzcywgeyBmcm9tOiAnYS5jc3MnIH0pO1xuICAgICAqIHJvb3Quc291cmNlLmlucHV0LmZyb20gLy89PiBcIi9ob21lL2FpL2EuY3NzXCJcbiAgICAgKlxuICAgICAqIGNvbnN0IHJvb3QgPSBwb3N0Y3NzLnBhcnNlKGNzcyk7XG4gICAgICogcm9vdC5zb3VyY2UuaW5wdXQuZnJvbSAvLz0+IFwiPGlucHV0IGNzcyAxPlwiXG4gICAgICovXG4gICAgZ2V0IGZyb20oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUgfHwgdGhpcy5pZDtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW5wdXQ7XG5cbi8qKlxuICogQHR5cGVkZWYgIHtvYmplY3R9IGZpbGVQb3NpdGlvblxuICogQHByb3BlcnR5IHtzdHJpbmd9IGZpbGUgICAtIHBhdGggdG8gZmlsZVxuICogQHByb3BlcnR5IHtudW1iZXJ9IGxpbmUgICAtIHNvdXJjZSBsaW5lIGluIGZpbGVcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBjb2x1bW4gLSBzb3VyY2UgY29sdW1uIGluIGZpbGVcbiAqL1xuIiwiaW1wb3J0IE1hcEdlbmVyYXRvciBmcm9tICcuL21hcC1nZW5lcmF0b3InO1xuaW1wb3J0IHN0cmluZ2lmeSAgICBmcm9tICcuL3N0cmluZ2lmeSc7XG5pbXBvcnQgd2Fybk9uY2UgICAgIGZyb20gJy4vd2Fybi1vbmNlJztcbmltcG9ydCBSZXN1bHQgICAgICAgZnJvbSAnLi9yZXN1bHQnO1xuaW1wb3J0IHBhcnNlICAgICAgICBmcm9tICcuL3BhcnNlJztcblxuZnVuY3Rpb24gaXNQcm9taXNlKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqLnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSBQcm9taXNlIHByb3h5IGZvciB0aGUgcmVzdWx0IG9mIFBvc3RDU1MgdHJhbnNmb3JtYXRpb25zLlxuICpcbiAqIEEgYExhenlSZXN1bHRgIGluc3RhbmNlIGlzIHJldHVybmVkIGJ5IHtAbGluayBQcm9jZXNzb3IjcHJvY2Vzc30uXG4gKlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGxhenkgPSBwb3N0Y3NzKFtjc3NuZXh0XSkucHJvY2Vzcyhjc3MpO1xuICovXG5jbGFzcyBMYXp5UmVzdWx0IHtcblxuICAgIGNvbnN0cnVjdG9yKHByb2Nlc3NvciwgY3NzLCBvcHRzKSB7XG4gICAgICAgIHRoaXMuc3RyaW5naWZpZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wcm9jZXNzZWQgICA9IGZhbHNlO1xuXG4gICAgICAgIGxldCByb290O1xuICAgICAgICBpZiAoIHR5cGVvZiBjc3MgPT09ICdvYmplY3QnICYmIGNzcy50eXBlID09PSAncm9vdCcgKSB7XG4gICAgICAgICAgICByb290ID0gY3NzO1xuICAgICAgICB9IGVsc2UgaWYgKCBjc3MgaW5zdGFuY2VvZiBMYXp5UmVzdWx0IHx8IGNzcyBpbnN0YW5jZW9mIFJlc3VsdCApIHtcbiAgICAgICAgICAgIHJvb3QgPSBjc3Mucm9vdDtcbiAgICAgICAgICAgIGlmICggY3NzLm1hcCApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiBvcHRzLm1hcCA9PT0gJ3VuZGVmaW5lZCcgKSBvcHRzLm1hcCA9IHsgfTtcbiAgICAgICAgICAgICAgICBpZiAoICFvcHRzLm1hcC5pbmxpbmUgKSBvcHRzLm1hcC5pbmxpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBvcHRzLm1hcC5wcmV2ID0gY3NzLm1hcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBwYXJzZXIgPSBwYXJzZTtcbiAgICAgICAgICAgIGlmICggb3B0cy5zeW50YXggKSAgcGFyc2VyID0gb3B0cy5zeW50YXgucGFyc2U7XG4gICAgICAgICAgICBpZiAoIG9wdHMucGFyc2VyICkgIHBhcnNlciA9IG9wdHMucGFyc2VyO1xuICAgICAgICAgICAgaWYgKCBwYXJzZXIucGFyc2UgKSBwYXJzZXIgPSBwYXJzZXIucGFyc2U7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcm9vdCA9IHBhcnNlcihjc3MsIG9wdHMpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yID0gZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlc3VsdCA9IG5ldyBSZXN1bHQocHJvY2Vzc29yLCByb290LCBvcHRzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEge0BsaW5rIFByb2Nlc3Nvcn0gaW5zdGFuY2UsIHdoaWNoIHdpbGwgYmUgdXNlZFxuICAgICAqIGZvciBDU1MgdHJhbnNmb3JtYXRpb25zLlxuICAgICAqIEB0eXBlIHtQcm9jZXNzb3J9XG4gICAgICovXG4gICAgZ2V0IHByb2Nlc3NvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0LnByb2Nlc3NvcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25zIGZyb20gdGhlIHtAbGluayBQcm9jZXNzb3IjcHJvY2Vzc30gY2FsbC5cbiAgICAgKiBAdHlwZSB7cHJvY2Vzc09wdGlvbnN9XG4gICAgICovXG4gICAgZ2V0IG9wdHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdC5vcHRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NlcyBpbnB1dCBDU1MgdGhyb3VnaCBzeW5jaHJvbm91cyBwbHVnaW5zLCBjb252ZXJ0cyBgUm9vdGBcbiAgICAgKiB0byBhIENTUyBzdHJpbmcgYW5kIHJldHVybnMge0BsaW5rIFJlc3VsdCNjc3N9LlxuICAgICAqXG4gICAgICogVGhpcyBwcm9wZXJ0eSB3aWxsIG9ubHkgd29yayB3aXRoIHN5bmNocm9ub3VzIHBsdWdpbnMuXG4gICAgICogSWYgdGhlIHByb2Nlc3NvciBjb250YWlucyBhbnkgYXN5bmNocm9ub3VzIHBsdWdpbnNcbiAgICAgKiBpdCB3aWxsIHRocm93IGFuIGVycm9yLiBUaGlzIGlzIHdoeSB0aGlzIG1ldGhvZCBpcyBvbmx5XG4gICAgICogZm9yIGRlYnVnIHB1cnBvc2UsIHlvdSBzaG91bGQgYWx3YXlzIHVzZSB7QGxpbmsgTGF6eVJlc3VsdCN0aGVufS5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQHNlZSBSZXN1bHQjY3NzXG4gICAgICovXG4gICAgZ2V0IGNzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyaW5naWZ5KCkuY3NzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFuIGFsaWFzIGZvciB0aGUgYGNzc2AgcHJvcGVydHkuIFVzZSBpdCB3aXRoIHN5bnRheGVzXG4gICAgICogdGhhdCBnZW5lcmF0ZSBub24tQ1NTIG91dHB1dC5cbiAgICAgKlxuICAgICAqIFRoaXMgcHJvcGVydHkgd2lsbCBvbmx5IHdvcmsgd2l0aCBzeW5jaHJvbm91cyBwbHVnaW5zLlxuICAgICAqIElmIHRoZSBwcm9jZXNzb3IgY29udGFpbnMgYW55IGFzeW5jaHJvbm91cyBwbHVnaW5zXG4gICAgICogaXQgd2lsbCB0aHJvdyBhbiBlcnJvci4gVGhpcyBpcyB3aHkgdGhpcyBtZXRob2QgaXMgb25seVxuICAgICAqIGZvciBkZWJ1ZyBwdXJwb3NlLCB5b3Ugc2hvdWxkIGFsd2F5cyB1c2Uge0BsaW5rIExhenlSZXN1bHQjdGhlbn0uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBzZWUgUmVzdWx0I2NvbnRlbnRcbiAgICAgKi9cbiAgICBnZXQgY29udGVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyaW5naWZ5KCkuY29udGVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzZXMgaW5wdXQgQ1NTIHRocm91Z2ggc3luY2hyb25vdXMgcGx1Z2luc1xuICAgICAqIGFuZCByZXR1cm5zIHtAbGluayBSZXN1bHQjbWFwfS5cbiAgICAgKlxuICAgICAqIFRoaXMgcHJvcGVydHkgd2lsbCBvbmx5IHdvcmsgd2l0aCBzeW5jaHJvbm91cyBwbHVnaW5zLlxuICAgICAqIElmIHRoZSBwcm9jZXNzb3IgY29udGFpbnMgYW55IGFzeW5jaHJvbm91cyBwbHVnaW5zXG4gICAgICogaXQgd2lsbCB0aHJvdyBhbiBlcnJvci4gVGhpcyBpcyB3aHkgdGhpcyBtZXRob2QgaXMgb25seVxuICAgICAqIGZvciBkZWJ1ZyBwdXJwb3NlLCB5b3Ugc2hvdWxkIGFsd2F5cyB1c2Uge0BsaW5rIExhenlSZXN1bHQjdGhlbn0uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7U291cmNlTWFwR2VuZXJhdG9yfVxuICAgICAqIEBzZWUgUmVzdWx0I21hcFxuICAgICAqL1xuICAgIGdldCBtYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0cmluZ2lmeSgpLm1hcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzZXMgaW5wdXQgQ1NTIHRocm91Z2ggc3luY2hyb25vdXMgcGx1Z2luc1xuICAgICAqIGFuZCByZXR1cm5zIHtAbGluayBSZXN1bHQjcm9vdH0uXG4gICAgICpcbiAgICAgKiBUaGlzIHByb3BlcnR5IHdpbGwgb25seSB3b3JrIHdpdGggc3luY2hyb25vdXMgcGx1Z2lucy4gSWYgdGhlIHByb2Nlc3NvclxuICAgICAqIGNvbnRhaW5zIGFueSBhc3luY2hyb25vdXMgcGx1Z2lucyBpdCB3aWxsIHRocm93IGFuIGVycm9yLlxuICAgICAqXG4gICAgICogVGhpcyBpcyB3aHkgdGhpcyBtZXRob2QgaXMgb25seSBmb3IgZGVidWcgcHVycG9zZSxcbiAgICAgKiB5b3Ugc2hvdWxkIGFsd2F5cyB1c2Uge0BsaW5rIExhenlSZXN1bHQjdGhlbn0uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Um9vdH1cbiAgICAgKiBAc2VlIFJlc3VsdCNyb290XG4gICAgICovXG4gICAgZ2V0IHJvb3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN5bmMoKS5yb290O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NlcyBpbnB1dCBDU1MgdGhyb3VnaCBzeW5jaHJvbm91cyBwbHVnaW5zXG4gICAgICogYW5kIHJldHVybnMge0BsaW5rIFJlc3VsdCNtZXNzYWdlc30uXG4gICAgICpcbiAgICAgKiBUaGlzIHByb3BlcnR5IHdpbGwgb25seSB3b3JrIHdpdGggc3luY2hyb25vdXMgcGx1Z2lucy4gSWYgdGhlIHByb2Nlc3NvclxuICAgICAqIGNvbnRhaW5zIGFueSBhc3luY2hyb25vdXMgcGx1Z2lucyBpdCB3aWxsIHRocm93IGFuIGVycm9yLlxuICAgICAqXG4gICAgICogVGhpcyBpcyB3aHkgdGhpcyBtZXRob2QgaXMgb25seSBmb3IgZGVidWcgcHVycG9zZSxcbiAgICAgKiB5b3Ugc2hvdWxkIGFsd2F5cyB1c2Uge0BsaW5rIExhenlSZXN1bHQjdGhlbn0uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TWVzc2FnZVtdfVxuICAgICAqIEBzZWUgUmVzdWx0I21lc3NhZ2VzXG4gICAgICovXG4gICAgZ2V0IG1lc3NhZ2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zeW5jKCkubWVzc2FnZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvY2Vzc2VzIGlucHV0IENTUyB0aHJvdWdoIHN5bmNocm9ub3VzIHBsdWdpbnNcbiAgICAgKiBhbmQgY2FsbHMge0BsaW5rIFJlc3VsdCN3YXJuaW5ncygpfS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1dhcm5pbmdbXX0gd2FybmluZ3MgZnJvbSBwbHVnaW5zXG4gICAgICovXG4gICAgd2FybmluZ3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN5bmMoKS53YXJuaW5ncygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFsaWFzIGZvciB0aGUge0BsaW5rIExhenlSZXN1bHQjY3NzfSBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogbGF6eSArICcnID09PSBsYXp5LmNzcztcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gb3V0cHV0IENTU1xuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jc3M7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvY2Vzc2VzIGlucHV0IENTUyB0aHJvdWdoIHN5bmNocm9ub3VzIGFuZCBhc3luY2hyb25vdXMgcGx1Z2luc1xuICAgICAqIGFuZCBjYWxscyBgb25GdWxmaWxsZWRgIHdpdGggYSBSZXN1bHQgaW5zdGFuY2UuIElmIGEgcGx1Z2luIHRocm93c1xuICAgICAqIGFuIGVycm9yLCB0aGUgYG9uUmVqZWN0ZWRgIGNhbGxiYWNrIHdpbGwgYmUgZXhlY3V0ZWQuXG4gICAgICpcbiAgICAgKiBJdCBpbXBsZW1lbnRzIHN0YW5kYXJkIFByb21pc2UgQVBJLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvbkZ1bGZpbGxlZH0gb25GdWxmaWxsZWQgLSBjYWxsYmFjayB3aWxsIGJlIGV4ZWN1dGVkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuIGFsbCBwbHVnaW5zIHdpbGwgZmluaXNoIHdvcmtcbiAgICAgKiBAcGFyYW0ge29uUmVqZWN0ZWR9ICBvblJlamVjdGVkICAtIGNhbGxiYWNrIHdpbGwgYmUgZXhlY3V0ZWQgb24gYW55IGVycm9yXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBQcm9taXNlIEFQSSB0byBtYWtlIHF1ZXVlXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHBvc3Rjc3MoW2Nzc25leHRdKS5wcm9jZXNzKGNzcykudGhlbihyZXN1bHQgPT4ge1xuICAgICAqICAgY29uc29sZS5sb2cocmVzdWx0LmNzcyk7XG4gICAgICogfSk7XG4gICAgICovXG4gICAgdGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hc3luYygpLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NlcyBpbnB1dCBDU1MgdGhyb3VnaCBzeW5jaHJvbm91cyBhbmQgYXN5bmNocm9ub3VzIHBsdWdpbnNcbiAgICAgKiBhbmQgY2FsbHMgb25SZWplY3RlZCBmb3IgZWFjaCBlcnJvciB0aHJvd24gaW4gYW55IHBsdWdpbi5cbiAgICAgKlxuICAgICAqIEl0IGltcGxlbWVudHMgc3RhbmRhcmQgUHJvbWlzZSBBUEkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29uUmVqZWN0ZWR9IG9uUmVqZWN0ZWQgLSBjYWxsYmFjayB3aWxsIGJlIGV4ZWN1dGVkIG9uIGFueSBlcnJvclxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZX0gUHJvbWlzZSBBUEkgdG8gbWFrZSBxdWV1ZVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBwb3N0Y3NzKFtjc3NuZXh0XSkucHJvY2Vzcyhjc3MpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgKiAgIGNvbnNvbGUubG9nKHJlc3VsdC5jc3MpO1xuICAgICAqIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgKiAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAqIH0pO1xuICAgICAqL1xuICAgIGNhdGNoKG9uUmVqZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXN5bmMoKS5jYXRjaChvblJlamVjdGVkKTtcbiAgICB9XG5cbiAgICBoYW5kbGVFcnJvcihlcnJvciwgcGx1Z2luKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmVycm9yID0gZXJyb3I7XG4gICAgICAgICAgICBpZiAoIGVycm9yLm5hbWUgPT09ICdDc3NTeW50YXhFcnJvcicgJiYgIWVycm9yLnBsdWdpbiApIHtcbiAgICAgICAgICAgICAgICBlcnJvci5wbHVnaW4gPSBwbHVnaW4ucG9zdGNzc1BsdWdpbjtcbiAgICAgICAgICAgICAgICBlcnJvci5zZXRNZXNzYWdlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBwbHVnaW4ucG9zdGNzc1ZlcnNpb24gKSB7XG4gICAgICAgICAgICAgICAgbGV0IHBsdWdpbk5hbWUgPSBwbHVnaW4ucG9zdGNzc1BsdWdpbjtcbiAgICAgICAgICAgICAgICBsZXQgcGx1Z2luVmVyICA9IHBsdWdpbi5wb3N0Y3NzVmVyc2lvbjtcbiAgICAgICAgICAgICAgICBsZXQgcnVudGltZVZlciA9IHRoaXMucmVzdWx0LnByb2Nlc3Nvci52ZXJzaW9uO1xuICAgICAgICAgICAgICAgIGxldCBhID0gcGx1Z2luVmVyLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICAgICAgbGV0IGIgPSBydW50aW1lVmVyLnNwbGl0KCcuJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIGFbMF0gIT09IGJbMF0gfHwgcGFyc2VJbnQoYVsxXSkgPiBwYXJzZUludChiWzFdKSApIHtcbiAgICAgICAgICAgICAgICAgICAgd2Fybk9uY2UoJ1lvdXIgY3VycmVudCBQb3N0Q1NTIHZlcnNpb24gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpcyAnICsgcnVudGltZVZlciArICcsIGJ1dCAnICsgcGx1Z2luTmFtZSArICcgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICd1c2VzICcgKyBwbHVnaW5WZXIgKyAnLiBQZXJoYXBzIHRoaXMgaXMgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0aGUgc291cmNlIG9mIHRoZSBlcnJvciBiZWxvdy4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKCBjb25zb2xlICYmIGNvbnNvbGUuZXJyb3IgKSBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luY1RpY2socmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmICggdGhpcy5wbHVnaW4gPj0gdGhpcy5wcm9jZXNzb3IucGx1Z2lucy5sZW5ndGggKSB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBwbHVnaW4gID0gdGhpcy5wcm9jZXNzb3IucGx1Z2luc1t0aGlzLnBsdWdpbl07XG4gICAgICAgICAgICBsZXQgcHJvbWlzZSA9IHRoaXMucnVuKHBsdWdpbik7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbiArPSAxO1xuXG4gICAgICAgICAgICBpZiAoIGlzUHJvbWlzZShwcm9taXNlKSApIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hc3luY1RpY2socmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCggZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUVycm9yKGVycm9yLCBwbHVnaW4pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYXN5bmNUaWNrKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYygpIHtcbiAgICAgICAgaWYgKCB0aGlzLnByb2Nlc3NlZCApIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggdGhpcy5lcnJvciApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHRoaXMuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5zdHJpbmdpZnkoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCB0aGlzLnByb2Nlc3NpbmcgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzaW5nID0gbmV3IFByb21pc2UoIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICggdGhpcy5lcnJvciApIHJldHVybiByZWplY3QodGhpcy5lcnJvcik7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbiA9IDA7XG4gICAgICAgICAgICB0aGlzLmFzeW5jVGljayhyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KS50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdHJpbmdpZnkoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc2luZztcbiAgICB9XG5cbiAgICBzeW5jKCkge1xuICAgICAgICBpZiAoIHRoaXMucHJvY2Vzc2VkICkgcmV0dXJuIHRoaXMucmVzdWx0O1xuICAgICAgICB0aGlzLnByb2Nlc3NlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKCB0aGlzLnByb2Nlc3NpbmcgKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgJ1VzZSBwcm9jZXNzKGNzcykudGhlbihjYikgdG8gd29yayB3aXRoIGFzeW5jIHBsdWdpbnMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggdGhpcy5lcnJvciApIHRocm93IHRoaXMuZXJyb3I7XG5cbiAgICAgICAgZm9yICggbGV0IHBsdWdpbiBvZiB0aGlzLnJlc3VsdC5wcm9jZXNzb3IucGx1Z2lucyApIHtcbiAgICAgICAgICAgIGxldCBwcm9taXNlID0gdGhpcy5ydW4ocGx1Z2luKTtcbiAgICAgICAgICAgIGlmICggaXNQcm9taXNlKHByb21pc2UpICkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBwcm9jZXNzKGNzcykudGhlbihjYikgdG8gd29yayB3aXRoIGFzeW5jIHBsdWdpbnMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdDtcbiAgICB9XG5cbiAgICBydW4ocGx1Z2luKSB7XG4gICAgICAgIHRoaXMucmVzdWx0Lmxhc3RQbHVnaW4gPSBwbHVnaW47XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBwbHVnaW4odGhpcy5yZXN1bHQucm9vdCwgdGhpcy5yZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVFcnJvcihlcnJvciwgcGx1Z2luKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RyaW5naWZ5KCkge1xuICAgICAgICBpZiAoIHRoaXMuc3RyaW5naWZpZWQgKSByZXR1cm4gdGhpcy5yZXN1bHQ7XG4gICAgICAgIHRoaXMuc3RyaW5naWZpZWQgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuc3luYygpO1xuXG4gICAgICAgIGxldCBvcHRzID0gdGhpcy5yZXN1bHQub3B0cztcbiAgICAgICAgbGV0IHN0ciAgPSBzdHJpbmdpZnk7XG4gICAgICAgIGlmICggb3B0cy5zeW50YXggKSAgICAgIHN0ciA9IG9wdHMuc3ludGF4LnN0cmluZ2lmeTtcbiAgICAgICAgaWYgKCBvcHRzLnN0cmluZ2lmaWVyICkgc3RyID0gb3B0cy5zdHJpbmdpZmllcjtcbiAgICAgICAgaWYgKCBzdHIuc3RyaW5naWZ5ICkgICAgc3RyID0gc3RyLnN0cmluZ2lmeTtcblxuICAgICAgICBsZXQgbWFwICA9IG5ldyBNYXBHZW5lcmF0b3Ioc3RyLCB0aGlzLnJlc3VsdC5yb290LCB0aGlzLnJlc3VsdC5vcHRzKTtcbiAgICAgICAgbGV0IGRhdGEgPSBtYXAuZ2VuZXJhdGUoKTtcbiAgICAgICAgdGhpcy5yZXN1bHQuY3NzID0gZGF0YVswXTtcbiAgICAgICAgdGhpcy5yZXN1bHQubWFwID0gZGF0YVsxXTtcblxuICAgICAgICByZXR1cm4gdGhpcy5yZXN1bHQ7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IExhenlSZXN1bHQ7XG5cbi8qKlxuICogQGNhbGxiYWNrIG9uRnVsZmlsbGVkXG4gKiBAcGFyYW0ge1Jlc3VsdH0gcmVzdWx0XG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgb25SZWplY3RlZFxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3JcbiAqL1xuIiwiLyoqXG4gKiBDb250YWlucyBoZWxwZXJzIGZvciBzYWZlbHkgc3BsaXR0aW5nIGxpc3RzIG9mIENTUyB2YWx1ZXMsXG4gKiBwcmVzZXJ2aW5nIHBhcmVudGhlc2VzIGFuZCBxdW90ZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGxpc3QgPSBwb3N0Y3NzLmxpc3Q7XG4gKlxuICogQG5hbWVzcGFjZSBsaXN0XG4gKi9cbmxldCBsaXN0ID0ge1xuXG4gICAgc3BsaXQoc3RyaW5nLCBzZXBhcmF0b3JzLCBsYXN0KSB7XG4gICAgICAgIGxldCBhcnJheSAgID0gW107XG4gICAgICAgIGxldCBjdXJyZW50ID0gJyc7XG4gICAgICAgIGxldCBzcGxpdCAgID0gZmFsc2U7XG5cbiAgICAgICAgbGV0IGZ1bmMgICAgPSAwO1xuICAgICAgICBsZXQgcXVvdGUgICA9IGZhbHNlO1xuICAgICAgICBsZXQgZXNjYXBlICA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIGxldCBsZXR0ZXIgPSBzdHJpbmdbaV07XG5cbiAgICAgICAgICAgIGlmICggcXVvdGUgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBlc2NhcGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIGVzY2FwZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGxldHRlciA9PT0gJ1xcXFwnICkge1xuICAgICAgICAgICAgICAgICAgICBlc2NhcGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGxldHRlciA9PT0gcXVvdGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1b3RlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICggbGV0dGVyID09PSAnXCInIHx8IGxldHRlciA9PT0gJ1xcJycgKSB7XG4gICAgICAgICAgICAgICAgcXVvdGUgPSBsZXR0ZXI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBsZXR0ZXIgPT09ICcoJyApIHtcbiAgICAgICAgICAgICAgICBmdW5jICs9IDE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBsZXR0ZXIgPT09ICcpJyApIHtcbiAgICAgICAgICAgICAgICBpZiAoIGZ1bmMgPiAwICkgZnVuYyAtPSAxO1xuICAgICAgICAgICAgfSBlbHNlIGlmICggZnVuYyA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHNlcGFyYXRvcnMuaW5kZXhPZihsZXR0ZXIpICE9PSAtMSApIHNwbGl0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBzcGxpdCApIHtcbiAgICAgICAgICAgICAgICBpZiAoIGN1cnJlbnQgIT09ICcnICkgYXJyYXkucHVzaChjdXJyZW50LnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgY3VycmVudCA9ICcnO1xuICAgICAgICAgICAgICAgIHNwbGl0ICAgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudCArPSBsZXR0ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGxhc3QgfHwgY3VycmVudCAhPT0gJycgKSBhcnJheS5wdXNoKGN1cnJlbnQudHJpbSgpKTtcbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYWZlbHkgc3BsaXRzIHNwYWNlLXNlcGFyYXRlZCB2YWx1ZXMgKHN1Y2ggYXMgdGhvc2UgZm9yIGBiYWNrZ3JvdW5kYCxcbiAgICAgKiBgYm9yZGVyLXJhZGl1c2AsIGFuZCBvdGhlciBzaG9ydGhhbmQgcHJvcGVydGllcykuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gc3BhY2Utc2VwYXJhdGVkIHZhbHVlc1xuICAgICAqXG4gICAgICogQHJldHVybiB7c3RyaW5nW119IHNwbGl0IHZhbHVlc1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBwb3N0Y3NzLmxpc3Quc3BhY2UoJzFweCBjYWxjKDEwJSArIDFweCknKSAvLz0+IFsnMXB4JywgJ2NhbGMoMTAlICsgMXB4KSddXG4gICAgICovXG4gICAgc3BhY2Uoc3RyaW5nKSB7XG4gICAgICAgIGxldCBzcGFjZXMgPSBbJyAnLCAnXFxuJywgJ1xcdCddO1xuICAgICAgICByZXR1cm4gbGlzdC5zcGxpdChzdHJpbmcsIHNwYWNlcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNhZmVseSBzcGxpdHMgY29tbWEtc2VwYXJhdGVkIHZhbHVlcyAoc3VjaCBhcyB0aG9zZSBmb3IgYHRyYW5zaXRpb24tKmBcbiAgICAgKiBhbmQgYGJhY2tncm91bmRgIHByb3BlcnRpZXMpLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIGNvbW1hLXNlcGFyYXRlZCB2YWx1ZXNcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3N0cmluZ1tdfSBzcGxpdCB2YWx1ZXNcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogcG9zdGNzcy5saXN0LmNvbW1hKCdibGFjaywgbGluZWFyLWdyYWRpZW50KHdoaXRlLCBibGFjayknKVxuICAgICAqIC8vPT4gWydibGFjaycsICdsaW5lYXItZ3JhZGllbnQod2hpdGUsIGJsYWNrKSddXG4gICAgICovXG4gICAgY29tbWEoc3RyaW5nKSB7XG4gICAgICAgIGxldCBjb21tYSA9ICcsJztcbiAgICAgICAgcmV0dXJuIGxpc3Quc3BsaXQoc3RyaW5nLCBbY29tbWFdLCB0cnVlKTtcbiAgICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGxpc3Q7XG4iLCJpbXBvcnQgeyBCYXNlNjQgfSBmcm9tICdqcy1iYXNlNjQnO1xuaW1wb3J0ICAgbW96aWxsYSAgZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQgICBwYXRoICAgICBmcm9tICdwYXRoJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFwR2VuZXJhdG9yIHtcblxuICAgIGNvbnN0cnVjdG9yKHN0cmluZ2lmeSwgcm9vdCwgb3B0cykge1xuICAgICAgICB0aGlzLnN0cmluZ2lmeSA9IHN0cmluZ2lmeTtcbiAgICAgICAgdGhpcy5tYXBPcHRzICAgPSBvcHRzLm1hcCB8fCB7IH07XG4gICAgICAgIHRoaXMucm9vdCAgICAgID0gcm9vdDtcbiAgICAgICAgdGhpcy5vcHRzICAgICAgPSBvcHRzO1xuICAgIH1cblxuICAgIGlzTWFwKCkge1xuICAgICAgICBpZiAoIHR5cGVvZiB0aGlzLm9wdHMubWFwICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgIHJldHVybiAhIXRoaXMub3B0cy5tYXA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcmV2aW91cygpLmxlbmd0aCA+IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmV2aW91cygpIHtcbiAgICAgICAgaWYgKCAhdGhpcy5wcmV2aW91c01hcHMgKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzTWFwcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5yb290LndhbGsoIG5vZGUgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggbm9kZS5zb3VyY2UgJiYgbm9kZS5zb3VyY2UuaW5wdXQubWFwICkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWFwID0gbm9kZS5zb3VyY2UuaW5wdXQubWFwO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMucHJldmlvdXNNYXBzLmluZGV4T2YobWFwKSA9PT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzTWFwcy5wdXNoKG1hcCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnByZXZpb3VzTWFwcztcbiAgICB9XG5cbiAgICBpc0lubGluZSgpIHtcbiAgICAgICAgaWYgKCB0eXBlb2YgdGhpcy5tYXBPcHRzLmlubGluZSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXBPcHRzLmlubGluZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhbm5vdGF0aW9uID0gdGhpcy5tYXBPcHRzLmFubm90YXRpb247XG4gICAgICAgIGlmICggdHlwZW9mIGFubm90YXRpb24gIT09ICd1bmRlZmluZWQnICYmIGFubm90YXRpb24gIT09IHRydWUgKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHRoaXMucHJldmlvdXMoKS5sZW5ndGggKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcmV2aW91cygpLnNvbWUoIGkgPT4gaS5pbmxpbmUgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNTb3VyY2VzQ29udGVudCgpIHtcbiAgICAgICAgaWYgKCB0eXBlb2YgdGhpcy5tYXBPcHRzLnNvdXJjZXNDb250ZW50ICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1hcE9wdHMuc291cmNlc0NvbnRlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCB0aGlzLnByZXZpb3VzKCkubGVuZ3RoICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJldmlvdXMoKS5zb21lKCBpID0+IGkud2l0aENvbnRlbnQoKSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGVhckFubm90YXRpb24oKSB7XG4gICAgICAgIGlmICggdGhpcy5tYXBPcHRzLmFubm90YXRpb24gPT09IGZhbHNlICkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBub2RlO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IHRoaXMucm9vdC5ub2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgICAgIG5vZGUgPSB0aGlzLnJvb3Qubm9kZXNbaV07XG4gICAgICAgICAgICBpZiAoIG5vZGUudHlwZSAhPT0gJ2NvbW1lbnQnICkgY29udGludWU7XG4gICAgICAgICAgICBpZiAoIG5vZGUudGV4dC5pbmRleE9mKCcjIHNvdXJjZU1hcHBpbmdVUkw9JykgPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb290LnJlbW92ZUNoaWxkKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0U291cmNlc0NvbnRlbnQoKSB7XG4gICAgICAgIGxldCBhbHJlYWR5ID0geyB9O1xuICAgICAgICB0aGlzLnJvb3Qud2Fsayggbm9kZSA9PiB7XG4gICAgICAgICAgICBpZiAoIG5vZGUuc291cmNlICkge1xuICAgICAgICAgICAgICAgIGxldCBmcm9tID0gbm9kZS5zb3VyY2UuaW5wdXQuZnJvbTtcbiAgICAgICAgICAgICAgICBpZiAoIGZyb20gJiYgIWFscmVhZHlbZnJvbV0gKSB7XG4gICAgICAgICAgICAgICAgICAgIGFscmVhZHlbZnJvbV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVsYXRpdmUgPSB0aGlzLnJlbGF0aXZlKGZyb20pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXRTb3VyY2VDb250ZW50KHJlbGF0aXZlLCBub2RlLnNvdXJjZS5pbnB1dC5jc3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXBwbHlQcmV2TWFwcygpIHtcbiAgICAgICAgZm9yICggbGV0IHByZXYgb2YgdGhpcy5wcmV2aW91cygpICkge1xuICAgICAgICAgICAgbGV0IGZyb20gPSB0aGlzLnJlbGF0aXZlKHByZXYuZmlsZSk7XG4gICAgICAgICAgICBsZXQgcm9vdCA9IHByZXYucm9vdCB8fCBwYXRoLmRpcm5hbWUocHJldi5maWxlKTtcbiAgICAgICAgICAgIGxldCBtYXA7XG5cbiAgICAgICAgICAgIGlmICggdGhpcy5tYXBPcHRzLnNvdXJjZXNDb250ZW50ID09PSBmYWxzZSApIHtcbiAgICAgICAgICAgICAgICBtYXAgPSBuZXcgbW96aWxsYS5Tb3VyY2VNYXBDb25zdW1lcihwcmV2LnRleHQpO1xuICAgICAgICAgICAgICAgIGlmICggbWFwLnNvdXJjZXNDb250ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICBtYXAuc291cmNlc0NvbnRlbnQgPSBtYXAuc291cmNlc0NvbnRlbnQubWFwKCAoKSA9PiBudWxsICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtYXAgPSBwcmV2LmNvbnN1bWVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubWFwLmFwcGx5U291cmNlTWFwKG1hcCwgZnJvbSwgdGhpcy5yZWxhdGl2ZShyb290KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc0Fubm90YXRpb24oKSB7XG4gICAgICAgIGlmICggdGhpcy5pc0lubGluZSgpICkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiB0aGlzLm1hcE9wdHMuYW5ub3RhdGlvbiAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXBPcHRzLmFubm90YXRpb247XG4gICAgICAgIH0gZWxzZSBpZiAoIHRoaXMucHJldmlvdXMoKS5sZW5ndGggKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcmV2aW91cygpLnNvbWUoIGkgPT4gaS5hbm5vdGF0aW9uICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZEFubm90YXRpb24oKSB7XG4gICAgICAgIGxldCBjb250ZW50O1xuXG4gICAgICAgIGlmICggdGhpcy5pc0lubGluZSgpICkge1xuICAgICAgICAgICAgY29udGVudCA9ICdkYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LCcgK1xuICAgICAgICAgICAgICAgICAgICAgICBCYXNlNjQuZW5jb2RlKCB0aGlzLm1hcC50b1N0cmluZygpICk7XG5cbiAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mIHRoaXMubWFwT3B0cy5hbm5vdGF0aW9uID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLm1hcE9wdHMuYW5ub3RhdGlvbjtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGVudCA9IHRoaXMub3V0cHV0RmlsZSgpICsgJy5tYXAnO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVvbCAgID0gJ1xcbic7XG4gICAgICAgIGlmICggdGhpcy5jc3MuaW5kZXhPZignXFxyXFxuJykgIT09IC0xICkgZW9sID0gJ1xcclxcbic7XG5cbiAgICAgICAgdGhpcy5jc3MgKz0gZW9sICsgJy8qIyBzb3VyY2VNYXBwaW5nVVJMPScgKyBjb250ZW50ICsgJyAqLyc7XG4gICAgfVxuXG4gICAgb3V0cHV0RmlsZSgpIHtcbiAgICAgICAgaWYgKCB0aGlzLm9wdHMudG8gKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZSh0aGlzLm9wdHMudG8pO1xuICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLm9wdHMuZnJvbSApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbGF0aXZlKHRoaXMub3B0cy5mcm9tKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAndG8uY3NzJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdlbmVyYXRlTWFwKCkge1xuICAgICAgICB0aGlzLmdlbmVyYXRlU3RyaW5nKCk7XG4gICAgICAgIGlmICggdGhpcy5pc1NvdXJjZXNDb250ZW50KCkgKSAgICB0aGlzLnNldFNvdXJjZXNDb250ZW50KCk7XG4gICAgICAgIGlmICggdGhpcy5wcmV2aW91cygpLmxlbmd0aCA+IDAgKSB0aGlzLmFwcGx5UHJldk1hcHMoKTtcbiAgICAgICAgaWYgKCB0aGlzLmlzQW5ub3RhdGlvbigpICkgICAgICAgIHRoaXMuYWRkQW5ub3RhdGlvbigpO1xuXG4gICAgICAgIGlmICggdGhpcy5pc0lubGluZSgpICkge1xuICAgICAgICAgICAgcmV0dXJuIFt0aGlzLmNzc107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW3RoaXMuY3NzLCB0aGlzLm1hcF07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWxhdGl2ZShmaWxlKSB7XG4gICAgICAgIGlmICggZmlsZS5pbmRleE9mKCc8JykgPT09IDAgKSByZXR1cm4gZmlsZTtcbiAgICAgICAgaWYgKCAvXlxcdys6XFwvXFwvLy50ZXN0KGZpbGUpICkgcmV0dXJuIGZpbGU7XG5cbiAgICAgICAgbGV0IGZyb20gPSB0aGlzLm9wdHMudG8gPyBwYXRoLmRpcm5hbWUodGhpcy5vcHRzLnRvKSA6ICcuJztcblxuICAgICAgICBpZiAoIHR5cGVvZiB0aGlzLm1hcE9wdHMuYW5ub3RhdGlvbiA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBmcm9tID0gcGF0aC5kaXJuYW1lKCBwYXRoLnJlc29sdmUoZnJvbSwgdGhpcy5tYXBPcHRzLmFubm90YXRpb24pICk7XG4gICAgICAgIH1cblxuICAgICAgICBmaWxlID0gcGF0aC5yZWxhdGl2ZShmcm9tLCBmaWxlKTtcbiAgICAgICAgaWYgKCBwYXRoLnNlcCA9PT0gJ1xcXFwnICkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGUucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzb3VyY2VQYXRoKG5vZGUpIHtcbiAgICAgICAgaWYgKCB0aGlzLm1hcE9wdHMuZnJvbSApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1hcE9wdHMuZnJvbTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbGF0aXZlKG5vZGUuc291cmNlLmlucHV0LmZyb20pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2VuZXJhdGVTdHJpbmcoKSB7XG4gICAgICAgIHRoaXMuY3NzID0gJyc7XG4gICAgICAgIHRoaXMubWFwID0gbmV3IG1vemlsbGEuU291cmNlTWFwR2VuZXJhdG9yKHsgZmlsZTogdGhpcy5vdXRwdXRGaWxlKCkgfSk7XG5cbiAgICAgICAgbGV0IGxpbmUgICA9IDE7XG4gICAgICAgIGxldCBjb2x1bW4gPSAxO1xuXG4gICAgICAgIGxldCBsaW5lcywgbGFzdDtcbiAgICAgICAgdGhpcy5zdHJpbmdpZnkodGhpcy5yb290LCAoc3RyLCBub2RlLCB0eXBlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNzcyArPSBzdHI7XG5cbiAgICAgICAgICAgIGlmICggbm9kZSAmJiB0eXBlICE9PSAnZW5kJyApIHtcbiAgICAgICAgICAgICAgICBpZiAoIG5vZGUuc291cmNlICYmIG5vZGUuc291cmNlLnN0YXJ0ICkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRNYXBwaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogICAgdGhpcy5zb3VyY2VQYXRoKG5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVkOiB7IGxpbmUsIGNvbHVtbjogY29sdW1uIC0gMSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6ICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZTogICBub2RlLnNvdXJjZS5zdGFydC5saW5lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogbm9kZS5zb3VyY2Uuc3RhcnQuY29sdW1uIC0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRNYXBwaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogICAgJzxubyBzb3VyY2U+JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiAgeyBsaW5lOiAxLCBjb2x1bW46IDAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlZDogeyBsaW5lLCBjb2x1bW46IGNvbHVtbiAtIDEgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxpbmVzID0gc3RyLm1hdGNoKC9cXG4vZyk7XG4gICAgICAgICAgICBpZiAoIGxpbmVzICkge1xuICAgICAgICAgICAgICAgIGxpbmUgICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsYXN0ICAgPSBzdHIubGFzdEluZGV4T2YoJ1xcbicpO1xuICAgICAgICAgICAgICAgIGNvbHVtbiA9IHN0ci5sZW5ndGggLSBsYXN0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb2x1bW4gKz0gc3RyLmxlbmd0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBub2RlICYmIHR5cGUgIT09ICdzdGFydCcgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBub2RlLnNvdXJjZSAmJiBub2RlLnNvdXJjZS5lbmQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZE1hcHBpbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiAgICB0aGlzLnNvdXJjZVBhdGgobm9kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZWQ6IHsgbGluZSwgY29sdW1uOiBjb2x1bW4gLSAxIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lOiAgIG5vZGUuc291cmNlLmVuZC5saW5lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogbm9kZS5zb3VyY2UuZW5kLmNvbHVtblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRNYXBwaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogICAgJzxubyBzb3VyY2U+JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiAgeyBsaW5lOiAxLCBjb2x1bW46IDAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlZDogeyBsaW5lLCBjb2x1bW46IGNvbHVtbiAtIDEgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdlbmVyYXRlKCkge1xuICAgICAgICB0aGlzLmNsZWFyQW5ub3RhdGlvbigpO1xuXG4gICAgICAgIGlmICggdGhpcy5pc01hcCgpICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2VuZXJhdGVNYXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSAnJztcbiAgICAgICAgICAgIHRoaXMuc3RyaW5naWZ5KHRoaXMucm9vdCwgaSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBbcmVzdWx0XTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuIiwiaW1wb3J0IENzc1N5bnRheEVycm9yIGZyb20gJy4vY3NzLXN5bnRheC1lcnJvcic7XG5pbXBvcnQgU3RyaW5naWZpZXIgICAgZnJvbSAnLi9zdHJpbmdpZmllcic7XG5pbXBvcnQgc3RyaW5naWZ5ICAgICAgZnJvbSAnLi9zdHJpbmdpZnknO1xuaW1wb3J0IHdhcm5PbmNlICAgICAgIGZyb20gJy4vd2Fybi1vbmNlJztcblxubGV0IGNsb25lTm9kZSA9IGZ1bmN0aW9uIChvYmosIHBhcmVudCkge1xuICAgIGxldCBjbG9uZWQgPSBuZXcgb2JqLmNvbnN0cnVjdG9yKCk7XG5cbiAgICBmb3IgKCBsZXQgaSBpbiBvYmogKSB7XG4gICAgICAgIGlmICggIW9iai5oYXNPd25Qcm9wZXJ0eShpKSApIGNvbnRpbnVlO1xuICAgICAgICBsZXQgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGxldCB0eXBlICA9IHR5cGVvZiB2YWx1ZTtcblxuICAgICAgICBpZiAoIGkgPT09ICdwYXJlbnQnICYmIHR5cGUgPT09ICdvYmplY3QnICkge1xuICAgICAgICAgICAgaWYgKHBhcmVudCkgY2xvbmVkW2ldID0gcGFyZW50O1xuICAgICAgICB9IGVsc2UgaWYgKCBpID09PSAnc291cmNlJyApIHtcbiAgICAgICAgICAgIGNsb25lZFtpXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKCB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5ICkge1xuICAgICAgICAgICAgY2xvbmVkW2ldID0gdmFsdWUubWFwKCBqID0+IGNsb25lTm9kZShqLCBjbG9uZWQpICk7XG4gICAgICAgIH0gZWxzZSBpZiAoIGkgIT09ICdiZWZvcmUnICAmJiBpICE9PSAnYWZ0ZXInICYmXG4gICAgICAgICAgICAgICAgICAgIGkgIT09ICdiZXR3ZWVuJyAmJiBpICE9PSAnc2VtaWNvbG9uJyApIHtcbiAgICAgICAgICAgIGlmICggdHlwZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwgKSB2YWx1ZSA9IGNsb25lTm9kZSh2YWx1ZSk7XG4gICAgICAgICAgICBjbG9uZWRbaV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjbG9uZWQ7XG59O1xuXG4vKipcbiAqIEFsbCBub2RlIGNsYXNzZXMgaW5oZXJpdCB0aGUgZm9sbG93aW5nIGNvbW1vbiBtZXRob2RzLlxuICpcbiAqIEBhYnN0cmFjdFxuICovXG5jbGFzcyBOb2RlIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbZGVmYXVsdHNdIC0gdmFsdWUgZm9yIG5vZGUgcHJvcGVydGllc1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGRlZmF1bHRzID0geyB9KSB7XG4gICAgICAgIHRoaXMucmF3cyA9IHsgfTtcbiAgICAgICAgZm9yICggbGV0IG5hbWUgaW4gZGVmYXVsdHMgKSB7XG4gICAgICAgICAgICB0aGlzW25hbWVdID0gZGVmYXVsdHNbbmFtZV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgQ3NzU3ludGF4RXJyb3IgaW5zdGFuY2UgY29udGFpbmluZyB0aGUgb3JpZ2luYWwgcG9zaXRpb25cbiAgICAgKiBvZiB0aGUgbm9kZSBpbiB0aGUgc291cmNlLCBzaG93aW5nIGxpbmUgYW5kIGNvbHVtbiBudW1iZXJzIGFuZCBhbHNvXG4gICAgICogYSBzbWFsbCBleGNlcnB0IHRvIGZhY2lsaXRhdGUgZGVidWdnaW5nLlxuICAgICAqXG4gICAgICogSWYgcHJlc2VudCwgYW4gaW5wdXQgc291cmNlIG1hcCB3aWxsIGJlIHVzZWQgdG8gZ2V0IHRoZSBvcmlnaW5hbCBwb3NpdGlvblxuICAgICAqIG9mIHRoZSBzb3VyY2UsIGV2ZW4gZnJvbSBhIHByZXZpb3VzIGNvbXBpbGF0aW9uIHN0ZXBcbiAgICAgKiAoZS5nLiwgZnJvbSBTYXNzIGNvbXBpbGF0aW9uKS5cbiAgICAgKlxuICAgICAqIFRoaXMgbWV0aG9kIHByb2R1Y2VzIHZlcnkgdXNlZnVsIGVycm9yIG1lc3NhZ2VzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgICAgIC0gZXJyb3IgZGVzY3JpcHRpb25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdHNdICAgICAgLSBvcHRpb25zXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG9wdHMucGx1Z2luIC0gcGx1Z2luIG5hbWUgdGhhdCBjcmVhdGVkIHRoaXMgZXJyb3IuXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUG9zdENTUyB3aWxsIHNldCBpdCBhdXRvbWF0aWNhbGx5LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRzLndvcmQgICAtIGEgd29yZCBpbnNpZGUgYSBub2Rl4oCZcyBzdHJpbmcgdGhhdCBzaG91bGRcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZSBoaWdobGlnaHRlZCBhcyB0aGUgc291cmNlIG9mIHRoZSBlcnJvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRzLmluZGV4ICAtIGFuIGluZGV4IGluc2lkZSBhIG5vZGXigJlzIHN0cmluZyB0aGF0IHNob3VsZFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlIGhpZ2hsaWdodGVkIGFzIHRoZSBzb3VyY2Ugb2YgdGhlIGVycm9yXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtDc3NTeW50YXhFcnJvcn0gZXJyb3Igb2JqZWN0IHRvIHRocm93IGl0XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGlmICggIXZhcmlhYmxlc1tuYW1lXSApIHtcbiAgICAgKiAgIHRocm93IGRlY2wuZXJyb3IoJ1Vua25vd24gdmFyaWFibGUgJyArIG5hbWUsIHsgd29yZDogbmFtZSB9KTtcbiAgICAgKiAgIC8vIENzc1N5bnRheEVycm9yOiBwb3N0Y3NzLXZhcnM6YS5zYXNzOjQ6MzogVW5rbm93biB2YXJpYWJsZSAkYmxhY2tcbiAgICAgKiAgIC8vICAgY29sb3I6ICRibGFja1xuICAgICAqICAgLy8gYVxuICAgICAqICAgLy8gICAgICAgICAgXlxuICAgICAqICAgLy8gICBiYWNrZ3JvdW5kOiB3aGl0ZVxuICAgICAqIH1cbiAgICAgKi9cbiAgICBlcnJvcihtZXNzYWdlLCBvcHRzID0geyB9KSB7XG4gICAgICAgIGlmICggdGhpcy5zb3VyY2UgKSB7XG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5wb3NpdGlvbkJ5KG9wdHMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc291cmNlLmlucHV0LmVycm9yKG1lc3NhZ2UsIHBvcy5saW5lLCBwb3MuY29sdW1uLCBvcHRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ3NzU3ludGF4RXJyb3IobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBwcm92aWRlZCBhcyBhIGNvbnZlbmllbmNlIHdyYXBwZXIgZm9yIHtAbGluayBSZXN1bHQjd2Fybn0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1Jlc3VsdH0gcmVzdWx0ICAgICAgLSB0aGUge0BsaW5rIFJlc3VsdH0gaW5zdGFuY2VcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0IHdpbGwgcmVjZWl2ZSB0aGUgd2FybmluZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0ICAgICAgICAtIHdhcm5pbmcgbWVzc2FnZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0c10gICAgICAtIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb3B0cy5wbHVnaW4gLSBwbHVnaW4gbmFtZSB0aGF0IGNyZWF0ZWQgdGhpcyB3YXJuaW5nLlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFBvc3RDU1Mgd2lsbCBzZXQgaXQgYXV0b21hdGljYWxseS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb3B0cy53b3JkICAgLSBhIHdvcmQgaW5zaWRlIGEgbm9kZeKAmXMgc3RyaW5nIHRoYXQgc2hvdWxkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgaGlnaGxpZ2h0ZWQgYXMgdGhlIHNvdXJjZSBvZiB0aGUgd2FybmluZ1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRzLmluZGV4ICAtIGFuIGluZGV4IGluc2lkZSBhIG5vZGXigJlzIHN0cmluZyB0aGF0IHNob3VsZFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlIGhpZ2hsaWdodGVkIGFzIHRoZSBzb3VyY2Ugb2YgdGhlIHdhcm5pbmdcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1dhcm5pbmd9IGNyZWF0ZWQgd2FybmluZyBvYmplY3RcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgcGx1Z2luID0gcG9zdGNzcy5wbHVnaW4oJ3Bvc3Rjc3MtZGVwcmVjYXRlZCcsICgpID0+IHtcbiAgICAgKiAgIHJldHVybiAocm9vdCwgcmVzdWx0KSA9PiB7XG4gICAgICogICAgIHJvb3Qud2Fsa0RlY2xzKCdiYWQnLCBkZWNsID0+IHtcbiAgICAgKiAgICAgICBkZWNsLndhcm4ocmVzdWx0LCAnRGVwcmVjYXRlZCBwcm9wZXJ0eSBiYWQnKTtcbiAgICAgKiAgICAgfSk7XG4gICAgICogICB9O1xuICAgICAqIH0pO1xuICAgICAqL1xuICAgIHdhcm4ocmVzdWx0LCB0ZXh0LCBvcHRzKSB7XG4gICAgICAgIGxldCBkYXRhID0geyBub2RlOiB0aGlzIH07XG4gICAgICAgIGZvciAoIGxldCBpIGluIG9wdHMgKSBkYXRhW2ldID0gb3B0c1tpXTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC53YXJuKHRleHQsIGRhdGEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIG5vZGUgZnJvbSBpdHMgcGFyZW50IGFuZCBjbGVhbnMgdGhlIHBhcmVudCBwcm9wZXJ0aWVzXG4gICAgICogZnJvbSB0aGUgbm9kZSBhbmQgaXRzIGNoaWxkcmVuLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBpZiAoIGRlY2wucHJvcC5tYXRjaCgvXi13ZWJraXQtLykgKSB7XG4gICAgICogICBkZWNsLnJlbW92ZSgpO1xuICAgICAqIH1cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge05vZGV9IG5vZGUgdG8gbWFrZSBjYWxscyBjaGFpblxuICAgICAqL1xuICAgIHJlbW92ZSgpIHtcbiAgICAgICAgaWYgKCB0aGlzLnBhcmVudCApIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGFyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgQ1NTIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG5vZGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ2lmaWVyfHN5bnRheH0gW3N0cmluZ2lmaWVyXSAtIGEgc3ludGF4IHRvIHVzZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW4gc3RyaW5nIGdlbmVyYXRpb25cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gQ1NTIHN0cmluZyBvZiB0aGlzIG5vZGVcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogcG9zdGNzcy5ydWxlKHsgc2VsZWN0b3I6ICdhJyB9KS50b1N0cmluZygpIC8vPT4gXCJhIHt9XCJcbiAgICAgKi9cbiAgICB0b1N0cmluZyhzdHJpbmdpZmllciA9IHN0cmluZ2lmeSkge1xuICAgICAgICBpZiAoIHN0cmluZ2lmaWVyLnN0cmluZ2lmeSApIHN0cmluZ2lmaWVyID0gc3RyaW5naWZpZXIuc3RyaW5naWZ5O1xuICAgICAgICBsZXQgcmVzdWx0ICA9ICcnO1xuICAgICAgICBzdHJpbmdpZmllcih0aGlzLCBpID0+IHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgY2xvbmUgb2YgdGhlIG5vZGUuXG4gICAgICpcbiAgICAgKiBUaGUgcmVzdWx0aW5nIGNsb25lZCBub2RlIGFuZCBpdHMgKGNsb25lZCkgY2hpbGRyZW4gd2lsbCBoYXZlXG4gICAgICogYSBjbGVhbiBwYXJlbnQgYW5kIGNvZGUgc3R5bGUgcHJvcGVydGllcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3ZlcnJpZGVzXSAtIG5ldyBwcm9wZXJ0aWVzIHRvIG92ZXJyaWRlIGluIHRoZSBjbG9uZS5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgY2xvbmVkID0gZGVjbC5jbG9uZSh7IHByb3A6ICctbW96LScgKyBkZWNsLnByb3AgfSk7XG4gICAgICogY2xvbmVkLnJhd3MuYmVmb3JlICAvLz0+IHVuZGVmaW5lZFxuICAgICAqIGNsb25lZC5wYXJlbnQgICAgICAgLy89PiB1bmRlZmluZWRcbiAgICAgKiBjbG9uZWQudG9TdHJpbmcoKSAgIC8vPT4gLW1vei10cmFuc2Zvcm06IHNjYWxlKDApXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOb2RlfSBjbG9uZSBvZiB0aGUgbm9kZVxuICAgICAqL1xuICAgIGNsb25lKG92ZXJyaWRlcyA9IHsgfSkge1xuICAgICAgICBsZXQgY2xvbmVkID0gY2xvbmVOb2RlKHRoaXMpO1xuICAgICAgICBmb3IgKCBsZXQgbmFtZSBpbiBvdmVycmlkZXMgKSB7XG4gICAgICAgICAgICBjbG9uZWRbbmFtZV0gPSBvdmVycmlkZXNbbmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNsb25lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaG9ydGN1dCB0byBjbG9uZSB0aGUgbm9kZSBhbmQgaW5zZXJ0IHRoZSByZXN1bHRpbmcgY2xvbmVkIG5vZGVcbiAgICAgKiBiZWZvcmUgdGhlIGN1cnJlbnQgbm9kZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3ZlcnJpZGVzXSAtIG5ldyBwcm9wZXJ0aWVzIHRvIG92ZXJyaWRlIGluIHRoZSBjbG9uZS5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogZGVjbC5jbG9uZUJlZm9yZSh7IHByb3A6ICctbW96LScgKyBkZWNsLnByb3AgfSk7XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOb2RlfSAtIG5ldyBub2RlXG4gICAgICovXG4gICAgY2xvbmVCZWZvcmUob3ZlcnJpZGVzID0geyB9KSB7XG4gICAgICAgIGxldCBjbG9uZWQgPSB0aGlzLmNsb25lKG92ZXJyaWRlcyk7XG4gICAgICAgIHRoaXMucGFyZW50Lmluc2VydEJlZm9yZSh0aGlzLCBjbG9uZWQpO1xuICAgICAgICByZXR1cm4gY2xvbmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3J0Y3V0IHRvIGNsb25lIHRoZSBub2RlIGFuZCBpbnNlcnQgdGhlIHJlc3VsdGluZyBjbG9uZWQgbm9kZVxuICAgICAqIGFmdGVyIHRoZSBjdXJyZW50IG5vZGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW292ZXJyaWRlc10gLSBuZXcgcHJvcGVydGllcyB0byBvdmVycmlkZSBpbiB0aGUgY2xvbmUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOb2RlfSAtIG5ldyBub2RlXG4gICAgICovXG4gICAgY2xvbmVBZnRlcihvdmVycmlkZXMgPSB7IH0pIHtcbiAgICAgICAgbGV0IGNsb25lZCA9IHRoaXMuY2xvbmUob3ZlcnJpZGVzKTtcbiAgICAgICAgdGhpcy5wYXJlbnQuaW5zZXJ0QWZ0ZXIodGhpcywgY2xvbmVkKTtcbiAgICAgICAgcmV0dXJuIGNsb25lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnNlcnRzIG5vZGUocykgYmVmb3JlIHRoZSBjdXJyZW50IG5vZGUgYW5kIHJlbW92ZXMgdGhlIGN1cnJlbnQgbm9kZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Li4uTm9kZX0gbm9kZXMgLSBub2RlKHMpIHRvIHJlcGxhY2UgY3VycmVudCBvbmVcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogaWYgKCBhdHJ1bGUubmFtZSA9PSAnbWl4aW4nICkge1xuICAgICAqICAgYXRydWxlLnJlcGxhY2VXaXRoKG1peGluUnVsZXNbYXRydWxlLnBhcmFtc10pO1xuICAgICAqIH1cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge05vZGV9IGN1cnJlbnQgbm9kZSB0byBtZXRob2RzIGNoYWluXG4gICAgICovXG4gICAgcmVwbGFjZVdpdGgoLi4ubm9kZXMpIHtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuaW5zZXJ0QmVmb3JlKHRoaXMsIG5vZGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgbm9kZSBmcm9tIGl0cyBjdXJyZW50IHBhcmVudCBhbmQgaW5zZXJ0cyBpdFxuICAgICAqIGF0IHRoZSBlbmQgb2YgYG5ld1BhcmVudGAuXG4gICAgICpcbiAgICAgKiBUaGlzIHdpbGwgY2xlYW4gdGhlIGBiZWZvcmVgIGFuZCBgYWZ0ZXJgIGNvZGUge0BsaW5rIE5vZGUjcmF3c30gZGF0YVxuICAgICAqIGZyb20gdGhlIG5vZGUgYW5kIHJlcGxhY2UgdGhlbSB3aXRoIHRoZSBpbmRlbnRhdGlvbiBzdHlsZSBvZiBgbmV3UGFyZW50YC5cbiAgICAgKiBJdCB3aWxsIGFsc28gY2xlYW4gdGhlIGBiZXR3ZWVuYCBwcm9wZXJ0eVxuICAgICAqIGlmIGBuZXdQYXJlbnRgIGlzIGluIGFub3RoZXIge0BsaW5rIFJvb3R9LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtDb250YWluZXJ9IG5ld1BhcmVudCAtIGNvbnRhaW5lciBub2RlIHdoZXJlIHRoZSBjdXJyZW50IG5vZGVcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBiZSBtb3ZlZFxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBhdHJ1bGUubW92ZVRvKGF0cnVsZS5yb290KCkpO1xuICAgICAqXG4gICAgICogQHJldHVybiB7Tm9kZX0gY3VycmVudCBub2RlIHRvIG1ldGhvZHMgY2hhaW5cbiAgICAgKi9cbiAgICBtb3ZlVG8obmV3UGFyZW50KSB7XG4gICAgICAgIHRoaXMuY2xlYW5SYXdzKHRoaXMucm9vdCgpID09PSBuZXdQYXJlbnQucm9vdCgpKTtcbiAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgbmV3UGFyZW50LmFwcGVuZCh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgbm9kZSBmcm9tIGl0cyBjdXJyZW50IHBhcmVudCBhbmQgaW5zZXJ0cyBpdCBpbnRvXG4gICAgICogYSBuZXcgcGFyZW50IGJlZm9yZSBgb3RoZXJOb2RlYC5cbiAgICAgKlxuICAgICAqIFRoaXMgd2lsbCBhbHNvIGNsZWFuIHRoZSBub2Rl4oCZcyBjb2RlIHN0eWxlIHByb3BlcnRpZXMganVzdCBhcyBpdCB3b3VsZFxuICAgICAqIGluIHtAbGluayBOb2RlI21vdmVUb30uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge05vZGV9IG90aGVyTm9kZSAtIG5vZGUgdGhhdCB3aWxsIGJlIGJlZm9yZSBjdXJyZW50IG5vZGVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge05vZGV9IGN1cnJlbnQgbm9kZSB0byBtZXRob2RzIGNoYWluXG4gICAgICovXG4gICAgbW92ZUJlZm9yZShvdGhlck5vZGUpIHtcbiAgICAgICAgdGhpcy5jbGVhblJhd3ModGhpcy5yb290KCkgPT09IG90aGVyTm9kZS5yb290KCkpO1xuICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICBvdGhlck5vZGUucGFyZW50Lmluc2VydEJlZm9yZShvdGhlck5vZGUsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBub2RlIGZyb20gaXRzIGN1cnJlbnQgcGFyZW50IGFuZCBpbnNlcnRzIGl0IGludG9cbiAgICAgKiBhIG5ldyBwYXJlbnQgYWZ0ZXIgYG90aGVyTm9kZWAuXG4gICAgICpcbiAgICAgKiBUaGlzIHdpbGwgYWxzbyBjbGVhbiB0aGUgbm9kZeKAmXMgY29kZSBzdHlsZSBwcm9wZXJ0aWVzIGp1c3QgYXMgaXQgd291bGRcbiAgICAgKiBpbiB7QGxpbmsgTm9kZSNtb3ZlVG99LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtOb2RlfSBvdGhlck5vZGUgLSBub2RlIHRoYXQgd2lsbCBiZSBhZnRlciBjdXJyZW50IG5vZGVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge05vZGV9IGN1cnJlbnQgbm9kZSB0byBtZXRob2RzIGNoYWluXG4gICAgICovXG4gICAgbW92ZUFmdGVyKG90aGVyTm9kZSkge1xuICAgICAgICB0aGlzLmNsZWFuUmF3cyh0aGlzLnJvb3QoKSA9PT0gb3RoZXJOb2RlLnJvb3QoKSk7XG4gICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgIG90aGVyTm9kZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIob3RoZXJOb2RlLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbmV4dCBjaGlsZCBvZiB0aGUgbm9kZeKAmXMgcGFyZW50LlxuICAgICAqIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgdGhlIGN1cnJlbnQgbm9kZSBpcyB0aGUgbGFzdCBjaGlsZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge05vZGV8dW5kZWZpbmVkfSBuZXh0IG5vZGVcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogaWYgKCBjb21tZW50LnRleHQgPT09ICdkZWxldGUgbmV4dCcgKSB7XG4gICAgICogICBjb25zdCBuZXh0ID0gY29tbWVudC5uZXh0KCk7XG4gICAgICogICBpZiAoIG5leHQgKSB7XG4gICAgICogICAgIG5leHQucmVtb3ZlKCk7XG4gICAgICogICB9XG4gICAgICogfVxuICAgICAqL1xuICAgIG5leHQoKSB7XG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMucGFyZW50LmluZGV4KHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQubm9kZXNbaW5kZXggKyAxXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBwcmV2aW91cyBjaGlsZCBvZiB0aGUgbm9kZeKAmXMgcGFyZW50LlxuICAgICAqIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgdGhlIGN1cnJlbnQgbm9kZSBpcyB0aGUgZmlyc3QgY2hpbGQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOb2RlfHVuZGVmaW5lZH0gcHJldmlvdXMgbm9kZVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBhbm5vdGF0aW9uID0gZGVjbC5wcmV2KCk7XG4gICAgICogaWYgKCBhbm5vdGF0aW9uLnR5cGUgPT0gJ2NvbW1lbnQnICkge1xuICAgICAqICByZWFkQW5ub3RhdGlvbihhbm5vdGF0aW9uLnRleHQpO1xuICAgICAqIH1cbiAgICAgKi9cbiAgICBwcmV2KCkge1xuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnBhcmVudC5pbmRleCh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50Lm5vZGVzW2luZGV4IC0gMV07XG4gICAgfVxuXG4gICAgdG9KU09OKCkge1xuICAgICAgICBsZXQgZml4ZWQgPSB7IH07XG5cbiAgICAgICAgZm9yICggbGV0IG5hbWUgaW4gdGhpcyApIHtcbiAgICAgICAgICAgIGlmICggIXRoaXMuaGFzT3duUHJvcGVydHkobmFtZSkgKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmICggbmFtZSA9PT0gJ3BhcmVudCcgKSBjb250aW51ZTtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXNbbmFtZV07XG5cbiAgICAgICAgICAgIGlmICggdmFsdWUgaW5zdGFuY2VvZiBBcnJheSApIHtcbiAgICAgICAgICAgICAgICBmaXhlZFtuYW1lXSA9IHZhbHVlLm1hcCggaSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggdHlwZW9mIGkgPT09ICdvYmplY3QnICYmIGkudG9KU09OICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGkudG9KU09OKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS50b0pTT04gKSB7XG4gICAgICAgICAgICAgICAgZml4ZWRbbmFtZV0gPSB2YWx1ZS50b0pTT04oKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZml4ZWRbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaXhlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEge0BsaW5rIE5vZGUjcmF3c30gdmFsdWUuIElmIHRoZSBub2RlIGlzIG1pc3NpbmdcbiAgICAgKiB0aGUgY29kZSBzdHlsZSBwcm9wZXJ0eSAoYmVjYXVzZSB0aGUgbm9kZSB3YXMgbWFudWFsbHkgYnVpbHQgb3IgY2xvbmVkKSxcbiAgICAgKiBQb3N0Q1NTIHdpbGwgdHJ5IHRvIGF1dG9kZXRlY3QgdGhlIGNvZGUgc3R5bGUgcHJvcGVydHkgYnkgbG9va2luZ1xuICAgICAqIGF0IG90aGVyIG5vZGVzIGluIHRoZSB0cmVlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHByb3AgICAgICAgICAgLSBuYW1lIG9mIGNvZGUgc3R5bGUgcHJvcGVydHlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2RlZmF1bHRUeXBlXSAtIG5hbWUgb2YgZGVmYXVsdCB2YWx1ZSwgaXQgY2FuIGJlIG1pc3NlZFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdGhlIHZhbHVlIGlzIHRoZSBzYW1lIGFzIHByb3BcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3Qgcm9vdCA9IHBvc3Rjc3MucGFyc2UoJ2EgeyBiYWNrZ3JvdW5kOiB3aGl0ZSB9Jyk7XG4gICAgICogcm9vdC5ub2Rlc1swXS5hcHBlbmQoeyBwcm9wOiAnY29sb3InLCB2YWx1ZTogJ2JsYWNrJyB9KTtcbiAgICAgKiByb290Lm5vZGVzWzBdLm5vZGVzWzFdLnJhd3MuYmVmb3JlICAgLy89PiB1bmRlZmluZWRcbiAgICAgKiByb290Lm5vZGVzWzBdLm5vZGVzWzFdLnJhdygnYmVmb3JlJykgLy89PiAnICdcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gY29kZSBzdHlsZSB2YWx1ZVxuICAgICAqL1xuICAgIHJhdyhwcm9wLCBkZWZhdWx0VHlwZSkge1xuICAgICAgICBsZXQgc3RyID0gbmV3IFN0cmluZ2lmaWVyKCk7XG4gICAgICAgIHJldHVybiBzdHIucmF3KHRoaXMsIHByb3AsIGRlZmF1bHRUeXBlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyB0aGUgUm9vdCBpbnN0YW5jZSBvZiB0aGUgbm9kZeKAmXMgdHJlZS5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogcm9vdC5ub2Rlc1swXS5ub2Rlc1swXS5yb290KCkgPT09IHJvb3RcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Jvb3R9IHJvb3QgcGFyZW50XG4gICAgICovXG4gICAgcm9vdCgpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRoaXM7XG4gICAgICAgIHdoaWxlICggcmVzdWx0LnBhcmVudCApIHJlc3VsdCA9IHJlc3VsdC5wYXJlbnQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgY2xlYW5SYXdzKGtlZXBCZXR3ZWVuKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnJhd3MuYmVmb3JlO1xuICAgICAgICBkZWxldGUgdGhpcy5yYXdzLmFmdGVyO1xuICAgICAgICBpZiAoICFrZWVwQmV0d2VlbiApIGRlbGV0ZSB0aGlzLnJhd3MuYmV0d2VlbjtcbiAgICB9XG5cbiAgICBwb3NpdGlvbkluc2lkZShpbmRleCkge1xuICAgICAgICBsZXQgc3RyaW5nID0gdGhpcy50b1N0cmluZygpO1xuICAgICAgICBsZXQgY29sdW1uID0gdGhpcy5zb3VyY2Uuc3RhcnQuY29sdW1uO1xuICAgICAgICBsZXQgbGluZSAgID0gdGhpcy5zb3VyY2Uuc3RhcnQubGluZTtcblxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBpbmRleDsgaSsrICkge1xuICAgICAgICAgICAgaWYgKCBzdHJpbmdbaV0gPT09ICdcXG4nICkge1xuICAgICAgICAgICAgICAgIGNvbHVtbiA9IDE7XG4gICAgICAgICAgICAgICAgbGluZSAgKz0gMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29sdW1uICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBsaW5lLCBjb2x1bW4gfTtcbiAgICB9XG5cbiAgICBwb3NpdGlvbkJ5KG9wdHMpIHtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuc291cmNlLnN0YXJ0O1xuICAgICAgICBpZiAoIG9wdHMuaW5kZXggKSB7XG4gICAgICAgICAgICBwb3MgPSB0aGlzLnBvc2l0aW9uSW5zaWRlKG9wdHMuaW5kZXgpO1xuICAgICAgICB9IGVsc2UgaWYgKCBvcHRzLndvcmQgKSB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnRvU3RyaW5nKCkuaW5kZXhPZihvcHRzLndvcmQpO1xuICAgICAgICAgICAgaWYgKCBpbmRleCAhPT0gLTEgKSBwb3MgPSB0aGlzLnBvc2l0aW9uSW5zaWRlKGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zO1xuICAgIH1cblxuICAgIHJlbW92ZVNlbGYoKSB7XG4gICAgICAgIHdhcm5PbmNlKCdOb2RlI3JlbW92ZVNlbGYgaXMgZGVwcmVjYXRlZC4gVXNlIE5vZGUjcmVtb3ZlLicpO1xuICAgICAgICByZXR1cm4gdGhpcy5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICByZXBsYWNlKG5vZGVzKSB7XG4gICAgICAgIHdhcm5PbmNlKCdOb2RlI3JlcGxhY2UgaXMgZGVwcmVjYXRlZC4gVXNlIE5vZGUjcmVwbGFjZVdpdGgnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZVdpdGgobm9kZXMpO1xuICAgIH1cblxuICAgIHN0eWxlKG93biwgZGV0ZWN0KSB7XG4gICAgICAgIHdhcm5PbmNlKCdOb2RlI3N0eWxlKCkgaXMgZGVwcmVjYXRlZC4gVXNlIE5vZGUjcmF3KCknKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmF3KG93biwgZGV0ZWN0KTtcbiAgICB9XG5cbiAgICBjbGVhblN0eWxlcyhrZWVwQmV0d2Vlbikge1xuICAgICAgICB3YXJuT25jZSgnTm9kZSNjbGVhblN0eWxlcygpIGlzIGRlcHJlY2F0ZWQuIFVzZSBOb2RlI2NsZWFuUmF3cygpJyk7XG4gICAgICAgIHJldHVybiB0aGlzLmNsZWFuUmF3cyhrZWVwQmV0d2Vlbik7XG4gICAgfVxuXG4gICAgZ2V0IGJlZm9yZSgpIHtcbiAgICAgICAgd2Fybk9uY2UoJ05vZGUjYmVmb3JlIGlzIGRlcHJlY2F0ZWQuIFVzZSBOb2RlI3Jhd3MuYmVmb3JlJyk7XG4gICAgICAgIHJldHVybiB0aGlzLnJhd3MuYmVmb3JlO1xuICAgIH1cblxuICAgIHNldCBiZWZvcmUodmFsKSB7XG4gICAgICAgIHdhcm5PbmNlKCdOb2RlI2JlZm9yZSBpcyBkZXByZWNhdGVkLiBVc2UgTm9kZSNyYXdzLmJlZm9yZScpO1xuICAgICAgICB0aGlzLnJhd3MuYmVmb3JlID0gdmFsO1xuICAgIH1cblxuICAgIGdldCBiZXR3ZWVuKCkge1xuICAgICAgICB3YXJuT25jZSgnTm9kZSNiZXR3ZWVuIGlzIGRlcHJlY2F0ZWQuIFVzZSBOb2RlI3Jhd3MuYmV0d2VlbicpO1xuICAgICAgICByZXR1cm4gdGhpcy5yYXdzLmJldHdlZW47XG4gICAgfVxuXG4gICAgc2V0IGJldHdlZW4odmFsKSB7XG4gICAgICAgIHdhcm5PbmNlKCdOb2RlI2JldHdlZW4gaXMgZGVwcmVjYXRlZC4gVXNlIE5vZGUjcmF3cy5iZXR3ZWVuJyk7XG4gICAgICAgIHRoaXMucmF3cy5iZXR3ZWVuID0gdmFsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBOb2RlI1xuICAgICAqIEBtZW1iZXIge3N0cmluZ30gdHlwZSAtIFN0cmluZyByZXByZXNlbnRpbmcgdGhlIG5vZGXigJlzIHR5cGUuXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgUG9zc2libGUgdmFsdWVzIGFyZSBgcm9vdGAsIGBhdHJ1bGVgLCBgcnVsZWAsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgYGRlY2xgLCBvciBgY29tbWVudGAuXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHBvc3Rjc3MuZGVjbCh7IHByb3A6ICdjb2xvcicsIHZhbHVlOiAnYmxhY2snIH0pLnR5cGUgLy89PiAnZGVjbCdcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBOb2RlI1xuICAgICAqIEBtZW1iZXIge0NvbnRhaW5lcn0gcGFyZW50IC0gdGhlIG5vZGXigJlzIHBhcmVudCBub2RlLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiByb290Lm5vZGVzWzBdLnBhcmVudCA9PSByb290O1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIE5vZGUjXG4gICAgICogQG1lbWJlciB7c291cmNlfSBzb3VyY2UgLSB0aGUgaW5wdXQgc291cmNlIG9mIHRoZSBub2RlXG4gICAgICpcbiAgICAgKiBUaGUgcHJvcGVydHkgaXMgdXNlZCBpbiBzb3VyY2UgbWFwIGdlbmVyYXRpb24uXG4gICAgICpcbiAgICAgKiBJZiB5b3UgY3JlYXRlIGEgbm9kZSBtYW51YWxseSAoZS5nLiwgd2l0aCBgcG9zdGNzcy5kZWNsKClgKSxcbiAgICAgKiB0aGF0IG5vZGUgd2lsbCBub3QgaGF2ZSBhIGBzb3VyY2VgIHByb3BlcnR5IGFuZCB3aWxsIGJlIGFic2VudFxuICAgICAqIGZyb20gdGhlIHNvdXJjZSBtYXAuIEZvciB0aGlzIHJlYXNvbiwgdGhlIHBsdWdpbiBkZXZlbG9wZXIgc2hvdWxkXG4gICAgICogY29uc2lkZXIgY2xvbmluZyBub2RlcyB0byBjcmVhdGUgbmV3IG9uZXMgKGluIHdoaWNoIGNhc2UgdGhlIG5ldyBub2Rl4oCZc1xuICAgICAqIHNvdXJjZSB3aWxsIHJlZmVyZW5jZSB0aGUgb3JpZ2luYWwsIGNsb25lZCBub2RlKSBvciBzZXR0aW5nXG4gICAgICogdGhlIGBzb3VyY2VgIHByb3BlcnR5IG1hbnVhbGx5LlxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiAvLyBCYWRcbiAgICAgKiBjb25zdCBwcmVmaXhlZCA9IHBvc3Rjc3MuZGVjbCh7XG4gICAgICogICBwcm9wOiAnLW1vei0nICsgZGVjbC5wcm9wLFxuICAgICAqICAgdmFsdWU6IGRlY2wudmFsdWVcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIC8vIEdvb2RcbiAgICAgKiBjb25zdCBwcmVmaXhlZCA9IGRlY2wuY2xvbmUoeyBwcm9wOiAnLW1vei0nICsgZGVjbC5wcm9wIH0pO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiBpZiAoIGF0cnVsZS5uYW1lID09ICdhZGQtbGluaycgKSB7XG4gICAgICogICBjb25zdCBydWxlID0gcG9zdGNzcy5ydWxlKHsgc2VsZWN0b3I6ICdhJywgc291cmNlOiBhdHJ1bGUuc291cmNlIH0pO1xuICAgICAqICAgYXRydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUoYXRydWxlLCBydWxlKTtcbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGRlY2wuc291cmNlLmlucHV0LmZyb20gLy89PiAnL2hvbWUvYWkvYS5zYXNzJ1xuICAgICAqIGRlY2wuc291cmNlLnN0YXJ0ICAgICAgLy89PiB7IGxpbmU6IDEwLCBjb2x1bW46IDIgfVxuICAgICAqIGRlY2wuc291cmNlLmVuZCAgICAgICAgLy89PiB7IGxpbmU6IDEwLCBjb2x1bW46IDEyIH1cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBOb2RlI1xuICAgICAqIEBtZW1iZXIge29iamVjdH0gcmF3cyAtIEluZm9ybWF0aW9uIHRvIGdlbmVyYXRlIGJ5dGUtdG8tYnl0ZSBlcXVhbFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgc3RyaW5nIGFzIGl0IHdhcyBpbiB0aGUgb3JpZ2luIGlucHV0LlxuICAgICAqXG4gICAgICogRXZlcnkgcGFyc2VyIHNhdmVzIGl0cyBvd24gcHJvcGVydGllcyxcbiAgICAgKiBidXQgdGhlIGRlZmF1bHQgQ1NTIHBhcnNlciB1c2VzOlxuICAgICAqXG4gICAgICogKiBgYmVmb3JlYDogdGhlIHNwYWNlIHN5bWJvbHMgYmVmb3JlIHRoZSBub2RlLiBJdCBhbHNvIHN0b3JlcyBgKmBcbiAgICAgKiAgIGFuZCBgX2Agc3ltYm9scyBiZWZvcmUgdGhlIGRlY2xhcmF0aW9uIChJRSBoYWNrKS5cbiAgICAgKiAqIGBhZnRlcmA6IHRoZSBzcGFjZSBzeW1ib2xzIGFmdGVyIHRoZSBsYXN0IGNoaWxkIG9mIHRoZSBub2RlXG4gICAgICogICB0byB0aGUgZW5kIG9mIHRoZSBub2RlLlxuICAgICAqICogYGJldHdlZW5gOiB0aGUgc3ltYm9scyBiZXR3ZWVuIHRoZSBwcm9wZXJ0eSBhbmQgdmFsdWVcbiAgICAgKiAgIGZvciBkZWNsYXJhdGlvbnMsIHNlbGVjdG9yIGFuZCBge2AgZm9yIHJ1bGVzLCBvciBsYXN0IHBhcmFtZXRlclxuICAgICAqICAgYW5kIGB7YCBmb3IgYXQtcnVsZXMuXG4gICAgICogKiBgc2VtaWNvbG9uYDogY29udGFpbnMgdHJ1ZSBpZiB0aGUgbGFzdCBjaGlsZCBoYXNcbiAgICAgKiAgIGFuIChvcHRpb25hbCkgc2VtaWNvbG9uLlxuICAgICAqICogYGFmdGVyTmFtZWA6IHRoZSBzcGFjZSBiZXR3ZWVuIHRoZSBhdC1ydWxlIG5hbWUgYW5kIGl0cyBwYXJhbWV0ZXJzLlxuICAgICAqICogYGxlZnRgOiB0aGUgc3BhY2Ugc3ltYm9scyBiZXR3ZWVuIGAvKmAgYW5kIHRoZSBjb21tZW504oCZcyB0ZXh0LlxuICAgICAqICogYHJpZ2h0YDogdGhlIHNwYWNlIHN5bWJvbHMgYmV0d2VlbiB0aGUgY29tbWVudOKAmXMgdGV4dFxuICAgICAqICAgYW5kIDxjb2RlPiomIzQ3OzwvY29kZT4uXG4gICAgICogKiBgaW1wb3J0YW50YDogdGhlIGNvbnRlbnQgb2YgdGhlIGltcG9ydGFudCBzdGF0ZW1lbnQsXG4gICAgICogICBpZiBpdCBpcyBub3QganVzdCBgIWltcG9ydGFudGAuXG4gICAgICpcbiAgICAgKiBQb3N0Q1NTIGNsZWFucyBzZWxlY3RvcnMsIGRlY2xhcmF0aW9uIHZhbHVlcyBhbmQgYXQtcnVsZSBwYXJhbWV0ZXJzXG4gICAgICogZnJvbSBjb21tZW50cyBhbmQgZXh0cmEgc3BhY2VzLCBidXQgaXQgc3RvcmVzIG9yaWdpbiBjb250ZW50IGluIHJhd3NcbiAgICAgKiBwcm9wZXJ0aWVzLiBBcyBzdWNoLCBpZiB5b3UgZG9u4oCZdCBjaGFuZ2UgYSBkZWNsYXJhdGlvbuKAmXMgdmFsdWUsXG4gICAgICogUG9zdENTUyB3aWxsIHVzZSB0aGUgcmF3IHZhbHVlIHdpdGggY29tbWVudHMuXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IHJvb3QgPSBwb3N0Y3NzLnBhcnNlKCdhIHtcXG4gIGNvbG9yOmJsYWNrXFxufScpXG4gICAgICogcm9vdC5maXJzdC5maXJzdC5yYXdzIC8vPT4geyBiZWZvcmU6ICdcXG4gICcsIGJldHdlZW46ICc6JyB9XG4gICAgICovXG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm9kZTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBwb3NpdGlvblxuICogQHByb3BlcnR5IHtudW1iZXJ9IGxpbmUgICAtIHNvdXJjZSBsaW5lIGluIGZpbGVcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBjb2x1bW4gLSBzb3VyY2UgY29sdW1uIGluIGZpbGVcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtvYmplY3R9IHNvdXJjZVxuICogQHByb3BlcnR5IHtJbnB1dH0gaW5wdXQgICAgLSB7QGxpbmsgSW5wdXR9IHdpdGggaW5wdXQgZmlsZVxuICogQHByb3BlcnR5IHtwb3NpdGlvbn0gc3RhcnQgLSBUaGUgc3RhcnRpbmcgcG9zaXRpb24gb2YgdGhlIG5vZGXigJlzIHNvdXJjZVxuICogQHByb3BlcnR5IHtwb3NpdGlvbn0gZW5kICAgLSBUaGUgZW5kaW5nIHBvc2l0aW9uIG9mIHRoZSBub2Rl4oCZcyBzb3VyY2VcbiAqL1xuIiwiaW1wb3J0IFBhcnNlciBmcm9tICcuL3BhcnNlcic7XG5pbXBvcnQgSW5wdXQgIGZyb20gJy4vaW5wdXQnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZShjc3MsIG9wdHMpIHtcbiAgICBpZiAoIG9wdHMgJiYgb3B0cy5zYWZlICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09wdGlvbiBzYWZlIHdhcyByZW1vdmVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdVc2UgcGFyc2VyOiByZXF1aXJlKFwicG9zdGNzcy1zYWZlLXBhcnNlclwiKScpO1xuICAgIH1cblxuICAgIGxldCBpbnB1dCA9IG5ldyBJbnB1dChjc3MsIG9wdHMpO1xuXG4gICAgbGV0IHBhcnNlciA9IG5ldyBQYXJzZXIoaW5wdXQpO1xuICAgIHRyeSB7XG4gICAgICAgIHBhcnNlci50b2tlbml6ZSgpO1xuICAgICAgICBwYXJzZXIubG9vcCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKCBlLm5hbWUgPT09ICdDc3NTeW50YXhFcnJvcicgJiYgb3B0cyAmJiBvcHRzLmZyb20gKSB7XG4gICAgICAgICAgICBpZiAoIC9cXC5zY3NzJC9pLnRlc3Qob3B0cy5mcm9tKSApIHtcbiAgICAgICAgICAgICAgICBlLm1lc3NhZ2UgKz0gJ1xcbllvdSB0cmllZCB0byBwYXJzZSBTQ1NTIHdpdGggJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0aGUgc3RhbmRhcmQgQ1NTIHBhcnNlcjsgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0cnkgYWdhaW4gd2l0aCB0aGUgcG9zdGNzcy1zY3NzIHBhcnNlcic7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCAvXFwubGVzcyQvaS50ZXN0KG9wdHMuZnJvbSkgKSB7XG4gICAgICAgICAgICAgICAgZS5tZXNzYWdlICs9ICdcXG5Zb3UgdHJpZWQgdG8gcGFyc2UgTGVzcyB3aXRoICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGhlIHN0YW5kYXJkIENTUyBwYXJzZXI7ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndHJ5IGFnYWluIHdpdGggdGhlIHBvc3Rjc3MtbGVzcyBwYXJzZXInO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlci5yb290O1xufVxuIiwiaW1wb3J0IERlY2xhcmF0aW9uIGZyb20gJy4vZGVjbGFyYXRpb24nO1xuaW1wb3J0IHRva2VuaXplciAgIGZyb20gJy4vdG9rZW5pemUnO1xuaW1wb3J0IENvbW1lbnQgICAgIGZyb20gJy4vY29tbWVudCc7XG5pbXBvcnQgQXRSdWxlICAgICAgZnJvbSAnLi9hdC1ydWxlJztcbmltcG9ydCBSb290ICAgICAgICBmcm9tICcuL3Jvb3QnO1xuaW1wb3J0IFJ1bGUgICAgICAgIGZyb20gJy4vcnVsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihpbnB1dCkge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXQ7XG5cbiAgICAgICAgdGhpcy5wb3MgICAgICAgPSAwO1xuICAgICAgICB0aGlzLnJvb3QgICAgICA9IG5ldyBSb290KCk7XG4gICAgICAgIHRoaXMuY3VycmVudCAgID0gdGhpcy5yb290O1xuICAgICAgICB0aGlzLnNwYWNlcyAgICA9ICcnO1xuICAgICAgICB0aGlzLnNlbWljb2xvbiA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMucm9vdC5zb3VyY2UgPSB7IGlucHV0LCBzdGFydDogeyBsaW5lOiAxLCBjb2x1bW46IDEgfSB9O1xuICAgIH1cblxuICAgIHRva2VuaXplKCkge1xuICAgICAgICB0aGlzLnRva2VucyA9IHRva2VuaXplcih0aGlzLmlucHV0KTtcbiAgICB9XG5cbiAgICBsb29wKCkge1xuICAgICAgICBsZXQgdG9rZW47XG4gICAgICAgIHdoaWxlICggdGhpcy5wb3MgPCB0aGlzLnRva2Vucy5sZW5ndGggKSB7XG4gICAgICAgICAgICB0b2tlbiA9IHRoaXMudG9rZW5zW3RoaXMucG9zXTtcblxuICAgICAgICAgICAgc3dpdGNoICggdG9rZW5bMF0gKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJzsnOlxuICAgICAgICAgICAgICAgIHRoaXMuc3BhY2VzICs9IHRva2VuWzFdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICd9JzpcbiAgICAgICAgICAgICAgICB0aGlzLmVuZCh0b2tlbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY29tbWVudCh0b2tlbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2F0LXdvcmQnOlxuICAgICAgICAgICAgICAgIHRoaXMuYXRydWxlKHRva2VuKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAneyc6XG4gICAgICAgICAgICAgICAgdGhpcy5lbXB0eVJ1bGUodG9rZW4pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMub3RoZXIoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wb3MgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVuZEZpbGUoKTtcbiAgICB9XG5cbiAgICBjb21tZW50KHRva2VuKSB7XG4gICAgICAgIGxldCBub2RlID0gbmV3IENvbW1lbnQoKTtcbiAgICAgICAgdGhpcy5pbml0KG5vZGUsIHRva2VuWzJdLCB0b2tlblszXSk7XG4gICAgICAgIG5vZGUuc291cmNlLmVuZCA9IHsgbGluZTogdG9rZW5bNF0sIGNvbHVtbjogdG9rZW5bNV0gfTtcblxuICAgICAgICBsZXQgdGV4dCA9IHRva2VuWzFdLnNsaWNlKDIsIC0yKTtcbiAgICAgICAgaWYgKCAvXlxccyokLy50ZXN0KHRleHQpICkge1xuICAgICAgICAgICAgbm9kZS50ZXh0ICAgICAgID0gJyc7XG4gICAgICAgICAgICBub2RlLnJhd3MubGVmdCAgPSB0ZXh0O1xuICAgICAgICAgICAgbm9kZS5yYXdzLnJpZ2h0ID0gJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbWF0Y2ggPSB0ZXh0Lm1hdGNoKC9eKFxccyopKFteXSpbXlxcc10pKFxccyopJC8pO1xuICAgICAgICAgICAgbm9kZS50ZXh0ICAgICAgID0gbWF0Y2hbMl07XG4gICAgICAgICAgICBub2RlLnJhd3MubGVmdCAgPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIG5vZGUucmF3cy5yaWdodCA9IG1hdGNoWzNdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZW1wdHlSdWxlKHRva2VuKSB7XG4gICAgICAgIGxldCBub2RlID0gbmV3IFJ1bGUoKTtcbiAgICAgICAgdGhpcy5pbml0KG5vZGUsIHRva2VuWzJdLCB0b2tlblszXSk7XG4gICAgICAgIG5vZGUuc2VsZWN0b3IgPSAnJztcbiAgICAgICAgbm9kZS5yYXdzLmJldHdlZW4gPSAnJztcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbm9kZTtcbiAgICB9XG5cbiAgICBvdGhlcigpIHtcbiAgICAgICAgbGV0IHRva2VuO1xuICAgICAgICBsZXQgZW5kICAgICAgPSBmYWxzZTtcbiAgICAgICAgbGV0IHR5cGUgICAgID0gbnVsbDtcbiAgICAgICAgbGV0IGNvbG9uICAgID0gZmFsc2U7XG4gICAgICAgIGxldCBicmFja2V0ICA9IG51bGw7XG4gICAgICAgIGxldCBicmFja2V0cyA9IFtdO1xuXG4gICAgICAgIGxldCBzdGFydCA9IHRoaXMucG9zO1xuICAgICAgICB3aGlsZSAoIHRoaXMucG9zIDwgdGhpcy50b2tlbnMubGVuZ3RoICkge1xuICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRva2Vuc1t0aGlzLnBvc107XG4gICAgICAgICAgICB0eXBlICA9IHRva2VuWzBdO1xuXG4gICAgICAgICAgICBpZiAoIHR5cGUgPT09ICcoJyB8fCB0eXBlID09PSAnWycgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCAhYnJhY2tldCApIGJyYWNrZXQgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBicmFja2V0cy5wdXNoKHR5cGUgPT09ICcoJyA/ICcpJyA6ICddJyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIGJyYWNrZXRzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHR5cGUgPT09ICc7JyApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBjb2xvbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjbCh0aGlzLnRva2Vucy5zbGljZShzdGFydCwgdGhpcy5wb3MgKyAxKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ3snICkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJ1bGUodGhpcy50b2tlbnMuc2xpY2Uoc3RhcnQsIHRoaXMucG9zICsgMSkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCB0eXBlID09PSAnfScgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJzonICkge1xuICAgICAgICAgICAgICAgICAgICBjb2xvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0eXBlID09PSBicmFja2V0c1ticmFja2V0cy5sZW5ndGggLSAxXSApIHtcbiAgICAgICAgICAgICAgICBicmFja2V0cy5wb3AoKTtcbiAgICAgICAgICAgICAgICBpZiAoIGJyYWNrZXRzLmxlbmd0aCA9PT0gMCApIGJyYWNrZXQgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnBvcyArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICggdGhpcy5wb3MgPT09IHRoaXMudG9rZW5zLmxlbmd0aCApIHtcbiAgICAgICAgICAgIHRoaXMucG9zIC09IDE7XG4gICAgICAgICAgICBlbmQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBicmFja2V0cy5sZW5ndGggPiAwICkgdGhpcy51bmNsb3NlZEJyYWNrZXQoYnJhY2tldCk7XG5cbiAgICAgICAgaWYgKCBlbmQgJiYgY29sb24gKSB7XG4gICAgICAgICAgICB3aGlsZSAoIHRoaXMucG9zID4gc3RhcnQgKSB7XG4gICAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRva2Vuc1t0aGlzLnBvc11bMF07XG4gICAgICAgICAgICAgICAgaWYgKCB0b2tlbiAhPT0gJ3NwYWNlJyAmJiB0b2tlbiAhPT0gJ2NvbW1lbnQnICkgYnJlYWs7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3MgLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGVjbCh0aGlzLnRva2Vucy5zbGljZShzdGFydCwgdGhpcy5wb3MgKyAxKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVua25vd25Xb3JkKHN0YXJ0KTtcbiAgICB9XG5cbiAgICBydWxlKHRva2Vucykge1xuICAgICAgICB0b2tlbnMucG9wKCk7XG5cbiAgICAgICAgbGV0IG5vZGUgPSBuZXcgUnVsZSgpO1xuICAgICAgICB0aGlzLmluaXQobm9kZSwgdG9rZW5zWzBdWzJdLCB0b2tlbnNbMF1bM10pO1xuXG4gICAgICAgIG5vZGUucmF3cy5iZXR3ZWVuID0gdGhpcy5zcGFjZXNGcm9tRW5kKHRva2Vucyk7XG4gICAgICAgIHRoaXMucmF3KG5vZGUsICdzZWxlY3RvcicsIHRva2Vucyk7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5vZGU7XG4gICAgfVxuXG4gICAgZGVjbCh0b2tlbnMpIHtcbiAgICAgICAgbGV0IG5vZGUgPSBuZXcgRGVjbGFyYXRpb24oKTtcbiAgICAgICAgdGhpcy5pbml0KG5vZGUpO1xuXG4gICAgICAgIGxldCBsYXN0ID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKCBsYXN0WzBdID09PSAnOycgKSB7XG4gICAgICAgICAgICB0aGlzLnNlbWljb2xvbiA9IHRydWU7XG4gICAgICAgICAgICB0b2tlbnMucG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBsYXN0WzRdICkge1xuICAgICAgICAgICAgbm9kZS5zb3VyY2UuZW5kID0geyBsaW5lOiBsYXN0WzRdLCBjb2x1bW46IGxhc3RbNV0gfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUuc291cmNlLmVuZCA9IHsgbGluZTogbGFzdFsyXSwgY29sdW1uOiBsYXN0WzNdIH07XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoIHRva2Vuc1swXVswXSAhPT0gJ3dvcmQnICkge1xuICAgICAgICAgICAgbm9kZS5yYXdzLmJlZm9yZSArPSB0b2tlbnMuc2hpZnQoKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBub2RlLnNvdXJjZS5zdGFydCA9IHsgbGluZTogdG9rZW5zWzBdWzJdLCBjb2x1bW46IHRva2Vuc1swXVszXSB9O1xuXG4gICAgICAgIG5vZGUucHJvcCA9ICcnO1xuICAgICAgICB3aGlsZSAoIHRva2Vucy5sZW5ndGggKSB7XG4gICAgICAgICAgICBsZXQgdHlwZSA9IHRva2Vuc1swXVswXTtcbiAgICAgICAgICAgIGlmICggdHlwZSA9PT0gJzonIHx8IHR5cGUgPT09ICdzcGFjZScgfHwgdHlwZSA9PT0gJ2NvbW1lbnQnICkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZS5wcm9wICs9IHRva2Vucy5zaGlmdCgpWzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgbm9kZS5yYXdzLmJldHdlZW4gPSAnJztcblxuICAgICAgICBsZXQgdG9rZW47XG4gICAgICAgIHdoaWxlICggdG9rZW5zLmxlbmd0aCApIHtcbiAgICAgICAgICAgIHRva2VuID0gdG9rZW5zLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgIGlmICggdG9rZW5bMF0gPT09ICc6JyApIHtcbiAgICAgICAgICAgICAgICBub2RlLnJhd3MuYmV0d2VlbiArPSB0b2tlblsxXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZS5yYXdzLmJldHdlZW4gKz0gdG9rZW5bMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIG5vZGUucHJvcFswXSA9PT0gJ18nIHx8IG5vZGUucHJvcFswXSA9PT0gJyonICkge1xuICAgICAgICAgICAgbm9kZS5yYXdzLmJlZm9yZSArPSBub2RlLnByb3BbMF07XG4gICAgICAgICAgICBub2RlLnByb3AgPSBub2RlLnByb3Auc2xpY2UoMSk7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZS5yYXdzLmJldHdlZW4gKz0gdGhpcy5zcGFjZXNGcm9tU3RhcnQodG9rZW5zKTtcbiAgICAgICAgdGhpcy5wcmVjaGVja01pc3NlZFNlbWljb2xvbih0b2tlbnMpO1xuXG4gICAgICAgIGZvciAoIGxldCBpID0gdG9rZW5zLmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0gKSB7XG4gICAgICAgICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgICAgICAgIGlmICggdG9rZW5bMV0gPT09ICchaW1wb3J0YW50JyApIHtcbiAgICAgICAgICAgICAgICBub2RlLmltcG9ydGFudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgbGV0IHN0cmluZyA9IHRoaXMuc3RyaW5nRnJvbSh0b2tlbnMsIGkpO1xuICAgICAgICAgICAgICAgIHN0cmluZyA9IHRoaXMuc3BhY2VzRnJvbUVuZCh0b2tlbnMpICsgc3RyaW5nO1xuICAgICAgICAgICAgICAgIGlmICggc3RyaW5nICE9PSAnICFpbXBvcnRhbnQnICkgbm9kZS5yYXdzLmltcG9ydGFudCA9IHN0cmluZztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgfSBlbHNlIGlmICh0b2tlblsxXSA9PT0gJ2ltcG9ydGFudCcpIHtcbiAgICAgICAgICAgICAgICBsZXQgY2FjaGUgPSB0b2tlbnMuc2xpY2UoMCk7XG4gICAgICAgICAgICAgICAgbGV0IHN0ciAgID0gJyc7XG4gICAgICAgICAgICAgICAgZm9yICggbGV0IGogPSBpOyBqID4gMDsgai0tICkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IGNhY2hlW2pdWzBdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHN0ci50cmltKCkuaW5kZXhPZignIScpID09PSAwICYmIHR5cGUgIT09ICdzcGFjZScgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdHIgPSBjYWNoZS5wb3AoKVsxXSArIHN0cjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCBzdHIudHJpbSgpLmluZGV4T2YoJyEnKSA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pbXBvcnRhbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBub2RlLnJhd3MuaW1wb3J0YW50ID0gc3RyO1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMgPSBjYWNoZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggdG9rZW5bMF0gIT09ICdzcGFjZScgJiYgdG9rZW5bMF0gIT09ICdjb21tZW50JyApIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmF3KG5vZGUsICd2YWx1ZScsIHRva2Vucyk7XG5cbiAgICAgICAgaWYgKCBub2RlLnZhbHVlLmluZGV4T2YoJzonKSAhPT0gLTEgKSB0aGlzLmNoZWNrTWlzc2VkU2VtaWNvbG9uKHRva2Vucyk7XG4gICAgfVxuXG4gICAgYXRydWxlKHRva2VuKSB7XG4gICAgICAgIGxldCBub2RlICA9IG5ldyBBdFJ1bGUoKTtcbiAgICAgICAgbm9kZS5uYW1lID0gdG9rZW5bMV0uc2xpY2UoMSk7XG4gICAgICAgIGlmICggbm9kZS5uYW1lID09PSAnJyApIHtcbiAgICAgICAgICAgIHRoaXMudW5uYW1lZEF0cnVsZShub2RlLCB0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbml0KG5vZGUsIHRva2VuWzJdLCB0b2tlblszXSk7XG5cbiAgICAgICAgbGV0IGxhc3QgICA9IGZhbHNlO1xuICAgICAgICBsZXQgb3BlbiAgID0gZmFsc2U7XG4gICAgICAgIGxldCBwYXJhbXMgPSBbXTtcblxuICAgICAgICB0aGlzLnBvcyArPSAxO1xuICAgICAgICB3aGlsZSAoIHRoaXMucG9zIDwgdGhpcy50b2tlbnMubGVuZ3RoICkge1xuICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRva2Vuc1t0aGlzLnBvc107XG5cbiAgICAgICAgICAgIGlmICggdG9rZW5bMF0gPT09ICc7JyApIHtcbiAgICAgICAgICAgICAgICBub2RlLnNvdXJjZS5lbmQgPSB7IGxpbmU6IHRva2VuWzJdLCBjb2x1bW46IHRva2VuWzNdIH07XG4gICAgICAgICAgICAgICAgdGhpcy5zZW1pY29sb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIGlmICggdG9rZW5bMF0gPT09ICd7JyApIHtcbiAgICAgICAgICAgICAgICBvcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHRva2VuWzBdID09PSAnfScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZCh0b2tlbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmFtcy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wb3MgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHRoaXMucG9zID09PSB0aGlzLnRva2Vucy5sZW5ndGggKSB7XG4gICAgICAgICAgICBsYXN0ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5vZGUucmF3cy5iZXR3ZWVuID0gdGhpcy5zcGFjZXNGcm9tRW5kKHBhcmFtcyk7XG4gICAgICAgIGlmICggcGFyYW1zLmxlbmd0aCApIHtcbiAgICAgICAgICAgIG5vZGUucmF3cy5hZnRlck5hbWUgPSB0aGlzLnNwYWNlc0Zyb21TdGFydChwYXJhbXMpO1xuICAgICAgICAgICAgdGhpcy5yYXcobm9kZSwgJ3BhcmFtcycsIHBhcmFtcyk7XG4gICAgICAgICAgICBpZiAoIGxhc3QgKSB7XG4gICAgICAgICAgICAgICAgdG9rZW4gPSBwYXJhbXNbcGFyYW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIG5vZGUuc291cmNlLmVuZCAgID0geyBsaW5lOiB0b2tlbls0XSwgY29sdW1uOiB0b2tlbls1XSB9O1xuICAgICAgICAgICAgICAgIHRoaXMuc3BhY2VzICAgICAgID0gbm9kZS5yYXdzLmJldHdlZW47XG4gICAgICAgICAgICAgICAgbm9kZS5yYXdzLmJldHdlZW4gPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUucmF3cy5hZnRlck5hbWUgPSAnJztcbiAgICAgICAgICAgIG5vZGUucGFyYW1zICAgICAgICAgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggb3BlbiApIHtcbiAgICAgICAgICAgIG5vZGUubm9kZXMgICA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gbm9kZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGVuZCh0b2tlbikge1xuICAgICAgICBpZiAoIHRoaXMuY3VycmVudC5ub2RlcyAmJiB0aGlzLmN1cnJlbnQubm9kZXMubGVuZ3RoICkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50LnJhd3Muc2VtaWNvbG9uID0gdGhpcy5zZW1pY29sb247XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZW1pY29sb24gPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmN1cnJlbnQucmF3cy5hZnRlciA9ICh0aGlzLmN1cnJlbnQucmF3cy5hZnRlciB8fCAnJykgKyB0aGlzLnNwYWNlcztcbiAgICAgICAgdGhpcy5zcGFjZXMgPSAnJztcblxuICAgICAgICBpZiAoIHRoaXMuY3VycmVudC5wYXJlbnQgKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQuc291cmNlLmVuZCA9IHsgbGluZTogdG9rZW5bMl0sIGNvbHVtbjogdG9rZW5bM10gfTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMuY3VycmVudC5wYXJlbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVuZXhwZWN0ZWRDbG9zZSh0b2tlbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbmRGaWxlKCkge1xuICAgICAgICBpZiAoIHRoaXMuY3VycmVudC5wYXJlbnQgKSB0aGlzLnVuY2xvc2VkQmxvY2soKTtcbiAgICAgICAgaWYgKCB0aGlzLmN1cnJlbnQubm9kZXMgJiYgdGhpcy5jdXJyZW50Lm5vZGVzLmxlbmd0aCApIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5yYXdzLnNlbWljb2xvbiA9IHRoaXMuc2VtaWNvbG9uO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudC5yYXdzLmFmdGVyID0gKHRoaXMuY3VycmVudC5yYXdzLmFmdGVyIHx8ICcnKSArIHRoaXMuc3BhY2VzO1xuICAgIH1cblxuICAgIC8vIEhlbHBlcnNcblxuICAgIGluaXQobm9kZSwgbGluZSwgY29sdW1uKSB7XG4gICAgICAgIHRoaXMuY3VycmVudC5wdXNoKG5vZGUpO1xuXG4gICAgICAgIG5vZGUuc291cmNlID0geyBzdGFydDogeyBsaW5lLCBjb2x1bW4gfSwgaW5wdXQ6IHRoaXMuaW5wdXQgfTtcbiAgICAgICAgbm9kZS5yYXdzLmJlZm9yZSA9IHRoaXMuc3BhY2VzO1xuICAgICAgICB0aGlzLnNwYWNlcyA9ICcnO1xuICAgICAgICBpZiAoIG5vZGUudHlwZSAhPT0gJ2NvbW1lbnQnICkgdGhpcy5zZW1pY29sb24gPSBmYWxzZTtcbiAgICB9XG5cbiAgICByYXcobm9kZSwgcHJvcCwgdG9rZW5zKSB7XG4gICAgICAgIGxldCB0b2tlbiwgdHlwZTtcbiAgICAgICAgbGV0IGxlbmd0aCA9IHRva2Vucy5sZW5ndGg7XG4gICAgICAgIGxldCB2YWx1ZSAgPSAnJztcbiAgICAgICAgbGV0IGNsZWFuICA9IHRydWU7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICAgICAgICB0eXBlICA9IHRva2VuWzBdO1xuICAgICAgICAgICAgaWYgKCB0eXBlID09PSAnY29tbWVudCcgfHwgdHlwZSA9PT0gJ3NwYWNlJyAmJiBpID09PSBsZW5ndGggLSAxICkge1xuICAgICAgICAgICAgICAgIGNsZWFuID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhbHVlICs9IHRva2VuWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICggIWNsZWFuICkge1xuICAgICAgICAgICAgbGV0IHJhdyA9IHRva2Vucy5yZWR1Y2UoIChhbGwsIGkpID0+IGFsbCArIGlbMV0sICcnKTtcbiAgICAgICAgICAgIG5vZGUucmF3c1twcm9wXSA9IHsgdmFsdWUsIHJhdyB9O1xuICAgICAgICB9XG4gICAgICAgIG5vZGVbcHJvcF0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBzcGFjZXNGcm9tRW5kKHRva2Vucykge1xuICAgICAgICBsZXQgbGFzdFRva2VuVHlwZTtcbiAgICAgICAgbGV0IHNwYWNlcyA9ICcnO1xuICAgICAgICB3aGlsZSAoIHRva2Vucy5sZW5ndGggKSB7XG4gICAgICAgICAgICBsYXN0VG9rZW5UeXBlID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXVswXTtcbiAgICAgICAgICAgIGlmICggbGFzdFRva2VuVHlwZSAhPT0gJ3NwYWNlJyAmJlxuICAgICAgICAgICAgICAgIGxhc3RUb2tlblR5cGUgIT09ICdjb21tZW50JyApIGJyZWFrO1xuICAgICAgICAgICAgc3BhY2VzID0gdG9rZW5zLnBvcCgpWzFdICsgc3BhY2VzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzcGFjZXM7XG4gICAgfVxuXG4gICAgc3BhY2VzRnJvbVN0YXJ0KHRva2Vucykge1xuICAgICAgICBsZXQgbmV4dDtcbiAgICAgICAgbGV0IHNwYWNlcyA9ICcnO1xuICAgICAgICB3aGlsZSAoIHRva2Vucy5sZW5ndGggKSB7XG4gICAgICAgICAgICBuZXh0ID0gdG9rZW5zWzBdWzBdO1xuICAgICAgICAgICAgaWYgKCBuZXh0ICE9PSAnc3BhY2UnICYmIG5leHQgIT09ICdjb21tZW50JyApIGJyZWFrO1xuICAgICAgICAgICAgc3BhY2VzICs9IHRva2Vucy5zaGlmdCgpWzFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzcGFjZXM7XG4gICAgfVxuXG4gICAgc3RyaW5nRnJvbSh0b2tlbnMsIGZyb20pIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IGZyb207IGkgPCB0b2tlbnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gdG9rZW5zW2ldWzFdO1xuICAgICAgICB9XG4gICAgICAgIHRva2Vucy5zcGxpY2UoZnJvbSwgdG9rZW5zLmxlbmd0aCAtIGZyb20pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGNvbG9uKHRva2Vucykge1xuICAgICAgICBsZXQgYnJhY2tldHMgPSAwO1xuICAgICAgICBsZXQgdG9rZW4sIHR5cGUsIHByZXY7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgICAgICAgdHlwZSAgPSB0b2tlblswXTtcblxuICAgICAgICAgICAgaWYgKCB0eXBlID09PSAnKCcgKSB7XG4gICAgICAgICAgICAgICAgYnJhY2tldHMgKz0gMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHR5cGUgPT09ICcpJyApIHtcbiAgICAgICAgICAgICAgICBicmFja2V0cyAtPSAxO1xuICAgICAgICAgICAgfSBlbHNlIGlmICggYnJhY2tldHMgPT09IDAgJiYgdHlwZSA9PT0gJzonICkge1xuICAgICAgICAgICAgICAgIGlmICggIXByZXYgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG91YmxlQ29sb24odG9rZW4pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIHByZXZbMF0gPT09ICd3b3JkJyAmJiBwcmV2WzFdID09PSAncHJvZ2lkJyApIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcmV2ID0gdG9rZW47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEVycm9yc1xuXG4gICAgdW5jbG9zZWRCcmFja2V0KGJyYWNrZXQpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5pbnB1dC5lcnJvcignVW5jbG9zZWQgYnJhY2tldCcsIGJyYWNrZXRbMl0sIGJyYWNrZXRbM10pO1xuICAgIH1cblxuICAgIHVua25vd25Xb3JkKHN0YXJ0KSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRoaXMudG9rZW5zW3N0YXJ0XTtcbiAgICAgICAgdGhyb3cgdGhpcy5pbnB1dC5lcnJvcignVW5rbm93biB3b3JkJywgdG9rZW5bMl0sIHRva2VuWzNdKTtcbiAgICB9XG5cbiAgICB1bmV4cGVjdGVkQ2xvc2UodG9rZW4pIHtcbiAgICAgICAgdGhyb3cgdGhpcy5pbnB1dC5lcnJvcignVW5leHBlY3RlZCB9JywgdG9rZW5bMl0sIHRva2VuWzNdKTtcbiAgICB9XG5cbiAgICB1bmNsb3NlZEJsb2NrKCkge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5jdXJyZW50LnNvdXJjZS5zdGFydDtcbiAgICAgICAgdGhyb3cgdGhpcy5pbnB1dC5lcnJvcignVW5jbG9zZWQgYmxvY2snLCBwb3MubGluZSwgcG9zLmNvbHVtbik7XG4gICAgfVxuXG4gICAgZG91YmxlQ29sb24odG9rZW4pIHtcbiAgICAgICAgdGhyb3cgdGhpcy5pbnB1dC5lcnJvcignRG91YmxlIGNvbG9uJywgdG9rZW5bMl0sIHRva2VuWzNdKTtcbiAgICB9XG5cbiAgICB1bm5hbWVkQXRydWxlKG5vZGUsIHRva2VuKSB7XG4gICAgICAgIHRocm93IHRoaXMuaW5wdXQuZXJyb3IoJ0F0LXJ1bGUgd2l0aG91dCBuYW1lJywgdG9rZW5bMl0sIHRva2VuWzNdKTtcbiAgICB9XG5cbiAgICBwcmVjaGVja01pc3NlZFNlbWljb2xvbih0b2tlbnMpIHtcbiAgICAgICAgLy8gSG9vayBmb3IgU2FmZSBQYXJzZXJcbiAgICAgICAgdG9rZW5zO1xuICAgIH1cblxuICAgIGNoZWNrTWlzc2VkU2VtaWNvbG9uKHRva2Vucykge1xuICAgICAgICBsZXQgY29sb24gPSB0aGlzLmNvbG9uKHRva2Vucyk7XG4gICAgICAgIGlmICggY29sb24gPT09IGZhbHNlICkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBmb3VuZGVkID0gMDtcbiAgICAgICAgbGV0IHRva2VuO1xuICAgICAgICBmb3IgKCBsZXQgaiA9IGNvbG9uIC0gMTsgaiA+PSAwOyBqLS0gKSB7XG4gICAgICAgICAgICB0b2tlbiA9IHRva2Vuc1tqXTtcbiAgICAgICAgICAgIGlmICggdG9rZW5bMF0gIT09ICdzcGFjZScgKSB7XG4gICAgICAgICAgICAgICAgZm91bmRlZCArPSAxO1xuICAgICAgICAgICAgICAgIGlmICggZm91bmRlZCA9PT0gMiApIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRocm93IHRoaXMuaW5wdXQuZXJyb3IoJ01pc3NlZCBzZW1pY29sb24nLCB0b2tlblsyXSwgdG9rZW5bM10pO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IERlY2xhcmF0aW9uIGZyb20gJy4vZGVjbGFyYXRpb24nO1xuaW1wb3J0IFByb2Nlc3NvciAgIGZyb20gJy4vcHJvY2Vzc29yJztcbmltcG9ydCBzdHJpbmdpZnkgICBmcm9tICcuL3N0cmluZ2lmeSc7XG5pbXBvcnQgQ29tbWVudCAgICAgZnJvbSAnLi9jb21tZW50JztcbmltcG9ydCBBdFJ1bGUgICAgICBmcm9tICcuL2F0LXJ1bGUnO1xuaW1wb3J0IHZlbmRvciAgICAgIGZyb20gJy4vdmVuZG9yJztcbmltcG9ydCBwYXJzZSAgICAgICBmcm9tICcuL3BhcnNlJztcbmltcG9ydCBsaXN0ICAgICAgICBmcm9tICcuL2xpc3QnO1xuaW1wb3J0IFJ1bGUgICAgICAgIGZyb20gJy4vcnVsZSc7XG5pbXBvcnQgUm9vdCAgICAgICAgZnJvbSAnLi9yb290JztcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcge0BsaW5rIFByb2Nlc3Nvcn0gaW5zdGFuY2UgdGhhdCB3aWxsIGFwcGx5IGBwbHVnaW5zYFxuICogYXMgQ1NTIHByb2Nlc3NvcnMuXG4gKlxuICogQHBhcmFtIHtBcnJheS48UGx1Z2lufHBsdWdpbkZ1bmN0aW9uPnxQcm9jZXNzb3J9IHBsdWdpbnMgLSBQb3N0Q1NTXG4gKiAgICAgICAgcGx1Z2lucy4gU2VlIHtAbGluayBQcm9jZXNzb3IjdXNlfSBmb3IgcGx1Z2luIGZvcm1hdC5cbiAqXG4gKiBAcmV0dXJuIHtQcm9jZXNzb3J9IFByb2Nlc3NvciB0byBwcm9jZXNzIG11bHRpcGxlIENTU1xuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgcG9zdGNzcyBmcm9tICdwb3N0Y3NzJztcbiAqXG4gKiBwb3N0Y3NzKHBsdWdpbnMpLnByb2Nlc3MoY3NzLCB7IGZyb20sIHRvIH0pLnRoZW4ocmVzdWx0ID0+IHtcbiAqICAgY29uc29sZS5sb2cocmVzdWx0LmNzcyk7XG4gKiB9KTtcbiAqXG4gKiBAbmFtZXNwYWNlIHBvc3Rjc3NcbiAqL1xuZnVuY3Rpb24gcG9zdGNzcyguLi5wbHVnaW5zKSB7XG4gICAgaWYgKCBwbHVnaW5zLmxlbmd0aCA9PT0gMSAmJiBBcnJheS5pc0FycmF5KHBsdWdpbnNbMF0pICkge1xuICAgICAgICBwbHVnaW5zID0gcGx1Z2luc1swXTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9jZXNzb3IocGx1Z2lucyk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIFBvc3RDU1MgcGx1Z2luIHdpdGggYSBzdGFuZGFyZCBBUEkuXG4gKlxuICogVGhlIG5ld2x5LXdyYXBwZWQgZnVuY3Rpb24gd2lsbCBwcm92aWRlIGJvdGggdGhlIG5hbWUgYW5kIFBvc3RDU1NcbiAqIHZlcnNpb24gb2YgdGhlIHBsdWdpbi5cbiAqXG4gKiBgYGBqc1xuICogIGNvbnN0IHByb2Nlc3NvciA9IHBvc3Rjc3MoW3JlcGxhY2VdKTtcbiAqICBwcm9jZXNzb3IucGx1Z2luc1swXS5wb3N0Y3NzUGx1Z2luICAvLz0+ICdwb3N0Y3NzLXJlcGxhY2UnXG4gKiAgcHJvY2Vzc29yLnBsdWdpbnNbMF0ucG9zdGNzc1ZlcnNpb24gLy89PiAnNS4xLjAnXG4gKiBgYGBcbiAqXG4gKiBUaGUgcGx1Z2luIGZ1bmN0aW9uIHJlY2VpdmVzIDIgYXJndW1lbnRzOiB7QGxpbmsgUm9vdH1cbiAqIGFuZCB7QGxpbmsgUmVzdWx0fSBpbnN0YW5jZS4gVGhlIGZ1bmN0aW9uIHNob3VsZCBtdXRhdGUgdGhlIHByb3ZpZGVkXG4gKiBgUm9vdGAgbm9kZS4gQWx0ZXJuYXRpdmVseSwgeW91IGNhbiBjcmVhdGUgYSBuZXcgYFJvb3RgIG5vZGVcbiAqIGFuZCBvdmVycmlkZSB0aGUgYHJlc3VsdC5yb290YCBwcm9wZXJ0eS5cbiAqXG4gKiBgYGBqc1xuICogY29uc3QgY2xlYW5lciA9IHBvc3Rjc3MucGx1Z2luKCdwb3N0Y3NzLWNsZWFuZXInLCAoKSA9PiB7XG4gKiAgIHJldHVybiAocm9vdCwgcmVzdWx0KSA9PiB7XG4gKiAgICAgcmVzdWx0LnJvb3QgPSBwb3N0Y3NzLnJvb3QoKTtcbiAqICAgfTtcbiAqIH0pO1xuICogYGBgXG4gKlxuICogQXMgYSBjb252ZW5pZW5jZSwgcGx1Z2lucyBhbHNvIGV4cG9zZSBhIGBwcm9jZXNzYCBtZXRob2Qgc28gdGhhdCB5b3UgY2FuIHVzZVxuICogdGhlbSBhcyBzdGFuZGFsb25lIHRvb2xzLlxuICpcbiAqIGBgYGpzXG4gKiBjbGVhbmVyLnByb2Nlc3MoY3NzLCBvcHRpb25zKTtcbiAqIC8vIFRoaXMgaXMgZXF1aXZhbGVudCB0bzpcbiAqIHBvc3Rjc3MoWyBjbGVhbmVyKG9wdGlvbnMpIF0pLnByb2Nlc3MoY3NzKTtcbiAqIGBgYFxuICpcbiAqIEFzeW5jaHJvbm91cyBwbHVnaW5zIHNob3VsZCByZXR1cm4gYSBgUHJvbWlzZWAgaW5zdGFuY2UuXG4gKlxuICogYGBganNcbiAqIHBvc3Rjc3MucGx1Z2luKCdwb3N0Y3NzLWltcG9ydCcsICgpID0+IHtcbiAqICAgcmV0dXJuIChyb290LCByZXN1bHQpID0+IHtcbiAqICAgICByZXR1cm4gbmV3IFByb21pc2UoIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAqICAgICAgIGZzLnJlYWRGaWxlKCdiYXNlLmNzcycsIChiYXNlKSA9PiB7XG4gKiAgICAgICAgIHJvb3QucHJlcGVuZChiYXNlKTtcbiAqICAgICAgICAgcmVzb2x2ZSgpO1xuICogICAgICAgfSk7XG4gKiAgICAgfSk7XG4gKiAgIH07XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEFkZCB3YXJuaW5ncyB1c2luZyB0aGUge0BsaW5rIE5vZGUjd2Fybn0gbWV0aG9kLlxuICogU2VuZCBkYXRhIHRvIG90aGVyIHBsdWdpbnMgdXNpbmcgdGhlIHtAbGluayBSZXN1bHQjbWVzc2FnZXN9IGFycmF5LlxuICpcbiAqIGBgYGpzXG4gKiBwb3N0Y3NzLnBsdWdpbigncG9zdGNzcy1jYW5pdXNlLXRlc3QnLCAoKSA9PiB7XG4gKiAgIHJldHVybiAocm9vdCwgcmVzdWx0KSA9PiB7XG4gKiAgICAgY3NzLndhbGtEZWNscyhkZWNsID0+IHtcbiAqICAgICAgIGlmICggIWNhbml1c2Uuc3VwcG9ydChkZWNsLnByb3ApICkge1xuICogICAgICAgICBkZWNsLndhcm4ocmVzdWx0LCAnU29tZSBicm93c2VycyBkbyBub3Qgc3VwcG9ydCAnICsgZGVjbC5wcm9wKTtcbiAqICAgICAgIH1cbiAqICAgICB9KTtcbiAqICAgfTtcbiAqIH0pO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgICAgICAgICAgLSBQb3N0Q1NTIHBsdWdpbiBuYW1lLiBTYW1lIGFzIGluIGBuYW1lYFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eSBpbiBgcGFja2FnZS5qc29uYC4gSXQgd2lsbCBiZSBzYXZlZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbiBgcGx1Z2luLnBvc3Rjc3NQbHVnaW5gIHByb3BlcnR5LlxuICogQHBhcmFtIHtmdW5jdGlvbn0gaW5pdGlhbGl6ZXIgLSB3aWxsIHJlY2VpdmUgcGx1Z2luIG9wdGlvbnNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5kIHNob3VsZCByZXR1cm4ge0BsaW5rIHBsdWdpbkZ1bmN0aW9ufVxuICpcbiAqIEByZXR1cm4ge1BsdWdpbn0gUG9zdENTUyBwbHVnaW5cbiAqL1xucG9zdGNzcy5wbHVnaW4gPSBmdW5jdGlvbiBwbHVnaW4obmFtZSwgaW5pdGlhbGl6ZXIpIHtcbiAgICBsZXQgY3JlYXRvciA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIGxldCB0cmFuc2Zvcm1lciA9IGluaXRpYWxpemVyKC4uLmFyZ3MpO1xuICAgICAgICB0cmFuc2Zvcm1lci5wb3N0Y3NzUGx1Z2luICA9IG5hbWU7XG4gICAgICAgIHRyYW5zZm9ybWVyLnBvc3Rjc3NWZXJzaW9uID0gKG5ldyBQcm9jZXNzb3IoKSkudmVyc2lvbjtcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVyO1xuICAgIH07XG5cbiAgICBsZXQgY2FjaGU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNyZWF0b3IsICdwb3N0Y3NzJywge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICBpZiAoICFjYWNoZSApIGNhY2hlID0gY3JlYXRvcigpO1xuICAgICAgICAgICAgcmV0dXJuIGNhY2hlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjcmVhdG9yLnByb2Nlc3MgPSBmdW5jdGlvbiAocm9vdCwgb3B0cykge1xuICAgICAgICByZXR1cm4gcG9zdGNzcyhbIGNyZWF0b3Iob3B0cykgXSkucHJvY2Vzcyhyb290LCBvcHRzKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGNyZWF0b3I7XG59O1xuXG4vKipcbiAqIERlZmF1bHQgZnVuY3Rpb24gdG8gY29udmVydCBhIG5vZGUgdHJlZSBpbnRvIGEgQ1NTIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgICAgICAgLSBzdGFydCBub2RlIGZvciBzdHJpbmdpZmluZy4gVXN1YWxseSB7QGxpbmsgUm9vdH0uXG4gKiBAcGFyYW0ge2J1aWxkZXJ9IGJ1aWxkZXIgLSBmdW5jdGlvbiB0byBjb25jYXRlbmF0ZSBDU1MgZnJvbSBub2Rl4oCZcyBwYXJ0c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgb3IgZ2VuZXJhdGUgc3RyaW5nIGFuZCBzb3VyY2UgbWFwXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqXG4gKiBAZnVuY3Rpb25cbiAqL1xucG9zdGNzcy5zdHJpbmdpZnkgPSBzdHJpbmdpZnk7XG5cbi8qKlxuICogUGFyc2VzIHNvdXJjZSBjc3MgYW5kIHJldHVybnMgYSBuZXcge0BsaW5rIFJvb3R9IG5vZGUsXG4gKiB3aGljaCBjb250YWlucyB0aGUgc291cmNlIENTUyBub2Rlcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3x0b1N0cmluZ30gY3NzICAgLSBzdHJpbmcgd2l0aCBpbnB1dCBDU1Mgb3IgYW55IG9iamVjdFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aCB0b1N0cmluZygpIG1ldGhvZCwgbGlrZSBhIEJ1ZmZlclxuICogQHBhcmFtIHtwcm9jZXNzT3B0aW9uc30gW29wdHNdIC0gb3B0aW9ucyB3aXRoIG9ubHkgYGZyb21gIGFuZCBgbWFwYCBrZXlzXG4gKlxuICogQHJldHVybiB7Um9vdH0gUG9zdENTUyBBU1RcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gU2ltcGxlIENTUyBjb25jYXRlbmF0aW9uIHdpdGggc291cmNlIG1hcCBzdXBwb3J0XG4gKiBjb25zdCByb290MSA9IHBvc3Rjc3MucGFyc2UoY3NzMSwgeyBmcm9tOiBmaWxlMSB9KTtcbiAqIGNvbnN0IHJvb3QyID0gcG9zdGNzcy5wYXJzZShjc3MyLCB7IGZyb206IGZpbGUyIH0pO1xuICogcm9vdDEuYXBwZW5kKHJvb3QyKS50b1Jlc3VsdCgpLmNzcztcbiAqXG4gKiBAZnVuY3Rpb25cbiAqL1xucG9zdGNzcy5wYXJzZSA9IHBhcnNlO1xuXG4vKipcbiAqIEBtZW1iZXIge3ZlbmRvcn0gLSBDb250YWlucyB0aGUge0BsaW5rIHZlbmRvcn0gbW9kdWxlLlxuICpcbiAqIEBleGFtcGxlXG4gKiBwb3N0Y3NzLnZlbmRvci51bnByZWZpeGVkKCctbW96LXRhYicpIC8vPT4gWyd0YWInXVxuICovXG5wb3N0Y3NzLnZlbmRvciA9IHZlbmRvcjtcblxuLyoqXG4gKiBAbWVtYmVyIHtsaXN0fSAtIENvbnRhaW5zIHRoZSB7QGxpbmsgbGlzdH0gbW9kdWxlLlxuICpcbiAqIEBleGFtcGxlXG4gKiBwb3N0Y3NzLmxpc3Quc3BhY2UoJzVweCBjYWxjKDEwJSArIDVweCknKSAvLz0+IFsnNXB4JywgJ2NhbGMoMTAlICsgNXB4KSddXG4gKi9cbnBvc3Rjc3MubGlzdCA9IGxpc3Q7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB7QGxpbmsgQ29tbWVudH0gbm9kZS5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gW2RlZmF1bHRzXSAtIHByb3BlcnRpZXMgZm9yIHRoZSBuZXcgbm9kZS5cbiAqXG4gKiBAcmV0dXJuIHtDb21tZW50fSBuZXcgQ29tbWVudCBub2RlXG4gKlxuICogQGV4YW1wbGVcbiAqIHBvc3Rjc3MuY29tbWVudCh7IHRleHQ6ICd0ZXN0JyB9KVxuICovXG5wb3N0Y3NzLmNvbW1lbnQgPSBkZWZhdWx0cyA9PiBuZXcgQ29tbWVudChkZWZhdWx0cyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB7QGxpbmsgQXRSdWxlfSBub2RlLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBbZGVmYXVsdHNdIC0gcHJvcGVydGllcyBmb3IgdGhlIG5ldyBub2RlLlxuICpcbiAqIEByZXR1cm4ge0F0UnVsZX0gbmV3IEF0UnVsZSBub2RlXG4gKlxuICogQGV4YW1wbGVcbiAqIHBvc3Rjc3MuYXRSdWxlKHsgbmFtZTogJ2NoYXJzZXQnIH0pLnRvU3RyaW5nKCkgLy89PiBcIkBjaGFyc2V0XCJcbiAqL1xucG9zdGNzcy5hdFJ1bGUgPSBkZWZhdWx0cyA9PiBuZXcgQXRSdWxlKGRlZmF1bHRzKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHtAbGluayBEZWNsYXJhdGlvbn0gbm9kZS5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gW2RlZmF1bHRzXSAtIHByb3BlcnRpZXMgZm9yIHRoZSBuZXcgbm9kZS5cbiAqXG4gKiBAcmV0dXJuIHtEZWNsYXJhdGlvbn0gbmV3IERlY2xhcmF0aW9uIG5vZGVcbiAqXG4gKiBAZXhhbXBsZVxuICogcG9zdGNzcy5kZWNsKHsgcHJvcDogJ2NvbG9yJywgdmFsdWU6ICdyZWQnIH0pLnRvU3RyaW5nKCkgLy89PiBcImNvbG9yOiByZWRcIlxuICovXG5wb3N0Y3NzLmRlY2wgPSBkZWZhdWx0cyA9PiBuZXcgRGVjbGFyYXRpb24oZGVmYXVsdHMpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcge0BsaW5rIFJ1bGV9IG5vZGUuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IFtkZWZhdWx0c10gLSBwcm9wZXJ0aWVzIGZvciB0aGUgbmV3IG5vZGUuXG4gKlxuICogQHJldHVybiB7QXRSdWxlfSBuZXcgUnVsZSBub2RlXG4gKlxuICogQGV4YW1wbGVcbiAqIHBvc3Rjc3MucnVsZSh7IHNlbGVjdG9yOiAnYScgfSkudG9TdHJpbmcoKSAvLz0+IFwiYSB7XFxufVwiXG4gKi9cbnBvc3Rjc3MucnVsZSA9IGRlZmF1bHRzID0+IG5ldyBSdWxlKGRlZmF1bHRzKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHtAbGluayBSb290fSBub2RlLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBbZGVmYXVsdHNdIC0gcHJvcGVydGllcyBmb3IgdGhlIG5ldyBub2RlLlxuICpcbiAqIEByZXR1cm4ge1Jvb3R9IG5ldyBSb290IG5vZGVcbiAqXG4gKiBAZXhhbXBsZVxuICogcG9zdGNzcy5yb290KHsgYWZ0ZXI6ICdcXG4nIH0pLnRvU3RyaW5nKCkgLy89PiBcIlxcblwiXG4gKi9cbnBvc3Rjc3Mucm9vdCA9IGRlZmF1bHRzID0+IG5ldyBSb290KGRlZmF1bHRzKTtcblxuZXhwb3J0IGRlZmF1bHQgcG9zdGNzcztcbiIsImltcG9ydCB7IEJhc2U2NCB9IGZyb20gJ2pzLWJhc2U2NCc7XG5pbXBvcnQgICBtb3ppbGxhICBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCAgIHBhdGggICAgIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICAgZnMgICAgICAgZnJvbSAnZnMnO1xuXG4vKipcbiAqIFNvdXJjZSBtYXAgaW5mb3JtYXRpb24gZnJvbSBpbnB1dCBDU1MuXG4gKiBGb3IgZXhhbXBsZSwgc291cmNlIG1hcCBhZnRlciBTYXNzIGNvbXBpbGVyLlxuICpcbiAqIFRoaXMgY2xhc3Mgd2lsbCBhdXRvbWF0aWNhbGx5IGZpbmQgc291cmNlIG1hcCBpbiBpbnB1dCBDU1Mgb3IgaW4gZmlsZSBzeXN0ZW1cbiAqIG5lYXIgaW5wdXQgZmlsZSAoYWNjb3JkaW5nIGBmcm9tYCBvcHRpb24pLlxuICpcbiAqIEBleGFtcGxlXG4gKiBjb25zdCByb290ID0gcG9zdGNzcy5wYXJzZShjc3MsIHsgZnJvbTogJ2Euc2Fzcy5jc3MnIH0pO1xuICogcm9vdC5pbnB1dC5tYXAgLy89PiBQcmV2aW91c01hcFxuICovXG5jbGFzcyBQcmV2aW91c01hcCB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICBjc3MgICAgLSBpbnB1dCBDU1Mgc291cmNlXG4gICAgICogQHBhcmFtIHtwcm9jZXNzT3B0aW9uc30gW29wdHNdIC0ge0BsaW5rIFByb2Nlc3NvciNwcm9jZXNzfSBvcHRpb25zXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY3NzLCBvcHRzKSB7XG4gICAgICAgIHRoaXMubG9hZEFubm90YXRpb24oY3NzKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge2Jvb2xlYW59IC0gV2FzIHNvdXJjZSBtYXAgaW5saW5lZCBieSBkYXRhLXVyaSB0byBpbnB1dCBDU1MuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmlubGluZSA9IHRoaXMuc3RhcnRXaXRoKHRoaXMuYW5ub3RhdGlvbiwgJ2RhdGE6Jyk7XG5cbiAgICAgICAgbGV0IHByZXYgPSBvcHRzLm1hcCA/IG9wdHMubWFwLnByZXYgOiB1bmRlZmluZWQ7XG4gICAgICAgIGxldCB0ZXh0ID0gdGhpcy5sb2FkTWFwKG9wdHMuZnJvbSwgcHJldik7XG4gICAgICAgIGlmICggdGV4dCApIHRoaXMudGV4dCA9IHRleHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgaW5zdGFuY2Ugb2YgYFNvdXJjZU1hcEdlbmVyYXRvcmAgY2xhc3NcbiAgICAgKiBmcm9tIHRoZSBgc291cmNlLW1hcGAgbGlicmFyeSB0byB3b3JrIHdpdGggc291cmNlIG1hcCBpbmZvcm1hdGlvbi5cbiAgICAgKlxuICAgICAqIEl0IGlzIGxhenkgbWV0aG9kLCBzbyBpdCB3aWxsIGNyZWF0ZSBvYmplY3Qgb25seSBvbiBmaXJzdCBjYWxsXG4gICAgICogYW5kIHRoZW4gaXQgd2lsbCB1c2UgY2FjaGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtTb3VyY2VNYXBHZW5lcmF0b3J9IG9iamVjdCB3aXRoIHNvdXJjZSBtYXAgaW5mb3JtYXRpb25cbiAgICAgKi9cbiAgICBjb25zdW1lcigpIHtcbiAgICAgICAgaWYgKCAhdGhpcy5jb25zdW1lckNhY2hlICkge1xuICAgICAgICAgICAgdGhpcy5jb25zdW1lckNhY2hlID0gbmV3IG1vemlsbGEuU291cmNlTWFwQ29uc3VtZXIodGhpcy50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jb25zdW1lckNhY2hlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERvZXMgc291cmNlIG1hcCBjb250YWlucyBgc291cmNlc0NvbnRlbnRgIHdpdGggaW5wdXQgc291cmNlIHRleHQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBJcyBgc291cmNlc0NvbnRlbnRgIHByZXNlbnRcbiAgICAgKi9cbiAgICB3aXRoQ29udGVudCgpIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuY29uc3VtZXIoKS5zb3VyY2VzQ29udGVudCAmJlxuICAgICAgICAgICAgICAgICAgdGhpcy5jb25zdW1lcigpLnNvdXJjZXNDb250ZW50Lmxlbmd0aCA+IDApO1xuICAgIH1cblxuICAgIHN0YXJ0V2l0aChzdHJpbmcsIHN0YXJ0KSB7XG4gICAgICAgIGlmICggIXN0cmluZyApIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5zdWJzdHIoMCwgc3RhcnQubGVuZ3RoKSA9PT0gc3RhcnQ7XG4gICAgfVxuXG4gICAgbG9hZEFubm90YXRpb24oY3NzKSB7XG4gICAgICAgIGxldCBtYXRjaCA9IGNzcy5tYXRjaCgvXFwvXFwqXFxzKiMgc291cmNlTWFwcGluZ1VSTD0oLiopXFxzKlxcKlxcLy8pO1xuICAgICAgICBpZiAoIG1hdGNoICkgdGhpcy5hbm5vdGF0aW9uID0gbWF0Y2hbMV0udHJpbSgpO1xuICAgIH1cblxuICAgIGRlY29kZUlubGluZSh0ZXh0KSB7XG4gICAgICAgIGxldCB1dGZkNjQgPSAnZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LCc7XG4gICAgICAgIGxldCB1dGY2NCAgPSAnZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmODtiYXNlNjQsJztcbiAgICAgICAgbGV0IGI2NCAgICA9ICdkYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LCc7XG4gICAgICAgIGxldCB1cmkgICAgPSAnZGF0YTphcHBsaWNhdGlvbi9qc29uLCc7XG5cbiAgICAgICAgaWYgKCB0aGlzLnN0YXJ0V2l0aCh0ZXh0LCB1cmkpICkge1xuICAgICAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudCggdGV4dC5zdWJzdHIodXJpLmxlbmd0aCkgKTtcblxuICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLnN0YXJ0V2l0aCh0ZXh0LCBiNjQpICkge1xuICAgICAgICAgICAgcmV0dXJuIEJhc2U2NC5kZWNvZGUoIHRleHQuc3Vic3RyKGI2NC5sZW5ndGgpICk7XG5cbiAgICAgICAgfSBlbHNlIGlmICggdGhpcy5zdGFydFdpdGgodGV4dCwgdXRmNjQpICkge1xuICAgICAgICAgICAgcmV0dXJuIEJhc2U2NC5kZWNvZGUoIHRleHQuc3Vic3RyKHV0ZjY0Lmxlbmd0aCkgKTtcblxuICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLnN0YXJ0V2l0aCh0ZXh0LCB1dGZkNjQpICkge1xuICAgICAgICAgICAgcmV0dXJuIEJhc2U2NC5kZWNvZGUoIHRleHQuc3Vic3RyKHV0ZmQ2NC5sZW5ndGgpICk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBlbmNvZGluZyA9IHRleHQubWF0Y2goL2RhdGE6YXBwbGljYXRpb25cXC9qc29uOyhbXixdKyksLylbMV07XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIHNvdXJjZSBtYXAgZW5jb2RpbmcgJyArIGVuY29kaW5nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxvYWRNYXAoZmlsZSwgcHJldikge1xuICAgICAgICBpZiAoIHByZXYgPT09IGZhbHNlICkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGlmICggcHJldiApIHtcbiAgICAgICAgICAgIGlmICggdHlwZW9mIHByZXYgPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2O1xuICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mIHByZXYgPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByZXZQYXRoID0gcHJldihmaWxlKTtcbiAgICAgICAgICAgICAgICBpZiAoIHByZXZQYXRoICYmIGZzLmV4aXN0c1N5bmMgJiYgZnMuZXhpc3RzU3luYyhwcmV2UGF0aCkgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocHJldlBhdGgsICd1dGYtOCcpLnRvU3RyaW5nKCkudHJpbSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGxvYWQgcHJldmlvdXMgc291cmNlIG1hcDogJyArXG4gICAgICAgICAgICAgICAgICAgIHByZXZQYXRoLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHByZXYgaW5zdGFuY2VvZiBtb3ppbGxhLlNvdXJjZU1hcENvbnN1bWVyICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtb3ppbGxhLlNvdXJjZU1hcEdlbmVyYXRvclxuICAgICAgICAgICAgICAgICAgICAuZnJvbVNvdXJjZU1hcChwcmV2KS50b1N0cmluZygpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICggcHJldiBpbnN0YW5jZW9mIG1vemlsbGEuU291cmNlTWFwR2VuZXJhdG9yICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLmlzTWFwKHByZXYpICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwcmV2KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBwcmV2aW91cyBzb3VyY2UgbWFwIGZvcm1hdDogJyArXG4gICAgICAgICAgICAgICAgICAgIHByZXYudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmICggdGhpcy5pbmxpbmUgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVJbmxpbmUodGhpcy5hbm5vdGF0aW9uKTtcblxuICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLmFubm90YXRpb24gKSB7XG4gICAgICAgICAgICBsZXQgbWFwID0gdGhpcy5hbm5vdGF0aW9uO1xuICAgICAgICAgICAgaWYgKCBmaWxlICkgbWFwID0gcGF0aC5qb2luKHBhdGguZGlybmFtZShmaWxlKSwgbWFwKTtcblxuICAgICAgICAgICAgdGhpcy5yb290ID0gcGF0aC5kaXJuYW1lKG1hcCk7XG4gICAgICAgICAgICBpZiAoIGZzLmV4aXN0c1N5bmMgJiYgZnMuZXhpc3RzU3luYyhtYXApICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmcy5yZWFkRmlsZVN5bmMobWFwLCAndXRmLTgnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNNYXAobWFwKSB7XG4gICAgICAgIGlmICggdHlwZW9mIG1hcCAhPT0gJ29iamVjdCcgKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0eXBlb2YgbWFwLm1hcHBpbmdzID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgICAgICAgdHlwZW9mIG1hcC5fbWFwcGluZ3MgPT09ICdzdHJpbmcnO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJldmlvdXNNYXA7XG4iLCJpbXBvcnQgTGF6eVJlc3VsdCAgZnJvbSAnLi9sYXp5LXJlc3VsdCc7XG5cbi8qKlxuICogQ29udGFpbnMgcGx1Z2lucyB0byBwcm9jZXNzIENTUy4gQ3JlYXRlIG9uZSBgUHJvY2Vzc29yYCBpbnN0YW5jZSxcbiAqIGluaXRpYWxpemUgaXRzIHBsdWdpbnMsIGFuZCB0aGVuIHVzZSB0aGF0IGluc3RhbmNlIG9uIG51bWVyb3VzIENTUyBmaWxlcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogY29uc3QgcHJvY2Vzc29yID0gcG9zdGNzcyhbYXV0b3ByZWZpeGVyLCBwcmVjc3NdKTtcbiAqIHByb2Nlc3Nvci5wcm9jZXNzKGNzczEpLnRoZW4ocmVzdWx0ID0+IGNvbnNvbGUubG9nKHJlc3VsdC5jc3MpKTtcbiAqIHByb2Nlc3Nvci5wcm9jZXNzKGNzczIpLnRoZW4ocmVzdWx0ID0+IGNvbnNvbGUubG9nKHJlc3VsdC5jc3MpKTtcbiAqL1xuY2xhc3MgUHJvY2Vzc29yIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7QXJyYXkuPFBsdWdpbnxwbHVnaW5GdW5jdGlvbj58UHJvY2Vzc29yfSBwbHVnaW5zIC0gUG9zdENTU1xuICAgICAqICAgICAgICBwbHVnaW5zLiBTZWUge0BsaW5rIFByb2Nlc3NvciN1c2V9IGZvciBwbHVnaW4gZm9ybWF0LlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBsdWdpbnMgPSBbXSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7c3RyaW5nfSAtIEN1cnJlbnQgUG9zdENTUyB2ZXJzaW9uLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBpZiAoIHJlc3VsdC5wcm9jZXNzb3IudmVyc2lvbi5zcGxpdCgnLicpWzBdICE9PSAnNScgKSB7XG4gICAgICAgICAqICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHBsdWdpbiB3b3JrcyBvbmx5IHdpdGggUG9zdENTUyA1Jyk7XG4gICAgICAgICAqIH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudmVyc2lvbiA9ICc1LjIuNic7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtwbHVnaW5GdW5jdGlvbltdfSAtIFBsdWdpbnMgYWRkZWQgdG8gdGhpcyBwcm9jZXNzb3IuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGNvbnN0IHByb2Nlc3NvciA9IHBvc3Rjc3MoW2F1dG9wcmVmaXhlciwgcHJlY3NzXSk7XG4gICAgICAgICAqIHByb2Nlc3Nvci5wbHVnaW5zLmxlbmd0aCAvLz0+IDJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucGx1Z2lucyA9IHRoaXMubm9ybWFsaXplKHBsdWdpbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBwbHVnaW4gdG8gYmUgdXNlZCBhcyBhIENTUyBwcm9jZXNzb3IuXG4gICAgICpcbiAgICAgKiBQb3N0Q1NTIHBsdWdpbiBjYW4gYmUgaW4gNCBmb3JtYXRzOlxuICAgICAqICogQSBwbHVnaW4gY3JlYXRlZCBieSB7QGxpbmsgcG9zdGNzcy5wbHVnaW59IG1ldGhvZC5cbiAgICAgKiAqIEEgZnVuY3Rpb24uIFBvc3RDU1Mgd2lsbCBwYXNzIHRoZSBmdW5jdGlvbiBhIEB7bGluayBSb290fVxuICAgICAqICAgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IGFuZCBjdXJyZW50IHtAbGluayBSZXN1bHR9IGluc3RhbmNlXG4gICAgICogICBhcyB0aGUgc2Vjb25kLlxuICAgICAqICogQW4gb2JqZWN0IHdpdGggYSBgcG9zdGNzc2AgbWV0aG9kLiBQb3N0Q1NTIHdpbGwgdXNlIHRoYXQgbWV0aG9kXG4gICAgICogICBhcyBkZXNjcmliZWQgaW4gIzIuXG4gICAgICogKiBBbm90aGVyIHtAbGluayBQcm9jZXNzb3J9IGluc3RhbmNlLiBQb3N0Q1NTIHdpbGwgY29weSBwbHVnaW5zXG4gICAgICogICBmcm9tIHRoYXQgaW5zdGFuY2UgaW50byB0aGlzIG9uZS5cbiAgICAgKlxuICAgICAqIFBsdWdpbnMgY2FuIGFsc28gYmUgYWRkZWQgYnkgcGFzc2luZyB0aGVtIGFzIGFyZ3VtZW50cyB3aGVuIGNyZWF0aW5nXG4gICAgICogYSBgcG9zdGNzc2AgaW5zdGFuY2UgKHNlZSBbYHBvc3Rjc3MocGx1Z2lucylgXSkuXG4gICAgICpcbiAgICAgKiBBc3luY2hyb25vdXMgcGx1Z2lucyBzaG91bGQgcmV0dXJuIGEgYFByb21pc2VgIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtQbHVnaW58cGx1Z2luRnVuY3Rpb258UHJvY2Vzc29yfSBwbHVnaW4gLSBQb3N0Q1NTIHBsdWdpblxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Ige0BsaW5rIFByb2Nlc3Nvcn1cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggcGx1Z2luc1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBwcm9jZXNzb3IgPSBwb3N0Y3NzKClcbiAgICAgKiAgIC51c2UoYXV0b3ByZWZpeGVyKVxuICAgICAqICAgLnVzZShwcmVjc3MpO1xuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvY2Vzc2VzfSBjdXJyZW50IHByb2Nlc3NvciB0byBtYWtlIG1ldGhvZHMgY2hhaW5cbiAgICAgKi9cbiAgICB1c2UocGx1Z2luKSB7XG4gICAgICAgIHRoaXMucGx1Z2lucyA9IHRoaXMucGx1Z2lucy5jb25jYXQodGhpcy5ub3JtYWxpemUoW3BsdWdpbl0pKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFyc2VzIHNvdXJjZSBDU1MgYW5kIHJldHVybnMgYSB7QGxpbmsgTGF6eVJlc3VsdH0gUHJvbWlzZSBwcm94eS5cbiAgICAgKiBCZWNhdXNlIHNvbWUgcGx1Z2lucyBjYW4gYmUgYXN5bmNocm9ub3VzIGl0IGRvZXNu4oCZdCBtYWtlXG4gICAgICogYW55IHRyYW5zZm9ybWF0aW9ucy4gVHJhbnNmb3JtYXRpb25zIHdpbGwgYmUgYXBwbGllZFxuICAgICAqIGluIHRoZSB7QGxpbmsgTGF6eVJlc3VsdH0gbWV0aG9kcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfHRvU3RyaW5nfFJlc3VsdH0gY3NzIC0gU3RyaW5nIHdpdGggaW5wdXQgQ1NTIG9yXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnkgb2JqZWN0IHdpdGggYSBgdG9TdHJpbmcoKWBcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZCwgbGlrZSBhIEJ1ZmZlci5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9wdGlvbmFsbHksIHNlbmQgYSB7QGxpbmsgUmVzdWx0fVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UgYW5kIHRoZSBwcm9jZXNzb3Igd2lsbFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFrZSB0aGUge0BsaW5rIFJvb3R9IGZyb20gaXQuXG4gICAgICogQHBhcmFtIHtwcm9jZXNzT3B0aW9uc30gW29wdHNdICAgICAgLSBvcHRpb25zXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtMYXp5UmVzdWx0fSBQcm9taXNlIHByb3h5XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHByb2Nlc3Nvci5wcm9jZXNzKGNzcywgeyBmcm9tOiAnYS5jc3MnLCB0bzogJ2Eub3V0LmNzcycgfSlcbiAgICAgKiAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICogICAgICBjb25zb2xlLmxvZyhyZXN1bHQuY3NzKTtcbiAgICAgKiAgIH0pO1xuICAgICAqL1xuICAgIHByb2Nlc3MoY3NzLCBvcHRzID0geyB9KSB7XG4gICAgICAgIHJldHVybiBuZXcgTGF6eVJlc3VsdCh0aGlzLCBjc3MsIG9wdHMpO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZShwbHVnaW5zKSB7XG4gICAgICAgIGxldCBub3JtYWxpemVkID0gW107XG4gICAgICAgIGZvciAoIGxldCBpIG9mIHBsdWdpbnMgKSB7XG4gICAgICAgICAgICBpZiAoIGkucG9zdGNzcyApIGkgPSBpLnBvc3Rjc3M7XG5cbiAgICAgICAgICAgIGlmICggdHlwZW9mIGkgPT09ICdvYmplY3QnICYmIEFycmF5LmlzQXJyYXkoaS5wbHVnaW5zKSApIHtcbiAgICAgICAgICAgICAgICBub3JtYWxpemVkID0gbm9ybWFsaXplZC5jb25jYXQoaS5wbHVnaW5zKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiBpID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWQucHVzaChpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGkgKyAnIGlzIG5vdCBhIFBvc3RDU1MgcGx1Z2luJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFByb2Nlc3NvcjtcblxuLyoqXG4gKiBAY2FsbGJhY2sgYnVpbGRlclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcnQgICAgICAgICAgLSBwYXJ0IG9mIGdlbmVyYXRlZCBDU1MgY29ubmVjdGVkIHRvIHRoaXMgbm9kZVxuICogQHBhcmFtIHtOb2RlfSAgIG5vZGUgICAgICAgICAgLSBBU1Qgbm9kZVxuICogQHBhcmFtIHtcInN0YXJ0XCJ8XCJlbmRcIn0gW3R5cGVdIC0gbm9kZeKAmXMgcGFydCB0eXBlXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgcGFyc2VyXG4gKlxuICogQHBhcmFtIHtzdHJpbmd8dG9TdHJpbmd9IGNzcyAgIC0gc3RyaW5nIHdpdGggaW5wdXQgQ1NTIG9yIGFueSBvYmplY3RcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggdG9TdHJpbmcoKSBtZXRob2QsIGxpa2UgYSBCdWZmZXJcbiAqIEBwYXJhbSB7cHJvY2Vzc09wdGlvbnN9IFtvcHRzXSAtIG9wdGlvbnMgd2l0aCBvbmx5IGBmcm9tYCBhbmQgYG1hcGAga2V5c1xuICpcbiAqIEByZXR1cm4ge1Jvb3R9IFBvc3RDU1MgQVNUXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgc3RyaW5naWZpZXJcbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgICAgICAgLSBzdGFydCBub2RlIGZvciBzdHJpbmdpZmluZy4gVXN1YWxseSB7QGxpbmsgUm9vdH0uXG4gKiBAcGFyYW0ge2J1aWxkZXJ9IGJ1aWxkZXIgLSBmdW5jdGlvbiB0byBjb25jYXRlbmF0ZSBDU1MgZnJvbSBub2Rl4oCZcyBwYXJ0c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgb3IgZ2VuZXJhdGUgc3RyaW5nIGFuZCBzb3VyY2UgbWFwXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtvYmplY3R9IHN5bnRheFxuICogQHByb3BlcnR5IHtwYXJzZXJ9IHBhcnNlICAgICAgICAgIC0gZnVuY3Rpb24gdG8gZ2VuZXJhdGUgQVNUIGJ5IHN0cmluZ1xuICogQHByb3BlcnR5IHtzdHJpbmdpZmllcn0gc3RyaW5naWZ5IC0gZnVuY3Rpb24gdG8gZ2VuZXJhdGUgc3RyaW5nIGJ5IEFTVFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge29iamVjdH0gdG9TdHJpbmdcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IHRvU3RyaW5nXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgcGx1Z2luRnVuY3Rpb25cbiAqIEBwYXJhbSB7Um9vdH0gcm9vdCAgICAgLSBwYXJzZWQgaW5wdXQgQ1NTXG4gKiBAcGFyYW0ge1Jlc3VsdH0gcmVzdWx0IC0gcmVzdWx0IHRvIHNldCB3YXJuaW5ncyBvciBjaGVjayBvdGhlciBwbHVnaW5zXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBQbHVnaW5cbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IHBvc3Rjc3MgLSBQb3N0Q1NTIHBsdWdpbiBmdW5jdGlvblxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge29iamVjdH0gcHJvY2Vzc09wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBmcm9tICAgICAgICAgICAgIC0gdGhlIHBhdGggb2YgdGhlIENTUyBzb3VyY2UgZmlsZS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWW91IHNob3VsZCBhbHdheXMgc2V0IGBmcm9tYCxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVjYXVzZSBpdCBpcyB1c2VkIGluIHNvdXJjZSBtYXBcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGlvbiBhbmQgc3ludGF4IGVycm9yIG1lc3NhZ2VzLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IHRvICAgICAgICAgICAgICAgLSB0aGUgcGF0aCB3aGVyZSB5b3XigJlsbCBwdXQgdGhlIG91dHB1dFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDU1MgZmlsZS4gWW91IHNob3VsZCBhbHdheXMgc2V0IGB0b2BcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gZ2VuZXJhdGUgY29ycmVjdCBzb3VyY2UgbWFwcy5cbiAqIEBwcm9wZXJ0eSB7cGFyc2VyfSBwYXJzZXIgICAgICAgICAgIC0gZnVuY3Rpb24gdG8gZ2VuZXJhdGUgQVNUIGJ5IHN0cmluZ1xuICogQHByb3BlcnR5IHtzdHJpbmdpZmllcn0gc3RyaW5naWZpZXIgLSBjbGFzcyB0byBnZW5lcmF0ZSBzdHJpbmcgYnkgQVNUXG4gKiBAcHJvcGVydHkge3N5bnRheH0gc3ludGF4ICAgICAgICAgICAtIG9iamVjdCB3aXRoIGBwYXJzZWAgYW5kIGBzdHJpbmdpZnlgXG4gKiBAcHJvcGVydHkge29iamVjdH0gbWFwICAgICAgICAgICAgICAtIHNvdXJjZSBtYXAgb3B0aW9uc1xuICogQHByb3BlcnR5IHtib29sZWFufSBtYXAuaW5saW5lICAgICAgICAgICAgICAgICAgICAtIGRvZXMgc291cmNlIG1hcCBzaG91bGRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZSBlbWJlZGRlZCBpbiB0aGUgb3V0cHV0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ1NTIGFzIGEgYmFzZTY0LWVuY29kZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21tZW50XG4gKiBAcHJvcGVydHkge3N0cmluZ3xvYmplY3R8ZmFsc2V8ZnVuY3Rpb259IG1hcC5wcmV2IC0gc291cmNlIG1hcCBjb250ZW50XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBhIHByZXZpb3VzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2luZyBzdGVwXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGZvciBleGFtcGxlLCBTYXNzKS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQb3N0Q1NTIHdpbGwgdHJ5IHRvIGZpbmRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91cyBtYXBcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvbWF0aWNhbGx5LCBzbyB5b3VcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VsZCBkaXNhYmxlIGl0IGJ5XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYGZhbHNlYCB2YWx1ZS5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gbWFwLnNvdXJjZXNDb250ZW50ICAgICAgICAgICAgLSBkb2VzIFBvc3RDU1Mgc2hvdWxkIHNldFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBvcmlnaW4gY29udGVudCB0byBtYXBcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfGZhbHNlfSBtYXAuYW5ub3RhdGlvbiAgICAgICAgICAgLSBkb2VzIFBvc3RDU1Mgc2hvdWxkIHNldFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFubm90YXRpb24gY29tbWVudCB0byBtYXBcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBtYXAuZnJvbSAgICAgICAgICAgICAgICAgICAgICAgLSBvdmVycmlkZSBgZnJvbWAgaW4gbWFw4oCZc1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBzb3VyY2VzYFxuICovXG4iLCJpbXBvcnQgV2FybmluZyBmcm9tICcuL3dhcm5pbmcnO1xuXG4vKipcbiAqIFByb3ZpZGVzIHRoZSByZXN1bHQgb2YgdGhlIFBvc3RDU1MgdHJhbnNmb3JtYXRpb25zLlxuICpcbiAqIEEgUmVzdWx0IGluc3RhbmNlIGlzIHJldHVybmVkIGJ5IHtAbGluayBMYXp5UmVzdWx0I3RoZW59XG4gKiBvciB7QGxpbmsgUm9vdCN0b1Jlc3VsdH0gbWV0aG9kcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogcG9zdGNzcyhbY3NzbmV4dF0pLnByb2Nlc3MoY3NzKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAqICAgIGNvbnNvbGUubG9nKHJlc3VsdC5jc3MpO1xuICogfSk7XG4gKlxuICogQGV4YW1wbGVcbiAqIHZhciByZXN1bHQyID0gcG9zdGNzcy5wYXJzZShjc3MpLnRvUmVzdWx0KCk7XG4gKi9cbmNsYXNzIFJlc3VsdCB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1Byb2Nlc3Nvcn0gcHJvY2Vzc29yIC0gcHJvY2Vzc29yIHVzZWQgZm9yIHRoaXMgdHJhbnNmb3JtYXRpb24uXG4gICAgICogQHBhcmFtIHtSb290fSAgICAgIHJvb3QgICAgICAtIFJvb3Qgbm9kZSBhZnRlciBhbGwgdHJhbnNmb3JtYXRpb25zLlxuICAgICAqIEBwYXJhbSB7cHJvY2Vzc09wdGlvbnN9IG9wdHMgLSBvcHRpb25zIGZyb20gdGhlIHtAbGluayBQcm9jZXNzb3IjcHJvY2Vzc31cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Ige0BsaW5rIFJvb3QjdG9SZXN1bHR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJvY2Vzc29yLCByb290LCBvcHRzKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtQcm9jZXNzb3J9IC0gVGhlIFByb2Nlc3NvciBpbnN0YW5jZSB1c2VkXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICBmb3IgdGhpcyB0cmFuc2Zvcm1hdGlvbi5cbiAgICAgICAgICpcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogZm9yICggbGV0IHBsdWdpbiBvZiByZXN1bHQucHJvY2Vzc29yLnBsdWdpbnMpIHtcbiAgICAgICAgICogICBpZiAoIHBsdWdpbi5wb3N0Y3NzUGx1Z2luID09PSAncG9zdGNzcy1iYWQnICkge1xuICAgICAgICAgKiAgICAgdGhyb3cgJ3Bvc3Rjc3MtZ29vZCBpcyBpbmNvbXBhdGlibGUgd2l0aCBwb3N0Y3NzLWJhZCc7XG4gICAgICAgICAqICAgfVxuICAgICAgICAgKiB9KTtcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucHJvY2Vzc29yID0gcHJvY2Vzc29yO1xuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7TWVzc2FnZVtdfSAtIENvbnRhaW5zIG1lc3NhZ2VzIGZyb20gcGx1Z2luc1xuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgKGUuZy4sIHdhcm5pbmdzIG9yIGN1c3RvbSBtZXNzYWdlcykuXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICBFYWNoIG1lc3NhZ2Ugc2hvdWxkIGhhdmUgdHlwZVxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgYW5kIHBsdWdpbiBwcm9wZXJ0aWVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBwb3N0Y3NzLnBsdWdpbigncG9zdGNzcy1taW4tYnJvd3NlcicsICgpID0+IHtcbiAgICAgICAgICogICByZXR1cm4gKHJvb3QsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgKiAgICAgdmFyIGJyb3dzZXJzID0gZGV0ZWN0TWluQnJvd3NlcnNCeUNhbklVc2Uocm9vdCk7XG4gICAgICAgICAqICAgICByZXN1bHQubWVzc2FnZXMucHVzaCh7XG4gICAgICAgICAqICAgICAgIHR5cGU6ICAgICdtaW4tYnJvd3NlcicsXG4gICAgICAgICAqICAgICAgIHBsdWdpbjogICdwb3N0Y3NzLW1pbi1icm93c2VyJyxcbiAgICAgICAgICogICAgICAgYnJvd3NlcnM6IGJyb3dzZXJzXG4gICAgICAgICAqICAgICB9KTtcbiAgICAgICAgICogICB9O1xuICAgICAgICAgKiB9KTtcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge1Jvb3R9IC0gUm9vdCBub2RlIGFmdGVyIGFsbCB0cmFuc2Zvcm1hdGlvbnMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIHJvb3QudG9SZXN1bHQoKS5yb290ID09IHJvb3Q7XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xuICAgICAgICAvKipcbiAgICAgICAgICogQG1lbWJlciB7cHJvY2Vzc09wdGlvbnN9IC0gT3B0aW9ucyBmcm9tIHRoZSB7QGxpbmsgUHJvY2Vzc29yI3Byb2Nlc3N9XG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yIHtAbGluayBSb290I3RvUmVzdWx0fSBjYWxsXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQgcHJvZHVjZWQgdGhpcyBSZXN1bHQgaW5zdGFuY2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIHJvb3QudG9SZXN1bHQob3B0cykub3B0cyA9PSBvcHRzO1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge3N0cmluZ30gLSBBIENTUyBzdHJpbmcgcmVwcmVzZW50aW5nIG9mIHtAbGluayBSZXN1bHQjcm9vdH0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIHBvc3Rjc3MucGFyc2UoJ2F7fScpLnRvUmVzdWx0KCkuY3NzIC8vPT4gXCJhe31cIlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jc3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtTb3VyY2VNYXBHZW5lcmF0b3J9IC0gQW4gaW5zdGFuY2Ugb2YgYFNvdXJjZU1hcEdlbmVyYXRvcmBcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzIGZyb20gdGhlIGBzb3VyY2UtbWFwYCBsaWJyYXJ5LFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwcmVzZW50aW5nIGNoYW5nZXNcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHRoZSB7QGxpbmsgUmVzdWx0I3Jvb3R9IGluc3RhbmNlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiByZXN1bHQubWFwLnRvSlNPTigpIC8vPT4geyB2ZXJzaW9uOiAzLCBmaWxlOiAnYS5jc3MnLCDigKYgfVxuICAgICAgICAgKlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBpZiAoIHJlc3VsdC5tYXAgKSB7XG4gICAgICAgICAqICAgZnMud3JpdGVGaWxlU3luYyhyZXN1bHQub3B0cy50byArICcubWFwJywgcmVzdWx0Lm1hcC50b1N0cmluZygpKTtcbiAgICAgICAgICogfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5tYXAgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBmb3IgQHtsaW5rIFJlc3VsdCNjc3N9IGNvbnRlbnQuXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHJlc3VsdCArICcnID09PSByZXN1bHQuY3NzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IHN0cmluZyByZXByZXNlbnRpbmcgb2Yge0BsaW5rIFJlc3VsdCNyb290fVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jc3M7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiB7QGxpbmsgV2FybmluZ30gYW5kIGFkZHMgaXRcbiAgICAgKiB0byB7QGxpbmsgUmVzdWx0I21lc3NhZ2VzfS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0ICAgICAgICAtIHdhcm5pbmcgbWVzc2FnZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0c10gICAgICAtIHdhcm5pbmcgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7Tm9kZX0gICBvcHRzLm5vZGUgICAtIENTUyBub2RlIHRoYXQgY2F1c2VkIHRoZSB3YXJuaW5nXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG9wdHMud29yZCAgIC0gd29yZCBpbiBDU1Mgc291cmNlIHRoYXQgY2F1c2VkIHRoZSB3YXJuaW5nXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMuaW5kZXggIC0gaW5kZXggaW4gQ1NTIG5vZGUgc3RyaW5nIHRoYXQgY2F1c2VkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHdhcm5pbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb3B0cy5wbHVnaW4gLSBuYW1lIG9mIHRoZSBwbHVnaW4gdGhhdCBjcmVhdGVkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyB3YXJuaW5nLiB7QGxpbmsgUmVzdWx0I3dhcm59IGZpbGxzXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyBwcm9wZXJ0eSBhdXRvbWF0aWNhbGx5LlxuICAgICAqXG4gICAgICogQHJldHVybiB7V2FybmluZ30gY3JlYXRlZCB3YXJuaW5nXG4gICAgICovXG4gICAgd2Fybih0ZXh0LCBvcHRzID0geyB9KSB7XG4gICAgICAgIGlmICggIW9wdHMucGx1Z2luICkge1xuICAgICAgICAgICAgaWYgKCB0aGlzLmxhc3RQbHVnaW4gJiYgdGhpcy5sYXN0UGx1Z2luLnBvc3Rjc3NQbHVnaW4gKSB7XG4gICAgICAgICAgICAgICAgb3B0cy5wbHVnaW4gPSB0aGlzLmxhc3RQbHVnaW4ucG9zdGNzc1BsdWdpbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB3YXJuaW5nID0gbmV3IFdhcm5pbmcodGV4dCwgb3B0cyk7XG4gICAgICAgIHRoaXMubWVzc2FnZXMucHVzaCh3YXJuaW5nKTtcblxuICAgICAgICByZXR1cm4gd2FybmluZztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdhcm5pbmdzIGZyb20gcGx1Z2lucy4gRmlsdGVycyB7QGxpbmsgV2FybmluZ30gaW5zdGFuY2VzXG4gICAgICogZnJvbSB7QGxpbmsgUmVzdWx0I21lc3NhZ2VzfS5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogcmVzdWx0Lndhcm5pbmdzKCkuZm9yRWFjaCh3YXJuID0+IHtcbiAgICAgKiAgIGNvbnNvbGUud2Fybih3YXJuLnRvU3RyaW5nKCkpO1xuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogQHJldHVybiB7V2FybmluZ1tdfSB3YXJuaW5ncyBmcm9tIHBsdWdpbnNcbiAgICAgKi9cbiAgICB3YXJuaW5ncygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZXMuZmlsdGVyKCBpID0+IGkudHlwZSA9PT0gJ3dhcm5pbmcnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW4gYWxpYXMgZm9yIHRoZSB7QGxpbmsgUmVzdWx0I2Nzc30gcHJvcGVydHkuXG4gICAgICogVXNlIGl0IHdpdGggc3ludGF4ZXMgdGhhdCBnZW5lcmF0ZSBub24tQ1NTIG91dHB1dC5cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiByZXN1bHQuY3NzID09PSByZXN1bHQuY29udGVudDtcbiAgICAgKi9cbiAgICBnZXQgY29udGVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3NzO1xuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBSZXN1bHQ7XG5cbi8qKlxuICogQHR5cGVkZWYgIHtvYmplY3R9IE1lc3NhZ2VcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0eXBlICAgLSBtZXNzYWdlIHR5cGVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBwbHVnaW4gLSBzb3VyY2UgUG9zdENTUyBwbHVnaW4gbmFtZVxuICovXG4iLCJpbXBvcnQgQ29udGFpbmVyIGZyb20gJy4vY29udGFpbmVyJztcbmltcG9ydCB3YXJuT25jZSAgZnJvbSAnLi93YXJuLW9uY2UnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBDU1MgZmlsZSBhbmQgY29udGFpbnMgYWxsIGl0cyBwYXJzZWQgbm9kZXMuXG4gKlxuICogQGV4dGVuZHMgQ29udGFpbmVyXG4gKlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IHJvb3QgPSBwb3N0Y3NzLnBhcnNlKCdhe2NvbG9yOmJsYWNrfSBie3otaW5kZXg6Mn0nKTtcbiAqIHJvb3QudHlwZSAgICAgICAgIC8vPT4gJ3Jvb3QnXG4gKiByb290Lm5vZGVzLmxlbmd0aCAvLz0+IDJcbiAqL1xuY2xhc3MgUm9vdCBleHRlbmRzIENvbnRhaW5lciB7XG5cbiAgICBjb25zdHJ1Y3RvcihkZWZhdWx0cykge1xuICAgICAgICBzdXBlcihkZWZhdWx0cyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdyb290JztcbiAgICAgICAgaWYgKCAhdGhpcy5ub2RlcyApIHRoaXMubm9kZXMgPSBbXTtcbiAgICB9XG5cbiAgICByZW1vdmVDaGlsZChjaGlsZCkge1xuICAgICAgICBjaGlsZCA9IHRoaXMuaW5kZXgoY2hpbGQpO1xuXG4gICAgICAgIGlmICggY2hpbGQgPT09IDAgJiYgdGhpcy5ub2Rlcy5sZW5ndGggPiAxICkge1xuICAgICAgICAgICAgdGhpcy5ub2Rlc1sxXS5yYXdzLmJlZm9yZSA9IHRoaXMubm9kZXNbY2hpbGRdLnJhd3MuYmVmb3JlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN1cGVyLnJlbW92ZUNoaWxkKGNoaWxkKTtcbiAgICB9XG5cbiAgICBub3JtYWxpemUoY2hpbGQsIHNhbXBsZSwgdHlwZSkge1xuICAgICAgICBsZXQgbm9kZXMgPSBzdXBlci5ub3JtYWxpemUoY2hpbGQpO1xuXG4gICAgICAgIGlmICggc2FtcGxlICkge1xuICAgICAgICAgICAgaWYgKCB0eXBlID09PSAncHJlcGVuZCcgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCB0aGlzLm5vZGVzLmxlbmd0aCA+IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNhbXBsZS5yYXdzLmJlZm9yZSA9IHRoaXMubm9kZXNbMV0ucmF3cy5iZWZvcmU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHNhbXBsZS5yYXdzLmJlZm9yZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLmZpcnN0ICE9PSBzYW1wbGUgKSB7XG4gICAgICAgICAgICAgICAgZm9yICggbGV0IG5vZGUgb2Ygbm9kZXMgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUucmF3cy5iZWZvcmUgPSBzYW1wbGUucmF3cy5iZWZvcmU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgUmVzdWx0fSBpbnN0YW5jZSByZXByZXNlbnRpbmcgdGhlIHJvb3TigJlzIENTUy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7cHJvY2Vzc09wdGlvbnN9IFtvcHRzXSAtIG9wdGlvbnMgd2l0aCBvbmx5IGB0b2AgYW5kIGBtYXBgIGtleXNcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Jlc3VsdH0gcmVzdWx0IHdpdGggY3VycmVudCByb2904oCZcyBDU1NcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3Qgcm9vdDEgPSBwb3N0Y3NzLnBhcnNlKGNzczEsIHsgZnJvbTogJ2EuY3NzJyB9KTtcbiAgICAgKiBjb25zdCByb290MiA9IHBvc3Rjc3MucGFyc2UoY3NzMiwgeyBmcm9tOiAnYi5jc3MnIH0pO1xuICAgICAqIHJvb3QxLmFwcGVuZChyb290Mik7XG4gICAgICogY29uc3QgcmVzdWx0ID0gcm9vdDEudG9SZXN1bHQoeyB0bzogJ2FsbC5jc3MnLCBtYXA6IHRydWUgfSk7XG4gICAgICovXG4gICAgdG9SZXN1bHQob3B0cyA9IHsgfSkge1xuICAgICAgICBsZXQgTGF6eVJlc3VsdCA9IHJlcXVpcmUoJy4vbGF6eS1yZXN1bHQnKTtcbiAgICAgICAgbGV0IFByb2Nlc3NvciAgPSByZXF1aXJlKCcuL3Byb2Nlc3NvcicpO1xuXG4gICAgICAgIGxldCBsYXp5ID0gbmV3IExhenlSZXN1bHQobmV3IFByb2Nlc3NvcigpLCB0aGlzLCBvcHRzKTtcbiAgICAgICAgcmV0dXJuIGxhenkuc3RyaW5naWZ5KCk7XG4gICAgfVxuXG4gICAgcmVtb3ZlKGNoaWxkKSB7XG4gICAgICAgIHdhcm5PbmNlKCdSb290I3JlbW92ZSBpcyBkZXByZWNhdGVkLiBVc2UgUm9vdCNyZW1vdmVDaGlsZCcpO1xuICAgICAgICB0aGlzLnJlbW92ZUNoaWxkKGNoaWxkKTtcbiAgICB9XG5cbiAgICBwcmV2TWFwKCkge1xuICAgICAgICB3YXJuT25jZSgnUm9vdCNwcmV2TWFwIGlzIGRlcHJlY2F0ZWQuIFVzZSBSb290I3NvdXJjZS5pbnB1dC5tYXAnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc291cmNlLmlucHV0Lm1hcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgUm9vdCNcbiAgICAgKiBAbWVtYmVyIHtvYmplY3R9IHJhd3MgLSBJbmZvcm1hdGlvbiB0byBnZW5lcmF0ZSBieXRlLXRvLWJ5dGUgZXF1YWxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICBub2RlIHN0cmluZyBhcyBpdCB3YXMgaW4gdGhlIG9yaWdpbiBpbnB1dC5cbiAgICAgKlxuICAgICAqIEV2ZXJ5IHBhcnNlciBzYXZlcyBpdHMgb3duIHByb3BlcnRpZXMsXG4gICAgICogYnV0IHRoZSBkZWZhdWx0IENTUyBwYXJzZXIgdXNlczpcbiAgICAgKlxuICAgICAqICogYGFmdGVyYDogdGhlIHNwYWNlIHN5bWJvbHMgYWZ0ZXIgdGhlIGxhc3QgY2hpbGQgdG8gdGhlIGVuZCBvZiBmaWxlLlxuICAgICAqICogYHNlbWljb2xvbmA6IGlzIHRoZSBsYXN0IGNoaWxkIGhhcyBhbiAob3B0aW9uYWwpIHNlbWljb2xvbi5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogcG9zdGNzcy5wYXJzZSgnYSB7fVxcbicpLnJhd3MgLy89PiB7IGFmdGVyOiAnXFxuJyB9XG4gICAgICogcG9zdGNzcy5wYXJzZSgnYSB7fScpLnJhd3MgICAvLz0+IHsgYWZ0ZXI6ICcnIH1cbiAgICAgKi9cblxufVxuXG5leHBvcnQgZGVmYXVsdCBSb290O1xuIiwiaW1wb3J0IENvbnRhaW5lciBmcm9tICcuL2NvbnRhaW5lcic7XG5pbXBvcnQgd2Fybk9uY2UgIGZyb20gJy4vd2Fybi1vbmNlJztcbmltcG9ydCBsaXN0ICAgICAgZnJvbSAnLi9saXN0JztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgQ1NTIHJ1bGU6IGEgc2VsZWN0b3IgZm9sbG93ZWQgYnkgYSBkZWNsYXJhdGlvbiBibG9jay5cbiAqXG4gKiBAZXh0ZW5kcyBDb250YWluZXJcbiAqXG4gKiBAZXhhbXBsZVxuICogY29uc3Qgcm9vdCA9IHBvc3Rjc3MucGFyc2UoJ2F7fScpO1xuICogY29uc3QgcnVsZSA9IHJvb3QuZmlyc3Q7XG4gKiBydWxlLnR5cGUgICAgICAgLy89PiAncnVsZSdcbiAqIHJ1bGUudG9TdHJpbmcoKSAvLz0+ICdhe30nXG4gKi9cbmNsYXNzIFJ1bGUgZXh0ZW5kcyBDb250YWluZXIge1xuXG4gICAgY29uc3RydWN0b3IoZGVmYXVsdHMpIHtcbiAgICAgICAgc3VwZXIoZGVmYXVsdHMpO1xuICAgICAgICB0aGlzLnR5cGUgPSAncnVsZSc7XG4gICAgICAgIGlmICggIXRoaXMubm9kZXMgKSB0aGlzLm5vZGVzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW4gYXJyYXkgY29udGFpbmluZyB0aGUgcnVsZeKAmXMgaW5kaXZpZHVhbCBzZWxlY3RvcnMuXG4gICAgICogR3JvdXBzIG9mIHNlbGVjdG9ycyBhcmUgc3BsaXQgYXQgY29tbWFzLlxuICAgICAqXG4gICAgICogQHR5cGUge3N0cmluZ1tdfVxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCByb290ID0gcG9zdGNzcy5wYXJzZSgnYSwgYiB7IH0nKTtcbiAgICAgKiBjb25zdCBydWxlID0gcm9vdC5maXJzdDtcbiAgICAgKlxuICAgICAqIHJ1bGUuc2VsZWN0b3IgIC8vPT4gJ2EsIGInXG4gICAgICogcnVsZS5zZWxlY3RvcnMgLy89PiBbJ2EnLCAnYiddXG4gICAgICpcbiAgICAgKiBydWxlLnNlbGVjdG9ycyA9IFsnYScsICdzdHJvbmcnXTtcbiAgICAgKiBydWxlLnNlbGVjdG9yIC8vPT4gJ2EsIHN0cm9uZydcbiAgICAgKi9cbiAgICBnZXQgc2VsZWN0b3JzKCkge1xuICAgICAgICByZXR1cm4gbGlzdC5jb21tYSh0aGlzLnNlbGVjdG9yKTtcbiAgICB9XG5cbiAgICBzZXQgc2VsZWN0b3JzKHZhbHVlcykge1xuICAgICAgICBsZXQgbWF0Y2ggPSB0aGlzLnNlbGVjdG9yID8gdGhpcy5zZWxlY3Rvci5tYXRjaCgvLFxccyovKSA6IG51bGw7XG4gICAgICAgIGxldCBzZXAgICA9IG1hdGNoID8gbWF0Y2hbMF0gOiAnLCcgKyB0aGlzLnJhdygnYmV0d2VlbicsICdiZWZvcmVPcGVuJyk7XG4gICAgICAgIHRoaXMuc2VsZWN0b3IgPSB2YWx1ZXMuam9pbihzZXApO1xuICAgIH1cblxuICAgIGdldCBfc2VsZWN0b3IoKSB7XG4gICAgICAgIHdhcm5PbmNlKCdSdWxlI19zZWxlY3RvciBpcyBkZXByZWNhdGVkLiBVc2UgUnVsZSNyYXdzLnNlbGVjdG9yJyk7XG4gICAgICAgIHJldHVybiB0aGlzLnJhd3Muc2VsZWN0b3I7XG4gICAgfVxuXG4gICAgc2V0IF9zZWxlY3Rvcih2YWwpIHtcbiAgICAgICAgd2Fybk9uY2UoJ1J1bGUjX3NlbGVjdG9yIGlzIGRlcHJlY2F0ZWQuIFVzZSBSdWxlI3Jhd3Muc2VsZWN0b3InKTtcbiAgICAgICAgdGhpcy5yYXdzLnNlbGVjdG9yID0gdmFsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBSdWxlI1xuICAgICAqIEBtZW1iZXIge3N0cmluZ30gc2VsZWN0b3IgLSB0aGUgcnVsZeKAmXMgZnVsbCBzZWxlY3RvciByZXByZXNlbnRlZFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBhIHN0cmluZ1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCByb290ID0gcG9zdGNzcy5wYXJzZSgnYSwgYiB7IH0nKTtcbiAgICAgKiBjb25zdCBydWxlID0gcm9vdC5maXJzdDtcbiAgICAgKiBydWxlLnNlbGVjdG9yIC8vPT4gJ2EsIGInXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgUnVsZSNcbiAgICAgKiBAbWVtYmVyIHtvYmplY3R9IHJhd3MgLSBJbmZvcm1hdGlvbiB0byBnZW5lcmF0ZSBieXRlLXRvLWJ5dGUgZXF1YWxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICBub2RlIHN0cmluZyBhcyBpdCB3YXMgaW4gdGhlIG9yaWdpbiBpbnB1dC5cbiAgICAgKlxuICAgICAqIEV2ZXJ5IHBhcnNlciBzYXZlcyBpdHMgb3duIHByb3BlcnRpZXMsXG4gICAgICogYnV0IHRoZSBkZWZhdWx0IENTUyBwYXJzZXIgdXNlczpcbiAgICAgKlxuICAgICAqICogYGJlZm9yZWA6IHRoZSBzcGFjZSBzeW1ib2xzIGJlZm9yZSB0aGUgbm9kZS4gSXQgYWxzbyBzdG9yZXMgYCpgXG4gICAgICogICBhbmQgYF9gIHN5bWJvbHMgYmVmb3JlIHRoZSBkZWNsYXJhdGlvbiAoSUUgaGFjaykuXG4gICAgICogKiBgYWZ0ZXJgOiB0aGUgc3BhY2Ugc3ltYm9scyBhZnRlciB0aGUgbGFzdCBjaGlsZCBvZiB0aGUgbm9kZVxuICAgICAqICAgdG8gdGhlIGVuZCBvZiB0aGUgbm9kZS5cbiAgICAgKiAqIGBiZXR3ZWVuYDogdGhlIHN5bWJvbHMgYmV0d2VlbiB0aGUgcHJvcGVydHkgYW5kIHZhbHVlXG4gICAgICogICBmb3IgZGVjbGFyYXRpb25zLCBzZWxlY3RvciBhbmQgYHtgIGZvciBydWxlcywgb3IgbGFzdCBwYXJhbWV0ZXJcbiAgICAgKiAgIGFuZCBge2AgZm9yIGF0LXJ1bGVzLlxuICAgICAqICogYHNlbWljb2xvbmA6IGNvbnRhaW5zIHRydWUgaWYgdGhlIGxhc3QgY2hpbGQgaGFzXG4gICAgICogICBhbiAob3B0aW9uYWwpIHNlbWljb2xvbi5cbiAgICAgKlxuICAgICAqIFBvc3RDU1MgY2xlYW5zIHNlbGVjdG9ycyBmcm9tIGNvbW1lbnRzIGFuZCBleHRyYSBzcGFjZXMsXG4gICAgICogYnV0IGl0IHN0b3JlcyBvcmlnaW4gY29udGVudCBpbiByYXdzIHByb3BlcnRpZXMuXG4gICAgICogQXMgc3VjaCwgaWYgeW91IGRvbuKAmXQgY2hhbmdlIGEgZGVjbGFyYXRpb27igJlzIHZhbHVlLFxuICAgICAqIFBvc3RDU1Mgd2lsbCB1c2UgdGhlIHJhdyB2YWx1ZSB3aXRoIGNvbW1lbnRzLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCByb290ID0gcG9zdGNzcy5wYXJzZSgnYSB7XFxuICBjb2xvcjpibGFja1xcbn0nKVxuICAgICAqIHJvb3QuZmlyc3QuZmlyc3QucmF3cyAvLz0+IHsgYmVmb3JlOiAnJywgYmV0d2VlbjogJyAnLCBhZnRlcjogJ1xcbicgfVxuICAgICAqL1xuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFJ1bGU7XG4iLCJjb25zdCBkZWZhdWx0UmF3ID0ge1xuICAgIGNvbG9uOiAgICAgICAgICc6ICcsXG4gICAgaW5kZW50OiAgICAgICAgJyAgICAnLFxuICAgIGJlZm9yZURlY2w6ICAgICdcXG4nLFxuICAgIGJlZm9yZVJ1bGU6ICAgICdcXG4nLFxuICAgIGJlZm9yZU9wZW46ICAgICcgJyxcbiAgICBiZWZvcmVDbG9zZTogICAnXFxuJyxcbiAgICBiZWZvcmVDb21tZW50OiAnXFxuJyxcbiAgICBhZnRlcjogICAgICAgICAnXFxuJyxcbiAgICBlbXB0eUJvZHk6ICAgICAnJyxcbiAgICBjb21tZW50TGVmdDogICAnICcsXG4gICAgY29tbWVudFJpZ2h0OiAgJyAnXG59O1xuXG5mdW5jdGlvbiBjYXBpdGFsaXplKHN0cikge1xuICAgIHJldHVybiBzdHJbMF0udG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKTtcbn1cblxuY2xhc3MgU3RyaW5naWZpZXIge1xuXG4gICAgY29uc3RydWN0b3IoYnVpbGRlcikge1xuICAgICAgICB0aGlzLmJ1aWxkZXIgPSBidWlsZGVyO1xuICAgIH1cblxuICAgIHN0cmluZ2lmeShub2RlLCBzZW1pY29sb24pIHtcbiAgICAgICAgdGhpc1tub2RlLnR5cGVdKG5vZGUsIHNlbWljb2xvbik7XG4gICAgfVxuXG4gICAgcm9vdChub2RlKSB7XG4gICAgICAgIHRoaXMuYm9keShub2RlKTtcbiAgICAgICAgaWYgKCBub2RlLnJhd3MuYWZ0ZXIgKSB0aGlzLmJ1aWxkZXIobm9kZS5yYXdzLmFmdGVyKTtcbiAgICB9XG5cbiAgICBjb21tZW50KG5vZGUpIHtcbiAgICAgICAgbGV0IGxlZnQgID0gdGhpcy5yYXcobm9kZSwgJ2xlZnQnLCAgJ2NvbW1lbnRMZWZ0Jyk7XG4gICAgICAgIGxldCByaWdodCA9IHRoaXMucmF3KG5vZGUsICdyaWdodCcsICdjb21tZW50UmlnaHQnKTtcbiAgICAgICAgdGhpcy5idWlsZGVyKCcvKicgKyBsZWZ0ICsgbm9kZS50ZXh0ICsgcmlnaHQgKyAnKi8nLCBub2RlKTtcbiAgICB9XG5cbiAgICBkZWNsKG5vZGUsIHNlbWljb2xvbikge1xuICAgICAgICBsZXQgYmV0d2VlbiA9IHRoaXMucmF3KG5vZGUsICdiZXR3ZWVuJywgJ2NvbG9uJyk7XG4gICAgICAgIGxldCBzdHJpbmcgID0gbm9kZS5wcm9wICsgYmV0d2VlbiArIHRoaXMucmF3VmFsdWUobm9kZSwgJ3ZhbHVlJyk7XG5cbiAgICAgICAgaWYgKCBub2RlLmltcG9ydGFudCApIHtcbiAgICAgICAgICAgIHN0cmluZyArPSBub2RlLnJhd3MuaW1wb3J0YW50IHx8ICcgIWltcG9ydGFudCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHNlbWljb2xvbiApIHN0cmluZyArPSAnOyc7XG4gICAgICAgIHRoaXMuYnVpbGRlcihzdHJpbmcsIG5vZGUpO1xuICAgIH1cblxuICAgIHJ1bGUobm9kZSkge1xuICAgICAgICB0aGlzLmJsb2NrKG5vZGUsIHRoaXMucmF3VmFsdWUobm9kZSwgJ3NlbGVjdG9yJykpO1xuICAgIH1cblxuICAgIGF0cnVsZShub2RlLCBzZW1pY29sb24pIHtcbiAgICAgICAgbGV0IG5hbWUgICA9ICdAJyArIG5vZGUubmFtZTtcbiAgICAgICAgbGV0IHBhcmFtcyA9IG5vZGUucGFyYW1zID8gdGhpcy5yYXdWYWx1ZShub2RlLCAncGFyYW1zJykgOiAnJztcblxuICAgICAgICBpZiAoIHR5cGVvZiBub2RlLnJhd3MuYWZ0ZXJOYW1lICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgIG5hbWUgKz0gbm9kZS5yYXdzLmFmdGVyTmFtZTtcbiAgICAgICAgfSBlbHNlIGlmICggcGFyYW1zICkge1xuICAgICAgICAgICAgbmFtZSArPSAnICc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIG5vZGUubm9kZXMgKSB7XG4gICAgICAgICAgICB0aGlzLmJsb2NrKG5vZGUsIG5hbWUgKyBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGVuZCA9IChub2RlLnJhd3MuYmV0d2VlbiB8fCAnJykgKyAoc2VtaWNvbG9uID8gJzsnIDogJycpO1xuICAgICAgICAgICAgdGhpcy5idWlsZGVyKG5hbWUgKyBwYXJhbXMgKyBlbmQsIG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYm9keShub2RlKSB7XG4gICAgICAgIGxldCBsYXN0ID0gbm9kZS5ub2Rlcy5sZW5ndGggLSAxO1xuICAgICAgICB3aGlsZSAoIGxhc3QgPiAwICkge1xuICAgICAgICAgICAgaWYgKCBub2RlLm5vZGVzW2xhc3RdLnR5cGUgIT09ICdjb21tZW50JyApIGJyZWFrO1xuICAgICAgICAgICAgbGFzdCAtPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNlbWljb2xvbiA9IHRoaXMucmF3KG5vZGUsICdzZW1pY29sb24nKTtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbm9kZS5ub2Rlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIGxldCBjaGlsZCAgPSBub2RlLm5vZGVzW2ldO1xuICAgICAgICAgICAgbGV0IGJlZm9yZSA9IHRoaXMucmF3KGNoaWxkLCAnYmVmb3JlJyk7XG4gICAgICAgICAgICBpZiAoIGJlZm9yZSApIHRoaXMuYnVpbGRlcihiZWZvcmUpO1xuICAgICAgICAgICAgdGhpcy5zdHJpbmdpZnkoY2hpbGQsIGxhc3QgIT09IGkgfHwgc2VtaWNvbG9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJsb2NrKG5vZGUsIHN0YXJ0KSB7XG4gICAgICAgIGxldCBiZXR3ZWVuID0gdGhpcy5yYXcobm9kZSwgJ2JldHdlZW4nLCAnYmVmb3JlT3BlbicpO1xuICAgICAgICB0aGlzLmJ1aWxkZXIoc3RhcnQgKyBiZXR3ZWVuICsgJ3snLCBub2RlLCAnc3RhcnQnKTtcblxuICAgICAgICBsZXQgYWZ0ZXI7XG4gICAgICAgIGlmICggbm9kZS5ub2RlcyAmJiBub2RlLm5vZGVzLmxlbmd0aCApIHtcbiAgICAgICAgICAgIHRoaXMuYm9keShub2RlKTtcbiAgICAgICAgICAgIGFmdGVyID0gdGhpcy5yYXcobm9kZSwgJ2FmdGVyJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhZnRlciA9IHRoaXMucmF3KG5vZGUsICdhZnRlcicsICdlbXB0eUJvZHknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggYWZ0ZXIgKSB0aGlzLmJ1aWxkZXIoYWZ0ZXIpO1xuICAgICAgICB0aGlzLmJ1aWxkZXIoJ30nLCBub2RlLCAnZW5kJyk7XG4gICAgfVxuXG4gICAgcmF3KG5vZGUsIG93biwgZGV0ZWN0KSB7XG4gICAgICAgIGxldCB2YWx1ZTtcbiAgICAgICAgaWYgKCAhZGV0ZWN0ICkgZGV0ZWN0ID0gb3duO1xuXG4gICAgICAgIC8vIEFscmVhZHkgaGFkXG4gICAgICAgIGlmICggb3duICkge1xuICAgICAgICAgICAgdmFsdWUgPSBub2RlLnJhd3Nbb3duXTtcbiAgICAgICAgICAgIGlmICggdHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJyApIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJlbnQgPSBub2RlLnBhcmVudDtcblxuICAgICAgICAvLyBIYWNrIGZvciBmaXJzdCBydWxlIGluIENTU1xuICAgICAgICBpZiAoIGRldGVjdCA9PT0gJ2JlZm9yZScgKSB7XG4gICAgICAgICAgICBpZiAoICFwYXJlbnQgfHwgcGFyZW50LnR5cGUgPT09ICdyb290JyAmJiBwYXJlbnQuZmlyc3QgPT09IG5vZGUgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmxvYXRpbmcgY2hpbGQgd2l0aG91dCBwYXJlbnRcbiAgICAgICAgaWYgKCAhcGFyZW50ICkgcmV0dXJuIGRlZmF1bHRSYXdbZGV0ZWN0XTtcblxuICAgICAgICAvLyBEZXRlY3Qgc3R5bGUgYnkgb3RoZXIgbm9kZXNcbiAgICAgICAgbGV0IHJvb3QgPSBub2RlLnJvb3QoKTtcbiAgICAgICAgaWYgKCAhcm9vdC5yYXdDYWNoZSApIHJvb3QucmF3Q2FjaGUgPSB7IH07XG4gICAgICAgIGlmICggdHlwZW9mIHJvb3QucmF3Q2FjaGVbZGV0ZWN0XSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICByZXR1cm4gcm9vdC5yYXdDYWNoZVtkZXRlY3RdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBkZXRlY3QgPT09ICdiZWZvcmUnIHx8IGRldGVjdCA9PT0gJ2FmdGVyJyApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJlZm9yZUFmdGVyKG5vZGUsIGRldGVjdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbWV0aG9kID0gJ3JhdycgKyBjYXBpdGFsaXplKGRldGVjdCk7XG4gICAgICAgICAgICBpZiAoIHRoaXNbbWV0aG9kXSApIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXNbbWV0aG9kXShyb290LCBub2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcm9vdC53YWxrKCBpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpLnJhd3Nbb3duXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnICkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnICkgdmFsdWUgPSBkZWZhdWx0UmF3W2RldGVjdF07XG5cbiAgICAgICAgcm9vdC5yYXdDYWNoZVtkZXRlY3RdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICByYXdTZW1pY29sb24ocm9vdCkge1xuICAgICAgICBsZXQgdmFsdWU7XG4gICAgICAgIHJvb3Qud2FsayggaSA9PiB7XG4gICAgICAgICAgICBpZiAoIGkubm9kZXMgJiYgaS5ub2Rlcy5sZW5ndGggJiYgaS5sYXN0LnR5cGUgPT09ICdkZWNsJyApIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGkucmF3cy5zZW1pY29sb247XG4gICAgICAgICAgICAgICAgaWYgKCB0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnICkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIHJhd0VtcHR5Qm9keShyb290KSB7XG4gICAgICAgIGxldCB2YWx1ZTtcbiAgICAgICAgcm9vdC53YWxrKCBpID0+IHtcbiAgICAgICAgICAgIGlmICggaS5ub2RlcyAmJiBpLm5vZGVzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGkucmF3cy5hZnRlcjtcbiAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgcmF3SW5kZW50KHJvb3QpIHtcbiAgICAgICAgaWYgKCByb290LnJhd3MuaW5kZW50ICkgcmV0dXJuIHJvb3QucmF3cy5pbmRlbnQ7XG4gICAgICAgIGxldCB2YWx1ZTtcbiAgICAgICAgcm9vdC53YWxrKCBpID0+IHtcbiAgICAgICAgICAgIGxldCBwID0gaS5wYXJlbnQ7XG4gICAgICAgICAgICBpZiAoIHAgJiYgcCAhPT0gcm9vdCAmJiBwLnBhcmVudCAmJiBwLnBhcmVudCA9PT0gcm9vdCApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiBpLnJhd3MuYmVmb3JlICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnRzID0gaS5yYXdzLmJlZm9yZS5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW15cXHNdL2csICcnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICByYXdCZWZvcmVDb21tZW50KHJvb3QsIG5vZGUpIHtcbiAgICAgICAgbGV0IHZhbHVlO1xuICAgICAgICByb290LndhbGtDb21tZW50cyggaSA9PiB7XG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBpLnJhd3MuYmVmb3JlICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGkucmF3cy5iZWZvcmU7XG4gICAgICAgICAgICAgICAgaWYgKCB2YWx1ZS5pbmRleE9mKCdcXG4nKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW15cXG5dKyQvLCAnJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICggdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5yYXcobm9kZSwgbnVsbCwgJ2JlZm9yZURlY2wnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgcmF3QmVmb3JlRGVjbChyb290LCBub2RlKSB7XG4gICAgICAgIGxldCB2YWx1ZTtcbiAgICAgICAgcm9vdC53YWxrRGVjbHMoIGkgPT4ge1xuICAgICAgICAgICAgaWYgKCB0eXBlb2YgaS5yYXdzLmJlZm9yZSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBpLnJhd3MuYmVmb3JlO1xuICAgICAgICAgICAgICAgIGlmICggdmFsdWUuaW5kZXhPZignXFxuJykgIT09IC0xICkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1teXFxuXSskLywgJycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMucmF3KG5vZGUsIG51bGwsICdiZWZvcmVSdWxlJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIHJhd0JlZm9yZVJ1bGUocm9vdCkge1xuICAgICAgICBsZXQgdmFsdWU7XG4gICAgICAgIHJvb3Qud2FsayggaSA9PiB7XG4gICAgICAgICAgICBpZiAoIGkubm9kZXMgJiYgKGkucGFyZW50ICE9PSByb290IHx8IHJvb3QuZmlyc3QgIT09IGkpICkge1xuICAgICAgICAgICAgICAgIGlmICggdHlwZW9mIGkucmF3cy5iZWZvcmUgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGkucmF3cy5iZWZvcmU7XG4gICAgICAgICAgICAgICAgICAgIGlmICggdmFsdWUuaW5kZXhPZignXFxuJykgIT09IC0xICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bXlxcbl0rJC8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIHJhd0JlZm9yZUNsb3NlKHJvb3QpIHtcbiAgICAgICAgbGV0IHZhbHVlO1xuICAgICAgICByb290LndhbGsoIGkgPT4ge1xuICAgICAgICAgICAgaWYgKCBpLm5vZGVzICYmIGkubm9kZXMubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiBpLnJhd3MuYWZ0ZXIgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGkucmF3cy5hZnRlcjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB2YWx1ZS5pbmRleE9mKCdcXG4nKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1teXFxuXSskLywgJycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgcmF3QmVmb3JlT3Blbihyb290KSB7XG4gICAgICAgIGxldCB2YWx1ZTtcbiAgICAgICAgcm9vdC53YWxrKCBpID0+IHtcbiAgICAgICAgICAgIGlmICggaS50eXBlICE9PSAnZGVjbCcgKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBpLnJhd3MuYmV0d2VlbjtcbiAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgcmF3Q29sb24ocm9vdCkge1xuICAgICAgICBsZXQgdmFsdWU7XG4gICAgICAgIHJvb3Qud2Fsa0RlY2xzKCBpID0+IHtcbiAgICAgICAgICAgIGlmICggdHlwZW9mIGkucmF3cy5iZXR3ZWVuICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGkucmF3cy5iZXR3ZWVuLnJlcGxhY2UoL1teXFxzOl0vZywgJycpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBiZWZvcmVBZnRlcihub2RlLCBkZXRlY3QpIHtcbiAgICAgICAgbGV0IHZhbHVlO1xuICAgICAgICBpZiAoIG5vZGUudHlwZSA9PT0gJ2RlY2wnICkge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnJhdyhub2RlLCBudWxsLCAnYmVmb3JlRGVjbCcpO1xuICAgICAgICB9IGVsc2UgaWYgKCBub2RlLnR5cGUgPT09ICdjb21tZW50JyApIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5yYXcobm9kZSwgbnVsbCwgJ2JlZm9yZUNvbW1lbnQnKTtcbiAgICAgICAgfSBlbHNlIGlmICggZGV0ZWN0ID09PSAnYmVmb3JlJyApIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5yYXcobm9kZSwgbnVsbCwgJ2JlZm9yZVJ1bGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5yYXcobm9kZSwgbnVsbCwgJ2JlZm9yZUNsb3NlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYnVmICAgPSBub2RlLnBhcmVudDtcbiAgICAgICAgbGV0IGRlcHRoID0gMDtcbiAgICAgICAgd2hpbGUgKCBidWYgJiYgYnVmLnR5cGUgIT09ICdyb290JyApIHtcbiAgICAgICAgICAgIGRlcHRoICs9IDE7XG4gICAgICAgICAgICBidWYgPSBidWYucGFyZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCB2YWx1ZS5pbmRleE9mKCdcXG4nKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICBsZXQgaW5kZW50ID0gdGhpcy5yYXcobm9kZSwgbnVsbCwgJ2luZGVudCcpO1xuICAgICAgICAgICAgaWYgKCBpbmRlbnQubGVuZ3RoICkge1xuICAgICAgICAgICAgICAgIGZvciAoIGxldCBzdGVwID0gMDsgc3RlcCA8IGRlcHRoOyBzdGVwKysgKSB2YWx1ZSArPSBpbmRlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgcmF3VmFsdWUobm9kZSwgcHJvcCkge1xuICAgICAgICBsZXQgdmFsdWUgPSBub2RlW3Byb3BdO1xuICAgICAgICBsZXQgcmF3ICAgPSBub2RlLnJhd3NbcHJvcF07XG4gICAgICAgIGlmICggcmF3ICYmIHJhdy52YWx1ZSA9PT0gdmFsdWUgKSB7XG4gICAgICAgICAgICByZXR1cm4gcmF3LnJhdztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBTdHJpbmdpZmllcjtcbiIsImltcG9ydCBTdHJpbmdpZmllciBmcm9tICcuL3N0cmluZ2lmaWVyJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3RyaW5naWZ5KG5vZGUsIGJ1aWxkZXIpIHtcbiAgICBsZXQgc3RyID0gbmV3IFN0cmluZ2lmaWVyKGJ1aWxkZXIpO1xuICAgIHN0ci5zdHJpbmdpZnkobm9kZSk7XG59XG4iLCJpbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuXG5pbXBvcnQgdG9rZW5pemUgZnJvbSAnLi90b2tlbml6ZSc7XG5pbXBvcnQgSW5wdXQgICAgZnJvbSAnLi9pbnB1dCc7XG5cbmxldCBjb2xvcnMgPSBuZXcgY2hhbGsuY29uc3RydWN0b3IoeyBlbmFibGVkOiB0cnVlIH0pO1xuXG5jb25zdCBISUdITElHSFRfVEhFTUUgPSB7XG4gICAgJ2JyYWNrZXRzJzogY29sb3JzLmN5YW4sXG4gICAgJ2F0LXdvcmQnOiAgY29sb3JzLmN5YW4sXG4gICAgJ2NhbGwnOiAgICAgY29sb3JzLmN5YW4sXG4gICAgJ2NvbW1lbnQnOiAgY29sb3JzLmdyYXksXG4gICAgJ3N0cmluZyc6ICAgY29sb3JzLmdyZWVuLFxuICAgICdjbGFzcyc6ICAgIGNvbG9ycy55ZWxsb3csXG4gICAgJ2hhc2gnOiAgICAgY29sb3JzLm1hZ2VudGEsXG4gICAgJygnOiAgICAgICAgY29sb3JzLmN5YW4sXG4gICAgJyknOiAgICAgICAgY29sb3JzLmN5YW4sXG4gICAgJ3snOiAgICAgICAgY29sb3JzLnllbGxvdyxcbiAgICAnfSc6ICAgICAgICBjb2xvcnMueWVsbG93LFxuICAgICdbJzogICAgICAgIGNvbG9ycy55ZWxsb3csXG4gICAgJ10nOiAgICAgICAgY29sb3JzLnllbGxvdyxcbiAgICAnOic6ICAgICAgICBjb2xvcnMueWVsbG93LFxuICAgICc7JzogICAgICAgIGNvbG9ycy55ZWxsb3dcbn07XG5cbmZ1bmN0aW9uIGdldFRva2VuVHlwZShbdHlwZSwgdmFsdWVdLCBpbmRleCwgdG9rZW5zKSB7XG4gICAgaWYgKHR5cGUgPT09ICd3b3JkJykge1xuICAgICAgICBpZiAodmFsdWVbMF0gPT09ICcuJykge1xuICAgICAgICAgICAgcmV0dXJuICdjbGFzcyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlWzBdID09PSAnIycpIHtcbiAgICAgICAgICAgIHJldHVybiAnaGFzaCc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbmV4dFRva2VuID0gdG9rZW5zW2luZGV4ICsgMV07XG4gICAgaWYgKG5leHRUb2tlbiAmJiAobmV4dFRva2VuWzBdID09PSAnYnJhY2tldHMnIHx8IG5leHRUb2tlblswXSA9PT0gJygnKSkge1xuICAgICAgICByZXR1cm4gJ2NhbGwnO1xuICAgIH1cblxuICAgIHJldHVybiB0eXBlO1xufVxuXG5mdW5jdGlvbiB0ZXJtaW5hbEhpZ2hsaWdodChjc3MpIHtcbiAgICBsZXQgdG9rZW5zID0gdG9rZW5pemUobmV3IElucHV0KGNzcyksIHsgaWdub3JlRXJyb3JzOiB0cnVlIH0pO1xuICAgIHJldHVybiB0b2tlbnMubWFwKCh0b2tlbiwgaW5kZXgpID0+IHtcbiAgICAgICAgbGV0IGNvbG9yID0gSElHSExJR0hUX1RIRU1FW2dldFRva2VuVHlwZSh0b2tlbiwgaW5kZXgsIHRva2VucyldO1xuICAgICAgICBpZiAoIGNvbG9yICkge1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuWzFdLnNwbGl0KC9cXHI/XFxuLylcbiAgICAgICAgICAgICAgLm1hcCggaSA9PiBjb2xvcihpKSApXG4gICAgICAgICAgICAgIC5qb2luKCdcXG4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0b2tlblsxXTtcbiAgICAgICAgfVxuICAgIH0pLmpvaW4oJycpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB0ZXJtaW5hbEhpZ2hsaWdodDtcbiIsImNvbnN0IFNJTkdMRV9RVU9URSAgICAgID0gJ1xcJycuY2hhckNvZGVBdCgwKTtcbmNvbnN0IERPVUJMRV9RVU9URSAgICAgID0gICdcIicuY2hhckNvZGVBdCgwKTtcbmNvbnN0IEJBQ0tTTEFTSCAgICAgICAgID0gJ1xcXFwnLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBTTEFTSCAgICAgICAgICAgICA9ICAnLycuY2hhckNvZGVBdCgwKTtcbmNvbnN0IE5FV0xJTkUgICAgICAgICAgID0gJ1xcbicuY2hhckNvZGVBdCgwKTtcbmNvbnN0IFNQQUNFICAgICAgICAgICAgID0gICcgJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgRkVFRCAgICAgICAgICAgICAgPSAnXFxmJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgVEFCICAgICAgICAgICAgICAgPSAnXFx0Jy5jaGFyQ29kZUF0KDApO1xuY29uc3QgQ1IgICAgICAgICAgICAgICAgPSAnXFxyJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgT1BFTl9TUVVBUkUgICAgICAgPSAgJ1snLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBDTE9TRV9TUVVBUkUgICAgICA9ICAnXScuY2hhckNvZGVBdCgwKTtcbmNvbnN0IE9QRU5fUEFSRU5USEVTRVMgID0gICcoJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgQ0xPU0VfUEFSRU5USEVTRVMgPSAgJyknLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBPUEVOX0NVUkxZICAgICAgICA9ICAneycuY2hhckNvZGVBdCgwKTtcbmNvbnN0IENMT1NFX0NVUkxZICAgICAgID0gICd9Jy5jaGFyQ29kZUF0KDApO1xuY29uc3QgU0VNSUNPTE9OICAgICAgICAgPSAgJzsnLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBBU1RFUklTSyAgICAgICAgICA9ICAnKicuY2hhckNvZGVBdCgwKTtcbmNvbnN0IENPTE9OICAgICAgICAgICAgID0gICc6Jy5jaGFyQ29kZUF0KDApO1xuY29uc3QgQVQgICAgICAgICAgICAgICAgPSAgJ0AnLmNoYXJDb2RlQXQoMCk7XG5cbmNvbnN0IFJFX0FUX0VORCAgICAgID0gL1sgXFxuXFx0XFxyXFxmXFx7XFwoXFwpJ1wiXFxcXDsvXFxbXFxdI10vZztcbmNvbnN0IFJFX1dPUkRfRU5EICAgID0gL1sgXFxuXFx0XFxyXFxmXFwoXFwpXFx7XFx9OjtAISdcIlxcXFxcXF1cXFsjXXxcXC8oPz1cXCopL2c7XG5jb25zdCBSRV9CQURfQlJBQ0tFVCA9IC8uW1xcXFxcXC9cXChcIidcXG5dLztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdG9rZW5pemUoaW5wdXQsIG9wdGlvbnMgPSB7IH0pIHtcbiAgICBsZXQgdG9rZW5zID0gW107XG4gICAgbGV0IGNzcyAgICA9IGlucHV0LmNzcy52YWx1ZU9mKCk7XG5cbiAgICBsZXQgaWdub3JlID0gb3B0aW9ucy5pZ25vcmVFcnJvcnM7XG5cbiAgICBsZXQgY29kZSwgbmV4dCwgcXVvdGUsIGxpbmVzLCBsYXN0LCBjb250ZW50LCBlc2NhcGUsXG4gICAgICAgIG5leHRMaW5lLCBuZXh0T2Zmc2V0LCBlc2NhcGVkLCBlc2NhcGVQb3MsIHByZXYsIG47XG5cbiAgICBsZXQgbGVuZ3RoID0gY3NzLmxlbmd0aDtcbiAgICBsZXQgb2Zmc2V0ID0gLTE7XG4gICAgbGV0IGxpbmUgICA9ICAxO1xuICAgIGxldCBwb3MgICAgPSAgMDtcblxuICAgIGZ1bmN0aW9uIHVuY2xvc2VkKHdoYXQpIHtcbiAgICAgICAgdGhyb3cgaW5wdXQuZXJyb3IoJ1VuY2xvc2VkICcgKyB3aGF0LCBsaW5lLCBwb3MgLSBvZmZzZXQpO1xuICAgIH1cblxuICAgIHdoaWxlICggcG9zIDwgbGVuZ3RoICkge1xuICAgICAgICBjb2RlID0gY3NzLmNoYXJDb2RlQXQocG9zKTtcblxuICAgICAgICBpZiAoIGNvZGUgPT09IE5FV0xJTkUgfHwgY29kZSA9PT0gRkVFRCB8fFxuICAgICAgICAgICAgIGNvZGUgPT09IENSICYmIGNzcy5jaGFyQ29kZUF0KHBvcyArIDEpICE9PSBORVdMSU5FICkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gcG9zO1xuICAgICAgICAgICAgbGluZSAgKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoIGNvZGUgKSB7XG4gICAgICAgIGNhc2UgTkVXTElORTpcbiAgICAgICAgY2FzZSBTUEFDRTpcbiAgICAgICAgY2FzZSBUQUI6XG4gICAgICAgIGNhc2UgQ1I6XG4gICAgICAgIGNhc2UgRkVFRDpcbiAgICAgICAgICAgIG5leHQgPSBwb3M7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgbmV4dCArPSAxO1xuICAgICAgICAgICAgICAgIGNvZGUgPSBjc3MuY2hhckNvZGVBdChuZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAoIGNvZGUgPT09IE5FV0xJTkUgKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUgICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAoIGNvZGUgPT09IFNQQUNFICAgfHxcbiAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSBORVdMSU5FIHx8XG4gICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gVEFCICAgICB8fFxuICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09IENSICAgICAgfHxcbiAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSBGRUVEICk7XG5cbiAgICAgICAgICAgIHRva2Vucy5wdXNoKFsnc3BhY2UnLCBjc3Muc2xpY2UocG9zLCBuZXh0KV0pO1xuICAgICAgICAgICAgcG9zID0gbmV4dCAtIDE7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIE9QRU5fU1FVQVJFOlxuICAgICAgICAgICAgdG9rZW5zLnB1c2goWydbJywgJ1snLCBsaW5lLCBwb3MgLSBvZmZzZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgQ0xPU0VfU1FVQVJFOlxuICAgICAgICAgICAgdG9rZW5zLnB1c2goWyddJywgJ10nLCBsaW5lLCBwb3MgLSBvZmZzZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgT1BFTl9DVVJMWTpcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKFsneycsICd7JywgbGluZSwgcG9zIC0gb2Zmc2V0XSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIENMT1NFX0NVUkxZOlxuICAgICAgICAgICAgdG9rZW5zLnB1c2goWyd9JywgJ30nLCBsaW5lLCBwb3MgLSBvZmZzZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgQ09MT046XG4gICAgICAgICAgICB0b2tlbnMucHVzaChbJzonLCAnOicsIGxpbmUsIHBvcyAtIG9mZnNldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBTRU1JQ09MT046XG4gICAgICAgICAgICB0b2tlbnMucHVzaChbJzsnLCAnOycsIGxpbmUsIHBvcyAtIG9mZnNldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBPUEVOX1BBUkVOVEhFU0VTOlxuICAgICAgICAgICAgcHJldiA9IHRva2Vucy5sZW5ndGggPyB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdWzFdIDogJyc7XG4gICAgICAgICAgICBuICAgID0gY3NzLmNoYXJDb2RlQXQocG9zICsgMSk7XG4gICAgICAgICAgICBpZiAoIHByZXYgPT09ICd1cmwnICYmIG4gIT09IFNJTkdMRV9RVU9URSAmJiBuICE9PSBET1VCTEVfUVVPVEUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbiAhPT0gU1BBQ0UgJiYgbiAhPT0gTkVXTElORSAmJiBuICE9PSBUQUIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbiAhPT0gRkVFRCAmJiBuICE9PSBDUiApIHtcbiAgICAgICAgICAgICAgICBuZXh0ID0gcG9zO1xuICAgICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAgICAgZXNjYXBlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBuZXh0ICAgID0gY3NzLmluZGV4T2YoJyknLCBuZXh0ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICggbmV4dCA9PT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGlnbm9yZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0ID0gcG9zO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmNsb3NlZCgnYnJhY2tldCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVzY2FwZVBvcyA9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICggY3NzLmNoYXJDb2RlQXQoZXNjYXBlUG9zIC0gMSkgPT09IEJBQ0tTTEFTSCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVzY2FwZVBvcyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXNjYXBlZCA9ICFlc2NhcGVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSB3aGlsZSAoIGVzY2FwZWQgKTtcblxuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKFsnYnJhY2tldHMnLCBjc3Muc2xpY2UocG9zLCBuZXh0ICsgMSksXG4gICAgICAgICAgICAgICAgICAgIGxpbmUsIHBvcyAgLSBvZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGxpbmUsIG5leHQgLSBvZmZzZXRcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICBwb3MgPSBuZXh0O1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5leHQgICAgPSBjc3MuaW5kZXhPZignKScsIHBvcyArIDEpO1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjc3Muc2xpY2UocG9zLCBuZXh0ICsgMSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIG5leHQgPT09IC0xIHx8IFJFX0JBRF9CUkFDS0VULnRlc3QoY29udGVudCkgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKFsnKCcsICcoJywgbGluZSwgcG9zIC0gb2Zmc2V0XSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goWydicmFja2V0cycsIGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLCBwb3MgIC0gb2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZSwgbmV4dCAtIG9mZnNldFxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgcG9zID0gbmV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgQ0xPU0VfUEFSRU5USEVTRVM6XG4gICAgICAgICAgICB0b2tlbnMucHVzaChbJyknLCAnKScsIGxpbmUsIHBvcyAtIG9mZnNldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBTSU5HTEVfUVVPVEU6XG4gICAgICAgIGNhc2UgRE9VQkxFX1FVT1RFOlxuICAgICAgICAgICAgcXVvdGUgPSBjb2RlID09PSBTSU5HTEVfUVVPVEUgPyAnXFwnJyA6ICdcIic7XG4gICAgICAgICAgICBuZXh0ICA9IHBvcztcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBlc2NhcGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbmV4dCAgICA9IGNzcy5pbmRleE9mKHF1b3RlLCBuZXh0ICsgMSk7XG4gICAgICAgICAgICAgICAgaWYgKCBuZXh0ID09PSAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpZ25vcmUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0ID0gcG9zICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdW5jbG9zZWQoJ3N0cmluZycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVzY2FwZVBvcyA9IG5leHQ7XG4gICAgICAgICAgICAgICAgd2hpbGUgKCBjc3MuY2hhckNvZGVBdChlc2NhcGVQb3MgLSAxKSA9PT0gQkFDS1NMQVNIICkge1xuICAgICAgICAgICAgICAgICAgICBlc2NhcGVQb3MgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgZXNjYXBlZCA9ICFlc2NhcGVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gd2hpbGUgKCBlc2NhcGVkICk7XG5cbiAgICAgICAgICAgIGNvbnRlbnQgPSBjc3Muc2xpY2UocG9zLCBuZXh0ICsgMSk7XG4gICAgICAgICAgICBsaW5lcyAgID0gY29udGVudC5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICBsYXN0ICAgID0gbGluZXMubGVuZ3RoIC0gMTtcblxuICAgICAgICAgICAgaWYgKCBsYXN0ID4gMCApIHtcbiAgICAgICAgICAgICAgICBuZXh0TGluZSAgID0gbGluZSArIGxhc3Q7XG4gICAgICAgICAgICAgICAgbmV4dE9mZnNldCA9IG5leHQgLSBsaW5lc1tsYXN0XS5sZW5ndGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5leHRMaW5lICAgPSBsaW5lO1xuICAgICAgICAgICAgICAgIG5leHRPZmZzZXQgPSBvZmZzZXQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRva2Vucy5wdXNoKFsnc3RyaW5nJywgY3NzLnNsaWNlKHBvcywgbmV4dCArIDEpLFxuICAgICAgICAgICAgICAgIGxpbmUsIHBvcyAgLSBvZmZzZXQsXG4gICAgICAgICAgICAgICAgbmV4dExpbmUsIG5leHQgLSBuZXh0T2Zmc2V0XG4gICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgb2Zmc2V0ID0gbmV4dE9mZnNldDtcbiAgICAgICAgICAgIGxpbmUgICA9IG5leHRMaW5lO1xuICAgICAgICAgICAgcG9zICAgID0gbmV4dDtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgQVQ6XG4gICAgICAgICAgICBSRV9BVF9FTkQubGFzdEluZGV4ID0gcG9zICsgMTtcbiAgICAgICAgICAgIFJFX0FUX0VORC50ZXN0KGNzcyk7XG4gICAgICAgICAgICBpZiAoIFJFX0FUX0VORC5sYXN0SW5kZXggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgbmV4dCA9IGNzcy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXh0ID0gUkVfQVRfRU5ELmxhc3RJbmRleCAtIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b2tlbnMucHVzaChbJ2F0LXdvcmQnLCBjc3Muc2xpY2UocG9zLCBuZXh0ICsgMSksXG4gICAgICAgICAgICAgICAgbGluZSwgcG9zICAtIG9mZnNldCxcbiAgICAgICAgICAgICAgICBsaW5lLCBuZXh0IC0gb2Zmc2V0XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIHBvcyA9IG5leHQ7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIEJBQ0tTTEFTSDpcbiAgICAgICAgICAgIG5leHQgICA9IHBvcztcbiAgICAgICAgICAgIGVzY2FwZSA9IHRydWU7XG4gICAgICAgICAgICB3aGlsZSAoIGNzcy5jaGFyQ29kZUF0KG5leHQgKyAxKSA9PT0gQkFDS1NMQVNIICkge1xuICAgICAgICAgICAgICAgIG5leHQgICs9IDE7XG4gICAgICAgICAgICAgICAgZXNjYXBlID0gIWVzY2FwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvZGUgPSBjc3MuY2hhckNvZGVBdChuZXh0ICsgMSk7XG4gICAgICAgICAgICBpZiAoIGVzY2FwZSAmJiAoY29kZSAhPT0gU0xBU0ggICAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgIT09IFNQQUNFICAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlICE9PSBORVdMSU5FICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSAhPT0gVEFCICAgICAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgIT09IENSICAgICAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlICE9PSBGRUVEICkgKSB7XG4gICAgICAgICAgICAgICAgbmV4dCArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9rZW5zLnB1c2goWyd3b3JkJywgY3NzLnNsaWNlKHBvcywgbmV4dCArIDEpLFxuICAgICAgICAgICAgICAgIGxpbmUsIHBvcyAgLSBvZmZzZXQsXG4gICAgICAgICAgICAgICAgbGluZSwgbmV4dCAtIG9mZnNldFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBwb3MgPSBuZXh0O1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGlmICggY29kZSA9PT0gU0xBU0ggJiYgY3NzLmNoYXJDb2RlQXQocG9zICsgMSkgPT09IEFTVEVSSVNLICkge1xuICAgICAgICAgICAgICAgIG5leHQgPSBjc3MuaW5kZXhPZignKi8nLCBwb3MgKyAyKSArIDE7XG4gICAgICAgICAgICAgICAgaWYgKCBuZXh0ID09PSAwICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGlnbm9yZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSBjc3MubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdW5jbG9zZWQoJ2NvbW1lbnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjc3Muc2xpY2UocG9zLCBuZXh0ICsgMSk7XG4gICAgICAgICAgICAgICAgbGluZXMgICA9IGNvbnRlbnQuc3BsaXQoJ1xcbicpO1xuICAgICAgICAgICAgICAgIGxhc3QgICAgPSBsaW5lcy5sZW5ndGggLSAxO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBsYXN0ID4gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dExpbmUgICA9IGxpbmUgKyBsYXN0O1xuICAgICAgICAgICAgICAgICAgICBuZXh0T2Zmc2V0ID0gbmV4dCAtIGxpbmVzW2xhc3RdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuZXh0TGluZSAgID0gbGluZTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dE9mZnNldCA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaChbJ2NvbW1lbnQnLCBjb250ZW50LFxuICAgICAgICAgICAgICAgICAgICBsaW5lLCAgICAgcG9zICAtIG9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgbmV4dExpbmUsIG5leHQgLSBuZXh0T2Zmc2V0XG4gICAgICAgICAgICAgICAgXSk7XG5cbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBuZXh0T2Zmc2V0O1xuICAgICAgICAgICAgICAgIGxpbmUgICA9IG5leHRMaW5lO1xuICAgICAgICAgICAgICAgIHBvcyAgICA9IG5leHQ7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgUkVfV09SRF9FTkQubGFzdEluZGV4ID0gcG9zICsgMTtcbiAgICAgICAgICAgICAgICBSRV9XT1JEX0VORC50ZXN0KGNzcyk7XG4gICAgICAgICAgICAgICAgaWYgKCBSRV9XT1JEX0VORC5sYXN0SW5kZXggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBjc3MubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gUkVfV09SRF9FTkQubGFzdEluZGV4IC0gMjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaChbJ3dvcmQnLCBjc3Muc2xpY2UocG9zLCBuZXh0ICsgMSksXG4gICAgICAgICAgICAgICAgICAgIGxpbmUsIHBvcyAgLSBvZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGxpbmUsIG5leHQgLSBvZmZzZXRcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICBwb3MgPSBuZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHBvcysrO1xuICAgIH1cblxuICAgIHJldHVybiB0b2tlbnM7XG59XG4iLCIvKipcbiAqIENvbnRhaW5zIGhlbHBlcnMgZm9yIHdvcmtpbmcgd2l0aCB2ZW5kb3IgcHJlZml4ZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IHZlbmRvciA9IHBvc3Rjc3MudmVuZG9yO1xuICpcbiAqIEBuYW1lc3BhY2UgdmVuZG9yXG4gKi9cbmxldCB2ZW5kb3IgPSB7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB2ZW5kb3IgcHJlZml4IGV4dHJhY3RlZCBmcm9tIGFuIGlucHV0IHN0cmluZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wIC0gc3RyaW5nIHdpdGggb3Igd2l0aG91dCB2ZW5kb3IgcHJlZml4XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IHZlbmRvciBwcmVmaXggb3IgZW1wdHkgc3RyaW5nXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHBvc3Rjc3MudmVuZG9yLnByZWZpeCgnLW1vei10YWItc2l6ZScpIC8vPT4gJy1tb3otJ1xuICAgICAqIHBvc3Rjc3MudmVuZG9yLnByZWZpeCgndGFiLXNpemUnKSAgICAgIC8vPT4gJydcbiAgICAgKi9cbiAgICBwcmVmaXgocHJvcCkge1xuICAgICAgICBsZXQgbWF0Y2ggPSBwcm9wLm1hdGNoKC9eKC1cXHcrLSkvKTtcbiAgICAgICAgaWYgKCBtYXRjaCApIHtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaFswXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnB1dCBzdHJpbmcgc3RyaXBwZWQgb2YgaXRzIHZlbmRvciBwcmVmaXguXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcCAtIHN0cmluZyB3aXRoIG9yIHdpdGhvdXQgdmVuZG9yIHByZWZpeFxuICAgICAqXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBzdHJpbmcgbmFtZSB3aXRob3V0IHZlbmRvciBwcmVmaXhlc1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBwb3N0Y3NzLnZlbmRvci51bnByZWZpeGVkKCctbW96LXRhYi1zaXplJykgLy89PiAndGFiLXNpemUnXG4gICAgICovXG4gICAgdW5wcmVmaXhlZChwcm9wKSB7XG4gICAgICAgIHJldHVybiBwcm9wLnJlcGxhY2UoL14tXFx3Ky0vLCAnJyk7XG4gICAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCB2ZW5kb3I7XG4iLCJsZXQgcHJpbnRlZCA9IHsgfTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gd2Fybk9uY2UobWVzc2FnZSkge1xuICAgIGlmICggcHJpbnRlZFttZXNzYWdlXSApIHJldHVybjtcbiAgICBwcmludGVkW21lc3NhZ2VdID0gdHJ1ZTtcblxuICAgIGlmICggdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUud2FybiApIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbn1cbiIsIi8qKlxuICogUmVwcmVzZW50cyBhIHBsdWdpbuKAmXMgd2FybmluZy4gSXQgY2FuIGJlIGNyZWF0ZWQgdXNpbmcge0BsaW5rIE5vZGUjd2Fybn0uXG4gKlxuICogQGV4YW1wbGVcbiAqIGlmICggZGVjbC5pbXBvcnRhbnQgKSB7XG4gKiAgICAgZGVjbC53YXJuKHJlc3VsdCwgJ0F2b2lkICFpbXBvcnRhbnQnLCB7IHdvcmQ6ICchaW1wb3J0YW50JyB9KTtcbiAqIH1cbiAqL1xuY2xhc3MgV2FybmluZyB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAgICAgICAgLSB3YXJuaW5nIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdHNdICAgICAgLSB3YXJuaW5nIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge05vZGV9ICAgb3B0cy5ub2RlICAgLSBDU1Mgbm9kZSB0aGF0IGNhdXNlZCB0aGUgd2FybmluZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRzLndvcmQgICAtIHdvcmQgaW4gQ1NTIHNvdXJjZSB0aGF0IGNhdXNlZCB0aGUgd2FybmluZ1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRzLmluZGV4ICAtIGluZGV4IGluIENTUyBub2RlIHN0cmluZyB0aGF0IGNhdXNlZFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSB3YXJuaW5nXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG9wdHMucGx1Z2luIC0gbmFtZSBvZiB0aGUgcGx1Z2luIHRoYXQgY3JlYXRlZFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgd2FybmluZy4ge0BsaW5rIFJlc3VsdCN3YXJufSBmaWxsc1xuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgcHJvcGVydHkgYXV0b21hdGljYWxseS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih0ZXh0LCBvcHRzID0geyB9KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyIHtzdHJpbmd9IC0gVHlwZSB0byBmaWx0ZXIgd2FybmluZ3MgZnJvbVxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAge0BsaW5rIFJlc3VsdCNtZXNzYWdlc30uIEFsd2F5cyBlcXVhbFxuICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgdG8gYFwid2FybmluZ1wiYC5cbiAgICAgICAgICpcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogY29uc3Qgbm9uV2FybmluZyA9IHJlc3VsdC5tZXNzYWdlcy5maWx0ZXIoaSA9PiBpLnR5cGUgIT09ICd3YXJuaW5nJylcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudHlwZSA9ICd3YXJuaW5nJztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZW1iZXIge3N0cmluZ30gLSBUaGUgd2FybmluZyBtZXNzYWdlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiB3YXJuaW5nLnRleHQgLy89PiAnVHJ5IHRvIGF2b2lkICFpbXBvcnRhbnQnXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xuXG4gICAgICAgIGlmICggb3B0cy5ub2RlICYmIG9wdHMubm9kZS5zb3VyY2UgKSB7XG4gICAgICAgICAgICBsZXQgcG9zICAgICA9IG9wdHMubm9kZS5wb3NpdGlvbkJ5KG9wdHMpO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyIHtudW1iZXJ9IC0gTGluZSBpbiB0aGUgaW5wdXQgZmlsZVxuICAgICAgICAgICAgICogICAgICAgICAgICAgICAgICAgIHdpdGggdGhpcyB3YXJuaW5n4oCZcyBzb3VyY2VcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICogd2FybmluZy5saW5lIC8vPT4gNVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmxpbmUgICA9IHBvcy5saW5lO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyIHtudW1iZXJ9IC0gQ29sdW1uIGluIHRoZSBpbnB1dCBmaWxlXG4gICAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgd2l0aCB0aGlzIHdhcm5pbmfigJlzIHNvdXJjZS5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICogd2FybmluZy5jb2x1bW4gLy89PiA2XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuY29sdW1uID0gcG9zLmNvbHVtbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoIGxldCBvcHQgaW4gb3B0cyApIHRoaXNbb3B0XSA9IG9wdHNbb3B0XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgd2FybmluZyBwb3NpdGlvbiBhbmQgbWVzc2FnZS5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogd2FybmluZy50b1N0cmluZygpIC8vPT4gJ3Bvc3Rjc3MtbGludDphLmNzczoxMDoxNDogQXZvaWQgIWltcG9ydGFudCdcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gd2FybmluZyBwb3NpdGlvbiBhbmQgbWVzc2FnZVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBpZiAoIHRoaXMubm9kZSApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5vZGUuZXJyb3IodGhpcy50ZXh0LCB7XG4gICAgICAgICAgICAgICAgcGx1Z2luOiB0aGlzLnBsdWdpbixcbiAgICAgICAgICAgICAgICBpbmRleDogIHRoaXMuaW5kZXgsXG4gICAgICAgICAgICAgICAgd29yZDogICB0aGlzLndvcmRcbiAgICAgICAgICAgIH0pLm1lc3NhZ2U7XG4gICAgICAgIH0gZWxzZSBpZiAoIHRoaXMucGx1Z2luICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGx1Z2luICsgJzogJyArIHRoaXMudGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRleHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgV2FybmluZyNcbiAgICAgKiBAbWVtYmVyIHtzdHJpbmd9IHBsdWdpbiAtIFRoZSBuYW1lIG9mIHRoZSBwbHVnaW4gdGhhdCBjcmVhdGVkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBpdCB3aWxsIGZpbGwgdGhpcyBwcm9wZXJ0eSBhdXRvbWF0aWNhbGx5LlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyB3YXJuaW5nLiBXaGVuIHlvdSBjYWxsIHtAbGluayBOb2RlI3dhcm59XG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHdhcm5pbmcucGx1Z2luIC8vPT4gJ3Bvc3Rjc3MtaW1wb3J0YW50J1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIFdhcm5pbmcjXG4gICAgICogQG1lbWJlciB7Tm9kZX0gbm9kZSAtIENvbnRhaW5zIHRoZSBDU1Mgbm9kZSB0aGF0IGNhdXNlZCB0aGUgd2FybmluZy5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogd2FybmluZy5ub2RlLnRvU3RyaW5nKCkgLy89PiAnY29sb3I6IHdoaXRlICFpbXBvcnRhbnQnXG4gICAgICovXG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2FybmluZztcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZmFsc2U7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQSBkYXRhIHN0cnVjdHVyZSB3aGljaCBpcyBhIGNvbWJpbmF0aW9uIG9mIGFuIGFycmF5IGFuZCBhIHNldC4gQWRkaW5nIGEgbmV3XG4gKiBtZW1iZXIgaXMgTygxKSwgdGVzdGluZyBmb3IgbWVtYmVyc2hpcCBpcyBPKDEpLCBhbmQgZmluZGluZyB0aGUgaW5kZXggb2YgYW5cbiAqIGVsZW1lbnQgaXMgTygxKS4gUmVtb3ZpbmcgZWxlbWVudHMgZnJvbSB0aGUgc2V0IGlzIG5vdCBzdXBwb3J0ZWQuIE9ubHlcbiAqIHN0cmluZ3MgYXJlIHN1cHBvcnRlZCBmb3IgbWVtYmVyc2hpcC5cbiAqL1xuZnVuY3Rpb24gQXJyYXlTZXQoKSB7XG4gIHRoaXMuX2FycmF5ID0gW107XG4gIHRoaXMuX3NldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG59XG5cbi8qKlxuICogU3RhdGljIG1ldGhvZCBmb3IgY3JlYXRpbmcgQXJyYXlTZXQgaW5zdGFuY2VzIGZyb20gYW4gZXhpc3RpbmcgYXJyYXkuXG4gKi9cbkFycmF5U2V0LmZyb21BcnJheSA9IGZ1bmN0aW9uIEFycmF5U2V0X2Zyb21BcnJheShhQXJyYXksIGFBbGxvd0R1cGxpY2F0ZXMpIHtcbiAgdmFyIHNldCA9IG5ldyBBcnJheVNldCgpO1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gYUFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgc2V0LmFkZChhQXJyYXlbaV0sIGFBbGxvd0R1cGxpY2F0ZXMpO1xuICB9XG4gIHJldHVybiBzZXQ7XG59O1xuXG4vKipcbiAqIFJldHVybiBob3cgbWFueSB1bmlxdWUgaXRlbXMgYXJlIGluIHRoaXMgQXJyYXlTZXQuIElmIGR1cGxpY2F0ZXMgaGF2ZSBiZWVuXG4gKiBhZGRlZCwgdGhhbiB0aG9zZSBkbyBub3QgY291bnQgdG93YXJkcyB0aGUgc2l6ZS5cbiAqXG4gKiBAcmV0dXJucyBOdW1iZXJcbiAqL1xuQXJyYXlTZXQucHJvdG90eXBlLnNpemUgPSBmdW5jdGlvbiBBcnJheVNldF9zaXplKCkge1xuICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5fc2V0KS5sZW5ndGg7XG59O1xuXG4vKipcbiAqIEFkZCB0aGUgZ2l2ZW4gc3RyaW5nIHRvIHRoaXMgc2V0LlxuICpcbiAqIEBwYXJhbSBTdHJpbmcgYVN0clxuICovXG5BcnJheVNldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gQXJyYXlTZXRfYWRkKGFTdHIsIGFBbGxvd0R1cGxpY2F0ZXMpIHtcbiAgdmFyIHNTdHIgPSB1dGlsLnRvU2V0U3RyaW5nKGFTdHIpO1xuICB2YXIgaXNEdXBsaWNhdGUgPSBoYXMuY2FsbCh0aGlzLl9zZXQsIHNTdHIpO1xuICB2YXIgaWR4ID0gdGhpcy5fYXJyYXkubGVuZ3RoO1xuICBpZiAoIWlzRHVwbGljYXRlIHx8IGFBbGxvd0R1cGxpY2F0ZXMpIHtcbiAgICB0aGlzLl9hcnJheS5wdXNoKGFTdHIpO1xuICB9XG4gIGlmICghaXNEdXBsaWNhdGUpIHtcbiAgICB0aGlzLl9zZXRbc1N0cl0gPSBpZHg7XG4gIH1cbn07XG5cbi8qKlxuICogSXMgdGhlIGdpdmVuIHN0cmluZyBhIG1lbWJlciBvZiB0aGlzIHNldD9cbiAqXG4gKiBAcGFyYW0gU3RyaW5nIGFTdHJcbiAqL1xuQXJyYXlTZXQucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIEFycmF5U2V0X2hhcyhhU3RyKSB7XG4gIHZhciBzU3RyID0gdXRpbC50b1NldFN0cmluZyhhU3RyKTtcbiAgcmV0dXJuIGhhcy5jYWxsKHRoaXMuX3NldCwgc1N0cik7XG59O1xuXG4vKipcbiAqIFdoYXQgaXMgdGhlIGluZGV4IG9mIHRoZSBnaXZlbiBzdHJpbmcgaW4gdGhlIGFycmF5P1xuICpcbiAqIEBwYXJhbSBTdHJpbmcgYVN0clxuICovXG5BcnJheVNldC5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIEFycmF5U2V0X2luZGV4T2YoYVN0cikge1xuICB2YXIgc1N0ciA9IHV0aWwudG9TZXRTdHJpbmcoYVN0cik7XG4gIGlmIChoYXMuY2FsbCh0aGlzLl9zZXQsIHNTdHIpKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NldFtzU3RyXTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ1wiJyArIGFTdHIgKyAnXCIgaXMgbm90IGluIHRoZSBzZXQuJyk7XG59O1xuXG4vKipcbiAqIFdoYXQgaXMgdGhlIGVsZW1lbnQgYXQgdGhlIGdpdmVuIGluZGV4P1xuICpcbiAqIEBwYXJhbSBOdW1iZXIgYUlkeFxuICovXG5BcnJheVNldC5wcm90b3R5cGUuYXQgPSBmdW5jdGlvbiBBcnJheVNldF9hdChhSWR4KSB7XG4gIGlmIChhSWR4ID49IDAgJiYgYUlkeCA8IHRoaXMuX2FycmF5Lmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheVthSWR4XTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ05vIGVsZW1lbnQgaW5kZXhlZCBieSAnICsgYUlkeCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGFycmF5IHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgc2V0ICh3aGljaCBoYXMgdGhlIHByb3BlciBpbmRpY2VzXG4gKiBpbmRpY2F0ZWQgYnkgaW5kZXhPZikuIE5vdGUgdGhhdCB0aGlzIGlzIGEgY29weSBvZiB0aGUgaW50ZXJuYWwgYXJyYXkgdXNlZFxuICogZm9yIHN0b3JpbmcgdGhlIG1lbWJlcnMgc28gdGhhdCBubyBvbmUgY2FuIG1lc3Mgd2l0aCBpbnRlcm5hbCBzdGF0ZS5cbiAqL1xuQXJyYXlTZXQucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiBBcnJheVNldF90b0FycmF5KCkge1xuICByZXR1cm4gdGhpcy5fYXJyYXkuc2xpY2UoKTtcbn07XG5cbmV4cG9ydHMuQXJyYXlTZXQgPSBBcnJheVNldDtcbiIsIi8qIC0qLSBNb2RlOiBqczsganMtaW5kZW50LWxldmVsOiAyOyAtKi0gKi9cbi8qXG4gKiBDb3B5cmlnaHQgMjAxMSBNb3ppbGxhIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9yc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgbGljZW5zZS4gU2VlIExJQ0VOU0Ugb3I6XG4gKiBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvQlNELTMtQ2xhdXNlXG4gKlxuICogQmFzZWQgb24gdGhlIEJhc2UgNjQgVkxRIGltcGxlbWVudGF0aW9uIGluIENsb3N1cmUgQ29tcGlsZXI6XG4gKiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nsb3N1cmUtY29tcGlsZXIvc291cmNlL2Jyb3dzZS90cnVuay9zcmMvY29tL2dvb2dsZS9kZWJ1Z2dpbmcvc291cmNlbWFwL0Jhc2U2NFZMUS5qYXZhXG4gKlxuICogQ29weXJpZ2h0IDIwMTEgVGhlIENsb3N1cmUgQ29tcGlsZXIgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICogbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZVxuICogbWV0OlxuICpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gKiAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlXG4gKiAgICBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZ1xuICogICAgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkXG4gKiAgICB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIEdvb2dsZSBJbmMuIG5vciB0aGUgbmFtZXMgb2YgaXRzXG4gKiAgICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWRcbiAqICAgIGZyb20gdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTXG4gKiBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1JcbiAqIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUXG4gKiBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCxcbiAqIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLFxuICogREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZXG4gKiBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJy4vYmFzZTY0Jyk7XG5cbi8vIEEgc2luZ2xlIGJhc2UgNjQgZGlnaXQgY2FuIGNvbnRhaW4gNiBiaXRzIG9mIGRhdGEuIEZvciB0aGUgYmFzZSA2NCB2YXJpYWJsZVxuLy8gbGVuZ3RoIHF1YW50aXRpZXMgd2UgdXNlIGluIHRoZSBzb3VyY2UgbWFwIHNwZWMsIHRoZSBmaXJzdCBiaXQgaXMgdGhlIHNpZ24sXG4vLyB0aGUgbmV4dCBmb3VyIGJpdHMgYXJlIHRoZSBhY3R1YWwgdmFsdWUsIGFuZCB0aGUgNnRoIGJpdCBpcyB0aGVcbi8vIGNvbnRpbnVhdGlvbiBiaXQuIFRoZSBjb250aW51YXRpb24gYml0IHRlbGxzIHVzIHdoZXRoZXIgdGhlcmUgYXJlIG1vcmVcbi8vIGRpZ2l0cyBpbiB0aGlzIHZhbHVlIGZvbGxvd2luZyB0aGlzIGRpZ2l0LlxuLy9cbi8vICAgQ29udGludWF0aW9uXG4vLyAgIHwgICAgU2lnblxuLy8gICB8ICAgIHxcbi8vICAgViAgICBWXG4vLyAgIDEwMTAxMVxuXG52YXIgVkxRX0JBU0VfU0hJRlQgPSA1O1xuXG4vLyBiaW5hcnk6IDEwMDAwMFxudmFyIFZMUV9CQVNFID0gMSA8PCBWTFFfQkFTRV9TSElGVDtcblxuLy8gYmluYXJ5OiAwMTExMTFcbnZhciBWTFFfQkFTRV9NQVNLID0gVkxRX0JBU0UgLSAxO1xuXG4vLyBiaW5hcnk6IDEwMDAwMFxudmFyIFZMUV9DT05USU5VQVRJT05fQklUID0gVkxRX0JBU0U7XG5cbi8qKlxuICogQ29udmVydHMgZnJvbSBhIHR3by1jb21wbGVtZW50IHZhbHVlIHRvIGEgdmFsdWUgd2hlcmUgdGhlIHNpZ24gYml0IGlzXG4gKiBwbGFjZWQgaW4gdGhlIGxlYXN0IHNpZ25pZmljYW50IGJpdC4gIEZvciBleGFtcGxlLCBhcyBkZWNpbWFsczpcbiAqICAgMSBiZWNvbWVzIDIgKDEwIGJpbmFyeSksIC0xIGJlY29tZXMgMyAoMTEgYmluYXJ5KVxuICogICAyIGJlY29tZXMgNCAoMTAwIGJpbmFyeSksIC0yIGJlY29tZXMgNSAoMTAxIGJpbmFyeSlcbiAqL1xuZnVuY3Rpb24gdG9WTFFTaWduZWQoYVZhbHVlKSB7XG4gIHJldHVybiBhVmFsdWUgPCAwXG4gICAgPyAoKC1hVmFsdWUpIDw8IDEpICsgMVxuICAgIDogKGFWYWx1ZSA8PCAxKSArIDA7XG59XG5cbi8qKlxuICogQ29udmVydHMgdG8gYSB0d28tY29tcGxlbWVudCB2YWx1ZSBmcm9tIGEgdmFsdWUgd2hlcmUgdGhlIHNpZ24gYml0IGlzXG4gKiBwbGFjZWQgaW4gdGhlIGxlYXN0IHNpZ25pZmljYW50IGJpdC4gIEZvciBleGFtcGxlLCBhcyBkZWNpbWFsczpcbiAqICAgMiAoMTAgYmluYXJ5KSBiZWNvbWVzIDEsIDMgKDExIGJpbmFyeSkgYmVjb21lcyAtMVxuICogICA0ICgxMDAgYmluYXJ5KSBiZWNvbWVzIDIsIDUgKDEwMSBiaW5hcnkpIGJlY29tZXMgLTJcbiAqL1xuZnVuY3Rpb24gZnJvbVZMUVNpZ25lZChhVmFsdWUpIHtcbiAgdmFyIGlzTmVnYXRpdmUgPSAoYVZhbHVlICYgMSkgPT09IDE7XG4gIHZhciBzaGlmdGVkID0gYVZhbHVlID4+IDE7XG4gIHJldHVybiBpc05lZ2F0aXZlXG4gICAgPyAtc2hpZnRlZFxuICAgIDogc2hpZnRlZDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBiYXNlIDY0IFZMUSBlbmNvZGVkIHZhbHVlLlxuICovXG5leHBvcnRzLmVuY29kZSA9IGZ1bmN0aW9uIGJhc2U2NFZMUV9lbmNvZGUoYVZhbHVlKSB7XG4gIHZhciBlbmNvZGVkID0gXCJcIjtcbiAgdmFyIGRpZ2l0O1xuXG4gIHZhciB2bHEgPSB0b1ZMUVNpZ25lZChhVmFsdWUpO1xuXG4gIGRvIHtcbiAgICBkaWdpdCA9IHZscSAmIFZMUV9CQVNFX01BU0s7XG4gICAgdmxxID4+Pj0gVkxRX0JBU0VfU0hJRlQ7XG4gICAgaWYgKHZscSA+IDApIHtcbiAgICAgIC8vIFRoZXJlIGFyZSBzdGlsbCBtb3JlIGRpZ2l0cyBpbiB0aGlzIHZhbHVlLCBzbyB3ZSBtdXN0IG1ha2Ugc3VyZSB0aGVcbiAgICAgIC8vIGNvbnRpbnVhdGlvbiBiaXQgaXMgbWFya2VkLlxuICAgICAgZGlnaXQgfD0gVkxRX0NPTlRJTlVBVElPTl9CSVQ7XG4gICAgfVxuICAgIGVuY29kZWQgKz0gYmFzZTY0LmVuY29kZShkaWdpdCk7XG4gIH0gd2hpbGUgKHZscSA+IDApO1xuXG4gIHJldHVybiBlbmNvZGVkO1xufTtcblxuLyoqXG4gKiBEZWNvZGVzIHRoZSBuZXh0IGJhc2UgNjQgVkxRIHZhbHVlIGZyb20gdGhlIGdpdmVuIHN0cmluZyBhbmQgcmV0dXJucyB0aGVcbiAqIHZhbHVlIGFuZCB0aGUgcmVzdCBvZiB0aGUgc3RyaW5nIHZpYSB0aGUgb3V0IHBhcmFtZXRlci5cbiAqL1xuZXhwb3J0cy5kZWNvZGUgPSBmdW5jdGlvbiBiYXNlNjRWTFFfZGVjb2RlKGFTdHIsIGFJbmRleCwgYU91dFBhcmFtKSB7XG4gIHZhciBzdHJMZW4gPSBhU3RyLmxlbmd0aDtcbiAgdmFyIHJlc3VsdCA9IDA7XG4gIHZhciBzaGlmdCA9IDA7XG4gIHZhciBjb250aW51YXRpb24sIGRpZ2l0O1xuXG4gIGRvIHtcbiAgICBpZiAoYUluZGV4ID49IHN0ckxlbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgbW9yZSBkaWdpdHMgaW4gYmFzZSA2NCBWTFEgdmFsdWUuXCIpO1xuICAgIH1cblxuICAgIGRpZ2l0ID0gYmFzZTY0LmRlY29kZShhU3RyLmNoYXJDb2RlQXQoYUluZGV4KyspKTtcbiAgICBpZiAoZGlnaXQgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGJhc2U2NCBkaWdpdDogXCIgKyBhU3RyLmNoYXJBdChhSW5kZXggLSAxKSk7XG4gICAgfVxuXG4gICAgY29udGludWF0aW9uID0gISEoZGlnaXQgJiBWTFFfQ09OVElOVUFUSU9OX0JJVCk7XG4gICAgZGlnaXQgJj0gVkxRX0JBU0VfTUFTSztcbiAgICByZXN1bHQgPSByZXN1bHQgKyAoZGlnaXQgPDwgc2hpZnQpO1xuICAgIHNoaWZ0ICs9IFZMUV9CQVNFX1NISUZUO1xuICB9IHdoaWxlIChjb250aW51YXRpb24pO1xuXG4gIGFPdXRQYXJhbS52YWx1ZSA9IGZyb21WTFFTaWduZWQocmVzdWx0KTtcbiAgYU91dFBhcmFtLnJlc3QgPSBhSW5kZXg7XG59O1xuIiwiLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqL1xuXG52YXIgaW50VG9DaGFyTWFwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nLnNwbGl0KCcnKTtcblxuLyoqXG4gKiBFbmNvZGUgYW4gaW50ZWdlciBpbiB0aGUgcmFuZ2Ugb2YgMCB0byA2MyB0byBhIHNpbmdsZSBiYXNlIDY0IGRpZ2l0LlxuICovXG5leHBvcnRzLmVuY29kZSA9IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgaWYgKDAgPD0gbnVtYmVyICYmIG51bWJlciA8IGludFRvQ2hhck1hcC5sZW5ndGgpIHtcbiAgICByZXR1cm4gaW50VG9DaGFyTWFwW251bWJlcl07XG4gIH1cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk11c3QgYmUgYmV0d2VlbiAwIGFuZCA2MzogXCIgKyBudW1iZXIpO1xufTtcblxuLyoqXG4gKiBEZWNvZGUgYSBzaW5nbGUgYmFzZSA2NCBjaGFyYWN0ZXIgY29kZSBkaWdpdCB0byBhbiBpbnRlZ2VyLiBSZXR1cm5zIC0xIG9uXG4gKiBmYWlsdXJlLlxuICovXG5leHBvcnRzLmRlY29kZSA9IGZ1bmN0aW9uIChjaGFyQ29kZSkge1xuICB2YXIgYmlnQSA9IDY1OyAgICAgLy8gJ0EnXG4gIHZhciBiaWdaID0gOTA7ICAgICAvLyAnWidcblxuICB2YXIgbGl0dGxlQSA9IDk3OyAgLy8gJ2EnXG4gIHZhciBsaXR0bGVaID0gMTIyOyAvLyAneidcblxuICB2YXIgemVybyA9IDQ4OyAgICAgLy8gJzAnXG4gIHZhciBuaW5lID0gNTc7ICAgICAvLyAnOSdcblxuICB2YXIgcGx1cyA9IDQzOyAgICAgLy8gJysnXG4gIHZhciBzbGFzaCA9IDQ3OyAgICAvLyAnLydcblxuICB2YXIgbGl0dGxlT2Zmc2V0ID0gMjY7XG4gIHZhciBudW1iZXJPZmZzZXQgPSA1MjtcblxuICAvLyAwIC0gMjU6IEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXG4gIGlmIChiaWdBIDw9IGNoYXJDb2RlICYmIGNoYXJDb2RlIDw9IGJpZ1opIHtcbiAgICByZXR1cm4gKGNoYXJDb2RlIC0gYmlnQSk7XG4gIH1cblxuICAvLyAyNiAtIDUxOiBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5elxuICBpZiAobGl0dGxlQSA8PSBjaGFyQ29kZSAmJiBjaGFyQ29kZSA8PSBsaXR0bGVaKSB7XG4gICAgcmV0dXJuIChjaGFyQ29kZSAtIGxpdHRsZUEgKyBsaXR0bGVPZmZzZXQpO1xuICB9XG5cbiAgLy8gNTIgLSA2MTogMDEyMzQ1Njc4OVxuICBpZiAoemVybyA8PSBjaGFyQ29kZSAmJiBjaGFyQ29kZSA8PSBuaW5lKSB7XG4gICAgcmV0dXJuIChjaGFyQ29kZSAtIHplcm8gKyBudW1iZXJPZmZzZXQpO1xuICB9XG5cbiAgLy8gNjI6ICtcbiAgaWYgKGNoYXJDb2RlID09IHBsdXMpIHtcbiAgICByZXR1cm4gNjI7XG4gIH1cblxuICAvLyA2MzogL1xuICBpZiAoY2hhckNvZGUgPT0gc2xhc2gpIHtcbiAgICByZXR1cm4gNjM7XG4gIH1cblxuICAvLyBJbnZhbGlkIGJhc2U2NCBkaWdpdC5cbiAgcmV0dXJuIC0xO1xufTtcbiIsIi8qIC0qLSBNb2RlOiBqczsganMtaW5kZW50LWxldmVsOiAyOyAtKi0gKi9cbi8qXG4gKiBDb3B5cmlnaHQgMjAxMSBNb3ppbGxhIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9yc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgbGljZW5zZS4gU2VlIExJQ0VOU0Ugb3I6XG4gKiBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvQlNELTMtQ2xhdXNlXG4gKi9cblxuZXhwb3J0cy5HUkVBVEVTVF9MT1dFUl9CT1VORCA9IDE7XG5leHBvcnRzLkxFQVNUX1VQUEVSX0JPVU5EID0gMjtcblxuLyoqXG4gKiBSZWN1cnNpdmUgaW1wbGVtZW50YXRpb24gb2YgYmluYXJ5IHNlYXJjaC5cbiAqXG4gKiBAcGFyYW0gYUxvdyBJbmRpY2VzIGhlcmUgYW5kIGxvd2VyIGRvIG5vdCBjb250YWluIHRoZSBuZWVkbGUuXG4gKiBAcGFyYW0gYUhpZ2ggSW5kaWNlcyBoZXJlIGFuZCBoaWdoZXIgZG8gbm90IGNvbnRhaW4gdGhlIG5lZWRsZS5cbiAqIEBwYXJhbSBhTmVlZGxlIFRoZSBlbGVtZW50IGJlaW5nIHNlYXJjaGVkIGZvci5cbiAqIEBwYXJhbSBhSGF5c3RhY2sgVGhlIG5vbi1lbXB0eSBhcnJheSBiZWluZyBzZWFyY2hlZC5cbiAqIEBwYXJhbSBhQ29tcGFyZSBGdW5jdGlvbiB3aGljaCB0YWtlcyB0d28gZWxlbWVudHMgYW5kIHJldHVybnMgLTEsIDAsIG9yIDEuXG4gKiBAcGFyYW0gYUJpYXMgRWl0aGVyICdiaW5hcnlTZWFyY2guR1JFQVRFU1RfTE9XRVJfQk9VTkQnIG9yXG4gKiAgICAgJ2JpbmFyeVNlYXJjaC5MRUFTVF9VUFBFUl9CT1VORCcuIFNwZWNpZmllcyB3aGV0aGVyIHRvIHJldHVybiB0aGVcbiAqICAgICBjbG9zZXN0IGVsZW1lbnQgdGhhdCBpcyBzbWFsbGVyIHRoYW4gb3IgZ3JlYXRlciB0aGFuIHRoZSBvbmUgd2UgYXJlXG4gKiAgICAgc2VhcmNoaW5nIGZvciwgcmVzcGVjdGl2ZWx5LCBpZiB0aGUgZXhhY3QgZWxlbWVudCBjYW5ub3QgYmUgZm91bmQuXG4gKi9cbmZ1bmN0aW9uIHJlY3Vyc2l2ZVNlYXJjaChhTG93LCBhSGlnaCwgYU5lZWRsZSwgYUhheXN0YWNrLCBhQ29tcGFyZSwgYUJpYXMpIHtcbiAgLy8gVGhpcyBmdW5jdGlvbiB0ZXJtaW5hdGVzIHdoZW4gb25lIG9mIHRoZSBmb2xsb3dpbmcgaXMgdHJ1ZTpcbiAgLy9cbiAgLy8gICAxLiBXZSBmaW5kIHRoZSBleGFjdCBlbGVtZW50IHdlIGFyZSBsb29raW5nIGZvci5cbiAgLy9cbiAgLy8gICAyLiBXZSBkaWQgbm90IGZpbmQgdGhlIGV4YWN0IGVsZW1lbnQsIGJ1dCB3ZSBjYW4gcmV0dXJuIHRoZSBpbmRleCBvZlxuICAvLyAgICAgIHRoZSBuZXh0LWNsb3Nlc3QgZWxlbWVudC5cbiAgLy9cbiAgLy8gICAzLiBXZSBkaWQgbm90IGZpbmQgdGhlIGV4YWN0IGVsZW1lbnQsIGFuZCB0aGVyZSBpcyBubyBuZXh0LWNsb3Nlc3RcbiAgLy8gICAgICBlbGVtZW50IHRoYW4gdGhlIG9uZSB3ZSBhcmUgc2VhcmNoaW5nIGZvciwgc28gd2UgcmV0dXJuIC0xLlxuICB2YXIgbWlkID0gTWF0aC5mbG9vcigoYUhpZ2ggLSBhTG93KSAvIDIpICsgYUxvdztcbiAgdmFyIGNtcCA9IGFDb21wYXJlKGFOZWVkbGUsIGFIYXlzdGFja1ttaWRdLCB0cnVlKTtcbiAgaWYgKGNtcCA9PT0gMCkge1xuICAgIC8vIEZvdW5kIHRoZSBlbGVtZW50IHdlIGFyZSBsb29raW5nIGZvci5cbiAgICByZXR1cm4gbWlkO1xuICB9XG4gIGVsc2UgaWYgKGNtcCA+IDApIHtcbiAgICAvLyBPdXIgbmVlZGxlIGlzIGdyZWF0ZXIgdGhhbiBhSGF5c3RhY2tbbWlkXS5cbiAgICBpZiAoYUhpZ2ggLSBtaWQgPiAxKSB7XG4gICAgICAvLyBUaGUgZWxlbWVudCBpcyBpbiB0aGUgdXBwZXIgaGFsZi5cbiAgICAgIHJldHVybiByZWN1cnNpdmVTZWFyY2gobWlkLCBhSGlnaCwgYU5lZWRsZSwgYUhheXN0YWNrLCBhQ29tcGFyZSwgYUJpYXMpO1xuICAgIH1cblxuICAgIC8vIFRoZSBleGFjdCBuZWVkbGUgZWxlbWVudCB3YXMgbm90IGZvdW5kIGluIHRoaXMgaGF5c3RhY2suIERldGVybWluZSBpZlxuICAgIC8vIHdlIGFyZSBpbiB0ZXJtaW5hdGlvbiBjYXNlICgzKSBvciAoMikgYW5kIHJldHVybiB0aGUgYXBwcm9wcmlhdGUgdGhpbmcuXG4gICAgaWYgKGFCaWFzID09IGV4cG9ydHMuTEVBU1RfVVBQRVJfQk9VTkQpIHtcbiAgICAgIHJldHVybiBhSGlnaCA8IGFIYXlzdGFjay5sZW5ndGggPyBhSGlnaCA6IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWlkO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICAvLyBPdXIgbmVlZGxlIGlzIGxlc3MgdGhhbiBhSGF5c3RhY2tbbWlkXS5cbiAgICBpZiAobWlkIC0gYUxvdyA+IDEpIHtcbiAgICAgIC8vIFRoZSBlbGVtZW50IGlzIGluIHRoZSBsb3dlciBoYWxmLlxuICAgICAgcmV0dXJuIHJlY3Vyc2l2ZVNlYXJjaChhTG93LCBtaWQsIGFOZWVkbGUsIGFIYXlzdGFjaywgYUNvbXBhcmUsIGFCaWFzKTtcbiAgICB9XG5cbiAgICAvLyB3ZSBhcmUgaW4gdGVybWluYXRpb24gY2FzZSAoMykgb3IgKDIpIGFuZCByZXR1cm4gdGhlIGFwcHJvcHJpYXRlIHRoaW5nLlxuICAgIGlmIChhQmlhcyA9PSBleHBvcnRzLkxFQVNUX1VQUEVSX0JPVU5EKSB7XG4gICAgICByZXR1cm4gbWlkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYUxvdyA8IDAgPyAtMSA6IGFMb3c7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVGhpcyBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiBiaW5hcnkgc2VhcmNoIHdoaWNoIHdpbGwgYWx3YXlzIHRyeSBhbmQgcmV0dXJuXG4gKiB0aGUgaW5kZXggb2YgdGhlIGNsb3Nlc3QgZWxlbWVudCBpZiB0aGVyZSBpcyBubyBleGFjdCBoaXQuIFRoaXMgaXMgYmVjYXVzZVxuICogbWFwcGluZ3MgYmV0d2VlbiBvcmlnaW5hbCBhbmQgZ2VuZXJhdGVkIGxpbmUvY29sIHBhaXJzIGFyZSBzaW5nbGUgcG9pbnRzLFxuICogYW5kIHRoZXJlIGlzIGFuIGltcGxpY2l0IHJlZ2lvbiBiZXR3ZWVuIGVhY2ggb2YgdGhlbSwgc28gYSBtaXNzIGp1c3QgbWVhbnNcbiAqIHRoYXQgeW91IGFyZW4ndCBvbiB0aGUgdmVyeSBzdGFydCBvZiBhIHJlZ2lvbi5cbiAqXG4gKiBAcGFyYW0gYU5lZWRsZSBUaGUgZWxlbWVudCB5b3UgYXJlIGxvb2tpbmcgZm9yLlxuICogQHBhcmFtIGFIYXlzdGFjayBUaGUgYXJyYXkgdGhhdCBpcyBiZWluZyBzZWFyY2hlZC5cbiAqIEBwYXJhbSBhQ29tcGFyZSBBIGZ1bmN0aW9uIHdoaWNoIHRha2VzIHRoZSBuZWVkbGUgYW5kIGFuIGVsZW1lbnQgaW4gdGhlXG4gKiAgICAgYXJyYXkgYW5kIHJldHVybnMgLTEsIDAsIG9yIDEgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIG5lZWRsZSBpcyBsZXNzXG4gKiAgICAgdGhhbiwgZXF1YWwgdG8sIG9yIGdyZWF0ZXIgdGhhbiB0aGUgZWxlbWVudCwgcmVzcGVjdGl2ZWx5LlxuICogQHBhcmFtIGFCaWFzIEVpdGhlciAnYmluYXJ5U2VhcmNoLkdSRUFURVNUX0xPV0VSX0JPVU5EJyBvclxuICogICAgICdiaW5hcnlTZWFyY2guTEVBU1RfVVBQRVJfQk9VTkQnLiBTcGVjaWZpZXMgd2hldGhlciB0byByZXR1cm4gdGhlXG4gKiAgICAgY2xvc2VzdCBlbGVtZW50IHRoYXQgaXMgc21hbGxlciB0aGFuIG9yIGdyZWF0ZXIgdGhhbiB0aGUgb25lIHdlIGFyZVxuICogICAgIHNlYXJjaGluZyBmb3IsIHJlc3BlY3RpdmVseSwgaWYgdGhlIGV4YWN0IGVsZW1lbnQgY2Fubm90IGJlIGZvdW5kLlxuICogICAgIERlZmF1bHRzIHRvICdiaW5hcnlTZWFyY2guR1JFQVRFU1RfTE9XRVJfQk9VTkQnLlxuICovXG5leHBvcnRzLnNlYXJjaCA9IGZ1bmN0aW9uIHNlYXJjaChhTmVlZGxlLCBhSGF5c3RhY2ssIGFDb21wYXJlLCBhQmlhcykge1xuICBpZiAoYUhheXN0YWNrLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIHZhciBpbmRleCA9IHJlY3Vyc2l2ZVNlYXJjaCgtMSwgYUhheXN0YWNrLmxlbmd0aCwgYU5lZWRsZSwgYUhheXN0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYUNvbXBhcmUsIGFCaWFzIHx8IGV4cG9ydHMuR1JFQVRFU1RfTE9XRVJfQk9VTkQpO1xuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgLy8gV2UgaGF2ZSBmb3VuZCBlaXRoZXIgdGhlIGV4YWN0IGVsZW1lbnQsIG9yIHRoZSBuZXh0LWNsb3Nlc3QgZWxlbWVudCB0aGFuXG4gIC8vIHRoZSBvbmUgd2UgYXJlIHNlYXJjaGluZyBmb3IuIEhvd2V2ZXIsIHRoZXJlIG1heSBiZSBtb3JlIHRoYW4gb25lIHN1Y2hcbiAgLy8gZWxlbWVudC4gTWFrZSBzdXJlIHdlIGFsd2F5cyByZXR1cm4gdGhlIHNtYWxsZXN0IG9mIHRoZXNlLlxuICB3aGlsZSAoaW5kZXggLSAxID49IDApIHtcbiAgICBpZiAoYUNvbXBhcmUoYUhheXN0YWNrW2luZGV4XSwgYUhheXN0YWNrW2luZGV4IC0gMV0sIHRydWUpICE9PSAwKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgLS1pbmRleDtcbiAgfVxuXG4gIHJldHVybiBpbmRleDtcbn07XG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTQgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoZXRoZXIgbWFwcGluZ0IgaXMgYWZ0ZXIgbWFwcGluZ0Egd2l0aCByZXNwZWN0IHRvIGdlbmVyYXRlZFxuICogcG9zaXRpb24uXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlZFBvc2l0aW9uQWZ0ZXIobWFwcGluZ0EsIG1hcHBpbmdCKSB7XG4gIC8vIE9wdGltaXplZCBmb3IgbW9zdCBjb21tb24gY2FzZVxuICB2YXIgbGluZUEgPSBtYXBwaW5nQS5nZW5lcmF0ZWRMaW5lO1xuICB2YXIgbGluZUIgPSBtYXBwaW5nQi5nZW5lcmF0ZWRMaW5lO1xuICB2YXIgY29sdW1uQSA9IG1hcHBpbmdBLmdlbmVyYXRlZENvbHVtbjtcbiAgdmFyIGNvbHVtbkIgPSBtYXBwaW5nQi5nZW5lcmF0ZWRDb2x1bW47XG4gIHJldHVybiBsaW5lQiA+IGxpbmVBIHx8IGxpbmVCID09IGxpbmVBICYmIGNvbHVtbkIgPj0gY29sdW1uQSB8fFxuICAgICAgICAgdXRpbC5jb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNJbmZsYXRlZChtYXBwaW5nQSwgbWFwcGluZ0IpIDw9IDA7XG59XG5cbi8qKlxuICogQSBkYXRhIHN0cnVjdHVyZSB0byBwcm92aWRlIGEgc29ydGVkIHZpZXcgb2YgYWNjdW11bGF0ZWQgbWFwcGluZ3MgaW4gYVxuICogcGVyZm9ybWFuY2UgY29uc2Npb3VzIG1hbm5lci4gSXQgdHJhZGVzIGEgbmVnbGliYWJsZSBvdmVyaGVhZCBpbiBnZW5lcmFsXG4gKiBjYXNlIGZvciBhIGxhcmdlIHNwZWVkdXAgaW4gY2FzZSBvZiBtYXBwaW5ncyBiZWluZyBhZGRlZCBpbiBvcmRlci5cbiAqL1xuZnVuY3Rpb24gTWFwcGluZ0xpc3QoKSB7XG4gIHRoaXMuX2FycmF5ID0gW107XG4gIHRoaXMuX3NvcnRlZCA9IHRydWU7XG4gIC8vIFNlcnZlcyBhcyBpbmZpbXVtXG4gIHRoaXMuX2xhc3QgPSB7Z2VuZXJhdGVkTGluZTogLTEsIGdlbmVyYXRlZENvbHVtbjogMH07XG59XG5cbi8qKlxuICogSXRlcmF0ZSB0aHJvdWdoIGludGVybmFsIGl0ZW1zLiBUaGlzIG1ldGhvZCB0YWtlcyB0aGUgc2FtZSBhcmd1bWVudHMgdGhhdFxuICogYEFycmF5LnByb3RvdHlwZS5mb3JFYWNoYCB0YWtlcy5cbiAqXG4gKiBOT1RFOiBUaGUgb3JkZXIgb2YgdGhlIG1hcHBpbmdzIGlzIE5PVCBndWFyYW50ZWVkLlxuICovXG5NYXBwaW5nTGlzdC5wcm90b3R5cGUudW5zb3J0ZWRGb3JFYWNoID1cbiAgZnVuY3Rpb24gTWFwcGluZ0xpc3RfZm9yRWFjaChhQ2FsbGJhY2ssIGFUaGlzQXJnKSB7XG4gICAgdGhpcy5fYXJyYXkuZm9yRWFjaChhQ2FsbGJhY2ssIGFUaGlzQXJnKTtcbiAgfTtcblxuLyoqXG4gKiBBZGQgdGhlIGdpdmVuIHNvdXJjZSBtYXBwaW5nLlxuICpcbiAqIEBwYXJhbSBPYmplY3QgYU1hcHBpbmdcbiAqL1xuTWFwcGluZ0xpc3QucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIE1hcHBpbmdMaXN0X2FkZChhTWFwcGluZykge1xuICBpZiAoZ2VuZXJhdGVkUG9zaXRpb25BZnRlcih0aGlzLl9sYXN0LCBhTWFwcGluZykpIHtcbiAgICB0aGlzLl9sYXN0ID0gYU1hcHBpbmc7XG4gICAgdGhpcy5fYXJyYXkucHVzaChhTWFwcGluZyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fc29ydGVkID0gZmFsc2U7XG4gICAgdGhpcy5fYXJyYXkucHVzaChhTWFwcGluZyk7XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZmxhdCwgc29ydGVkIGFycmF5IG9mIG1hcHBpbmdzLiBUaGUgbWFwcGluZ3MgYXJlIHNvcnRlZCBieVxuICogZ2VuZXJhdGVkIHBvc2l0aW9uLlxuICpcbiAqIFdBUk5JTkc6IFRoaXMgbWV0aG9kIHJldHVybnMgaW50ZXJuYWwgZGF0YSB3aXRob3V0IGNvcHlpbmcsIGZvclxuICogcGVyZm9ybWFuY2UuIFRoZSByZXR1cm4gdmFsdWUgbXVzdCBOT1QgYmUgbXV0YXRlZCwgYW5kIHNob3VsZCBiZSB0cmVhdGVkIGFzXG4gKiBhbiBpbW11dGFibGUgYm9ycm93LiBJZiB5b3Ugd2FudCB0byB0YWtlIG93bmVyc2hpcCwgeW91IG11c3QgbWFrZSB5b3VyIG93blxuICogY29weS5cbiAqL1xuTWFwcGluZ0xpc3QucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiBNYXBwaW5nTGlzdF90b0FycmF5KCkge1xuICBpZiAoIXRoaXMuX3NvcnRlZCkge1xuICAgIHRoaXMuX2FycmF5LnNvcnQodXRpbC5jb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNJbmZsYXRlZCk7XG4gICAgdGhpcy5fc29ydGVkID0gdHJ1ZTtcbiAgfVxuICByZXR1cm4gdGhpcy5fYXJyYXk7XG59O1xuXG5leHBvcnRzLk1hcHBpbmdMaXN0ID0gTWFwcGluZ0xpc3Q7XG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbi8vIEl0IHR1cm5zIG91dCB0aGF0IHNvbWUgKG1vc3Q/KSBKYXZhU2NyaXB0IGVuZ2luZXMgZG9uJ3Qgc2VsZi1ob3N0XG4vLyBgQXJyYXkucHJvdG90eXBlLnNvcnRgLiBUaGlzIG1ha2VzIHNlbnNlIGJlY2F1c2UgQysrIHdpbGwgbGlrZWx5IHJlbWFpblxuLy8gZmFzdGVyIHRoYW4gSlMgd2hlbiBkb2luZyByYXcgQ1BVLWludGVuc2l2ZSBzb3J0aW5nLiBIb3dldmVyLCB3aGVuIHVzaW5nIGFcbi8vIGN1c3RvbSBjb21wYXJhdG9yIGZ1bmN0aW9uLCBjYWxsaW5nIGJhY2sgYW5kIGZvcnRoIGJldHdlZW4gdGhlIFZNJ3MgQysrIGFuZFxuLy8gSklUJ2QgSlMgaXMgcmF0aGVyIHNsb3cgKmFuZCogbG9zZXMgSklUIHR5cGUgaW5mb3JtYXRpb24sIHJlc3VsdGluZyBpblxuLy8gd29yc2UgZ2VuZXJhdGVkIGNvZGUgZm9yIHRoZSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRoYW4gd291bGQgYmUgb3B0aW1hbC4gSW5cbi8vIGZhY3QsIHdoZW4gc29ydGluZyB3aXRoIGEgY29tcGFyYXRvciwgdGhlc2UgY29zdHMgb3V0d2VpZ2ggdGhlIGJlbmVmaXRzIG9mXG4vLyBzb3J0aW5nIGluIEMrKy4gQnkgdXNpbmcgb3VyIG93biBKUy1pbXBsZW1lbnRlZCBRdWljayBTb3J0IChiZWxvdyksIHdlIGdldFxuLy8gYSB+MzUwMG1zIG1lYW4gc3BlZWQtdXAgaW4gYGJlbmNoL2JlbmNoLmh0bWxgLlxuXG4vKipcbiAqIFN3YXAgdGhlIGVsZW1lbnRzIGluZGV4ZWQgYnkgYHhgIGFuZCBgeWAgaW4gdGhlIGFycmF5IGBhcnlgLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyeVxuICogICAgICAgIFRoZSBhcnJheS5cbiAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gKiAgICAgICAgVGhlIGluZGV4IG9mIHRoZSBmaXJzdCBpdGVtLlxuICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAqICAgICAgICBUaGUgaW5kZXggb2YgdGhlIHNlY29uZCBpdGVtLlxuICovXG5mdW5jdGlvbiBzd2FwKGFyeSwgeCwgeSkge1xuICB2YXIgdGVtcCA9IGFyeVt4XTtcbiAgYXJ5W3hdID0gYXJ5W3ldO1xuICBhcnlbeV0gPSB0ZW1wO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSByYW5kb20gaW50ZWdlciB3aXRoaW4gdGhlIHJhbmdlIGBsb3cgLi4gaGlnaGAgaW5jbHVzaXZlLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBsb3dcbiAqICAgICAgICBUaGUgbG93ZXIgYm91bmQgb24gdGhlIHJhbmdlLlxuICogQHBhcmFtIHtOdW1iZXJ9IGhpZ2hcbiAqICAgICAgICBUaGUgdXBwZXIgYm91bmQgb24gdGhlIHJhbmdlLlxuICovXG5mdW5jdGlvbiByYW5kb21JbnRJblJhbmdlKGxvdywgaGlnaCkge1xuICByZXR1cm4gTWF0aC5yb3VuZChsb3cgKyAoTWF0aC5yYW5kb20oKSAqIChoaWdoIC0gbG93KSkpO1xufVxuXG4vKipcbiAqIFRoZSBRdWljayBTb3J0IGFsZ29yaXRobS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnlcbiAqICAgICAgICBBbiBhcnJheSB0byBzb3J0LlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY29tcGFyYXRvclxuICogICAgICAgIEZ1bmN0aW9uIHRvIHVzZSB0byBjb21wYXJlIHR3byBpdGVtcy5cbiAqIEBwYXJhbSB7TnVtYmVyfSBwXG4gKiAgICAgICAgU3RhcnQgaW5kZXggb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gclxuICogICAgICAgIEVuZCBpbmRleCBvZiB0aGUgYXJyYXlcbiAqL1xuZnVuY3Rpb24gZG9RdWlja1NvcnQoYXJ5LCBjb21wYXJhdG9yLCBwLCByKSB7XG4gIC8vIElmIG91ciBsb3dlciBib3VuZCBpcyBsZXNzIHRoYW4gb3VyIHVwcGVyIGJvdW5kLCB3ZSAoMSkgcGFydGl0aW9uIHRoZVxuICAvLyBhcnJheSBpbnRvIHR3byBwaWVjZXMgYW5kICgyKSByZWN1cnNlIG9uIGVhY2ggaGFsZi4gSWYgaXQgaXMgbm90LCB0aGlzIGlzXG4gIC8vIHRoZSBlbXB0eSBhcnJheSBhbmQgb3VyIGJhc2UgY2FzZS5cblxuICBpZiAocCA8IHIpIHtcbiAgICAvLyAoMSkgUGFydGl0aW9uaW5nLlxuICAgIC8vXG4gICAgLy8gVGhlIHBhcnRpdGlvbmluZyBjaG9vc2VzIGEgcGl2b3QgYmV0d2VlbiBgcGAgYW5kIGByYCBhbmQgbW92ZXMgYWxsXG4gICAgLy8gZWxlbWVudHMgdGhhdCBhcmUgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSBwaXZvdCB0byB0aGUgYmVmb3JlIGl0LCBhbmRcbiAgICAvLyBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgYXJlIGdyZWF0ZXIgdGhhbiBpdCBhZnRlciBpdC4gVGhlIGVmZmVjdCBpcyB0aGF0XG4gICAgLy8gb25jZSBwYXJ0aXRpb24gaXMgZG9uZSwgdGhlIHBpdm90IGlzIGluIHRoZSBleGFjdCBwbGFjZSBpdCB3aWxsIGJlIHdoZW5cbiAgICAvLyB0aGUgYXJyYXkgaXMgcHV0IGluIHNvcnRlZCBvcmRlciwgYW5kIGl0IHdpbGwgbm90IG5lZWQgdG8gYmUgbW92ZWRcbiAgICAvLyBhZ2Fpbi4gVGhpcyBydW5zIGluIE8obikgdGltZS5cblxuICAgIC8vIEFsd2F5cyBjaG9vc2UgYSByYW5kb20gcGl2b3Qgc28gdGhhdCBhbiBpbnB1dCBhcnJheSB3aGljaCBpcyByZXZlcnNlXG4gICAgLy8gc29ydGVkIGRvZXMgbm90IGNhdXNlIE8obl4yKSBydW5uaW5nIHRpbWUuXG4gICAgdmFyIHBpdm90SW5kZXggPSByYW5kb21JbnRJblJhbmdlKHAsIHIpO1xuICAgIHZhciBpID0gcCAtIDE7XG5cbiAgICBzd2FwKGFyeSwgcGl2b3RJbmRleCwgcik7XG4gICAgdmFyIHBpdm90ID0gYXJ5W3JdO1xuXG4gICAgLy8gSW1tZWRpYXRlbHkgYWZ0ZXIgYGpgIGlzIGluY3JlbWVudGVkIGluIHRoaXMgbG9vcCwgdGhlIGZvbGxvd2luZyBob2xkXG4gICAgLy8gdHJ1ZTpcbiAgICAvL1xuICAgIC8vICAgKiBFdmVyeSBlbGVtZW50IGluIGBhcnlbcCAuLiBpXWAgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSBwaXZvdC5cbiAgICAvL1xuICAgIC8vICAgKiBFdmVyeSBlbGVtZW50IGluIGBhcnlbaSsxIC4uIGotMV1gIGlzIGdyZWF0ZXIgdGhhbiB0aGUgcGl2b3QuXG4gICAgZm9yICh2YXIgaiA9IHA7IGogPCByOyBqKyspIHtcbiAgICAgIGlmIChjb21wYXJhdG9yKGFyeVtqXSwgcGl2b3QpIDw9IDApIHtcbiAgICAgICAgaSArPSAxO1xuICAgICAgICBzd2FwKGFyeSwgaSwgaik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3dhcChhcnksIGkgKyAxLCBqKTtcbiAgICB2YXIgcSA9IGkgKyAxO1xuXG4gICAgLy8gKDIpIFJlY3Vyc2Ugb24gZWFjaCBoYWxmLlxuXG4gICAgZG9RdWlja1NvcnQoYXJ5LCBjb21wYXJhdG9yLCBwLCBxIC0gMSk7XG4gICAgZG9RdWlja1NvcnQoYXJ5LCBjb21wYXJhdG9yLCBxICsgMSwgcik7XG4gIH1cbn1cblxuLyoqXG4gKiBTb3J0IHRoZSBnaXZlbiBhcnJheSBpbi1wbGFjZSB3aXRoIHRoZSBnaXZlbiBjb21wYXJhdG9yIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyeVxuICogICAgICAgIEFuIGFycmF5IHRvIHNvcnQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb21wYXJhdG9yXG4gKiAgICAgICAgRnVuY3Rpb24gdG8gdXNlIHRvIGNvbXBhcmUgdHdvIGl0ZW1zLlxuICovXG5leHBvcnRzLnF1aWNrU29ydCA9IGZ1bmN0aW9uIChhcnksIGNvbXBhcmF0b3IpIHtcbiAgZG9RdWlja1NvcnQoYXJ5LCBjb21wYXJhdG9yLCAwLCBhcnkubGVuZ3RoIC0gMSk7XG59O1xuIiwiLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIGJpbmFyeVNlYXJjaCA9IHJlcXVpcmUoJy4vYmluYXJ5LXNlYXJjaCcpO1xudmFyIEFycmF5U2V0ID0gcmVxdWlyZSgnLi9hcnJheS1zZXQnKS5BcnJheVNldDtcbnZhciBiYXNlNjRWTFEgPSByZXF1aXJlKCcuL2Jhc2U2NC12bHEnKTtcbnZhciBxdWlja1NvcnQgPSByZXF1aXJlKCcuL3F1aWNrLXNvcnQnKS5xdWlja1NvcnQ7XG5cbmZ1bmN0aW9uIFNvdXJjZU1hcENvbnN1bWVyKGFTb3VyY2VNYXApIHtcbiAgdmFyIHNvdXJjZU1hcCA9IGFTb3VyY2VNYXA7XG4gIGlmICh0eXBlb2YgYVNvdXJjZU1hcCA9PT0gJ3N0cmluZycpIHtcbiAgICBzb3VyY2VNYXAgPSBKU09OLnBhcnNlKGFTb3VyY2VNYXAucmVwbGFjZSgvXlxcKVxcXVxcfScvLCAnJykpO1xuICB9XG5cbiAgcmV0dXJuIHNvdXJjZU1hcC5zZWN0aW9ucyAhPSBudWxsXG4gICAgPyBuZXcgSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyKHNvdXJjZU1hcClcbiAgICA6IG5ldyBCYXNpY1NvdXJjZU1hcENvbnN1bWVyKHNvdXJjZU1hcCk7XG59XG5cblNvdXJjZU1hcENvbnN1bWVyLmZyb21Tb3VyY2VNYXAgPSBmdW5jdGlvbihhU291cmNlTWFwKSB7XG4gIHJldHVybiBCYXNpY1NvdXJjZU1hcENvbnN1bWVyLmZyb21Tb3VyY2VNYXAoYVNvdXJjZU1hcCk7XG59XG5cbi8qKlxuICogVGhlIHZlcnNpb24gb2YgdGhlIHNvdXJjZSBtYXBwaW5nIHNwZWMgdGhhdCB3ZSBhcmUgY29uc3VtaW5nLlxuICovXG5Tb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuX3ZlcnNpb24gPSAzO1xuXG4vLyBgX19nZW5lcmF0ZWRNYXBwaW5nc2AgYW5kIGBfX29yaWdpbmFsTWFwcGluZ3NgIGFyZSBhcnJheXMgdGhhdCBob2xkIHRoZVxuLy8gcGFyc2VkIG1hcHBpbmcgY29vcmRpbmF0ZXMgZnJvbSB0aGUgc291cmNlIG1hcCdzIFwibWFwcGluZ3NcIiBhdHRyaWJ1dGUuIFRoZXlcbi8vIGFyZSBsYXppbHkgaW5zdGFudGlhdGVkLCBhY2Nlc3NlZCB2aWEgdGhlIGBfZ2VuZXJhdGVkTWFwcGluZ3NgIGFuZFxuLy8gYF9vcmlnaW5hbE1hcHBpbmdzYCBnZXR0ZXJzIHJlc3BlY3RpdmVseSwgYW5kIHdlIG9ubHkgcGFyc2UgdGhlIG1hcHBpbmdzXG4vLyBhbmQgY3JlYXRlIHRoZXNlIGFycmF5cyBvbmNlIHF1ZXJpZWQgZm9yIGEgc291cmNlIGxvY2F0aW9uLiBXZSBqdW1wIHRocm91Z2hcbi8vIHRoZXNlIGhvb3BzIGJlY2F1c2UgdGhlcmUgY2FuIGJlIG1hbnkgdGhvdXNhbmRzIG9mIG1hcHBpbmdzLCBhbmQgcGFyc2luZ1xuLy8gdGhlbSBpcyBleHBlbnNpdmUsIHNvIHdlIG9ubHkgd2FudCB0byBkbyBpdCBpZiB3ZSBtdXN0LlxuLy9cbi8vIEVhY2ggb2JqZWN0IGluIHRoZSBhcnJheXMgaXMgb2YgdGhlIGZvcm06XG4vL1xuLy8gICAgIHtcbi8vICAgICAgIGdlbmVyYXRlZExpbmU6IFRoZSBsaW5lIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIGNvZGUsXG4vLyAgICAgICBnZW5lcmF0ZWRDb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgY29kZSxcbi8vICAgICAgIHNvdXJjZTogVGhlIHBhdGggdG8gdGhlIG9yaWdpbmFsIHNvdXJjZSBmaWxlIHRoYXQgZ2VuZXJhdGVkIHRoaXNcbi8vICAgICAgICAgICAgICAgY2h1bmsgb2YgY29kZSxcbi8vICAgICAgIG9yaWdpbmFsTGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UgdGhhdFxuLy8gICAgICAgICAgICAgICAgICAgICBjb3JyZXNwb25kcyB0byB0aGlzIGNodW5rIG9mIGdlbmVyYXRlZCBjb2RlLFxuLy8gICAgICAgb3JpZ2luYWxDb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UgdGhhdFxuLy8gICAgICAgICAgICAgICAgICAgICAgIGNvcnJlc3BvbmRzIHRvIHRoaXMgY2h1bmsgb2YgZ2VuZXJhdGVkIGNvZGUsXG4vLyAgICAgICBuYW1lOiBUaGUgbmFtZSBvZiB0aGUgb3JpZ2luYWwgc3ltYm9sIHdoaWNoIGdlbmVyYXRlZCB0aGlzIGNodW5rIG9mXG4vLyAgICAgICAgICAgICBjb2RlLlxuLy8gICAgIH1cbi8vXG4vLyBBbGwgcHJvcGVydGllcyBleGNlcHQgZm9yIGBnZW5lcmF0ZWRMaW5lYCBhbmQgYGdlbmVyYXRlZENvbHVtbmAgY2FuIGJlXG4vLyBgbnVsbGAuXG4vL1xuLy8gYF9nZW5lcmF0ZWRNYXBwaW5nc2AgaXMgb3JkZXJlZCBieSB0aGUgZ2VuZXJhdGVkIHBvc2l0aW9ucy5cbi8vXG4vLyBgX29yaWdpbmFsTWFwcGluZ3NgIGlzIG9yZGVyZWQgYnkgdGhlIG9yaWdpbmFsIHBvc2l0aW9ucy5cblxuU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLl9fZ2VuZXJhdGVkTWFwcGluZ3MgPSBudWxsO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZSwgJ19nZW5lcmF0ZWRNYXBwaW5ncycsIHtcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl9fZ2VuZXJhdGVkTWFwcGluZ3MpIHtcbiAgICAgIHRoaXMuX3BhcnNlTWFwcGluZ3ModGhpcy5fbWFwcGluZ3MsIHRoaXMuc291cmNlUm9vdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19nZW5lcmF0ZWRNYXBwaW5ncztcbiAgfVxufSk7XG5cblNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fX29yaWdpbmFsTWFwcGluZ3MgPSBudWxsO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZSwgJ19vcmlnaW5hbE1hcHBpbmdzJywge1xuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX19vcmlnaW5hbE1hcHBpbmdzKSB7XG4gICAgICB0aGlzLl9wYXJzZU1hcHBpbmdzKHRoaXMuX21hcHBpbmdzLCB0aGlzLnNvdXJjZVJvb3QpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9fb3JpZ2luYWxNYXBwaW5ncztcbiAgfVxufSk7XG5cblNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fY2hhcklzTWFwcGluZ1NlcGFyYXRvciA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcENvbnN1bWVyX2NoYXJJc01hcHBpbmdTZXBhcmF0b3IoYVN0ciwgaW5kZXgpIHtcbiAgICB2YXIgYyA9IGFTdHIuY2hhckF0KGluZGV4KTtcbiAgICByZXR1cm4gYyA9PT0gXCI7XCIgfHwgYyA9PT0gXCIsXCI7XG4gIH07XG5cbi8qKlxuICogUGFyc2UgdGhlIG1hcHBpbmdzIGluIGEgc3RyaW5nIGluIHRvIGEgZGF0YSBzdHJ1Y3R1cmUgd2hpY2ggd2UgY2FuIGVhc2lseVxuICogcXVlcnkgKHRoZSBvcmRlcmVkIGFycmF5cyBpbiB0aGUgYHRoaXMuX19nZW5lcmF0ZWRNYXBwaW5nc2AgYW5kXG4gKiBgdGhpcy5fX29yaWdpbmFsTWFwcGluZ3NgIHByb3BlcnRpZXMpLlxuICovXG5Tb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuX3BhcnNlTWFwcGluZ3MgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBDb25zdW1lcl9wYXJzZU1hcHBpbmdzKGFTdHIsIGFTb3VyY2VSb290KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiU3ViY2xhc3NlcyBtdXN0IGltcGxlbWVudCBfcGFyc2VNYXBwaW5nc1wiKTtcbiAgfTtcblxuU291cmNlTWFwQ29uc3VtZXIuR0VORVJBVEVEX09SREVSID0gMTtcblNvdXJjZU1hcENvbnN1bWVyLk9SSUdJTkFMX09SREVSID0gMjtcblxuU291cmNlTWFwQ29uc3VtZXIuR1JFQVRFU1RfTE9XRVJfQk9VTkQgPSAxO1xuU291cmNlTWFwQ29uc3VtZXIuTEVBU1RfVVBQRVJfQk9VTkQgPSAyO1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBlYWNoIG1hcHBpbmcgYmV0d2VlbiBhbiBvcmlnaW5hbCBzb3VyY2UvbGluZS9jb2x1bW4gYW5kIGFcbiAqIGdlbmVyYXRlZCBsaW5lL2NvbHVtbiBpbiB0aGlzIHNvdXJjZSBtYXAuXG4gKlxuICogQHBhcmFtIEZ1bmN0aW9uIGFDYWxsYmFja1xuICogICAgICAgIFRoZSBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aXRoIGVhY2ggbWFwcGluZy5cbiAqIEBwYXJhbSBPYmplY3QgYUNvbnRleHRcbiAqICAgICAgICBPcHRpb25hbC4gSWYgc3BlY2lmaWVkLCB0aGlzIG9iamVjdCB3aWxsIGJlIHRoZSB2YWx1ZSBvZiBgdGhpc2AgZXZlcnlcbiAqICAgICAgICB0aW1lIHRoYXQgYGFDYWxsYmFja2AgaXMgY2FsbGVkLlxuICogQHBhcmFtIGFPcmRlclxuICogICAgICAgIEVpdGhlciBgU291cmNlTWFwQ29uc3VtZXIuR0VORVJBVEVEX09SREVSYCBvclxuICogICAgICAgIGBTb3VyY2VNYXBDb25zdW1lci5PUklHSU5BTF9PUkRFUmAuIFNwZWNpZmllcyB3aGV0aGVyIHlvdSB3YW50IHRvXG4gKiAgICAgICAgaXRlcmF0ZSBvdmVyIHRoZSBtYXBwaW5ncyBzb3J0ZWQgYnkgdGhlIGdlbmVyYXRlZCBmaWxlJ3MgbGluZS9jb2x1bW5cbiAqICAgICAgICBvcmRlciBvciB0aGUgb3JpZ2luYWwncyBzb3VyY2UvbGluZS9jb2x1bW4gb3JkZXIsIHJlc3BlY3RpdmVseS4gRGVmYXVsdHMgdG9cbiAqICAgICAgICBgU291cmNlTWFwQ29uc3VtZXIuR0VORVJBVEVEX09SREVSYC5cbiAqL1xuU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLmVhY2hNYXBwaW5nID1cbiAgZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXJfZWFjaE1hcHBpbmcoYUNhbGxiYWNrLCBhQ29udGV4dCwgYU9yZGVyKSB7XG4gICAgdmFyIGNvbnRleHQgPSBhQ29udGV4dCB8fCBudWxsO1xuICAgIHZhciBvcmRlciA9IGFPcmRlciB8fCBTb3VyY2VNYXBDb25zdW1lci5HRU5FUkFURURfT1JERVI7XG5cbiAgICB2YXIgbWFwcGluZ3M7XG4gICAgc3dpdGNoIChvcmRlcikge1xuICAgIGNhc2UgU291cmNlTWFwQ29uc3VtZXIuR0VORVJBVEVEX09SREVSOlxuICAgICAgbWFwcGluZ3MgPSB0aGlzLl9nZW5lcmF0ZWRNYXBwaW5ncztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgU291cmNlTWFwQ29uc3VtZXIuT1JJR0lOQUxfT1JERVI6XG4gICAgICBtYXBwaW5ncyA9IHRoaXMuX29yaWdpbmFsTWFwcGluZ3M7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBvcmRlciBvZiBpdGVyYXRpb24uXCIpO1xuICAgIH1cblxuICAgIHZhciBzb3VyY2VSb290ID0gdGhpcy5zb3VyY2VSb290O1xuICAgIG1hcHBpbmdzLm1hcChmdW5jdGlvbiAobWFwcGluZykge1xuICAgICAgdmFyIHNvdXJjZSA9IG1hcHBpbmcuc291cmNlID09PSBudWxsID8gbnVsbCA6IHRoaXMuX3NvdXJjZXMuYXQobWFwcGluZy5zb3VyY2UpO1xuICAgICAgaWYgKHNvdXJjZSAhPSBudWxsICYmIHNvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgICBzb3VyY2UgPSB1dGlsLmpvaW4oc291cmNlUm9vdCwgc291cmNlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZTogc291cmNlLFxuICAgICAgICBnZW5lcmF0ZWRMaW5lOiBtYXBwaW5nLmdlbmVyYXRlZExpbmUsXG4gICAgICAgIGdlbmVyYXRlZENvbHVtbjogbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4sXG4gICAgICAgIG9yaWdpbmFsTGluZTogbWFwcGluZy5vcmlnaW5hbExpbmUsXG4gICAgICAgIG9yaWdpbmFsQ29sdW1uOiBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uLFxuICAgICAgICBuYW1lOiBtYXBwaW5nLm5hbWUgPT09IG51bGwgPyBudWxsIDogdGhpcy5fbmFtZXMuYXQobWFwcGluZy5uYW1lKVxuICAgICAgfTtcbiAgICB9LCB0aGlzKS5mb3JFYWNoKGFDYWxsYmFjaywgY29udGV4dCk7XG4gIH07XG5cbi8qKlxuICogUmV0dXJucyBhbGwgZ2VuZXJhdGVkIGxpbmUgYW5kIGNvbHVtbiBpbmZvcm1hdGlvbiBmb3IgdGhlIG9yaWdpbmFsIHNvdXJjZSxcbiAqIGxpbmUsIGFuZCBjb2x1bW4gcHJvdmlkZWQuIElmIG5vIGNvbHVtbiBpcyBwcm92aWRlZCwgcmV0dXJucyBhbGwgbWFwcGluZ3NcbiAqIGNvcnJlc3BvbmRpbmcgdG8gYSBlaXRoZXIgdGhlIGxpbmUgd2UgYXJlIHNlYXJjaGluZyBmb3Igb3IgdGhlIG5leHRcbiAqIGNsb3Nlc3QgbGluZSB0aGF0IGhhcyBhbnkgbWFwcGluZ3MuIE90aGVyd2lzZSwgcmV0dXJucyBhbGwgbWFwcGluZ3NcbiAqIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIGxpbmUgYW5kIGVpdGhlciB0aGUgY29sdW1uIHdlIGFyZSBzZWFyY2hpbmcgZm9yXG4gKiBvciB0aGUgbmV4dCBjbG9zZXN0IGNvbHVtbiB0aGF0IGhhcyBhbnkgb2Zmc2V0cy5cbiAqXG4gKiBUaGUgb25seSBhcmd1bWVudCBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAtIHNvdXJjZTogVGhlIGZpbGVuYW1lIG9mIHRoZSBvcmlnaW5hbCBzb3VyY2UuXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UuXG4gKiAgIC0gY29sdW1uOiBPcHRpb25hbC4gdGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZS5cbiAqXG4gKiBhbmQgYW4gYXJyYXkgb2Ygb2JqZWN0cyBpcyByZXR1cm5lZCwgZWFjaCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlLCBvciBudWxsLlxuICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UsIG9yIG51bGwuXG4gKi9cblNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5hbGxHZW5lcmF0ZWRQb3NpdGlvbnNGb3IgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBDb25zdW1lcl9hbGxHZW5lcmF0ZWRQb3NpdGlvbnNGb3IoYUFyZ3MpIHtcbiAgICB2YXIgbGluZSA9IHV0aWwuZ2V0QXJnKGFBcmdzLCAnbGluZScpO1xuXG4gICAgLy8gV2hlbiB0aGVyZSBpcyBubyBleGFjdCBtYXRjaCwgQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuX2ZpbmRNYXBwaW5nXG4gICAgLy8gcmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGNsb3Nlc3QgbWFwcGluZyBsZXNzIHRoYW4gdGhlIG5lZWRsZS4gQnlcbiAgICAvLyBzZXR0aW5nIG5lZWRsZS5vcmlnaW5hbENvbHVtbiB0byAwLCB3ZSB0aHVzIGZpbmQgdGhlIGxhc3QgbWFwcGluZyBmb3JcbiAgICAvLyB0aGUgZ2l2ZW4gbGluZSwgcHJvdmlkZWQgc3VjaCBhIG1hcHBpbmcgZXhpc3RzLlxuICAgIHZhciBuZWVkbGUgPSB7XG4gICAgICBzb3VyY2U6IHV0aWwuZ2V0QXJnKGFBcmdzLCAnc291cmNlJyksXG4gICAgICBvcmlnaW5hbExpbmU6IGxpbmUsXG4gICAgICBvcmlnaW5hbENvbHVtbjogdXRpbC5nZXRBcmcoYUFyZ3MsICdjb2x1bW4nLCAwKVxuICAgIH07XG5cbiAgICBpZiAodGhpcy5zb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgIG5lZWRsZS5zb3VyY2UgPSB1dGlsLnJlbGF0aXZlKHRoaXMuc291cmNlUm9vdCwgbmVlZGxlLnNvdXJjZSk7XG4gICAgfVxuICAgIGlmICghdGhpcy5fc291cmNlcy5oYXMobmVlZGxlLnNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgbmVlZGxlLnNvdXJjZSA9IHRoaXMuX3NvdXJjZXMuaW5kZXhPZihuZWVkbGUuc291cmNlKTtcblxuICAgIHZhciBtYXBwaW5ncyA9IFtdO1xuXG4gICAgdmFyIGluZGV4ID0gdGhpcy5fZmluZE1hcHBpbmcobmVlZGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29yaWdpbmFsTWFwcGluZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJvcmlnaW5hbExpbmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm9yaWdpbmFsQ29sdW1uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5jb21wYXJlQnlPcmlnaW5hbFBvc2l0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaW5hcnlTZWFyY2guTEVBU1RfVVBQRVJfQk9VTkQpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB2YXIgbWFwcGluZyA9IHRoaXMuX29yaWdpbmFsTWFwcGluZ3NbaW5kZXhdO1xuXG4gICAgICBpZiAoYUFyZ3MuY29sdW1uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsTGluZSA9IG1hcHBpbmcub3JpZ2luYWxMaW5lO1xuXG4gICAgICAgIC8vIEl0ZXJhdGUgdW50aWwgZWl0aGVyIHdlIHJ1biBvdXQgb2YgbWFwcGluZ3MsIG9yIHdlIHJ1biBpbnRvXG4gICAgICAgIC8vIGEgbWFwcGluZyBmb3IgYSBkaWZmZXJlbnQgbGluZSB0aGFuIHRoZSBvbmUgd2UgZm91bmQuIFNpbmNlXG4gICAgICAgIC8vIG1hcHBpbmdzIGFyZSBzb3J0ZWQsIHRoaXMgaXMgZ3VhcmFudGVlZCB0byBmaW5kIGFsbCBtYXBwaW5ncyBmb3JcbiAgICAgICAgLy8gdGhlIGxpbmUgd2UgZm91bmQuXG4gICAgICAgIHdoaWxlIChtYXBwaW5nICYmIG1hcHBpbmcub3JpZ2luYWxMaW5lID09PSBvcmlnaW5hbExpbmUpIHtcbiAgICAgICAgICBtYXBwaW5ncy5wdXNoKHtcbiAgICAgICAgICAgIGxpbmU6IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdnZW5lcmF0ZWRMaW5lJywgbnVsbCksXG4gICAgICAgICAgICBjb2x1bW46IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdnZW5lcmF0ZWRDb2x1bW4nLCBudWxsKSxcbiAgICAgICAgICAgIGxhc3RDb2x1bW46IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdsYXN0R2VuZXJhdGVkQ29sdW1uJywgbnVsbClcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIG1hcHBpbmcgPSB0aGlzLl9vcmlnaW5hbE1hcHBpbmdzWysraW5kZXhdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgb3JpZ2luYWxDb2x1bW4gPSBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uO1xuXG4gICAgICAgIC8vIEl0ZXJhdGUgdW50aWwgZWl0aGVyIHdlIHJ1biBvdXQgb2YgbWFwcGluZ3MsIG9yIHdlIHJ1biBpbnRvXG4gICAgICAgIC8vIGEgbWFwcGluZyBmb3IgYSBkaWZmZXJlbnQgbGluZSB0aGFuIHRoZSBvbmUgd2Ugd2VyZSBzZWFyY2hpbmcgZm9yLlxuICAgICAgICAvLyBTaW5jZSBtYXBwaW5ncyBhcmUgc29ydGVkLCB0aGlzIGlzIGd1YXJhbnRlZWQgdG8gZmluZCBhbGwgbWFwcGluZ3MgZm9yXG4gICAgICAgIC8vIHRoZSBsaW5lIHdlIGFyZSBzZWFyY2hpbmcgZm9yLlxuICAgICAgICB3aGlsZSAobWFwcGluZyAmJlxuICAgICAgICAgICAgICAgbWFwcGluZy5vcmlnaW5hbExpbmUgPT09IGxpbmUgJiZcbiAgICAgICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWxDb2x1bW4gPT0gb3JpZ2luYWxDb2x1bW4pIHtcbiAgICAgICAgICBtYXBwaW5ncy5wdXNoKHtcbiAgICAgICAgICAgIGxpbmU6IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdnZW5lcmF0ZWRMaW5lJywgbnVsbCksXG4gICAgICAgICAgICBjb2x1bW46IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdnZW5lcmF0ZWRDb2x1bW4nLCBudWxsKSxcbiAgICAgICAgICAgIGxhc3RDb2x1bW46IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdsYXN0R2VuZXJhdGVkQ29sdW1uJywgbnVsbClcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIG1hcHBpbmcgPSB0aGlzLl9vcmlnaW5hbE1hcHBpbmdzWysraW5kZXhdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcHBpbmdzO1xuICB9O1xuXG5leHBvcnRzLlNvdXJjZU1hcENvbnN1bWVyID0gU291cmNlTWFwQ29uc3VtZXI7XG5cbi8qKlxuICogQSBCYXNpY1NvdXJjZU1hcENvbnN1bWVyIGluc3RhbmNlIHJlcHJlc2VudHMgYSBwYXJzZWQgc291cmNlIG1hcCB3aGljaCB3ZSBjYW5cbiAqIHF1ZXJ5IGZvciBpbmZvcm1hdGlvbiBhYm91dCB0aGUgb3JpZ2luYWwgZmlsZSBwb3NpdGlvbnMgYnkgZ2l2aW5nIGl0IGEgZmlsZVxuICogcG9zaXRpb24gaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UuXG4gKlxuICogVGhlIG9ubHkgcGFyYW1ldGVyIGlzIHRoZSByYXcgc291cmNlIG1hcCAoZWl0aGVyIGFzIGEgSlNPTiBzdHJpbmcsIG9yXG4gKiBhbHJlYWR5IHBhcnNlZCB0byBhbiBvYmplY3QpLiBBY2NvcmRpbmcgdG8gdGhlIHNwZWMsIHNvdXJjZSBtYXBzIGhhdmUgdGhlXG4gKiBmb2xsb3dpbmcgYXR0cmlidXRlczpcbiAqXG4gKiAgIC0gdmVyc2lvbjogV2hpY2ggdmVyc2lvbiBvZiB0aGUgc291cmNlIG1hcCBzcGVjIHRoaXMgbWFwIGlzIGZvbGxvd2luZy5cbiAqICAgLSBzb3VyY2VzOiBBbiBhcnJheSBvZiBVUkxzIHRvIHRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZXMuXG4gKiAgIC0gbmFtZXM6IEFuIGFycmF5IG9mIGlkZW50aWZpZXJzIHdoaWNoIGNhbiBiZSByZWZlcnJlbmNlZCBieSBpbmRpdmlkdWFsIG1hcHBpbmdzLlxuICogICAtIHNvdXJjZVJvb3Q6IE9wdGlvbmFsLiBUaGUgVVJMIHJvb3QgZnJvbSB3aGljaCBhbGwgc291cmNlcyBhcmUgcmVsYXRpdmUuXG4gKiAgIC0gc291cmNlc0NvbnRlbnQ6IE9wdGlvbmFsLiBBbiBhcnJheSBvZiBjb250ZW50cyBvZiB0aGUgb3JpZ2luYWwgc291cmNlIGZpbGVzLlxuICogICAtIG1hcHBpbmdzOiBBIHN0cmluZyBvZiBiYXNlNjQgVkxRcyB3aGljaCBjb250YWluIHRoZSBhY3R1YWwgbWFwcGluZ3MuXG4gKiAgIC0gZmlsZTogT3B0aW9uYWwuIFRoZSBnZW5lcmF0ZWQgZmlsZSB0aGlzIHNvdXJjZSBtYXAgaXMgYXNzb2NpYXRlZCB3aXRoLlxuICpcbiAqIEhlcmUgaXMgYW4gZXhhbXBsZSBzb3VyY2UgbWFwLCB0YWtlbiBmcm9tIHRoZSBzb3VyY2UgbWFwIHNwZWNbMF06XG4gKlxuICogICAgIHtcbiAqICAgICAgIHZlcnNpb24gOiAzLFxuICogICAgICAgZmlsZTogXCJvdXQuanNcIixcbiAqICAgICAgIHNvdXJjZVJvb3QgOiBcIlwiLFxuICogICAgICAgc291cmNlczogW1wiZm9vLmpzXCIsIFwiYmFyLmpzXCJdLFxuICogICAgICAgbmFtZXM6IFtcInNyY1wiLCBcIm1hcHNcIiwgXCJhcmVcIiwgXCJmdW5cIl0sXG4gKiAgICAgICBtYXBwaW5nczogXCJBQSxBQjs7QUJDREU7XCJcbiAqICAgICB9XG4gKlxuICogWzBdOiBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzFVMVJHQWVoUXdSeXBVVG92RjFLUmxwaU9GemUwYi1fMmdjNmZBSDBLWTBrL2VkaXQ/cGxpPTEjXG4gKi9cbmZ1bmN0aW9uIEJhc2ljU291cmNlTWFwQ29uc3VtZXIoYVNvdXJjZU1hcCkge1xuICB2YXIgc291cmNlTWFwID0gYVNvdXJjZU1hcDtcbiAgaWYgKHR5cGVvZiBhU291cmNlTWFwID09PSAnc3RyaW5nJykge1xuICAgIHNvdXJjZU1hcCA9IEpTT04ucGFyc2UoYVNvdXJjZU1hcC5yZXBsYWNlKC9eXFwpXFxdXFx9Jy8sICcnKSk7XG4gIH1cblxuICB2YXIgdmVyc2lvbiA9IHV0aWwuZ2V0QXJnKHNvdXJjZU1hcCwgJ3ZlcnNpb24nKTtcbiAgdmFyIHNvdXJjZXMgPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsICdzb3VyY2VzJyk7XG4gIC8vIFNhc3MgMy4zIGxlYXZlcyBvdXQgdGhlICduYW1lcycgYXJyYXksIHNvIHdlIGRldmlhdGUgZnJvbSB0aGUgc3BlYyAod2hpY2hcbiAgLy8gcmVxdWlyZXMgdGhlIGFycmF5KSB0byBwbGF5IG5pY2UgaGVyZS5cbiAgdmFyIG5hbWVzID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCAnbmFtZXMnLCBbXSk7XG4gIHZhciBzb3VyY2VSb290ID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCAnc291cmNlUm9vdCcsIG51bGwpO1xuICB2YXIgc291cmNlc0NvbnRlbnQgPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsICdzb3VyY2VzQ29udGVudCcsIG51bGwpO1xuICB2YXIgbWFwcGluZ3MgPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsICdtYXBwaW5ncycpO1xuICB2YXIgZmlsZSA9IHV0aWwuZ2V0QXJnKHNvdXJjZU1hcCwgJ2ZpbGUnLCBudWxsKTtcblxuICAvLyBPbmNlIGFnYWluLCBTYXNzIGRldmlhdGVzIGZyb20gdGhlIHNwZWMgYW5kIHN1cHBsaWVzIHRoZSB2ZXJzaW9uIGFzIGFcbiAgLy8gc3RyaW5nIHJhdGhlciB0aGFuIGEgbnVtYmVyLCBzbyB3ZSB1c2UgbG9vc2UgZXF1YWxpdHkgY2hlY2tpbmcgaGVyZS5cbiAgaWYgKHZlcnNpb24gIT0gdGhpcy5fdmVyc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgdmVyc2lvbjogJyArIHZlcnNpb24pO1xuICB9XG5cbiAgc291cmNlcyA9IHNvdXJjZXNcbiAgICAubWFwKFN0cmluZylcbiAgICAvLyBTb21lIHNvdXJjZSBtYXBzIHByb2R1Y2UgcmVsYXRpdmUgc291cmNlIHBhdGhzIGxpa2UgXCIuL2Zvby5qc1wiIGluc3RlYWQgb2ZcbiAgICAvLyBcImZvby5qc1wiLiAgTm9ybWFsaXplIHRoZXNlIGZpcnN0IHNvIHRoYXQgZnV0dXJlIGNvbXBhcmlzb25zIHdpbGwgc3VjY2VlZC5cbiAgICAvLyBTZWUgYnVnemlsLmxhLzEwOTA3NjguXG4gICAgLm1hcCh1dGlsLm5vcm1hbGl6ZSlcbiAgICAvLyBBbHdheXMgZW5zdXJlIHRoYXQgYWJzb2x1dGUgc291cmNlcyBhcmUgaW50ZXJuYWxseSBzdG9yZWQgcmVsYXRpdmUgdG9cbiAgICAvLyB0aGUgc291cmNlIHJvb3QsIGlmIHRoZSBzb3VyY2Ugcm9vdCBpcyBhYnNvbHV0ZS4gTm90IGRvaW5nIHRoaXMgd291bGRcbiAgICAvLyBiZSBwYXJ0aWN1bGFybHkgcHJvYmxlbWF0aWMgd2hlbiB0aGUgc291cmNlIHJvb3QgaXMgYSBwcmVmaXggb2YgdGhlXG4gICAgLy8gc291cmNlICh2YWxpZCwgYnV0IHdoeT8/KS4gU2VlIGdpdGh1YiBpc3N1ZSAjMTk5IGFuZCBidWd6aWwubGEvMTE4ODk4Mi5cbiAgICAubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIHJldHVybiBzb3VyY2VSb290ICYmIHV0aWwuaXNBYnNvbHV0ZShzb3VyY2VSb290KSAmJiB1dGlsLmlzQWJzb2x1dGUoc291cmNlKVxuICAgICAgICA/IHV0aWwucmVsYXRpdmUoc291cmNlUm9vdCwgc291cmNlKVxuICAgICAgICA6IHNvdXJjZTtcbiAgICB9KTtcblxuICAvLyBQYXNzIGB0cnVlYCBiZWxvdyB0byBhbGxvdyBkdXBsaWNhdGUgbmFtZXMgYW5kIHNvdXJjZXMuIFdoaWxlIHNvdXJjZSBtYXBzXG4gIC8vIGFyZSBpbnRlbmRlZCB0byBiZSBjb21wcmVzc2VkIGFuZCBkZWR1cGxpY2F0ZWQsIHRoZSBUeXBlU2NyaXB0IGNvbXBpbGVyXG4gIC8vIHNvbWV0aW1lcyBnZW5lcmF0ZXMgc291cmNlIG1hcHMgd2l0aCBkdXBsaWNhdGVzIGluIHRoZW0uIFNlZSBHaXRodWIgaXNzdWVcbiAgLy8gIzcyIGFuZCBidWd6aWwubGEvODg5NDkyLlxuICB0aGlzLl9uYW1lcyA9IEFycmF5U2V0LmZyb21BcnJheShuYW1lcy5tYXAoU3RyaW5nKSwgdHJ1ZSk7XG4gIHRoaXMuX3NvdXJjZXMgPSBBcnJheVNldC5mcm9tQXJyYXkoc291cmNlcywgdHJ1ZSk7XG5cbiAgdGhpcy5zb3VyY2VSb290ID0gc291cmNlUm9vdDtcbiAgdGhpcy5zb3VyY2VzQ29udGVudCA9IHNvdXJjZXNDb250ZW50O1xuICB0aGlzLl9tYXBwaW5ncyA9IG1hcHBpbmdzO1xuICB0aGlzLmZpbGUgPSBmaWxlO1xufVxuXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlKTtcbkJhc2ljU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLmNvbnN1bWVyID0gU291cmNlTWFwQ29uc3VtZXI7XG5cbi8qKlxuICogQ3JlYXRlIGEgQmFzaWNTb3VyY2VNYXBDb25zdW1lciBmcm9tIGEgU291cmNlTWFwR2VuZXJhdG9yLlxuICpcbiAqIEBwYXJhbSBTb3VyY2VNYXBHZW5lcmF0b3IgYVNvdXJjZU1hcFxuICogICAgICAgIFRoZSBzb3VyY2UgbWFwIHRoYXQgd2lsbCBiZSBjb25zdW1lZC5cbiAqIEByZXR1cm5zIEJhc2ljU291cmNlTWFwQ29uc3VtZXJcbiAqL1xuQmFzaWNTb3VyY2VNYXBDb25zdW1lci5mcm9tU291cmNlTWFwID1cbiAgZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXJfZnJvbVNvdXJjZU1hcChhU291cmNlTWFwKSB7XG4gICAgdmFyIHNtYyA9IE9iamVjdC5jcmVhdGUoQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUpO1xuXG4gICAgdmFyIG5hbWVzID0gc21jLl9uYW1lcyA9IEFycmF5U2V0LmZyb21BcnJheShhU291cmNlTWFwLl9uYW1lcy50b0FycmF5KCksIHRydWUpO1xuICAgIHZhciBzb3VyY2VzID0gc21jLl9zb3VyY2VzID0gQXJyYXlTZXQuZnJvbUFycmF5KGFTb3VyY2VNYXAuX3NvdXJjZXMudG9BcnJheSgpLCB0cnVlKTtcbiAgICBzbWMuc291cmNlUm9vdCA9IGFTb3VyY2VNYXAuX3NvdXJjZVJvb3Q7XG4gICAgc21jLnNvdXJjZXNDb250ZW50ID0gYVNvdXJjZU1hcC5fZ2VuZXJhdGVTb3VyY2VzQ29udGVudChzbWMuX3NvdXJjZXMudG9BcnJheSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc21jLnNvdXJjZVJvb3QpO1xuICAgIHNtYy5maWxlID0gYVNvdXJjZU1hcC5fZmlsZTtcblxuICAgIC8vIEJlY2F1c2Ugd2UgYXJlIG1vZGlmeWluZyB0aGUgZW50cmllcyAoYnkgY29udmVydGluZyBzdHJpbmcgc291cmNlcyBhbmRcbiAgICAvLyBuYW1lcyB0byBpbmRpY2VzIGludG8gdGhlIHNvdXJjZXMgYW5kIG5hbWVzIEFycmF5U2V0cyksIHdlIGhhdmUgdG8gbWFrZVxuICAgIC8vIGEgY29weSBvZiB0aGUgZW50cnkgb3IgZWxzZSBiYWQgdGhpbmdzIGhhcHBlbi4gU2hhcmVkIG11dGFibGUgc3RhdGVcbiAgICAvLyBzdHJpa2VzIGFnYWluISBTZWUgZ2l0aHViIGlzc3VlICMxOTEuXG5cbiAgICB2YXIgZ2VuZXJhdGVkTWFwcGluZ3MgPSBhU291cmNlTWFwLl9tYXBwaW5ncy50b0FycmF5KCkuc2xpY2UoKTtcbiAgICB2YXIgZGVzdEdlbmVyYXRlZE1hcHBpbmdzID0gc21jLl9fZ2VuZXJhdGVkTWFwcGluZ3MgPSBbXTtcbiAgICB2YXIgZGVzdE9yaWdpbmFsTWFwcGluZ3MgPSBzbWMuX19vcmlnaW5hbE1hcHBpbmdzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZ2VuZXJhdGVkTWFwcGluZ3MubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzcmNNYXBwaW5nID0gZ2VuZXJhdGVkTWFwcGluZ3NbaV07XG4gICAgICB2YXIgZGVzdE1hcHBpbmcgPSBuZXcgTWFwcGluZztcbiAgICAgIGRlc3RNYXBwaW5nLmdlbmVyYXRlZExpbmUgPSBzcmNNYXBwaW5nLmdlbmVyYXRlZExpbmU7XG4gICAgICBkZXN0TWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4gPSBzcmNNYXBwaW5nLmdlbmVyYXRlZENvbHVtbjtcblxuICAgICAgaWYgKHNyY01hcHBpbmcuc291cmNlKSB7XG4gICAgICAgIGRlc3RNYXBwaW5nLnNvdXJjZSA9IHNvdXJjZXMuaW5kZXhPZihzcmNNYXBwaW5nLnNvdXJjZSk7XG4gICAgICAgIGRlc3RNYXBwaW5nLm9yaWdpbmFsTGluZSA9IHNyY01hcHBpbmcub3JpZ2luYWxMaW5lO1xuICAgICAgICBkZXN0TWFwcGluZy5vcmlnaW5hbENvbHVtbiA9IHNyY01hcHBpbmcub3JpZ2luYWxDb2x1bW47XG5cbiAgICAgICAgaWYgKHNyY01hcHBpbmcubmFtZSkge1xuICAgICAgICAgIGRlc3RNYXBwaW5nLm5hbWUgPSBuYW1lcy5pbmRleE9mKHNyY01hcHBpbmcubmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBkZXN0T3JpZ2luYWxNYXBwaW5ncy5wdXNoKGRlc3RNYXBwaW5nKTtcbiAgICAgIH1cblxuICAgICAgZGVzdEdlbmVyYXRlZE1hcHBpbmdzLnB1c2goZGVzdE1hcHBpbmcpO1xuICAgIH1cblxuICAgIHF1aWNrU29ydChzbWMuX19vcmlnaW5hbE1hcHBpbmdzLCB1dGlsLmNvbXBhcmVCeU9yaWdpbmFsUG9zaXRpb25zKTtcblxuICAgIHJldHVybiBzbWM7XG4gIH07XG5cbi8qKlxuICogVGhlIHZlcnNpb24gb2YgdGhlIHNvdXJjZSBtYXBwaW5nIHNwZWMgdGhhdCB3ZSBhcmUgY29uc3VtaW5nLlxuICovXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fdmVyc2lvbiA9IDM7XG5cbi8qKlxuICogVGhlIGxpc3Qgb2Ygb3JpZ2luYWwgc291cmNlcy5cbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KEJhc2ljU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLCAnc291cmNlcycsIHtcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NvdXJjZXMudG9BcnJheSgpLm1hcChmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIHRoaXMuc291cmNlUm9vdCAhPSBudWxsID8gdXRpbC5qb2luKHRoaXMuc291cmNlUm9vdCwgcykgOiBzO1xuICAgIH0sIHRoaXMpO1xuICB9XG59KTtcblxuLyoqXG4gKiBQcm92aWRlIHRoZSBKSVQgd2l0aCBhIG5pY2Ugc2hhcGUgLyBoaWRkZW4gY2xhc3MuXG4gKi9cbmZ1bmN0aW9uIE1hcHBpbmcoKSB7XG4gIHRoaXMuZ2VuZXJhdGVkTGluZSA9IDA7XG4gIHRoaXMuZ2VuZXJhdGVkQ29sdW1uID0gMDtcbiAgdGhpcy5zb3VyY2UgPSBudWxsO1xuICB0aGlzLm9yaWdpbmFsTGluZSA9IG51bGw7XG4gIHRoaXMub3JpZ2luYWxDb2x1bW4gPSBudWxsO1xuICB0aGlzLm5hbWUgPSBudWxsO1xufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBtYXBwaW5ncyBpbiBhIHN0cmluZyBpbiB0byBhIGRhdGEgc3RydWN0dXJlIHdoaWNoIHdlIGNhbiBlYXNpbHlcbiAqIHF1ZXJ5ICh0aGUgb3JkZXJlZCBhcnJheXMgaW4gdGhlIGB0aGlzLl9fZ2VuZXJhdGVkTWFwcGluZ3NgIGFuZFxuICogYHRoaXMuX19vcmlnaW5hbE1hcHBpbmdzYCBwcm9wZXJ0aWVzKS5cbiAqL1xuQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuX3BhcnNlTWFwcGluZ3MgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBDb25zdW1lcl9wYXJzZU1hcHBpbmdzKGFTdHIsIGFTb3VyY2VSb290KSB7XG4gICAgdmFyIGdlbmVyYXRlZExpbmUgPSAxO1xuICAgIHZhciBwcmV2aW91c0dlbmVyYXRlZENvbHVtbiA9IDA7XG4gICAgdmFyIHByZXZpb3VzT3JpZ2luYWxMaW5lID0gMDtcbiAgICB2YXIgcHJldmlvdXNPcmlnaW5hbENvbHVtbiA9IDA7XG4gICAgdmFyIHByZXZpb3VzU291cmNlID0gMDtcbiAgICB2YXIgcHJldmlvdXNOYW1lID0gMDtcbiAgICB2YXIgbGVuZ3RoID0gYVN0ci5sZW5ndGg7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgY2FjaGVkU2VnbWVudHMgPSB7fTtcbiAgICB2YXIgdGVtcCA9IHt9O1xuICAgIHZhciBvcmlnaW5hbE1hcHBpbmdzID0gW107XG4gICAgdmFyIGdlbmVyYXRlZE1hcHBpbmdzID0gW107XG4gICAgdmFyIG1hcHBpbmcsIHN0ciwgc2VnbWVudCwgZW5kLCB2YWx1ZTtcblxuICAgIHdoaWxlIChpbmRleCA8IGxlbmd0aCkge1xuICAgICAgaWYgKGFTdHIuY2hhckF0KGluZGV4KSA9PT0gJzsnKSB7XG4gICAgICAgIGdlbmVyYXRlZExpbmUrKztcbiAgICAgICAgaW5kZXgrKztcbiAgICAgICAgcHJldmlvdXNHZW5lcmF0ZWRDb2x1bW4gPSAwO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoYVN0ci5jaGFyQXQoaW5kZXgpID09PSAnLCcpIHtcbiAgICAgICAgaW5kZXgrKztcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBtYXBwaW5nID0gbmV3IE1hcHBpbmcoKTtcbiAgICAgICAgbWFwcGluZy5nZW5lcmF0ZWRMaW5lID0gZ2VuZXJhdGVkTGluZTtcblxuICAgICAgICAvLyBCZWNhdXNlIGVhY2ggb2Zmc2V0IGlzIGVuY29kZWQgcmVsYXRpdmUgdG8gdGhlIHByZXZpb3VzIG9uZSxcbiAgICAgICAgLy8gbWFueSBzZWdtZW50cyBvZnRlbiBoYXZlIHRoZSBzYW1lIGVuY29kaW5nLiBXZSBjYW4gZXhwbG9pdCB0aGlzXG4gICAgICAgIC8vIGZhY3QgYnkgY2FjaGluZyB0aGUgcGFyc2VkIHZhcmlhYmxlIGxlbmd0aCBmaWVsZHMgb2YgZWFjaCBzZWdtZW50LFxuICAgICAgICAvLyBhbGxvd2luZyB1cyB0byBhdm9pZCBhIHNlY29uZCBwYXJzZSBpZiB3ZSBlbmNvdW50ZXIgdGhlIHNhbWVcbiAgICAgICAgLy8gc2VnbWVudCBhZ2Fpbi5cbiAgICAgICAgZm9yIChlbmQgPSBpbmRleDsgZW5kIDwgbGVuZ3RoOyBlbmQrKykge1xuICAgICAgICAgIGlmICh0aGlzLl9jaGFySXNNYXBwaW5nU2VwYXJhdG9yKGFTdHIsIGVuZCkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdHIgPSBhU3RyLnNsaWNlKGluZGV4LCBlbmQpO1xuXG4gICAgICAgIHNlZ21lbnQgPSBjYWNoZWRTZWdtZW50c1tzdHJdO1xuICAgICAgICBpZiAoc2VnbWVudCkge1xuICAgICAgICAgIGluZGV4ICs9IHN0ci5sZW5ndGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VnbWVudCA9IFtdO1xuICAgICAgICAgIHdoaWxlIChpbmRleCA8IGVuZCkge1xuICAgICAgICAgICAgYmFzZTY0VkxRLmRlY29kZShhU3RyLCBpbmRleCwgdGVtcCk7XG4gICAgICAgICAgICB2YWx1ZSA9IHRlbXAudmFsdWU7XG4gICAgICAgICAgICBpbmRleCA9IHRlbXAucmVzdDtcbiAgICAgICAgICAgIHNlZ21lbnQucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlZ21lbnQubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZvdW5kIGEgc291cmNlLCBidXQgbm8gbGluZSBhbmQgY29sdW1uJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlZ21lbnQubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZvdW5kIGEgc291cmNlIGFuZCBsaW5lLCBidXQgbm8gY29sdW1uJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2FjaGVkU2VnbWVudHNbc3RyXSA9IHNlZ21lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZW5lcmF0ZWQgY29sdW1uLlxuICAgICAgICBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbiA9IHByZXZpb3VzR2VuZXJhdGVkQ29sdW1uICsgc2VnbWVudFswXTtcbiAgICAgICAgcHJldmlvdXNHZW5lcmF0ZWRDb2x1bW4gPSBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbjtcblxuICAgICAgICBpZiAoc2VnbWVudC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgLy8gT3JpZ2luYWwgc291cmNlLlxuICAgICAgICAgIG1hcHBpbmcuc291cmNlID0gcHJldmlvdXNTb3VyY2UgKyBzZWdtZW50WzFdO1xuICAgICAgICAgIHByZXZpb3VzU291cmNlICs9IHNlZ21lbnRbMV07XG5cbiAgICAgICAgICAvLyBPcmlnaW5hbCBsaW5lLlxuICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWxMaW5lID0gcHJldmlvdXNPcmlnaW5hbExpbmUgKyBzZWdtZW50WzJdO1xuICAgICAgICAgIHByZXZpb3VzT3JpZ2luYWxMaW5lID0gbWFwcGluZy5vcmlnaW5hbExpbmU7XG4gICAgICAgICAgLy8gTGluZXMgYXJlIHN0b3JlZCAwLWJhc2VkXG4gICAgICAgICAgbWFwcGluZy5vcmlnaW5hbExpbmUgKz0gMTtcblxuICAgICAgICAgIC8vIE9yaWdpbmFsIGNvbHVtbi5cbiAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uID0gcHJldmlvdXNPcmlnaW5hbENvbHVtbiArIHNlZ21lbnRbM107XG4gICAgICAgICAgcHJldmlvdXNPcmlnaW5hbENvbHVtbiA9IG1hcHBpbmcub3JpZ2luYWxDb2x1bW47XG5cbiAgICAgICAgICBpZiAoc2VnbWVudC5sZW5ndGggPiA0KSB7XG4gICAgICAgICAgICAvLyBPcmlnaW5hbCBuYW1lLlxuICAgICAgICAgICAgbWFwcGluZy5uYW1lID0gcHJldmlvdXNOYW1lICsgc2VnbWVudFs0XTtcbiAgICAgICAgICAgIHByZXZpb3VzTmFtZSArPSBzZWdtZW50WzRdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGdlbmVyYXRlZE1hcHBpbmdzLnB1c2gobWFwcGluZyk7XG4gICAgICAgIGlmICh0eXBlb2YgbWFwcGluZy5vcmlnaW5hbExpbmUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgb3JpZ2luYWxNYXBwaW5ncy5wdXNoKG1hcHBpbmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcXVpY2tTb3J0KGdlbmVyYXRlZE1hcHBpbmdzLCB1dGlsLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0RlZmxhdGVkKTtcbiAgICB0aGlzLl9fZ2VuZXJhdGVkTWFwcGluZ3MgPSBnZW5lcmF0ZWRNYXBwaW5ncztcblxuICAgIHF1aWNrU29ydChvcmlnaW5hbE1hcHBpbmdzLCB1dGlsLmNvbXBhcmVCeU9yaWdpbmFsUG9zaXRpb25zKTtcbiAgICB0aGlzLl9fb3JpZ2luYWxNYXBwaW5ncyA9IG9yaWdpbmFsTWFwcGluZ3M7XG4gIH07XG5cbi8qKlxuICogRmluZCB0aGUgbWFwcGluZyB0aGF0IGJlc3QgbWF0Y2hlcyB0aGUgaHlwb3RoZXRpY2FsIFwibmVlZGxlXCIgbWFwcGluZyB0aGF0XG4gKiB3ZSBhcmUgc2VhcmNoaW5nIGZvciBpbiB0aGUgZ2l2ZW4gXCJoYXlzdGFja1wiIG9mIG1hcHBpbmdzLlxuICovXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fZmluZE1hcHBpbmcgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBDb25zdW1lcl9maW5kTWFwcGluZyhhTmVlZGxlLCBhTWFwcGluZ3MsIGFMaW5lTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYUNvbHVtbk5hbWUsIGFDb21wYXJhdG9yLCBhQmlhcykge1xuICAgIC8vIFRvIHJldHVybiB0aGUgcG9zaXRpb24gd2UgYXJlIHNlYXJjaGluZyBmb3IsIHdlIG11c3QgZmlyc3QgZmluZCB0aGVcbiAgICAvLyBtYXBwaW5nIGZvciB0aGUgZ2l2ZW4gcG9zaXRpb24gYW5kIHRoZW4gcmV0dXJuIHRoZSBvcHBvc2l0ZSBwb3NpdGlvbiBpdFxuICAgIC8vIHBvaW50cyB0by4gQmVjYXVzZSB0aGUgbWFwcGluZ3MgYXJlIHNvcnRlZCwgd2UgY2FuIHVzZSBiaW5hcnkgc2VhcmNoIHRvXG4gICAgLy8gZmluZCB0aGUgYmVzdCBtYXBwaW5nLlxuXG4gICAgaWYgKGFOZWVkbGVbYUxpbmVOYW1lXSA8PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdMaW5lIG11c3QgYmUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIDEsIGdvdCAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgYU5lZWRsZVthTGluZU5hbWVdKTtcbiAgICB9XG4gICAgaWYgKGFOZWVkbGVbYUNvbHVtbk5hbWVdIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ29sdW1uIG11c3QgYmUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIDAsIGdvdCAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgYU5lZWRsZVthQ29sdW1uTmFtZV0pO1xuICAgIH1cblxuICAgIHJldHVybiBiaW5hcnlTZWFyY2guc2VhcmNoKGFOZWVkbGUsIGFNYXBwaW5ncywgYUNvbXBhcmF0b3IsIGFCaWFzKTtcbiAgfTtcblxuLyoqXG4gKiBDb21wdXRlIHRoZSBsYXN0IGNvbHVtbiBmb3IgZWFjaCBnZW5lcmF0ZWQgbWFwcGluZy4gVGhlIGxhc3QgY29sdW1uIGlzXG4gKiBpbmNsdXNpdmUuXG4gKi9cbkJhc2ljU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLmNvbXB1dGVDb2x1bW5TcGFucyA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcENvbnN1bWVyX2NvbXB1dGVDb2x1bW5TcGFucygpIHtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5fZ2VuZXJhdGVkTWFwcGluZ3MubGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICB2YXIgbWFwcGluZyA9IHRoaXMuX2dlbmVyYXRlZE1hcHBpbmdzW2luZGV4XTtcblxuICAgICAgLy8gTWFwcGluZ3MgZG8gbm90IGNvbnRhaW4gYSBmaWVsZCBmb3IgdGhlIGxhc3QgZ2VuZXJhdGVkIGNvbHVtbnQuIFdlXG4gICAgICAvLyBjYW4gY29tZSB1cCB3aXRoIGFuIG9wdGltaXN0aWMgZXN0aW1hdGUsIGhvd2V2ZXIsIGJ5IGFzc3VtaW5nIHRoYXRcbiAgICAgIC8vIG1hcHBpbmdzIGFyZSBjb250aWd1b3VzIChpLmUuIGdpdmVuIHR3byBjb25zZWN1dGl2ZSBtYXBwaW5ncywgdGhlXG4gICAgICAvLyBmaXJzdCBtYXBwaW5nIGVuZHMgd2hlcmUgdGhlIHNlY29uZCBvbmUgc3RhcnRzKS5cbiAgICAgIGlmIChpbmRleCArIDEgPCB0aGlzLl9nZW5lcmF0ZWRNYXBwaW5ncy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIG5leHRNYXBwaW5nID0gdGhpcy5fZ2VuZXJhdGVkTWFwcGluZ3NbaW5kZXggKyAxXTtcblxuICAgICAgICBpZiAobWFwcGluZy5nZW5lcmF0ZWRMaW5lID09PSBuZXh0TWFwcGluZy5nZW5lcmF0ZWRMaW5lKSB7XG4gICAgICAgICAgbWFwcGluZy5sYXN0R2VuZXJhdGVkQ29sdW1uID0gbmV4dE1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uIC0gMTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgbGFzdCBtYXBwaW5nIGZvciBlYWNoIGxpbmUgc3BhbnMgdGhlIGVudGlyZSBsaW5lLlxuICAgICAgbWFwcGluZy5sYXN0R2VuZXJhdGVkQ29sdW1uID0gSW5maW5pdHk7XG4gICAgfVxuICB9O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG9yaWdpbmFsIHNvdXJjZSwgbGluZSwgYW5kIGNvbHVtbiBpbmZvcm1hdGlvbiBmb3IgdGhlIGdlbmVyYXRlZFxuICogc291cmNlJ3MgbGluZSBhbmQgY29sdW1uIHBvc2l0aW9ucyBwcm92aWRlZC4gVGhlIG9ubHkgYXJndW1lbnQgaXMgYW4gb2JqZWN0XG4gKiB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlLlxuICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UuXG4gKiAgIC0gYmlhczogRWl0aGVyICdTb3VyY2VNYXBDb25zdW1lci5HUkVBVEVTVF9MT1dFUl9CT1VORCcgb3JcbiAqICAgICAnU291cmNlTWFwQ29uc3VtZXIuTEVBU1RfVVBQRVJfQk9VTkQnLiBTcGVjaWZpZXMgd2hldGhlciB0byByZXR1cm4gdGhlXG4gKiAgICAgY2xvc2VzdCBlbGVtZW50IHRoYXQgaXMgc21hbGxlciB0aGFuIG9yIGdyZWF0ZXIgdGhhbiB0aGUgb25lIHdlIGFyZVxuICogICAgIHNlYXJjaGluZyBmb3IsIHJlc3BlY3RpdmVseSwgaWYgdGhlIGV4YWN0IGVsZW1lbnQgY2Fubm90IGJlIGZvdW5kLlxuICogICAgIERlZmF1bHRzIHRvICdTb3VyY2VNYXBDb25zdW1lci5HUkVBVEVTVF9MT1dFUl9CT1VORCcuXG4gKlxuICogYW5kIGFuIG9iamVjdCBpcyByZXR1cm5lZCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gc291cmNlOiBUaGUgb3JpZ2luYWwgc291cmNlIGZpbGUsIG9yIG51bGwuXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UsIG9yIG51bGwuXG4gKiAgIC0gY29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlLCBvciBudWxsLlxuICogICAtIG5hbWU6IFRoZSBvcmlnaW5hbCBpZGVudGlmaWVyLCBvciBudWxsLlxuICovXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5vcmlnaW5hbFBvc2l0aW9uRm9yID1cbiAgZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXJfb3JpZ2luYWxQb3NpdGlvbkZvcihhQXJncykge1xuICAgIHZhciBuZWVkbGUgPSB7XG4gICAgICBnZW5lcmF0ZWRMaW5lOiB1dGlsLmdldEFyZyhhQXJncywgJ2xpbmUnKSxcbiAgICAgIGdlbmVyYXRlZENvbHVtbjogdXRpbC5nZXRBcmcoYUFyZ3MsICdjb2x1bW4nKVxuICAgIH07XG5cbiAgICB2YXIgaW5kZXggPSB0aGlzLl9maW5kTWFwcGluZyhcbiAgICAgIG5lZWRsZSxcbiAgICAgIHRoaXMuX2dlbmVyYXRlZE1hcHBpbmdzLFxuICAgICAgXCJnZW5lcmF0ZWRMaW5lXCIsXG4gICAgICBcImdlbmVyYXRlZENvbHVtblwiLFxuICAgICAgdXRpbC5jb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNEZWZsYXRlZCxcbiAgICAgIHV0aWwuZ2V0QXJnKGFBcmdzLCAnYmlhcycsIFNvdXJjZU1hcENvbnN1bWVyLkdSRUFURVNUX0xPV0VSX0JPVU5EKVxuICAgICk7XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgdmFyIG1hcHBpbmcgPSB0aGlzLl9nZW5lcmF0ZWRNYXBwaW5nc1tpbmRleF07XG5cbiAgICAgIGlmIChtYXBwaW5nLmdlbmVyYXRlZExpbmUgPT09IG5lZWRsZS5nZW5lcmF0ZWRMaW5lKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSB1dGlsLmdldEFyZyhtYXBwaW5nLCAnc291cmNlJywgbnVsbCk7XG4gICAgICAgIGlmIChzb3VyY2UgIT09IG51bGwpIHtcbiAgICAgICAgICBzb3VyY2UgPSB0aGlzLl9zb3VyY2VzLmF0KHNvdXJjZSk7XG4gICAgICAgICAgaWYgKHRoaXMuc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICAgICAgICBzb3VyY2UgPSB1dGlsLmpvaW4odGhpcy5zb3VyY2VSb290LCBzb3VyY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgbmFtZSA9IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICduYW1lJywgbnVsbCk7XG4gICAgICAgIGlmIChuYW1lICE9PSBudWxsKSB7XG4gICAgICAgICAgbmFtZSA9IHRoaXMuX25hbWVzLmF0KG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgbGluZTogdXRpbC5nZXRBcmcobWFwcGluZywgJ29yaWdpbmFsTGluZScsIG51bGwpLFxuICAgICAgICAgIGNvbHVtbjogdXRpbC5nZXRBcmcobWFwcGluZywgJ29yaWdpbmFsQ29sdW1uJywgbnVsbCksXG4gICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzb3VyY2U6IG51bGwsXG4gICAgICBsaW5lOiBudWxsLFxuICAgICAgY29sdW1uOiBudWxsLFxuICAgICAgbmFtZTogbnVsbFxuICAgIH07XG4gIH07XG5cbi8qKlxuICogUmV0dXJuIHRydWUgaWYgd2UgaGF2ZSB0aGUgc291cmNlIGNvbnRlbnQgZm9yIGV2ZXJ5IHNvdXJjZSBpbiB0aGUgc291cmNlXG4gKiBtYXAsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuaGFzQ29udGVudHNPZkFsbFNvdXJjZXMgPVxuICBmdW5jdGlvbiBCYXNpY1NvdXJjZU1hcENvbnN1bWVyX2hhc0NvbnRlbnRzT2ZBbGxTb3VyY2VzKCkge1xuICAgIGlmICghdGhpcy5zb3VyY2VzQ29udGVudCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zb3VyY2VzQ29udGVudC5sZW5ndGggPj0gdGhpcy5fc291cmNlcy5zaXplKCkgJiZcbiAgICAgICF0aGlzLnNvdXJjZXNDb250ZW50LnNvbWUoZnVuY3Rpb24gKHNjKSB7IHJldHVybiBzYyA9PSBudWxsOyB9KTtcbiAgfTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBvcmlnaW5hbCBzb3VyY2UgY29udGVudC4gVGhlIG9ubHkgYXJndW1lbnQgaXMgdGhlIHVybCBvZiB0aGVcbiAqIG9yaWdpbmFsIHNvdXJjZSBmaWxlLiBSZXR1cm5zIG51bGwgaWYgbm8gb3JpZ2luYWwgc291cmNlIGNvbnRlbnQgaXNcbiAqIGF2YWlsYWJsZS5cbiAqL1xuQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuc291cmNlQ29udGVudEZvciA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcENvbnN1bWVyX3NvdXJjZUNvbnRlbnRGb3IoYVNvdXJjZSwgbnVsbE9uTWlzc2luZykge1xuICAgIGlmICghdGhpcy5zb3VyY2VzQ29udGVudCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICBhU291cmNlID0gdXRpbC5yZWxhdGl2ZSh0aGlzLnNvdXJjZVJvb3QsIGFTb3VyY2UpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9zb3VyY2VzLmhhcyhhU291cmNlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc291cmNlc0NvbnRlbnRbdGhpcy5fc291cmNlcy5pbmRleE9mKGFTb3VyY2UpXTtcbiAgICB9XG5cbiAgICB2YXIgdXJsO1xuICAgIGlmICh0aGlzLnNvdXJjZVJvb3QgIT0gbnVsbFxuICAgICAgICAmJiAodXJsID0gdXRpbC51cmxQYXJzZSh0aGlzLnNvdXJjZVJvb3QpKSkge1xuICAgICAgLy8gWFhYOiBmaWxlOi8vIFVSSXMgYW5kIGFic29sdXRlIHBhdGhzIGxlYWQgdG8gdW5leHBlY3RlZCBiZWhhdmlvciBmb3JcbiAgICAgIC8vIG1hbnkgdXNlcnMuIFdlIGNhbiBoZWxwIHRoZW0gb3V0IHdoZW4gdGhleSBleHBlY3QgZmlsZTovLyBVUklzIHRvXG4gICAgICAvLyBiZWhhdmUgbGlrZSBpdCB3b3VsZCBpZiB0aGV5IHdlcmUgcnVubmluZyBhIGxvY2FsIEhUVFAgc2VydmVyLiBTZWVcbiAgICAgIC8vIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTg4NTU5Ny5cbiAgICAgIHZhciBmaWxlVXJpQWJzUGF0aCA9IGFTb3VyY2UucmVwbGFjZSgvXmZpbGU6XFwvXFwvLywgXCJcIik7XG4gICAgICBpZiAodXJsLnNjaGVtZSA9PSBcImZpbGVcIlxuICAgICAgICAgICYmIHRoaXMuX3NvdXJjZXMuaGFzKGZpbGVVcmlBYnNQYXRoKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2VzQ29udGVudFt0aGlzLl9zb3VyY2VzLmluZGV4T2YoZmlsZVVyaUFic1BhdGgpXVxuICAgICAgfVxuXG4gICAgICBpZiAoKCF1cmwucGF0aCB8fCB1cmwucGF0aCA9PSBcIi9cIilcbiAgICAgICAgICAmJiB0aGlzLl9zb3VyY2VzLmhhcyhcIi9cIiArIGFTb3VyY2UpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNvdXJjZXNDb250ZW50W3RoaXMuX3NvdXJjZXMuaW5kZXhPZihcIi9cIiArIGFTb3VyY2UpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgcmVjdXJzaXZlbHkgZnJvbVxuICAgIC8vIEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuc291cmNlQ29udGVudEZvci4gSW4gdGhhdCBjYXNlLCB3ZVxuICAgIC8vIGRvbid0IHdhbnQgdG8gdGhyb3cgaWYgd2UgY2FuJ3QgZmluZCB0aGUgc291cmNlIC0gd2UganVzdCB3YW50IHRvXG4gICAgLy8gcmV0dXJuIG51bGwsIHNvIHdlIHByb3ZpZGUgYSBmbGFnIHRvIGV4aXQgZ3JhY2VmdWxseS5cbiAgICBpZiAobnVsbE9uTWlzc2luZykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdcIicgKyBhU291cmNlICsgJ1wiIGlzIG5vdCBpbiB0aGUgU291cmNlTWFwLicpO1xuICAgIH1cbiAgfTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBnZW5lcmF0ZWQgbGluZSBhbmQgY29sdW1uIGluZm9ybWF0aW9uIGZvciB0aGUgb3JpZ2luYWwgc291cmNlLFxuICogbGluZSwgYW5kIGNvbHVtbiBwb3NpdGlvbnMgcHJvdmlkZWQuIFRoZSBvbmx5IGFyZ3VtZW50IGlzIGFuIG9iamVjdCB3aXRoXG4gKiB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAtIHNvdXJjZTogVGhlIGZpbGVuYW1lIG9mIHRoZSBvcmlnaW5hbCBzb3VyY2UuXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UuXG4gKiAgIC0gY29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlLlxuICogICAtIGJpYXM6IEVpdGhlciAnU291cmNlTWFwQ29uc3VtZXIuR1JFQVRFU1RfTE9XRVJfQk9VTkQnIG9yXG4gKiAgICAgJ1NvdXJjZU1hcENvbnN1bWVyLkxFQVNUX1VQUEVSX0JPVU5EJy4gU3BlY2lmaWVzIHdoZXRoZXIgdG8gcmV0dXJuIHRoZVxuICogICAgIGNsb3Nlc3QgZWxlbWVudCB0aGF0IGlzIHNtYWxsZXIgdGhhbiBvciBncmVhdGVyIHRoYW4gdGhlIG9uZSB3ZSBhcmVcbiAqICAgICBzZWFyY2hpbmcgZm9yLCByZXNwZWN0aXZlbHksIGlmIHRoZSBleGFjdCBlbGVtZW50IGNhbm5vdCBiZSBmb3VuZC5cbiAqICAgICBEZWZhdWx0cyB0byAnU291cmNlTWFwQ29uc3VtZXIuR1JFQVRFU1RfTE9XRVJfQk9VTkQnLlxuICpcbiAqIGFuZCBhbiBvYmplY3QgaXMgcmV0dXJuZWQgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGxpbmU6IFRoZSBsaW5lIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZSwgb3IgbnVsbC5cbiAqICAgLSBjb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlLCBvciBudWxsLlxuICovXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5nZW5lcmF0ZWRQb3NpdGlvbkZvciA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcENvbnN1bWVyX2dlbmVyYXRlZFBvc2l0aW9uRm9yKGFBcmdzKSB7XG4gICAgdmFyIHNvdXJjZSA9IHV0aWwuZ2V0QXJnKGFBcmdzLCAnc291cmNlJyk7XG4gICAgaWYgKHRoaXMuc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICBzb3VyY2UgPSB1dGlsLnJlbGF0aXZlKHRoaXMuc291cmNlUm9vdCwgc291cmNlKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9zb3VyY2VzLmhhcyhzb3VyY2UpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsaW5lOiBudWxsLFxuICAgICAgICBjb2x1bW46IG51bGwsXG4gICAgICAgIGxhc3RDb2x1bW46IG51bGxcbiAgICAgIH07XG4gICAgfVxuICAgIHNvdXJjZSA9IHRoaXMuX3NvdXJjZXMuaW5kZXhPZihzb3VyY2UpO1xuXG4gICAgdmFyIG5lZWRsZSA9IHtcbiAgICAgIHNvdXJjZTogc291cmNlLFxuICAgICAgb3JpZ2luYWxMaW5lOiB1dGlsLmdldEFyZyhhQXJncywgJ2xpbmUnKSxcbiAgICAgIG9yaWdpbmFsQ29sdW1uOiB1dGlsLmdldEFyZyhhQXJncywgJ2NvbHVtbicpXG4gICAgfTtcblxuICAgIHZhciBpbmRleCA9IHRoaXMuX2ZpbmRNYXBwaW5nKFxuICAgICAgbmVlZGxlLFxuICAgICAgdGhpcy5fb3JpZ2luYWxNYXBwaW5ncyxcbiAgICAgIFwib3JpZ2luYWxMaW5lXCIsXG4gICAgICBcIm9yaWdpbmFsQ29sdW1uXCIsXG4gICAgICB1dGlsLmNvbXBhcmVCeU9yaWdpbmFsUG9zaXRpb25zLFxuICAgICAgdXRpbC5nZXRBcmcoYUFyZ3MsICdiaWFzJywgU291cmNlTWFwQ29uc3VtZXIuR1JFQVRFU1RfTE9XRVJfQk9VTkQpXG4gICAgKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB2YXIgbWFwcGluZyA9IHRoaXMuX29yaWdpbmFsTWFwcGluZ3NbaW5kZXhdO1xuXG4gICAgICBpZiAobWFwcGluZy5zb3VyY2UgPT09IG5lZWRsZS5zb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsaW5lOiB1dGlsLmdldEFyZyhtYXBwaW5nLCAnZ2VuZXJhdGVkTGluZScsIG51bGwpLFxuICAgICAgICAgIGNvbHVtbjogdXRpbC5nZXRBcmcobWFwcGluZywgJ2dlbmVyYXRlZENvbHVtbicsIG51bGwpLFxuICAgICAgICAgIGxhc3RDb2x1bW46IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdsYXN0R2VuZXJhdGVkQ29sdW1uJywgbnVsbClcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbGluZTogbnVsbCxcbiAgICAgIGNvbHVtbjogbnVsbCxcbiAgICAgIGxhc3RDb2x1bW46IG51bGxcbiAgICB9O1xuICB9O1xuXG5leHBvcnRzLkJhc2ljU291cmNlTWFwQ29uc3VtZXIgPSBCYXNpY1NvdXJjZU1hcENvbnN1bWVyO1xuXG4vKipcbiAqIEFuIEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lciBpbnN0YW5jZSByZXByZXNlbnRzIGEgcGFyc2VkIHNvdXJjZSBtYXAgd2hpY2hcbiAqIHdlIGNhbiBxdWVyeSBmb3IgaW5mb3JtYXRpb24uIEl0IGRpZmZlcnMgZnJvbSBCYXNpY1NvdXJjZU1hcENvbnN1bWVyIGluXG4gKiB0aGF0IGl0IHRha2VzIFwiaW5kZXhlZFwiIHNvdXJjZSBtYXBzIChpLmUuIG9uZXMgd2l0aCBhIFwic2VjdGlvbnNcIiBmaWVsZCkgYXNcbiAqIGlucHV0LlxuICpcbiAqIFRoZSBvbmx5IHBhcmFtZXRlciBpcyBhIHJhdyBzb3VyY2UgbWFwIChlaXRoZXIgYXMgYSBKU09OIHN0cmluZywgb3IgYWxyZWFkeVxuICogcGFyc2VkIHRvIGFuIG9iamVjdCkuIEFjY29yZGluZyB0byB0aGUgc3BlYyBmb3IgaW5kZXhlZCBzb3VyY2UgbWFwcywgdGhleVxuICogaGF2ZSB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG4gKlxuICogICAtIHZlcnNpb246IFdoaWNoIHZlcnNpb24gb2YgdGhlIHNvdXJjZSBtYXAgc3BlYyB0aGlzIG1hcCBpcyBmb2xsb3dpbmcuXG4gKiAgIC0gZmlsZTogT3B0aW9uYWwuIFRoZSBnZW5lcmF0ZWQgZmlsZSB0aGlzIHNvdXJjZSBtYXAgaXMgYXNzb2NpYXRlZCB3aXRoLlxuICogICAtIHNlY3Rpb25zOiBBIGxpc3Qgb2Ygc2VjdGlvbiBkZWZpbml0aW9ucy5cbiAqXG4gKiBFYWNoIHZhbHVlIHVuZGVyIHRoZSBcInNlY3Rpb25zXCIgZmllbGQgaGFzIHR3byBmaWVsZHM6XG4gKiAgIC0gb2Zmc2V0OiBUaGUgb2Zmc2V0IGludG8gdGhlIG9yaWdpbmFsIHNwZWNpZmllZCBhdCB3aGljaCB0aGlzIHNlY3Rpb25cbiAqICAgICAgIGJlZ2lucyB0byBhcHBseSwgZGVmaW5lZCBhcyBhbiBvYmplY3Qgd2l0aCBhIFwibGluZVwiIGFuZCBcImNvbHVtblwiXG4gKiAgICAgICBmaWVsZC5cbiAqICAgLSBtYXA6IEEgc291cmNlIG1hcCBkZWZpbml0aW9uLiBUaGlzIHNvdXJjZSBtYXAgY291bGQgYWxzbyBiZSBpbmRleGVkLFxuICogICAgICAgYnV0IGRvZXNuJ3QgaGF2ZSB0byBiZS5cbiAqXG4gKiBJbnN0ZWFkIG9mIHRoZSBcIm1hcFwiIGZpZWxkLCBpdCdzIGFsc28gcG9zc2libGUgdG8gaGF2ZSBhIFwidXJsXCIgZmllbGRcbiAqIHNwZWNpZnlpbmcgYSBVUkwgdG8gcmV0cmlldmUgYSBzb3VyY2UgbWFwIGZyb20sIGJ1dCB0aGF0J3MgY3VycmVudGx5XG4gKiB1bnN1cHBvcnRlZC5cbiAqXG4gKiBIZXJlJ3MgYW4gZXhhbXBsZSBzb3VyY2UgbWFwLCB0YWtlbiBmcm9tIHRoZSBzb3VyY2UgbWFwIHNwZWNbMF0sIGJ1dFxuICogbW9kaWZpZWQgdG8gb21pdCBhIHNlY3Rpb24gd2hpY2ggdXNlcyB0aGUgXCJ1cmxcIiBmaWVsZC5cbiAqXG4gKiAge1xuICogICAgdmVyc2lvbiA6IDMsXG4gKiAgICBmaWxlOiBcImFwcC5qc1wiLFxuICogICAgc2VjdGlvbnM6IFt7XG4gKiAgICAgIG9mZnNldDoge2xpbmU6MTAwLCBjb2x1bW46MTB9LFxuICogICAgICBtYXA6IHtcbiAqICAgICAgICB2ZXJzaW9uIDogMyxcbiAqICAgICAgICBmaWxlOiBcInNlY3Rpb24uanNcIixcbiAqICAgICAgICBzb3VyY2VzOiBbXCJmb28uanNcIiwgXCJiYXIuanNcIl0sXG4gKiAgICAgICAgbmFtZXM6IFtcInNyY1wiLCBcIm1hcHNcIiwgXCJhcmVcIiwgXCJmdW5cIl0sXG4gKiAgICAgICAgbWFwcGluZ3M6IFwiQUFBQSxFOztBQkNERTtcIlxuICogICAgICB9XG4gKiAgICB9XSxcbiAqICB9XG4gKlxuICogWzBdOiBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzFVMVJHQWVoUXdSeXBVVG92RjFLUmxwaU9GemUwYi1fMmdjNmZBSDBLWTBrL2VkaXQjaGVhZGluZz1oLjUzNWVzM3hlcHJndFxuICovXG5mdW5jdGlvbiBJbmRleGVkU291cmNlTWFwQ29uc3VtZXIoYVNvdXJjZU1hcCkge1xuICB2YXIgc291cmNlTWFwID0gYVNvdXJjZU1hcDtcbiAgaWYgKHR5cGVvZiBhU291cmNlTWFwID09PSAnc3RyaW5nJykge1xuICAgIHNvdXJjZU1hcCA9IEpTT04ucGFyc2UoYVNvdXJjZU1hcC5yZXBsYWNlKC9eXFwpXFxdXFx9Jy8sICcnKSk7XG4gIH1cblxuICB2YXIgdmVyc2lvbiA9IHV0aWwuZ2V0QXJnKHNvdXJjZU1hcCwgJ3ZlcnNpb24nKTtcbiAgdmFyIHNlY3Rpb25zID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCAnc2VjdGlvbnMnKTtcblxuICBpZiAodmVyc2lvbiAhPSB0aGlzLl92ZXJzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCB2ZXJzaW9uOiAnICsgdmVyc2lvbik7XG4gIH1cblxuICB0aGlzLl9zb3VyY2VzID0gbmV3IEFycmF5U2V0KCk7XG4gIHRoaXMuX25hbWVzID0gbmV3IEFycmF5U2V0KCk7XG5cbiAgdmFyIGxhc3RPZmZzZXQgPSB7XG4gICAgbGluZTogLTEsXG4gICAgY29sdW1uOiAwXG4gIH07XG4gIHRoaXMuX3NlY3Rpb25zID0gc2VjdGlvbnMubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgaWYgKHMudXJsKSB7XG4gICAgICAvLyBUaGUgdXJsIGZpZWxkIHdpbGwgcmVxdWlyZSBzdXBwb3J0IGZvciBhc3luY2hyb25pY2l0eS5cbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9zb3VyY2UtbWFwL2lzc3Vlcy8xNlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdXBwb3J0IGZvciB1cmwgZmllbGQgaW4gc2VjdGlvbnMgbm90IGltcGxlbWVudGVkLicpO1xuICAgIH1cbiAgICB2YXIgb2Zmc2V0ID0gdXRpbC5nZXRBcmcocywgJ29mZnNldCcpO1xuICAgIHZhciBvZmZzZXRMaW5lID0gdXRpbC5nZXRBcmcob2Zmc2V0LCAnbGluZScpO1xuICAgIHZhciBvZmZzZXRDb2x1bW4gPSB1dGlsLmdldEFyZyhvZmZzZXQsICdjb2x1bW4nKTtcblxuICAgIGlmIChvZmZzZXRMaW5lIDwgbGFzdE9mZnNldC5saW5lIHx8XG4gICAgICAgIChvZmZzZXRMaW5lID09PSBsYXN0T2Zmc2V0LmxpbmUgJiYgb2Zmc2V0Q29sdW1uIDwgbGFzdE9mZnNldC5jb2x1bW4pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlY3Rpb24gb2Zmc2V0cyBtdXN0IGJlIG9yZGVyZWQgYW5kIG5vbi1vdmVybGFwcGluZy4nKTtcbiAgICB9XG4gICAgbGFzdE9mZnNldCA9IG9mZnNldDtcblxuICAgIHJldHVybiB7XG4gICAgICBnZW5lcmF0ZWRPZmZzZXQ6IHtcbiAgICAgICAgLy8gVGhlIG9mZnNldCBmaWVsZHMgYXJlIDAtYmFzZWQsIGJ1dCB3ZSB1c2UgMS1iYXNlZCBpbmRpY2VzIHdoZW5cbiAgICAgICAgLy8gZW5jb2RpbmcvZGVjb2RpbmcgZnJvbSBWTFEuXG4gICAgICAgIGdlbmVyYXRlZExpbmU6IG9mZnNldExpbmUgKyAxLFxuICAgICAgICBnZW5lcmF0ZWRDb2x1bW46IG9mZnNldENvbHVtbiArIDFcbiAgICAgIH0sXG4gICAgICBjb25zdW1lcjogbmV3IFNvdXJjZU1hcENvbnN1bWVyKHV0aWwuZ2V0QXJnKHMsICdtYXAnKSlcbiAgICB9XG4gIH0pO1xufVxuXG5JbmRleGVkU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUpO1xuSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNvdXJjZU1hcENvbnN1bWVyO1xuXG4vKipcbiAqIFRoZSB2ZXJzaW9uIG9mIHRoZSBzb3VyY2UgbWFwcGluZyBzcGVjIHRoYXQgd2UgYXJlIGNvbnN1bWluZy5cbiAqL1xuSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fdmVyc2lvbiA9IDM7XG5cbi8qKlxuICogVGhlIGxpc3Qgb2Ygb3JpZ2luYWwgc291cmNlcy5cbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUsICdzb3VyY2VzJywge1xuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc291cmNlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5fc2VjdGlvbnNbaV0uY29uc3VtZXIuc291cmNlcy5sZW5ndGg7IGorKykge1xuICAgICAgICBzb3VyY2VzLnB1c2godGhpcy5fc2VjdGlvbnNbaV0uY29uc3VtZXIuc291cmNlc1tqXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2VzO1xuICB9XG59KTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBvcmlnaW5hbCBzb3VyY2UsIGxpbmUsIGFuZCBjb2x1bW4gaW5mb3JtYXRpb24gZm9yIHRoZSBnZW5lcmF0ZWRcbiAqIHNvdXJjZSdzIGxpbmUgYW5kIGNvbHVtbiBwb3NpdGlvbnMgcHJvdmlkZWQuIFRoZSBvbmx5IGFyZ3VtZW50IGlzIGFuIG9iamVjdFxuICogd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGxpbmU6IFRoZSBsaW5lIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZS5cbiAqICAgLSBjb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlLlxuICpcbiAqIGFuZCBhbiBvYmplY3QgaXMgcmV0dXJuZWQgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAtIHNvdXJjZTogVGhlIG9yaWdpbmFsIHNvdXJjZSBmaWxlLCBvciBudWxsLlxuICogICAtIGxpbmU6IFRoZSBsaW5lIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlLCBvciBudWxsLlxuICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZSwgb3IgbnVsbC5cbiAqICAgLSBuYW1lOiBUaGUgb3JpZ2luYWwgaWRlbnRpZmllciwgb3IgbnVsbC5cbiAqL1xuSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5vcmlnaW5hbFBvc2l0aW9uRm9yID1cbiAgZnVuY3Rpb24gSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyX29yaWdpbmFsUG9zaXRpb25Gb3IoYUFyZ3MpIHtcbiAgICB2YXIgbmVlZGxlID0ge1xuICAgICAgZ2VuZXJhdGVkTGluZTogdXRpbC5nZXRBcmcoYUFyZ3MsICdsaW5lJyksXG4gICAgICBnZW5lcmF0ZWRDb2x1bW46IHV0aWwuZ2V0QXJnKGFBcmdzLCAnY29sdW1uJylcbiAgICB9O1xuXG4gICAgLy8gRmluZCB0aGUgc2VjdGlvbiBjb250YWluaW5nIHRoZSBnZW5lcmF0ZWQgcG9zaXRpb24gd2UncmUgdHJ5aW5nIHRvIG1hcFxuICAgIC8vIHRvIGFuIG9yaWdpbmFsIHBvc2l0aW9uLlxuICAgIHZhciBzZWN0aW9uSW5kZXggPSBiaW5hcnlTZWFyY2guc2VhcmNoKG5lZWRsZSwgdGhpcy5fc2VjdGlvbnMsXG4gICAgICBmdW5jdGlvbihuZWVkbGUsIHNlY3Rpb24pIHtcbiAgICAgICAgdmFyIGNtcCA9IG5lZWRsZS5nZW5lcmF0ZWRMaW5lIC0gc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkTGluZTtcbiAgICAgICAgaWYgKGNtcCkge1xuICAgICAgICAgIHJldHVybiBjbXA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKG5lZWRsZS5nZW5lcmF0ZWRDb2x1bW4gLVxuICAgICAgICAgICAgICAgIHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZENvbHVtbik7XG4gICAgICB9KTtcbiAgICB2YXIgc2VjdGlvbiA9IHRoaXMuX3NlY3Rpb25zW3NlY3Rpb25JbmRleF07XG5cbiAgICBpZiAoIXNlY3Rpb24pIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZTogbnVsbCxcbiAgICAgICAgbGluZTogbnVsbCxcbiAgICAgICAgY29sdW1uOiBudWxsLFxuICAgICAgICBuYW1lOiBudWxsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBzZWN0aW9uLmNvbnN1bWVyLm9yaWdpbmFsUG9zaXRpb25Gb3Ioe1xuICAgICAgbGluZTogbmVlZGxlLmdlbmVyYXRlZExpbmUgLVxuICAgICAgICAoc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkTGluZSAtIDEpLFxuICAgICAgY29sdW1uOiBuZWVkbGUuZ2VuZXJhdGVkQ29sdW1uIC1cbiAgICAgICAgKHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZExpbmUgPT09IG5lZWRsZS5nZW5lcmF0ZWRMaW5lXG4gICAgICAgICA/IHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZENvbHVtbiAtIDFcbiAgICAgICAgIDogMCksXG4gICAgICBiaWFzOiBhQXJncy5iaWFzXG4gICAgfSk7XG4gIH07XG5cbi8qKlxuICogUmV0dXJuIHRydWUgaWYgd2UgaGF2ZSB0aGUgc291cmNlIGNvbnRlbnQgZm9yIGV2ZXJ5IHNvdXJjZSBpbiB0aGUgc291cmNlXG4gKiBtYXAsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5oYXNDb250ZW50c09mQWxsU291cmNlcyA9XG4gIGZ1bmN0aW9uIEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lcl9oYXNDb250ZW50c09mQWxsU291cmNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VjdGlvbnMuZXZlcnkoZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiBzLmNvbnN1bWVyLmhhc0NvbnRlbnRzT2ZBbGxTb3VyY2VzKCk7XG4gICAgfSk7XG4gIH07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgb3JpZ2luYWwgc291cmNlIGNvbnRlbnQuIFRoZSBvbmx5IGFyZ3VtZW50IGlzIHRoZSB1cmwgb2YgdGhlXG4gKiBvcmlnaW5hbCBzb3VyY2UgZmlsZS4gUmV0dXJucyBudWxsIGlmIG5vIG9yaWdpbmFsIHNvdXJjZSBjb250ZW50IGlzXG4gKiBhdmFpbGFibGUuXG4gKi9cbkluZGV4ZWRTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuc291cmNlQ29udGVudEZvciA9XG4gIGZ1bmN0aW9uIEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lcl9zb3VyY2VDb250ZW50Rm9yKGFTb3VyY2UsIG51bGxPbk1pc3NpbmcpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3NlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VjdGlvbiA9IHRoaXMuX3NlY3Rpb25zW2ldO1xuXG4gICAgICB2YXIgY29udGVudCA9IHNlY3Rpb24uY29uc3VtZXIuc291cmNlQ29udGVudEZvcihhU291cmNlLCB0cnVlKTtcbiAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgIHJldHVybiBjb250ZW50O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobnVsbE9uTWlzc2luZykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdcIicgKyBhU291cmNlICsgJ1wiIGlzIG5vdCBpbiB0aGUgU291cmNlTWFwLicpO1xuICAgIH1cbiAgfTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBnZW5lcmF0ZWQgbGluZSBhbmQgY29sdW1uIGluZm9ybWF0aW9uIGZvciB0aGUgb3JpZ2luYWwgc291cmNlLFxuICogbGluZSwgYW5kIGNvbHVtbiBwb3NpdGlvbnMgcHJvdmlkZWQuIFRoZSBvbmx5IGFyZ3VtZW50IGlzIGFuIG9iamVjdCB3aXRoXG4gKiB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAtIHNvdXJjZTogVGhlIGZpbGVuYW1lIG9mIHRoZSBvcmlnaW5hbCBzb3VyY2UuXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UuXG4gKiAgIC0gY29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlLlxuICpcbiAqIGFuZCBhbiBvYmplY3QgaXMgcmV0dXJuZWQgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGxpbmU6IFRoZSBsaW5lIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZSwgb3IgbnVsbC5cbiAqICAgLSBjb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlLCBvciBudWxsLlxuICovXG5JbmRleGVkU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLmdlbmVyYXRlZFBvc2l0aW9uRm9yID1cbiAgZnVuY3Rpb24gSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyX2dlbmVyYXRlZFBvc2l0aW9uRm9yKGFBcmdzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9zZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNlY3Rpb24gPSB0aGlzLl9zZWN0aW9uc1tpXTtcblxuICAgICAgLy8gT25seSBjb25zaWRlciB0aGlzIHNlY3Rpb24gaWYgdGhlIHJlcXVlc3RlZCBzb3VyY2UgaXMgaW4gdGhlIGxpc3Qgb2ZcbiAgICAgIC8vIHNvdXJjZXMgb2YgdGhlIGNvbnN1bWVyLlxuICAgICAgaWYgKHNlY3Rpb24uY29uc3VtZXIuc291cmNlcy5pbmRleE9mKHV0aWwuZ2V0QXJnKGFBcmdzLCAnc291cmNlJykpID09PSAtMSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHZhciBnZW5lcmF0ZWRQb3NpdGlvbiA9IHNlY3Rpb24uY29uc3VtZXIuZ2VuZXJhdGVkUG9zaXRpb25Gb3IoYUFyZ3MpO1xuICAgICAgaWYgKGdlbmVyYXRlZFBvc2l0aW9uKSB7XG4gICAgICAgIHZhciByZXQgPSB7XG4gICAgICAgICAgbGluZTogZ2VuZXJhdGVkUG9zaXRpb24ubGluZSArXG4gICAgICAgICAgICAoc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkTGluZSAtIDEpLFxuICAgICAgICAgIGNvbHVtbjogZ2VuZXJhdGVkUG9zaXRpb24uY29sdW1uICtcbiAgICAgICAgICAgIChzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRMaW5lID09PSBnZW5lcmF0ZWRQb3NpdGlvbi5saW5lXG4gICAgICAgICAgICAgPyBzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRDb2x1bW4gLSAxXG4gICAgICAgICAgICAgOiAwKVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBsaW5lOiBudWxsLFxuICAgICAgY29sdW1uOiBudWxsXG4gICAgfTtcbiAgfTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgbWFwcGluZ3MgaW4gYSBzdHJpbmcgaW4gdG8gYSBkYXRhIHN0cnVjdHVyZSB3aGljaCB3ZSBjYW4gZWFzaWx5XG4gKiBxdWVyeSAodGhlIG9yZGVyZWQgYXJyYXlzIGluIHRoZSBgdGhpcy5fX2dlbmVyYXRlZE1hcHBpbmdzYCBhbmRcbiAqIGB0aGlzLl9fb3JpZ2luYWxNYXBwaW5nc2AgcHJvcGVydGllcykuXG4gKi9cbkluZGV4ZWRTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuX3BhcnNlTWFwcGluZ3MgPVxuICBmdW5jdGlvbiBJbmRleGVkU291cmNlTWFwQ29uc3VtZXJfcGFyc2VNYXBwaW5ncyhhU3RyLCBhU291cmNlUm9vdCkge1xuICAgIHRoaXMuX19nZW5lcmF0ZWRNYXBwaW5ncyA9IFtdO1xuICAgIHRoaXMuX19vcmlnaW5hbE1hcHBpbmdzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9zZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNlY3Rpb24gPSB0aGlzLl9zZWN0aW9uc1tpXTtcbiAgICAgIHZhciBzZWN0aW9uTWFwcGluZ3MgPSBzZWN0aW9uLmNvbnN1bWVyLl9nZW5lcmF0ZWRNYXBwaW5ncztcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2VjdGlvbk1hcHBpbmdzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBtYXBwaW5nID0gc2VjdGlvbk1hcHBpbmdzW2pdO1xuXG4gICAgICAgIHZhciBzb3VyY2UgPSBzZWN0aW9uLmNvbnN1bWVyLl9zb3VyY2VzLmF0KG1hcHBpbmcuc291cmNlKTtcbiAgICAgICAgaWYgKHNlY3Rpb24uY29uc3VtZXIuc291cmNlUm9vdCAhPT0gbnVsbCkge1xuICAgICAgICAgIHNvdXJjZSA9IHV0aWwuam9pbihzZWN0aW9uLmNvbnN1bWVyLnNvdXJjZVJvb3QsIHNvdXJjZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc291cmNlcy5hZGQoc291cmNlKTtcbiAgICAgICAgc291cmNlID0gdGhpcy5fc291cmNlcy5pbmRleE9mKHNvdXJjZSk7XG5cbiAgICAgICAgdmFyIG5hbWUgPSBzZWN0aW9uLmNvbnN1bWVyLl9uYW1lcy5hdChtYXBwaW5nLm5hbWUpO1xuICAgICAgICB0aGlzLl9uYW1lcy5hZGQobmFtZSk7XG4gICAgICAgIG5hbWUgPSB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpO1xuXG4gICAgICAgIC8vIFRoZSBtYXBwaW5ncyBjb21pbmcgZnJvbSB0aGUgY29uc3VtZXIgZm9yIHRoZSBzZWN0aW9uIGhhdmVcbiAgICAgICAgLy8gZ2VuZXJhdGVkIHBvc2l0aW9ucyByZWxhdGl2ZSB0byB0aGUgc3RhcnQgb2YgdGhlIHNlY3Rpb24sIHNvIHdlXG4gICAgICAgIC8vIG5lZWQgdG8gb2Zmc2V0IHRoZW0gdG8gYmUgcmVsYXRpdmUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBjb25jYXRlbmF0ZWRcbiAgICAgICAgLy8gZ2VuZXJhdGVkIGZpbGUuXG4gICAgICAgIHZhciBhZGp1c3RlZE1hcHBpbmcgPSB7XG4gICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgZ2VuZXJhdGVkTGluZTogbWFwcGluZy5nZW5lcmF0ZWRMaW5lICtcbiAgICAgICAgICAgIChzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRMaW5lIC0gMSksXG4gICAgICAgICAgZ2VuZXJhdGVkQ29sdW1uOiBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbiArXG4gICAgICAgICAgICAoc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkTGluZSA9PT0gbWFwcGluZy5nZW5lcmF0ZWRMaW5lXG4gICAgICAgICAgICA/IHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZENvbHVtbiAtIDFcbiAgICAgICAgICAgIDogMCksXG4gICAgICAgICAgb3JpZ2luYWxMaW5lOiBtYXBwaW5nLm9yaWdpbmFsTGluZSxcbiAgICAgICAgICBvcmlnaW5hbENvbHVtbjogbWFwcGluZy5vcmlnaW5hbENvbHVtbixcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fX2dlbmVyYXRlZE1hcHBpbmdzLnB1c2goYWRqdXN0ZWRNYXBwaW5nKTtcbiAgICAgICAgaWYgKHR5cGVvZiBhZGp1c3RlZE1hcHBpbmcub3JpZ2luYWxMaW5lID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHRoaXMuX19vcmlnaW5hbE1hcHBpbmdzLnB1c2goYWRqdXN0ZWRNYXBwaW5nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHF1aWNrU29ydCh0aGlzLl9fZ2VuZXJhdGVkTWFwcGluZ3MsIHV0aWwuY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zRGVmbGF0ZWQpO1xuICAgIHF1aWNrU29ydCh0aGlzLl9fb3JpZ2luYWxNYXBwaW5ncywgdXRpbC5jb21wYXJlQnlPcmlnaW5hbFBvc2l0aW9ucyk7XG4gIH07XG5cbmV4cG9ydHMuSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyID0gSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyO1xuIiwiLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqL1xuXG52YXIgYmFzZTY0VkxRID0gcmVxdWlyZSgnLi9iYXNlNjQtdmxxJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIEFycmF5U2V0ID0gcmVxdWlyZSgnLi9hcnJheS1zZXQnKS5BcnJheVNldDtcbnZhciBNYXBwaW5nTGlzdCA9IHJlcXVpcmUoJy4vbWFwcGluZy1saXN0JykuTWFwcGluZ0xpc3Q7XG5cbi8qKlxuICogQW4gaW5zdGFuY2Ugb2YgdGhlIFNvdXJjZU1hcEdlbmVyYXRvciByZXByZXNlbnRzIGEgc291cmNlIG1hcCB3aGljaCBpc1xuICogYmVpbmcgYnVpbHQgaW5jcmVtZW50YWxseS4gWW91IG1heSBwYXNzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmdcbiAqIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGZpbGU6IFRoZSBmaWxlbmFtZSBvZiB0aGUgZ2VuZXJhdGVkIHNvdXJjZS5cbiAqICAgLSBzb3VyY2VSb290OiBBIHJvb3QgZm9yIGFsbCByZWxhdGl2ZSBVUkxzIGluIHRoaXMgc291cmNlIG1hcC5cbiAqL1xuZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yKGFBcmdzKSB7XG4gIGlmICghYUFyZ3MpIHtcbiAgICBhQXJncyA9IHt9O1xuICB9XG4gIHRoaXMuX2ZpbGUgPSB1dGlsLmdldEFyZyhhQXJncywgJ2ZpbGUnLCBudWxsKTtcbiAgdGhpcy5fc291cmNlUm9vdCA9IHV0aWwuZ2V0QXJnKGFBcmdzLCAnc291cmNlUm9vdCcsIG51bGwpO1xuICB0aGlzLl9za2lwVmFsaWRhdGlvbiA9IHV0aWwuZ2V0QXJnKGFBcmdzLCAnc2tpcFZhbGlkYXRpb24nLCBmYWxzZSk7XG4gIHRoaXMuX3NvdXJjZXMgPSBuZXcgQXJyYXlTZXQoKTtcbiAgdGhpcy5fbmFtZXMgPSBuZXcgQXJyYXlTZXQoKTtcbiAgdGhpcy5fbWFwcGluZ3MgPSBuZXcgTWFwcGluZ0xpc3QoKTtcbiAgdGhpcy5fc291cmNlc0NvbnRlbnRzID0gbnVsbDtcbn1cblxuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5fdmVyc2lvbiA9IDM7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBTb3VyY2VNYXBHZW5lcmF0b3IgYmFzZWQgb24gYSBTb3VyY2VNYXBDb25zdW1lclxuICpcbiAqIEBwYXJhbSBhU291cmNlTWFwQ29uc3VtZXIgVGhlIFNvdXJjZU1hcC5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLmZyb21Tb3VyY2VNYXAgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBHZW5lcmF0b3JfZnJvbVNvdXJjZU1hcChhU291cmNlTWFwQ29uc3VtZXIpIHtcbiAgICB2YXIgc291cmNlUm9vdCA9IGFTb3VyY2VNYXBDb25zdW1lci5zb3VyY2VSb290O1xuICAgIHZhciBnZW5lcmF0b3IgPSBuZXcgU291cmNlTWFwR2VuZXJhdG9yKHtcbiAgICAgIGZpbGU6IGFTb3VyY2VNYXBDb25zdW1lci5maWxlLFxuICAgICAgc291cmNlUm9vdDogc291cmNlUm9vdFxuICAgIH0pO1xuICAgIGFTb3VyY2VNYXBDb25zdW1lci5lYWNoTWFwcGluZyhmdW5jdGlvbiAobWFwcGluZykge1xuICAgICAgdmFyIG5ld01hcHBpbmcgPSB7XG4gICAgICAgIGdlbmVyYXRlZDoge1xuICAgICAgICAgIGxpbmU6IG1hcHBpbmcuZ2VuZXJhdGVkTGluZSxcbiAgICAgICAgICBjb2x1bW46IG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChtYXBwaW5nLnNvdXJjZSAhPSBudWxsKSB7XG4gICAgICAgIG5ld01hcHBpbmcuc291cmNlID0gbWFwcGluZy5zb3VyY2U7XG4gICAgICAgIGlmIChzb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgICAgICBuZXdNYXBwaW5nLnNvdXJjZSA9IHV0aWwucmVsYXRpdmUoc291cmNlUm9vdCwgbmV3TWFwcGluZy5zb3VyY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3TWFwcGluZy5vcmlnaW5hbCA9IHtcbiAgICAgICAgICBsaW5lOiBtYXBwaW5nLm9yaWdpbmFsTGluZSxcbiAgICAgICAgICBjb2x1bW46IG1hcHBpbmcub3JpZ2luYWxDb2x1bW5cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAobWFwcGluZy5uYW1lICE9IG51bGwpIHtcbiAgICAgICAgICBuZXdNYXBwaW5nLm5hbWUgPSBtYXBwaW5nLm5hbWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZ2VuZXJhdG9yLmFkZE1hcHBpbmcobmV3TWFwcGluZyk7XG4gICAgfSk7XG4gICAgYVNvdXJjZU1hcENvbnN1bWVyLnNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbiAoc291cmNlRmlsZSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBhU291cmNlTWFwQ29uc3VtZXIuc291cmNlQ29udGVudEZvcihzb3VyY2VGaWxlKTtcbiAgICAgIGlmIChjb250ZW50ICE9IG51bGwpIHtcbiAgICAgICAgZ2VuZXJhdG9yLnNldFNvdXJjZUNvbnRlbnQoc291cmNlRmlsZSwgY29udGVudCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfTtcblxuLyoqXG4gKiBBZGQgYSBzaW5nbGUgbWFwcGluZyBmcm9tIG9yaWdpbmFsIHNvdXJjZSBsaW5lIGFuZCBjb2x1bW4gdG8gdGhlIGdlbmVyYXRlZFxuICogc291cmNlJ3MgbGluZSBhbmQgY29sdW1uIGZvciB0aGlzIHNvdXJjZSBtYXAgYmVpbmcgY3JlYXRlZC4gVGhlIG1hcHBpbmdcbiAqIG9iamVjdCBzaG91bGQgaGF2ZSB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGdlbmVyYXRlZDogQW4gb2JqZWN0IHdpdGggdGhlIGdlbmVyYXRlZCBsaW5lIGFuZCBjb2x1bW4gcG9zaXRpb25zLlxuICogICAtIG9yaWdpbmFsOiBBbiBvYmplY3Qgd2l0aCB0aGUgb3JpZ2luYWwgbGluZSBhbmQgY29sdW1uIHBvc2l0aW9ucy5cbiAqICAgLSBzb3VyY2U6IFRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZSAocmVsYXRpdmUgdG8gdGhlIHNvdXJjZVJvb3QpLlxuICogICAtIG5hbWU6IEFuIG9wdGlvbmFsIG9yaWdpbmFsIHRva2VuIG5hbWUgZm9yIHRoaXMgbWFwcGluZy5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5hZGRNYXBwaW5nID1cbiAgZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yX2FkZE1hcHBpbmcoYUFyZ3MpIHtcbiAgICB2YXIgZ2VuZXJhdGVkID0gdXRpbC5nZXRBcmcoYUFyZ3MsICdnZW5lcmF0ZWQnKTtcbiAgICB2YXIgb3JpZ2luYWwgPSB1dGlsLmdldEFyZyhhQXJncywgJ29yaWdpbmFsJywgbnVsbCk7XG4gICAgdmFyIHNvdXJjZSA9IHV0aWwuZ2V0QXJnKGFBcmdzLCAnc291cmNlJywgbnVsbCk7XG4gICAgdmFyIG5hbWUgPSB1dGlsLmdldEFyZyhhQXJncywgJ25hbWUnLCBudWxsKTtcblxuICAgIGlmICghdGhpcy5fc2tpcFZhbGlkYXRpb24pIHtcbiAgICAgIHRoaXMuX3ZhbGlkYXRlTWFwcGluZyhnZW5lcmF0ZWQsIG9yaWdpbmFsLCBzb3VyY2UsIG5hbWUpO1xuICAgIH1cblxuICAgIGlmIChzb3VyY2UgIT0gbnVsbCkge1xuICAgICAgc291cmNlID0gU3RyaW5nKHNvdXJjZSk7XG4gICAgICBpZiAoIXRoaXMuX3NvdXJjZXMuaGFzKHNvdXJjZSkpIHtcbiAgICAgICAgdGhpcy5fc291cmNlcy5hZGQoc291cmNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobmFtZSAhPSBudWxsKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpO1xuICAgICAgaWYgKCF0aGlzLl9uYW1lcy5oYXMobmFtZSkpIHtcbiAgICAgICAgdGhpcy5fbmFtZXMuYWRkKG5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX21hcHBpbmdzLmFkZCh7XG4gICAgICBnZW5lcmF0ZWRMaW5lOiBnZW5lcmF0ZWQubGluZSxcbiAgICAgIGdlbmVyYXRlZENvbHVtbjogZ2VuZXJhdGVkLmNvbHVtbixcbiAgICAgIG9yaWdpbmFsTGluZTogb3JpZ2luYWwgIT0gbnVsbCAmJiBvcmlnaW5hbC5saW5lLFxuICAgICAgb3JpZ2luYWxDb2x1bW46IG9yaWdpbmFsICE9IG51bGwgJiYgb3JpZ2luYWwuY29sdW1uLFxuICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICBuYW1lOiBuYW1lXG4gICAgfSk7XG4gIH07XG5cbi8qKlxuICogU2V0IHRoZSBzb3VyY2UgY29udGVudCBmb3IgYSBzb3VyY2UgZmlsZS5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5zZXRTb3VyY2VDb250ZW50ID1cbiAgZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yX3NldFNvdXJjZUNvbnRlbnQoYVNvdXJjZUZpbGUsIGFTb3VyY2VDb250ZW50KSB7XG4gICAgdmFyIHNvdXJjZSA9IGFTb3VyY2VGaWxlO1xuICAgIGlmICh0aGlzLl9zb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgIHNvdXJjZSA9IHV0aWwucmVsYXRpdmUodGhpcy5fc291cmNlUm9vdCwgc291cmNlKTtcbiAgICB9XG5cbiAgICBpZiAoYVNvdXJjZUNvbnRlbnQgIT0gbnVsbCkge1xuICAgICAgLy8gQWRkIHRoZSBzb3VyY2UgY29udGVudCB0byB0aGUgX3NvdXJjZXNDb250ZW50cyBtYXAuXG4gICAgICAvLyBDcmVhdGUgYSBuZXcgX3NvdXJjZXNDb250ZW50cyBtYXAgaWYgdGhlIHByb3BlcnR5IGlzIG51bGwuXG4gICAgICBpZiAoIXRoaXMuX3NvdXJjZXNDb250ZW50cykge1xuICAgICAgICB0aGlzLl9zb3VyY2VzQ29udGVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgfVxuICAgICAgdGhpcy5fc291cmNlc0NvbnRlbnRzW3V0aWwudG9TZXRTdHJpbmcoc291cmNlKV0gPSBhU291cmNlQ29udGVudDtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3NvdXJjZXNDb250ZW50cykge1xuICAgICAgLy8gUmVtb3ZlIHRoZSBzb3VyY2UgZmlsZSBmcm9tIHRoZSBfc291cmNlc0NvbnRlbnRzIG1hcC5cbiAgICAgIC8vIElmIHRoZSBfc291cmNlc0NvbnRlbnRzIG1hcCBpcyBlbXB0eSwgc2V0IHRoZSBwcm9wZXJ0eSB0byBudWxsLlxuICAgICAgZGVsZXRlIHRoaXMuX3NvdXJjZXNDb250ZW50c1t1dGlsLnRvU2V0U3RyaW5nKHNvdXJjZSldO1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuX3NvdXJjZXNDb250ZW50cykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuX3NvdXJjZXNDb250ZW50cyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIG1hcHBpbmdzIG9mIGEgc3ViLXNvdXJjZS1tYXAgZm9yIGEgc3BlY2lmaWMgc291cmNlIGZpbGUgdG8gdGhlXG4gKiBzb3VyY2UgbWFwIGJlaW5nIGdlbmVyYXRlZC4gRWFjaCBtYXBwaW5nIHRvIHRoZSBzdXBwbGllZCBzb3VyY2UgZmlsZSBpc1xuICogcmV3cml0dGVuIHVzaW5nIHRoZSBzdXBwbGllZCBzb3VyY2UgbWFwLiBOb3RlOiBUaGUgcmVzb2x1dGlvbiBmb3IgdGhlXG4gKiByZXN1bHRpbmcgbWFwcGluZ3MgaXMgdGhlIG1pbmltaXVtIG9mIHRoaXMgbWFwIGFuZCB0aGUgc3VwcGxpZWQgbWFwLlxuICpcbiAqIEBwYXJhbSBhU291cmNlTWFwQ29uc3VtZXIgVGhlIHNvdXJjZSBtYXAgdG8gYmUgYXBwbGllZC5cbiAqIEBwYXJhbSBhU291cmNlRmlsZSBPcHRpb25hbC4gVGhlIGZpbGVuYW1lIG9mIHRoZSBzb3VyY2UgZmlsZS5cbiAqICAgICAgICBJZiBvbWl0dGVkLCBTb3VyY2VNYXBDb25zdW1lcidzIGZpbGUgcHJvcGVydHkgd2lsbCBiZSB1c2VkLlxuICogQHBhcmFtIGFTb3VyY2VNYXBQYXRoIE9wdGlvbmFsLiBUaGUgZGlybmFtZSBvZiB0aGUgcGF0aCB0byB0aGUgc291cmNlIG1hcFxuICogICAgICAgIHRvIGJlIGFwcGxpZWQuIElmIHJlbGF0aXZlLCBpdCBpcyByZWxhdGl2ZSB0byB0aGUgU291cmNlTWFwQ29uc3VtZXIuXG4gKiAgICAgICAgVGhpcyBwYXJhbWV0ZXIgaXMgbmVlZGVkIHdoZW4gdGhlIHR3byBzb3VyY2UgbWFwcyBhcmVuJ3QgaW4gdGhlIHNhbWVcbiAqICAgICAgICBkaXJlY3RvcnksIGFuZCB0aGUgc291cmNlIG1hcCB0byBiZSBhcHBsaWVkIGNvbnRhaW5zIHJlbGF0aXZlIHNvdXJjZVxuICogICAgICAgIHBhdGhzLiBJZiBzbywgdGhvc2UgcmVsYXRpdmUgc291cmNlIHBhdGhzIG5lZWQgdG8gYmUgcmV3cml0dGVuXG4gKiAgICAgICAgcmVsYXRpdmUgdG8gdGhlIFNvdXJjZU1hcEdlbmVyYXRvci5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5hcHBseVNvdXJjZU1hcCA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcEdlbmVyYXRvcl9hcHBseVNvdXJjZU1hcChhU291cmNlTWFwQ29uc3VtZXIsIGFTb3VyY2VGaWxlLCBhU291cmNlTWFwUGF0aCkge1xuICAgIHZhciBzb3VyY2VGaWxlID0gYVNvdXJjZUZpbGU7XG4gICAgLy8gSWYgYVNvdXJjZUZpbGUgaXMgb21pdHRlZCwgd2Ugd2lsbCB1c2UgdGhlIGZpbGUgcHJvcGVydHkgb2YgdGhlIFNvdXJjZU1hcFxuICAgIGlmIChhU291cmNlRmlsZSA9PSBudWxsKSB7XG4gICAgICBpZiAoYVNvdXJjZU1hcENvbnN1bWVyLmZpbGUgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1NvdXJjZU1hcEdlbmVyYXRvci5wcm90b3R5cGUuYXBwbHlTb3VyY2VNYXAgcmVxdWlyZXMgZWl0aGVyIGFuIGV4cGxpY2l0IHNvdXJjZSBmaWxlLCAnICtcbiAgICAgICAgICAnb3IgdGhlIHNvdXJjZSBtYXBcXCdzIFwiZmlsZVwiIHByb3BlcnR5LiBCb3RoIHdlcmUgb21pdHRlZC4nXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBzb3VyY2VGaWxlID0gYVNvdXJjZU1hcENvbnN1bWVyLmZpbGU7XG4gICAgfVxuICAgIHZhciBzb3VyY2VSb290ID0gdGhpcy5fc291cmNlUm9vdDtcbiAgICAvLyBNYWtlIFwic291cmNlRmlsZVwiIHJlbGF0aXZlIGlmIGFuIGFic29sdXRlIFVybCBpcyBwYXNzZWQuXG4gICAgaWYgKHNvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgc291cmNlRmlsZSA9IHV0aWwucmVsYXRpdmUoc291cmNlUm9vdCwgc291cmNlRmlsZSk7XG4gICAgfVxuICAgIC8vIEFwcGx5aW5nIHRoZSBTb3VyY2VNYXAgY2FuIGFkZCBhbmQgcmVtb3ZlIGl0ZW1zIGZyb20gdGhlIHNvdXJjZXMgYW5kXG4gICAgLy8gdGhlIG5hbWVzIGFycmF5LlxuICAgIHZhciBuZXdTb3VyY2VzID0gbmV3IEFycmF5U2V0KCk7XG4gICAgdmFyIG5ld05hbWVzID0gbmV3IEFycmF5U2V0KCk7XG5cbiAgICAvLyBGaW5kIG1hcHBpbmdzIGZvciB0aGUgXCJzb3VyY2VGaWxlXCJcbiAgICB0aGlzLl9tYXBwaW5ncy51bnNvcnRlZEZvckVhY2goZnVuY3Rpb24gKG1hcHBpbmcpIHtcbiAgICAgIGlmIChtYXBwaW5nLnNvdXJjZSA9PT0gc291cmNlRmlsZSAmJiBtYXBwaW5nLm9yaWdpbmFsTGluZSAhPSBudWxsKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIGl0IGNhbiBiZSBtYXBwZWQgYnkgdGhlIHNvdXJjZSBtYXAsIHRoZW4gdXBkYXRlIHRoZSBtYXBwaW5nLlxuICAgICAgICB2YXIgb3JpZ2luYWwgPSBhU291cmNlTWFwQ29uc3VtZXIub3JpZ2luYWxQb3NpdGlvbkZvcih7XG4gICAgICAgICAgbGluZTogbWFwcGluZy5vcmlnaW5hbExpbmUsXG4gICAgICAgICAgY29sdW1uOiBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAob3JpZ2luYWwuc291cmNlICE9IG51bGwpIHtcbiAgICAgICAgICAvLyBDb3B5IG1hcHBpbmdcbiAgICAgICAgICBtYXBwaW5nLnNvdXJjZSA9IG9yaWdpbmFsLnNvdXJjZTtcbiAgICAgICAgICBpZiAoYVNvdXJjZU1hcFBhdGggIT0gbnVsbCkge1xuICAgICAgICAgICAgbWFwcGluZy5zb3VyY2UgPSB1dGlsLmpvaW4oYVNvdXJjZU1hcFBhdGgsIG1hcHBpbmcuc291cmNlKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXBwaW5nLnNvdXJjZSA9IHV0aWwucmVsYXRpdmUoc291cmNlUm9vdCwgbWFwcGluZy5zb3VyY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsTGluZSA9IG9yaWdpbmFsLmxpbmU7XG4gICAgICAgICAgbWFwcGluZy5vcmlnaW5hbENvbHVtbiA9IG9yaWdpbmFsLmNvbHVtbjtcbiAgICAgICAgICBpZiAob3JpZ2luYWwubmFtZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXBwaW5nLm5hbWUgPSBvcmlnaW5hbC5uYW1lO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgc291cmNlID0gbWFwcGluZy5zb3VyY2U7XG4gICAgICBpZiAoc291cmNlICE9IG51bGwgJiYgIW5ld1NvdXJjZXMuaGFzKHNvdXJjZSkpIHtcbiAgICAgICAgbmV3U291cmNlcy5hZGQoc291cmNlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG5hbWUgPSBtYXBwaW5nLm5hbWU7XG4gICAgICBpZiAobmFtZSAhPSBudWxsICYmICFuZXdOYW1lcy5oYXMobmFtZSkpIHtcbiAgICAgICAgbmV3TmFtZXMuYWRkKG5hbWUpO1xuICAgICAgfVxuXG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5fc291cmNlcyA9IG5ld1NvdXJjZXM7XG4gICAgdGhpcy5fbmFtZXMgPSBuZXdOYW1lcztcblxuICAgIC8vIENvcHkgc291cmNlc0NvbnRlbnRzIG9mIGFwcGxpZWQgbWFwLlxuICAgIGFTb3VyY2VNYXBDb25zdW1lci5zb3VyY2VzLmZvckVhY2goZnVuY3Rpb24gKHNvdXJjZUZpbGUpIHtcbiAgICAgIHZhciBjb250ZW50ID0gYVNvdXJjZU1hcENvbnN1bWVyLnNvdXJjZUNvbnRlbnRGb3Ioc291cmNlRmlsZSk7XG4gICAgICBpZiAoY29udGVudCAhPSBudWxsKSB7XG4gICAgICAgIGlmIChhU291cmNlTWFwUGF0aCAhPSBudWxsKSB7XG4gICAgICAgICAgc291cmNlRmlsZSA9IHV0aWwuam9pbihhU291cmNlTWFwUGF0aCwgc291cmNlRmlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgICAgIHNvdXJjZUZpbGUgPSB1dGlsLnJlbGF0aXZlKHNvdXJjZVJvb3QsIHNvdXJjZUZpbGUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U291cmNlQ29udGVudChzb3VyY2VGaWxlLCBjb250ZW50KTtcbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcbiAgfTtcblxuLyoqXG4gKiBBIG1hcHBpbmcgY2FuIGhhdmUgb25lIG9mIHRoZSB0aHJlZSBsZXZlbHMgb2YgZGF0YTpcbiAqXG4gKiAgIDEuIEp1c3QgdGhlIGdlbmVyYXRlZCBwb3NpdGlvbi5cbiAqICAgMi4gVGhlIEdlbmVyYXRlZCBwb3NpdGlvbiwgb3JpZ2luYWwgcG9zaXRpb24sIGFuZCBvcmlnaW5hbCBzb3VyY2UuXG4gKiAgIDMuIEdlbmVyYXRlZCBhbmQgb3JpZ2luYWwgcG9zaXRpb24sIG9yaWdpbmFsIHNvdXJjZSwgYXMgd2VsbCBhcyBhIG5hbWVcbiAqICAgICAgdG9rZW4uXG4gKlxuICogVG8gbWFpbnRhaW4gY29uc2lzdGVuY3ksIHdlIHZhbGlkYXRlIHRoYXQgYW55IG5ldyBtYXBwaW5nIGJlaW5nIGFkZGVkIGZhbGxzXG4gKiBpbiB0byBvbmUgb2YgdGhlc2UgY2F0ZWdvcmllcy5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGVNYXBwaW5nID1cbiAgZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yX3ZhbGlkYXRlTWFwcGluZyhhR2VuZXJhdGVkLCBhT3JpZ2luYWwsIGFTb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYU5hbWUpIHtcbiAgICBpZiAoYUdlbmVyYXRlZCAmJiAnbGluZScgaW4gYUdlbmVyYXRlZCAmJiAnY29sdW1uJyBpbiBhR2VuZXJhdGVkXG4gICAgICAgICYmIGFHZW5lcmF0ZWQubGluZSA+IDAgJiYgYUdlbmVyYXRlZC5jb2x1bW4gPj0gMFxuICAgICAgICAmJiAhYU9yaWdpbmFsICYmICFhU291cmNlICYmICFhTmFtZSkge1xuICAgICAgLy8gQ2FzZSAxLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbHNlIGlmIChhR2VuZXJhdGVkICYmICdsaW5lJyBpbiBhR2VuZXJhdGVkICYmICdjb2x1bW4nIGluIGFHZW5lcmF0ZWRcbiAgICAgICAgICAgICAmJiBhT3JpZ2luYWwgJiYgJ2xpbmUnIGluIGFPcmlnaW5hbCAmJiAnY29sdW1uJyBpbiBhT3JpZ2luYWxcbiAgICAgICAgICAgICAmJiBhR2VuZXJhdGVkLmxpbmUgPiAwICYmIGFHZW5lcmF0ZWQuY29sdW1uID49IDBcbiAgICAgICAgICAgICAmJiBhT3JpZ2luYWwubGluZSA+IDAgJiYgYU9yaWdpbmFsLmNvbHVtbiA+PSAwXG4gICAgICAgICAgICAgJiYgYVNvdXJjZSkge1xuICAgICAgLy8gQ2FzZXMgMiBhbmQgMy5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbWFwcGluZzogJyArIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgZ2VuZXJhdGVkOiBhR2VuZXJhdGVkLFxuICAgICAgICBzb3VyY2U6IGFTb3VyY2UsXG4gICAgICAgIG9yaWdpbmFsOiBhT3JpZ2luYWwsXG4gICAgICAgIG5hbWU6IGFOYW1lXG4gICAgICB9KSk7XG4gICAgfVxuICB9O1xuXG4vKipcbiAqIFNlcmlhbGl6ZSB0aGUgYWNjdW11bGF0ZWQgbWFwcGluZ3MgaW4gdG8gdGhlIHN0cmVhbSBvZiBiYXNlIDY0IFZMUXNcbiAqIHNwZWNpZmllZCBieSB0aGUgc291cmNlIG1hcCBmb3JtYXQuXG4gKi9cblNvdXJjZU1hcEdlbmVyYXRvci5wcm90b3R5cGUuX3NlcmlhbGl6ZU1hcHBpbmdzID1cbiAgZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yX3NlcmlhbGl6ZU1hcHBpbmdzKCkge1xuICAgIHZhciBwcmV2aW91c0dlbmVyYXRlZENvbHVtbiA9IDA7XG4gICAgdmFyIHByZXZpb3VzR2VuZXJhdGVkTGluZSA9IDE7XG4gICAgdmFyIHByZXZpb3VzT3JpZ2luYWxDb2x1bW4gPSAwO1xuICAgIHZhciBwcmV2aW91c09yaWdpbmFsTGluZSA9IDA7XG4gICAgdmFyIHByZXZpb3VzTmFtZSA9IDA7XG4gICAgdmFyIHByZXZpb3VzU291cmNlID0gMDtcbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgdmFyIG5leHQ7XG4gICAgdmFyIG1hcHBpbmc7XG4gICAgdmFyIG5hbWVJZHg7XG4gICAgdmFyIHNvdXJjZUlkeDtcblxuICAgIHZhciBtYXBwaW5ncyA9IHRoaXMuX21hcHBpbmdzLnRvQXJyYXkoKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gbWFwcGluZ3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIG1hcHBpbmcgPSBtYXBwaW5nc1tpXTtcbiAgICAgIG5leHQgPSAnJ1xuXG4gICAgICBpZiAobWFwcGluZy5nZW5lcmF0ZWRMaW5lICE9PSBwcmV2aW91c0dlbmVyYXRlZExpbmUpIHtcbiAgICAgICAgcHJldmlvdXNHZW5lcmF0ZWRDb2x1bW4gPSAwO1xuICAgICAgICB3aGlsZSAobWFwcGluZy5nZW5lcmF0ZWRMaW5lICE9PSBwcmV2aW91c0dlbmVyYXRlZExpbmUpIHtcbiAgICAgICAgICBuZXh0ICs9ICc7JztcbiAgICAgICAgICBwcmV2aW91c0dlbmVyYXRlZExpbmUrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgIGlmICghdXRpbC5jb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNJbmZsYXRlZChtYXBwaW5nLCBtYXBwaW5nc1tpIC0gMV0pKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbmV4dCArPSAnLCc7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbmV4dCArPSBiYXNlNjRWTFEuZW5jb2RlKG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHByZXZpb3VzR2VuZXJhdGVkQ29sdW1uKTtcbiAgICAgIHByZXZpb3VzR2VuZXJhdGVkQ29sdW1uID0gbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW47XG5cbiAgICAgIGlmIChtYXBwaW5nLnNvdXJjZSAhPSBudWxsKSB7XG4gICAgICAgIHNvdXJjZUlkeCA9IHRoaXMuX3NvdXJjZXMuaW5kZXhPZihtYXBwaW5nLnNvdXJjZSk7XG4gICAgICAgIG5leHQgKz0gYmFzZTY0VkxRLmVuY29kZShzb3VyY2VJZHggLSBwcmV2aW91c1NvdXJjZSk7XG4gICAgICAgIHByZXZpb3VzU291cmNlID0gc291cmNlSWR4O1xuXG4gICAgICAgIC8vIGxpbmVzIGFyZSBzdG9yZWQgMC1iYXNlZCBpbiBTb3VyY2VNYXAgc3BlYyB2ZXJzaW9uIDNcbiAgICAgICAgbmV4dCArPSBiYXNlNjRWTFEuZW5jb2RlKG1hcHBpbmcub3JpZ2luYWxMaW5lIC0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHByZXZpb3VzT3JpZ2luYWxMaW5lKTtcbiAgICAgICAgcHJldmlvdXNPcmlnaW5hbExpbmUgPSBtYXBwaW5nLm9yaWdpbmFsTGluZSAtIDE7XG5cbiAgICAgICAgbmV4dCArPSBiYXNlNjRWTFEuZW5jb2RlKG1hcHBpbmcub3JpZ2luYWxDb2x1bW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBwcmV2aW91c09yaWdpbmFsQ29sdW1uKTtcbiAgICAgICAgcHJldmlvdXNPcmlnaW5hbENvbHVtbiA9IG1hcHBpbmcub3JpZ2luYWxDb2x1bW47XG5cbiAgICAgICAgaWYgKG1hcHBpbmcubmFtZSAhPSBudWxsKSB7XG4gICAgICAgICAgbmFtZUlkeCA9IHRoaXMuX25hbWVzLmluZGV4T2YobWFwcGluZy5uYW1lKTtcbiAgICAgICAgICBuZXh0ICs9IGJhc2U2NFZMUS5lbmNvZGUobmFtZUlkeCAtIHByZXZpb3VzTmFtZSk7XG4gICAgICAgICAgcHJldmlvdXNOYW1lID0gbmFtZUlkeDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXN1bHQgKz0gbmV4dDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG5Tb3VyY2VNYXBHZW5lcmF0b3IucHJvdG90eXBlLl9nZW5lcmF0ZVNvdXJjZXNDb250ZW50ID1cbiAgZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yX2dlbmVyYXRlU291cmNlc0NvbnRlbnQoYVNvdXJjZXMsIGFTb3VyY2VSb290KSB7XG4gICAgcmV0dXJuIGFTb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICBpZiAoIXRoaXMuX3NvdXJjZXNDb250ZW50cykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChhU291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICAgIHNvdXJjZSA9IHV0aWwucmVsYXRpdmUoYVNvdXJjZVJvb3QsIHNvdXJjZSk7XG4gICAgICB9XG4gICAgICB2YXIga2V5ID0gdXRpbC50b1NldFN0cmluZyhzb3VyY2UpO1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9zb3VyY2VzQ29udGVudHMsIGtleSlcbiAgICAgICAgPyB0aGlzLl9zb3VyY2VzQ29udGVudHNba2V5XVxuICAgICAgICA6IG51bGw7XG4gICAgfSwgdGhpcyk7XG4gIH07XG5cbi8qKlxuICogRXh0ZXJuYWxpemUgdGhlIHNvdXJjZSBtYXAuXG4gKi9cblNvdXJjZU1hcEdlbmVyYXRvci5wcm90b3R5cGUudG9KU09OID1cbiAgZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yX3RvSlNPTigpIHtcbiAgICB2YXIgbWFwID0ge1xuICAgICAgdmVyc2lvbjogdGhpcy5fdmVyc2lvbixcbiAgICAgIHNvdXJjZXM6IHRoaXMuX3NvdXJjZXMudG9BcnJheSgpLFxuICAgICAgbmFtZXM6IHRoaXMuX25hbWVzLnRvQXJyYXkoKSxcbiAgICAgIG1hcHBpbmdzOiB0aGlzLl9zZXJpYWxpemVNYXBwaW5ncygpXG4gICAgfTtcbiAgICBpZiAodGhpcy5fZmlsZSAhPSBudWxsKSB7XG4gICAgICBtYXAuZmlsZSA9IHRoaXMuX2ZpbGU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9zb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgIG1hcC5zb3VyY2VSb290ID0gdGhpcy5fc291cmNlUm9vdDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3NvdXJjZXNDb250ZW50cykge1xuICAgICAgbWFwLnNvdXJjZXNDb250ZW50ID0gdGhpcy5fZ2VuZXJhdGVTb3VyY2VzQ29udGVudChtYXAuc291cmNlcywgbWFwLnNvdXJjZVJvb3QpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXA7XG4gIH07XG5cbi8qKlxuICogUmVuZGVyIHRoZSBzb3VyY2UgbWFwIGJlaW5nIGdlbmVyYXRlZCB0byBhIHN0cmluZy5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS50b1N0cmluZyA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcEdlbmVyYXRvcl90b1N0cmluZygpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy50b0pTT04oKSk7XG4gIH07XG5cbmV4cG9ydHMuU291cmNlTWFwR2VuZXJhdG9yID0gU291cmNlTWFwR2VuZXJhdG9yO1xuIiwiLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqL1xuXG52YXIgU291cmNlTWFwR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9zb3VyY2UtbWFwLWdlbmVyYXRvcicpLlNvdXJjZU1hcEdlbmVyYXRvcjtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbi8vIE1hdGNoZXMgYSBXaW5kb3dzLXN0eWxlIGBcXHJcXG5gIG5ld2xpbmUgb3IgYSBgXFxuYCBuZXdsaW5lIHVzZWQgYnkgYWxsIG90aGVyXG4vLyBvcGVyYXRpbmcgc3lzdGVtcyB0aGVzZSBkYXlzIChjYXB0dXJpbmcgdGhlIHJlc3VsdCkuXG52YXIgUkVHRVhfTkVXTElORSA9IC8oXFxyP1xcbikvO1xuXG4vLyBOZXdsaW5lIGNoYXJhY3RlciBjb2RlIGZvciBjaGFyQ29kZUF0KCkgY29tcGFyaXNvbnNcbnZhciBORVdMSU5FX0NPREUgPSAxMDtcblxuLy8gUHJpdmF0ZSBzeW1ib2wgZm9yIGlkZW50aWZ5aW5nIGBTb3VyY2VOb2RlYHMgd2hlbiBtdWx0aXBsZSB2ZXJzaW9ucyBvZlxuLy8gdGhlIHNvdXJjZS1tYXAgbGlicmFyeSBhcmUgbG9hZGVkLiBUaGlzIE1VU1QgTk9UIENIQU5HRSBhY3Jvc3Ncbi8vIHZlcnNpb25zIVxudmFyIGlzU291cmNlTm9kZSA9IFwiJCQkaXNTb3VyY2VOb2RlJCQkXCI7XG5cbi8qKlxuICogU291cmNlTm9kZXMgcHJvdmlkZSBhIHdheSB0byBhYnN0cmFjdCBvdmVyIGludGVycG9sYXRpbmcvY29uY2F0ZW5hdGluZ1xuICogc25pcHBldHMgb2YgZ2VuZXJhdGVkIEphdmFTY3JpcHQgc291cmNlIGNvZGUgd2hpbGUgbWFpbnRhaW5pbmcgdGhlIGxpbmUgYW5kXG4gKiBjb2x1bW4gaW5mb3JtYXRpb24gYXNzb2NpYXRlZCB3aXRoIHRoZSBvcmlnaW5hbCBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcGFyYW0gYUxpbmUgVGhlIG9yaWdpbmFsIGxpbmUgbnVtYmVyLlxuICogQHBhcmFtIGFDb2x1bW4gVGhlIG9yaWdpbmFsIGNvbHVtbiBudW1iZXIuXG4gKiBAcGFyYW0gYVNvdXJjZSBUaGUgb3JpZ2luYWwgc291cmNlJ3MgZmlsZW5hbWUuXG4gKiBAcGFyYW0gYUNodW5rcyBPcHRpb25hbC4gQW4gYXJyYXkgb2Ygc3RyaW5ncyB3aGljaCBhcmUgc25pcHBldHMgb2ZcbiAqICAgICAgICBnZW5lcmF0ZWQgSlMsIG9yIG90aGVyIFNvdXJjZU5vZGVzLlxuICogQHBhcmFtIGFOYW1lIFRoZSBvcmlnaW5hbCBpZGVudGlmaWVyLlxuICovXG5mdW5jdGlvbiBTb3VyY2VOb2RlKGFMaW5lLCBhQ29sdW1uLCBhU291cmNlLCBhQ2h1bmtzLCBhTmFtZSkge1xuICB0aGlzLmNoaWxkcmVuID0gW107XG4gIHRoaXMuc291cmNlQ29udGVudHMgPSB7fTtcbiAgdGhpcy5saW5lID0gYUxpbmUgPT0gbnVsbCA/IG51bGwgOiBhTGluZTtcbiAgdGhpcy5jb2x1bW4gPSBhQ29sdW1uID09IG51bGwgPyBudWxsIDogYUNvbHVtbjtcbiAgdGhpcy5zb3VyY2UgPSBhU291cmNlID09IG51bGwgPyBudWxsIDogYVNvdXJjZTtcbiAgdGhpcy5uYW1lID0gYU5hbWUgPT0gbnVsbCA/IG51bGwgOiBhTmFtZTtcbiAgdGhpc1tpc1NvdXJjZU5vZGVdID0gdHJ1ZTtcbiAgaWYgKGFDaHVua3MgIT0gbnVsbCkgdGhpcy5hZGQoYUNodW5rcyk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIFNvdXJjZU5vZGUgZnJvbSBnZW5lcmF0ZWQgY29kZSBhbmQgYSBTb3VyY2VNYXBDb25zdW1lci5cbiAqXG4gKiBAcGFyYW0gYUdlbmVyYXRlZENvZGUgVGhlIGdlbmVyYXRlZCBjb2RlXG4gKiBAcGFyYW0gYVNvdXJjZU1hcENvbnN1bWVyIFRoZSBTb3VyY2VNYXAgZm9yIHRoZSBnZW5lcmF0ZWQgY29kZVxuICogQHBhcmFtIGFSZWxhdGl2ZVBhdGggT3B0aW9uYWwuIFRoZSBwYXRoIHRoYXQgcmVsYXRpdmUgc291cmNlcyBpbiB0aGVcbiAqICAgICAgICBTb3VyY2VNYXBDb25zdW1lciBzaG91bGQgYmUgcmVsYXRpdmUgdG8uXG4gKi9cblNvdXJjZU5vZGUuZnJvbVN0cmluZ1dpdGhTb3VyY2VNYXAgPVxuICBmdW5jdGlvbiBTb3VyY2VOb2RlX2Zyb21TdHJpbmdXaXRoU291cmNlTWFwKGFHZW5lcmF0ZWRDb2RlLCBhU291cmNlTWFwQ29uc3VtZXIsIGFSZWxhdGl2ZVBhdGgpIHtcbiAgICAvLyBUaGUgU291cmNlTm9kZSB3ZSB3YW50IHRvIGZpbGwgd2l0aCB0aGUgZ2VuZXJhdGVkIGNvZGVcbiAgICAvLyBhbmQgdGhlIFNvdXJjZU1hcFxuICAgIHZhciBub2RlID0gbmV3IFNvdXJjZU5vZGUoKTtcblxuICAgIC8vIEFsbCBldmVuIGluZGljZXMgb2YgdGhpcyBhcnJheSBhcmUgb25lIGxpbmUgb2YgdGhlIGdlbmVyYXRlZCBjb2RlLFxuICAgIC8vIHdoaWxlIGFsbCBvZGQgaW5kaWNlcyBhcmUgdGhlIG5ld2xpbmVzIGJldHdlZW4gdHdvIGFkamFjZW50IGxpbmVzXG4gICAgLy8gKHNpbmNlIGBSRUdFWF9ORVdMSU5FYCBjYXB0dXJlcyBpdHMgbWF0Y2gpLlxuICAgIC8vIFByb2Nlc3NlZCBmcmFnbWVudHMgYXJlIHJlbW92ZWQgZnJvbSB0aGlzIGFycmF5LCBieSBjYWxsaW5nIGBzaGlmdE5leHRMaW5lYC5cbiAgICB2YXIgcmVtYWluaW5nTGluZXMgPSBhR2VuZXJhdGVkQ29kZS5zcGxpdChSRUdFWF9ORVdMSU5FKTtcbiAgICB2YXIgc2hpZnROZXh0TGluZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxpbmVDb250ZW50cyA9IHJlbWFpbmluZ0xpbmVzLnNoaWZ0KCk7XG4gICAgICAvLyBUaGUgbGFzdCBsaW5lIG9mIGEgZmlsZSBtaWdodCBub3QgaGF2ZSBhIG5ld2xpbmUuXG4gICAgICB2YXIgbmV3TGluZSA9IHJlbWFpbmluZ0xpbmVzLnNoaWZ0KCkgfHwgXCJcIjtcbiAgICAgIHJldHVybiBsaW5lQ29udGVudHMgKyBuZXdMaW5lO1xuICAgIH07XG5cbiAgICAvLyBXZSBuZWVkIHRvIHJlbWVtYmVyIHRoZSBwb3NpdGlvbiBvZiBcInJlbWFpbmluZ0xpbmVzXCJcbiAgICB2YXIgbGFzdEdlbmVyYXRlZExpbmUgPSAxLCBsYXN0R2VuZXJhdGVkQ29sdW1uID0gMDtcblxuICAgIC8vIFRoZSBnZW5lcmF0ZSBTb3VyY2VOb2RlcyB3ZSBuZWVkIGEgY29kZSByYW5nZS5cbiAgICAvLyBUbyBleHRyYWN0IGl0IGN1cnJlbnQgYW5kIGxhc3QgbWFwcGluZyBpcyB1c2VkLlxuICAgIC8vIEhlcmUgd2Ugc3RvcmUgdGhlIGxhc3QgbWFwcGluZy5cbiAgICB2YXIgbGFzdE1hcHBpbmcgPSBudWxsO1xuXG4gICAgYVNvdXJjZU1hcENvbnN1bWVyLmVhY2hNYXBwaW5nKGZ1bmN0aW9uIChtYXBwaW5nKSB7XG4gICAgICBpZiAobGFzdE1hcHBpbmcgIT09IG51bGwpIHtcbiAgICAgICAgLy8gV2UgYWRkIHRoZSBjb2RlIGZyb20gXCJsYXN0TWFwcGluZ1wiIHRvIFwibWFwcGluZ1wiOlxuICAgICAgICAvLyBGaXJzdCBjaGVjayBpZiB0aGVyZSBpcyBhIG5ldyBsaW5lIGluIGJldHdlZW4uXG4gICAgICAgIGlmIChsYXN0R2VuZXJhdGVkTGluZSA8IG1hcHBpbmcuZ2VuZXJhdGVkTGluZSkge1xuICAgICAgICAgIC8vIEFzc29jaWF0ZSBmaXJzdCBsaW5lIHdpdGggXCJsYXN0TWFwcGluZ1wiXG4gICAgICAgICAgYWRkTWFwcGluZ1dpdGhDb2RlKGxhc3RNYXBwaW5nLCBzaGlmdE5leHRMaW5lKCkpO1xuICAgICAgICAgIGxhc3RHZW5lcmF0ZWRMaW5lKys7XG4gICAgICAgICAgbGFzdEdlbmVyYXRlZENvbHVtbiA9IDA7XG4gICAgICAgICAgLy8gVGhlIHJlbWFpbmluZyBjb2RlIGlzIGFkZGVkIHdpdGhvdXQgbWFwcGluZ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRoZXJlIGlzIG5vIG5ldyBsaW5lIGluIGJldHdlZW4uXG4gICAgICAgICAgLy8gQXNzb2NpYXRlIHRoZSBjb2RlIGJldHdlZW4gXCJsYXN0R2VuZXJhdGVkQ29sdW1uXCIgYW5kXG4gICAgICAgICAgLy8gXCJtYXBwaW5nLmdlbmVyYXRlZENvbHVtblwiIHdpdGggXCJsYXN0TWFwcGluZ1wiXG4gICAgICAgICAgdmFyIG5leHRMaW5lID0gcmVtYWluaW5nTGluZXNbMF07XG4gICAgICAgICAgdmFyIGNvZGUgPSBuZXh0TGluZS5zdWJzdHIoMCwgbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4gLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RHZW5lcmF0ZWRDb2x1bW4pO1xuICAgICAgICAgIHJlbWFpbmluZ0xpbmVzWzBdID0gbmV4dExpbmUuc3Vic3RyKG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0R2VuZXJhdGVkQ29sdW1uKTtcbiAgICAgICAgICBsYXN0R2VuZXJhdGVkQ29sdW1uID0gbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW47XG4gICAgICAgICAgYWRkTWFwcGluZ1dpdGhDb2RlKGxhc3RNYXBwaW5nLCBjb2RlKTtcbiAgICAgICAgICAvLyBObyBtb3JlIHJlbWFpbmluZyBjb2RlLCBjb250aW51ZVxuICAgICAgICAgIGxhc3RNYXBwaW5nID0gbWFwcGluZztcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIFdlIGFkZCB0aGUgZ2VuZXJhdGVkIGNvZGUgdW50aWwgdGhlIGZpcnN0IG1hcHBpbmdcbiAgICAgIC8vIHRvIHRoZSBTb3VyY2VOb2RlIHdpdGhvdXQgYW55IG1hcHBpbmcuXG4gICAgICAvLyBFYWNoIGxpbmUgaXMgYWRkZWQgYXMgc2VwYXJhdGUgc3RyaW5nLlxuICAgICAgd2hpbGUgKGxhc3RHZW5lcmF0ZWRMaW5lIDwgbWFwcGluZy5nZW5lcmF0ZWRMaW5lKSB7XG4gICAgICAgIG5vZGUuYWRkKHNoaWZ0TmV4dExpbmUoKSk7XG4gICAgICAgIGxhc3RHZW5lcmF0ZWRMaW5lKys7XG4gICAgICB9XG4gICAgICBpZiAobGFzdEdlbmVyYXRlZENvbHVtbiA8IG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uKSB7XG4gICAgICAgIHZhciBuZXh0TGluZSA9IHJlbWFpbmluZ0xpbmVzWzBdO1xuICAgICAgICBub2RlLmFkZChuZXh0TGluZS5zdWJzdHIoMCwgbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4pKTtcbiAgICAgICAgcmVtYWluaW5nTGluZXNbMF0gPSBuZXh0TGluZS5zdWJzdHIobWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4pO1xuICAgICAgICBsYXN0R2VuZXJhdGVkQ29sdW1uID0gbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW47XG4gICAgICB9XG4gICAgICBsYXN0TWFwcGluZyA9IG1hcHBpbmc7XG4gICAgfSwgdGhpcyk7XG4gICAgLy8gV2UgaGF2ZSBwcm9jZXNzZWQgYWxsIG1hcHBpbmdzLlxuICAgIGlmIChyZW1haW5pbmdMaW5lcy5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAobGFzdE1hcHBpbmcpIHtcbiAgICAgICAgLy8gQXNzb2NpYXRlIHRoZSByZW1haW5pbmcgY29kZSBpbiB0aGUgY3VycmVudCBsaW5lIHdpdGggXCJsYXN0TWFwcGluZ1wiXG4gICAgICAgIGFkZE1hcHBpbmdXaXRoQ29kZShsYXN0TWFwcGluZywgc2hpZnROZXh0TGluZSgpKTtcbiAgICAgIH1cbiAgICAgIC8vIGFuZCBhZGQgdGhlIHJlbWFpbmluZyBsaW5lcyB3aXRob3V0IGFueSBtYXBwaW5nXG4gICAgICBub2RlLmFkZChyZW1haW5pbmdMaW5lcy5qb2luKFwiXCIpKTtcbiAgICB9XG5cbiAgICAvLyBDb3B5IHNvdXJjZXNDb250ZW50IGludG8gU291cmNlTm9kZVxuICAgIGFTb3VyY2VNYXBDb25zdW1lci5zb3VyY2VzLmZvckVhY2goZnVuY3Rpb24gKHNvdXJjZUZpbGUpIHtcbiAgICAgIHZhciBjb250ZW50ID0gYVNvdXJjZU1hcENvbnN1bWVyLnNvdXJjZUNvbnRlbnRGb3Ioc291cmNlRmlsZSk7XG4gICAgICBpZiAoY29udGVudCAhPSBudWxsKSB7XG4gICAgICAgIGlmIChhUmVsYXRpdmVQYXRoICE9IG51bGwpIHtcbiAgICAgICAgICBzb3VyY2VGaWxlID0gdXRpbC5qb2luKGFSZWxhdGl2ZVBhdGgsIHNvdXJjZUZpbGUpO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUuc2V0U291cmNlQ29udGVudChzb3VyY2VGaWxlLCBjb250ZW50KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBub2RlO1xuXG4gICAgZnVuY3Rpb24gYWRkTWFwcGluZ1dpdGhDb2RlKG1hcHBpbmcsIGNvZGUpIHtcbiAgICAgIGlmIChtYXBwaW5nID09PSBudWxsIHx8IG1hcHBpbmcuc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbm9kZS5hZGQoY29kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgc291cmNlID0gYVJlbGF0aXZlUGF0aFxuICAgICAgICAgID8gdXRpbC5qb2luKGFSZWxhdGl2ZVBhdGgsIG1hcHBpbmcuc291cmNlKVxuICAgICAgICAgIDogbWFwcGluZy5zb3VyY2U7XG4gICAgICAgIG5vZGUuYWRkKG5ldyBTb3VyY2VOb2RlKG1hcHBpbmcub3JpZ2luYWxMaW5lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmcubmFtZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuLyoqXG4gKiBBZGQgYSBjaHVuayBvZiBnZW5lcmF0ZWQgSlMgdG8gdGhpcyBzb3VyY2Ugbm9kZS5cbiAqXG4gKiBAcGFyYW0gYUNodW5rIEEgc3RyaW5nIHNuaXBwZXQgb2YgZ2VuZXJhdGVkIEpTIGNvZGUsIGFub3RoZXIgaW5zdGFuY2Ugb2ZcbiAqICAgICAgICBTb3VyY2VOb2RlLCBvciBhbiBhcnJheSB3aGVyZSBlYWNoIG1lbWJlciBpcyBvbmUgb2YgdGhvc2UgdGhpbmdzLlxuICovXG5Tb3VyY2VOb2RlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBTb3VyY2VOb2RlX2FkZChhQ2h1bmspIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYUNodW5rKSkge1xuICAgIGFDaHVuay5mb3JFYWNoKGZ1bmN0aW9uIChjaHVuaykge1xuICAgICAgdGhpcy5hZGQoY2h1bmspO1xuICAgIH0sIHRoaXMpO1xuICB9XG4gIGVsc2UgaWYgKGFDaHVua1tpc1NvdXJjZU5vZGVdIHx8IHR5cGVvZiBhQ2h1bmsgPT09IFwic3RyaW5nXCIpIHtcbiAgICBpZiAoYUNodW5rKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuLnB1c2goYUNodW5rKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgIFwiRXhwZWN0ZWQgYSBTb3VyY2VOb2RlLCBzdHJpbmcsIG9yIGFuIGFycmF5IG9mIFNvdXJjZU5vZGVzIGFuZCBzdHJpbmdzLiBHb3QgXCIgKyBhQ2h1bmtcbiAgICApO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYSBjaHVuayBvZiBnZW5lcmF0ZWQgSlMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGlzIHNvdXJjZSBub2RlLlxuICpcbiAqIEBwYXJhbSBhQ2h1bmsgQSBzdHJpbmcgc25pcHBldCBvZiBnZW5lcmF0ZWQgSlMgY29kZSwgYW5vdGhlciBpbnN0YW5jZSBvZlxuICogICAgICAgIFNvdXJjZU5vZGUsIG9yIGFuIGFycmF5IHdoZXJlIGVhY2ggbWVtYmVyIGlzIG9uZSBvZiB0aG9zZSB0aGluZ3MuXG4gKi9cblNvdXJjZU5vZGUucHJvdG90eXBlLnByZXBlbmQgPSBmdW5jdGlvbiBTb3VyY2VOb2RlX3ByZXBlbmQoYUNodW5rKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFDaHVuaykpIHtcbiAgICBmb3IgKHZhciBpID0gYUNodW5rLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xuICAgICAgdGhpcy5wcmVwZW5kKGFDaHVua1tpXSk7XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKGFDaHVua1tpc1NvdXJjZU5vZGVdIHx8IHR5cGVvZiBhQ2h1bmsgPT09IFwic3RyaW5nXCIpIHtcbiAgICB0aGlzLmNoaWxkcmVuLnVuc2hpZnQoYUNodW5rKTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgXCJFeHBlY3RlZCBhIFNvdXJjZU5vZGUsIHN0cmluZywgb3IgYW4gYXJyYXkgb2YgU291cmNlTm9kZXMgYW5kIHN0cmluZ3MuIEdvdCBcIiArIGFDaHVua1xuICAgICk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdhbGsgb3ZlciB0aGUgdHJlZSBvZiBKUyBzbmlwcGV0cyBpbiB0aGlzIG5vZGUgYW5kIGl0cyBjaGlsZHJlbi4gVGhlXG4gKiB3YWxraW5nIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbmNlIGZvciBlYWNoIHNuaXBwZXQgb2YgSlMgYW5kIGlzIHBhc3NlZCB0aGF0XG4gKiBzbmlwcGV0IGFuZCB0aGUgaXRzIG9yaWdpbmFsIGFzc29jaWF0ZWQgc291cmNlJ3MgbGluZS9jb2x1bW4gbG9jYXRpb24uXG4gKlxuICogQHBhcmFtIGFGbiBUaGUgdHJhdmVyc2FsIGZ1bmN0aW9uLlxuICovXG5Tb3VyY2VOb2RlLnByb3RvdHlwZS53YWxrID0gZnVuY3Rpb24gU291cmNlTm9kZV93YWxrKGFGbikge1xuICB2YXIgY2h1bms7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY2h1bmsgPSB0aGlzLmNoaWxkcmVuW2ldO1xuICAgIGlmIChjaHVua1tpc1NvdXJjZU5vZGVdKSB7XG4gICAgICBjaHVuay53YWxrKGFGbik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYgKGNodW5rICE9PSAnJykge1xuICAgICAgICBhRm4oY2h1bmssIHsgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgIGxpbmU6IHRoaXMubGluZSxcbiAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogdGhpcy5jb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIExpa2UgYFN0cmluZy5wcm90b3R5cGUuam9pbmAgZXhjZXB0IGZvciBTb3VyY2VOb2Rlcy4gSW5zZXJ0cyBgYVN0cmAgYmV0d2VlblxuICogZWFjaCBvZiBgdGhpcy5jaGlsZHJlbmAuXG4gKlxuICogQHBhcmFtIGFTZXAgVGhlIHNlcGFyYXRvci5cbiAqL1xuU291cmNlTm9kZS5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uIFNvdXJjZU5vZGVfam9pbihhU2VwKSB7XG4gIHZhciBuZXdDaGlsZHJlbjtcbiAgdmFyIGk7XG4gIHZhciBsZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcbiAgaWYgKGxlbiA+IDApIHtcbiAgICBuZXdDaGlsZHJlbiA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW4tMTsgaSsrKSB7XG4gICAgICBuZXdDaGlsZHJlbi5wdXNoKHRoaXMuY2hpbGRyZW5baV0pO1xuICAgICAgbmV3Q2hpbGRyZW4ucHVzaChhU2VwKTtcbiAgICB9XG4gICAgbmV3Q2hpbGRyZW4ucHVzaCh0aGlzLmNoaWxkcmVuW2ldKTtcbiAgICB0aGlzLmNoaWxkcmVuID0gbmV3Q2hpbGRyZW47XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENhbGwgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlIG9uIHRoZSB2ZXJ5IHJpZ2h0LW1vc3Qgc291cmNlIHNuaXBwZXQuIFVzZWZ1bFxuICogZm9yIHRyaW1taW5nIHdoaXRlc3BhY2UgZnJvbSB0aGUgZW5kIG9mIGEgc291cmNlIG5vZGUsIGV0Yy5cbiAqXG4gKiBAcGFyYW0gYVBhdHRlcm4gVGhlIHBhdHRlcm4gdG8gcmVwbGFjZS5cbiAqIEBwYXJhbSBhUmVwbGFjZW1lbnQgVGhlIHRoaW5nIHRvIHJlcGxhY2UgdGhlIHBhdHRlcm4gd2l0aC5cbiAqL1xuU291cmNlTm9kZS5wcm90b3R5cGUucmVwbGFjZVJpZ2h0ID0gZnVuY3Rpb24gU291cmNlTm9kZV9yZXBsYWNlUmlnaHQoYVBhdHRlcm4sIGFSZXBsYWNlbWVudCkge1xuICB2YXIgbGFzdENoaWxkID0gdGhpcy5jaGlsZHJlblt0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDFdO1xuICBpZiAobGFzdENoaWxkW2lzU291cmNlTm9kZV0pIHtcbiAgICBsYXN0Q2hpbGQucmVwbGFjZVJpZ2h0KGFQYXR0ZXJuLCBhUmVwbGFjZW1lbnQpO1xuICB9XG4gIGVsc2UgaWYgKHR5cGVvZiBsYXN0Q2hpbGQgPT09ICdzdHJpbmcnKSB7XG4gICAgdGhpcy5jaGlsZHJlblt0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDFdID0gbGFzdENoaWxkLnJlcGxhY2UoYVBhdHRlcm4sIGFSZXBsYWNlbWVudCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy5jaGlsZHJlbi5wdXNoKCcnLnJlcGxhY2UoYVBhdHRlcm4sIGFSZXBsYWNlbWVudCkpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIHNvdXJjZSBjb250ZW50IGZvciBhIHNvdXJjZSBmaWxlLiBUaGlzIHdpbGwgYmUgYWRkZWQgdG8gdGhlIFNvdXJjZU1hcEdlbmVyYXRvclxuICogaW4gdGhlIHNvdXJjZXNDb250ZW50IGZpZWxkLlxuICpcbiAqIEBwYXJhbSBhU291cmNlRmlsZSBUaGUgZmlsZW5hbWUgb2YgdGhlIHNvdXJjZSBmaWxlXG4gKiBAcGFyYW0gYVNvdXJjZUNvbnRlbnQgVGhlIGNvbnRlbnQgb2YgdGhlIHNvdXJjZSBmaWxlXG4gKi9cblNvdXJjZU5vZGUucHJvdG90eXBlLnNldFNvdXJjZUNvbnRlbnQgPVxuICBmdW5jdGlvbiBTb3VyY2VOb2RlX3NldFNvdXJjZUNvbnRlbnQoYVNvdXJjZUZpbGUsIGFTb3VyY2VDb250ZW50KSB7XG4gICAgdGhpcy5zb3VyY2VDb250ZW50c1t1dGlsLnRvU2V0U3RyaW5nKGFTb3VyY2VGaWxlKV0gPSBhU291cmNlQ29udGVudDtcbiAgfTtcblxuLyoqXG4gKiBXYWxrIG92ZXIgdGhlIHRyZWUgb2YgU291cmNlTm9kZXMuIFRoZSB3YWxraW5nIGZ1bmN0aW9uIGlzIGNhbGxlZCBmb3IgZWFjaFxuICogc291cmNlIGZpbGUgY29udGVudCBhbmQgaXMgcGFzc2VkIHRoZSBmaWxlbmFtZSBhbmQgc291cmNlIGNvbnRlbnQuXG4gKlxuICogQHBhcmFtIGFGbiBUaGUgdHJhdmVyc2FsIGZ1bmN0aW9uLlxuICovXG5Tb3VyY2VOb2RlLnByb3RvdHlwZS53YWxrU291cmNlQ29udGVudHMgPVxuICBmdW5jdGlvbiBTb3VyY2VOb2RlX3dhbGtTb3VyY2VDb250ZW50cyhhRm4pIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXMuY2hpbGRyZW5baV1baXNTb3VyY2VOb2RlXSkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuW2ldLndhbGtTb3VyY2VDb250ZW50cyhhRm4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzb3VyY2VzID0gT2JqZWN0LmtleXModGhpcy5zb3VyY2VDb250ZW50cyk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNvdXJjZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFGbih1dGlsLmZyb21TZXRTdHJpbmcoc291cmNlc1tpXSksIHRoaXMuc291cmNlQ29udGVudHNbc291cmNlc1tpXV0pO1xuICAgIH1cbiAgfTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIHNvdXJjZSBub2RlLiBXYWxrcyBvdmVyIHRoZSB0cmVlXG4gKiBhbmQgY29uY2F0ZW5hdGVzIGFsbCB0aGUgdmFyaW91cyBzbmlwcGV0cyB0b2dldGhlciB0byBvbmUgc3RyaW5nLlxuICovXG5Tb3VyY2VOb2RlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIFNvdXJjZU5vZGVfdG9TdHJpbmcoKSB7XG4gIHZhciBzdHIgPSBcIlwiO1xuICB0aGlzLndhbGsoZnVuY3Rpb24gKGNodW5rKSB7XG4gICAgc3RyICs9IGNodW5rO1xuICB9KTtcbiAgcmV0dXJuIHN0cjtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgc291cmNlIG5vZGUgYWxvbmcgd2l0aCBhIHNvdXJjZVxuICogbWFwLlxuICovXG5Tb3VyY2VOb2RlLnByb3RvdHlwZS50b1N0cmluZ1dpdGhTb3VyY2VNYXAgPSBmdW5jdGlvbiBTb3VyY2VOb2RlX3RvU3RyaW5nV2l0aFNvdXJjZU1hcChhQXJncykge1xuICB2YXIgZ2VuZXJhdGVkID0ge1xuICAgIGNvZGU6IFwiXCIsXG4gICAgbGluZTogMSxcbiAgICBjb2x1bW46IDBcbiAgfTtcbiAgdmFyIG1hcCA9IG5ldyBTb3VyY2VNYXBHZW5lcmF0b3IoYUFyZ3MpO1xuICB2YXIgc291cmNlTWFwcGluZ0FjdGl2ZSA9IGZhbHNlO1xuICB2YXIgbGFzdE9yaWdpbmFsU291cmNlID0gbnVsbDtcbiAgdmFyIGxhc3RPcmlnaW5hbExpbmUgPSBudWxsO1xuICB2YXIgbGFzdE9yaWdpbmFsQ29sdW1uID0gbnVsbDtcbiAgdmFyIGxhc3RPcmlnaW5hbE5hbWUgPSBudWxsO1xuICB0aGlzLndhbGsoZnVuY3Rpb24gKGNodW5rLCBvcmlnaW5hbCkge1xuICAgIGdlbmVyYXRlZC5jb2RlICs9IGNodW5rO1xuICAgIGlmIChvcmlnaW5hbC5zb3VyY2UgIT09IG51bGxcbiAgICAgICAgJiYgb3JpZ2luYWwubGluZSAhPT0gbnVsbFxuICAgICAgICAmJiBvcmlnaW5hbC5jb2x1bW4gIT09IG51bGwpIHtcbiAgICAgIGlmKGxhc3RPcmlnaW5hbFNvdXJjZSAhPT0gb3JpZ2luYWwuc291cmNlXG4gICAgICAgICB8fCBsYXN0T3JpZ2luYWxMaW5lICE9PSBvcmlnaW5hbC5saW5lXG4gICAgICAgICB8fCBsYXN0T3JpZ2luYWxDb2x1bW4gIT09IG9yaWdpbmFsLmNvbHVtblxuICAgICAgICAgfHwgbGFzdE9yaWdpbmFsTmFtZSAhPT0gb3JpZ2luYWwubmFtZSkge1xuICAgICAgICBtYXAuYWRkTWFwcGluZyh7XG4gICAgICAgICAgc291cmNlOiBvcmlnaW5hbC5zb3VyY2UsXG4gICAgICAgICAgb3JpZ2luYWw6IHtcbiAgICAgICAgICAgIGxpbmU6IG9yaWdpbmFsLmxpbmUsXG4gICAgICAgICAgICBjb2x1bW46IG9yaWdpbmFsLmNvbHVtblxuICAgICAgICAgIH0sXG4gICAgICAgICAgZ2VuZXJhdGVkOiB7XG4gICAgICAgICAgICBsaW5lOiBnZW5lcmF0ZWQubGluZSxcbiAgICAgICAgICAgIGNvbHVtbjogZ2VuZXJhdGVkLmNvbHVtblxuICAgICAgICAgIH0sXG4gICAgICAgICAgbmFtZTogb3JpZ2luYWwubmFtZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGxhc3RPcmlnaW5hbFNvdXJjZSA9IG9yaWdpbmFsLnNvdXJjZTtcbiAgICAgIGxhc3RPcmlnaW5hbExpbmUgPSBvcmlnaW5hbC5saW5lO1xuICAgICAgbGFzdE9yaWdpbmFsQ29sdW1uID0gb3JpZ2luYWwuY29sdW1uO1xuICAgICAgbGFzdE9yaWdpbmFsTmFtZSA9IG9yaWdpbmFsLm5hbWU7XG4gICAgICBzb3VyY2VNYXBwaW5nQWN0aXZlID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHNvdXJjZU1hcHBpbmdBY3RpdmUpIHtcbiAgICAgIG1hcC5hZGRNYXBwaW5nKHtcbiAgICAgICAgZ2VuZXJhdGVkOiB7XG4gICAgICAgICAgbGluZTogZ2VuZXJhdGVkLmxpbmUsXG4gICAgICAgICAgY29sdW1uOiBnZW5lcmF0ZWQuY29sdW1uXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgbGFzdE9yaWdpbmFsU291cmNlID0gbnVsbDtcbiAgICAgIHNvdXJjZU1hcHBpbmdBY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gICAgZm9yICh2YXIgaWR4ID0gMCwgbGVuZ3RoID0gY2h1bmsubGVuZ3RoOyBpZHggPCBsZW5ndGg7IGlkeCsrKSB7XG4gICAgICBpZiAoY2h1bmsuY2hhckNvZGVBdChpZHgpID09PSBORVdMSU5FX0NPREUpIHtcbiAgICAgICAgZ2VuZXJhdGVkLmxpbmUrKztcbiAgICAgICAgZ2VuZXJhdGVkLmNvbHVtbiA9IDA7XG4gICAgICAgIC8vIE1hcHBpbmdzIGVuZCBhdCBlb2xcbiAgICAgICAgaWYgKGlkeCArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIGxhc3RPcmlnaW5hbFNvdXJjZSA9IG51bGw7XG4gICAgICAgICAgc291cmNlTWFwcGluZ0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZU1hcHBpbmdBY3RpdmUpIHtcbiAgICAgICAgICBtYXAuYWRkTWFwcGluZyh7XG4gICAgICAgICAgICBzb3VyY2U6IG9yaWdpbmFsLnNvdXJjZSxcbiAgICAgICAgICAgIG9yaWdpbmFsOiB7XG4gICAgICAgICAgICAgIGxpbmU6IG9yaWdpbmFsLmxpbmUsXG4gICAgICAgICAgICAgIGNvbHVtbjogb3JpZ2luYWwuY29sdW1uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2VuZXJhdGVkOiB7XG4gICAgICAgICAgICAgIGxpbmU6IGdlbmVyYXRlZC5saW5lLFxuICAgICAgICAgICAgICBjb2x1bW46IGdlbmVyYXRlZC5jb2x1bW5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBuYW1lOiBvcmlnaW5hbC5uYW1lXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdlbmVyYXRlZC5jb2x1bW4rKztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICB0aGlzLndhbGtTb3VyY2VDb250ZW50cyhmdW5jdGlvbiAoc291cmNlRmlsZSwgc291cmNlQ29udGVudCkge1xuICAgIG1hcC5zZXRTb3VyY2VDb250ZW50KHNvdXJjZUZpbGUsIHNvdXJjZUNvbnRlbnQpO1xuICB9KTtcblxuICByZXR1cm4geyBjb2RlOiBnZW5lcmF0ZWQuY29kZSwgbWFwOiBtYXAgfTtcbn07XG5cbmV4cG9ydHMuU291cmNlTm9kZSA9IFNvdXJjZU5vZGU7XG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbi8qKlxuICogVGhpcyBpcyBhIGhlbHBlciBmdW5jdGlvbiBmb3IgZ2V0dGluZyB2YWx1ZXMgZnJvbSBwYXJhbWV0ZXIvb3B0aW9uc1xuICogb2JqZWN0cy5cbiAqXG4gKiBAcGFyYW0gYXJncyBUaGUgb2JqZWN0IHdlIGFyZSBleHRyYWN0aW5nIHZhbHVlcyBmcm9tXG4gKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgd2UgYXJlIGdldHRpbmcuXG4gKiBAcGFyYW0gZGVmYXVsdFZhbHVlIEFuIG9wdGlvbmFsIHZhbHVlIHRvIHJldHVybiBpZiB0aGUgcHJvcGVydHkgaXMgbWlzc2luZ1xuICogZnJvbSB0aGUgb2JqZWN0LiBJZiB0aGlzIGlzIG5vdCBzcGVjaWZpZWQgYW5kIHRoZSBwcm9wZXJ0eSBpcyBtaXNzaW5nLCBhblxuICogZXJyb3Igd2lsbCBiZSB0aHJvd24uXG4gKi9cbmZ1bmN0aW9uIGdldEFyZyhhQXJncywgYU5hbWUsIGFEZWZhdWx0VmFsdWUpIHtcbiAgaWYgKGFOYW1lIGluIGFBcmdzKSB7XG4gICAgcmV0dXJuIGFBcmdzW2FOYW1lXTtcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgcmV0dXJuIGFEZWZhdWx0VmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcIicgKyBhTmFtZSArICdcIiBpcyBhIHJlcXVpcmVkIGFyZ3VtZW50LicpO1xuICB9XG59XG5leHBvcnRzLmdldEFyZyA9IGdldEFyZztcblxudmFyIHVybFJlZ2V4cCA9IC9eKD86KFtcXHcrXFwtLl0rKTopP1xcL1xcLyg/OihcXHcrOlxcdyspQCk/KFtcXHcuXSopKD86OihcXGQrKSk/KFxcUyopJC87XG52YXIgZGF0YVVybFJlZ2V4cCA9IC9eZGF0YTouK1xcLC4rJC87XG5cbmZ1bmN0aW9uIHVybFBhcnNlKGFVcmwpIHtcbiAgdmFyIG1hdGNoID0gYVVybC5tYXRjaCh1cmxSZWdleHApO1xuICBpZiAoIW1hdGNoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzY2hlbWU6IG1hdGNoWzFdLFxuICAgIGF1dGg6IG1hdGNoWzJdLFxuICAgIGhvc3Q6IG1hdGNoWzNdLFxuICAgIHBvcnQ6IG1hdGNoWzRdLFxuICAgIHBhdGg6IG1hdGNoWzVdXG4gIH07XG59XG5leHBvcnRzLnVybFBhcnNlID0gdXJsUGFyc2U7XG5cbmZ1bmN0aW9uIHVybEdlbmVyYXRlKGFQYXJzZWRVcmwpIHtcbiAgdmFyIHVybCA9ICcnO1xuICBpZiAoYVBhcnNlZFVybC5zY2hlbWUpIHtcbiAgICB1cmwgKz0gYVBhcnNlZFVybC5zY2hlbWUgKyAnOic7XG4gIH1cbiAgdXJsICs9ICcvLyc7XG4gIGlmIChhUGFyc2VkVXJsLmF1dGgpIHtcbiAgICB1cmwgKz0gYVBhcnNlZFVybC5hdXRoICsgJ0AnO1xuICB9XG4gIGlmIChhUGFyc2VkVXJsLmhvc3QpIHtcbiAgICB1cmwgKz0gYVBhcnNlZFVybC5ob3N0O1xuICB9XG4gIGlmIChhUGFyc2VkVXJsLnBvcnQpIHtcbiAgICB1cmwgKz0gXCI6XCIgKyBhUGFyc2VkVXJsLnBvcnRcbiAgfVxuICBpZiAoYVBhcnNlZFVybC5wYXRoKSB7XG4gICAgdXJsICs9IGFQYXJzZWRVcmwucGF0aDtcbiAgfVxuICByZXR1cm4gdXJsO1xufVxuZXhwb3J0cy51cmxHZW5lcmF0ZSA9IHVybEdlbmVyYXRlO1xuXG4vKipcbiAqIE5vcm1hbGl6ZXMgYSBwYXRoLCBvciB0aGUgcGF0aCBwb3J0aW9uIG9mIGEgVVJMOlxuICpcbiAqIC0gUmVwbGFjZXMgY29uc2VjdXRpdmUgc2xhc2hlcyB3aXRoIG9uZSBzbGFzaC5cbiAqIC0gUmVtb3ZlcyB1bm5lY2Vzc2FyeSAnLicgcGFydHMuXG4gKiAtIFJlbW92ZXMgdW5uZWNlc3NhcnkgJzxkaXI+Ly4uJyBwYXJ0cy5cbiAqXG4gKiBCYXNlZCBvbiBjb2RlIGluIHRoZSBOb2RlLmpzICdwYXRoJyBjb3JlIG1vZHVsZS5cbiAqXG4gKiBAcGFyYW0gYVBhdGggVGhlIHBhdGggb3IgdXJsIHRvIG5vcm1hbGl6ZS5cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplKGFQYXRoKSB7XG4gIHZhciBwYXRoID0gYVBhdGg7XG4gIHZhciB1cmwgPSB1cmxQYXJzZShhUGF0aCk7XG4gIGlmICh1cmwpIHtcbiAgICBpZiAoIXVybC5wYXRoKSB7XG4gICAgICByZXR1cm4gYVBhdGg7XG4gICAgfVxuICAgIHBhdGggPSB1cmwucGF0aDtcbiAgfVxuICB2YXIgaXNBYnNvbHV0ZSA9IGV4cG9ydHMuaXNBYnNvbHV0ZShwYXRoKTtcblxuICB2YXIgcGFydHMgPSBwYXRoLnNwbGl0KC9cXC8rLyk7XG4gIGZvciAodmFyIHBhcnQsIHVwID0gMCwgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgcGFydCA9IHBhcnRzW2ldO1xuICAgIGlmIChwYXJ0ID09PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKHBhcnQgPT09ICcuLicpIHtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCA+IDApIHtcbiAgICAgIGlmIChwYXJ0ID09PSAnJykge1xuICAgICAgICAvLyBUaGUgZmlyc3QgcGFydCBpcyBibGFuayBpZiB0aGUgcGF0aCBpcyBhYnNvbHV0ZS4gVHJ5aW5nIHRvIGdvXG4gICAgICAgIC8vIGFib3ZlIHRoZSByb290IGlzIGEgbm8tb3AuIFRoZXJlZm9yZSB3ZSBjYW4gcmVtb3ZlIGFsbCAnLi4nIHBhcnRzXG4gICAgICAgIC8vIGRpcmVjdGx5IGFmdGVyIHRoZSByb290LlxuICAgICAgICBwYXJ0cy5zcGxpY2UoaSArIDEsIHVwKTtcbiAgICAgICAgdXAgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFydHMuc3BsaWNlKGksIDIpO1xuICAgICAgICB1cC0tO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBwYXRoID0gcGFydHMuam9pbignLycpO1xuXG4gIGlmIChwYXRoID09PSAnJykge1xuICAgIHBhdGggPSBpc0Fic29sdXRlID8gJy8nIDogJy4nO1xuICB9XG5cbiAgaWYgKHVybCkge1xuICAgIHVybC5wYXRoID0gcGF0aDtcbiAgICByZXR1cm4gdXJsR2VuZXJhdGUodXJsKTtcbiAgfVxuICByZXR1cm4gcGF0aDtcbn1cbmV4cG9ydHMubm9ybWFsaXplID0gbm9ybWFsaXplO1xuXG4vKipcbiAqIEpvaW5zIHR3byBwYXRocy9VUkxzLlxuICpcbiAqIEBwYXJhbSBhUm9vdCBUaGUgcm9vdCBwYXRoIG9yIFVSTC5cbiAqIEBwYXJhbSBhUGF0aCBUaGUgcGF0aCBvciBVUkwgdG8gYmUgam9pbmVkIHdpdGggdGhlIHJvb3QuXG4gKlxuICogLSBJZiBhUGF0aCBpcyBhIFVSTCBvciBhIGRhdGEgVVJJLCBhUGF0aCBpcyByZXR1cm5lZCwgdW5sZXNzIGFQYXRoIGlzIGFcbiAqICAgc2NoZW1lLXJlbGF0aXZlIFVSTDogVGhlbiB0aGUgc2NoZW1lIG9mIGFSb290LCBpZiBhbnksIGlzIHByZXBlbmRlZFxuICogICBmaXJzdC5cbiAqIC0gT3RoZXJ3aXNlIGFQYXRoIGlzIGEgcGF0aC4gSWYgYVJvb3QgaXMgYSBVUkwsIHRoZW4gaXRzIHBhdGggcG9ydGlvblxuICogICBpcyB1cGRhdGVkIHdpdGggdGhlIHJlc3VsdCBhbmQgYVJvb3QgaXMgcmV0dXJuZWQuIE90aGVyd2lzZSB0aGUgcmVzdWx0XG4gKiAgIGlzIHJldHVybmVkLlxuICogICAtIElmIGFQYXRoIGlzIGFic29sdXRlLCB0aGUgcmVzdWx0IGlzIGFQYXRoLlxuICogICAtIE90aGVyd2lzZSB0aGUgdHdvIHBhdGhzIGFyZSBqb2luZWQgd2l0aCBhIHNsYXNoLlxuICogLSBKb2luaW5nIGZvciBleGFtcGxlICdodHRwOi8vJyBhbmQgJ3d3dy5leGFtcGxlLmNvbScgaXMgYWxzbyBzdXBwb3J0ZWQuXG4gKi9cbmZ1bmN0aW9uIGpvaW4oYVJvb3QsIGFQYXRoKSB7XG4gIGlmIChhUm9vdCA9PT0gXCJcIikge1xuICAgIGFSb290ID0gXCIuXCI7XG4gIH1cbiAgaWYgKGFQYXRoID09PSBcIlwiKSB7XG4gICAgYVBhdGggPSBcIi5cIjtcbiAgfVxuICB2YXIgYVBhdGhVcmwgPSB1cmxQYXJzZShhUGF0aCk7XG4gIHZhciBhUm9vdFVybCA9IHVybFBhcnNlKGFSb290KTtcbiAgaWYgKGFSb290VXJsKSB7XG4gICAgYVJvb3QgPSBhUm9vdFVybC5wYXRoIHx8ICcvJztcbiAgfVxuXG4gIC8vIGBqb2luKGZvbywgJy8vd3d3LmV4YW1wbGUub3JnJylgXG4gIGlmIChhUGF0aFVybCAmJiAhYVBhdGhVcmwuc2NoZW1lKSB7XG4gICAgaWYgKGFSb290VXJsKSB7XG4gICAgICBhUGF0aFVybC5zY2hlbWUgPSBhUm9vdFVybC5zY2hlbWU7XG4gICAgfVxuICAgIHJldHVybiB1cmxHZW5lcmF0ZShhUGF0aFVybCk7XG4gIH1cblxuICBpZiAoYVBhdGhVcmwgfHwgYVBhdGgubWF0Y2goZGF0YVVybFJlZ2V4cCkpIHtcbiAgICByZXR1cm4gYVBhdGg7XG4gIH1cblxuICAvLyBgam9pbignaHR0cDovLycsICd3d3cuZXhhbXBsZS5jb20nKWBcbiAgaWYgKGFSb290VXJsICYmICFhUm9vdFVybC5ob3N0ICYmICFhUm9vdFVybC5wYXRoKSB7XG4gICAgYVJvb3RVcmwuaG9zdCA9IGFQYXRoO1xuICAgIHJldHVybiB1cmxHZW5lcmF0ZShhUm9vdFVybCk7XG4gIH1cblxuICB2YXIgam9pbmVkID0gYVBhdGguY2hhckF0KDApID09PSAnLydcbiAgICA/IGFQYXRoXG4gICAgOiBub3JtYWxpemUoYVJvb3QucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyBhUGF0aCk7XG5cbiAgaWYgKGFSb290VXJsKSB7XG4gICAgYVJvb3RVcmwucGF0aCA9IGpvaW5lZDtcbiAgICByZXR1cm4gdXJsR2VuZXJhdGUoYVJvb3RVcmwpO1xuICB9XG4gIHJldHVybiBqb2luZWQ7XG59XG5leHBvcnRzLmpvaW4gPSBqb2luO1xuXG5leHBvcnRzLmlzQWJzb2x1dGUgPSBmdW5jdGlvbiAoYVBhdGgpIHtcbiAgcmV0dXJuIGFQYXRoLmNoYXJBdCgwKSA9PT0gJy8nIHx8ICEhYVBhdGgubWF0Y2godXJsUmVnZXhwKTtcbn07XG5cbi8qKlxuICogTWFrZSBhIHBhdGggcmVsYXRpdmUgdG8gYSBVUkwgb3IgYW5vdGhlciBwYXRoLlxuICpcbiAqIEBwYXJhbSBhUm9vdCBUaGUgcm9vdCBwYXRoIG9yIFVSTC5cbiAqIEBwYXJhbSBhUGF0aCBUaGUgcGF0aCBvciBVUkwgdG8gYmUgbWFkZSByZWxhdGl2ZSB0byBhUm9vdC5cbiAqL1xuZnVuY3Rpb24gcmVsYXRpdmUoYVJvb3QsIGFQYXRoKSB7XG4gIGlmIChhUm9vdCA9PT0gXCJcIikge1xuICAgIGFSb290ID0gXCIuXCI7XG4gIH1cblxuICBhUm9vdCA9IGFSb290LnJlcGxhY2UoL1xcLyQvLCAnJyk7XG5cbiAgLy8gSXQgaXMgcG9zc2libGUgZm9yIHRoZSBwYXRoIHRvIGJlIGFib3ZlIHRoZSByb290LiBJbiB0aGlzIGNhc2UsIHNpbXBseVxuICAvLyBjaGVja2luZyB3aGV0aGVyIHRoZSByb290IGlzIGEgcHJlZml4IG9mIHRoZSBwYXRoIHdvbid0IHdvcmsuIEluc3RlYWQsIHdlXG4gIC8vIG5lZWQgdG8gcmVtb3ZlIGNvbXBvbmVudHMgZnJvbSB0aGUgcm9vdCBvbmUgYnkgb25lLCB1bnRpbCBlaXRoZXIgd2UgZmluZFxuICAvLyBhIHByZWZpeCB0aGF0IGZpdHMsIG9yIHdlIHJ1biBvdXQgb2YgY29tcG9uZW50cyB0byByZW1vdmUuXG4gIHZhciBsZXZlbCA9IDA7XG4gIHdoaWxlIChhUGF0aC5pbmRleE9mKGFSb290ICsgJy8nKSAhPT0gMCkge1xuICAgIHZhciBpbmRleCA9IGFSb290Lmxhc3RJbmRleE9mKFwiL1wiKTtcbiAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICByZXR1cm4gYVBhdGg7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG9ubHkgcGFydCBvZiB0aGUgcm9vdCB0aGF0IGlzIGxlZnQgaXMgdGhlIHNjaGVtZSAoaS5lLiBodHRwOi8vLFxuICAgIC8vIGZpbGU6Ly8vLCBldGMuKSwgb25lIG9yIG1vcmUgc2xhc2hlcyAoLyksIG9yIHNpbXBseSBub3RoaW5nIGF0IGFsbCwgd2VcbiAgICAvLyBoYXZlIGV4aGF1c3RlZCBhbGwgY29tcG9uZW50cywgc28gdGhlIHBhdGggaXMgbm90IHJlbGF0aXZlIHRvIHRoZSByb290LlxuICAgIGFSb290ID0gYVJvb3Quc2xpY2UoMCwgaW5kZXgpO1xuICAgIGlmIChhUm9vdC5tYXRjaCgvXihbXlxcL10rOlxcLyk/XFwvKiQvKSkge1xuICAgICAgcmV0dXJuIGFQYXRoO1xuICAgIH1cblxuICAgICsrbGV2ZWw7XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgd2UgYWRkIGEgXCIuLi9cIiBmb3IgZWFjaCBjb21wb25lbnQgd2UgcmVtb3ZlZCBmcm9tIHRoZSByb290LlxuICByZXR1cm4gQXJyYXkobGV2ZWwgKyAxKS5qb2luKFwiLi4vXCIpICsgYVBhdGguc3Vic3RyKGFSb290Lmxlbmd0aCArIDEpO1xufVxuZXhwb3J0cy5yZWxhdGl2ZSA9IHJlbGF0aXZlO1xuXG52YXIgc3VwcG9ydHNOdWxsUHJvdG8gPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgb2JqID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgcmV0dXJuICEoJ19fcHJvdG9fXycgaW4gb2JqKTtcbn0oKSk7XG5cbmZ1bmN0aW9uIGlkZW50aXR5IChzKSB7XG4gIHJldHVybiBzO1xufVxuXG4vKipcbiAqIEJlY2F1c2UgYmVoYXZpb3IgZ29lcyB3YWNreSB3aGVuIHlvdSBzZXQgYF9fcHJvdG9fX2Agb24gb2JqZWN0cywgd2VcbiAqIGhhdmUgdG8gcHJlZml4IGFsbCB0aGUgc3RyaW5ncyBpbiBvdXIgc2V0IHdpdGggYW4gYXJiaXRyYXJ5IGNoYXJhY3Rlci5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvc291cmNlLW1hcC9wdWxsLzMxIGFuZFxuICogaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvc291cmNlLW1hcC9pc3N1ZXMvMzBcbiAqXG4gKiBAcGFyYW0gU3RyaW5nIGFTdHJcbiAqL1xuZnVuY3Rpb24gdG9TZXRTdHJpbmcoYVN0cikge1xuICBpZiAoaXNQcm90b1N0cmluZyhhU3RyKSkge1xuICAgIHJldHVybiAnJCcgKyBhU3RyO1xuICB9XG5cbiAgcmV0dXJuIGFTdHI7XG59XG5leHBvcnRzLnRvU2V0U3RyaW5nID0gc3VwcG9ydHNOdWxsUHJvdG8gPyBpZGVudGl0eSA6IHRvU2V0U3RyaW5nO1xuXG5mdW5jdGlvbiBmcm9tU2V0U3RyaW5nKGFTdHIpIHtcbiAgaWYgKGlzUHJvdG9TdHJpbmcoYVN0cikpIHtcbiAgICByZXR1cm4gYVN0ci5zbGljZSgxKTtcbiAgfVxuXG4gIHJldHVybiBhU3RyO1xufVxuZXhwb3J0cy5mcm9tU2V0U3RyaW5nID0gc3VwcG9ydHNOdWxsUHJvdG8gPyBpZGVudGl0eSA6IGZyb21TZXRTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzUHJvdG9TdHJpbmcocykge1xuICBpZiAoIXMpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgbGVuZ3RoID0gcy5sZW5ndGg7XG5cbiAgaWYgKGxlbmd0aCA8IDkgLyogXCJfX3Byb3RvX19cIi5sZW5ndGggKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAocy5jaGFyQ29kZUF0KGxlbmd0aCAtIDEpICE9PSA5NSAgLyogJ18nICovIHx8XG4gICAgICBzLmNoYXJDb2RlQXQobGVuZ3RoIC0gMikgIT09IDk1ICAvKiAnXycgKi8gfHxcbiAgICAgIHMuY2hhckNvZGVBdChsZW5ndGggLSAzKSAhPT0gMTExIC8qICdvJyAqLyB8fFxuICAgICAgcy5jaGFyQ29kZUF0KGxlbmd0aCAtIDQpICE9PSAxMTYgLyogJ3QnICovIHx8XG4gICAgICBzLmNoYXJDb2RlQXQobGVuZ3RoIC0gNSkgIT09IDExMSAvKiAnbycgKi8gfHxcbiAgICAgIHMuY2hhckNvZGVBdChsZW5ndGggLSA2KSAhPT0gMTE0IC8qICdyJyAqLyB8fFxuICAgICAgcy5jaGFyQ29kZUF0KGxlbmd0aCAtIDcpICE9PSAxMTIgLyogJ3AnICovIHx8XG4gICAgICBzLmNoYXJDb2RlQXQobGVuZ3RoIC0gOCkgIT09IDk1ICAvKiAnXycgKi8gfHxcbiAgICAgIHMuY2hhckNvZGVBdChsZW5ndGggLSA5KSAhPT0gOTUgIC8qICdfJyAqLykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSBsZW5ndGggLSAxMDsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAocy5jaGFyQ29kZUF0KGkpICE9PSAzNiAvKiAnJCcgKi8pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBDb21wYXJhdG9yIGJldHdlZW4gdHdvIG1hcHBpbmdzIHdoZXJlIHRoZSBvcmlnaW5hbCBwb3NpdGlvbnMgYXJlIGNvbXBhcmVkLlxuICpcbiAqIE9wdGlvbmFsbHkgcGFzcyBpbiBgdHJ1ZWAgYXMgYG9ubHlDb21wYXJlR2VuZXJhdGVkYCB0byBjb25zaWRlciB0d29cbiAqIG1hcHBpbmdzIHdpdGggdGhlIHNhbWUgb3JpZ2luYWwgc291cmNlL2xpbmUvY29sdW1uLCBidXQgZGlmZmVyZW50IGdlbmVyYXRlZFxuICogbGluZSBhbmQgY29sdW1uIHRoZSBzYW1lLiBVc2VmdWwgd2hlbiBzZWFyY2hpbmcgZm9yIGEgbWFwcGluZyB3aXRoIGFcbiAqIHN0dWJiZWQgb3V0IG1hcHBpbmcuXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVCeU9yaWdpbmFsUG9zaXRpb25zKG1hcHBpbmdBLCBtYXBwaW5nQiwgb25seUNvbXBhcmVPcmlnaW5hbCkge1xuICB2YXIgY21wID0gbWFwcGluZ0Euc291cmNlIC0gbWFwcGluZ0Iuc291cmNlO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsTGluZSAtIG1hcHBpbmdCLm9yaWdpbmFsTGluZTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5vcmlnaW5hbENvbHVtbiAtIG1hcHBpbmdCLm9yaWdpbmFsQ29sdW1uO1xuICBpZiAoY21wICE9PSAwIHx8IG9ubHlDb21wYXJlT3JpZ2luYWwpIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgY21wID0gbWFwcGluZ0EuZ2VuZXJhdGVkQ29sdW1uIC0gbWFwcGluZ0IuZ2VuZXJhdGVkQ29sdW1uO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZExpbmUgLSBtYXBwaW5nQi5nZW5lcmF0ZWRMaW5lO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIHJldHVybiBtYXBwaW5nQS5uYW1lIC0gbWFwcGluZ0IubmFtZTtcbn1cbmV4cG9ydHMuY29tcGFyZUJ5T3JpZ2luYWxQb3NpdGlvbnMgPSBjb21wYXJlQnlPcmlnaW5hbFBvc2l0aW9ucztcblxuLyoqXG4gKiBDb21wYXJhdG9yIGJldHdlZW4gdHdvIG1hcHBpbmdzIHdpdGggZGVmbGF0ZWQgc291cmNlIGFuZCBuYW1lIGluZGljZXMgd2hlcmVcbiAqIHRoZSBnZW5lcmF0ZWQgcG9zaXRpb25zIGFyZSBjb21wYXJlZC5cbiAqXG4gKiBPcHRpb25hbGx5IHBhc3MgaW4gYHRydWVgIGFzIGBvbmx5Q29tcGFyZUdlbmVyYXRlZGAgdG8gY29uc2lkZXIgdHdvXG4gKiBtYXBwaW5ncyB3aXRoIHRoZSBzYW1lIGdlbmVyYXRlZCBsaW5lIGFuZCBjb2x1bW4sIGJ1dCBkaWZmZXJlbnRcbiAqIHNvdXJjZS9uYW1lL29yaWdpbmFsIGxpbmUgYW5kIGNvbHVtbiB0aGUgc2FtZS4gVXNlZnVsIHdoZW4gc2VhcmNoaW5nIGZvciBhXG4gKiBtYXBwaW5nIHdpdGggYSBzdHViYmVkIG91dCBtYXBwaW5nLlxuICovXG5mdW5jdGlvbiBjb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNEZWZsYXRlZChtYXBwaW5nQSwgbWFwcGluZ0IsIG9ubHlDb21wYXJlR2VuZXJhdGVkKSB7XG4gIHZhciBjbXAgPSBtYXBwaW5nQS5nZW5lcmF0ZWRMaW5lIC0gbWFwcGluZ0IuZ2VuZXJhdGVkTGluZTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5nZW5lcmF0ZWRDb2x1bW4gLSBtYXBwaW5nQi5nZW5lcmF0ZWRDb2x1bW47XG4gIGlmIChjbXAgIT09IDAgfHwgb25seUNvbXBhcmVHZW5lcmF0ZWQpIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgY21wID0gbWFwcGluZ0Euc291cmNlIC0gbWFwcGluZ0Iuc291cmNlO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsTGluZSAtIG1hcHBpbmdCLm9yaWdpbmFsTGluZTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5vcmlnaW5hbENvbHVtbiAtIG1hcHBpbmdCLm9yaWdpbmFsQ29sdW1uO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIHJldHVybiBtYXBwaW5nQS5uYW1lIC0gbWFwcGluZ0IubmFtZTtcbn1cbmV4cG9ydHMuY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zRGVmbGF0ZWQgPSBjb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNEZWZsYXRlZDtcblxuZnVuY3Rpb24gc3RyY21wKGFTdHIxLCBhU3RyMikge1xuICBpZiAoYVN0cjEgPT09IGFTdHIyKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBpZiAoYVN0cjEgPiBhU3RyMikge1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIENvbXBhcmF0b3IgYmV0d2VlbiB0d28gbWFwcGluZ3Mgd2l0aCBpbmZsYXRlZCBzb3VyY2UgYW5kIG5hbWUgc3RyaW5ncyB3aGVyZVxuICogdGhlIGdlbmVyYXRlZCBwb3NpdGlvbnMgYXJlIGNvbXBhcmVkLlxuICovXG5mdW5jdGlvbiBjb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNJbmZsYXRlZChtYXBwaW5nQSwgbWFwcGluZ0IpIHtcbiAgdmFyIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZExpbmUgLSBtYXBwaW5nQi5nZW5lcmF0ZWRMaW5lO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZENvbHVtbiAtIG1hcHBpbmdCLmdlbmVyYXRlZENvbHVtbjtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBzdHJjbXAobWFwcGluZ0Euc291cmNlLCBtYXBwaW5nQi5zb3VyY2UpO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsTGluZSAtIG1hcHBpbmdCLm9yaWdpbmFsTGluZTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5vcmlnaW5hbENvbHVtbiAtIG1hcHBpbmdCLm9yaWdpbmFsQ29sdW1uO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIHJldHVybiBzdHJjbXAobWFwcGluZ0EubmFtZSwgbWFwcGluZ0IubmFtZSk7XG59XG5leHBvcnRzLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0luZmxhdGVkID0gY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zSW5mbGF0ZWQ7XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDktMjAxMSBNb3ppbGxhIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9yc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgbGljZW5zZS4gU2VlIExJQ0VOU0UudHh0IG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5leHBvcnRzLlNvdXJjZU1hcEdlbmVyYXRvciA9IHJlcXVpcmUoJy4vbGliL3NvdXJjZS1tYXAtZ2VuZXJhdG9yJykuU291cmNlTWFwR2VuZXJhdG9yO1xuZXhwb3J0cy5Tb3VyY2VNYXBDb25zdW1lciA9IHJlcXVpcmUoJy4vbGliL3NvdXJjZS1tYXAtY29uc3VtZXInKS5Tb3VyY2VNYXBDb25zdW1lcjtcbmV4cG9ydHMuU291cmNlTm9kZSA9IHJlcXVpcmUoJy4vbGliL3NvdXJjZS1ub2RlJykuU291cmNlTm9kZTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhbnNpUmVnZXggPSByZXF1aXJlKCdhbnNpLXJlZ2V4JykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdHJldHVybiB0eXBlb2Ygc3RyID09PSAnc3RyaW5nJyA/IHN0ci5yZXBsYWNlKGFuc2lSZWdleCwgJycpIDogc3RyO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhcmd2ID0gcHJvY2Vzcy5hcmd2O1xuXG52YXIgdGVybWluYXRvciA9IGFyZ3YuaW5kZXhPZignLS0nKTtcbnZhciBoYXNGbGFnID0gZnVuY3Rpb24gKGZsYWcpIHtcblx0ZmxhZyA9ICctLScgKyBmbGFnO1xuXHR2YXIgcG9zID0gYXJndi5pbmRleE9mKGZsYWcpO1xuXHRyZXR1cm4gcG9zICE9PSAtMSAmJiAodGVybWluYXRvciAhPT0gLTEgPyBwb3MgPCB0ZXJtaW5hdG9yIDogdHJ1ZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG5cdGlmICgnRk9SQ0VfQ09MT1InIGluIHByb2Nlc3MuZW52KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoaGFzRmxhZygnbm8tY29sb3InKSB8fFxuXHRcdGhhc0ZsYWcoJ25vLWNvbG9ycycpIHx8XG5cdFx0aGFzRmxhZygnY29sb3I9ZmFsc2UnKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmIChoYXNGbGFnKCdjb2xvcicpIHx8XG5cdFx0aGFzRmxhZygnY29sb3JzJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcj10cnVlJykgfHxcblx0XHRoYXNGbGFnKCdjb2xvcj1hbHdheXMnKSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKHByb2Nlc3Muc3Rkb3V0ICYmICFwcm9jZXNzLnN0ZG91dC5pc1RUWSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoJ0NPTE9SVEVSTScgaW4gcHJvY2Vzcy5lbnYpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmIChwcm9jZXNzLmVudi5URVJNID09PSAnZHVtYicpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAoL15zY3JlZW58Xnh0ZXJtfF52dDEwMHxjb2xvcnxhbnNpfGN5Z3dpbnxsaW51eC9pLnRlc3QocHJvY2Vzcy5lbnYuVEVSTSkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdHJldHVybiBmYWxzZTtcbn0pKCk7XG4iXX0=
