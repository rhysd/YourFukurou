const openExternal = global.require("shell").openExternal;

export default class ImagePreview extends React.Component {
    constructor(props) {
        super(props);
    }

    onClick(medium, event) {
        // TODO: Show preview in app
        openExternal(medium.expanded_url);
    }

    getLargestSize(sizes) {
        if (sizes.length === 0) {
            return 'thumb';
        }

        let max_size = 'thumb';
        for (const size in sizes) {
            if (sizes[max_size].h < sizes[size].h) {
                max_size = size;
            }
        }

        return max_size;
    }

    renderImage(medium, idx) {
        return (
            <a className="media" href={medium.media_url + ":" + this.getLargestSize(medium.sizes)} key={this.props.item_id + "-" + idx} data-lightbox={"group-" + this.props.item_id} >
                <img className="media" src={medium.media_url + ":thumb"} onClick={this.onClick.bind(this, medium)}/>
            </a>
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
