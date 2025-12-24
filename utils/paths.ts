export const getAssetPath = (path: string) => {
    // In production (GitHub Pages), we need the /birthday prefix
    // In development, Next.js typically handles the public folder at root
    const basePath = process.env.NODE_ENV === 'production' ? '/birthday' : '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${basePath}${cleanPath}`;
};
