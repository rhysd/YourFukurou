import Kind from '../action_kinds';
import {Action} from '../actions';
import TweetMediaState, {DefaultTweetMediaState} from '../states/tweet_media';

export default function tweetMedia(state: TweetMediaState = DefaultTweetMediaState, action: Action) {
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
