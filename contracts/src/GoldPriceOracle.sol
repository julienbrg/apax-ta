// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IGoldPriceOracle} from "./interfaces/IGoldPriceOracle.sol";

/// @notice Mock, owner-fed price oracle for the USD price of 1 troy ounce of gold.
/// @dev Standalone contract so ApaxGold can be pointed at a real feed later without changing the token.
/// Pinned to the same solc version and OpenZeppelin release as the T-REX suite (see remappings.txt)
/// so it can be imported from the same compilation unit as ApaxGold.
contract GoldPriceOracle is IGoldPriceOracle, Ownable {
    uint8 public constant decimals = 8;

    uint256 private _price;
    uint256 private _updatedAt;

    event PriceUpdated(uint256 price, uint256 updatedAt);

    constructor(address initialOwner, uint256 initialPrice) {
        if (initialOwner != owner()) {
            transferOwnership(initialOwner);
        }
        _setPrice(initialPrice);
    }

    /// @param newPrice the new USD price of 1 troy ounce of gold, scaled by 10 ** decimals()
    function setPrice(uint256 newPrice) external onlyOwner {
        _setPrice(newPrice);
    }

    function latestPrice() external view returns (uint256 price, uint256 updatedAt) {
        return (_price, _updatedAt);
    }

    function _setPrice(uint256 newPrice) private {
        require(newPrice > 0, "GoldPriceOracle: price must be > 0");
        _price = newPrice;
        _updatedAt = block.timestamp;
        emit PriceUpdated(newPrice, block.timestamp);
    }
}
