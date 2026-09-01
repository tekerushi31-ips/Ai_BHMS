import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dxjopdtrtknlbrydzwaw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4am9wZHRydGtubGJyeWR6d2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxOTEyNzksImV4cCI6MjEwMzc2NzI3OX0.H3MqnrsqGxZjWasgvj936df1tzVOt4abmGOTiVylbK4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4am9wZHRydGtubGJyeWR6d2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE5MTI3OSwiZXhwIjoyMTAzNzY3Mjc5fQ._APLvNHygOgHGGwACTZ7Cen9yWYG4hX9GTQv4ad9OMg';
  return createClient(supabaseUrl, serviceRoleKey);
};

