import  BlogList from "../components/BlogList";
import {Filter} from "../components/BlogList";

export default function BlogListPage({searchParams}: {searchParams: URLSearchParams}) {
    
    let page = 0;
    let limit = 10;
    let sort: "created" | "title" = "created";
    let descent = true;
    try {
        const tmp_str = searchParams.get("page");
        if (tmp_str !== null) {
            const tmp = parseInt(tmp_str);
            page = tmp - 1;
        }
    } catch {}
    try {
        const tmp_str = searchParams.get("limit");
        if (tmp_str !== null) {
            const tmp = parseInt(tmp_str);
            if (tmp === 5 || tmp === 10 || tmp === 20)
                limit = tmp;
        }
    } catch {}
    try {
        const tmp_str = searchParams.get("sort");
        if (tmp_str !== null) {
            if (tmp_str === "created" || tmp_str === "title")
                sort = tmp_str;
        }
    } catch {}

    try {
        const tmp_str = searchParams.get("descent");
        if (tmp_str !== null) {
            if (tmp_str === "true") { descent = true; }
            else if (tmp_str === "false") { descent = false; }
        }
    } catch {}

    // construct filter from searchParams
    const filter: Filter = {
        password: undefined,
        language: [],
        license: [],
        tags: [],
    }
    try {
        const tmp_str = searchParams.get("password");
        if (tmp_str !== null) {
            if (tmp_str === "true") { filter.password = true; }
            else if (tmp_str === "false") { filter.password = false; }
        }
    } catch {}

    try {
        const tmp_str = searchParams.get("language");
        if (tmp_str !== null) {
            const tmp = tmp_str.split(" ")
            filter.language = tmp;
        }
    } catch {}

    try {
        const tmp_str = searchParams.get("license");
        if (tmp_str !== null) {
            const tmp = tmp_str.split(" ").map((val) => val === "null" ? null : val)
            filter.license = tmp;
        }
    } catch {}

    try {
        const tmp_str = searchParams.get("tags")
        if (tmp_str !== null) {
            const tmp = tmp_str.split(" ")
            filter.tags = tmp;
        }
    } catch {}
    
    return <main className="mx-auto w-full max-w-7xl min-h-svh my-4 px-6">
        <h1 className="text-2xl font-bold mt-10 mb-10 text-teal-900 dark:text-lime-50">All Blogs</h1>
        <BlogList
            paging
            page={page}
            setPage={(page) => {
                searchParams.set("page", (page + 1).toString());
                window.location.search = searchParams.toString();
            }}
            limit={limit}
            setLimit={(limit) => {
                searchParams.set("limit", limit.toString());
                window.location.search = searchParams.toString();
            }}
            filter={filter}
            setFilter={(filter) => {
                if (filter.password === undefined) {
                    searchParams.delete("password")
                } else {
                    searchParams.set("password", String(filter.password));
                }
                if (filter.language.length === 0) {
                    searchParams.delete("language")
                } else {
                    searchParams.set("language", filter.language.join(" "));
                }
                if (filter.license.length === 0) {
                    searchParams.delete("license");
                } else {
                    searchParams.set("license", filter.license.join(" "))
                }
                if (filter.tags.length === 0) {
                    searchParams.delete("tags");
                } else {
                    searchParams.set("tags", filter.tags.join(" "));
                }
                window.location.search = searchParams.toString();
            }}
            sort={sort}
            setSort={(sort) => {
                searchParams.set("sort", sort);
                window.location.search = searchParams.toString();
            }}
            descent={descent}
            setDescent={(descent) => {
                searchParams.set("descent", String(descent));
                window.location.search = searchParams.toString();
            }}
        />
    </main>
}