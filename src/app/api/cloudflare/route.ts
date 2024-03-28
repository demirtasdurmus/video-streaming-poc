import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = process.env;
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`;

    const headers: HeadersInit = {
      Authorization: `bearer ${CLOUDFLARE_API_TOKEN}`,
      "Tus-Resumable": "1.0.0",
      "Upload-Length": request.headers.get("Upload-Length") || "",
      "Upload-Metadata": request.headers.get("Upload-Metadata") || "",
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
    });

    if (!res.status.toString().startsWith("2")) {
      const data = await res.json();

      const error = data?.errors?.map((i: any) => i.message).join(",");
      const message =
        data?.messages?.map((i: any) => i.message).join(",") || res.statusText;

      return new NextResponse(
        JSON.stringify({ message: `${error} /n ${message}` }),
        {
          status: res.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const destination = res.headers.get("Location");

    if (!destination) {
      throw new Error("No destination header found");
    }

    return new NextResponse(JSON.stringify({ message: "success" }), {
      status: res.status,
      headers: {
        "Access-Control-Expose-Headers": "Location",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        Location: destination,
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
