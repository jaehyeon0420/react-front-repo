import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//index.css import 제거
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";//라우터 사용을 위한 import

//아래 2개 import는 axios error interceptor에서, 컴포넌트 전환을 위함.
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { customHistory } from './common/history.js';

createRoot(document.getElementById('root')).render(
  <HistoryRouter history={customHistory}>
    <App />
  </HistoryRouter>,
)
