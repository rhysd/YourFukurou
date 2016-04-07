import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../reducers';

interface Props {
}

const App = (props: Props) => <div>Hellow, world!</div>;

function select(state: State): Props {
    return state;
}

export default connect(select)(App);
