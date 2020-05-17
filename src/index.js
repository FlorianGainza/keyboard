import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Key extends React.Component {
  constructor(props) {
    super(props);

    this.state = { playing: false };
  }

  render() {
    if (this.state.playing) {
      return 'You are playing note';
    }

    return (
      <button
        onClick={this.props.onClick}
        class={this.props.class + " piano-key"}
      >
        {this.props.value}
      </button>
    );
  }
}

class Piano extends React.Component {

  constructor(props) {
    super(props);
    this.ws = new WebSocket('ws://localhost:8080/synt');

    this.ws.onopen = function (evt) {
      console.log('OPEN');
    }

    this.ws.onclose = function (evt) {
      console.log('CLOSE');
      this.ws = null;
    }

    this.ws.onmessage = function (evt) {
      var note = new Audio();
      var blob = new Blob([evt.data], { type: 'audio/wave' });
      note.src = window.URL.createObjectURL(blob);
      note.play();
      console.log('RESPONSE: ' + evt.data);
    }

    this.ws.onerror = function (evt) {
      console.log('ERROR: ' + evt.data);
    }
  }

  renderKey(pitch, isWhite) {
    return (
      <Key
        value={pitch}
        onClick={() => this.ws.send(pitch)}
        class={isWhite ? 'wKey' : 'bKey'}
      />
    );
  }

  render() {
    return (
      <div class="piano">
        {this.renderKey('c', true)}
        {this.renderKey('c#', false)}
        {this.renderKey('d', true)}
        {this.renderKey('d#', false)}
        {this.renderKey('e', true)}
        {this.renderKey('f', true)}
        {this.renderKey('f#', false)}
        {this.renderKey('g', true)}
        {this.renderKey('g#', false)}
        {this.renderKey('a', true)}
        {this.renderKey('a#', false)}
        {this.renderKey('b', true)}
      </div>
    );
  }
}

ReactDOM.render(
  <Piano />,
  document.getElementById('keyboard_container')
);