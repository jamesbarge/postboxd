/**
 * Admin Scrape API
 * Triggers a scraper for a specific cinema via Inngest
 * POST /api/admin/scrape
 */

import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";

// Map cinema IDs (from database) to CLI scraper IDs
const CINEMA_TO_SCRAPER: Record<string, string> = {
  // Independent cinemas
  "rio-dalston": "rio",
  "prince-charles": "pcc",
  "ica": "ica",
  "barbican": "barbican",
  "genesis": "genesis",
  "peckhamplex": "peckhamplex",
  "nickel": "nickel",
  "electric-portobello": "electric",
  "lexi": "lexi",
  "garden": "garden",
  "castle": "castle",
  "phoenix": "phoenix",
  "rich-mix": "rich-mix",
  "bfi-southbank": "bfi",
  "close-up": "close-up",
  "cine-lumiere": "cine-lumiere",
  "arthouse-crouch-end": "arthouse",
  "regent-street": "regent-street",
  "riverside-studios": "riverside",
  "olympic": "olympic",
  "david-lean": "david-lean",
  // Chain cinemas use full chain scraper
  // Curzon venues
  "curzon-soho": "curzon",
  "curzon-mayfair": "curzon",
  "curzon-bloomsbury": "curzon",
  "curzon-victoria": "curzon",
  "curzon-hoxton": "curzon",
  "curzon-kingston": "curzon",
  "curzon-aldgate": "curzon",
  // Picturehouse venues
  "picturehouse-central": "picturehouse",
  "hackney-picturehouse": "picturehouse",
  "crouch-end-picturehouse": "picturehouse",
  "east-dulwich-picturehouse": "picturehouse",
  "greenwich-picturehouse": "picturehouse",
  "finsbury-park-picturehouse": "picturehouse",
  "gate-picturehouse": "picturehouse",
  "picturehouse-ritzy": "picturehouse",
  "clapham-picturehouse": "picturehouse",
  // Everyman venues
  "everyman-belsize-park": "everyman",
  "everyman-baker-street": "everyman",
  "everyman-canary-wharf": "everyman",
  "everyman-hampstead": "everyman",
  "everyman-kings-cross": "everyman",
  "everyman-maida-vale": "everyman",
  "everyman-muswell-hill": "everyman",
  "everyman-screen-on-the-green": "everyman",
  "everyman-stratford": "everyman",
};

export async function POST(request: Request) {
  // Verify admin auth
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cinemaId } = await request.json();

    if (!cinemaId || typeof cinemaId !== "string") {
      return Response.json({ error: "Missing cinemaId" }, { status: 400 });
    }

    const scraperId = CINEMA_TO_SCRAPER[cinemaId];
    if (!scraperId) {
      return Response.json(
        { error: `No scraper configured for cinema: ${cinemaId}` },
        { status: 400 }
      );
    }

    // Send event to Inngest to trigger the scraper
    const { ids } = await inngest.send({
      name: "scraper/run",
      data: {
        cinemaId,
        scraperId,
        triggeredBy: userId,
      },
    });

    return Response.json({
      success: true,
      message: `Scraper queued for ${cinemaId}`,
      scraperId,
      eventId: ids[0],
    });
  } catch (error) {
    console.error("Error triggering scraper:", error);
    return Response.json(
      { error: "Failed to trigger scraper" },
      { status: 500 }
    );
  }
}
