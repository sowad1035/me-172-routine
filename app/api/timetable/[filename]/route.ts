import { NextRequest, NextResponse } from "next/server";
import { downloadFromStorage } from "@/lib/supabase";

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

        // Download SVG from Supabase storage
        const svgContent = await downloadFromStorage(filename);

        // Return SVG with proper content type
        console.log({ filename, contentLength: svgContent.length })
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
