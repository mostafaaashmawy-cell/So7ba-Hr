import { NextRequest, NextResponse } from 'next/server';

function extractCoordinates(str: string): { lat: number; lng: number } | null {
  if (!str) return null;

  // 1. Check !3d...4d... (Google Maps embedded coordinate format)
  const embedMatch = str.match(/!3d([-+]?\d{1,3}\.\d+)!4d([-+]?\d{1,3}\.\d+)/);
  if (embedMatch) {
    const lat = parseFloat(embedMatch[1]);
    const lng = parseFloat(embedMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 2. Check @lat,lng
  const atMatch = str.match(/@([-+]?\d{1,3}\.\d+),([-+]?\d{1,3}\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 3. Check ?q=lat,lng or ?ll=lat,lng or ?center=lat,lng or destination=lat,lng
  const queryMatch = str.match(
    /[?&](?:q|ll|destination|query|center)=([-+]?\d{1,3}\.\d+)[,%2C\s]+([-+]?\d{1,3}\.\d+)/i
  );
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 4. Check /place/lat,lng or /search/lat,lng
  const placeMatch = str.match(
    /\/(?:place|search)\/([-+]?\d{1,3}\.\d+)[,%2C\s]+([-+]?\d{1,3}\.\d+)/i
  );
  if (placeMatch) {
    const lat = parseFloat(placeMatch[1]);
    const lng = parseFloat(placeMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 5. Direct coordinate pair: "30.0444, 31.2357"
  const directMatch = str.match(/^[-+]?\d{1,3}\.\d+[,%2C\s]+[-+]?\d{1,3}\.\d+$/);
  if (directMatch) {
    const parts = str.split(/[,%2C\s]+/).filter(Boolean);
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetUrl = (body?.url || '').trim();

    if (!targetUrl) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    // Direct check first (if URL or string already has coords in it)
    const directCoords = extractCoordinates(targetUrl);
    if (directCoords) {
      return NextResponse.json({
        success: true,
        lat: directCoords.lat,
        lng: directCoords.lng,
        resolvedUrl: targetUrl,
      });
    }

    // Follow HTTP redirects server-side
    const response = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const finalUrl = response.url || targetUrl;

    // Check redirected URL
    const redirectedCoords = extractCoordinates(finalUrl);
    if (redirectedCoords) {
      return NextResponse.json({
        success: true,
        lat: redirectedCoords.lat,
        lng: redirectedCoords.lng,
        resolvedUrl: finalUrl,
      });
    }

    // Inspect HTML content for meta refresh or og:url
    const htmlText = await response.text();

    // Check og:url meta
    const ogMatch = htmlText.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1]) {
      const ogCoords = extractCoordinates(ogMatch[1]);
      if (ogCoords) {
        return NextResponse.json({
          success: true,
          lat: ogCoords.lat,
          lng: ogCoords.lng,
          resolvedUrl: ogMatch[1],
        });
      }
    }

    // Check meta refresh
    const refreshMatch = htmlText.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)["']/i);
    if (refreshMatch && refreshMatch[1]) {
      const refreshCoords = extractCoordinates(refreshMatch[1]);
      if (refreshCoords) {
        return NextResponse.json({
          success: true,
          lat: refreshCoords.lat,
          lng: refreshCoords.lng,
          resolvedUrl: refreshMatch[1],
        });
      }
    }

    // Search whole HTML for embedded !3d / @lat,lng coordinates
    const htmlCoords = extractCoordinates(htmlText);
    if (htmlCoords) {
      return NextResponse.json({
        success: true,
        lat: htmlCoords.lat,
        lng: htmlCoords.lng,
        resolvedUrl: finalUrl,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Could not detect latitude and longitude from the provided URL' },
      { status: 422 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to resolve location URL';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
