import { useState } from 'react';
import { BlogInfo } from '../api/blog';

const blogs: BlogInfo[] = [
    {
        id: "hakodate.md",
        title: "はこだて　函館",
        reads: 141,
        likes: 4,
        created: new Date("2025-03-03 17:15:28"),
        lastModified: new Date("2025-03-03 17:15:28"),
        needPassword: false
    },
    {
        "id": "smt-string.md",
        "title": "Notes: SMT String Solving in CVC4(5)",
        "reads": 18,
        "likes": 1,
        "created": new Date("2025-02-21 08:21:19"),
        "lastModified": new Date("2024-08-14 13:25:50"),
        "needPassword": false
    }
]

function BlogEntry({blog}: {blog: BlogInfo}) {
    return <a className="flex items-center justify-between py-2 my-0.5 last:border-b-0 font-serif border-b-1 border-teal-300 dark:border-teal-900" href={"/" + blog.id}>
        <h4 className="text-lg">{blog.title}</h4>
        <p className="text-teal-500 font-normal">{blog.lastModified.toLocaleDateString()}</p>
    </a>
}
export default function BlogList({limit, paging=false}: {limit: number, paging: boolean}) {
    const [page, setPage] = useState(0);

    return <div>
        {blogs.slice(0, limit).map((b) => <BlogEntry blog={b} key={b.id}/>)}
        {paging && <div>
            Page {page}
            <button onClick={() => setPage(0)}>reset</button>
        </div>}
    </div>
}