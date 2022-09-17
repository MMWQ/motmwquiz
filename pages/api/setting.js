import pg from "../../lib/db";
import { unstable_getServerSession } from "next-auth/next";

export default async function handler(req, res) {
    let session = await unstable_getServerSession(req, res, nextAuthOpts);

    if (!session) return res.status(401).end();

    let { face, value } = req.body;
    await pg.query(`UPDATE user SET $1 = $2 WHERE email = $3`, [face, value, session.user.email]);

    res.status(200).end();
}