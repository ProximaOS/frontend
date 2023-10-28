'use strict';

const MD5 = function (str, password = '') {
  str = str + password;

  function rotateLeft(n, s) {
    return (n << s) | (n >>> (32 - s));
  }

  function toWordArray(str) {
    let l = str.length / 4;
    let result = [];
    for (let i = 0; i < l; i++) {
      let word = 0;
      for (let j = 0; j < 4; j++) {
        word += str.charCodeAt(i * 4 + j) << (j * 8);
      }
      result.push(word);
    }
    return result;
  }

  function toHexString(num) {
    let hex = '';
    for (let i = 0; i < 4; i++) {
      let byte = (num >>> (i * 8)) & 0xff;
      hex += byte.toString(16).padStart(2, '0');
    }
    return hex;
  }

  function md5MainLoop(words) {
    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    for (let i = 0; i < words.length; i += 16) {
      let aa = a;
      let bb = b;
      let cc = c;
      let dd = d;

      for (let j = 0; j < 64; j++) {
        let f, g;

        if (j < 16) {
          f = (b & c) | (~b & d);
          g = j;
        } else if (j < 32) {
          f = (d & b) | (~d & c);
          g = (5 * j + 1) % 16;
        } else if (j < 48) {
          f = b ^ c ^ d;
          g = (3 * j + 5) % 16;
        } else {
          f = c ^ (b | ~d);
          g = (7 * j) % 16;
        }

        let tmp = d;
        d = c;
        c = b;
        b = b + rotateLeft((a + f + k[j] + words[i + g]) & 0xffffffff, r[j]);
        a = tmp;
      }

      a = (a + aa) & 0xffffffff;
      b = (b + bb) & 0xffffffff;
      c = (c + cc) & 0xffffffff;
      d = (d + dd) & 0xffffffff;
    }
    return [a, b, c, d];
  }

  function appendPadding(data) {
    let bitLen = data.length * 8;
    data += String.fromCharCode(0x80);
    while (data.length % 64 !== 56) {
      data += String.fromCharCode(0);
    }
    for (let i = 0; i < 8; i++) {
      data += String.fromCharCode((bitLen >>> (i * 8)) & 0xff);
    }
    return data;
  }

  let k = new Array(
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  );

  let r = new Array(
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  );

  str = appendPadding(str);
  let words = toWordArray(str);
  let [a, b, c, d] = md5MainLoop(words);

  return toHexString(a) + toHexString(b) + toHexString(c) + toHexString(d);
};

export default MD5;
