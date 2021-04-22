import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios'
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import Table from "tables/entriesListTable";
import {
  serverSelected,
  entriesListUpdate,
  tornjakMessege,
} from 'actions';

const Entry = props => (
  <tr>
    <td>{props.entry.id}</td>
    <td>{ "spiffe://" + props.entry.spiffe_id.trust_domain + props.entry.spiffe_id.path}</td>
    <td>{ "spiffe://" + props.entry.parent_id.trust_domain + props.entry.parent_id.path}</td>
    <td>{ props.entry.selectors.map(s => s.type + ":" + s.value).join(', ')}</td>
    
    <td>
      {/* <Link to={"/entryView/"+props.entry._id}>view</Link>*/}
      <br/>
      <a href="#" onClick={() => { props.deleteEntry (props.entry.id) }}>delete</a>
    </td>

    <td><div style={{overflowX: 'auto', width: "400px"}}>
    <pre>{JSON.stringify(props.entry, null, ' ')}</pre>
    </div></td>

  </tr>
)

class EntryList extends Component {
  constructor(props) {
    super(props);
    this.state = { 
        servers: [],
        selectedServer: "",
    };
  }

  componentDidMount() {
    if (IsManager) {
      if(this.props.globalServerSelected !== ""){
        this.populateEntriesUpdate(this.props.globalServerSelected)
      }
    } else {
        this.populateLocalEntriesUpdate()
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if(prevProps.globalServerSelected !== this.props.globalServerSelected){
        this.populateEntriesUpdate(this.props.globalServerSelected)
      }
    }
  }

  populateEntriesUpdate(serverName) {
      axios.get(GetApiServerUri('/manager-api/entry/list/') + serverName, {     crossdomain: true })
      .then(response =>{
        this.props.entriesListUpdate(response.data["entries"]);
        this.props.tornjakMessege(response.statusText);
      }).catch(err => {
          this.props.entriesListUpdate([]);
          this.props.tornjakMessege("Error retrieving " + serverName + " : "+ err + (typeof (err.response) !== "undefined" ? ":" + err.response.data : ""));
      });

  }

  populateLocalEntriesUpdate() {
      axios.get(GetApiServerUri('/api/entry/list'), { crossdomain: true })
      .then(response => {
        this.props.entriesListUpdate(response.data["entries"]);
        props.tornjakMessege(response.statusText);
      })
      .catch((error) => {
        console.log(error);
        props.tornjakMessege(error.message);
      })
  }

  entryList() {
  if (typeof this.props.globalentriesList !== 'undefined') {
      return this.props.globalentriesList.map(currentEntry => {
        return <Entry key={currentEntry.id} 
                  entry={currentEntry} 
                  deleteEntry={this.deleteEntry}/>;
      })
  } else {
      return ""
  }
}

  render() {

    return (
      <div>
        <h3>Entry List</h3>
        {this.props.globalErrorMessege !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessege}
            </pre>
          </div>
        }
        {IsManager}
        <br/><br/>
        <div className="indvidual-list-table">
          <Table data={this.entryList()} id="table-1" />
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalentriesList: state.entries.globalentriesList,
  globalErrorMessege: state.tornjak.globalErrorMessege,
})

export default connect(
  mapStateToProps,
  { serverSelected, entriesListUpdate, tornjakMessege }
)(EntryList)