import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

// Load credentials from Vercel environment variables
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string);
const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID as string;

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.image) {
            return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
        }

        // Convert base64 to buffer
        const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Initialize Google Drive client
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.file']
        });
        const drive = google.drive({ version: 'v3', auth });

        // Create filename with date
        const date = new Date().toISOString().split('T')[0];
        const filename = `ATL_Recognition_${date}.jpg`;

        // Convert buffer to readable stream
        const stream = new Readable();
        stream._read = () => {};
        stream.push(imageBuffer);
        stream.push(null);

        // Upload to Google Drive
        const response = await drive.files.create({
            requestBody: {
                name: filename,
                mimeType: 'image/jpeg',
                parents: [folderId] // Uses folder ID from env variable
            },
            media: {
                mimeType: 'image/jpeg',
                body: stream
            }
        });

        return NextResponse.json({
            success: true,
            fileId: response.data.id
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload recognition form: ' + error.message },
            { status: 500 }
        );
    }
}
