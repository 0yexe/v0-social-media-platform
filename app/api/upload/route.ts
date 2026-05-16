import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // 1. User Authentication Check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'post' // reel, story, post
    const caption = formData.get('caption') as string || '' // Frontend se aane waala caption

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 2. Environment Variables Check (Netlify settings se lega)
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!token || !chatId) {
      return NextResponse.json({ error: 'Telegram keys missing in Netlify settings' }, { status: 500 })
    }

    // 3. Telegram Form Data Setup
    const telegramForm = new FormData()
    telegramForm.append('chat_id', chatId)
    
    const isVideo = file.type.startsWith('video/')
    const endpoint = isVideo ? 'sendVideo' : 'sendPhoto'
    const fileKey = isVideo ? 'video' : 'photo'
    
    telegramForm.append(fileKey, file)
    telegramForm.append('caption', `Uploaded by: ${user.email} | Type: ${type}`)

    // 4. Telegram Server par File Upload karna
    const teleRes = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
      method: 'POST',
      body: telegramForm,
    })

    const teleData = await teleRes.json()

    if (!teleData.ok) {
      console.error('Telegram Error:', teleData)
      return NextResponse.json({ error: 'Telegram upload failed: ' + teleData.description }, { status: 400 })
    }

    // 5. File ID nikalna
    const fileId = isVideo 
      ? teleData.result.video.file_id 
      : teleData.result.photo[teleData.result.photo.length - 1].file_id

    // 🔥 EXTRA STEP: Telegram se Direct Playable URL nikalna
    const fileRouteRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`)
    const fileRouteData = await fileRouteRes.json()
    
    if (!fileRouteData.ok) {
      return NextResponse.json({ error: 'Failed to generate Telegram download URL' }, { status: 500 })
    }

    const filePath = fileRouteData.result.file_path
    // Yeh bana aapka asli playable media link
    const directMediaUrl = `https://api.telegram.org/file/bot${token}/${filePath}`

    // 🔥 SUPABASE CONNECTION: Database mein Entry Save karna
    // Type ke hisab se sahi table chunna
    const targetTable = type === 'reel' ? 'reels' : type === 'story' ? 'stories' : 'posts'

    const { error: dbError } = await supabase
      .from(targetTable)
      .insert({
        user_id: user.id,
        media_url: directMediaUrl, // Telegram link database mein gaya
        caption: caption,
        created_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Database Error:', dbError)
      return NextResponse.json({ error: 'Database saving failed: ' + dbError.message }, { status: 500 })
    }

    // 6. Response back to frontend
    return NextResponse.json({ 
      success: true,
      url: directMediaUrl,
      isVideo: isVideo,
      contentType: file.type,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
