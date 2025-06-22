import { useEffect, useState } from 'react';
import { BlogInfo, BlogManifest } from '../api/blog';
import Tag from './Tag';

function BlogEntry({id, blog}: {id: string, blog: BlogInfo}) {
    const linkName = id.split(".")[0] + ".html";
    return <a className="flex items-center justify-between gap-4 pt-2 pb-4 my-2 last-of-type:border-b-0 font-serif border-b-1 border-teal-300 dark:border-teal-900" href={"/blogs/" + linkName}>
        <div className="flex flex-col items-start gap-2">
            <h4 className="text-lg font-semibold">{blog.title}</h4>
            <div className="text-md text-teal-600 overflow-hidden line-clamp-3 overflow-ellipsis">{
                blog.password ?
                <div className="flex items-center gap-2"><i className="fa-lock fa-solid text-sm text-teal-400 dark:text-teal-800"></i> <p>The blog is locked.</p></div> :
                blog.preview
            }</div>
            {blog.tags.length > 0 && <div className="flex flex-wrap items-center gap-2 text-sm mb-2">{blog.tags.map((tag) => <a href={`/blogs?tags=${tag}`} key={tag}><Tag selected={false} onClick={undefined}>{tag}</Tag></a>)}</div>}
        </div>
        <div>
        <p className="text-teal-500 text-lg font-normal">{blog.created.toLocaleDateString()}</p>
        </div>
        
    </a>
}

