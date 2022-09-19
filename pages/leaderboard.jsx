import pg from "../lib/db";

export default function Leaderboard({ leaderboard }) {
    return (
        <div></div>
    );
}

export async function getStaticProps() {
    let leaderboard = (await pg.query("SELECT * FROM leaderboard")).rows;

    return { props: { leaderboard }, revalidate: 10 }
}