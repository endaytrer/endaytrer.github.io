export interface BlogInfo {
    password: boolean,
    hint: string | null,
    title: string;
    language: string;
    license: string | null,
    tags: string[],
    created: Date;
    modified: Date;
    preview: string | null,
}

export interface BlogManifest {
    /// A map of blog id to blog metadata
    blogs: Record<string, BlogInfo>,

    /// A map of tags and blogs with the tags
    tags: Record<string, string[]>,
}