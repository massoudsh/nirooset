// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EnergyToken.sol";
import "../src/PanelNFT.sol";
import "../src/PanelRegistry.sol";
import "../src/StakingVault.sol";
import "../src/EnergyOracle.sol";
import "../src/EnergyMarket.sol";
import "../src/SettlementEngine.sol";
import "../src/GovernanceDAO.sol";

/**
 * @title Deploy
 * @notice Deploys the full GRIDSET contract suite. Run with:
 *   forge script script/Deploy.s.sol --rpc-url <RPC> [--broadcast --private-key <KEY>]
 *   For local Anvil: forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
 * Output addresses to ui/.env (VITE_*_ADDRESS) for the web UI.
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80) // anvil default #0
        );

        vm.startBroadcast(deployerPrivateKey);

        EnergyToken token = new EnergyToken();
        PanelNFT panelNFT = new PanelNFT();
        PanelRegistry panelRegistry = new PanelRegistry();
        StakingVault stakingVault = new StakingVault(token);
        EnergyOracle energyOracle = new EnergyOracle();
        EnergyMarket energyMarket = new EnergyMarket(token);
        SettlementEngine settlementEngine = new SettlementEngine(token, energyMarket);
        GovernanceDAO governanceDAO = new GovernanceDAO(token);

        // Optional: set deployer as minter/registrar for local testing
        address deployer = vm.addr(deployerPrivateKey);
        token.setMinter(deployer, true);
        token.setLocker(address(settlementEngine), true);
        token.setLocker(address(energyMarket), true); // EnergyMarket locks/unlocks on placeBid/placeAsk/clear/cancel
        panelNFT.setMinter(deployer, true);
        panelRegistry.setPanelNFT(address(panelNFT));
        panelRegistry.setRegistrar(deployer, true);
        panelRegistry.setReporter(deployer, true);
        stakingVault.setPenalizer(deployer, true);
        settlementEngine.setPenalizer(deployer, true);
        // Optional: energyOracle.setConfirmer(confirmerAddr) for two-step finalization (confirm then finalize); see DEPLOYMENT.md

        vm.stopBroadcast();

        // Log addresses for UI .env
        console.log("ENERGY_TOKEN=%s", address(token));
        console.log("PANEL_NFT=%s", address(panelNFT));
        console.log("PANEL_REGISTRY=%s", address(panelRegistry));
        console.log("STAKING_VAULT=%s", address(stakingVault));
        console.log("ENERGY_ORACLE=%s", address(energyOracle));
        console.log("ENERGY_MARKET=%s", address(energyMarket));
        console.log("SETTLEMENT_ENGINE=%s", address(settlementEngine));
        console.log("GOVERNANCE_DAO=%s", address(governanceDAO));
    }
}
