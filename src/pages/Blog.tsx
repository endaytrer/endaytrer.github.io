import { useEffect, useState } from 'react'
import "./blog.css"
export default function Blog({href}: {href: string}) {
    let [content, setContent] = useState("Error: cannot get content");
    useEffect(() => {
        const html_href = href.slice(0, href.length - 3) + ".html"
        fetch("/blogs" + html_href)
            .then((ans) => ans.text())
            .then((text) => setContent(text))
    }, [href]);
    return <main className="flex flex-col items-center">
        <article id="blog" className="w-full max-w-3xl p-4 overflow-hidden" dangerouslySetInnerHTML={{__html: content}}></article>
    </main>
}