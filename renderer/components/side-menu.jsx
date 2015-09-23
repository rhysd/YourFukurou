import React from "react/addons";
import Slideout from "slideout";
import MenuStore from "../menu-store";

// TODO:
// Use react-router

class MenuItem extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="side-menu-item" onClick={this.props.onClick.bind(this, this.props.name)}>
                {this.props.item}
            </div>
        );
    }
}

export default class SideMenu extends React.Component {
    constructor(props) {
        super(props);
        this.slideout = null;
        this.state = {
            selected: null
        };
    }

    componentDidMount() {
        this.slideout = new Slideout({
            panel: React.findDOMNode(this.refs.primary),
            menu: React.findDOMNode(this.refs.secondary),
        });
    }

    onItemClicked(name) {
        console.log('Clicked: ' + name);
        this.setState({
            selected: MenuStore.lookUpByName(name).body
        });
        this.slideout.toggle();
    }

    renderMenuItems() {
        let items = [];
        let key = 0;

        for (const m of MenuStore.getAll()) {
            items.push(
                <MenuItem key={key++} onClick={this.onItemClicked.bind(this)} {...m}/>
            );
        }

        return items;
    }

    render() {
        return (
            <div className="side-menu">
                <nav className="menu-panel" ref="secondary">
                    {this.state.selected || undefined}
                </nav>
                <main className="main-panel" ref="primary">
                    <div className="main-menu">
                        {this.renderMenuItems()}
                    </div>
                    {this.props.children}
                </main>
            </div>
        );
    }
}
