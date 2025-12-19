import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
    "SUA_PROJECT_URL",
    "SUA_ANON_KEY"
);

// deixa disponível para os outros arquivos JS
window.supabase = supabase;
