import { createUser } from "@/lib/supabase-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, displayName } = await req.json();

  if (!email || !password || !displayName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await createUser(email, password, displayName);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
