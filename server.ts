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
    res.status(500).json({ error: error.message || JSON.stringify(error) || 'Unknown database error' });
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
    console.error("Delete User Error:", error);
    res.status(500).json({ error: error.message || JSON.stringify(error) || 'Failed to delete user' });
  }
});

// Seed Database Route
app.post("/api/admin/seed", async (_req, res) => {
  try {
    const { categories, services, providers, messages } = _req.body;

    // 1. Categories
    const { data: existingCats } = await supabaseAdmin.from('categories').select('*');
    const existingCatNames = new Set(existingCats?.map(c => c.name) || []);
    const newCategories = categories.filter((c: any) => !existingCatNames.has(c.name));
    
    let allCategories = [...(existingCats || [])];
    if (newCategories.length > 0) {
      const { data: insertedCategories, error: catError } = await supabaseAdmin
        .from('categories')
        .insert(newCategories)
        .select();
      if (catError) throw catError;
      allCategories.push(...(insertedCategories || []));
    }

    const categoryMap = new Map(allCategories.map(c => [c.name, c.id]));

    // 2. Services
    const { data: existingServices } = await supabaseAdmin.from('services').select('*');
    const existingServiceTitles = new Set(existingServices?.map(s => s.title) || []);
    
    const servicesToInsert = services
      .filter((s: any) => !existingServiceTitles.has(s.title))
      .map((s: any) => ({
        title: s.title,
        description: s.description,
        image_url: s.image_url,
        category_id: categoryMap.get(s.category_name)
      }));

    let allServices = [...(existingServices || [])];
    if (servicesToInsert.length > 0) {
      const { data: insertedServices, error: serError } = await supabaseAdmin
        .from('services')
        .insert(servicesToInsert)
        .select();
      if (serError) throw serError;
      allServices.push(...(insertedServices || []));
    }

    const serviceMap = new Map(allServices.map(s => [s.title, s.id]));

    // 3. Providers
    const { data: existingProviders } = await supabaseAdmin.from('service_providers').select('*');
    const existingProviderEmails = new Set(existingProviders?.map(p => p.email) || []);
    
    const providersToInsert = providers
      .filter((p: any) => !existingProviderEmails.has(p.email))
      .map((p: any) => ({
        name: p.name,
        email: p.email,
        phone: p.phone,
        experience: p.experience,
        address: p.address,
        availability: p.availability,
        service_id: serviceMap.get(p.service_title)
      }));

    let allProviders = [...(existingProviders || [])];
    if (providersToInsert.length > 0) {
      const { data: insertedProviders, error: provError } = await supabaseAdmin
        .from('service_providers')
        .insert(providersToInsert)
        .select();
      if (provError) throw provError;
      allProviders.push(...(insertedProviders || []));
    }

    // We will not seed dummy users or bookings to avoid DB FK errors and demo data corruption.
    // 4. Messages
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
    
    // 1. Delete messages
    const resMsg = await supabaseAdmin.from('contact_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (resMsg.error) throw resMsg.error;

    // 2. Delete bookings
    const resBook = await supabaseAdmin.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (resBook.error) throw resBook.error;

    // 3. Delete service_providers
    const resProv = await supabaseAdmin.from('service_providers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (resProv.error) throw resProv.error;

    // 4. Delete services
    const resServ = await supabaseAdmin.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (resServ.error) throw resServ.error;

    // 5. Delete categories
    const resCat = await supabaseAdmin.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (resCat.error) throw resCat.error;
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Clear Error:", error);
    res.status(500).json({ error: error.message || 'Error clearing database' });
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
