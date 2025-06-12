import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import "./index.css";
import BlogList from './pages/AllBlogs';
import blogConfig from '../blog.config';

const rootEl = document.getElementById('root');
if (rootEl) {

  const pathname = window.location.pathname;
  let rootElement;
  if (pathname === "/blogs") {
    rootElement = <BlogList searchParams={new URLSearchParams(window.location.search)} />;
  } else {
    rootElement = <App />;
  }
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      {rootElement}
      <footer className="bg-teal-500 dark:bg-zinc-900 w-full flex flex-col items-center py-10">
        <div className="w-full max-w-7xl text-xs px-6 text-teal-300 dark:text-teal-900">
          {blogConfig.copyright.map((para, i) => <p key={i} dangerouslySetInnerHTML={{__html: para}}></p>)}
        </div>
      </footer>
    </React.StrictMode>,
  );
}
