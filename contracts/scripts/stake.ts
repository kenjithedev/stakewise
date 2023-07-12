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

    const amounts = [
      ethers.utils.parseEther("0.001"),
      ethers.utils.parseEther("0.001"),
      ethers.utils.parseEther("0.001"),
    ];

    // Stake tokens
    let stakeRes = await multiStaker.stakeTokens(validatorAddrs, amounts);
    console.log("Staked tokens, completion times: ", stakeRes);

    await sleep(10000); // Sleep for 10 seconds

    // Get delegation amount
    const delegation1 = await multiStaker.getDelegationAmount(validatorAddr1);
    const delegation2 = await multiStaker.getDelegationAmount(validatorAddr2);
    const delegation3 = await multiStaker.getDelegationAmount(validatorAddr3);
    console.log("Delegation 1: ", ethers.utils.formatUnits(delegation1, 18));
    console.log("Delegation 2: ", ethers.utils.formatUnits(delegation2, 18));
    console.log("Delegation 3: ", ethers.utils.formatUnits(delegation3, 18));
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
