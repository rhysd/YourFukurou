const openExternal = global.require("shell").openExternal;

export default class ImagePreview extends React.Component {
    constructor(props) {
        super(props);
    }

    onClick(medium, event) {
        // TODO: Show preview in app
        openExternal(medium.expanded_url);
    }

    renderImage(medium, idx) {
        return (
            <img className="media" src={medium.media_url + ":thumb"} key={this.props.item_id + "-" + idx} onClick={this.onClick.bind(this, medium)}/>
        );
    }

    render() {
        return (
            <div className="image-preview">
                {this.props.media.map((m, i) => this.renderImage(m, i))}
            </div>
        );
    }
}
