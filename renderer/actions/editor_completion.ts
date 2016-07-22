import Action, {ThunkAction} from './type';
import {searchSuggestionItems} from '../components/editor/suggestions';
import {AutoCompleteLabel} from '../components/editor/auto_complete_decorator';

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

