import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png"
                />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;800&display=swap"
                    rel="stylesheet"
                />
                <meta
                    name="description"
                    content="Anon provides a simple interface for creating groups and having discussions"
                />
                <meta
                    property="og:url"
                    content="https://anon-posts.vercel.app/"
                />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="ANON" />
                <meta
                    property="og:description"
                    content="Anon provides a simple interface for creating groups and having discussions"
                />
                <meta
                    property="og:image"
                    content="https://i.imgur.com/mjtuRqf.png"
                />

                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    property="twitter:domain"
                    content="anon-posts.vercel.app"
                />
                <meta
                    property="twitter:url"
                    content="https://anon-posts.vercel.app/"
                />
                <meta name="twitter:title" content="ANON" />
                <meta
                    name="twitter:description"
                    content="Anon provides a simple interface for creating groups and having discussions"
                />
                <meta
                    name="twitter:image"
                    content="https://i.imgur.com/mjtuRqf.png"
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
