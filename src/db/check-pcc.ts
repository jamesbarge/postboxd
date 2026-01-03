import { db } from "./index";
import { sql } from "drizzle-orm";

async function check() {
  // Count PCC screenings by date
  const byDate = await db.execute(sql`
    SELECT
      DATE(datetime) as date,
      COUNT(*) as count
    FROM screenings
    WHERE cinema_id = 'prince-charles'
    AND datetime >= NOW()
    GROUP BY DATE(datetime)
    ORDER BY date
    LIMIT 14
  `);

  console.log('\n📊 PCC Screenings by Date:');
  const rows = byDate as unknown as Array<{date: string; count: string}>;
  for (const row of rows) {
    console.log(`  ${row.date}: ${row.count} screenings`);
  }

  // Check Sunday specifically
  const sunday = await db.execute(sql`
    SELECT f.title, s.datetime, s.format, s.event_type
    FROM screenings s
    JOIN films f ON s.film_id = f.id
    WHERE s.cinema_id = 'prince-charles-cinema'
    AND DATE(s.datetime) = '2026-01-04'
    ORDER BY s.datetime
  `);

  console.log('\n📅 Sunday Jan 4 PCC Screenings:');
  const sundayRows = sunday as unknown as Array<{title: string; datetime: string; format: string; event_type: string}>;
  for (const row of sundayRows) {
    console.log(`  ${row.datetime} - ${row.title}`);
  }

  // Total count
  const total = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM screenings
    WHERE cinema_id = 'prince-charles'
    AND datetime >= NOW()
  `);
  console.log('\nTotal upcoming PCC screenings:', (total as unknown as Array<{count: string}>)[0]?.count);
}

check().then(() => process.exit(0)).catch(console.error);
