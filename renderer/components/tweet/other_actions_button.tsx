import * as React from 'react';
import {connect} from 'react-redux';
import Tweet from '../../item/tweet';
import IconButton from '../icon_button';
import {notImplementedYet} from '../../actions';

interface OtherActionsButtonProps extends React.Props<any> {
    status: Tweet;
    dispatch?: Redux.Dispatch;
}

class OtherActionsButton extends React.Component<OtherActionsButtonProps, {}> {
    menu_node: HTMLElement;

    notImplementedYet() {
        this.props.dispatch(notImplementedYet());
        this.dismissMenu();
    }

    toggleMenu() {
        if (!this.menu_node) {
            return;
        }

        if (this.menu_node.style.display === 'none') {
            this.menu_node.style.display = 'flex';
        } else {
            this.menu_node.style.display = 'none';
        }
    }

    dismissMenu() {
        if (!this.menu_node) {
            return;
        }
        this.menu_node.style.display = 'none';
    }

    render() {
        return (
            <div className="tweet-actions__others">
                <IconButton
                    name="ellipsis-h"
                    tip="others"
                    onClick={() => this.toggleMenu()}
                />
                <div
                    className="tweet-actions__others-menu"
                    style={{display: 'none'}}
                    ref={r => { this.menu_node = r; }}
                >
                    <div
                        className="tweet-actions__others-menu-item"
                        onClick={() => this.notImplementedYet()}
                    >
                        Open URLs in tweet
                    </div>
                    <div
                        className="tweet-actions__others-menu-item"
                        onClick={() => this.notImplementedYet()}
                    >
                        Copy tweet URL
                    </div>
                </div>
            </div>
        );
    }
}

export default connect()(OtherActionsButton);
