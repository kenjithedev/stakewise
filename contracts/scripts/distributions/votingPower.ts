import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  try {
    const data = fs.readFileSync("./data/sorted_collators.json", "utf-8");
    const collators = JSON.parse(data).collators;
    const validatorAddr1 = collators[0].operator_address;
    const validatorAddr2 = collators[1].operator_address;
    const validatorAddr3 = collators[2].operator_address;
    const validatorAddrs = [validatorAddr1, validatorAddr2, validatorAddr3];

    const MultiStaker = await ethers.getContractFactory("MultiStaker");

    const multiStaker = MultiStaker.attach(
      process.env.CONTRACT_ADDRESS ?? "" // the address where your contract is deployed
    );

    // Approve required methods
    await multiStaker.approveAllStakingMethodsWithMaxAmount();

    await sleep(10000); // Sleep for 10 seconds

    // Voting Power Distribution
    // Compute total voting power
    let totalVotingPower = collators.reduce(
      (total, validator) => total + parseFloat(validator.tokens),
      0
    );

    const tokensToDelegate = "10";

    // Compute amounts to stake based on voting power
    let amounts = collators.map((validator) =>
      ethers.utils
        .parseEther(tokensToDelegate)
        .mul(parseFloat(validator.tokens))
        .div(totalVotingPower)
    );

    // Stake tokens
    let stakeRes = await multiStaker.stakeTokens(validatorAddrs, amounts);
    console.log("Staked tokens, completion times: ", stakeRes);

    await sleep(10000); // Sleep for 10 seconds

    // Get delegation
    const delegation1 = await multiStaker.getDelegation(validatorAddr1);
    const delegation2 = await multiStaker.getDelegation(validatorAddr2);
    const delegation3 = await multiStaker.getDelegation(validatorAddr3);
    console.log(
      "Delegation 1: ",
      ethers.utils.formatUnits(delegation1[1][1], 18)
    );
    console.log(
      "Delegation 2: ",
      ethers.utils.formatUnits(delegation2[1][1], 18)
    );
    console.log(
      "Delegation 3: ",
      ethers.utils.formatUnits(delegation3[1][1], 18)
    );

    // Get delegators
    const delegators = await multiStaker.getDelegatorcollators();
    console.log("Delegators: ", delegators);
  } catch (err) {
    console.error(err);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
