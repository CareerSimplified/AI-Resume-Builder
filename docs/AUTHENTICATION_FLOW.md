# Authentication & User Registration - Complete Guide

## 📍 Where The Registration & Login APIs Are

Your app uses **Supabase Auth** which provides built-in authentication APIs. You **don't need to create custom APIs** for user registration and login - Supabase handles everything automatically.

---

## 🔐 Complete Authentication Flow

### **1️⃣ User Registration (Signup)**

#### **Request URL (What You're Seeing):**
```
https://nwsweqmpklpymrnvoicx.supabase.co/auth/v1/signup
```

This is **Supabase's built-in Auth API** - automatically called by the SDK when you use `supabase.auth.signUp()`.

#### **How It Works:**

```
User fills signup form
  ↓
authService.signUp(email, password, name)
  ↓
Calls: POST https://your-project.supabase.co/auth/v1/signup
  ↓
Supabase creates user in auth.users (internal table)
  ↓
Database trigger handle_new_user() fires automatically
  ↓
User record created in your 'users' table
  ↓
User redirected to /auth/login
```

#### **Files Involved:**

**1. Signup Page (UI):** `app/auth/signup/page.tsx`
- Displays the signup form
- Collects: name, email, password, confirm password
- Validates password match and length
- Calls `authService.signUp()`

**2. Auth Service:** `services/auth.service.ts`
```typescript
async signUp(email: string, password: string, name: string) {
  // This automatically calls Supabase's /auth/v1/signup endpoint
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${APP_URL}/auth/callback`,
    },
  })
  return { data, error }
}
```

**3. Database Trigger:** (Created by `sql/setup-complete.sql`)
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = COALESCE(NEW.email, users.email),
      name = COALESCE(NEW.raw_user_meta_data->>'name', users.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**What This Means:**
- ✅ You don't need to manually insert users into the database
- ✅ The trigger automatically creates user records
- ✅ Works for both email/password and Google OAuth signups

---

### **2️⃣ User Login (Signin)**

#### **Request URL:**
```
https://nwsweqmpklpymrnvoicx.supabase.co/auth/v1/token
```

#### **How It Works:**

```
User enters email + password
  ↓
authService.signIn(email, password)
  ↓
Calls: POST https://your-project.supabase.co/auth/v1/token
  ↓
Supabase verifies credentials
  ↓
Returns access token + refresh token
  ↓
Tokens stored in cookies
  ↓
User redirected to /dashboard
```

#### **Files Involved:**

**1. Login Page (UI):** `app/auth/login/page.tsx`
- Displays the login form
- Collects: email, password
- Calls `authService.signIn()`

**2. Auth Service:** `services/auth.service.ts`
```typescript
async signIn(email: string, password: string) {
  // This automatically calls Supabase's /auth/v1/token endpoint
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  // Store tokens in cookies
  if (data?.session) {
    Cookies.set('sb-access-token', data.session.access_token, { ... })
    Cookies.set('sb-refresh-token', data.session.refresh_token, { ... })
  }
  
  return { data, error }
}
```

---

### **3️⃣ Google OAuth Login**

#### **How It Works:**

```
User clicks "Sign in with Google"
  ↓
authService.signInWithGoogle()
  ↓
Redirects to Google OAuth
  ↓
User authorizes app
  ↓
Google redirects back to /auth/callback
  ↓
Callback handler creates/updates user in DB
  ↓
User redirected to dashboard
```

#### **Files Involved:**

**1. Callback Handler:** `app/auth/callback/page.tsx`
```typescript
// After Google OAuth completes
const { data: authData } = await supabase.auth.getSession()

if (authData?.session?.user) {
  // Database trigger already created user, just verify
  const { data: userData } = await userService.getUserById(userId)
  
  if (userData?.role === 'admin') {
    router.push('/admin/dashboard')
  } else {
    router.push('/dashboard')
  }
}
```

---

## 📁 Complete File Structure

```
Authentication Flow:
├── app/auth/
│   ├── signup/page.tsx          ← Signup form UI
│   ├── login/page.tsx           ← Login form UI
│   └── callback/page.tsx        ← OAuth callback handler
│
├── services/
│   ├── auth.service.ts          ← Auth API calls (signup, login, Google)
│   └── database.service.ts      ← User CRUD operations
│
├── hooks/
│   └── useAuth.ts               ← Auth state management
│
├── lib/
│   ├── supabase.ts              ← Supabase client (for browser)
│   └── supabase-admin.ts        ← Supabase admin client (for server)
│
└── sql/
    └── setup-complete.sql       ← Creates users table + trigger