export interface Filter {
    password: boolean | undefined,
    /// empty array is considerred as none
    language: string[],
    license: (string | null)[],
    /// Only support union of tags
    tags: string[],
}
function isFilterEmpty(obj: Filter | undefined): boolean {
    if (obj === undefined) {
        return true;
    }
    return obj.password === undefined && obj.language.length === 0 && obj.license.length === 0 && obj.tags.length === 0;
}
export default function BlogList({
    limit,
    page=0,
    setPage=undefined,
    setLimit=undefined,
    filter=undefined,
    setFilter=undefined,
    sort="created",
    setSort=undefined,
    descent=true,
    setDescent=undefined,
    paging=false
} : {
    limit: number,
    page: number,
    setLimit: ((limit: number) => void) | undefined,
    setPage: ((page: number) => void) | undefined,
    filter: Filter | undefined,
    setFilter: ((filter: Filter) => void) | undefined,
    sort: "title" | "created",
    setSort: ((sort: "title" | "created") => void) | undefined,
    descent: boolean,
    setDescent: ((descent: boolean) => void) | undefined,
    paging: boolean
}) {
    const [blogManifest, setBlogManifest] = useState<BlogManifest>({"blogs": {}, "tags": {}});
    useEffect(() => {
        fetch('/api/blog-manifest.json')
            .then(res => res.json())
            .then((data: BlogManifest) => {
                // Convert string dates to Date objects
                Object.values(data.blogs).forEach(blog => {
                    blog.created = new Date(blog.created);
                    blog.modified = new Date(blog.modified);
                });
                setBlogManifest(data);
            });
    }, []);
    const numPages = Math.ceil(Object.entries(blogManifest.blogs).length / limit);
    const realPage = Math.max(0, Math.min(page, numPages - 1));
    const displayBlogs = Object.entries(blogManifest.blogs)
            .filter(([_, blog]) => {
                if (filter === undefined) {
                    return true;
                }
                const {password, language, license, tags} = filter;
                if (password !== undefined && blog.password !== password) { return false; }
                if (language.length > 0 && !language.includes(blog.language)) { return false; }
                if (license.length > 0 && !license.includes(blog.license)) { return false; }
                if (tags.length > 0 && !blog.tags.some((tag) => tags.includes(tag))) { return false; }
                return true;
            })
            .sort(([_a, a], [_b, b]) => {
                let delta = 0;
                if (sort === "created") {
                    delta = a.created.getTime() - b.created.getTime();
                } else if (sort === "title") {
                    delta = a.title.localeCompare(b.title)
                } else {
                    throw "Sorting not coverred"
                }
                if (descent) {
                    delta = -delta;
                }
                return delta;
            })
            .slice(realPage * limit, (realPage + 1) * limit);

    const pagingButtonStyle = "cursor-pointer px-1"
    
    return <div>
        {paging && <div>
            <h3 className="text-lg font-bold justify-between text-teal-900 dark:text-lime-50">Filtering</h3>
            <div className="flex gap-2 m-4">

                <label htmlFor="">Tags:</label>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(blogManifest.tags).map((tag) => <Tag key={tag} selected={(filter !== undefined) && filter.tags.includes(tag)} onClick={() => {
                        const ans: Filter = filter === undefined ? {
                            password: undefined,
                            language: [],
                            license: [],
                            tags: [],
                        } : filter;
                        if (ans.tags.includes(tag)) {
                            ans.tags = ans.tags.filter((v) => v != tag);
                        } else {
                            ans.tags.push(tag);
                        }
                        if (setFilter) setFilter(ans);
                    }}>{tag}</Tag>)}
                </div>
            </div>
        </div>}
        {
            displayBlogs.map(([id, info]) => <BlogEntry id={id} blog={info} key={id}/>)}
        {Object.entries(blogManifest.blogs).length === 0 && <div className=''>No blog {isFilterEmpty(filter) ? "is available" : "matches the condition"}.</div>}
        {paging && <div className="mt-5 font-serif w-full text-teal-900 dark:text-lime-50 flex flex-wrap items-center justify-end gap-6">
            <div>Blogs per page:
                <select className="bg-transparent cursor-pointer mx-2 px-2 py-1" value={limit} onChange={(e) => {
                    if (setPage) setPage(0);
                    if (setLimit) setLimit(parseInt(e.currentTarget.value))}
                }>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option></select>
                </div>
            {numPages > 1 && <div className="flex gap-4 items-center">
                {realPage >= 1 && <button className="cursor-pointer" onClick={() => {if (setPage) setPage(realPage - 1)}}>
                    <svg className="icon fill-teal-800 dark:fill-teal-500 h-7 w-4" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6595" width="200" height="200">
                    <path d="M659.748571 245.272381l-51.687619-51.687619-318.439619 318.585905 318.415238 318.268952 51.712-51.736381-266.703238-266.556952z" p-id="2601"></path>
                    </svg>
                </button>}
                {realPage >= 2 && <button className={pagingButtonStyle} onClick={() => {if (setPage) setPage(0)}}>1</button>}
                {realPage >= 3 && <div>…</div>}
                {realPage >= 1 && <button className={pagingButtonStyle} onClick={() => {if (setPage) setPage(realPage - 1)}}>{realPage}</button>}
                <div className="font-bold p-1">{realPage + 1}</div>
                {realPage < numPages - 1 && <button className={pagingButtonStyle} onClick={() => {if (setPage) setPage(realPage + 1)}}>{realPage + 2}</button>}
                {realPage < numPages - 3 && <div>…</div>}
                {realPage < numPages - 2 && <button className={pagingButtonStyle} onClick={() => {if (setPage) setPage(numPages - 1)}}>{numPages}</button>}
                {realPage < numPages - 1 && <button disabled={realPage >= numPages - 1} className="cursor-pointer disabled:cursor-default [&_svg]:disabled:fill-teal-500 dark:[&_svg]:disabled:fill-teal-700" onClick={() => {if (setPage) setPage(realPage + 1)}}>
                    <svg className="fill-teal-800 dark:fill-teal-500 h-7 w-4" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6595" width="200" height="200">
                        <path d="M605.086476 512.146286L338.358857 245.272381l51.760762-51.687619 318.415238 318.585905L390.095238 830.415238l-51.687619-51.736381z" p-id="6596"></path>
                    </svg>
                </button>}
            </div>}
        </div>}
    </div>
}