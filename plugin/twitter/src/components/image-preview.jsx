import store from "../store";

const openExternal = global.require("shell").openExternal;

export default class ImagePreview extends React.Component {
    constructor(props) {
        super(props);
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
            <a className="media" ref={"image" + idx} href={medium.media_url + ":" + this.getLargestSize(medium.sizes)} key={this.props.item_id + "-" + idx} data-lightbox={"group-" + this.props.item_id} >
                <img className="media" src={medium.media_url + ":thumb"} />
            </a>
        );
    }

    doPreviewAction() {
        let overlay = document.querySelector("#lightbox");
        if (overlay.style.display === "none") {
            lightbox.start($(this.refs.image0.getDOMNode()));
        } else {
            lightbox.end();
        }
    }

    componentDidMount() {
        this.listener = id => {
            if (this.props.item_id === id) {
                this.doPreviewAction();
            }
        }
        store.on("toggle-preview-received", this.listener);
    }

    componentWillUnmount() {
        if (this.listener) {
            store.removeListener("toggle-preview-received", this.listener);
        }
    }

    render() {
        return (
            <div className="image-preview">
                {this.props.media.map((m, i) => this.renderImage(m, i))}
            </div>
        );
    }
}
