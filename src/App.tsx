import './index.css';
import Crt from './components/Crt';
import BlogList from './components/BlogList';
import blogConfig from '../blog.config';
import { useEffect, useState } from 'react';
import RadioGroup from './components/RadioGroup';
import { Program, defaultPrograms } from './programs';
import Speaker from './components/Speaker';
import Editor from './components/Editor';

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


function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
      return `${bytes} B`;
  }
  
  const units = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let size = bytes;
  let unitIndex = -1;
  
  do {
      size /= 1024;
      unitIndex++;
  } while (size >= 1024 && unitIndex < units.length - 1);
  
  // Round to one decimal place and remove trailing .0 if needed
  const roundedSize = Math.round(size * 10) / 10;
  const formattedSize = roundedSize % 1 === 0 
      ? roundedSize.toFixed(0) 
      : roundedSize.toFixed(1);
  
  return `${formattedSize} ${units[unitIndex]}`;
}

const App = () => {
  const [uploadProgram, setUploadProgram] = useState<File | null>(null);
  const [allPrograms, setAllPrograms] = useState(defaultPrograms);
  const [editorKeyEvent, setEditorKeyEvent] = useState<React.KeyboardEvent | null>(null);
  useEffect(() => {
    const crt = document.querySelector("#crt") as HTMLDivElement;
    crt.focus();
  })
  useEffect(() => {
    const programs_raw = localStorage.getItem("USER_PROGRAMS");
    let user_programs: Program[] = [];
    if (programs_raw !== null) {
      user_programs = JSON.parse(programs_raw);
    }
    if (uploadProgram !== null) {
      uploadProgram.bytes().then((bytes) => {
        const program_text = new TextDecoder().decode(bytes)
        const upload_program = {
          name: uploadProgram.name,
          program: program_text
        }
        user_programs.push(upload_program);
        setAllPrograms(defaultPrograms.concat(user_programs))
      });
    } else {
      setAllPrograms(defaultPrograms.concat(user_programs))
    }
  }, [uploadProgram]);
  const [machinePage, setMachinePage] = useState(0);
  const anchorId = "anchor"
  const [programSelection, setProgramSelection] = useState(0);
  return (
    <main className="bg-teal-200 dark:bg-teal-950 text-teal-700 dark:text-teal-500 flex flex-col items-center">
      <header className="w-full min-h-svh flex flex-row items-center justify-center py-16 bg-teal-500 dark:bg-zinc-900 text-teal-900 dark:text-teal-500 rounded-b-sm shadow-lg">
        <div className="flex flex-col lg:flex-row w-full max-w-7xl">
          <div className="w-full lg:w-2/3">
            <Crt cursor={machinePage === 0 || machinePage === 3} onKeyDown={(e) => {
              if (machinePage === 1) {
                if (e.key === "Escape" || e.key === 'Tab') {
                  return;
                }
                if (e.key === "ArrowDown") {
                  setProgramSelection((old) => Math.min(allPrograms.length, old + 1))
                } else if (e.key === "ArrowUp") {
                  setProgramSelection((old) => Math.max(0, old - 1))
                } else if (e.key === "Enter") {
                  if (programSelection === allPrograms.length) {
                    const input = document.querySelector("#program-select") as HTMLInputElement;
                    input.click()
                  }
                }
                e.preventDefault()
              } else if (machinePage === 2) {
                setEditorKeyEvent(e);
              }
            }}>
              {machinePage === 0 && <>
                <h1 className="text-4xl">{blogConfig.realName}'s world</h1>
                <br />
                <p>Welcome to {blogConfig.siteName}!</p>
                <span><a className="cursor-pointer" onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(`#${anchorId}`)?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}>Start exploring ...</a> </span>
              </>}
              {machinePage === 1 && <div>
                <h1 className="hidden lg:block text-4xl mb-4">Load a program...</h1>
                <table className="mb-6">
                  <thead>
                    <tr>
                      <th>Program name</th>
                      <th className="w-20">size</th>
                    </tr>
                  </thead>
                  <tbody className="select-none">
                    {allPrograms.map((prog, i) => <tr className={i === programSelection ? "bg-lime-50 text-emerald-700" : ""} onClick={() => setProgramSelection(i)} key={prog.name}>
                      <td>{prog.name}</td>
                      <td>{formatFileSize(prog.program.length)}</td>
                    </tr>)}
                  </tbody>
                  <tfoot>
                  <tr className={programSelection === allPrograms.length ? "bg-lime-50 text-emerald-700" : ""}>
                      <td><input type="file" id="program-select" accept=".s,.S,.asm,  text/plain" tabIndex={-1} className="w-full" onChange={(e) => {

                        const crt = document.querySelector("#crt") as HTMLDivElement;
                        crt.focus();
                        if (e.currentTarget.files === null) {
                          setUploadProgram(null)
                        } else {
                          const file = e.currentTarget.files.item(0);
                          if (file === null) {
                            setUploadProgram(null);
                          } else {
                            if (file.size > 64 * 1024) {
                              alert("File should be smaller than 64KiB!");
                              e.currentTarget.value = ""
                            } else {
                              setUploadProgram(e.currentTarget.files.item(0));
                            }
                          }
                        }
                      }}/></td>
                      <td>{uploadProgram ? formatFileSize(uploadProgram.size) : ""}</td>
                    </tr>
                  </tfoot>
                </table>
                <p className="-mb-2">Use "PROGRAM" button to edit,</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;"RUN" button to the program.</p>
              </div>}
              {machinePage === 2 && <Editor
                filename={programSelection === allPrograms.length ? "[New file]" : allPrograms[programSelection].name}
                keyEvent={editorKeyEvent}
                value={programSelection === allPrograms.length ? "" : allPrograms[programSelection].program}
                onChange={(savefile) => {
                  if (programSelection === allPrograms.length) {
                    setAllPrograms((old) => old.concat([{ name: "Untitled.S", program: savefile }]))
                  } else {
                    setAllPrograms((old) => {
                      const before = old.slice();
                      before[programSelection].program = savefile;
                      return before;
                    })
                  }
                }}/>}
            </Crt>
          </div>
          <div className="flex-1 m-5 lg:my-0 flex flex-col gap-8 lg:gap-24 items-center justify-between">

            <div className="w-full  rounded-md p-4 border-1 border-teal-600 dark:border-teal-950">
              <RadioGroup options={["START", "LOAD", "PROGRAM", "RUN"]} selection={machinePage} onChange={(v) => {
                setMachinePage(v);
                if (v === 2) {
                  setEditorKeyEvent(null);
                }
              }} />
            </div>
            <div className="w-full h-full">
            <Speaker />
            </div>
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
