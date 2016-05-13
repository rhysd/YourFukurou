import {Twitter} from 'twit';
import {Action, Kind} from '../actions';

export interface TweetMediaState {
    index: number;
    picture_urls: string[];
}

export default function tweetMedia(state: TweetMediaState = null, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.OpenPicturePreview:
            return {
                index: action.index || 0,
                picture_urls: action.media_urls,
            };
        case Kind.CloseTweetMedia:
            return null;
        case Kind.MoveToNthPicturePreview:
            return {
                index: action.index,
                picture_urls: state.picture_urls,
            };
        default:
            return state;
    }
}
