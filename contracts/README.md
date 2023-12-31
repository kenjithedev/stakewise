# MultiStaker

## Introduction

`MultiStaker` is a smart contract designed to facilitate seamless staking operations to multiple collators through a single transaction on the EVMOS network. It allows users to easily balance their stake across multiple collators based on their preferences.

## Features

Here's a deeper look at what each feature does:

- **Approve Methods for Delegation and Withdrawal of Staking Rewards:** To interact with the EVMOS staking and distribution contracts, this contract approves certain methods on behalf of the user. These methods are necessary for delegating tokens to collators and withdrawing earned rewards.

- **Approve Specific Staking Methods:** Sometimes, the user might want to approve specific methods related to staking operations. This function allows the user to specify which methods to approve and the amount of tokens that can be used in these operations.

- **Approve All Staking Methods with the Maximum Amount of Tokens:** This feature makes it easy to approve all staking operations with the maximum amount of tokens. This means that the user can stake and unstake tokens, redelegate their stakes, and perform other related operations without having to approve each operation individually.

- **Stake Tokens on Multiple collators:** This allows a user to stake their tokens on multiple collators at once. The user provides an array of validator addresses and the corresponding amounts they wish to stake on each validator.

- **Redelegate Tokens:** This operation allows the user to redelegate their tokens from one validator to another. This can be useful in situations where a validator is not performing optimally, or if the user wants to rebalance their stakes.

- **Unstake Tokens:** This operation allows a user to unstake their tokens from multiple collators. The user provides an array of validator addresses and the corresponding amounts they wish to unstake.

- **Cancel Unbonding Delegation:** If a user changes their mind about unstaking tokens and the unstaking transaction has not yet completed, they can cancel the unbonding delegation.

- **Withdraw Rewards from Specified Validator Addresses:** This operation allows a user to withdraw their rewards from the specified validator addresses.

- **View Allowance, Delegation, Rewards, Unbonding Delegation, and Validator Data:** These are view functions that let a user see various pieces of data related to their stakes. They can check the remaining allowance for the staking contract, view details of their delegations, see their earned rewards, look at details of their unbonding delegations, and get a list of all collators they have delegated to.

These features provide the users with a comprehensive toolkit for managing their stakes in the EVMOS network, providing them the flexibility to adapt to changes and maximize their rewards.
