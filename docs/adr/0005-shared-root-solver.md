# One signed-angle root solver for exact events

Exact transit aspects, planetary returns (solar, lunar, Jupiter, Saturn, nodal), Uranus oppositions and the solar return instant all answer the same question: when does `longitude(t)` equal a target angle? They share one primitive, `findAngularRoots` in `src/astrology/root-solver.ts`, instead of each feature carrying its own search.

## Context

The previous transit search scanned a coarse grid, detected a local minimum of the orb and refined it with a ternary search to about one minute. It accepted any minimum whose residual was inside the display orb, so a closest approach (a station that never reached the aspect) was reported as an exact `exactDate`. It also tracked only the single closest aspect per step. The solar return bracket stopped below 60 seconds.

## Considered Options

- **Keep minimising the orb and tighten the tolerance** - cannot tell a crossing from a near miss, and misses close double passes.
- **Symbolic or analytic root finding** - not available for ephemeris-backed bodies.
- **Signed-angle bracketing with station insertion and bisection** - chosen.

## Decision

- Roots are found on the signed difference normalised to (-180, 180], never by minimising an orb. A wrap discontinuity is distinguished from a crossing.
- Velocity-zero stations (speed sign changes between grid points) are inserted into the grid so that tangent touches and close double passes are recovered. Roots are deduplicated.
- Every emitted root is verified against an explicit angular tolerance (default `1e-6` degrees) and carries its residual, final bracket width in seconds (default `0.001`), iteration count, direction and a method descriptor. Display orb, root residual and time tolerance are three separate things.
- Closest approaches are a separate, optional result kind (`kind: "closest-approach"`); they are never labelled exact.
- Scan steps are per body: at most 0.25 day for the fast bodies, at most 2 days for any body (`MAX_BODY_SCAN_STEP_DAYS`).
- The search coverage is qualified, not claimed complete: it is a finite-grid, station-aware numerical search, and two velocity-zero crossings hidden inside one grid step are not formally excluded. The wording is part of every result (`ROOT_SEARCH_COVERAGE_NOTE`).
- The solver is ephemeris-agnostic (any monotone day-valued coordinate); `returns.ts` supplies Swiss-backed samplers with sub-second linear extrapolation from the whole-second floor.
- Solved instants are UTC. Charts cast at a solved instant use `treatAsUTC`.

## Consequences

- `exactDate` and `exactOrb` changed meaning for legacy callers (instant of a verified root; residual instead of display orb), and the solar return precision rose from under 60 seconds to 0.001 second. See the migration guide.
- Same-files cross-checks against pyswisseph validate the binding and the solver, not the ephemeris model.
- Adding a new event kind means adding a longitude sampler, not a new search.
