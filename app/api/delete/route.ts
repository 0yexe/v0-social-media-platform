export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Post ID aur Image URL dono mangiye frontend se
    const { url, postId } = await request.json()

    // 1. Database (Supabase) se post delete karein
    if (postId) {
      const { error: dbError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id) // Security: Apni hi post delete ho

      if (dbError) throw dbError
    }

    // 2. Vercel Blob se image delete karein
    if (url) {
      await del(url)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
