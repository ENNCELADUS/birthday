export const getAssetPath = (path: string) => {
    // In many deployment environments (like GitHub Pages), process.env.NODE_ENV 
    // might not be enough if the base path isn't correctly injected.
    // We check the actual window location as a source of truth for the subfolder.
    let prefix = '';

    if (typeof window !== 'undefined') {
        const isProdPath = window.location.pathname.includes('/birthday');
        prefix = isProdPath ? '/birthday' : '';
    } else {
        // Fallback for SSR
        prefix = process.env.NODE_ENV === 'production' ? '/birthday' : '';
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${prefix}${cleanPath}`;
};
