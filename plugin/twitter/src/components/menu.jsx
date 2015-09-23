class MenuBody extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="twitter-source-menu-body">
                <div className="avatar">
                    <i className="fa fa-question fa-2x"/>
                </div>
                Hello, world
            </div>
        );
    }
}

export function getMenuItem() {
    return (
        <i className="fa fa-twitter fa-2x"/>
    );
}

export function getMenuBody() {
    return <MenuBody/>;
}
