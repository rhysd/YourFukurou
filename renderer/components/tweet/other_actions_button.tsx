import * as React from 'react';
import {connect} from 'react-redux';
import Tooltip = require('rc-tooltip');
import Tweet, {TwitterUser} from '../../item/tweet';
import IconButton from '../icon_button';
import {
    showMessage,
    destroyStatus,
    openEditor,
    openEditorForReply,
} from '../../actions';

const electron = global.require('electron');

interface OtherActionsButtonProps extends React.Props<any> {
    status: Tweet;
    owner?: TwitterUser;
    dispatch?: Redux.Dispatch;
}

function statusUrlToClipboard(props: OtherActionsButtonProps) {
    'use strict';
    const url = props.status.getMainStatus().statusPageUrl();
    electron.clipboard.write({ text: url });
    props.dispatch(showMessage('Copied status URL to clipboard.', 'info'));
}

function deleteThisTweet(e: React.MouseEvent, props: OtherActionsButtonProps) {
    'use strict';
    e.preventDefault();
    e.stopPropagation();
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
            onClick={e => {
                e.stopPropagation();
                deleteThisTweet(e, props);
            }}
        >
            Delete this tweet
        </div>
    );
}

function correctThisTweet(e: React.MouseEvent, props: OtherActionsButtonProps) {
    'use strict';
    e.stopPropagation();
    e.preventDefault();

    const {dispatch, status, owner} = props;
    props.dispatch(destroyStatus(status.id));
    if (status.in_reply_to_status !== null) {
        dispatch(openEditorForReply(status.in_reply_to_status, owner, status.text));
    } else {
        dispatch(openEditor(status.text));
        if (status.hasInReplyTo()) {
            // XXX
            log.warn('Corrected status has in_reply_to_status_id but does not have in_reply_to_status.  Fallback into normal tweet:', status);
        }
    }
}

function renderCorrectThisTweet(props: OtherActionsButtonProps) {
    'use strict';
    const isMyTweet = props.status.user.id === props.owner.id;
    if (!isMyTweet) {
        return undefined;
    }

    return (
        <div
            className="tweet-actions__others-menu-item"
            onClick={e => correctThisTweet(e, props)}
        >
            Correct this tweet
        </div>
    );
}

function doNotPropagateEvent(e: React.MouseEvent) {
    'use strict';
    e.stopPropagation();
}

const OtherActionsButton = (props: OtherActionsButtonProps) => {
    const overlay =
        <div className="tweet-actions__others-menu">
            {renderDeleteThisTweet(props)}
            <div
                className="tweet-actions__others-menu-item"
                onClick={e => {
                    e.stopPropagation();
                    props.status.openStatusPageInBrowser();
                }}
            >
                Open URLs in tweet
            </div>
            <div
                className="tweet-actions__others-menu-item"
                onClick={e => {
                    e.stopPropagation();
                    statusUrlToClipboard(props);
                }}
            >
                Copy tweet URL
            </div>
            <div
                className="tweet-actions__others-menu-item"
                onClick={e => {
                    e.stopPropagation();
                    copyJson(props);
                }}
            >
                Copy tweet JSON
            </div>
            {renderCorrectThisTweet(props)}
        </div>;

    return (
        <div onClick={doNotPropagateEvent}>
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
        </div>
    );
};

export default connect()(OtherActionsButton);
