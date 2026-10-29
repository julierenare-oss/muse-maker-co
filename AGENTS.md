# Architecture rules
- Keep external JWT generation/auth APIs unchanged; Cloud Skills requests validate the external bearer token server-side before deriving identity.
- Store Skills, space membership and skill selections in Cloud, never client storage; enforce ownership and membership in the server function.
- Preserve existing local project IDs and conversation assignments when renaming their presentation to spaces.
- Uploaded skill content is immutable; activation, scope and visibility are separate from content. Never execute archive scripts.
- Resolve selected Skills through the Cloud function in the shared generation API for every modality; keep the displayed user prompt unchanged and pass space context explicitly from the workspace.
- Use a shared Skills query and importer across the catalog and chat settings so mutations refresh every visible selector.
- Store personal prompt libraries in Cloud behind external JWT validation and server-derived account/owner filters; use one shared query and save dialog across both chat views and the library to keep saved prompts consistent.