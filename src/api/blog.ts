export interface BlogInfo {
    id: string;
    title: string;
    reads: number;
    likes: number;
    created: Date;
    lastModified: Date;
    needPassword: boolean;
}