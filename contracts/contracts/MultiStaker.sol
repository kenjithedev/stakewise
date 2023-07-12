// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "./ParachainStaking.sol";

contract MultiStaker {
    /// @dev stake a given amount of tokens.
    /// @param _candidates The array of candidate addresses.
    /// @param _amounts The array of amounts of tokens to stake.
    function stakeTokens(
        address[] memory _candidates,
        uint256[] memory _amounts
    ) public {
        require(
            _candidates.length == _amounts.length,
            "Address and amount arrays must have the same length"
        );

        for (uint256 i = 0; i < _candidates.length; i++) {
            uint32 candidateDelegationCount = PARACHAIN_STAKING_CONTRACT
                .candidateDelegationCount(_candidates[i]);
            uint256 delegatorDelegationCount = PARACHAIN_STAKING_CONTRACT
                .delegatorDelegationCount(msg.sender);
            PARACHAIN_STAKING_CONTRACT.delegate(
                _candidates[i],
                _amounts[i],
                candidateDelegationCount,
                delegatorDelegationCount
            );
        }
    }

    /// @dev Returns the delegation amount for a given candidate for the msg sender.
    /// @param _candidate The address of the candidate.
    /// @return The delegation amount for a given candidate for the msg sender.
    function getDelegationAmount(
        address _candidate
    ) public view returns (uint256) {
        return
            PARACHAIN_STAKING_CONTRACT.delegationAmount(msg.sender, _candidate);
    }
}
