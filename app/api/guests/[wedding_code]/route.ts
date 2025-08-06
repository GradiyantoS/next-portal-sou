import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/dbClient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ wedding_code: string }> }
) {
  const wedding_code = (await params).wedding_code;
  const searchParams = req.nextUrl.searchParams;

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Filters
  const name = searchParams.get("name");
  const is_matrimony = searchParams.get("is_matrimony_attendee");
  const is_celebration = searchParams.get("is_celebration_attendee");
  const is_attending = searchParams.get("is_attending");

  let query = supabase
    .from("guests")
    .select("*", { count: "exact" })
    .eq("wedding_code", wedding_code);

  if (name) query = query.ilike("name", `%${name}%`);
  if (is_matrimony !== null)
    query = query.eq("is_matrimony_attendee", is_matrimony === "true");
  if (is_celebration !== null)
    query = query.eq("is_celebration_attendee", is_celebration === "true");
  if (is_attending !== null)
    query = query.eq("is_attending", is_attending === "true");

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch guests" },
      { status: 500 }
    );
  }

  const totalPage = Math.ceil((count ?? 0) / limit);

  const { data: attendance_summary } = await supabase.rpc("get_guest_summary", {
    wedding_code_input: wedding_code,
  });

  return NextResponse.json({
    data,
    attendance_summary,
    pagination: {
      page,
      limit,
      total_page: totalPage,
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ wedding_code: string }> }
) {
  const wedding_code = (await params).wedding_code;
  const body = await req.json();
  const {
    name,
    is_matrimony_attendee,
    is_celebration_attendee,
    is_fixed_pax,
    pax_limit,
  } = body;

  if (
    !name ||
    is_matrimony_attendee == null ||
    is_celebration_attendee == null ||
    is_fixed_pax == null ||
    pax_limit == null
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { error, data } = await supabase
    .from("guests")
    .insert([
      {
        wedding_code,
        name,
        is_matrimony_attendee,
        is_celebration_attendee,
        is_fixed_pax,
        pax_limit: pax_limit ?? 4,
      },
    ])
    .select();

  if (error) {
    return NextResponse.json(
      { error: "Failed to insert guest" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Guest added", data });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ wedding_code: string }> }
) {
  const wedding_code = (await params).wedding_code;

  if (!wedding_code) {
    return NextResponse.json(
      { error: "wedding_code is required" },
      { status: 400 }
    );
  }

  const body = await req.json();

  const {
    guest_id,
    name,
    is_matrimony_attendee,
    is_celebration_attendee,
    is_fixed_pax,
    pax_limit,
    is_attending,
    pax_actual,
  } = body;

  if (!guest_id) {
    return NextResponse.json(
      { error: "guest_id is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("guests")
    .update({
      name,
      is_matrimony_attendee,
      is_celebration_attendee,
      is_fixed_pax,
      pax_limit,
      is_attending,
      pax_actual,
      updated_at: new Date().toISOString(),
    })
    .eq("guest_id", guest_id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update guest" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Guest updated successfully" });
}
