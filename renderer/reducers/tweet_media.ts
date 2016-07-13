import Action from '../action_type';
import TweetMediaState, {DefaultTweetMediaState} from '../states/tweet_media';

export default function tweetMedia(state: TweetMediaState = DefaultTweetMediaState, action: Action) {
    switch (action.type) {
        case 'OpenPicturePreview':
            return state.openMedia(action.media_urls, action.index);
        case 'CloseTweetMedia':
            return state.closeMedia();
        case 'MoveToNthPicturePreview':
            return state.moveToNthMedia(action.index);
        default:
            return state;
    }
}
