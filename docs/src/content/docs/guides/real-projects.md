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

Best when you want repeatable, scriptable readings.

Implementation pattern:

- Parse args → compute → print JSON.
- Support `--pretty` for human output.
- Return non-zero exit code on invalid inputs.

Example feature ideas:

- `kaabalah gematria "DAVID"`
- `kaabalah life-path --date 1990-06-15`
- `kaabalah chart --date "1990-06-15 12:30" --tz America/New_York --lat ... --lon ...`

### Web apps

#### What can run fully in the browser?

- Numerology, gematria, tarot: yes.
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

### Product design tips (new to esoterism)

You don't need to teach tradition.

You need to teach your UI.

- Start with "number + label".
- Add a one-line meaning.
- Add a "show steps" expand.
