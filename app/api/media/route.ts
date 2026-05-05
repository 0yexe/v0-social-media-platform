import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Ye line URL se apne aap 'fileId' nikaal legi
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('fileId');
  
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!fileId) {
    return NextResponse.json({ error: "File ID missing" }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: "Vercel Token missing" }, { status: 500 });
  }

  try {
    const getPath = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const pathData = await getPath.json();

    if (!pathData.ok) {
      return NextResponse.json({ error: "Telegram error", details: pathData }, { status: 404 });
    }

    const filePath = pathData.result.file_path;
    const finalUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    return NextResponse.redirect(finalUrl);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
