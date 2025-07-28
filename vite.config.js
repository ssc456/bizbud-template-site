import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vercel-api-routes',
      configureServer(server) {
        server.middlewares.use('/api', async (req, res, next) => {
          try {
            // Parse cookies manually
            const cookies = {}
            if (req.headers.cookie) {
              req.headers.cookie.split(';').forEach(cookie => {
                const parts = cookie.trim().split('=')
                if (parts.length === 2) {
                  cookies[parts[0]] = decodeURIComponent(parts[1])
                }
              })
            }

            // Parse request body for POST/PUT requests
            let body = {}
            if (req.method === 'POST' || req.method === 'PUT') {
              const chunks = []
              for await (const chunk of req) {
                chunks.push(chunk)
              }
              const rawBody = Buffer.concat(chunks).toString()
              
              try {
                if (req.headers['content-type']?.includes('application/json')) {
                  body = JSON.parse(rawBody)
                } else if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
                  body = Object.fromEntries(new URLSearchParams(rawBody))
                }
              } catch (e) {
                console.warn('Failed to parse request body:', e)
              }
            }

            // Parse query parameters
            const url = new URL(req.url, `http://${req.headers.host}`)
            const query = Object.fromEntries(url.searchParams)

            // Get the API route path
            const apiPath = url.pathname.replace('/api', '')
            
            // Dynamically import the API handler with environment variables
            const modulePath = path.resolve(process.cwd(), `api${apiPath}.js`)
            
            // Make sure environment variables are available in the API context
            process.env.KV_REST_API_URL = process.env.KV_REST_API_URL
            process.env.KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN
            
            const { default: handler } = await import(modulePath + '?t=' + Date.now())
            
            // Create mock request object
            const mockReq = {
              method: req.method,
              query,
              body,
              headers: req.headers,
              cookies,
              url: req.url
            }
            
            // Create mock response object
            const mockRes = {
              statusCode: 200,
              headers: {},
              status(code) {
                this.statusCode = code
                return this
              },
              json(data) {
                res.statusCode = this.statusCode
                Object.entries(this.headers).forEach(([key, value]) => {
                  res.setHeader(key, value)
                })
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
                return this
              },
              setHeader(name, value) {
                this.headers[name] = value
                return this
              },
              end(data = '') {
                res.statusCode = this.statusCode
                Object.entries(this.headers).forEach(([key, value]) => {
                  res.setHeader(key, value)
                })
                res.end(data)
                return this
              }
            }
            
            // Call the handler
            await handler(mockReq, mockRes)
            
          } catch (error) {
            console.error('API Route Error:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 
              error: 'Internal Server Error',
              details: error.message 
            }))
          }
        })
      }
    }
  ],
  server: {
    port: 5177
  },
  define: {
    global: 'globalThis',
  },
  // Make sure Vite loads environment variables
  envPrefix: ['VITE_', 'KV_', 'ADMIN_', 'VERCEL_', 'GITHUB_', 'EMAIL_', 'RESEND_', 'CLOUDINARY_', 'OPENAI_']
})
