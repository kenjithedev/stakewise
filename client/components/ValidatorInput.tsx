import { VStack, Input, Text, HStack } from "@chakra-ui/react";
import { useCallback } from "react";
import styles from "@styles/Home.module.css";

function ValidatorInput({
  numCollators,
  setNumCollators,
  maxCollators,
  setError,
}) {
  const handleNumCollatorsChange = useCallback(
    (event) => {
      const newValue = parseInt(event.target.value, 10);
      if (newValue > 0 && newValue <= maxCollators) {
        setError("");
      } else {
        setError(
          `Input must be greater than 0 and less than or equal to ${maxCollators}.`
        );
      }
      setNumCollators(newValue);
    },
    [maxCollators, setNumCollators, setError]
  );

  return (
    <VStack pt="3rem">
      <Text className={styles.title}>
        Choose the number of collators to stake your DEV with
      </Text>
      <VStack p="2rem">
        <HStack className={styles.inputContainer}>
          <Input
            value={numCollators}
            onChange={handleNumCollatorsChange}
            placeholder="0"
            type="number"
            _placeholder={{ color: "rgba(255, 255, 255, 0.25)" }}
            className={styles.validatorInput}
          />
        </HStack>
        <Text className={styles.amountInputUnit}>Collators</Text>
        <Text className={styles.subtitle}>
          Note: There are currently 300 collators on DEV. Selecting more
          collators can help promote decentralization.
        </Text>
      </VStack>
    </VStack>
  );
}

export default ValidatorInput;
