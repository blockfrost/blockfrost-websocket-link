# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- process exits after health check fails for more than `HEALTHCHECK_FAIL_THRESHOLD_MS` (default 60s)
- bump Blockfrost SDK (memory leak in deriveAddress)

## [2.0.0] - 2023-04-05

### Added

- report node.js memory usage on `/metrics`
- `GET_BALANCE_HISTORY` - aggregated sent/received/sentToSelf lovelace amounts for given range and groupBy param
- `hostname` field to getServerInfo response
- report health check status in `/status` (`is_healthy`)

### Fixed

- use one global newBlock listener instead of one per each connection
- logic in `onBlock` callback called on `newBlock` event
- ping-pong between a server and a client to keep connection alive

### Changed

- throw error if any of the partial calls of GetAccountInfo fails
- memoized address derivation in getAccountInfo method
- transaction (as part of `getAccountInfo` or emitted as a notification for an address subscription) no longer includes `blockInfo` field. (`block_hash`, `block_height`, `block_time` are available directly in transaction object)
- updated dependencies

## [1.0.1] - 2021-10-26

### Added

### Changed

- block listen interval

### Fixed

## [1.0.0] - 2021-10-26

### Added

- initial release
