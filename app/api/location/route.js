import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing lat or lon parameters" },
      { status: 400 }
    );
  }

  try {
    // Try Nominatim first
    const nominatimController = new AbortController();
    const nominatimTimeoutId = setTimeout(
      () => nominatimController.abort(),
      5000
    );

    try {
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            "User-Agent": "TKSControl/1.0",
            "Accept-Language": "es",
          },
          signal: nominatimController.signal,
        }
      );

      clearTimeout(nominatimTimeoutId);

      if (nominatimResponse.ok) {
        const data = await nominatimResponse.json();
        return NextResponse.json({ address: data.display_name });
      }
    } catch (nominatimError) {
      console.error("Nominatim error:", nominatimError);
      // Continue to TomTom fallback
    }

    // If Nominatim fails, try TomTom
    const tomtomController = new AbortController();
    const tomtomTimeoutId = setTimeout(() => tomtomController.abort(), 5000);

    try {
      const tomtomResponse = await fetch(
        `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lon}.json?returnSpeedLimit=false&radius=100&allowFreeformNewLine=false&returnMatchType=false&view=Unified&key=${process.env.TOMTOM_API_KEY}`,
        {
          headers: {
            "Accept-Language": "es",
          },
          signal: tomtomController.signal,
        }
      );

      clearTimeout(tomtomTimeoutId);

      if (tomtomResponse.ok) {
        const data = await tomtomResponse.json();
        if (data.addresses && data.addresses.length > 0) {
          const address = data.addresses[0].address;
          const formattedAddress = [
            address.freeformAddress,
            address.municipality,
            address.countrySubdivision,
            address.country,
          ]
            .filter(Boolean)
            .join(", ");

          return NextResponse.json({ address: formattedAddress });
        }
      }
    } catch (tomtomError) {
      console.error("TomTom error:", tomtomError);
    }

    // If both services fail, return coordinates
    return NextResponse.json({
      address: `Ubicación (${lat.toFixed(6)}, ${lon.toFixed(6)})`,
    });
  } catch (error) {
    console.error("Error in location service:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}
