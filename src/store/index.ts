import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import userReducer, { UserReducer, UserState } from './user-reducer';
// import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
// import loginSaga from '../action/login-saga';

export interface ReducerMap {
  user: UserReducer;
}

export interface RootStateMap {
  user: UserState;
}

// const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  combineReducers({ user: userReducer } as ReducerMap),
  composeWithDevTools(
    // applyMiddleware(sagaMiddleware)
    applyMiddleware(thunk)
  )
);

// sagaMiddleware.run(loginSaga);

export default store;
