/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyAdminToken } from "../../../../../../../utils/verify";
import { fetchTableById } from "../../../../../../../repository/tables/table";
import { updateTableStatus } from "../../../../../../../repository/tables/tablecrud";

export const dynamic = "force-dynamic"; // ensures no static inference confusion

export async function GET(
  request: NextRequest,
  context: any // 👈 prevents incorrect Promise<{ params }> inference
) {
  const { tableid } = context.params;

  try {
    const adminToken = await headers()
    const authHeader = adminToken.get("Authorization");
    const verificationResult = verifyAdminToken(authHeader ?? "");
    if (!verificationResult.success) {
      return NextResponse.json({
        message: verificationResult.message,
        success: false,
      });
    }

    const tableResult = await fetchTableById(tableid);
    if (!tableResult.success) {
      return NextResponse.json({
        message: tableResult.message,
        success: false,
      });
    }

    return NextResponse.json({
      message: "Table status fetched successfully",
      table: tableResult.table,
      success: true,
    });
  } catch (err) {
    return NextResponse.json({
      message: "Internal Server Error",
      error: String(err),
      success: false,
    });
  }
}

export async function PUT(
  request: NextRequest,
  context: any
) {
  const { tableid } = context.params;

  try {
    const data = await request.json();
    const adminToken = await headers()
    const authHeader = adminToken.get("Authorization");
    const verificationResult = verifyAdminToken(authHeader ?? "");
    if (!verificationResult.success) {
      return NextResponse.json({
        message: verificationResult.message,
        success: false,
      });
    }

    const response = await updateTableStatus(tableid, data.status);
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({
      message: "Internal Server Error",
      error: String(err),
      success: false,
    });
  }
}
