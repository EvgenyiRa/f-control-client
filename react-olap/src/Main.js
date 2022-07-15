import React from 'react';
import {Switch,Route} from 'react-router-dom'
import { useIntl } from 'react-intl';
import { CgMenuRound } from 'react-icons/cg';
import 'bootstrap/dist/css/bootstrap.min.css';

import logo from './img/logo.png';

import Settings from './forms/Settings';
import Control from './forms/Control';


const Main = ({
  collapsed,
  rtl,
  image,
  toggled,
  handleToggleSidebar,
  handleCollapsedChange,
  handleRtlChange,
  handleImageChange,
  userInfo
}) => {
  const intl = useIntl();


  const Home = () => (
    <div style={{padding:'3em'}}>
      <header>
        <h1>
          <img width={80} src={logo} alt="WEB-OLAO logo" /> {intl.formatMessage({ id: 'title' })}
        </h1>
        <p>{intl.formatMessage({ id: 'description' })}</p>

      </header>

    </div>
  )


  return (
    <main>

      <div className="btn-toggle" onClick={() => handleToggleSidebar(true)} title="Меню">
        <CgMenuRound />
      </div>

      <Switch>
        <Route exact path='/' component={Home}/>
      </Switch>
      <Switch>
          <Route exact path='/Control' component={Control}/>
      </Switch>
     <Switch>
         <Route exact path='/settings' component={Settings}/>
    </Switch>

      <footer>
        <small>
          © 2021 WEB-OLAP
        </small>
        <br />
        <div className="social-bagdes">
          При наличии ошибок и пожеланий писать в WatsAPP +79204452901
        </div>
      </footer>
    </main>
  );
};

export default Main;
