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

        this.item_listener = () => this.forceUpdate();
        this.toggle_listener = () => {
            if (this.state.selected === null) {
                const menus = MenuStore.getAll();
                if (menus.length > 0) {
                    this.toggleMenuPanel(menus[0].name);
                }
            } else {
                this.slideout.toggle()
            }
        };
        MenuStore.on("item-added", this.item_listener);
        MenuStore.on("toggle-requested", this.toggle_listener);
    }

    componentWillUnmount() {
        this.item_listener && MenuStore.removeListener("item-added", this.item_listener);
        this.toggle_listener && MenuStore.removeListener("toggle-requested", this.toggle_listener);
    }

    toggleMenuPanel(name) {
        const previous = this.state.selected;

        this.setState({
            selected: MenuStore.lookUpByName(name)
        });
        if (this.slideout.isOpen()) {
            if (previous && previous.name === name) {
                this.slideout.close();
            }
        } else {
            this.slideout.open();
        }
    }

    renderMenuItems() {
        let items = [];
        let key = 0;

        for (const m of MenuStore.getAll()) {
            items.push(
                <MenuItem key={key++} onClick={this.toggleMenuPanel.bind(this)} {...m}/>
            );
        }

        return items;
    }

    render() {
        return (
            <div className="side-menu">
                <nav className="menu-panel" ref="secondary">
                    {this.state.selected ? this.state.selected.body : undefined}
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
