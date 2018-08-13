import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import io from 'socket.io-client';
import logo from './logo.svg';
import './App.css';

const assignDeep = require('assign-deep');
const Automerge = require('automerge');
const socket = io('http://192.168.0.109:8000');
// const socket = io.connect(); 

const subscribeToChanges = cb => {
  socket.on('receivedChange', changes => cb(null, changes));
}

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                text: 'A line of text in a paragraph.',
              },
            ],
          },
        ],
      }
    ],
  },
});

const MarkHotkey = options => {
  const { type, key } = options;
  return {
    onKeyDown(event, change) {
      if (!event.ctrlKey || event.key != key) return;
      event.preventDefault();
      change.toggleMark(type);
      return true;
    },
  }
}

const plugins = [
  MarkHotkey({ key: 'b', type: 'bold' }),
  MarkHotkey({ key: '`', type: 'code' }),
  MarkHotkey({ key: 'i', type: 'italic' }),
  MarkHotkey({ key: '~', type: 'strikethrough' }),
  MarkHotkey({ key: 'u', type: 'underline' }),
]

class App extends Component {

  state = {
    value: initialValue,
  }

  constructor(props) {
    super(props);
    this.doc = Automerge.init();
    subscribeToChanges((err, changes) => {
      console.log('received changes');
      const newDoc = Automerge.applyChanges(this.doc, changes);
      this.setState({ value: Value.fromJSON(newDoc.note) });
    });
  }

  onChange = (change) => {
    let { value } = change;
    this.setState({ value }, () => {
      let setValue = false;
      change.operations.forEach(o => {
        if (o.type == 'set_value' || o.type == 'set_selection') setValue = true;
      });
      if (!setValue) {
        const newValue = value.toJSON();
        const newDoc = Automerge.change(this.doc, d => {
          d.note = assignDeep(d.note, newValue);
        });
        const changes = Automerge.getChanges(this.doc, newDoc);
        socket.emit('giveChange', changes);
      }
    });
  }

  renderMark = props => {
    switch(props.mark.type) {
      case 'bold':
        return <strong>{props.children}</strong>;
      case 'code':
        return <code>{props.children}</code>;
      case 'italic':
        return <em>{props.children}</em>;
      case 'strikethrough':
        return <del>{props.children}</del>;
      case 'underline':
        return <u>{props.children}</u>;
    }
  }

  render() {
    return (
      <div className="App">
        <Editor 
          plugins={plugins}
          style={{ border: 'solid 1px red' }}
          value={this.state.value} 
          onChange={this.onChange}
          renderMark={this.renderMark} />
      </div>
    );
  }
}

export default App;
