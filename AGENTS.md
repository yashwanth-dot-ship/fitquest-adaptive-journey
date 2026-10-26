<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules

- All user data lives in Lovable Cloud (Postgres + Supabase Auth); `src/lib/data.ts` is the only module that reads or writes tables, so the UI stays portable if the backend changes.
- Auth-protected screens live under `_authed.*` routes so the shared session guard applies; public pages (landing, login, signup) stay top-level with SSR on.
- Post-login destinations must come from a same-origin, sanitised redirect (`src/lib/redirect.ts`) — never from a caller-supplied absolute URL.
- Destructive account actions go through a confirmation step and then sign the user out, so a stale session can't write back over deleted rows.

