import readFile from '../utils/readfilePromise';
import {getLatest} from '../models/RestrictionDay';
import server from '../config/server.js';
import {__DEVELOPMENT__} from '../config/envs';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import * as reducers from '../reducers';
import {setLatestRestrictionDay} from '../actions/RestrictionDayActions';
import App from '../components/App.jsx';


const reducer = combineReducers(reducers);
const store = createStore(reducer, applyMiddleware(thunk));


export default function* (){
  const templatePath = path.join(__dirname, '..', 'views', 'main.html');
  let template = yield readFile(templatePath, {encoding: 'utf8'});

  // Inject webpack hot bundle on development env
  if (__DEVELOPMENT__) {
    template = template.replace('src="js/client.js"',
       `src="http://localhost:${server.webpackPort}/js/client.js"`);
  }

  // Setup Redux & Get Initial App State
  const latestRestrictionDay = yield getLatest();
  store.dispatch(setLatestRestrictionDay(latestRestrictionDay));
  const state = store.getState();
  const initialAppStateInjection = `<script>window.__initialAppState=${JSON.stringify(state)}</script>`;

  // Inject React App
  const stateInjectedTemplate = template.replace('<%= reactAppInitialState %>', initialAppStateInjection);
  this.body = stateInjectedTemplate.replace('<%= reactApp %>',
    ReactDOMServer.renderToString(<App store={store} />)
  );
}
