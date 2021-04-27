import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';

import {
    serverSelectedFunc,
    serversListUpdateFunc,
    tornjakServerInfoUpdateFunc,
    serverInfoUpdateFunc,
    agentsListUpdateFunc,
    tornjakMessegeFunc
} from 'actions';

const ServerDropdown = props => (
    <option value={props.value}>{props.name}</option>
)

class SelectServer extends Component {
    constructor(props) {
        super(props);
        this.serverDropdownList = this.serverDropdownList.bind(this);
        this.onServerSelect = this.onServerSelect.bind(this);

        this.state = {
        };
    }

    componentDidMount() {
        if (IsManager) {
            this.populateServers()
        }
    }

    componentDidUpdate() {
        if (IsManager) {
            if ((this.props.globalServerSelected !== "") && (this.props.globalErrorMessege === "OK" || this.props.globalErrorMessege === "")) {
                new TornjakApi().populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessegeFunc);
            }
            if ((this.props.globalTornjakServerInfo !== "") && (this.props.globalErrorMessege === "OK" || this.props.globalErrorMessege === "")) {
                new TornjakApi().populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
                new TornjakApi().populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessegeFunc)
            }
        }
    }

    populateServers() {
        axios.get(GetApiServerUri("/manager-api/server/list"), { crossdomain: true })
            .then(response => {
                this.props.serversListUpdateFunc(response.data["servers"]);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    serverDropdownList() {
        if (typeof this.props.globalServersList !== 'undefined') {
            return this.props.globalServersList.map(server => {
                return <ServerDropdown key={server.name}
                    value={server.name}
                    name={server.name} />
            })
        } else {
            return ""
        }
    }

    onServerSelect(e) {
        const serverName = e.target.value;
        if (serverName !== "") {
            this.props.serverSelectedFunc(serverName);
        }
    }

    getServer(serverName) {
        var i;
        const servers = this.props.globalServersList
        for (i = 0; i < servers.length; i++) {
            if (servers[i].name === serverName) {
                return servers[i]
            }
        }
        return null
    }

    render() {
        let managerServerSelector = (
            <div id="server-dropdown-div">
                <label id="server-dropdown">Choose a Server</label>
                <div className="servers-drp-dwn">
                    <select name="servers" id="servers" onChange={this.onServerSelect}>
                        <optgroup label="Servers">
                            <option value="none" selected disabled>Select an Option </option>
                            <option value="none" selected disabled>{this.props.globalServerSelected} </option>
                            {this.serverDropdownList()}
                        </optgroup>
                    </select>
                </div>
            </div>
        )
        return (
            <div>
                {IsManager && managerServerSelector}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    globalServerSelected: state.servers.globalServerSelected,
    globalServersList: state.servers.globalServersList,
    globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
    globalErrorMessege: state.tornjak.globalErrorMessege,
})

export default connect(
    mapStateToProps,
    { serverSelectedFunc, serversListUpdateFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, agentsListUpdateFunc, tornjakMessegeFunc }
)(SelectServer)