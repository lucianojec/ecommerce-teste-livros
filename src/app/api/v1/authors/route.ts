import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { databaseError } from "@/lib/database-errors";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("authors").select("id,name,slug").order("name");
  if (error) return databaseError(error);
  return NextResponse.json({ data });
}
