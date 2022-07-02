import React, { useState,useEffect } from 'react';
import {HashRouter} from 'react-router-dom'
import { IntlProvider } from 'react-intl';
import Layout from './Layout';
import messages from './messages';
import './styles/App.scss';
import Enter from './Enter'
import {getAuthorization} from './system.js';;

function App() {
  const [locale, setLocale] = useState('ru');
  const [numAuth, setNumAuth] = useState(-1);
  useEffect(() => {
    setAuth();
  },[]);
  const setAuth=async()=> {
     if (numAuth===-1) {
       const res=await getAuthorization();
       setNumAuth(res);
     }
  }
  const caseStatus=function(numAuthIn) {
      if ([1,2].indexOf(numAuthIn)>-1) {
        return (
          <HashRouter>
            <Layout setLocale={setLocale}  setIsAuth={setNumAuth}/>
          </HashRouter>
        );
      }
      else {
        return (
          <HashRouter>
            <Enter setIsAuth={setNumAuth}/>
          </HashRouter>
        );
      }
  }
  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      {caseStatus(numAuth)}
    </IntlProvider>
  );
}

export default App;
