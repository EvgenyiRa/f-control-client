import React, { useState } from 'react';
import {HashRouter} from 'react-router-dom'
import { IntlProvider } from 'react-intl';
import Layout from './Layout';
import messages from './messages';
import './styles/App.scss';
import Enter from './Enter'
import {getAuthorization} from './system.js';;

function App() {
  const [locale, setLocale] = useState('ru');
  const [numAuth, setNumAuth] = useState(getAuthorization());
  const caseStatus=function() {
      if ([1,2].indexOf(numAuth)>-1) {
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
      {caseStatus()}
    </IntlProvider>
  );
}

export default App;
