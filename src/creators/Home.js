import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { authSuccess, authFail } from '../actions/authActions';

import MainContainer from "../containers/main/MainContainer";

export const Home = connect(null, dispatch => ({
  logout: () => {
    dispatch(authFail());
    dispatch(push('/'));
  }
}))(MainContainer);
