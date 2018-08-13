import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import logo from './logo.svg';
import './App.css';

const initialValue = Value.fromJSON({
  document: {
    nodes: [{
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
    }],
  },
});

const CodeNode = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const BoldMark = props => <strong>{props.children}</strong>;

class App extends Component {

  state = {
    value: initialValue,
  }

  onChange = ({ value }) => {
    this.setState({ value });
  }

  onKeyDown = (event, change) => {
    if (!event.ctrlKey) return;
    
    switch (event.key) {
      case 'b':
        event.preventDefault();  
        change.toggleMark('bold');
        return true;
      case '`':
        event.preventDefault();
        const isCode = change.value.blocks.some(block => block.type === 'code');
        change.setBlocks(isCode ? 'paragraph' : 'code');
        return true;
    }
  }

  renderNode = props => {
    switch(props.node.type) {
      case 'code':
        return <CodeNode {...props} />;
    }
  }

  renderMark = props => {
    switch(props.mark.type) {
      case 'bold':
        return <BoldMark {...props} />
    }
  }

  render() {
    return (
      <div className="App">
        <Editor 
          value={this.state.value} 
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          renderNode={this.renderNode}
          renderMark={this.renderMark} />
      </div>
    );
  }
}

export default App;
