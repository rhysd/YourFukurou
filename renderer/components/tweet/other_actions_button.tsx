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

interface ConnectedProps {
    status: Tweet;
    owner?: TwitterUser;
}

interface DispatchProps {
    onDeleteTweet: (e: React.MouseEvent) => void;
    onUrlOpen: (e: React.MouseEvent) => void;
    onCopyUrl: (e: React.MouseEvent) => void;
    onCopyJson: (e: React.MouseEvent) => void;
    onCorrectTweet: (e: React.MouseEvent) => void;
}

type OtherActionsButtonProps = ConnectedProps & DispatchProps & React.Props<any>;

function statusUrlToClipboard(status: Tweet, dispatch: Redux.Dispatch) {
    'use strict';
    const url = status.getMainStatus().statusPageUrl();
    electron.clipboard.write({ text: url });
    dispatch(showMessage('Copied status URL to clipboard.', 'info'));
}

function copyJson(status: Tweet, dispatch: Redux.Dispatch) {
    'use strict';
    const json = JSON.stringify(status.json, null, 2);
    electron.clipboard.write({ text: json });
    dispatch(showMessage('Copied status JSON to clipboard.', 'info'));
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
            onClick={props.onDeleteTweet}
        >
            Delete this tweet
        </div>
    );
}

function correctThisTweet(status: Tweet, owner: TwitterUser, dispatch: Redux.Dispatch) {
    'use strict';
    dispatch(destroyStatus(status.id));
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
            onClick={props.onCorrectTweet}
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
                onClick={props.onUrlOpen}
            >
                Open URLs in tweet
            </div>
            <div
                className="tweet-actions__others-menu-item"
                onClick={props.onCopyUrl}
            >
                Copy tweet URL
            </div>
            <div
                className="tweet-actions__others-menu-item"
                onClick={props.onCopyJson}
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

function mapDispatch(dispatch: Redux.Dispatch, props: ConnectedProps): DispatchProps {
    'use strict';
    return {
        onDeleteTweet: e => {
            e.stopPropagation();
            dispatch(destroyStatus(props.status.id));
        },
        onUrlOpen: e => {
            e.stopPropagation();
            props.status.openStatusPageInBrowser();
        },
        onCopyUrl: e => {
            e.stopPropagation();
            statusUrlToClipboard(props.status, dispatch)
        },
        onCopyJson: e => {
            e.stopPropagation();
            copyJson(props.status, dispatch);
        },
        onCorrectTweet: e => {
            e.stopPropagation();
            correctThisTweet(props.status, props.owner, dispatch);
        },
    };
}

export default connect(null, mapDispatch)(OtherActionsButton);
