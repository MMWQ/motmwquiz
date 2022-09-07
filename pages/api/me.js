import { nanoid } from "nanoid";
import { unstable_getServerSession } from "next-auth/next";
import pg from "../../lib/db";
import { nextAuthOpts } from "./auth/[...nextauth]";

export default async function handler(req, res) {
    let session = await unstable_getServerSession(req, res, nextAuthOpts);

    if (!session) return res.status(401).end();

    let resp = await pg.query("SELECT * FROM user WHERE email=$1", [session.user.email]);

    if (resp.rowCount === 0) {
        let name = nanoid();
        await pg.query("INSERT INTO user (email, name, ums_front, ums_back, os_front, os_back, ut_front, ut_back, ums, os, ut) VALUES($1, $2, 'map', 'state', 'state', 'capital', 'territory', 'region', $3, $4, $5)", [session.user.email, name, (new Array(193).fill("1")).join(""), (new Array(2).fill("1")).join(""), (new Array(5).fill("1")).join("")]);
        res.status(200).json({ email: session.user.email, name, ums_front: 'state', ums_back: 'capital', os_front: 'state', os_back: 'capital', ut_front: 'region', ut_back: 'territory', ums: (new Array(193).fill("1")).join(""), os: (new Array(2).fill("1")).join(""), ut: (new Array(5).fill("1")).join("") });
    }
    else res.status(200).json(resp.rows[0]);
}