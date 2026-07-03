export default function robots() {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: "https://opbr-site.vercel.app/sitemap.xml",
    };
}
