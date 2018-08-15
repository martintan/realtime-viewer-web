import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, Button, Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Attendees from './Attendees';
import Comments from './Comments';
import { withRouter } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import PdfJsLib from 'pdfjs-dist';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-datepicker/dist/react-datepicker-cssmodules.css';

const dropZoneStyleActive = {   
  backgroundColor: 'rgba(36, 169, 222, 0.5)',
  borderColor: 'rgb(6, 124, 170)',
  borderStyle: 'solid'
};

class Sidebar extends Component {

  state = {
    date: moment(),
    subject: '',
    value: null,
    comments: [],
    uploadFolderWarning: false,
  }

  componentDidUpdate(prevProps) {
    if (this.props.value != prevProps.value) {
      this.setState({ value: this.props.value });
    }
  }

  handleDateChange = date => this.setState({ date });

  handleInputChange = e => this.setState({ [e.target.name]: e.target.value });

  handleSave = e => {
    const data = {
      name: this.state.subject,
      content: JSON.stringify(this.state.value.toJSON()),
      comments: []
    };
    fetch('/api/docs', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(doc => {
      console.log(doc);
      this.props.history.push(`/?id=${doc._id}`);
    })
    .catch(err => console.log(err));
  }

  handleDrop = (acceptedFiles, rejectedFiles) => {
    console.log(acceptedFiles, rejectedFiles);
    if (acceptedFiles[0].name.split('.').length <= 1) {
      this.setState({ uploadFolderWarning: true });
      return;
    }
    acceptedFiles.map(file => {
      const formData = new FormData();
      formData.append('file', file);
      fetch('/api/upload', { 
        method: 'POST', 
        body: formData,
        // headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error(res.statusText);
        })
        .then(data => {
          console.log('response:', data);
          PdfJsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.489/pdf.worker.js';
          PdfJsLib.getDocument(data.file)
          .then(pdf => pdf.getPage(1))
          .then(pdfPage => pdfPage.getTextContent())
          .then(textContent => {
            var lastY = -1;
            var arr = [];
            var p = '';
            textContent.items.forEach(i => {
              if (lastY != i.transform[5]) {
                if (lastY - i.transform[5] < 15) arr.push('');
                arr.push(p);
                lastY = i.transform[5];
                p = '';
              }
              p += i.str;
            });
            console.log(arr);
            this.props.onImportDoc(arr);
          });
        })
        .catch(error => console.log(error));
    });
  }

  render() {
    return (
      <form>
        <FormGroup>

          <ControlLabel>Date:</ControlLabel>
          <DatePicker 
            selected={this.state.date}
            onChange={this.handleDateChange} />

          <Attendees attendees={this.props.clients} />

          <ControlLabel>Subject:</ControlLabel>
          <FormControl
            type="text"
            name="subject"
            value={this.state.subject}
            onChange={this.handleInputChange}
            style={{ marginBottom: '10px' }} />

          <Comments />

          <Button bsStyle='primary' onClick={this.handleSave} block>Save</Button>

          <Dropzone 
            className='dropzone' 
            activeStyle={dropZoneStyleActive}
            onDrop={this.handleDrop}>
            <h3 className='dropzone_heading'>Import documents (supported: pdf)</h3>
          </Dropzone>

        </FormGroup>

        <Modal show={this.state.uploadFolderWarning} onHide={() => this.setState({ uploadFolderWarning: false })}>
          <Modal.Header closeButton><Modal.Title>Warning</Modal.Title></Modal.Header>
          <Modal.Body>Uploading folder is not supported. <br /><br />Please select all the files inside the folder and drop them into the upload zone instead.</Modal.Body>
          <Modal.Footer><Button onClick={() => this.setState({ uploadFolderWarning: false })}>Close</Button></Modal.Footer>
        </Modal>

      </form>
    );
  }
}

export default withRouter(Sidebar);