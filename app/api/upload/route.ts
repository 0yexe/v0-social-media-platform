import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication (Pehle ki tarah)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') || 'post' // reel, story, post

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 2. Telegram Settings (Vercel ENV se lega)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json({ error: 'Telegram keys missing in Vercel settings' }, { status: 500 })
    }

    // 3. Telegram ko file bhejne ki taiyari
    const telegramForm = new FormData();
    telegramForm.append('chat_id', chatId);
    
    const isVideo = file.type.startsWith('video/');
    const endpoint = isVideo ? 'sendVideo' : 'sendPhoto';
    const fileKey = isVideo ? 'video' : 'photo';
    
    telegramForm.append(fileKey, file);
    telegramForm.append('caption', `Upload by: ${user.email} (${type})`);

    // 4. Telegram API ko call karna
    const teleRes = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
      method: 'POST',
      body: telegramForm,
    });

    const teleData = await teleRes.json();

    if (!teleData.ok) {
      console.error('Telegram Error:', teleData);
      return NextResponse.json({ error: 'Telegram upload failed: ' + teleData.description }, { status: 400 })
    }

    // 5. File ID nikalna
    const fileId = isVideo 
      ? teleData.result.video.file_id 
      : teleData.result.photo[teleData.result.photo.length - 1].file_id;

    // 6. Response wapas bhejna (Url ki jagah ab hum fileId bhej rahe hain)
    return NextResponse.json({ 
      success: true,
      fileId: fileId,
      isVideo: isVideo,
      contentType: file.type,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
