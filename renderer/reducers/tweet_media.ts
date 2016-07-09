import {Twitter} from 'twit';
import {Action, Kind} from '../actions';
import TweetMediaState, {DefaultTweetMediaState} from '../states/tweet_media';

export default function tweetMedia(state: TweetMediaState = DefaultTweetMediaState, action: Action) {
    switch (action.type) {
        case Kind.OpenPicturePreview:      return action.next_media;
        case Kind.CloseTweetMedia:         return action.next_media;
        case Kind.MoveToNthPicturePreview: return action.next_media;
        default:                           return state;
    }
}
