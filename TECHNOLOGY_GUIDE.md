# Technology Guide - Food Tracking Application

A comprehensive guide to the technologies, patterns, and learnings from building this full-stack TypeScript food tracking application.

---

## Table of Contents

- [Frontend Technologies](#frontend-technologies)
- [Backend Technologies](#backend-technologies)
- [Database & ORM](#database--orm)
- [Authentication & Security](#authentication--security)
- [External Services](#external-services)
- [Development Tools](#development-tools)
- [Deployment & Infrastructure](#deployment--infrastructure)
- [Key Architectural Patterns](#key-architectural-patterns)

---

## Frontend Technologies

### Next.js 14+ (App Router)

**What it is:** A React framework with built-in routing, server-side rendering (SSR), and static site generation.

**How we use it:**
- **App Router** (`/app` directory) for file-based routing
- **Server Components** by default (with `'use client'` directive for client components)
- **API Routes** for NextAuth endpoints (`/app/api/auth`)
- **Middleware** for route protection
- **SSR on Vercel** for dynamic content with authentication

**Key learnings:**

1. **App Router vs Pages Router**
   - App Router is the modern approach (Next.js 13+)
   - Server Components by default = better performance
   - Client Components (`'use client'`) needed for hooks, state, interactivity

2. **File-based Routing**
   ```
   app/
   ├── page.tsx           → /
   ├── login/
   │   └── page.tsx       → /login
   └── api/
       └── auth/
           └── [...nextauth]/
               └── route.ts → /api/auth/*
   ```

3. **Server vs Client Components**
   - **Server Components**: Fetch data, access backend directly, no client JS bundle
   - **Client Components**: Use React hooks, handle events, access browser APIs
   - Our app uses Client Components for interactive forms and GraphQL queries

4. **Metadata & SEO**
   - Export `metadata` object from pages for SEO
   - Dynamic metadata with `generateMetadata()`

**Common gotchas:**
- ⚠️ Can't use hooks in Server Components
- ⚠️ Must use `'use client'` for any component using `useState`, `useEffect`, etc.
- ⚠️ Server Components can't pass functions as props to Client Components

---

### React 18+

**What it is:** JavaScript library for building user interfaces with components.

**How we use it:**
- **Functional Components** with hooks (no class components)
- **useState** for local state (form inputs, modal open/close)
- **useEffect** for side effects (fetching data, subscriptions)
- **Custom Hooks** (`useMacroTargets`, `useFoodSuggestions`)
- **Component Composition** (small, reusable components)

**Key learnings:**

1. **Hooks Pattern**
   ```typescript
   // State management
   const [isOpen, setIsOpen] = useState(false);

   // Side effects
   useEffect(() => {
     if (session) {
       fetchData();
     }
   }, [session]);

   // Custom hooks for reusability
   function useMacroTargets() {
     const [{ data, fetching }] = useQuery({ query: GET_MACRO_TARGETS });
     return { targets: data?.getMacroTargets, loading: fetching };
   }
   ```

2. **Component Patterns**
   - **Presentational Components**: Pure UI components that receive props
   - **Container Components**: Handle logic and data fetching
   - **Compound Components**: Components that work together (Modal + ModalHeader)

3. **Props & TypeScript Interfaces**
   ```typescript
   interface FoodCardProps {
     food: FoodEntry;
     onEdit?: (id: string) => void;
     onDelete?: (id: string) => void;
   }
   ```

**Best practices demonstrated:**
- ✅ Small, focused components (single responsibility)
- ✅ TypeScript interfaces for all props
- ✅ Optional callback props with `?`
- ✅ Extract reusable logic into custom hooks

---

### TypeScript

**What it is:** JavaScript with static type checking.

**How we use it:**
- **Strict mode enabled** for maximum type safety
- **Interfaces** for data structures (FoodEntry, MacroTargets, User)
- **Type inference** where possible
- **Generic types** for reusable components
- **Utility types** (Partial, Pick, Omit)

**Key learnings:**

1. **Type vs Interface**
   ```typescript
   // Interface (preferred for object shapes)
   interface User {
     id: string;
     email: string;
     name?: string; // Optional property
   }

   // Type (for unions, intersections, primitives)
   type Status = 'pending' | 'in_progress' | 'completed';
   type FormData = User & { password: string }; // Intersection
   ```

2. **Generics for Reusability**
   ```typescript
   interface ApiResponse<T> {
     data: T;
     error?: string;
   }

   const userResponse: ApiResponse<User> = await fetchUser();
   ```

3. **Utility Types**
   ```typescript
   // Make all properties optional
   type PartialUser = Partial<User>;

   // Pick specific properties
   type UserPreview = Pick<User, 'id' | 'name'>;

   // Omit properties
   type UserWithoutEmail = Omit<User, 'email'>;
   ```

4. **Type Assertions (use sparingly)**
   ```typescript
   const user = data as User; // Only when you're certain
   ```

**Common gotchas:**
- ⚠️ `any` defeats the purpose of TypeScript - avoid it
- ⚠️ Type assertions can be dangerous - only use when necessary
- ⚠️ `undefined` vs `null` - be explicit about which you use

---

### TailwindCSS

**What it is:** Utility-first CSS framework for rapid UI development.

**How we use it:**
- **Utility classes** directly in JSX (`className="flex items-center gap-4"`)
- **Responsive design** with breakpoint prefixes (`md:`, `lg:`)
- **Custom colors** in `tailwind.config.js` for nutrition data
- **Hover states** with `hover:` prefix
- **Focus states** for accessibility

**Key learnings:**

1. **Common Patterns**
   ```tsx
   // Flexbox layout
   <div className="flex items-center justify-between gap-4">

   // Grid layout
   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

   // Responsive spacing
   <div className="p-4 md:p-6 lg:p-8">

   // Conditional classes
   <p className={`text-xs ${isGoodValue ? 'text-green-600' : 'text-gray-400'}`}>
   ```

2. **Design System**
   - Spacing scale: 0.25rem increments (1 = 0.25rem, 4 = 1rem, etc.)
   - Colors: gray-50 to gray-900 (50 = lightest, 900 = darkest)
   - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

3. **Tailwind + TypeScript**
   ```tsx
   // Type-safe className prop
   interface CardProps {
     className?: string;
     children: React.ReactNode;
   }

   export function Card({ className = '', children }: CardProps) {
     return (
       <div className={`bg-white rounded-lg shadow ${className}`}>
         {children}
       </div>
     );
   }
   ```

**Best practices:**
- ✅ Use `@apply` in CSS for repeated patterns
- ✅ Extract common component styles into reusable components
- ✅ Mobile-first approach (default styles = mobile, then `md:` for larger)

---

### Urql (GraphQL Client)

**What it is:** Lightweight, extensible GraphQL client for React.

**How we use it:**
- **useQuery** hook for fetching data
- **useMutation** hook for mutations
- **Cache-and-network** policy for fresh data
- **Request policy** control for refetching
- **Client-side caching** for performance

**Key learnings:**

1. **Query Pattern**
   ```typescript
   const GET_FOODS_QUERY = `
     query GetFoods {
       todaysFoods {
         id
         description
         calories
       }
     }
   `;

   const [{ data, fetching, error }, reexecuteQuery] = useQuery({
     query: GET_FOODS_QUERY,
     requestPolicy: 'cache-and-network', // Check cache, then network
   });

   // Refetch data
   reexecuteQuery({ requestPolicy: 'network-only' });
   ```

2. **Mutation Pattern**
   ```typescript
   const ADD_FOOD_MUTATION = `
     mutation AddFood($input: AddFoodInput!) {
       addFood(input: $input) {
         id
         description
       }
     }
   `;

   const [result, executeMutation] = useMutation(ADD_FOOD_MUTATION);

   const handleSubmit = async (data: FormData) => {
     const result = await executeMutation({ input: data });
     if (result.data?.addFood) {
       // Success!
     }
   };
   ```

3. **Request Policies**
   - `cache-first`: Use cache if available (default)
   - `cache-and-network`: Return cache, then check network
   - `network-only`: Always fetch from network (skip cache)
   - `cache-only`: Only use cache (no network request)

4. **Client Configuration**
   ```typescript
   const client = createClient({
     url: 'http://localhost:4000/graphql',
     fetchOptions: () => ({
       headers: {
         authorization: token ? `Bearer ${token}` : '',
       },
     }),
   });
   ```

**Why Urql over Apollo?**
- Smaller bundle size (~5KB vs ~30KB)
- Simpler API, less configuration
- Better for straightforward use cases
- Extensible with exchanges when needed

---

### NextAuth.js

**What it is:** Authentication library for Next.js with OAuth providers.

**How we use it:**
- **Google OAuth** provider for sign-in
- **JWT strategy** for sessions (stateless)
- **Callbacks** to customize auth flow
- **Middleware** for route protection
- **Custom token endpoint** for backend compatibility

**Key learnings:**

1. **Configuration Pattern**
   ```typescript
   export const authOptions: NextAuthOptions = {
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       }),
     ],
     session: {
       strategy: 'jwt', // Stateless sessions
       maxAge: 30 * 24 * 60 * 60, // 30 days
     },
     callbacks: {
       async signIn({ user, account }) {
         // Custom logic on sign-in
         // Create user in our database
       },
       async jwt({ token, user }) {
         // Add data to JWT
         if (user) token.userId = user.id;
         return token;
       },
       async session({ session, token }) {
         // Add data to session
         session.user.id = token.userId;
         return session;
       },
     },
   };
   ```

2. **Middleware for Protection**
   ```typescript
   import { withAuth } from 'next-auth/middleware';

   export default withAuth(
     function middleware(req) {
       return NextResponse.next();
     },
     {
       callbacks: {
         authorized: ({ token }) => !!token,
       },
       pages: {
         signIn: '/login',
       },
     }
   );

   export const config = {
     matcher: ['/', '/protected-route'],
   };
   ```

3. **Using Session in Components**
   ```typescript
   import { useSession } from 'next-auth/react';

   function MyComponent() {
     const { data: session, status } = useSession();

     if (status === 'loading') return <div>Loading...</div>;
     if (status === 'unauthenticated') return <div>Not signed in</div>;

     return <div>Signed in as {session.user.email}</div>;
   }
   ```

4. **Custom JWT Token Creation**
   - NextAuth uses encrypted JWE tokens (not standard JWT)
   - Our backend expects standard HS256 JWT
   - Solution: Create `/api/auth/token` endpoint that converts session to JWT

**Common gotchas:**
- ⚠️ NextAuth tokens are JWE (encrypted), not standard JWT
- ⚠️ Must set `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
- ⚠️ Session callbacks run on every request (keep them fast)
- ⚠️ Middleware runs on edge runtime (limited Node.js APIs)

---

### React Hook Form + Zod

**What it is:** Form library with validation using Zod schema.

**How we use it:**
- **useForm** hook for form state
- **Zod schemas** for validation rules
- **zodResolver** to connect them
- **Type inference** from Zod schema
- **Error handling** with TypeScript

**Key learnings:**

1. **Form Pattern**
   ```typescript
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { z } from 'zod';

   // Define validation schema
   const FoodSchema = z.object({
     description: z.string().min(1, 'Required'),
     calories: z.number().min(0).max(10000),
   });

   // Infer TypeScript type from schema
   type FoodFormData = z.infer<typeof FoodSchema>;

   function FoodForm() {
     const { register, handleSubmit, formState: { errors } } = useForm<FoodFormData>({
       resolver: zodResolver(FoodSchema),
       defaultValues: {
         description: '',
         calories: 0,
       },
     });

     const onSubmit = (data: FoodFormData) => {
       // data is fully typed and validated!
     };

     return (
       <form onSubmit={handleSubmit(onSubmit)}>
         <input {...register('description')} />
         {errors.description && <p>{errors.description.message}</p>}

         <input {...register('calories', { valueAsNumber: true })} type="number" />
         {errors.calories && <p>{errors.calories.message}</p>}
       </form>
     );
   }
   ```

2. **Complex Validation**
   ```typescript
   const MacroTargetsSchema = z.object({
     calories: z.number()
       .min(500, 'Calories must be at least 500')
       .max(10000, 'Calories must be at most 10000'),
     protein: z.number().min(10).max(500),
   });
   ```

3. **Custom Validation**
   ```typescript
   const schema = z.object({
     password: z.string().min(8),
     confirmPassword: z.string(),
   }).refine((data) => data.password === data.confirmPassword, {
     message: "Passwords don't match",
     path: ['confirmPassword'],
   });
   ```

**Benefits:**
- ✅ Type-safe forms (schema → TypeScript types)
- ✅ Single source of truth for validation
- ✅ Great error messages out of the box
- ✅ Performance optimized (minimal re-renders)

---

## Backend Technologies

### GraphQL Yoga

**What it is:** Modern GraphQL server for Node.js.

**How we use it:**
- **GraphQL endpoint** at `/graphql`
- **GraphiQL IDE** for testing queries
- **Context injection** for authentication
- **Error handling** with custom errors
- **CORS configuration** for frontend

**Key learnings:**

1. **Server Setup**
   ```typescript
   import { createYoga } from 'graphql-yoga';
   import { createServer } from 'node:http';
   import { schema } from './schema';
   import { createContext } from './schema/context';

   const yoga = createYoga({
     schema,
     context: async ({ request }) => await createContext(request),
     cors: {
       origin: process.env.FRONTEND_URL,
       credentials: true,
     },
   });

   const server = createServer(yoga);
   server.listen(4000, () => {
     console.log('GraphQL server running on http://localhost:4000/graphql');
   });
   ```

2. **Context Pattern**
   ```typescript
   export interface GraphQLContext {
     prisma: PrismaClient;
     userId: string | null;
     isAuthenticated: boolean;
   }

   export async function createContext(request: Request): Promise<GraphQLContext> {
     const authHeader = request.headers.get('authorization');

     if (!authHeader?.startsWith('Bearer ')) {
       return { prisma, userId: null, isAuthenticated: false };
     }

     const token = authHeader.substring(7);
     const payload = await verifyJWT(token);

     return {
       prisma,
       userId: payload.sub,
       isAuthenticated: true,
     };
   }
   ```

3. **Error Handling**
   ```typescript
   // In resolver
   if (!context.userId) {
     throw new Error('Authentication required');
   }

   // Custom error
   class NotFoundError extends Error {
     constructor(message: string) {
       super(message);
       this.name = 'NotFoundError';
     }
   }
   ```

**Why GraphQL over REST?**
- Single endpoint for all data
- Client specifies exactly what data it needs (no over-fetching)
- Strong typing with schema
- Great developer experience with GraphiQL
- Easy to add new fields without breaking changes

---

### Pothos (GraphQL Schema Builder)

**What it is:** Code-first GraphQL schema builder for TypeScript.

**How we use it:**
- **Type-safe schema** with TypeScript
- **Builder pattern** for types, queries, mutations
- **Object references** for reusable types
- **Input types** for mutations
- **Field resolvers** for computed fields

**Key learnings:**

1. **Schema Builder Setup**
   ```typescript
   import SchemaBuilder from '@pothos/core';

   export const builder = new SchemaBuilder({
     plugins: [], // Add plugins as needed
   });

   // Define scalar types
   builder.queryType({});
   builder.mutationType({});
   ```

2. **Object Type Pattern**
   ```typescript
   interface User {
     id: string;
     email: string;
     name: string | null;
   }

   const UserType = builder.objectRef<User>('User').implement({
     fields: (t) => ({
       id: t.exposeID('id'),
       email: t.exposeString('email'),
       name: t.exposeString('name', { nullable: true }),
       // Computed field
       displayName: t.string({
         resolve: (user) => user.name || user.email,
       }),
     }),
   });
   ```

3. **Input Type Pattern**
   ```typescript
   const AddFoodInput = builder.inputType('AddFoodInput', {
     fields: (t) => ({
       description: t.string({ required: true }),
       calories: t.float({ required: false }),
       protein: t.float({ required: false }),
     }),
   });
   ```

4. **Query Pattern**
   ```typescript
   builder.queryField('getFood', (t) =>
     t.field({
       type: FoodType,
       nullable: true,
       args: {
         id: t.arg.string({ required: true }),
       },
       resolve: async (parent, args, context) => {
         return context.prisma.food.findUnique({
           where: { id: args.id },
         });
       },
     })
   );
   ```

5. **Mutation Pattern**
   ```typescript
   builder.mutationField('addFood', (t) =>
     t.field({
       type: FoodType,
       args: {
         input: t.arg({ type: AddFoodInput, required: true }),
       },
       resolve: async (parent, args, context) => {
         const userId = requireAuth(context);

         return context.prisma.food.create({
           data: {
             description: args.input.description,
             calories: args.input.calories,
             userId,
           },
         });
       },
     })
   );
   ```

**Why Pothos?**
- ✅ Type-safe schema (errors at compile time, not runtime)
- ✅ Code-first approach (no SDL strings)
- ✅ Great TypeScript inference
- ✅ Plugins for common patterns
- ✅ Easy to test and refactor

---

## Database & ORM

### PostgreSQL

**What it is:** Powerful, open-source relational database.

**How we use it:**
- **Hosted on Railway** (managed PostgreSQL)
- **Tables**: users, foods, food_cache, macro_targets
- **Relationships**: Foreign keys with cascade delete
- **Indexes**: For performance on common queries
- **ACID compliance**: Data integrity guaranteed

**Key learnings:**

1. **Data Types**
   ```sql
   -- Text types
   TEXT                    -- Unlimited length
   VARCHAR(255)            -- Limited length (better for indexes)

   -- Numeric types
   INTEGER                 -- Whole numbers
   DOUBLE PRECISION        -- Floating point (for nutrition data)

   -- Date/Time types
   TIMESTAMPTZ(6)          -- Timestamp with timezone

   -- Boolean
   BOOLEAN                 -- true/false
   ```

2. **Indexes for Performance**
   ```sql
   -- Single column index
   CREATE INDEX idx_foods_user_id ON foods(user_id);

   -- Composite index (multiple columns)
   CREATE INDEX idx_foods_user_created ON foods(user_id, created_at);

   -- Unique index
   CREATE UNIQUE INDEX users_email_key ON users(email);
   ```

3. **Foreign Keys**
   ```sql
   ALTER TABLE foods
     ADD CONSTRAINT foods_user_id_fkey
     FOREIGN KEY (user_id)
     REFERENCES users(id)
     ON DELETE CASCADE;  -- Delete foods when user is deleted
   ```

4. **Common Queries**
   ```sql
   -- Filter by user and date
   SELECT * FROM foods
   WHERE user_id = 'abc123'
     AND created_at >= '2025-10-08 00:00:00'
     AND created_at < '2025-10-09 00:00:00'
   ORDER BY created_at DESC;

   -- Aggregate functions
   SELECT user_id,
          COUNT(*) as food_count,
          SUM(calories) as total_calories
   FROM foods
   GROUP BY user_id;
   ```

**Best practices:**
- ✅ Use indexes on foreign keys and frequently queried columns
- ✅ Use TIMESTAMPTZ for all timestamps (handles timezones)
- ✅ Use CASCADE for related data cleanup
- ✅ Normalize data (separate tables for related entities)

---

### Prisma ORM

**What it is:** Next-generation ORM for Node.js and TypeScript.

**How we use it:**
- **Schema definition** in `schema.prisma`
- **Type-safe queries** generated from schema
- **Migrations** for database changes
- **Relations** between models
- **Query builder** with autocomplete

**Key learnings:**

1. **Schema Pattern**
   ```prisma
   model User {
     id        String   @id @default(cuid())
     email     String   @unique @db.VarChar(255)
     name      String?  @db.VarChar(255)
     createdAt DateTime @default(now()) @db.Timestamptz(6)
     updatedAt DateTime @updatedAt @db.Timestamptz(6)

     // Relations
     foods        Food[]
     macroTargets MacroTargets?

     @@index([email])
     @@map("users")
   }

   model Food {
     id          String  @id @default(cuid())
     description String  @db.VarChar(500)
     calories    Float?  @db.DoublePrecision
     userId      String  @db.VarChar(255)

     // Relation
     user User @relation(fields: [userId], references: [id], onDelete: Cascade)

     @@index([userId, createdAt])
     @@map("foods")
   }
   ```

2. **Query Patterns**
   ```typescript
   // Find unique
   const user = await prisma.user.findUnique({
     where: { id: 'abc123' },
   });

   // Find many with filters
   const foods = await prisma.food.findMany({
     where: {
       userId: 'abc123',
       createdAt: {
         gte: startDate,
         lt: endDate,
       },
     },
     orderBy: { createdAt: 'desc' },
     take: 10,
   });

   // Create
   const food = await prisma.food.create({
     data: {
       description: '2 eggs',
       calories: 140,
       userId: 'abc123',
     },
   });

   // Update
   await prisma.food.update({
     where: { id: 'food123' },
     data: { calories: 150 },
   });

   // Upsert (update or create)
   await prisma.macroTargets.upsert({
     where: { userId: 'abc123' },
     create: { userId: 'abc123', calories: 2600 },
     update: { calories: 2600 },
   });

   // Delete
   await prisma.food.delete({
     where: { id: 'food123' },
   });
   ```

3. **Relations**
   ```typescript
   // Include related data
   const user = await prisma.user.findUnique({
     where: { id: 'abc123' },
     include: {
       foods: true,
       macroTargets: true,
     },
   });

   // Create with relations
   await prisma.user.create({
     data: {
       email: 'user@example.com',
       foods: {
         create: [
           { description: 'Apple', calories: 95 },
           { description: 'Banana', calories: 105 },
         ],
       },
     },
   });
   ```

4. **Migrations**
   ```bash
   # Create a new migration
   npx prisma migrate dev --name add_macro_targets

   # Apply migrations to production
   npx prisma migrate deploy

   # Reset database (dev only)
   npx prisma migrate reset

   # Generate Prisma Client
   npx prisma generate

   # View database in browser
   npx prisma studio
   ```

5. **Type Safety**
   ```typescript
   // Prisma generates types from your schema
   import { User, Food } from '@prisma/client';

   // Type-safe queries with autocomplete
   const food: Food = await prisma.food.findUnique({
     where: { id: 'abc' },
   });

   // Partial types
   type FoodPreview = Pick<Food, 'id' | 'description' | 'calories'>;
   ```

**Why Prisma?**
- ✅ Type-safe queries (compile-time errors)
- ✅ Excellent TypeScript support
- ✅ Migration system built-in
- ✅ Great developer experience
- ✅ Visual database browser (Prisma Studio)

**Common gotchas:**
- ⚠️ Must run `prisma generate` after schema changes
- ⚠️ `camelCase` in Prisma → `snake_case` in database (use `@@map`)
- ⚠️ Relations must be defined on both sides
- ⚠️ Can't use ES6 modules in Prisma schema

---

## Authentication & Security

### JWT (JSON Web Tokens) with Jose

**What it is:** Stateless authentication using signed tokens.

**How we use it:**
- **HS256 algorithm** (HMAC with SHA-256)
- **Token creation** in frontend `/api/auth/token`
- **Token verification** in backend with Jose library
- **Payload**: user ID, email, name
- **Expiration**: 24 hours

**Key learnings:**

1. **Token Structure**
   ```
   eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMTIzIn0.signature
   │                    │                           │
   Header               Payload                     Signature
   ```

2. **Creating JWT**
   ```typescript
   import { SignJWT } from 'jose';

   const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

   const token = await new SignJWT({
     sub: userId,        // Subject (user ID)
     email: userEmail,
     name: userName,
   })
     .setProtectedHeader({ alg: 'HS256' })
     .setIssuedAt()
     .setExpirationTime('24h')
     .sign(secret);
   ```

3. **Verifying JWT**
   ```typescript
   import { jwtVerify } from 'jose';

   const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

   try {
     const { payload } = await jwtVerify(token, secret, {
       algorithms: ['HS256'],
     });

     const userId = payload.sub as string;
     const email = payload.email as string;
   } catch (error) {
     throw new Error('Invalid or expired token');
   }
   ```

4. **Authorization Pattern**
   ```typescript
   export function requireAuth(context: GraphQLContext): string {
     if (!context.userId) {
       throw new Error('Authentication required. Please sign in.');
     }
     return context.userId;
   }

   // In resolver
   const userId = requireAuth(context);
   ```

**Security Best Practices:**
- ✅ Short expiration times (24 hours)
- ✅ HTTPS only in production
- ✅ Don't store sensitive data in JWT
- ✅ Validate all claims on server
- ✅ Use strong secret (32+ random bytes)

**JWT vs Session Cookies:**
- JWT = Stateless (no database lookup)
- Session = Stateful (requires database)
- JWT = Scales better (no session store)
- Session = More secure (can revoke immediately)
- **Our choice**: JWT for simplicity and scalability

---

### Google OAuth 2.0

**What it is:** Authentication protocol using Google accounts.

**How we use it:**
- **Authorization Code Flow** (redirect-based)
- **Client credentials** from Google Cloud Console
- **Scopes**: email, profile
- **Callback URL**: `/api/auth/callback/google`
- **User data**: email, name, profile picture

**Key learnings:**

1. **OAuth Flow**
   ```
   1. User clicks "Sign in with Google"
   2. Redirect to Google login page
   3. User authorizes app
   4. Google redirects back with authorization code
   5. Exchange code for access token
   6. Fetch user info with access token
   7. Create user in our database
   8. Create session for user
   ```

2. **Configuration**
   ```typescript
   GoogleProvider({
     clientId: process.env.GOOGLE_CLIENT_ID,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
     // Default scopes: openid, email, profile
   })
   ```

3. **Google Cloud Console Setup**
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://yourdomain.com/api/auth/callback/google` (prod)
   - Get Client ID and Client Secret
   - Add to environment variables

4. **User Data from Google**
   ```typescript
   {
     id: "google-user-id",
     email: "user@gmail.com",
     name: "John Doe",
     image: "https://lh3.googleusercontent.com/...",
     email_verified: true
   }
   ```

**Security Considerations:**
- ✅ Validate email_verified
- ✅ Store provider + providerId (not just email)
- ✅ Use HTTPS in production
- ✅ Keep client secret secure (never in frontend)
- ✅ Add all callback URLs to Google Console

---

## External Services

### OpenAI API (GPT-4o-mini)

**What it is:** AI language model API for nutrition analysis.

**How we use it:**
- **GPT-4o-mini model** (fast, cheap, good quality)
- **Structured output** with JSON schema
- **Few-shot prompting** for consistency
- **Caching** results to reduce API costs
- **Fallback** to manual entry on failure

**Key learnings:**

1. **API Call Pattern**
   ```typescript
   import OpenAI from 'openai';

   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
   });

   const completion = await openai.chat.completions.create({
     model: 'gpt-4o-mini',
     messages: [
       {
         role: 'system',
         content: 'You are a nutrition expert. Analyze food descriptions and provide nutrition data.',
       },
       {
         role: 'user',
         content: `Analyze this food: "${foodDescription}"`,
       },
     ],
     response_format: { type: 'json_object' },
     temperature: 0.3, // Lower = more consistent
   });

   const nutrition = JSON.parse(completion.choices[0].message.content);
   ```

2. **Structured Output with Schema**
   ```typescript
   const systemPrompt = `
   Return JSON with this exact structure:
   {
     "calories": number,
     "protein": number,
     "carbs": number,
     "fat": number,
     "confidence": "high" | "medium" | "low"
   }
   `;
   ```

3. **Caching Strategy**
   ```typescript
   // Hash the food description
   const hash = createHash('sha256')
     .update(description.toLowerCase().trim())
     .digest('hex');

   // Check cache
   const cached = await prisma.foodCache.findUnique({
     where: { userId_descriptionHash: { userId, descriptionHash: hash } },
   });

   if (cached) {
     return cached.nutritionData;
   }

   // Call API and cache result
   const nutrition = await callOpenAI(description);
   await prisma.foodCache.create({
     data: { userId, descriptionHash: hash, nutritionData: nutrition },
   });
   ```

4. **Error Handling**
   ```typescript
   try {
     const nutrition = await analyzeFoodNutrition(description);
     return nutrition;
   } catch (error) {
     console.error('OpenAI API error:', error);
     // Return null or default values
     // User can enter manually
     return null;
   }
   ```

5. **Cost Optimization**
   - Use GPT-4o-mini (10x cheaper than GPT-4)
   - Cache results aggressively
   - Set max_tokens to limit response size
   - Batch requests when possible
   - Monitor usage with OpenAI dashboard

**Prompt Engineering Tips:**
- ✅ Be specific about output format
- ✅ Provide examples (few-shot learning)
- ✅ Use lower temperature for consistency
- ✅ Request confidence scores
- ✅ Handle edge cases in prompt

---

## Development Tools

### ESLint

**What it is:** JavaScript/TypeScript linter for code quality.

**How we use it:**
- **Next.js ESLint config** as base
- **TypeScript rules** for type safety
- **Accessibility rules** for a11y
- **Auto-fix** on save (IDE integration)
- **CI/CD** checks in deployment

**Key learnings:**

1. **Common Rules**
   ```json
   {
     "rules": {
       "no-unused-vars": "error",        // Catch unused variables
       "no-console": "warn",              // Warn on console.log
       "prefer-const": "error",           // Use const when possible
       "@typescript-eslint/no-explicit-any": "error"
     }
   }
   ```

2. **Disabling Rules**
   ```typescript
   // Disable for one line
   // eslint-disable-next-line no-unused-vars
   function example(unusedParam: string) {}

   // Disable for file
   /* eslint-disable no-console */
   console.log('This is okay');

   // Disable for block
   /* eslint-disable */
   // Messy code here
   /* eslint-enable */
   ```

3. **Running ESLint**
   ```bash
   npm run lint              # Check all files
   npm run lint:fix          # Auto-fix issues
   npx eslint src/file.ts    # Check specific file
   ```

---

### Git & GitHub

**What it is:** Version control and code hosting.

**How we use it:**
- **Feature branches** for development
- **Conventional commits** for clear history
- **Pull requests** for code review
- **GitHub Actions** (removed in favor of platform deploys)
- **Tags** for releases

**Key learnings:**

1. **Branch Strategy**
   ```bash
   # Main branch (production)
   main

   # Feature branches
   feature/TASK-010-multi-user-auth
   feature/TASK-012-macro-targets

   # Fix branches
   fix/login-redirect-issue
   ```

2. **Conventional Commits**
   ```bash
   feat: add macro targets feature
   fix: resolve login redirect bug
   chore: update dependencies
   docs: update README
   refactor: reorganize components
   test: add unit tests for auth
   perf: optimize GraphQL queries
   style: format code with prettier
   ```

3. **Useful Commands**
   ```bash
   # Create and switch to new branch
   git checkout -b feature/new-feature

   # Stage changes
   git add .
   git add file.ts

   # Commit
   git commit -m "feat: add new feature"

   # Push to remote
   git push origin feature/new-feature

   # Pull latest changes
   git pull origin main

   # Merge main into feature branch
   git checkout feature/new-feature
   git merge main

   # View history
   git log --oneline

   # Undo last commit (keep changes)
   git reset --soft HEAD~1

   # Discard uncommitted changes
   git checkout -- file.ts
   ```

4. **Pull Request Template**
   ```markdown
   ## Summary
   Brief description of changes

   ## Changes
   - Added X feature
   - Fixed Y bug
   - Updated Z component

   ## Testing
   - [ ] Unit tests passing
   - [ ] Manual testing complete
   - [ ] Deployment successful
   ```

---

## Deployment & Infrastructure

### Vercel (Frontend)

**What it is:** Serverless platform for Next.js applications.

**How we use it:**
- **Automatic deployments** from GitHub main branch
- **Preview deployments** for PRs
- **Environment variables** for configuration
- **Edge Network** for fast global access
- **Serverless Functions** for API routes
- **SSR support** for authenticated pages

**Key learnings:**

1. **Deployment Process**
   ```
   1. Push to GitHub main branch
   2. Vercel detects push via webhook
   3. Runs `npm run build`
   4. Deploys to edge network
   5. Returns deployment URL
   ```

2. **Environment Variables**
   - Set in Vercel dashboard
   - Different values for Production/Preview/Development
   - `NEXT_PUBLIC_*` variables exposed to browser
   - Regular variables only available server-side

3. **Build Configuration**
   ```json
   // vercel.json
   {
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "framework": "nextjs",
     "outputDirectory": ".next"
   }
   ```

4. **Vercel Functions**
   - API routes automatically become serverless functions
   - Cold start: ~100ms
   - Max duration: 10s (free tier)
   - Auto-scaling based on traffic

**Best practices:**
- ✅ Use environment variables for secrets
- ✅ Enable preview deployments for testing
- ✅ Monitor function logs in dashboard
- ✅ Use edge functions for better performance
- ✅ Set up custom domain

---

### Railway (Backend)

**What it is:** Platform for deploying backends and databases.

**How we use it:**
- **Automatic deployments** from GitHub
- **PostgreSQL database** (managed)
- **Environment variables** for configuration
- **Auto-scaling** based on traffic
- **Daily backups** for database
- **Logs & metrics** for monitoring

**Key learnings:**

1. **Deployment Process**
   ```
   1. Push to GitHub main branch
   2. Railway detects push
   3. Runs build command (npm run build)
   4. Runs start command (npm start)
   5. Deploys to Railway infrastructure
   ```

2. **Database Setup**
   - PostgreSQL service in Railway
   - Automatic connection string: `DATABASE_URL`
   - Daily backups (last 7 days)
   - Can clone database for testing

3. **Build Commands**
   ```json
   {
     "scripts": {
       "build": "tsc",
       "start": "node dist/index.js",
       "dev": "tsx watch src/index.ts"
     }
   }
   ```

4. **Migrations**
   - Run automatically on deploy
   - Add to build command: `npx prisma migrate deploy`
   - Or use Railway's start command

5. **Environment Variables**
   - `DATABASE_URL` (auto-generated by Railway)
   - `OPENAI_API_KEY`
   - `NEXTAUTH_SECRET`
   - `FRONTEND_URL` (for CORS)

**Best practices:**
- ✅ Keep migrations in version control
- ✅ Test migrations locally first
- ✅ Use Railway's database backups
- ✅ Monitor resource usage
- ✅ Set up health checks

---

## Key Architectural Patterns

### Service Layer Pattern

**What it is:** Separating business logic from API/data layers.

**How we use it:**
```
Controller/Resolver
    ↓
Service Layer (business logic)
    ↓
Repository/Prisma (data access)
    ↓
Database
```

**Example:**
```typescript
// GraphQL Resolver (thin, just calls service)
builder.queryField('getTodaysFoods', (t) =>
  t.field({
    type: [FoodType],
    resolve: async (parent, args, context) => {
      return foodService.getTodaysFoods(context);
    },
  })
);

// Service (contains business logic)
export class FoodService {
  async getTodaysFoods(context: GraphQLContext) {
    const userId = requireAuth(context);
    const { start, end } = getTodayRangeMT();

    return prisma.food.findMany({
      where: {
        userId,
        createdAt: { gte: start, lt: end },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
```

**Benefits:**
- ✅ Testable business logic
- ✅ Reusable across endpoints
- ✅ Clear separation of concerns
- ✅ Easy to mock for testing

---

### Context Pattern (Dependency Injection)

**What it is:** Passing dependencies through context.

**How we use it:**
```typescript
// Define context type
export interface GraphQLContext {
  prisma: PrismaClient;
  userId: string | null;
  isAuthenticated: boolean;
}

// Create context per request
export async function createContext(req: Request): Promise<GraphQLContext> {
  const userId = await getUserIdFromToken(req);
  return { prisma, userId, isAuthenticated: !!userId };
}

// Use in resolvers
builder.queryField('getFood', (t) =>
  t.field({
    resolve: async (parent, args, context) => {
      // context has prisma, userId, isAuthenticated
      return context.prisma.food.findUnique({
        where: { id: args.id, userId: context.userId },
      });
    },
  })
);
```

**Benefits:**
- ✅ No global state
- ✅ Easy to test (mock context)
- ✅ Request-specific data (user, tenant)
- ✅ Dependency injection built-in

---

### Repository Pattern (via Prisma)

**What it is:** Abstracting data access behind an interface.

**How we use it:**
```typescript
// Prisma is our repository
export class FoodRepository {
  async findByUserId(userId: string): Promise<Food[]> {
    return prisma.food.findMany({
      where: { userId },
    });
  }

  async create(data: CreateFoodData): Promise<Food> {
    return prisma.food.create({ data });
  }

  async update(id: string, data: UpdateFoodData): Promise<Food> {
    return prisma.food.update({
      where: { id },
      data,
    });
  }
}
```

**Benefits:**
- ✅ Database implementation hidden
- ✅ Easy to switch databases
- ✅ Mockable for testing
- ✅ Single source of truth for queries

---

### Error-First Callbacks

**What it is:** Handling errors explicitly in async code.

**Pattern:**
```typescript
// GraphQL resolver with error handling
async resolve(parent, args, context) {
  try {
    const userId = requireAuth(context);

    const result = await someOperation();

    if (!result) {
      throw new Error('Not found');
    }

    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    throw new Error('Failed to complete operation');
  }
}
```

**Benefits:**
- ✅ Explicit error handling
- ✅ Clear error messages to client
- ✅ Logging for debugging
- ✅ Graceful degradation

---

## Summary & Next Steps

### Technologies Mastered

**Frontend:**
- ✅ Next.js App Router with SSR
- ✅ React with TypeScript
- ✅ TailwindCSS for styling
- ✅ Urql for GraphQL
- ✅ NextAuth.js for authentication
- ✅ React Hook Form + Zod

**Backend:**
- ✅ GraphQL Yoga server
- ✅ Pothos schema builder
- ✅ Prisma ORM
- ✅ PostgreSQL database
- ✅ JWT authentication with Jose
- ✅ OpenAI API integration

**DevOps:**
- ✅ Vercel deployment
- ✅ Railway deployment
- ✅ Git version control
- ✅ Environment variables
- ✅ Database migrations

### Key Learnings

1. **Type Safety Throughout**
   - TypeScript on frontend and backend
   - Prisma generates types from database
   - GraphQL schema provides type safety
   - Zod validates and infers types

2. **Modern React Patterns**
   - Hooks over classes
   - Server Components where possible
   - Client Components for interactivity
   - Custom hooks for reusability

3. **GraphQL Best Practices**
   - Code-first schema with Pothos
   - Context for authentication
   - Service layer for business logic
   - Error handling with meaningful messages

4. **Authentication Flow**
   - OAuth 2.0 with Google
   - JWT tokens for stateless auth
   - Middleware for route protection
   - Context injection for user data

5. **Database Design**
   - Normalized schema with relations
   - Indexes for performance
   - Migrations for schema changes
   - Type-safe queries with Prisma

### Next Learning Steps

1. **Testing**
   - Unit tests with Jest
   - Integration tests for API
   - E2E tests with Playwright
   - Test coverage reporting

2. **Performance**
   - Query optimization
   - Caching strategies
   - Bundle size optimization
   - Lazy loading

3. **Advanced Features**
   - Real-time updates (subscriptions)
   - Offline support (PWA)
   - Background jobs
   - File uploads

4. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - User analytics
   - Logging aggregation

---

**This project demonstrates modern full-stack TypeScript development with a focus on type safety, developer experience, and production-ready patterns.**
