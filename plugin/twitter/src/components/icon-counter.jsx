export default class IconCounter extends React.Component {
    constructor(props) {
        super(props);
    }

    makeCount() {
        const c = this.props.count;
        if (c === 0) {
            return "";
        } if (c > 1000000) {
            return (Math.floor(c / 10) / 100000) + "M";
        } else if (c > 1000) {
            // Note: Remove after first decimal place by `floor(count / 1000 * 100) / 100`
            return (Math.floor(c / 10) / 100) + "K";
        } else {
            return c.toString();
        }
    }

    render() {
        return (
             <span className="icon-counter" style={{color: this.props.color}}>
                 <i className={"fa " + this.props.icon} /> {" " + this.makeCount()}
             </span>
         );
    }
}
