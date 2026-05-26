async function ensureProfile(user) {
  const username = user.user_metadata?.username || user.email.split('@')[0]
  try {
    await api('/profiles/' + user.id)
  } catch {
    await api('/profiles', {
      method: 'POST',
      body: JSON.stringify({ id: user.id, username, bio: '', avatar_url: '' }),
    })
  }
}

function showError(msg) {
  const box = document.getElementById('error')
  if (box) {
    box.textContent = msg
    box.style.display = 'block'
  } else {
    alert(msg)
  }
}

function initRegister() {
  const form = document.getElementById('register-form')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const username = form.username.value.trim()
    const email = form.email.value.trim()
    const password = form.password.value

    if (!username || !email || !password) {
      return showError('All fields are required.')
    }

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) return showError(error.message)

    if (data.session) {
      await ensureProfile(data.user)
      window.location.href = 'index.html'
    } else {
      showError('Account created. Check your email to confirm, then log in.')
    }
  })
}

function initLogin() {
  const form = document.getElementById('login-form')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = form.email.value.trim()
    const password = form.password.value

    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) return showError(error.message)

    await ensureProfile(data.user)
    window.location.href = 'index.html'
  })
}

async function logout() {
  await sb.auth.signOut()
  window.location.href = 'login.html'
}

async function initNav() {
  const nav = document.getElementById('nav')
  if (!nav) return

  const user = await currentUser()
  if (!user) {
    nav.innerHTML = `
      <a class="brand" href="index.html">SocialApp</a>
      <div class="nav-links">
        <a href="login.html">Login</a>
        <a href="register.html">Register</a>
      </div>`
    return
  }

  nav.innerHTML = `
    <a class="brand" href="index.html">SocialApp</a>
    <div class="nav-links">
      <a href="index.html">Feed</a>
      <a href="create.html">New Post</a>
      <a href="profile.html?id=${user.id}">Profile</a>
      <button id="logout-btn" class="link-btn">Logout</button>
    </div>`
  document.getElementById('logout-btn').addEventListener('click', logout)
}

document.addEventListener('DOMContentLoaded', () => {
  initNav()
  initLogin()
  initRegister()
})
