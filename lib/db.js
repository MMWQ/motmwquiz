import { Client } from 'pg';

const pg = new Client();
pg.connect();

export default pg;