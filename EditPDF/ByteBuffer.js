export class ByteBuffer extends Array {

  save() {
    return new Uint8Array(this);
  }

  push(...args) {
    super.push(...args);
    return this;
  }

  addLittleEndian(num, len) {
    while (len-- > 0) {
      this.push(num & 0x00ff);
      num >>= 8;
    }
    return this;
  }

  addByte(num) { return this.addLittleEndian(num, 1); }

  addWord(num) { return this.addLittleEndian(num, 2); }

  addDWord(num) { return this.addLittleEndian(num, 4); }
}
