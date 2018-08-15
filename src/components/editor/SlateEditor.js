import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import { withRouter } from 'react-router-dom';
import { PageHeader } from 'react-bootstrap';
import QueryString from 'query-string';
import './SlateEditor.css';

const assignDeep = require('assign-deep');
const Automerge = require('automerge');


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

class SlateEditor extends Component {

  state = {
    value: initialValue,
    documentName: null,
  }

  constructor(props) {
    super(props);
    this.fetchContent();
    this.doc = Automerge.init();
    this.props.subscribeToChanges((err, changes) => {
      const newDoc = Automerge.applyChanges(this.doc, changes);
      this.setState({ value: Value.fromJSON(newDoc.note) });
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.importedText != prevProps.importedText) {
      console.log('test');
      const value = Value.fromJSON({
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
                      text: this.props.importedText,
                    },
                  ],
                },
              ],
            }
          ],
        },
      });
      this.setState({ value });
    }
    if (this.props.pdfParsedText != prevProps.pdfParsedText) {
      this.addContent(this.props.pdfParsedText);
    }
  }

  fetchContent = () => {
    const id = QueryString.parse(this.props.location.search).id;
    if (id == null) this.setState({ value: initialValue });
    fetch(`/api/docs/${id}`)
    .then(res => res.json())
    .then(results => {
      if (results.length > 0) {
        const doc = results[0];
        const value = Value.fromJSON(JSON.parse(doc.content) ||  initialValue);
        const documentName = doc.name;
        this.setState({ value, documentName });
      }
    })
  }

  saveContentDB = value => {
    const id = QueryString.parse(this.props.location.search).id;
    if (id == null) return;
    const content = JSON.stringify(value.toJSON());
    console.log('saving content to DB');
    fetch(`/api/docs/${id}`)
    .then(res => res.json())
    .then(results => {
      if (results.length > 0) {
        const data = { content: content };
        fetch(`/api/docs/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin'
        })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error(res.statusText);
        })
        .then(data => {
          console.log(data);
        })
        .catch(err => console.log(err));
      } else console.log('doc doesn\'t exist in database');
    });
  }

  onChange = (change) => {
    let { value } = change;
    this.props.onContentChange(value);
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
        this.props.pushChanges(changes);

        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.saveContentDB(value), 500);
      }
    });
  }

  addContent = contentList => {
    this.refs.slateEditor.change((change) => {
      contentList.forEach(text => {
        change
          .call(c => c.insertBlock('paragraph'))
          .insertText(text)
          .moveToEnd()
      });
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
      <div>
        <PageHeader style={{ marginTop: '20px' }}>{this.state.documentName || 'Untitled document'}</PageHeader>
        <Editor 
        ref="slateEditor"
        className="SlateEditor"
        plugins={plugins}
        style={{
          height: '1000px'
        }}
        value={this.state.value} 
        onChange={this.onChange}
        renderMark={this.renderMark} />
      </div>
    );
  }
}

export default withRouter(SlateEditor);