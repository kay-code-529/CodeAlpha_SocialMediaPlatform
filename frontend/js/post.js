async function initCreate() {
  const form = document.getElementById('post-form')
  if (!form) return

  const me = await requireAuth()
  if (!me) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const content = form.content.value.trim()
    const image_url = form.image_url.value.trim()
    if (!content) return showError('Write something first.')

    try {
      await api('/posts', {
        method: 'POST',
        body: JSON.stringify({
          user_id: me.id,
          username: me.user_metadata?.username || me.email.split('@')[0],
          content,
          image_url: image_url || null,
        }),
      })
      window.location.href = 'index.html'
    } catch (err) {
      showError(err.message)
    }
  })
}

document.addEventListener('DOMContentLoaded', initCreate)
