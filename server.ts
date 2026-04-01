import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Supabase Admin Client (Server-side only)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Server Environment Check:");
console.log("- SUPABASE_URL:", supabaseUrl ? "Present" : "MISSING");
console.log("- SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceRoleKey ? "Present" : "MISSING");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("CRITICAL: Supabase URL or Service Role Key is missing in environment variables.");
}

const supabaseAdmin = createClient(supabaseUrl || "", supabaseServiceRoleKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// API Routes for Admin Operations
app.get("/api/admin/health", async (_req, res) => {
  try {
    const { error } = await supabaseAdmin.from('categories').select('id').limit(1);
    if (error) throw error;
    res.json({ status: "ok", message: "Connected to Supabase with Service Role Key" });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Generic Admin Proxy (for simplicity in this example, but in production you should have specific routes)
app.post("/api/admin/query", async (req, res) => {
  const { table, action, data, query } = req.body;
  
  try {
    let result;
    if (action === 'select') {
      let q = supabaseAdmin.from(table).select(query || '*');
      if (req.body.order) q = q.order(req.body.order.column, { ascending: req.body.order.ascending });
      if (req.body.limit) q = q.limit(req.body.limit);
      result = await q;
    } else if (action === 'insert') {
      result = await supabaseAdmin.from(table).insert(data).select();
    } else if (action === 'update') {
      result = await supabaseAdmin.from(table).update(data).match(req.body.match).select();
    } else if (action === 'delete') {
      result = await supabaseAdmin.from(table).delete().match(req.body.match);
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (error: any) {
    console.error(`Admin Query Error (${table} - ${action}):`, error);
    res.status(500).json({ error: error.message });
  }
});

// Specific route for deleting users (requires auth.admin)
app.post("/api/admin/delete-user", async (req, res) => {
  const { userId } = req.body;
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Seed Database Route
app.post("/api/admin/seed", async (_req, res) => {
  try {
    const { categories, services, providers, bookings, messages } = _req.body;

    // 1. Categories
    const { data: insertedCategories, error: catError } = await supabaseAdmin
      .from('categories')
      .upsert(categories, { onConflict: 'name' })
      .select();
    if (catError) throw catError;

    const categoryMap = new Map(insertedCategories?.map(c => [c.name, c.id]) || []);

    // 2. Services
    const servicesToInsert = services.map((s: any) => ({
      ...s,
      category_id: categoryMap.get(s.category_name)
    }));
    // Remove temporary category_name
    servicesToInsert.forEach((s: any) => delete s.category_name);

    const { data: insertedServices, error: serError } = await supabaseAdmin
      .from('services')
      .upsert(servicesToInsert, { onConflict: 'title' })
      .select();
    if (serError) throw serError;

    const serviceMap = new Map(insertedServices?.map(s => [s.title, s.id]) || []);

    // 3. Providers
    const providersToInsert = providers.map((p: any) => ({
      ...p,
      service_id: serviceMap.get(p.service_title)
    }));
    providersToInsert.forEach((p: any) => delete p.service_title);

    const { data: insertedProviders, error: provError } = await supabaseAdmin
      .from('service_providers')
      .upsert(providersToInsert, { onConflict: 'email' })
      .select();
    if (provError) throw provError;

    // 4. User Profile for Demo
    const dummyUserId = '00000000-0000-0000-0000-000000000000';
    await supabaseAdmin.from('users_profile').upsert({
      id: dummyUserId,
      email: 'demo@example.com',
      full_name: 'Demo User'
    }, { onConflict: 'id' });

    // 5. Bookings
    const bookingsToInsert = bookings.map((b: any) => ({
      ...b,
      user_id: dummyUserId,
      service_id: serviceMap.get(b.service_title),
      provider_id: insertedProviders?.[0]?.id // Just use the first one for demo
    }));
    bookingsToInsert.forEach((b: any) => delete b.service_title);

    const { error: bookError } = await supabaseAdmin.from('bookings').insert(bookingsToInsert);
    if (bookError) console.warn('Booking seed warning:', bookError.message);

    // 6. Messages
    if (messages && messages.length > 0) {
      await supabaseAdmin.from('contact_messages').insert(messages);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Seed Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Clear Database Route
app.post("/api/admin/clear", async (_req, res) => {
  try {
    // Order matters because of foreign keys
    await supabaseAdmin.from('contact_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('service_providers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Clear Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa", // Use SPA mode for automatic index.html serving and routing
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
