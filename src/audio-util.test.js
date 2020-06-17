import fs from 'fs'

import AudioUtil from './audio-util'

describe('Check wave data', () => {

   it('check wave data and should success', () => {
      fs.readFile('./src/sin-c.wav', function (err, data) {
         expect(
            AudioUtil.isWaveFormat(data)
         ).toBe(true);
      });
   });

   it('check wave data and should fail', () => {
      fs.readFile('./src/sin-c.dat', function (err, data) {
         expect(
            AudioUtil.isWaveFormat(data)
         ).toBe(false);
      });
   });

});

describe('Encode number to Byte array', () => {

   it('Encode 111111', () => {
      var encodedNumber = AudioUtil.numberToUint8Array(111111);
      expect(encodedNumber.length).toEqual(4);
      expect(encodedNumber[0]).toEqual(7);
      expect(encodedNumber[1]).toEqual(178);
      expect(encodedNumber[2]).toEqual(1);
      expect(encodedNumber[3]).toEqual(0);
   });

});

describe('Merge wave chunks', () => {

   it('Merge single chunk', () => {
      fs.readFile('./src/sin-c.wav', function (err, chunk) {
         expect(
            AudioUtil.mergeChunks(chunk)
         ).toStrictEqual(new Uint8Array(chunk));
      });
   });

   it('Merge two chunks', () => {
      fs.readFile('./src/square-c-part1.wav', function (err, chunk1) {
         fs.readFile('./src/square-c-part2.wav', function (err, chunk2) {
            fs.readFile('./src/square-c.wav', function (err, expected) {
               expect(
                  AudioUtil.mergeChunks(chunk1, chunk2)
               ).toStrictEqual(new Uint8Array(expected));
            });
         });
      });
   });
});