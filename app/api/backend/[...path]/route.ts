import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.PREFLOW_BACKEND_URL ?? "http://localhost:8080";

type Context = {
  params: { path: string[] };
};

async function proxy(request: NextRequest, context: Context) {
  const path = context.params.path.join("/");
  const url = new URL(request.url);
  const target = `${BACKEND_URL.replace(/\/$/, "")}/${path}${url.search}`;
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("connection");

  try {
    const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
    const response = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      credentials: "include"
    });

    const contentType = response.headers.get("content-type") ?? "application/json";
    const responseBody = await response.arrayBuffer();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "content-type": contentType
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach Preflow backend";
    return NextResponse.json(
      {
        error: {
          message,
          status: 502
        }
      },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
