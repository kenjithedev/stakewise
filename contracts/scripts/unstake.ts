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
    const validatorAddr = collators[0].operator_address;
    const collatorsrcAddr = collators[1].operator_address;
    const validatorDstAddr = collators[2].operator_address;
    const validatorAddrs = [validatorAddr, collatorsrcAddr, validatorDstAddr];

    const MultiStaker = await ethers.getContractFactory("MultiStaker");

    const multiStaker = MultiStaker.attach(
      process.env.CONTRACT_ADDRESS ?? "" // the address where your contract is deployed
    );

    // Stake tokens
    const amounts = [
      ethers.utils.parseEther("0.001"),
      ethers.utils.parseEther("0.001"),
      ethers.utils.parseEther("0.001"),
    ];

    // Unstake tokens
    let unstakeRes = await multiStaker.unstakeTokens(
      [validatorDstAddr],
      [amounts[0]]
    );
    console.log("Unstaked tokens, completion times: ", unstakeRes);
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
