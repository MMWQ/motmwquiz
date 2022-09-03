import { Client } from 'pg';

const client = new Client();
client.connect();

export async function loadTable(tblname) {
    let table = await client.query(`SELECT * FROM $1`, [tblname]);

    return table;
}
