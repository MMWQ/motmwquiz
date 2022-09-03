import { loadTable } from "../../lib/db";

const tables = ["un_member_state", "observer_state", "us_territory"];

export default async function handler(req, res) {
    if (req.method === "GET") {
        let res = []

        for (let t of tables) res.push(await loadTable(t));

        res.status(200).json(res);
    }
}