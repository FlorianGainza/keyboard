import React from 'react';

import AudioUtil from './audio-util'

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
            if (this.currBuffer !== null) {
                rawBuffer = AudioUtil.mergeChunks(this.currBuffer, rawBuffer).buffer;
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
}