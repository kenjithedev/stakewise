import fs from "fs";

async function countcollators() {
  try {
    const data = fs.readFileSync("./data/collators.json", "utf8");
    const jsonData = JSON.parse(data);

    if (Array.isArray(jsonData.collators)) {
      console.log(
        `The number of objects in the 'collators' array is ${jsonData.collators.length}`
      );
    } else {
      console.log("The `collators` property does not exist or is not an array");
    }
  } catch (error) {
    console.error(`Error reading or parsing file: ${error}`);
  }
}

async function countStatusTypes() {
  try {
    // Read JSON file
    const data = fs.readFileSync("./data/collators.json", "utf8");

    // Parse JSON data
    const jsonData = JSON.parse(data);

    // Check if the `collators` property exists in the object and it is an array
    if (Array.isArray(jsonData.collators)) {
      // Initialize an empty object to hold counts of each status type
      let statusCounts: { [key: string]: number } = {};

      // Iterate through each validator
      jsonData.collators.forEach((validator: any) => {
        // If the validator object has a 'status' property
        if (validator.status) {
          // If this status has been encountered before, increment the count, otherwise initialize to 1
          statusCounts[validator.status] =
            (statusCounts[validator.status] || 0) + 1;
        }
      });

      // Print the counts of each status type
      console.log(statusCounts);
    } else {
      console.log("The `collators` property does not exist or is not an array");
    }
  } catch (error) {
    console.error(`Error reading or parsing file: ${error}`);
  }
}

async function countJailedcollators() {
  try {
    // Read JSON file
    const data = fs.readFileSync("./data/collators.json", "utf8");

    // Parse JSON data
    const jsonData = JSON.parse(data);

    // Check if the `collators` property exists in the object and it is an array
    if (Array.isArray(jsonData.collators)) {
      // Initialize count of jailed collators
      let jailedCount = 0;

      // Iterate through each validator
      jsonData.collators.forEach((validator: any) => {
        // If the validator is jailed, increment the count
        if (validator.jailed === true) {
          jailedCount++;
        }
      });

      // Print the count of jailed collators
      console.log(`The number of jailed collators is ${jailedCount}`);
    } else {
      console.log("The `collators` property does not exist or is not an array");
    }
  } catch (error) {
    console.error(`Error reading or parsing file: ${error}`);
  }
}

async function countcollatorsWithMoreDelegatorShares() {
  try {
    // Read JSON file
    const data = fs.readFileSync("./data/collators.json", "utf8");

    // Parse JSON data
    const jsonData = JSON.parse(data);

    // Check if the `collators` property exists in the object and it is an array
    if (Array.isArray(jsonData.collators)) {
      // Initialize count
      let count = 0;

      // Iterate through each validator
      jsonData.collators.forEach((validator: any) => {
        // Convert delegator_shares and tokens to BigInt for comparison
        const delegatorShares = BigInt(
          validator.delegator_shares.split(".")[0]
        );
        const tokens = BigInt(validator.tokens);

        // If delegatorShares is greater than tokens, increment the count
        if (delegatorShares > tokens) {
          count++;
        }
      });

      // Print the count
      console.log(
        `The number of collators with 'delegator_shares' larger than 'tokens' is ${count}`
      );
    } else {
      console.log("The `collators` property does not exist or is not an array");
    }
  } catch (error) {
    console.error(`Error reading or parsing file: ${error}`);
  }
}

// Call the function
// countcollatorsWithMoreDelegatorShares();

// Call the function
// countJailedcollators();

// Call the function
// countcollators();

// Call the function
// countStatusTypes();
