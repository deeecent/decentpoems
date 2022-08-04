// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract MockVRFCoordinator is VRFCoordinatorV2Interface {
    function mock_fulfillRandomness(uint256[] memory words, address fulfiller)
        external
    {
        VRFConsumerBaseV2(fulfiller).rawFulfillRandomWords(0, words);
    }

    function getRequestConfig()
        external
        view
        returns (
            uint16,
            uint32,
            bytes32[] memory
        )
    {}

    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId) {}

    function createSubscription() external returns (uint64 subId) {}

    function getSubscription(uint64 subId)
        external
        view
        returns (
            uint96 balance,
            uint64 reqCount,
            address owner,
            address[] memory consumers
        )
    {}

    function requestSubscriptionOwnerTransfer(uint64 subId, address newOwner)
        external
    {}

    function acceptSubscriptionOwnerTransfer(uint64 subId) external {}

    function addConsumer(uint64 subId, address consumer) external {}

    function removeConsumer(uint64 subId, address consumer) external {}

    function cancelSubscription(uint64 subId, address to) external {}

    function pendingRequestExists(uint64 subId) external view returns (bool) {}
}
