// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./USDCMarket.sol";
import "./LiquidityMining.sol";
import "./interfaces/IOracle.sol";

/// @title USDCMarketFactory - Deploys USDC-based prediction markets
/// @author Aditya Chotaliya
contract USDCMarketFactory is Ownable, Pausable {

    uint256 public constant MIN_EXPIRATION_PERIOD = 1 hours;
    uint256 public constant MAX_EXPIRATION_PERIOD = 365 days;

    // Sepolia USDC address
    address public constant USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;

    address public oracle;
    address public feeCollector;
    uint256 public feeBps;
    LiquidityMining public liquidityMining;

    struct MarketData {
        address marketAddress;
        address creator;
        string question;
        string category;
        uint256 expirationTime;
        bool active;
    }

    mapping(bytes32 => MarketData) private _markets;
    bytes32[] private _marketIds;

    event USDCMarketCreated(
        bytes32 indexed marketId,
        address indexed market,
        address indexed creator,
        string question,
        string category,
        uint256 expirationTime
    );

    error InvalidQuestion();
    error InvalidExpiration();

    constructor(address _oracle, address _feeCollector, uint256 _feeBps, address _owner)
        Ownable(_owner) {
        oracle = _oracle;
        feeCollector = _feeCollector;
        feeBps = _feeBps;
    }

    function createMarket(
        string calldata question,
        string calldata category,
        uint256 expirationTime
    ) external whenNotPaused returns (address market, bytes32 marketId) {
        if (bytes(question).length == 0) revert InvalidQuestion();
        if (expirationTime < block.timestamp + MIN_EXPIRATION_PERIOD ||
            expirationTime > block.timestamp + MAX_EXPIRATION_PERIOD) revert InvalidExpiration();

        marketId = keccak256(abi.encodePacked(question, msg.sender, block.timestamp));

        USDCMarket m = new USDCMarket(
            marketId, question, category, expirationTime,
            oracle, feeCollector, feeBps, USDC, address(this)
        );
        market = address(m);

        if (address(liquidityMining) != address(0)) {
            m.setLiquidityMining(address(liquidityMining));
            try liquidityMining.recordCreation(msg.sender) {} catch {}
        }

        _markets[marketId] = MarketData({
            marketAddress: market,
            creator: msg.sender,
            question: question,
            category: category,
            expirationTime: expirationTime,
            active: true
        });
        _marketIds.push(marketId);

        emit USDCMarketCreated(marketId, market, msg.sender, question, category, expirationTime);
    }

    function getAllMarkets() external view returns (MarketData[] memory) {
        MarketData[] memory result = new MarketData[](_marketIds.length);
        for (uint256 i = 0; i < _marketIds.length; i++) {
            result[i] = _markets[_marketIds[i]];
        }
        return result;
    }

    function setLiquidityMining(address _lm) external onlyOwner {
        liquidityMining = LiquidityMining(payable(_lm));
    }

    function getMarketCount() external view returns (uint256) {
        return _marketIds.length;
    }
}
