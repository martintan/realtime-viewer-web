import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
// import PrivateRoute from './PrivateRoute';
import Editor from './editor/Editor';
import Docs from './Docs';

const Main = () => (
  <Switch>
    <Route exact path='/' component={Editor} />
    <Route path='/docs' component={Docs} />
    {/*<Route path='/login' component={Login} />*/}
  </Switch>
);

export default Main;
