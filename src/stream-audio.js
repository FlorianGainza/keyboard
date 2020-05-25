import React from 'react';

export default class StreamAudio extends React.Component {
    constructor(props) {
        super(props);
        this.context = new AudioContext();

        this.offset = 0;
        this.currBuffer = null;

        this.currStream = this.context.createBufferSource();
        this.nextStream = this.context.createBufferSource();

        this.currStream.buffer = new AudioBuffer({length: 1, sampleRate:44100});

        this.isPlaying = false;

    }

    loadChunck(chunck) {
        chunck.arrayBuffer().then(rawBuffer => {
            var isFirstChunck = !(this.currStream.buffer.length > 1);
            if (! isFirstChunck) {
                rawBuffer = this.mergeChunks(this.currBuffer, rawBuffer).buffer;
            }
            this.currBuffer = rawBuffer.slice();
            this.context.decodeAudioData(rawBuffer).then((decodedBuffer) => {
                this.nextStream = this.context.createBufferSource();
                this.nextStream.buffer = decodedBuffer;
                this.nextStream.connect(this.context.destination);
                this.play();
            }).catch((error) => {
                console.log(error);
            }) 
        });
    }

    play() {
        if (this.isPlaying) {
            this.currStream.stop(0.01);
            this.offset = this.context.currentTime - this.lastPLayed;
        } else {
            this.lastPLayed = this.context.currentTime;
        }
        this.isPlaying = true;
        this.nextStream.start(0.01, this.offset + 0.01);
        this.currStream = this.nextStream;
        this.currStream.onended = () => {
            this.currStream = this.context.createBufferSource();
            this.currStream.buffer = new AudioBuffer({length: 1, sampleRate:44100});
            this.isPlaying = false;
            this.offset = 0;
        }
    }

    mergeChunks(chunk1, chunk2) {
        if(arguments.length === 1) {
            return chunk1;
        }
        chunk1 = new Uint8Array(chunk1);
        chunk2 = new Uint8Array(chunk2);
        if (! this.isWaveFormat(chunk1) || ! this.isWaveFormat(chunk2)) {
            throw new Error('Only wave format supported');
        }
        const headerSize = 44;
        var header = chunk1.slice(0, headerSize);
        const chunkData1 = chunk1.slice(headerSize);
        const chunkData2 = chunk2.slice(headerSize);
        const dataSize = chunkData1.length + chunkData2.length;
        const binDataSize = this.numberToUint8Array(dataSize);
        const binFileSize = this.numberToUint8Array(dataSize + headerSize);
        for (var i=0; i < 4; i++) {
            header[i+4] = binFileSize[i];
            header[i+40] = binDataSize[i];
        }
        var mergedChunks = new Uint8Array(dataSize + headerSize);
        mergedChunks.set(header, 0);
        mergedChunks.set(chunkData1, 44);
        mergedChunks.set(chunkData2, chunkData1.length + 44);

        return mergedChunks;
    }

    numberToUint8Array(number) {
        var encodedNumber = new Uint8Array(4);
        for (var i=0; i< 4; i++) {
            encodedNumber[i] = number & 255;
            number = number >> 8;
        }
        return encodedNumber;
    }

    isWaveFormat(data) {
        data = new Uint8Array(data);
        const riffMark = [82, 73, 70, 70];
        const waveMark = [87, 65, 86, 69];
        var isWaveFormat = true;
        for (var i=0; i<4; i++) {
            if (data[i] !== riffMark[i]) {
                isWaveFormat = false;
                break;
            }
        }
        if (isWaveFormat) {
            for (i=8; i<12; i++) {
                if (data[i] !== waveMark[i-8]) {
                    isWaveFormat = false;
                    break;
                }
            }
        }
        return isWaveFormat;
    }
}