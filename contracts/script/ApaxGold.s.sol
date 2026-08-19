// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import {Script} from "forge-std/Script.sol";
import {ClaimTopicsRegistry} from "@tokenysolutions/t-rex/contracts/registry/implementation/ClaimTopicsRegistry.sol";
import {TrustedIssuersRegistry} from "@tokenysolutions/t-rex/contracts/registry/implementation/TrustedIssuersRegistry.sol";
import {IdentityRegistryStorage} from "@tokenysolutions/t-rex/contracts/registry/implementation/IdentityRegistryStorage.sol";
import {IdentityRegistry} from "@tokenysolutions/t-rex/contracts/registry/implementation/IdentityRegistry.sol";
import {DefaultCompliance} from "@tokenysolutions/t-rex/contracts/compliance/legacy/DefaultCompliance.sol";
import {ApaxGold} from "../src/ApaxGold.sol";
import {GoldPriceOracle} from "../src/GoldPriceOracle.sol";

/// @notice Deploys the minimal T-REX suite (identity registry + default compliance) backing ApaxGold,
/// directly as implementation contracts (no upgrade proxies) since this deployment is not meant to be upgradeable.
contract ApaxGoldScript is Script {
    string internal constant TOKEN_NAME = "Apax Gold";
    string internal constant TOKEN_SYMBOL = "APXG";
    uint8 internal constant TOKEN_DECIMALS = 18;

    uint8 internal constant ORACLE_DECIMALS = 8;
    uint256 internal constant INITIAL_GOLD_PRICE_USD = 2_650 * 10 ** ORACLE_DECIMALS;

    function run() public {
        vm.startBroadcast();
        address deployer = msg.sender;

        ClaimTopicsRegistry claimTopicsRegistry = new ClaimTopicsRegistry();
        claimTopicsRegistry.init();

        TrustedIssuersRegistry trustedIssuersRegistry = new TrustedIssuersRegistry();
        trustedIssuersRegistry.init();

        IdentityRegistryStorage identityRegistryStorage = new IdentityRegistryStorage();
        identityRegistryStorage.init();

        IdentityRegistry identityRegistry = new IdentityRegistry();
        identityRegistry.init(
            address(trustedIssuersRegistry), address(claimTopicsRegistry), address(identityRegistryStorage)
        );
        identityRegistryStorage.bindIdentityRegistry(address(identityRegistry));

        DefaultCompliance compliance = new DefaultCompliance();

        ApaxGold token = new ApaxGold();
        token.init(address(identityRegistry), address(compliance), TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, address(0));

        GoldPriceOracle oracle = new GoldPriceOracle(deployer, INITIAL_GOLD_PRICE_USD);
        token.setPriceOracle(address(oracle));

        // the token itself must be an identity registry agent to support recoveryAddress()
        identityRegistry.addAgent(address(token));
        identityRegistry.addAgent(deployer);
        token.addAgent(deployer);

        vm.stopBroadcast();
    }
}
