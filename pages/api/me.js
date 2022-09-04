import { unstable_getServerSession } from "next-auth/next";
import pg from "../../lib/db";
import { nextAuthOpts } from "./auth/[...nextauth]";

export default async function handler(req, res) {
    let session = await unstable_getServerSession(req, res, nextAuthOpts);

    if (!session) return res.status(401).end();
}