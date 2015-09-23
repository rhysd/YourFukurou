import React from "react/addons";
import Slideout from "slideout";

export default class SideMenu extends React.Component {
    constructor(props) {
        super(props);
        this.slideout = null;
    }

    componentDidMount() {
        this.slideout = new Slideout({
            panel: React.findDOMNode(this.refs["main"]),
            menu: React.findDOMNode(this.refs["menu"]),
        });
    }

    render() {
        return (
            <div className="side-menu">
                <nav className="menu-panel" ref="menu">
                    Hello, world
                </nav>
                <main className="main-panel" ref="main">
                    <div className="main-menu side-menu-item" onClick={() => this.slideout.toggle()}>
                        <i className="fa fa-bars fa-2x"/>
                    </div>
                    {this.props.children}
                </main>
            </div>
        );
    }
}
