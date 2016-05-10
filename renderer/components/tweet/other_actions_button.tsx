import * as React from 'react';
import {connect} from 'react-redux';
import Tooltip = require('rc-tooltip');
import Tweet from '../../item/tweet';
import IconButton from '../icon_button';
import {showMessage} from '../../actions';

const remote = global.require('electron').remote;

interface OtherActionsButtonProps extends React.Props<any> {
    status: Tweet;
    dispatch?: Redux.Dispatch;
}

class OtherActionsButton extends React.Component<OtherActionsButtonProps, {}> {
    openAllUrlsInTweet() {
        for (const u of this.props.status.urls) {
            remote.shell.openExternal(u);
        }
    }

    statusUrlToClipboard() {
        const url = this.props.status.getMainStatus().statusPageUrl();
        remote.clipboard.write({ text: url })
        this.props.dispatch(showMessage('Copied status URL to clipboard.', 'info'));
    }

    render() {
        const overlay =
            <div className="tweet-actions__others-menu">
                <div
                    className="tweet-actions__others-menu-item"
                    onClick={() => this.openAllUrlsInTweet()}
                >
                    Open URLs in tweet
                </div>
                <div
                    className="tweet-actions__others-menu-item"
                    onClick={() => this.statusUrlToClipboard()}
                >
                    Copy tweet URL
                </div>
            </div>;

        return (
            <Tooltip
                placement="bottom"
                overlay={overlay}
                destroyTooltipOnHide
            >
                <div className="tweet-actions__others">
                    <i className="fa fa-ellipsis-h"/>
                </div>
            </Tooltip>
        );
    }
}

export default connect()(OtherActionsButton);
