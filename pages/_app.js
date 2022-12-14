import Head from 'next/head';
import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    return (
        <>
            <Head>
                <title>Map of the Modern World Quiz</title>
            </Head>

            <SessionProvider>
                <Component {...pageProps} />
            </SessionProvider>
        </>
    );
}