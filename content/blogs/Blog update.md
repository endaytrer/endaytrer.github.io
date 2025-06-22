---
title = "Blog Update"
created = 2023-09-21
---

I am updating **code highlighting** and $\LaTeX$ for the blog!

Now it is fully ready for my coding update. Here are some demonstrations:

### Code Highlighting

Code highlighting is supported by Pygments. With python package `markdown` enable the plugin `codehilite`, classes are generated for the tokens in code fences.

It supports various types of languages:

```c
void create_vnf() {
    int fid = 1;
    for (; fid < MAX_FIBERS; fid++) {
        if (!vnfs[fid].occupied) break;
    }
    if (fid == MAX_FIBERS) {
        fprintf(stderr, "Warning: exceed max fibers per process. Not creating fiber.\n");
        return;
    }
    vnfs[fid].occupied = true;
    strcpy(vnfs[fid].name, process_data->meta.create_vnf_meta.name);
    vnfs[fid].fid = fid;
    char *libname = malloc(strlen(process_data->meta.create_vnf_meta.lib_name) + 1);
    strcpy(libname, process_data->meta.create_vnf_meta.lib_name);
    LinkMap *lib = OpenLibrary(libname, LAZY_BIND);

    if (lib == NULL) {
        fprintf(stderr, "Error: lib \"%s\" cannot be loaded.\n", libname);
        free(libname);
        return;
    }
    vnfs[fid].lib = lib;

    // Base on fact that `args` and `ifaces` are allocated contiguously, allocate the space once.
    int argc = 0;
    for (; process_data->meta.create_vnf_meta.args[argc] != NULL; argc++) {}
    char **argv = NULL;
    if (argc != 0) {
        int argsize = process_data->meta.create_vnf_meta.args[argc - 1] - process_data->meta.create_vnf_meta.args[0] + strlen(process_data->meta.create_vnf_meta.args[argc - 1]) + 1;
        char *arg_space = malloc(argsize);
        memcpy(arg_space, process_data->meta.create_vnf_meta.args[0], argsize);
        argv = malloc((argc) * sizeof(char *));
        for (int i = 0; i < argsize; i++) {
            argv[i] = process_data->meta.create_vnf_meta.args[i] - process_data->meta.create_vnf_meta.args[0] + arg_space;
        }
    }
    vnfs[fid].argc = argc;
    vnfs[fid].argv = argv;

    int num_ifaces = 0;
    for (; process_data->meta.create_vnf_meta.ifaces[num_ifaces] != NULL; num_ifaces++) {
        strcpy(vnfs[fid].ifaces[num_ifaces].name, process_data->meta.create_vnf_meta.ifaces[num_ifaces]);
        vnfs[fid].ifaces[num_ifaces].owner = vnfs + fid;
        vnfs[fid].ifaces[num_ifaces].peer = NULL;
    }
    vnfs[fid].num_ifaces = num_ifaces;
    fibers[fid] = (Fiber) {
        .status=EMBRYO,
        .vnf=vnfs + fid
    };
    void *stack_space = malloc(STACK_SIZE);
    fibers[fid].usr_stack = stack_space;
    fibers[fid].saved_reg.sp = (uint64_t)stack_space + STACK_SIZE;
    fibers[fid].saved_reg.fp = (uint64_t)stack_space + STACK_SIZE;

    // save the ultimate return address (after main() exits) to trampoline is now done by INIT(). For risc machines, save return address to lr.
    fibers[fid].saved_reg.lr = (uint64_t)interrupt;
    fibers[fid].saved_reg.pc = (uint64_t)FindSymbol(lib, "main");
    push_fid_stack(fid);
}
```

And of course python.:

```python
@app.route("/api/blogs/content/<name>")
def blog(name):
    post = get_post(name)
    if post == None:
        return "Not found"
    views = 0
    likes = 0
    if name in statistics:
        views, likes = statistics[name]
    return json.dumps({"title": post[0], "content": post[1], "lastModified": post[2], "views": views, "likes": likes})
```

You can now copy the code with the button on up-right corner!

### $\LaTeX$ support

To keep the blogs server-side rendered(SSR) and fits web clients, I use python packet `markdown-katex` and `katex` node js backend for rendering both inline math and TeX fields. The defined syntax, though, is not the one that I'm used to, thus I use **multiple passes** for rendering the TeX content.

```python
with open("blogs/" + post, 'r') as f:
    content = f.read()
    title = content.split('\n')[0].strip('#').strip()
    # pass 1, render basic html
    content = markdown.markdown(content, extensions=["markdown.extensions.extra", "markdown.extensions.codehilite"])
    blocks = content.split("**")
    # pass 1, render block TeX
    content = ""
    isTeXBlock = False
    for block in blocks:
        if not isTeXBlock:
            content += block
            isTeXBlock = True
            continue
        try:
            html = tex2html(block, {'no_inline_svg': True, 'insert_fonts_css': False, 'display-mode': True})
            content += html
        finally:
            isTeXBlock = False
    # pass 3, render inline TeX
    blocks = content.split("*")
    # pass 1, render block TeX
    content = ""
    isTeXInline = False
    for block in blocks:
        if not isTeXInline:
            content += block
            isTeXInline = True
            continue
        try:
            html: str = tex2html(block, {'no_inline_svg': True, 'insert_fonts_css': False})
            content += html
        finally:
            isTeXInline = Fal

    self.cache[post] = (
        title,
        content,
        mtime
    )
```

The basic markdown is first rendered to HTML, then every other string splitted by double dollar sign is considered to be TeX block, and passed to `tex2html` renderer. Similarly, every other string splitted by a single dollar sign is considered to be inline math.

However, there is an obvious drawback. the dollar signs in escaped content (inline code, code blocks, after slash, etc) cannot be parsed correctly. A Lexer might be more helpful. (I don't want to implement such huge thing right now :))

Here are some showcases:

**Fourier Transform**
$$
\hat{f} (\xi)=\int_{-\infty}^{\infty}f(x)e^{-2\pi ix\xi}\mathrm dx
$$
**Master Theorm**
$$
T(n) = aT(\frac nb)+f(n)\\
T(n) = \begin{cases}
\Theta(n^{\log_ba}) & f(n) = \Theta(n^c), c < \log_ba\\
\Theta(n^{\log_ba}\log^{k+1}n) & f(n) = \Theta(n^c\log^kn), c = \log_ba\\
\Theta(n^c) & f(n)=\Theta(n^c), c > \log_ba, f(n)\textit{ meets regularity condition, i.e. }\exists N\exists d < 1\forall n>N(af(\frac nb) \leq df(n) )\\
\end{cases}
$$


F\*ck. this breaks.

Now, I finally have an (almost) complete blog platform!

The blog platform is open sorce at [GitHub](https://github.com/endaytrer/main-page). It is a lightweight, highly customable blog / personal website platform made with Flask. It is protected by APACHE license. There are no READMEs yet, but soon there will be. Issues and PRs are greatly welcomed!