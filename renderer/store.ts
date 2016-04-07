import thunk from 'redux-thunk';
import root from './reducers';
import {createStore, applyMiddleware} from 'redux';

export default applyMiddleware(thunk)(createStore)(root);
