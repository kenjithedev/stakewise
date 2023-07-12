import {
  Box,
  Button,
  HStack,
  Link,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import styles from "@styles/Home.module.css";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useSigner,
} from "wagmi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BigNumber, ethers } from "ethers";
import MultiStaker from "@data/MultiStaker.json";
import collators from "@data/collators.json";
import collatorsMap from "@data/collatorsMap.json";
import { useModal } from "connectkit";
import AdvancedSelection from "@components/AdvancedSelection";
import ProgressBar from "@components/ProgressBar";
import BasicSelection from "@components/BasicSelection";
import AmountInput from "@components/AmountInput";
import ValidatorInput from "@components/ValidatorInput";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import Confirmation from "@components/Confirmation";
import { useRouter } from "next/router";
import SuccessLottie from "@components/SuccessAnimation";
import Success from "@components/Success";

function Home() {
  const address = useAccount();
  const { setOpen } = useModal();
  const router = useRouter();
  const { data: signer } = useSigner();
  const [amount, setAmount] = useState("");
  const [numcollators, setNumcollators] = useState();
  const [selectedcollators, setSelectedcollators] = useState<string[]>([]);
  const [delegatedcollators, setDelegatedcollators] = useState<any[]>([]);
  const [delegationsMap, setDelegationsMap] = useState<any>({});
  const [selectedGroup, setSelectedGroup] = useState("");
  const [percentile, setPercentile] = useState([25, 75]);
  const [selectedSorting, setSelectedSorting] = useState("desc_tokens");
  const [sortedcollators, setSortedcollators] = useState(collators);
  const [filteredcollators, setFilteredcollators] = useState(collators);
  const [filter, setFilter] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [fiatAmount, setFiatAmount] = useState(0);
  const [inputWidth, setInputWidth] = useState("1ch");
  const [fontSize, setFontSize] = useState("48px");
  const [isAdvancedSelection, setAdvancedSelection] = useState(false);
  const [allowance, setAllowance] = useState<BigNumber>();
  const [approved, setApproved] = useState<boolean>(false);
  const [isApproveLoading, setApprovedLoading] = useState<boolean>(false);

  const handleValidatorCheck = useCallback(
    (operator_address: string) => {
      if (selectedcollators.includes(operator_address)) {
        setSelectedcollators(
          selectedcollators.filter((item) => item !== operator_address)
        );
      } else {
        setSelectedcollators([...selectedcollators, operator_address]);
      }
    },
    [selectedcollators]
  );

  const handleSelectedGroupChange = useCallback(
    (group) => {
      setSelectedGroup(group);
      let selected;
      const num = Number(numcollators);
      switch (group) {
        case "top":
          selected = sortedcollators.slice(0, num);
          break;
        case "median":
          const middle = Math.floor(sortedcollators.length / 2);
          const start = Math.max(middle - Math.floor(num / 2), 0);
          selected = sortedcollators.slice(start, start + num);
          break;
        case "bottom":
          selected = sortedcollators.slice(-num);
          break;
        case "random":
          selected = [];
          while (selected.length < num) {
            const randomValidator =
              sortedcollators[
                Math.floor(Math.random() * sortedcollators.length)
              ];
            if (!selected.includes(randomValidator)) {
              selected.push(randomValidator);
            }
          }
          break;
        default:
          selected = [];
      }
      setSelectedcollators(
        selected.map((validator) => validator.operator_address)
      );
    },
    [numcollators, sortedcollators]
  );

  const handleRangeConfirm = useCallback(() => {
    if (!numcollators) return;
    const start = Math.floor((sortedcollators.length * percentile[0]) / 100);
    const end = Math.floor((sortedcollators.length * percentile[1]) / 100);
    const rangecollators = sortedcollators.slice(start, end);

    let selected = [];
    while (selected.length < numcollators) {
      const randomValidator =
        rangecollators[Math.floor(Math.random() * rangecollators.length)];
      if (!selected.includes(randomValidator)) {
        selected.push(randomValidator);
      }
    }
    setSelectedcollators(
      selected.map((validator) => validator.operator_address)
    );
  }, [numcollators, percentile, sortedcollators]);

  const dividedAmount = selectedcollators.length
    ? ethers.utils.parseEther(amount).div(selectedcollators.length)
    : ethers.utils.parseEther("0");

  const fetchAllowance = useCallback(async () => {
    try {
      const contract = new ethers.Contract(
        "0x02a85c9E6D859eAFAC44C3c7DD52Bbe787e54d0A",
        MultiStaker.abi,
        signer
      );
      const contractWithSigner = contract.connect(signer);
      const result = await contractWithSigner.getAllowance();
      setAllowance(result);
    } catch (e) {
      console.log(e);
    }
  }, [signer]);

  const handleApprove = useCallback(async () => {
    setApprovedLoading(true);
    try {
      const contract = new ethers.Contract(
        "0x02a85c9E6D859eAFAC44C3c7DD52Bbe787e54d0A",
        MultiStaker.abi,
        signer
      );
      const contractWithSigner = contract.connect(signer);
      const txn =
        await contractWithSigner.approveAllStakingMethodsWithMaxAmount();

      await txn.wait();
      setApproved(true);
    } catch (e) {
      console.log(e);
    } finally {
      setApprovedLoading(false);
    }
  }, [signer]);

  const { config: stakeConfig } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as any,
    abi: MultiStaker.abi,
    functionName: "stakeTokens",
    args: [
      selectedcollators,
      Array(selectedcollators.length).fill(dividedAmount),
    ],
  });

  const {
    data: stakeTxn,
    isLoading: isStakeLoading,
    isSuccess: isStakeSuccess,
    write: stake,
  } = useContractWrite(stakeConfig);

  const fetchcollators = useCallback(async () => {
    try {
      const contract = new ethers.Contract(
        "0x02a85c9E6D859eAFAC44C3c7DD52Bbe787e54d0A",
        MultiStaker.abi,
        signer
      );
      const contractWithSigner = contract.connect(signer);
      const result = await contractWithSigner.getDelegatorcollators();
      const fetchedcollators = result.map((v) => collatorsMap[v]);
      setDelegatedcollators(fetchedcollators);
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
      for (let i = 0; i < delegatedcollators.length; i++) {
        const result = await contractWithSigner.getDelegation(
          delegatedcollators[i].operator_address
        );
        const formattedResult = ethers.utils.formatUnits(result[1][1], 18);
        tempMap[delegatedcollators[i].operator_address] = formattedResult;
      }
      setDelegationsMap(tempMap);
    } catch (e) {
      console.log(e);
    }
  }, [delegatedcollators, signer]);

  const userNeedsApproval = useMemo(() => {
    return allowance && allowance.isZero() && !approved;
  }, [allowance, approved]);

  useEffect(() => {
    if (selectedSorting === "asc_comm") {
      const sorted = [...collators].sort(
        (a, b) =>
          Number(a.commission.commission_rates.rate) -
          Number(b.commission.commission_rates.rate)
      );
      setSortedcollators(sorted);
    } else if (selectedSorting === "asc_tokens") {
      const sorted = [...collators].sort(
        (a, b) => Number(a.tokens) - Number(b.tokens)
      );
      setSortedcollators(sorted);
    } else if (selectedSorting === "desc_comm") {
      const sorted = [...collators].sort(
        (a, b) =>
          Number(b.commission.commission_rates.rate) -
          Number(a.commission.commission_rates.rate)
      );
      setSortedcollators(sorted);
    } else {
      const sorted = [...collators].sort(
        (a, b) => Number(b.tokens) - Number(a.tokens)
      );
      setSortedcollators(sorted);
    }
  }, [selectedSorting]);

  useEffect(() => {
    if (filter === "jail") {
      setFilteredcollators(
        sortedcollators.filter((validator) => !validator.jailed)
      );
    } else {
      setFilteredcollators(sortedcollators);
    }
  }, [filter, sortedcollators]);

  useEffect(() => {
    fetchAllowance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer]);

  useEffect(() => {
    fetchcollators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer]);

  useEffect(() => {
    fetchDelegation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegatedcollators]);

  const goHome = () => router.push("/");
  const goBack = () => {
    if (currentStep === 0) {
      router.push("/");
      return;
    }
    setCurrentStep((prev) => prev - 1);
  };
  const goToNextStep = () => {
    if (currentStep === 0 && (error || amount === "" || amount === "0")) {
      setError(`You must stake at least 0.001 EVMOS.`);
      return;
    }
    if (currentStep === 1 && (error || !numcollators)) {
      setError(
        `Input must be greater than 0 and less than or equal to ${collators.length}.`
      );
      return;
    }
    if (currentStep === 2 && (error || selectedcollators.length === 0)) {
      setError(`You must select at least one validator.`);
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const getComponent = useCallback(() => {
    if (isStakeSuccess) {
      return (
        <Success
          amount={amount}
          fiatAmount={fiatAmount}
          fontSize={fontSize}
          collatorsMap={collatorsMap}
          selectedcollators={selectedcollators}
        />
      );
    }
    switch (currentStep) {
      case 0:
        return (
          <AmountInput
            amount={amount}
            fiatAmount={fiatAmount}
            setAmount={setAmount}
            setFiatAmount={setFiatAmount}
            inputWidth={inputWidth}
            fontSize={fontSize}
            setInputWidth={setInputWidth}
            setFontSize={setFontSize}
            setError={setError}
          />
        );
      case 1:
        return (
          <ValidatorInput
            numcollators={numcollators}
            setNumcollators={setNumcollators}
            maxcollators={collators.length}
            setError={setError}
          />
        );
      case 2:
        return !isAdvancedSelection ? (
          <BasicSelection
            selectedGroup={selectedGroup}
            setSelectedGroup={handleSelectedGroupChange}
          />
        ) : (
          <AdvancedSelection
            percentile={percentile}
            setPercentile={setPercentile}
            setSelectedSorting={setSelectedSorting}
            setFilter={setFilter}
            filteredcollators={filteredcollators}
            handleValidatorCheck={handleValidatorCheck}
            selectedcollators={selectedcollators}
            handleRangeConfirm={handleRangeConfirm}
          />
        );
      case 3:
        return (
          <Confirmation
            amount={amount}
            fiatAmount={fiatAmount}
            fontSize={fontSize}
            collatorsMap={collatorsMap}
            selectedcollators={selectedcollators}
          />
        );
    }
  }, [
    amount,
    currentStep,
    fiatAmount,
    filteredcollators,
    fontSize,
    handleRangeConfirm,
    handleSelectedGroupChange,
    handleValidatorCheck,
    inputWidth,
    isAdvancedSelection,
    isStakeSuccess,
    numcollators,
    percentile,
    selectedGroup,
    selectedcollators,
  ]);

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
        {!isStakeSuccess ? (
          <HStack className={styles.stepperHeader}>
            <VStack pt="1rem" onClick={goBack} cursor="pointer">
              <ChevronLeftIcon boxSize={6} />
            </VStack>
            <ProgressBar currentStep={currentStep} totalSteps={4} />
          </HStack>
        ) : (
          <Box h="3rem" />
        )}
        {getComponent()}
        {isStakeSuccess ? (
          <HStack>
            <Button className={styles.secondaryBtn} onClick={goHome}>
              Go to home
            </Button>
            <Link
              href={`https://testnet.escan.live/tx/${
                stakeTxn ? stakeTxn.hash : ""
              }`}
              isExternal
            >
              <Button className={styles.button}>View transaction</Button>
            </Link>
          </HStack>
        ) : currentStep === 3 ? (
          <HStack>
            <Button className={styles.secondaryBtn} onClick={goHome}>
              Cancel
            </Button>
            {userNeedsApproval ? (
              <Button className={styles.button} onClick={handleApprove}>
                {isApproveLoading ? <Spinner color="#09182c" /> : "Approve"}
              </Button>
            ) : (
              <Button className={styles.button} onClick={() => stake?.()}>
                {isStakeLoading ? <Spinner color="#09182c" /> : "Stake"}
              </Button>
            )}
          </HStack>
        ) : (
          <Button className={styles.button} onClick={goToNextStep}>
            Continue
          </Button>
        )}
        {currentStep === 2 && !isAdvancedSelection ? (
          <Text
            fontSize="12px"
            onClick={() => setAdvancedSelection(true)}
            cursor="pointer"
          >
            Advanced selection settings
          </Text>
        ) : (
          currentStep === 2 && (
            <Text
              fontSize="12px"
              onClick={() => setAdvancedSelection(false)}
              cursor="pointer"
            >
              Basic selection settings
            </Text>
          )
        )}
        {error && (
          <Text color="red" fontSize="14px" pt="0.5rem">
            {error}
          </Text>
        )}
        {isStakeSuccess && (
          <VStack className={styles.animationContainer}>
            <SuccessLottie />
          </VStack>
        )}
      </VStack>
    </main>
  );
}

export default Home;
