import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
    "https://ttddyyvslxuugvleqyee.p.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0ZHl5dnNseHV1Z3ZsZXF5ZWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNzQ2MzcsImV4cCI6MjA4MTc1MDYzN30.HDMVN3667UhB6M3w-3apemqQBd6r-kmw4jENn6YF_HM"
);

// deixa disponível para os outros arquivos JS
window.supabase = supabase;
