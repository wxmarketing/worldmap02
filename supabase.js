// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://jpptkbrygzcfjboicowo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcHRrYnJ5Z3pjZmpib2ljb3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjM1MTIsImV4cCI6MjA2ODgzOTUxMn0.9NjcEcUmn4-SFuWmL1E-wxf2caNrfk-eINuwNo_JUf8';
export const supabase = createClient(supabaseUrl, supabaseKey); 