const { createServerClient } = require("@supabase/ssr");

// function getSupabase(req, res) {
//   return createServerClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_ANON_KEY,
//     {
//       cookies: {
//         getAll: () =>
//           Object.entries(req.cookies || {}).map(([name, value]) => ({
//             name,
//             value,
//           })),
//         setAll: (cookiesToSet) => {
//           cookiesToSet.forEach(({ name, value, options }) => {
//             res.cookie(name, value, options);
//           });
//         },
//       },
//     }
//   );
// }

// module.exports = { getSupabase };

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;
