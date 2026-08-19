// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import {Token} from "@tokenysolutions/t-rex/contracts/token/Token.sol";
import {IGoldPriceOracle} from "./interfaces/IGoldPriceOracle.sol";

/// @notice ERC-3643 (T-REX) permissioned token where 1 whole token (i.e. 10 ** decimals() base units)
/// represents a claim on 1 troy ounce of allocated gold held by the issuer.
/// @dev Transfers, minting and burning are gated by the identity registry and compliance contracts
/// wired in at `init()`, exactly as for any T-REX `Token`. This contract only adds an optional
/// read-only link to a `GoldPriceOracle` so the USD value of a balance/supply can be queried on-chain.
contract ApaxGold is Token {
    IGoldPriceOracle public priceOracle;

    event PriceOracleSet(address indexed priceOracle);

    /// @param _priceOracle address of a contract implementing IGoldPriceOracle, or the zero address to unset it
    function setPriceOracle(address _priceOracle) external onlyOwner {
        priceOracle = IGoldPriceOracle(_priceOracle);
        emit PriceOracleSet(_priceOracle);
    }

    /// @notice USD value of `_amount` base units of ApaxGold, scaled by 10 ** priceOracle.decimals()
    function valueOf(uint256 _amount) external view returns (uint256) {
        (uint256 price,) = priceOracle.latestPrice();
        return (_amount * price) / (10 ** this.decimals());
    }

    /// @notice USD value of the full circulating supply, scaled by 10 ** priceOracle.decimals()
    function totalValue() external view returns (uint256) {
        (uint256 price,) = priceOracle.latestPrice();
        return (this.totalSupply() * price) / (10 ** this.decimals());
    }
}
