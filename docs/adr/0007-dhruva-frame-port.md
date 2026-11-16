# Dhruva nakshatra frame: a TypeScript port, not an ayanamsa

The Ernst Wilhelm / Kala "System 1" (Dhruva) nakshatra method was supplied as a confirmed Python/Astropy implementation. The library ports it to browser-safe TypeScript (`src/astrology/jyotish/frames.ts`, `dhruva.ts`) and offers the conventional Lahiri sidereal comparison next to it.

## Context

The method measures 27 equal sectors of 40/3 degrees on the **celestial equator** from an origin anchored to the Galactic Center. It is not ecliptic longitude minus a Lahiri ayanamsa and not Swiss sidereal mode 36; a mode number alone does not establish equivalent coordinates. The reference ran in Python with Astropy, which cannot be a runtime dependency of a browser-safe npm package.

## Decision

- Constants are the supplied ones and are never fitted: Sgr A* ICRS RA 266.40499 and Dec -28.93617 degrees; `zeroRA = (GC_RA_of_date - (246 + 2/3)) mod 360`; `nakPos = (planet RA of date - zeroRA) mod 360`; pada = `floor(4 * elapsedFraction) + 1`.
- The GC anchor is transformed with the same mathematics as Astropy's `ICRS -> FK5(equinox=Time(jd, format='jd', scale='utc'))`: the USNO Circular 179 frame bias, then the bias-free IAU 2006 precession matrix, no nutation. The Julian date is read on the UTC scale and converted UTC to TAI to TT with a leap-second table.
- Planet RA comes from Swiss `SEFLG_EQUATORIAL` (apparent, true equator of date) and keeps each body's actual ecliptic latitude; the lagna is the RA of the latitude-0 tropical ASC with true obliquity; Rahu is the latitude-0 node (mean primary, true as a variant) and Ketu its antipode.
- The mixed mean (anchor) / apparent (bodies) frame is reproduced as the reference does it, not "corrected".
- The Lahiri comparison uses Swiss sidereal mode 1 with the true ayanamsa inside the same engine call. Swiss's sidereal mode is process-wide, so it is only set inside synchronous scopes that restore the defaults.
- Dasha year length is explicit per call (Dhruva 365.2422, the saved Lahiri comparison 365.25). Intervals are half-open and the first maha keeps its pre-birth start.
- The method, constants and validation statement are data (`JYOTISH_METHODS`, `DHRUVA_CONSTANTS`): placement labels reproduce 18/18 on two user-transcribed fixtures; first-major start dates keep residuals of -2.368444 and -11.501848 days under the supplied Moshier settings; no constant was fitted, exact Kala date parity is not claimed, the source PDFs were not inspected, and the Yogini convention was not matched to a Kala export.

## Consequences

- No Python or Astropy runtime. Python/Astropy remains a reference validator only; private fixtures stay out of the repository.
- Tropical rasis and tropical houses are independent of the selected nakshatra frame.
