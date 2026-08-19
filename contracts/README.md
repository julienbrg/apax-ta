## ApaxGold

`ApaxGold` (`src/ApaxGold.sol`) is a permissioned token where 1 whole token (18 decimals) represents
a claim on 1 troy ounce of allocated gold. It implements the **ERC-3643** (T-REX) standard rather
than a plain ERC-20, so every transfer, mint and burn is gated by on-chain identity verification and
compliance checks instead of being freely transferable to any address.

### Why T-REX instead of a hand-rolled ERC-3643

ERC-3643 is a standard, not a single contract — a compliant deployment needs a token plus an
identity registry, a compliance contract, a claim topics registry and a trusted issuers registry,
all talking to [OnchainID](https://github.com/onchain-id/solidity) identities. Rather than
re-implement that surface, `ApaxGold` extends Tokeny's audited, reference `Token` contract from the
[T-REX suite](https://github.com/TokenySolutions/T-REX) unmodified, and only adds what's specific to
this token: a link to a price oracle and two read-only USD-value helpers (`valueOf`, `totalValue`).
All the permissioning logic (agent-only mint/burn/freeze/pause/forced-transfer, identity-registry-gated
`transfer`) is inherited as-is from `Token`.

### Contracts

- **`src/ApaxGold.sol`** — the token. `is Token` from T-REX, plus `priceOracle`, `setPriceOracle`,
  `valueOf` and `totalValue`.
- **`src/GoldPriceOracle.sol`** — a standalone, owner-fed mock price feed for the USD price of 1 oz
  of gold (8 decimals, Chainlink-style). Kept separate from the token so it can be swapped for a real
  feed later without touching `ApaxGold`.
- **`script/ApaxGold.s.sol`** — deploys the minimal T-REX stack the token needs (`ClaimTopicsRegistry`,
  `TrustedIssuersRegistry`, `IdentityRegistryStorage`, `IdentityRegistry`, `DefaultCompliance`) plus
  `ApaxGold` and `GoldPriceOracle`, and wires them together. Contracts are deployed directly
  (no upgrade proxies) since this deployment isn't meant to be upgradeable.
- **`test/ApaxGold.t.sol`** — deploys the same stack plus two OnchainID identities and a claim issuer,
  issues each investor a signed KYC claim, and exercises the identity-gated transfer/mint path,
  pause/freeze, and the oracle-based valuation helpers.

### Dependency versions

T-REX 4.1.6 is built on OpenZeppelin Contracts (and Contracts-Upgradeable) `^4.8.3`, which is not
API-compatible with newer OpenZeppelin major versions (e.g. `Ownable`'s constructor signature
changed in v5). `remappings.txt` pins `@openzeppelin/contracts` and `@openzeppelin/contracts-upgradeable`
to `v4.8.3` copies (`lib/openzeppelin-contracts-4.8.3`, `lib/openzeppelin-contracts-upgradeable-4.8.3`)
so the whole T-REX / OnchainID / ApaxGold import graph compiles as a single, consistent unit.

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/ApaxGold.s.sol:ApaxGoldScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
