// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @notice Minimal price feed interface for the USD price of 1 troy ounce of gold.
interface IGoldPriceOracle {
    /// @return price the USD price of 1 troy ounce of gold, scaled by 10 ** decimals()
    /// @return updatedAt the timestamp at which `price` was last set
    function latestPrice() external view returns (uint256 price, uint256 updatedAt);

    /// @return the number of decimals `price` is scaled by
    function decimals() external view returns (uint8);
}