```

---

## ✅ What's Already Working

### **Registration:**
- ✅ User can sign up with email/password
- ✅ Supabase creates auth user automatically
- ✅ Database trigger creates user record automatically
- ✅ User redirected to login page
- ✅ Session tokens stored in cookies

### **Login:**
- ✅ User can login with email/password
- ✅ Supabase verifies credentials
- ✅ Session tokens returned and stored
- ✅ User redirected to dashboard

### **Google OAuth:**
- ✅ User can sign in with Google
- ✅ OAuth flow handled by Supabase
- ✅ User created in database via trigger
- ✅ Callback handler redirects to correct dashboard

### **Session Management:**
- ✅ Tokens stored in cookies
- ✅ Session persists across page refreshes
- ✅ Auto-redirects if already logged in
- ✅ Logout clears tokens properly

---

## 🎯 Testing The Flow

### **Test User Registration:**

1. Go to `http://localhost:3000/auth/signup`
2. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create Account"
4. You should see: "Account created successfully!"
5. Redirected to `/auth/login`

**What Happened Behind The Scenes:**
```
1. Browser → POST /auth/v1/signup
   Body: { email, password, data: { name } }

2. Supabase creates user in auth.users

3. Trigger handle_new_user() fires

4. User record created in your 'users' table:
   {
     id: "uuid-from-supabase",
     email: "test@example.com",
     name: "Test User",
     role: "user",
     created_at: "2026-04-06T..."
   }

5. Success! User can now login
```

### **Test User Login:**

1. Go to `http://localhost:3000/auth/login`
2. Fill in:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign In"
4. You should see: "Logged in successfully"
5. Redirected to `/dashboard`

**What Happened Behind The Scenes:**
```
1. Browser → POST /auth/v1/token
   Body: { email, password, grant_type: "password" }

2. Supabase verifies credentials

3. Returns session:
   {
     access_token: "eyJhbGc...",
     refresh_token: "eyJhbGc...",
     user: { id, email, ... }
   }

4. Tokens stored in cookies

5. User redirected to dashboard
```

---

## 🔧 Important Supabase Configuration

### **Email Confirmation (Optional):**

By default, Supabase may require email verification. To disable for development:

1. Go to Supabase Dashboard
2. Authentication → Settings
3. Email Auth → Disable "Confirm email"
4. Save

Now users can login immediately after signup without email verification.

### **Google OAuth Setup:**

1. Go to Google Cloud Console
2. Create OAuth credentials
3. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret
5. Go to Supabase → Authentication → Providers
6. Enable Google, add credentials
7. Save

---

## 📊 API Endpoints (Managed by Supabase)

You **don't create these** - Supabase provides them:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/v1/signup` | POST | Register new user |
| `/auth/v1/token` | POST | Login with email/password |
| `/auth/v1/user` | GET | Get current user |
| `/auth/v1/logout` | POST | Logout user |
| `/auth/v1/recover` | POST | Password reset |
| `/auth/v1/verify` | POST | Verify email |

**Called automatically by:**
- `supabase.auth.signUp()`
- `supabase.auth.signInWithPassword()`
- `supabase.auth.getUser()`
- `supabase.auth.signOut()`
- etc.

---

## ✨ Summary

**Where is the registration API?**
- It's in Supabase! URL: `https://your-project.supabase.co/auth/v1/signup`
- Called automatically by `authService.signUp()`

**Where is the login API?**
- It's in Supabase! URL: `https://your-project.supabase.co/auth/v1/token`
- Called automatically by `authService.signIn()`

**Where are users stored?**
- In Supabase's internal `auth.users` table (managed by Supabase)
- AND in your `users` table (created automatically by database trigger)

**Do I need to create custom auth APIs?**
- ❌ No! Supabase handles everything
- ✅ Just use the auth service functions
- ✅ Database trigger auto-creates user records

---

**Everything is already built and working!** 🎉
