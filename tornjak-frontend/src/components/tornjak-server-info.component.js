import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import {
  serverSelected,
  serverInfoUpdate,
  tornjakServerInfoUpdate
} from 'actions';

const TornjakServerInfoDisplay = props => (
  <p>
    <pre>
      {props.tornjakServerInfo}
    </pre>
  </p>
)

class TornjakServerInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
    };
  }

  componentDidMount(prevProps) {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.populateTornjakServerInfo(this.props.globalServerSelected);
        populateServerInfo(this.props);
      }
    } else {
      this.populateLocalTornjakServerInfo();
      if(this.props.globalTornjakServerInfo !== "") 
        populateServerInfo(this.props);
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.populateTornjakServerInfo(this.props.globalServerSelected)
      }
    } else {
      if(prevProps.globalTornjakServerInfo !== this.props.globalTornjakServerInfo) 
        populateServerInfo(this.props);
    }
  }

  populateTornjakServerInfo(serverName) {
    axios.get(GetApiServerUri('/manager-api/tornjak/serverinfo/') + serverName, { crossdomain: true })
      .then(response => {
        console.log(response);
        this.props.tornjakServerInfoUpdate(response.data["serverinfo"]);
      }).catch(error => {
        this.setState({
          message: "Error retrieving " + serverName + " : " + error.message,
          agents: [],
        });
      });

  }

  // populateServerInfo() {
  //   //node attestor plugin
  //   const nodeAttKeyWord = "NodeAttestor Plugin: ";
  //   var serverInfo = this.props.globalTornjakServerInfo;
  //   var nodeAttStrtInd = serverInfo.search(nodeAttKeyWord) + nodeAttKeyWord.length;
  //   var nodeAttEndInd = serverInfo.indexOf('\n', nodeAttStrtInd)
  //   var nodeAtt = serverInfo.substr(nodeAttStrtInd, nodeAttEndInd - nodeAttStrtInd)
  //   //server trust domain
  //   const trustDomainKeyWord = "\"TrustDomain\": \"";
  //   var trustDomainStrtInd = serverInfo.search(trustDomainKeyWord) + trustDomainKeyWord.length;
  //   var trustDomainEndInd = serverInfo.indexOf("\"", trustDomainStrtInd)
  //   var trustDomain = serverInfo.substr(trustDomainStrtInd, trustDomainEndInd - trustDomainStrtInd)
  //   var reqInfo = 
  //     {
  //       "data": 
  //         {
  //           "trustDomain": trustDomain,
  //           "nodeAttestorPlugin": nodeAtt
  //         }
  //     }
  //   this.props.serverInfoUpdate(reqInfo);
  // }

  populateLocalTornjakServerInfo() {
    axios.get(GetApiServerUri('/api/tornjak/serverinfo'), { crossdomain: true })
      .then(response => {
        this.props.tornjakServerInfoUpdate(response.data["serverinfo"]);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  tornjakServerInfo() {
    if (this.props.globalTornjakServerInfo === "") {
      return ""
    } else {
      return <TornjakServerInfoDisplay tornjakServerInfo={this.props.globalTornjakServerInfo} />
    }
  }

  render() {

    return (
      <div>
        <h3>Server Info</h3>
        <div className="alert-primary" role="alert">
          <pre>
            {this.state.message}
          </pre>
        </div>
        {IsManager}
        <br /><br />
        {this.tornjakServerInfo()}
      </div>
    )
  }
}

function populateServerInfo(props) {
  //node attestor plugin
  const nodeAttKeyWord = "NodeAttestor Plugin: ";
  console.log(props)
  var serverInfo = props.globalTornjakServerInfo;
  var nodeAttStrtInd = serverInfo.search(nodeAttKeyWord) + nodeAttKeyWord.length;
  var nodeAttEndInd = serverInfo.indexOf('\n', nodeAttStrtInd)
  var nodeAtt = serverInfo.substr(nodeAttStrtInd, nodeAttEndInd - nodeAttStrtInd)
  //server trust domain
  const trustDomainKeyWord = "\"TrustDomain\": \"";
  var trustDomainStrtInd = serverInfo.search(trustDomainKeyWord) + trustDomainKeyWord.length;
  var trustDomainEndInd = serverInfo.indexOf("\"", trustDomainStrtInd)
  var trustDomain = serverInfo.substr(trustDomainStrtInd, trustDomainEndInd - trustDomainStrtInd)
  var reqInfo = 
    {
      "data": 
        {
          "trustDomain": trustDomain,
          "nodeAttestorPlugin": nodeAtt
        }
    }
  props.serverInfoUpdate(reqInfo);
}

const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
})
// const mapStateToProps = function(state) {
//   return {
//     globalServerSelected: state.servers.globalServerSelected,
//     globalServerInfo: state.servers.globalServerInfo,
//     globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
//   }
// }

export { populateServerInfo };
export default connect(
  mapStateToProps,
  { serverSelected, tornjakServerInfoUpdate, serverInfoUpdate }
)(TornjakServerInfo)