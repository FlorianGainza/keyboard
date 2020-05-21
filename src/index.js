import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'

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
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
        className={this.props.class + " piano-key"}
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
    this.state = { status : props.status };
    this.ws.onopen = (evt) => {
      this.setState({status : 'connected'});
      console.log('OPEN');
    }

    this.ws.onclose = (evt) => {
      this.setState({status : 'disconnected'});
      console.log('CLOSE');
      this.ws = null;
    }

    this.ws.onmessage = (evt) => {
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
        onMouseDown={() => this.ws.send(pitch)}
        onMouseUp={() => this.ws.send('!' + pitch)}
        class={isWhite ? 'wKey' : 'bKey'}
      />
    );
  }

  render() {
    return (
      <div className="piano">
        <FontAwesomeIcon icon={faExchangeAlt} className={this.state.status}/>
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
  <Piano status="disconnected" />,
  document.getElementById('keyboard_container')
);