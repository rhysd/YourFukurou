import thunk from 'redux-thunk';
import root from './reducers';
import {createStore, applyMiddleware} from 'redux';

export default createStore(
    root,
    applyMiddleware(thunk)
);
// export default applyMiddleware(thunk)(createStore)(root);