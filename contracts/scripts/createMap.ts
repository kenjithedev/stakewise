import fs from "fs";

interface Validator {
  operator_address: string;
  [key: string]: any;
}

// Load collators JSON file
const rawJson = fs.readFileSync("./data/collators.json", "utf-8");
const data = JSON.parse(rawJson);

// Create a new map object
const collatorsMap: Record<string, Validator> = {};

// Populate the map object
data.collators.forEach((validator: Validator) => {
  collatorsMap[validator.operator_address] = validator;
});

// Save the map to a new JSON file
fs.writeFileSync(
  "./data/collatorsMap.json",
  JSON.stringify(collatorsMap, null, 2)
);
