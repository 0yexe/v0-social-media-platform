import { NextResponse } from 'next/server';

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ fileId: string }> } // 1. Yahan Promise add kiya
) {
  // 2. Params ko await karna zaruri hai
  const { fileId } = await params; 
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "Vercel mein Token missing hai" }, { status: 500 });
  }

  try {
    const getPath = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const pathData = await getPath.json();

    if (!pathData.ok) {
      return NextResponse.json({ error: "Telegram file nahi mili", details: pathData }, { status: 404 });
    }

    const filePath = pathData.result.file_path;
    const finalUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    return NextResponse.redirect(finalUrl);
  } catch (error) {
    return NextResponse.json({ error: "Server Error ho gaya" }, { status: 500 });
  }
}
