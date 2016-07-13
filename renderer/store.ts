import thunk from 'redux-thunk';
import root from './reducers/root';
import State from './states/root';
import {createStore, applyMiddleware} from 'redux';

export type Dispatch = Redux.Dispatch<State>;

export default createStore(
    root,
    applyMiddleware(thunk)
);
// export default applyMiddleware(thunk)(createStore)(root);
