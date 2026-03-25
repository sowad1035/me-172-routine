import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;

        // Validate filename to prevent path traversal
        if (!filename.match(/^(routine_|teacher_)[a-zA-Z0-9_]+\.svg$/)) {
            return NextResponse.json(
                { error: "Invalid filename" },
                { status: 400 }
            );
        }

        const filePath = path.join(process.cwd(), "public", filename);

        // Verify file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404 }
            );
        }

        // Read file content
        const svgContent = fs.readFileSync(filePath, "utf-8");

        // Return SVG with proper content type
        console.log({ filePath, svgContent })
        return new NextResponse(svgContent, {
            headers: {
                "Content-Type": "image/svg+xml",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Error serving timetable:", error);
        return NextResponse.json(
            { error: "Failed to serve timetable" },
            { status: 500 }
        );
    }
}
