import {Twitter} from 'twit';
import {Action, Kind} from '../actions';
import TweetMediaState, {DefaultTweetMediaState} from '../states/tweet_media';

export default function tweetMedia(state: TweetMediaState = DefaultTweetMediaState, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.OpenPicturePreview:
            return state.openMedia(action.media_urls, action.index);
        case Kind.CloseTweetMedia:
            return state.closeMedia();
        case Kind.MoveToNthPicturePreview:
            return state.moveToNthMedia(action.index);
        default:
            return state;
    }
}
