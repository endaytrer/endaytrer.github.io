import './index.css';
import Crt from './components/Crt';
import BlogList from './components/BlogList';
import blogConfig from '../blog.config';

const navLinks = [
  {
    name: "Home",
    link: "/"
  },
  {
    name: "Academic",
    link: "https://www.danielgu.org",
  },
  {
    name: "Blogs",
    link: "/blogs",
  }
]
const App = () => {
  const anchorId = "anchor"
  return (
    <main className="bg-teal-200 dark:bg-teal-950 text-teal-700 dark:text-teal-500 flex flex-col items-center">
      <header className="w-full min-h-svh flex flex-col items-center justify-center py-16 bg-teal-500 dark:bg-zinc-900 text-teal-900 dark:text-teal-500 rounded-b-sm shadow-lg">
        <div className="flex flex-col lg:flex-row w-full max-w-7xl">
          <div className="w-full lg:w-2/3">
            <Crt cursor>
              <h1 className="text-4xl">{blogConfig.realName}'s world</h1>
              <br />
              <p>Welcome to {blogConfig.siteName}!</p>
              <span><a className="cursor-pointer" onClick={(e) => {
                e.preventDefault();
                document.querySelector(`#${anchorId}`)?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}>Start exploring ...</a> </span>
            </Crt>
          </div>
          <div className="flex-1 m-5 lg:my-0">
            Keyboard
          </div>
        </div>
      </header>
      <article className="flex flex-col justify-between my-4 px-6 w-full min-h-svh max-w-7xl">
        <div id={anchorId} className="mb-6"></div>
        <div className="flex flex-col xl:grid grid-cols-3 gap-y-12">
          <div className="w-full xl:pr-4 row-span-2">
            <h2 className="text-2xl font-bold mt-10 mb-10 text-teal-900 dark:text-lime-50">Hi! I am {blogConfig.realName}.</h2>
            <h3 className="text-xl my-3 text-teal-900 dark:text-lime-50">I am a...</h3>
            {blogConfig.bio.map((para: string, i: number) => <p key={i} className="my-0.5 mx-2 font-serif" dangerouslySetInnerHTML={{__html: para}}></p>)}

            <div className="w-full mt-10 xl:pr-12 flex flex-col">
              {/* <h3 className="text-xl font-bold tracking-wide my-10 text-teal-900 dark:text-lime-50">Navigate</h3> */}
              {navLinks.map(({name, link}) => 
                <a key={name} href={link} className="text-lg font-serif text-teal-900 dark:text-teal-300 cursor-pointer border-b-1 border-teal-300 dark:border-teal-900 last:border-b-0 py-2">{name}</a>
              )}
            </div>
          </div>
          <div className="w-full col-span-2 xl:pl-4">
            <h3 className="text-xl font-bold tracking-wide mt-10 mb-5 text-teal-900 dark:text-lime-50">Recent Blogs</h3>
            <BlogList limit={5} paging={false}/>
          </div>

          <div className="w-full col-span-2 xl:pl-4">
            <h3 className="text-xl font-bold tracking-wide mt-10 mb-5 text-teal-900 dark:text-lime-50">Explore</h3>
            {blogConfig.sites.map((site) => <a key={site.url} className="flex flex-col sm:flex-row items-center justify-between text-lg font-serif cursor-pointer border-b-1 border-teal-300 dark:border-teal-900 last:border-b-0">
              
              {/* {site.thumbnail && <div className="thumbnail w-0 overflow-hidden flex bg-cover bg-center" style={{ backgroundImage: `url(${site.thumbnail})`, transition: "width 200ms ease-out" }}></div>} */}
              <div className="flex-1 py-3 w-full">
                <h4 className="font-semibold mb-1">{site.name}</h4>
                <p className="text-sm text-teal-600 mb-1">{site.introduction}</p>
              </div>
            </a>)}
          </div>
          
          <div className="w-full xl:px-4 col-start-2">
            <h3 className="text-xl font-bold tracking-wide mt-10 mb-5 text-teal-900 dark:text-lime-50">Social Media</h3>
          </div>

          <div className="w-full xl:pl-4">
            <h3 className="text-xl font-bold tracking-wide mt-10 mb-5 text-teal-900 dark:text-lime-50">Links</h3>
            <div className="font-serif underline decoration-0">
              {blogConfig.links.map(({name, url}) => 
                <a className="block my-1" href={url}>{name}</a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6"></div>
      </article>
      <footer className="bg-teal-500 dark:bg-zinc-900 w-full flex flex-col items-center py-10 px-6">
        <div className="w-full max-w-7xl text-xs text-teal-300 dark:text-teal-900">
          {blogConfig.copyright.map((para, i) => <p key={i} dangerouslySetInnerHTML={{__html: para}}></p>)}
        </div>
      </footer>
    </main>
  );
};

export default App;
