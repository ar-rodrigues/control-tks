import { NextResponse } from "next/server";

export async function GET(request) {
  // Check if request is internal (from our app) or external
  const isInternalRequest =
    request.headers.get("x-internal-request") === "true";
  const apiKey = request.headers.get("x-api-key");

  // Only require API key for external requests
  if (
    !isInternalRequest &&
    (!apiKey || apiKey !== process.env.LOCATION_API_KEY)
  ) {
    return NextResponse.json(
      { error: "No autorizado. Falta o es incorrecta la API key." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Falta el parámetro 'address' (dirección)" },
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
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address
        )}&country=Mexico&format=json&limit=1`,
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
        if (data.length > 0) {
          return NextResponse.json({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          });
        }
      }
    } catch (nominatimError) {
      console.error("Nominatim error:", nominatimError);
      // Continue to TomTom fallback
    }

    // Try TomTom as fallback
    const tomtomController = new AbortController();
    const tomtomTimeoutId = setTimeout(() => tomtomController.abort(), 5000);

    try {
      const tomtomResponse = await fetch(
        `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(
          address
        )}.json?countrySet=MX&limit=1&view=Unified&key=${
          process.env.TOMTOM_API_KEY
        }`,
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
        if (data.results && data.results.length > 0) {
          const position = data.results[0].position;
          return NextResponse.json({ lat: position.lat, lon: position.lon });
        }
      }
    } catch (tomtomError) {
      console.error("TomTom error:", tomtomError);
    }

    // If both fail, return not found
    return NextResponse.json(
      { error: `No se encontraron coordenadas para la dirección: ${address}` },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error en el servicio de geocodificación:", error);
    return NextResponse.json(
      { error: "Error al buscar coordenadas" },
      { status: 500 }
    );
  }
}
