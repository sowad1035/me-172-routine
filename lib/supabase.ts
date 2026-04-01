import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations that need to bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

const STORAGE_BUCKET = 'Routine';

/**
 * Upload file to Supabase storage (server-side, uses admin client to bypass RLS)
 */
export async function uploadToStorage(
    filePath: string,
    fileContent: string,
    contentType: string = 'text/plain'
): Promise<string> {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, new Blob([fileContent], { type: contentType }), {
                upsert: true,
                contentType,
            });

        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }

        // Return the public URL
        const { data: publicUrlData } = supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('Error uploading to Supabase storage:', error);
        throw error;
    }
}

/**
 * Download file from Supabase storage (server-side, uses admin client to bypass RLS)
 */
export async function downloadFromStorage(filePath: string): Promise<string> {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .download(filePath);

        if (error) {
            throw new Error(`Download failed: ${error.message}`);
        }

        return await data.text();
    } catch (error) {
        console.error('Error downloading from Supabase storage:', error);
        throw error;
    }
}

/**
 * Delete file from Supabase storage (server-side, uses admin client to bypass RLS)
 */
export async function deleteFromStorage(filePath: string): Promise<void> {
    try {
        const { error } = await supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);

        if (error) {
            throw new Error(`Delete failed: ${error.message}`);
        }
    } catch (error) {
        console.error('Error deleting from Supabase storage:', error);
        throw error;
    }
}

/**
 * Get public URL for a file in storage
 */
export function getPublicUrl(filePath: string): string {
    const { data } = supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

    return data.publicUrl;
}