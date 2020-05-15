'use strict';

const e = React.createElement;

class KeyButton extends React.Component {
  constructor(props) {
    super(props);
    this.ws = new WebSocket('ws://localhost:8080/synt');
    this.ws.onopen = function(evt) {
      console.log('OPEN');
    }
    this.ws.onclose = function(evt) {
      console.log('CLOSE');
      this.ws = null;
    }
    this.ws.onmessage = function(evt) {
      var note = new Audio();
      var blob = new Blob([evt.data], { type: 'audio/wave' });
      var url = window.URL.createObjectURL(blob);
      note.src = url
      note.play();
      console.log('RESPONSE: ' + evt.data);
    }
    this.ws.onerror = function(evt) {
      console.log('ERROR: ' + evt.data);
    }
    this.state = { playing: false };
  }

  render() {
    if (this.state.playing) {
      return 'You are playing note';
    }

    return e(
      'button',
      { onClick: () => this.ws.send('C') },
      'C'
    );
  }
}

const domContainer = document.querySelector('#keyboard_container');
ReactDOM.render(e(KeyButton), domContainer);