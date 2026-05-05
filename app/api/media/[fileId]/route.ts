import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  const { fileId } = params;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  try {
    const getPath = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const pathData = await getPath.json();

    if (!pathData.ok) {
      return NextResponse.json({ error: "Telegram file not found" }, { status: 404 });
    }

    const filePath = pathData.result.file_path;
    const finalUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    return NextResponse.redirect(finalUrl);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
