import React from "react/addons";

export default class AppMenuBody extends React.Component {
    constructor(props) {
        super(props);
    }

    exitApp() {
        remote.require('app').quit();
    }

    toggleDevTools() {
        remote.getCurrentWindow().toggleDevTools();
    }

    render() {
        return (
            <div className="app-menu">
                <div className="app-menu-items">
                    <div className="app-menu-item" onClick={this.toggleDevTools}>
                        <i className="fa fa-wrench"/> DevTools
                    </div>
                    <div className="app-menu-item" onClick={this.exitApp}>
                        <i className="fa fa-times"/>Exit App
                    </div>
                </div>
            </div>
        );
    }
}
