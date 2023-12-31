import {
  Box,
  Button,
  HStack,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import styles from "@styles/Home.module.css";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useSigner,
} from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import MultiStaker from "@data/MultiStaker.json";
import collatorsMap from "@data/collatorsMap.json";
import { useModal } from "connectkit";
import { useRouter } from "next/router";
import { useToast } from "@chakra-ui/react";

function Home() {
  const address = useAccount();
  const router = useRouter();
  const { setOpen } = useModal();
  const { data: signer } = useSigner();
  const [selectedCollators, setSelectedCollators] = useState<string[]>([]);
  const [delegatedCollators, setDelegatedCollators] = useState<any[]>([]);
  const [delegationsMap, setDelegationsMap] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const handleValidatorCheck = (operator_address: string) => {
    if (selectedCollators.includes(operator_address)) {
      setSelectedCollators(
        selectedCollators.filter((item) => item !== operator_address)
      );
    } else {
      setSelectedCollators([...selectedCollators, operator_address]);
    }
  };

  const fetchCollators = useCallback(async () => {
    try {
      const contract = new ethers.Contract(
        "0x02a85c9E6D859eAFAC44C3c7DD52Bbe787e54d0A",
        MultiStaker.abi,
        signer
      );
      const contractWithSigner = contract.connect(signer);
      const result = await contractWithSigner.getDelegatorCollators();
      const fetchedCollators = result.map((v) => CollatorsMap[v]);
      setDelegatedCollators(fetchedCollators);
    } catch (e) {
      console.log(e);
    }
  }, [signer]);

  const fetchDelegation = useCallback(async () => {
    try {
      const contract = new ethers.Contract(
        "0x02a85c9E6D859eAFAC44C3c7DD52Bbe787e54d0A",
        MultiStaker.abi,
        signer
      );

      const contractWithSigner = contract.connect(signer);

      const tempMap = {};
      for (let i = 0; i < delegatedCollators.length; i++) {
        const result = await contractWithSigner.getDelegation(
          delegatedCollators[i].operator_address
        );
        const formattedResult = ethers.utils.formatUnits(result[1][1], 18);
        tempMap[delegatedCollators[i].operator_address] = formattedResult;
      }
      setDelegationsMap(tempMap);
    } catch (e) {
      console.log(e);
    }
  }, [delegatedCollators, signer]);

  const { config: unstakeConfig } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as any,
    abi: MultiStaker.abi,
    functionName: "unstakeTokens",
    args: [
      selectedCollators,
      selectedCollators.map((v) => ethers.utils.parseEther(delegationsMap[v])),
    ],
  });

  const {
    data: unstakeTxn,
    isLoading: isUnstakeLoading,
    isSuccess: isUnstakeSuccess,
    write: unstake,
  } = useContractWrite(unstakeConfig);

  const handleUnstakeTokens = useCallback(() => {
    if (selectedCollators.length === 0) {
      toast({
        position: "bottom",
        render: () => (
          <Box p={3} className={styles.toast}>
            Please select at least one validator to unstake from.
          </Box>
        ),
      });
    } else {
      unstake?.();
    }
  }, [selectedCollators.length, toast, unstake]);

  const { config: withdrawConfig } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as any,
    abi: MultiStaker.abi,
    functionName: "withdrawRewards",
    args: [selectedCollators],
  });

  const {
    data: withdrawTxn,
    isLoading: isWithdrawLoading,
    isSuccess: isWithdrawSuccess,
    write: withdraw,
  } = useContractWrite(withdrawConfig);

  // TODO: implement better unstake and withdraw flow
  const handleWithdrawRewards = useCallback(() => {
    // if (selectedCollators.length === 0) {
    toast({
      position: "bottom",
      render: () => (
        <Box p={3} className={styles.toast}>
          Feature coming soon. Stay tuned!
        </Box>
      ),
    });
    // } else {
    //   withdraw?.();
    // }
  }, [toast]);

  useEffect(() => {
    if (isUnstakeSuccess)
      toast({
        position: "bottom",
        render: () => (
          <Box p={3} className={styles.toast}>
            Unstake successful!
          </Box>
        ),
      });
  }, [isUnstakeSuccess, toast]);

  useEffect(() => {
    if (isWithdrawSuccess)
      toast({
        position: "bottom",
        render: () => (
          <Box p={3} className={styles.toast}>
            Withdraw successful!
          </Box>
        ),
      });
  }, [isWithdrawSuccess, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchCollators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer]);

  useEffect(() => {
    fetchDelegation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegatedCollators]);

  if (!address.address) {
    return (
      <main className={styles.nullMain}>
        <VStack>
          <Text className={styles.nullText}>
            Connect your wallet to enter the app
          </Text>
          <Button className={styles.button} onClick={() => setOpen(true)}>
            Connect wallet
          </Button>
        </VStack>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <VStack className={styles.container}>
        <Box h="1rem" />
        <HStack w="100%" justifyContent="space-around">
          <Text>Your current delegation</Text>
        </HStack>
        <HStack>
          {isLoading ? (
            <VStack h="480px" justifyContent="center">
              <Spinner size="lg" />
            </VStack>
          ) : delegatedCollators && delegatedCollators.length > 0 ? (
            <TableContainer height="480px" overflowY="scroll">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Validator</Th>
                    <Th>Tokens</Th>
                    <Th>Commission</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {delegatedCollators &&
                    Object.keys(delegationsMap).length > 0 &&
                    delegatedCollators
                      .filter(
                        (v) =>
                          Number(delegationsMap[v.operator_address]) > 0.0001
                      )
                      .map(({ operator_address, description, commission }) => (
                        <Tr
                          key={operator_address}
                          onClick={() => handleValidatorCheck(operator_address)}
                          className={
                            selectedCollators.includes(operator_address)
                              ? styles.selected
                              : undefined
                          }
                        >
                          <Td>{description.moniker}</Td>
                          <Td>
                            {Number(delegationsMap[operator_address]).toFixed(
                              4
                            )}
                          </Td>
                          <Td isNumeric>
                            {(
                              Number(commission.commission_rates.rate) * 100
                            ).toFixed(2)}
                            %
                          </Td>
                        </Tr>
                      ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <VStack
              h="480px"
              w="300px"
              justifyContent="center"
              textAlign="center"
            >
              <Text>
                You have no delegations on EVMOS. Please stake to continue.
              </Text>
            </VStack>
          )}
        </HStack>
        <Box h=".5rem" />
        <HStack>
          <Button
            className={styles.homeBtn}
            onClick={() => {
              router.push("/stake");
            }}
          >
            Stake
          </Button>
          <Button className={styles.homeBtn} onClick={handleUnstakeTokens}>
            {isUnstakeLoading ? <Spinner color="white" /> : "Unstake"}
          </Button>
          <Button className={styles.homeBtn} onClick={handleWithdrawRewards}>
            {isWithdrawLoading ? <Spinner color="white" /> : "Withdraw Rewards"}
          </Button>
        </HStack>
      </VStack>
    </main>
  );
}

export default Home;
