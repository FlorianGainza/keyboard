export default class AudioUtil {

    /**
     * Merge two wave chunks together
     *
     * @param {*} chunk1 Wave chunk
     * @param {*} chunk2 Wave chunk
     *
     * @returns Two wave chunks concatenate together
     */
    static mergeChunks(chunk1, chunk2) {
        chunk1 = new Uint8Array(chunk1);
        if (arguments.length === 1) {
            return chunk1;
        }
        chunk2 = new Uint8Array(chunk2);
        if (!this.isWaveFormat(chunk1) || !this.isWaveFormat(chunk2)) {
            throw new Error('Only wave format supported');
        }
        const headerSize = 44;
        var header = chunk1.slice(0, headerSize);
        const chunkData1 = chunk1.slice(headerSize);
        const chunkData2 = chunk2.slice(headerSize);
        const dataSize = chunkData1.length + chunkData2.length;
        const binDataSize = this.numberToUint8Array(dataSize);
        const binFileSize = this.numberToUint8Array(dataSize + headerSize);
        for (var i = 0; i < 4; i++) {
            header[i + 4] = binFileSize[i];
            header[i + 40] = binDataSize[i];
        }
        var mergedChunks = new Uint8Array(dataSize + headerSize);
        mergedChunks.set(header, 0);
        mergedChunks.set(chunkData1, 44);
        mergedChunks.set(chunkData2, chunkData1.length + 44);

        return mergedChunks;
    }

    /**
     * Convert a given integer into an unsigned integers array
     * encoded on four bytes
     *
     * @param {*} number The number to convert
     *
     * @returns An array of four bytes representing the number
     */
    static numberToUint8Array(number) {
        var encodedNumber = new Uint8Array(4);
        for (var i = 0; i < 4; i++) {
            encodedNumber[i] = number & 255;
            number = number >> 8;
        }
        return encodedNumber;
    }

    /**
     * Check whether the data is respecting the wave format
     *
     * @param {*} data Data content that can be converted to Uint8Array
     *
     * @returns Assertion on data respecting wave format
     */
    static isWaveFormat(data) {
        data = new Uint8Array(data);
        const riffMark = [82, 73, 70, 70];
        const waveMark = [87, 65, 86, 69];
        var isWaveFormat = true;
        for (var i = 0; i < 4; i++) {
            if (data[i] !== riffMark[i]) {
                isWaveFormat = false;
                break;
            }
        }
        if (isWaveFormat) {
            for (i = 8; i < 12; i++) {
                if (data[i] !== waveMark[i - 8]) {
                    isWaveFormat = false;
                    break;
                }
            }
        }
        return isWaveFormat;
    }
}