'use strict';

(() => {
  const defineGetter = (proto, prop, getter) => {
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (desc && typeof desc.get === 'function') return;

    try {
      Object.defineProperty(proto, prop, {
        configurable: true,
        enumerable: false,
        get: getter,
      });
    } catch {
      // Ignore: some runtimes may restrict redefining built-ins
    }
  };

  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.prototype) {
    defineGetter(ArrayBuffer.prototype, 'resizable', () => false);
    defineGetter(ArrayBuffer.prototype, 'maxByteLength', function maxByteLength() {
      return this.byteLength;
    });
  }

  if (typeof SharedArrayBuffer !== 'undefined' && SharedArrayBuffer.prototype) {
    defineGetter(SharedArrayBuffer.prototype, 'growable', () => false);
    defineGetter(SharedArrayBuffer.prototype, 'maxByteLength', function maxByteLength() {
      return this.byteLength;
    });
  }
})();
