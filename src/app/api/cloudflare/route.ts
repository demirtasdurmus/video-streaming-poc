import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = process.env;
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `bearer ${CLOUDFLARE_API_TOKEN}`,
        "Tus-Resumable": "1.0.0",
        "Upload-Length": request.headers.get("Upload-Length") || "",
        "Upload-Metadata": request.headers.get("Upload-Metadata") || "",
      },
    });

    if (!response.status.toString().startsWith("2")) {
      return new NextResponse(
        JSON.stringify({ message: response.statusText }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const destination = response.headers.get("Location");

    return new NextResponse(JSON.stringify({ message: "success" }), {
      status: 200,
      headers: {
        "Access-Control-Expose-Headers": "Location",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        Location: destination || "",
      },
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
