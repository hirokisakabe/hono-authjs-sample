import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import Google from '@auth/core/providers/google'
import 'dotenv/config'

const app = new Hono()

app.use(
  '*',
  initAuthConfig((c) => ({
    secret: c.env.AUTH_SECRET,
    providers: [
      Google,
    ],
  }))
)

app.onError((err, c) => {
  if (err instanceof HTTPException && err.status === 401) {

    return c.redirect('/api/auth/signin')
  }

  return c.text('Other Error', 500)
})

app.use('/api/auth/*', authHandler())

// 全てのページで認証を必須にする
app.use('*', verifyAuth())

app.get('/', (c) => {
  const auth = c.get('authUser')

  return c.text(`Hello, ${auth.session.user?.name}`)
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
