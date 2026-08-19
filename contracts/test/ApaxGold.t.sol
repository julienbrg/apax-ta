// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import {Test} from "forge-std/Test.sol";
import {ClaimTopicsRegistry} from "@tokenysolutions/t-rex/contracts/registry/implementation/ClaimTopicsRegistry.sol";
import {TrustedIssuersRegistry} from "@tokenysolutions/t-rex/contracts/registry/implementation/TrustedIssuersRegistry.sol";
import {IdentityRegistryStorage} from "@tokenysolutions/t-rex/contracts/registry/implementation/IdentityRegistryStorage.sol";
import {IdentityRegistry} from "@tokenysolutions/t-rex/contracts/registry/implementation/IdentityRegistry.sol";
import {DefaultCompliance} from "@tokenysolutions/t-rex/contracts/compliance/legacy/DefaultCompliance.sol";
import {IClaimIssuer} from "@onchain-id/solidity/contracts/interface/IClaimIssuer.sol";
import {Identity} from "@onchain-id/solidity/contracts/Identity.sol";
import {ClaimIssuer} from "@onchain-id/solidity/contracts/ClaimIssuer.sol";
import {ApaxGold} from "../src/ApaxGold.sol";
import {GoldPriceOracle} from "../src/GoldPriceOracle.sol";

contract ApaxGoldTest is Test {
    uint256 internal constant CLAIM_TOPIC = uint256(keccak256("APAX_KYC_APPROVED"));
    uint8 internal constant ORACLE_DECIMALS = 8;
    uint256 internal constant GOLD_PRICE_USD = 2_650 * 10 ** ORACLE_DECIMALS;

    IdentityRegistry internal identityRegistry;
    DefaultCompliance internal compliance;
    ApaxGold internal token;
    GoldPriceOracle internal oracle;
    ClaimIssuer internal claimIssuer;

    uint256 internal claimSignerKey;
    address internal claimSigner;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal outsider = makeAddr("outsider");

    Identity internal aliceIdentity;
    Identity internal bobIdentity;

    function setUp() public {
        ClaimTopicsRegistry claimTopicsRegistry = new ClaimTopicsRegistry();
        claimTopicsRegistry.init();

        TrustedIssuersRegistry trustedIssuersRegistry = new TrustedIssuersRegistry();
        trustedIssuersRegistry.init();

        IdentityRegistryStorage identityRegistryStorage = new IdentityRegistryStorage();
        identityRegistryStorage.init();

        identityRegistry = new IdentityRegistry();
        identityRegistry.init(
            address(trustedIssuersRegistry), address(claimTopicsRegistry), address(identityRegistryStorage)
        );
        identityRegistryStorage.bindIdentityRegistry(address(identityRegistry));

        compliance = new DefaultCompliance();

        token = new ApaxGold();
        token.init(address(identityRegistry), address(compliance), "Apax Gold", "APXG", 18, address(0));

        oracle = new GoldPriceOracle(address(this), GOLD_PRICE_USD);
        token.setPriceOracle(address(oracle));

        identityRegistry.addAgent(address(token));
        identityRegistry.addAgent(address(this));
        token.addAgent(address(this));

        claimTopicsRegistry.addClaimTopic(CLAIM_TOPIC);

        address claimIssuerKey = makeAddr("claimIssuerKey");
        claimIssuer = new ClaimIssuer(claimIssuerKey);
        (claimSigner, claimSignerKey) = makeAddrAndKey("claimSigner");
        vm.prank(claimIssuerKey);
        claimIssuer.addKey(keccak256(abi.encode(claimSigner)), 3, 1);

        uint256[] memory topics = new uint256[](1);
        topics[0] = CLAIM_TOPIC;
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(address(claimIssuer)), topics);

        aliceIdentity = new Identity(alice, false);
        bobIdentity = new Identity(bob, false);
        _issueClaim(aliceIdentity, alice);
        _issueClaim(bobIdentity, bob);

        identityRegistry.registerIdentity(alice, aliceIdentity, 42);
        identityRegistry.registerIdentity(bob, bobIdentity, 33);

        token.unpause();
        token.mint(alice, 1_000 ether);
        token.mint(bob, 500 ether);
    }

    function _issueClaim(Identity identity, address identityOwner) internal {
        bytes memory data = "KYC approved by Apax";
        bytes32 dataHash = keccak256(abi.encode(address(identity), CLAIM_TOPIC, data));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(claimSignerKey, prefixedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(identityOwner);
        identity.addClaim(CLAIM_TOPIC, 1, address(claimIssuer), signature, data, "");
    }

    function test_MintedBalancesOfVerifiedInvestors() public view {
        assertEq(token.balanceOf(alice), 1_000 ether);
        assertEq(token.balanceOf(bob), 500 ether);
    }

    function test_TransferBetweenVerifiedInvestorsSucceeds() public {
        vm.prank(alice);
        token.transfer(bob, 100 ether);

        assertEq(token.balanceOf(alice), 900 ether);
        assertEq(token.balanceOf(bob), 600 ether);
    }

    function test_TransferToUnverifiedAddressReverts() public {
        vm.prank(alice);
        vm.expectRevert("Transfer not possible");
        token.transfer(outsider, 1 ether);
    }

    function test_MintToUnverifiedAddressReverts() public {
        vm.expectRevert("Identity is not verified.");
        token.mint(outsider, 1 ether);
    }

    function test_ValueOfOneOunce() public view {
        assertEq(token.valueOf(1 ether), GOLD_PRICE_USD);
    }

    function test_TotalValueTracksSupplyAndPrice() public {
        assertEq(token.totalValue(), 1_500 * GOLD_PRICE_USD);

        vm.prank(alice);
        token.transfer(bob, 100 ether);
        assertEq(token.totalValue(), 1_500 * GOLD_PRICE_USD);

        oracle.setPrice(2_700 * 10 ** ORACLE_DECIMALS);
        assertEq(token.totalValue(), 1_500 * 2_700 * 10 ** ORACLE_DECIMALS);
    }

    function test_OnlyOwnerCanSetPriceOracle() public {
        vm.prank(alice);
        vm.expectRevert();
        token.setPriceOracle(address(0));
    }

    function test_OnlyOracleOwnerCanSetPrice() public {
        vm.prank(alice);
        vm.expectRevert();
        oracle.setPrice(1);
    }

    function test_PausedTokenBlocksTransfers() public {
        token.pause();

        vm.prank(alice);
        vm.expectRevert("Pausable: paused");
        token.transfer(bob, 1 ether);
    }

    function test_FrozenWalletBlocksTransfers() public {
        token.setAddressFrozen(alice, true);

        vm.prank(alice);
        vm.expectRevert("wallet is frozen");
        token.transfer(bob, 1 ether);
    }
}
