# Architecture rules
- Keep external JWT generation/auth APIs unchanged; Cloud Skills requests validate the external bearer token server-side before deriving identity.
- Store Skills, space membership and skill selections in Cloud, never client storage; enforce ownership and membership in the server function.
- Preserve existing local project IDs and conversation assignments when renaming their presentation to spaces.
- Uploaded skill content is immutable; activation, scope and visibility are separate from content. Never execute archive scripts.