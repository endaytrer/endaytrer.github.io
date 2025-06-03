import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import "./index.css";
import BlogList from './pages/BlogList';

const rootEl = document.getElementById('root');
if (rootEl) {

  const pathname = document.location.pathname;
  let rootElement;
  if (pathname === "/blogs") {
    rootElement = <BlogList />;
  } else {
    rootElement = <App />;
  }
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      {rootElement}
    </React.StrictMode>,
  );
}
