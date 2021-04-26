import { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import GetApiServerUri from './helpers';
import {
  serverSelected,
  serverInfoUpdate,
  tornjakServerInfoUpdate,
  tornjakMessege,
} from 'actions';

class TornjakApi extends Component {
}

function populateTornjakServerInfo(serverName, tornjakServerInfoUpdate, tornjakMessege) {
  axios.get(GetApiServerUri('/manager-api/tornjak/serverinfo/') + serverName, { crossdomain: true })
    .then(response => {
      tornjakServerInfoUpdate(response.data["serverinfo"]);
      tornjakMessege(response.statusText);
    }).catch(error => {
      tornjakServerInfoUpdate([]);
      tornjakMessege("Error retrieving " + serverName + " : " + error.message);
    });
}

function populateLocalTornjakServerInfo(tornjakServerInfoUpdate, tornjakMessege) {
  axios.get(GetApiServerUri('/api/tornjak/serverinfo'), { crossdomain: true })
    .then(response => {
      tornjakServerInfoUpdate(response.data["serverinfo"]);
      tornjakMessege(response.statusText);
    })
    .catch((error) => {
      tornjakMessege("Error retrieving " + " : " + error.message);
    })
}

function populateServerInfo(serverInfo, serverInfoUpdate) {
  //node attestor plugin
  const nodeAttKeyWord = "NodeAttestor Plugin: ";
  if (serverInfo === "" || serverInfo == undefined)
    return
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
  serverInfoUpdate(reqInfo);
}

function populateAgentsUpdate(serverName, agentsListUpdate, tornjakMessege) {
  axios.get(GetApiServerUri('/manager-api/agent/list/') + serverName, { crossdomain: true })
    .then(response => {
      agentsListUpdate(response.data["agents"]);
      tornjakMessege(response.statusText);
    }).catch(error => {
      agentsListUpdate([]);
      tornjakMessege("Error retrieving " + serverName + " : " + error.message);
    });

}

function populateLocalAgentsUpdate(agentsListUpdate, tornjakMessege) {
  axios.get(GetApiServerUri('/api/agent/list'), { crossdomain: true })
    .then(response => {
      agentsListUpdate(response.data["agents"]);
      tornjakMessege(response.statusText);
    })
    .catch((error) => {
      tornjakMessege("Error retrieving " + " : " + error.message);
    })
}

const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessege: state.tornjak.globalErrorMessege,
})

export {
  populateServerInfo,
  populateTornjakServerInfo,
  populateLocalTornjakServerInfo,
  populateAgentsUpdate,
  populateLocalAgentsUpdate,
};
export default connect(
  mapStateToProps,
  { serverSelected, tornjakServerInfoUpdate, serverInfoUpdate, tornjakMessege }
)(TornjakApi)