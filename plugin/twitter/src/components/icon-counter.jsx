export default class IconCounter extends React.Component {
    constructor(props) {
        super(props);
    }

    makeCount() {
        const c = this.props.count;
        if (c === 0) {
            return "";
        } if (c > 1000000) {
            return (Math.floor(c / 100000) / 10) + "M";
        } else if (c > 1000) {
            // Note: Remove after first decimal place by `floor(count / 1000 * 10) / 10`
            return (Math.floor(c / 100) / 10) + "K";
        } else {
            return c.toString();
        }
    }

    render() {
        return (
             <span className="icon-counter" style={{color: this.props.color}}>
                 <i className={"fa " + this.props.icon} /><span className="count"> {this.makeCount()}</span>
             </span>
         );
    }
}
