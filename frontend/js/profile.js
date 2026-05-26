async function loadProfile() {
  const me = await requireAuth()
  if (!me) return

  const params = new URLSearchParams(location.search)
  const userId = params.get('id') || me.id
  const isMe = userId === me.id

  const head = document.getElementById('profile-head')
  const posts = document.getElementById('profile-posts')

  let profile, followers
  try {
    ;[profile, followers] = await Promise.all([
      api('/profiles/' + userId),
      api('/followers/' + userId),
    ])
  } catch (e) {
    head.innerHTML = `<p class="error-text">${esc(e.message)}</p>`
    return
  }

  const following = (followers.data || []).some((f) => f.follower_id === me.id)

  head.innerHTML = `
    <div class="profile-card card">
      <div class="avatar">${profile.avatar_url
        ? `<img src="${esc(profile.avatar_url)}" alt="">`
        : `<span>${esc((profile.username || '?')[0].toUpperCase())}</span>`}</div>
      <h2>@${esc(profile.username)}</h2>
      <p class="bio">${esc(profile.bio || '')}</p>
      <p class="muted"><strong>${followers.followers}</strong> followers</p>
      ${isMe
        ? '<button id="edit-btn" class="btn">Edit profile</button>'
        : `<button id="follow-btn" class="btn ${following ? 'secondary' : ''}">${following ? 'Unfollow' : 'Follow'}</button>`}
    </div>
    ${isMe ? editFormHtml(profile) : ''}`

  if (isMe) wireEdit(userId)
  else wireFollow(me.id, userId)

  loadUserPosts(userId, posts)
}

function editFormHtml(p) {
  return `
    <form id="edit-form" class="card" hidden>
      <h3>Edit profile</h3>
      <label>Username<input name="username" value="${esc(p.username || '')}" required></label>
      <label>Bio<textarea name="bio">${esc(p.bio || '')}</textarea></label>
      <label>Avatar URL<input name="avatar_url" value="${esc(p.avatar_url || '')}"></label>
      <button type="submit" class="btn">Save</button>
    </form>`
}

function wireEdit(userId) {
  const form = document.getElementById('edit-form')
  document.getElementById('edit-btn').addEventListener('click', () => {
    form.hidden = !form.hidden
  })
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    try {
      await api('/profiles/' + userId, {
        method: 'PUT',
        body: JSON.stringify({
          username: form.username.value.trim(),
          bio: form.bio.value.trim(),
          avatar_url: form.avatar_url.value.trim(),
        }),
      })
      location.reload()
    } catch (err) {
      alert(err.message)
    }
  })
}

function wireFollow(meId, targetId) {
  const btn = document.getElementById('follow-btn')
  btn.addEventListener('click', async () => {
    const following = btn.textContent === 'Unfollow'
    try {
      await api('/followers', {
        method: following ? 'DELETE' : 'POST',
        body: JSON.stringify({ follower_id: meId, following_id: targetId }),
      })
      location.reload()
    } catch (err) {
      alert(err.message)
    }
  })
}

async function loadUserPosts(userId, container) {
  let posts
  try {
    posts = await api('/posts/user/' + userId)
  } catch {
    container.innerHTML = ''
    return
  }
  if (!posts.length) {
    container.innerHTML = '<p class="muted">No posts yet.</p>'
    return
  }
  container.innerHTML = posts
    .map(
      (p) => `
      <article class="card post">
        <header class="post-head">
          <span class="muted">${timeAgo(p.created_at)}</span>
        </header>
        <p class="post-body">${esc(p.content)}</p>
        ${p.image_url ? `<img class="post-img" src="${esc(p.image_url)}" alt="">` : ''}
      </article>`
    )
    .join('')
}

document.addEventListener('DOMContentLoaded', loadProfile)
