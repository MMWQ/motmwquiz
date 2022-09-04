import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';

export const nextAuthOpts = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {
        async signIn({ profile }) {
            return profile.email_verified && profile.email.endsWith(process.env.TRUSTED_DOMAIN);
        }
    }
}

export default NextAuth(nextAuthOpts);