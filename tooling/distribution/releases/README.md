# Reviewed local delivery baselines

These records lock artifacts already delivered for authorized local verification.
They do not represent npm publication. The initial component candidate.4 / MCP
candidate.1 pair came from PR #199's reviewed clean source commit
`3901d8e310c9bd3689dbaf39a12b7ec7f86365d1` and was merged as `8510225`.
Its original tarball SHA-512 values were verified before capturing the baseline.

Records contain original artifact identities, emitted declarations, public Token
names and runtime hashes, without font binaries or business imagery.
Never edit or remove an existing record; CI compares its bytes with the base
revision. Add a record only after reviewing the actual paired artifacts and
successful consumer receipts using `pnpm record:distribution-delivery`.
See [the upgrade procedure](../../../packages/design-system/UPGRADING.md).
