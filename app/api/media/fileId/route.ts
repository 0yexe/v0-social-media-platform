import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  const { fileId } = params; // 1. Ye database se milne wala File ID pakadta hai
  const token = process.env.TELEGRAM_BOT_TOKEN; // 2. Aapka secret Token use karta hai

  try {
    // 3. Ye Telegram se puchta hai: "Bhai, is ID ki asli file kahan chhupi hai?"
    const getPath = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const pathData = await getPath.json();

    if (!pathData.ok) throw new Error("File ID not found");

    // 4. Telegram se asli "Path" milte hi hum asli link bana lete hain
    const filePath = pathData.result.file_path;
    const finalUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    // 5. Ab hum website ko bolte hain: "Ye raha video ka asli link, ise play karo!"
    return NextResponse.redirect(finalUrl);
  } catch (error) {
    return NextResponse.json({ error: "Media load nahi ho saka" }, { status: 500 });
  }
}
