import Dexie from 'dexie';
import {emoji} from 'node-emoji';
import Action, {ThunkAction} from './type';
import {AutoCompleteLabel} from '../components/editor/auto_complete_decorator';
import {SuggestionItem} from '../components/editor/suggestions';
import DB from '../database/db';

const Promise = Dexie.Promise;
const MaxSuggestions = 5;

function searchEmojiSuggestionItems(query: string) {
    if (query.endsWith(':')) {
        return Promise.resolve([]);
    }

    // TODO:
    // If narrowing suggestions, we can reuse the previous
    // suggestions and filter it.

    let count = 0;
    let suggestions = [] as SuggestionItem[];
    const input = query.slice(1);  // Note: Omit ':'
    for (const name in emoji) {
        if (name.startsWith(input)) {
            suggestions.push({
                code: emoji[name],
                description: name,
            });
            count += 1;
        }
        if (count > MaxSuggestions) {
            return Promise.resolve(suggestions);
        }
    }
    return Promise.resolve(suggestions);
}


const RE_QUERY_END = /\s$/;
function searchScreenNameSuggestionItems(query: string) {
    if (RE_QUERY_END.test(query)) {
        return Promise.resolve([]);
    }

    // TODO:
    // If narrowing suggestions, do not access database and filter
    // previous suggestions.

    const input = query.slice(1);  // Note: Omit '@'
    return DB.accounts.getScreenNameSuggestions(input);
}

function hashtagTextToSuggestion(text: string) {
    return {description: '#' + text} as SuggestionItem;
}

function searchHashtagSuggestionItems(query: string): Dexie.Promise<SuggestionItem[]> {
    if (RE_QUERY_END.test(query)) {
        return Promise.resolve([] as SuggestionItem[]);
    }

    // TODO:
    // If narrowing suggestions, do not access database and filter
    // previous suggestions.

    const input = query.slice(1);  // Note: Omit '#'
    if (input.length === 0) {
        const stored = DB.hashtag_completion_history.getHashtags();
        const from_history = stored.map(hashtagTextToSuggestion);

        if (from_history.length >= MaxSuggestions) {
            return Promise.resolve(from_history);
        }

        return DB.hashtags.getHashtagsExceptFor(stored, MaxSuggestions - from_history.length)
            .then(hs => from_history.concat(hs.map(hashtagTextToSuggestion)))
            .catch(() => from_history);
    }

    return DB.hashtags.getHashtagsStartWith(input, MaxSuggestions)
        .then(hs => hs.map(hashtagTextToSuggestion))
        .catch(() => [] as SuggestionItem[]);
}

// TODO:
// Check previous query. If previous one and this one are the same,
// simply returns previous suggestions.
export function searchSuggestionItems(query: string, label: AutoCompleteLabel): Dexie.Promise<SuggestionItem[]> {
    switch (label) {
        case 'EMOJI': return searchEmojiSuggestionItems(query);
        case 'SCREENNAME': return searchScreenNameSuggestionItems(query);
        case 'HASHTAG': return searchHashtagSuggestionItems(query);
        default:
            log.error('Unimplemented auto complete type:', label);
            return Promise.resolve([]);
    }
}

export function updateAutoCompletion(left: number, top: number, query: string, label: AutoCompleteLabel): ThunkAction {
    return dispatch => {
        searchSuggestionItems(query, label)
            .then(suggestions => dispatch({
                type: 'UpdateAutoCompletion',
                left,
                top,
                query,
                suggestions,
                completion_label: label,
            }))
            .catch((e: Error) => log.error('updateAutoCompletion():', e));
    };
}

export function downAutoCompletionFocus(): Action {
    return {
        type: 'DownAutoCompletionFocus',
    };
}

export function upAutoCompletionFocus(): Action {
    return {
        type: 'UpAutoCompletionFocus',
    };
}

export function stopAutoCompletion(): Action {
    return {
        type: 'StopAutoCompletion',
    };
}

