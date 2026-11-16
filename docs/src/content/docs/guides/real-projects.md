---
title: Using Kaabalah in Real Projects
description: Practical patterns for CLI tools, web apps, and bots.
sidebar:
  order: 1
---

Kaabalah is just computation.

So the main differences are runtime constraints.

### Common patterns (any platform)

#### Normalize inputs

- Names: `trim()` + `toUpperCase()`.
- Dates: be explicit about time zones.

#### Make results explainable

Show the final number.

Also show the steps.

That's what makes people trust it.

#### Cache aggressively

Most outputs are deterministic.

Cache by input:

- Gematria: cache by `name`.
- Numerology: cache by `birthDate` and/or `YYYY-MM-DD`.
- Astrology: cache by `date + lat + lon + houseSystem + timeZone`.

#### Persist inputs, not just outputs

Persist raw inputs in your DB.

Recompute outputs on library upgrades.

### CLI apps

Best when you want repeatable, scriptable readings. The package already ships a `kaabalah` binary that covers every module, so start there before writing your own.

Using the built-in CLI:

- `kaabalah gematria "DAVID" --json --compact`
- `kaabalah numerology 1990-06-15 --json --compact`
- `kaabalah astrology 1990-06-15 12:30 --lat=40.7128 --lon=-74.006 --timezone=America/New_York --json --compact`
- `kaabalah iching:reading --lines 879777 --json --compact`
- `kaabalah help --json` lists every command and flag as a schema.

Output is one JSON document on stdout, errors use a stable `{ error, code, message }` shape with exit code 1, and `--language pt-BR` localizes display text. See the [CLI reference](/getting-started/cli/).

If you build your own CLI around the library:

- Parse args → compute → print JSON.
- Support `--pretty` for human output.
- Return non-zero exit code on invalid inputs, and validate calendar dates before building a `Date` (JavaScript turns `2026-02-30` into March 2).

### Web apps

#### What can run fully in the browser?

- Numerology, gematria, tarot, I Ching: yes.
- Astrology: needs Swiss Ephemeris WebAssembly.

#### SSR vs client

- SSR is great for deterministic content.
- Client is great for interactive UIs.

Practical pattern:

- Do astrology on the server.
- Ship only results to the client.

If you do astrology in the browser, follow:

- [WebAssembly Integration](/guides/webassembly/)

#### Time zone input strategy

Store:

- `localDateTime` (what user typed)
- `timeZone` (IANA like `America/New_York`)

Then compute with those.

Avoid guessing offsets.

### Bots (Discord / Telegram / Slack)

Bots work best with _short_, structured outputs.

Practical pattern:

- Keep commands idempotent.
- Store user profile (name + birth date + location).
- Use buttons to reveal "details" (steps, meanings, etc.).

Good bot features:

- `/life-path` from saved birth date
- `/gematria word:` quick lookup
- `/tarot draw:3` + meaning
- `/iching` from six stored lines

### Product design tips (new to esoterism)

You don't need to teach tradition.

You need to teach your UI.

- Start with "number + label".
- Add a one-line meaning.
- Add a "show steps" expand.
