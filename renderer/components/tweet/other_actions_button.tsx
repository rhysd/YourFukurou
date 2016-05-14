import * as React from 'react';
import {connect} from 'react-redux';
import Tooltip = require('rc-tooltip');
import Tweet, {TwitterUser} from '../../item/tweet';
import IconButton from '../icon_button';
import {
    showMessage,
    destroyStatus,
} from '../../actions';

const electron = global.require('electron');

interface OtherActionsButtonProps extends React.Props<any> {
    status: Tweet;
    owner?: TwitterUser;
    dispatch?: Redux.Dispatch;
}

function openAllUrlsInTweet(props: OtherActionsButtonProps) {
    'use strict';
    for (const u of props.status.urls.map(u => u.expanded_url)) {
        electron.shell.openExternal(u);
    }
}

function statusUrlToClipboard(props: OtherActionsButtonProps) {
    'use strict';
    const url = props.status.getMainStatus().statusPageUrl();
    electron.clipboard.write({ text: url });
    props.dispatch(showMessage('Copied status URL to clipboard.', 'info'));
}

function deleteThisTweet(props: OtherActionsButtonProps) {
    'use strict';
    props.dispatch(destroyStatus(props.status.id));
}

function copyJson(props: OtherActionsButtonProps) {
    'use strict';
    const json = JSON.stringify(props.status.json, null, 2);
    electron.clipboard.write({ text: json });
    props.dispatch(showMessage('Copied status JSON to clipboard.', 'info'));
}

function renderDeleteThisTweet(props: OtherActionsButtonProps) {
    'use strict';
    const isMyTweet = props.status.user.id === props.owner.id;
    if (!isMyTweet) {
        return undefined;
    }

    return (
        <div
            className="tweet-actions__others-menu-item"
            onClick={() => deleteThisTweet(props)}
        >
            Delete this tweet
        </div>
    );
}

const OtherActionsButton = (props: OtherActionsButtonProps) => {
    const overlay =
        <div className="tweet-actions__others-menu">
            {renderDeleteThisTweet(props)}
            <div
                className="tweet-actions__others-menu-item"
                onClick={() => openAllUrlsInTweet(props)}
            >
                Open URLs in tweet
            </div>
            <div
                className="tweet-actions__others-menu-item"
                onClick={() => statusUrlToClipboard(props)}
            >
                Copy tweet URL
            </div>
            <div
                className="tweet-actions__others-menu-item"
                onClick={() => copyJson(props)}
            >
                Copy tweet JSON
            </div>
        </div>;

    return (
        <Tooltip
            placement="bottom"
            trigger={['click']}
            overlay={overlay}
            destroyTooltipOnHide
        >
            <div className="tweet-actions__others">
                <i className="fa fa-ellipsis-h"/>
            </div>
        </Tooltip>
    );
};

export default connect()(OtherActionsButton);
