import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { promiseMiddleware } from '@adobe/redux-saga-promise';
import { rootReducer } from '../store/appReducers';
import {} from 'axios';

export type AppStore = ReturnType<typeof rootReducer>;

const sagaMiddleware = createSagaMiddleware();

// @ts-ignore
let composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(promiseMiddleware, sagaMiddleware)),
);


export default store