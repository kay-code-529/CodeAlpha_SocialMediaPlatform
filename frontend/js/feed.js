let ME = null

async function loadFeed() {
  ME = await requireAuth()
  if (!ME) return

  const list = document.getElementById('feed')
  list.innerHTML = '<p class="muted">Loading...</p>'

  let posts
  try {
    posts = await api('/posts')
  } catch (e) {
    list.innerHTML = `<p class="error-text">${esc(e.message)}</p>`
    return
  }

  if (!posts.length) {
    list.innerHTML = '<p class="muted">No posts yet. Be the first to post!</p>'
    return
  }

  list.innerHTML = ''
  for (const post of posts) {
    list.appendChild(await renderPost(post))
  }
}

async function renderPost(post) {
  const [likes, comments] = await Promise.all([
    api('/likes/' + post.id).catch(() => ({ likes: 0, users: [] })),
    api('/comments/' + post.id).catch(() => []),
  ])
  const liked = (likes.users || []).some((u) => u.user_id === ME.id)

  const el = document.createElement('article')
  el.className = 'card post'
  el.innerHTML = `
    <header class="post-head">
      <a class="author" href="profile.html?id=${post.user_id}">@${esc(post.username)}</a>
      <span class="muted">· ${timeAgo(post.created_at)}</span>
      ${post.user_id === ME.id ? '<button class="link-btn danger del">Delete</button>' : ''}
    </header>
    <p class="post-body">${esc(post.content)}</p>
    ${post.image_url ? `<img class="post-img" src="${esc(post.image_url)}" alt="">` : ''}
    <div class="post-actions">
      <button class="like-btn ${liked ? 'active' : ''}">♥ <span class="like-count">${likes.likes || 0}</span></button>
      <button class="comment-toggle">💬 <span>${comments.length}</span></button>
    </div>
    <div class="comments" hidden>
      <div class="comment-list">${comments.map(commentHtml).join('')}</div>
      <form class="comment-form">
        <input name="content" placeholder="Write a comment..." autocomplete="off" required>
        <button type="submit">Send</button>
      </form>
    </div>`

  wirePost(el, post)
  return el
}

function commentHtml(c) {
  return `<div class="comment"><strong>@${esc(c.username)}</strong> ${esc(c.content)}</div>`
}

function wirePost(el, post) {
  el.querySelector('.del')?.addEventListener('click', async () => {
    if (!confirm('Delete this post?')) return
    await api('/posts/' + post.id, { method: 'DELETE' })
    el.remove()
  })

  const likeBtn = el.querySelector('.like-btn')
  const countEl = el.querySelector('.like-count')
  likeBtn.addEventListener('click', async () => {
    const liked = likeBtn.classList.contains('active')
    try {
      await api('/likes', {
        method: liked ? 'DELETE' : 'POST',
        body: JSON.stringify({ user_id: ME.id, post_id: post.id }),
      })
      likeBtn.classList.toggle('active')
      countEl.textContent = Number(countEl.textContent) + (liked ? -1 : 1)
    } catch (e) {
      alert(e.message)
    }
  })

  const box = el.querySelector('.comments')
  el.querySelector('.comment-toggle').addEventListener('click', () => {
    box.hidden = !box.hidden
  })

  el.querySelector('.comment-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const input = e.target.content
    const content = input.value.trim()
    if (!content) return
    const c = await api('/comments', {
      method: 'POST',
      body: JSON.stringify({
        user_id: ME.id,
        post_id: post.id,
        username: ME.user_metadata?.username || ME.email.split('@')[0],
        content,
      }),
    })
    el.querySelector('.comment-list').insertAdjacentHTML('beforeend', commentHtml(c))
    const cnt = el.querySelector('.comment-toggle span')
    cnt.textContent = Number(cnt.textContent) + 1
    input.value = ''
  })
}

document.addEventListener('DOMContentLoaded', loadFeed)
