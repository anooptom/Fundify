import Head from "next/head";
import { useState, useEffect } from "react";
import { useWallet } from "use-wallet";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useWindowSize } from "react-use";
import { FaEthereum } from 'react-icons/fa'; // Importing the MetaMask icon from react-icons/fa

import {
  getETHPrice,
  getETHPriceInUSD,
  getWEIPriceInUSD,
} from "../../lib/getETHPrice";
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Container,
  Input,
  Button,
  SimpleGrid,
  InputRightAddon,
  InputGroup,
  FormControl,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Tooltip,
  Alert,
  AlertIcon,
  AlertDescription,
  Progress,
  CloseButton,
  FormHelperText,
  Link,
  IconButton,
} from "@chakra-ui/react";

import { InfoIcon, ExternalLinkIcon, CopyIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import Confetti from "react-confetti";

import web3 from "../../smart-contract/web3";
import Campaign from "../../smart-contract/campaign";
import factory from "../../smart-contract/factory";

const CampaignTokenStatsCard = ({ title, stat, info, tokenAddress }) => {
  const [copied, setCopied] = useState(false);

  const copyTokenAddressToClipboard = () => {
    navigator.clipboard.writeText(tokenAddress);
    setCopied(true);
  };

  const addTokenToMetaMask = () => {
    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        const params = {
          type: 'ERC20',
          options: {
            address: tokenAddress,
          },
        };
        window.ethereum.request({
          method: 'wallet_watchAsset',
          params,
        });
        setCopied(true); // Optionally mark as copied after adding to MetaMask
      } else {
        alert("MetaMask not installed or not detected.");
      }
    } catch (error) {
      console.error("Error adding token to MetaMask:", error);
      alert("Error adding token to MetaMask. Please try again later.");
    }
  };

  return (
    <Box
      px={{ base: 2, md: 4 }}
      py={"5"}
      shadow={"sm"}
      border={"1px solid"}
      borderColor={"gray.500"}
      rounded={"lg"}
      transition={"transform 0.3s ease"}
      _hover={{
        transform: "translateY(-5px)",
      }}
    >
      <Tooltip
        label={info}
        bg={useColorModeValue("white", "gray.700")}
        placement={"top"}
        color={useColorModeValue("gray.800", "white")}
        fontSize={"1em"}
      >
        <Box pl={{ base: 2, md: 4 }}>
          <Box fontWeight={"medium"} isTruncated>
            Campaign Token Address
          </Box>
          <Flex align="center" justify="space-between">
            <Box
              fontSize={"base"}
              fontWeight={"bold"}
              isTruncated
              maxW={{ base: "10rem", sm: "sm" }}
            >
              {tokenAddress}
            </Box>
            <Flex align="center" mt={-5}>
              <Tooltip
                label={copied ? "Copied!" : "Copy Token Address"}
                aria-label="Copy Token Address"
                placement="top"
              >
                <IconButton
                  aria-label="Copy Token Address"
                  icon={<CopyIcon />}
                  onClick={copyTokenAddressToClipboard}
                  size="lg"
                  variant="ghost"
                />
              </Tooltip>
              <Tooltip
                label={"Add Token to MetaMask"}
                aria-label="Add Token to MetaMask"
                placement="top"
              >
                <IconButton
                  aria-label="Add Token to MetaMask"
                  icon={<FaEthereum />}
                  onClick={addTokenToMetaMask}
                  size="lg"
                  variant="ghost"
                />
              </Tooltip>
            </Flex>
          </Flex>
        </Box>
      </Tooltip>
    </Box>
  );
};

export async function getServerSideProps({ params }) {
  const campaignId = params.id;
  const campaign = Campaign(campaignId);
  const summary = await campaign.methods.getSummary().call();
  const ETHPrice = await getETHPrice();

  return {
    props: {
      id: campaignId,
      minimumContribution: summary[0],
      balance: summary[1],
      contributorsCount: summary[3],
      manager: summary[5],
      tokenaddress: summary[6],
      name: summary[7],
      description: summary[8],
      image: summary[9],
      target: summary[10],
      ETHPrice,
    },
  };
}

function StatsCard(props) {
  const { title, stat, info } = props;
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={"5"}
      shadow={"sm"}
      border={"1px solid"}
      borderColor={"gray.500"}
      rounded={"lg"}
      transition={"transform 0.3s ease"}
      _hover={{
        transform: "translateY(-5px)",
      }}
    >
      <Tooltip
        label={info}
        bg={useColorModeValue("white", "gray.700")}
        placement={"top"}
        color={useColorModeValue("gray.800", "white")}
        fontSize={"1em"}
      >
        <Flex justifyContent={"space-between"}>
          <Box pl={{ base: 2, md: 4 }}>
            <StatLabel fontWeight={"medium"} isTruncated>
              {title}
            </StatLabel>
            <StatNumber
              fontSize={"base"}
              fontWeight={"bold"}
              isTruncated
              maxW={{ base: "	10rem", sm: "sm" }}
            >
              {stat}
            </StatNumber>
          </Box>
        </Flex>
      </Tooltip>
    </Stat>
  );
}

export default function CampaignSingle({
  id,
  minimumContribution,
  balance,
  contributorsCount,
  manager,
  name,
  description,
  tokenaddress,
  image,
  target,
  ETHPrice,
}) {
  const { handleSubmit, register, formState, reset, getValues } = useForm({
    mode: "onChange",
  });
  const [connectedAddress, setConnectedAddress] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [amountInUSD, setAmountInUSD] = useState();
  const wallet = useWallet();
  const router = useRouter();
  const { width, height } = useWindowSize();

  useEffect(() => {
    const fetchConnectedAddress = async () => {
      try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          setConnectedAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Error fetching connected address:", error);
      }
    };

    fetchConnectedAddress();
  }, []);


  async function onSubmit(data) {
    console.log(data);
    try {
      const campaign = Campaign(id);
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.contribute().send({
        from: accounts[0],
        value: web3.utils.toWei(data.value, "ether"),
      });
      router.push(`/campaign/${id}`);
      setAmountInUSD(null);
      reset("", {
        keepValues: false,
      });
      setIsSubmitted(true);
      setError(false);
    } catch (err) {
      setError(err.message);
      console.log(err);
    }
  }

  return (
    <div>
      <Head>
        <title>Campaign Details</title>
        <meta name="description" content="Create a Withdrawal Request" />
        <link rel="icon" href="/Fundify.png" />
      </Head>
      {isSubmitted ? <Confetti width={width} height={height} /> : null}
      <main>
        {" "}
        <Box position={"relative"}>
          {isSubmitted ? (
            <Container
              maxW={"7xl"}
              columns={{ base: 1, md: 2 }}
              spacing={{ base: 10, lg: 32 }}
              py={{ base: 6 }}
            >
              <Alert status="success" mt="2">
                <AlertIcon />
                <AlertDescription mr={2}>
                  {" "}
                  Thank You for your Contribution
                </AlertDescription>
                <CloseButton
                  position="absolute"
                  right="8px"
                  top="8px"
                  onClick={() => setIsSubmitted(false)}
                />
              </Alert>
            </Container>
          ) : null}
          <Container
            as={SimpleGrid}
            maxW={"7xl"}
            columns={{ base: 1, md: 2 }}
            spacing={{ base: 10, lg: 32 }}
            py={{ base: 6 }}
          >
            <Stack spacing={{ base: 6 }}>
              <Heading
                lineHeight={1.1}
                fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
              >
                {name}
              </Heading>
              <Text
                color={useColorModeValue("gray.500", "gray.200")}
                fontSize={{ base: "lg" }}
              >
                {description}
              </Text>
              <Link
                color="teal.500"
                href={`https://sepolia.etherscan.io/address/${id}`}
                isExternal
              >
                View on Sepolia Etherscan <ExternalLinkIcon mx="2px" />
              </Link>
              <Box mx={"auto"} w={"full"}>
                <SimpleGrid columns={{ base: 1 }} spacing={{ base: 5 }}>
                  <StatsCard
                    title={"Minimum Contribution"}
                    stat={`${web3.utils.fromWei(
                      minimumContribution,
                      "ether"
                    )} ETH ($${getWEIPriceInUSD(
                      ETHPrice,
                      minimumContribution
                    )})`}
                    info={
                      "You must contribute at least this much in Wei ( 1 ETH = 10 ^ 18 Wei) to become an approver"
                    }
                  />
                  <StatsCard
                    title={"Wallet Address of Campaign Creator"}
                    stat={manager}
                    info={
                      "The Campaign Creator created the campaign and can withdraw money."
                    }
                  />
                  <CampaignTokenStatsCard tokenAddress={tokenaddress} />
                  <StatsCard
                    title={"Number of Contributions"}
                    stat={contributorsCount}
                    info={
                      "Total number of contributions in this Campaign"
                    }
                  />
                </SimpleGrid>
              </Box>
            </Stack>
            <Stack spacing={{ base: 4 }}>
              <Box>
                <Stat
                  bg={useColorModeValue("white", "black")}
                  boxShadow={"lg"}
                  rounded={"xl"}
                  border={"1px"}
                  borderColor={useColorModeValue("white", "gray.700")}
                  p={{ base: 4, sm: 6, md: 8 }}
                  spacing={{ base: 8 }}
                >
                  <StatLabel fontWeight={"medium"}>
                    <Text as="span" isTruncated mr={2}>
                      {" "}
                      Total Contribution Progress
                    </Text>
                    <Tooltip
                      label="Total ETH that has been contributed to the campaign"
                      bg={useColorModeValue("white", "gray.700")}
                      placement={"top"}
                      color={useColorModeValue("gray.800", "white")}
                      fontSize={"1em"}
                      px="4"
                    >
                      <InfoIcon
                        color={useColorModeValue("teal.800", "white")}
                      />
                    </Tooltip>
                  </StatLabel>
                  <StatNumber>
                    <Box
                      fontSize={"2xl"}
                      isTruncated
                      maxW={{ base: "	15rem", sm: "sm" }}
                      pt="2"
                    >
                      <Text as="span" fontWeight={"bold"}>
                        {balance > 0
                          ? web3.utils.fromWei(balance, "ether")
                          : "No Contributions"}
                      </Text>
                      <Text
                        as="span"
                        display={balance > 0 ? "inline" : "none"}
                        pr={2}
                        fontWeight={"bold"}
                      >
                        {" "}
                        ETH
                      </Text>
                      <Text
                        as="span"
                        fontSize="lg"
                        display={balance > 0 ? "inline" : "none"}
                        fontWeight={"normal"}
                        color={useColorModeValue("gray.500", "gray.200")}
                      >
                        (${getWEIPriceInUSD(ETHPrice, balance)})
                      </Text>
                    </Box>

                    <Text fontSize={"md"} fontWeight="normal">
                      target of {web3.utils.fromWei(target, "ether")} ETH ($
                      {getWEIPriceInUSD(ETHPrice, target)})
                    </Text>
                    <Progress
                      colorScheme="teal"
                      size="sm"
                      value={web3.utils.fromWei(balance, "ether")}
                      max={web3.utils.fromWei(target, "ether")}
                      mt={4}
                      borderRadius={"lg"}
                    />
                  </StatNumber>
                </Stat>
              </Box>
              <Stack
                bg={useColorModeValue("white", "black")}
                boxShadow={"lg"}
                rounded={"xl"}
                border={"1px"}
                borderColor={useColorModeValue("white", "gray.700")}
                p={{ base: 4, sm: 6, md: 8 }}
                spacing={{ base: 6 }}
              >
                <Heading
                  lineHeight={1.1}
                  fontSize={{ base: "2xl", sm: "3xl" }}
                  color={useColorModeValue("teal.600", "teal.200")}
                >
                  Contribute Now!
                </Heading>

                <Box mt={10}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl id="value">
                      <FormLabel>
                        Amount in Ether you want to contribute
                      </FormLabel>
                      <InputGroup>
                        {" "}
                        <Input
                          {...register("value", { required: true })}
                          type="number"
                          isDisabled={formState.isSubmitting}
                          onChange={(e) => {
                            setAmountInUSD(Math.abs(e.target.value));
                          }}
                          step="any"
                          min="0"
                        />{" "}
                        <InputRightAddon children="ETH" />
                      </InputGroup>
                      {amountInUSD ? (
                        <FormHelperText>
                          ~$ {getETHPriceInUSD(ETHPrice, amountInUSD)}
                        </FormHelperText>
                      ) : null}
                    </FormControl>

                    {error ? (
                      <Alert status="error" mt="2">
                        <AlertIcon />
                        <AlertDescription mr={2}> {error}</AlertDescription>
                      </Alert>
                    ) : null}

                    <Stack spacing={10}>
                      {wallet.status === "connected" ? (
                        <Button
                          fontFamily={"heading"}
                          mt={4}
                          w={"full"}
                          bgGradient="linear(to-r, teal.400,green.400)"
                          color={"white"}
                          _hover={{
                            bgGradient: "linear(to-r, teal.400,blue.400)",
                            boxShadow: "xl",
                          }}
                          isLoading={formState.isSubmitting}
                          isDisabled={amountInUSD ? (manager === connectedAddress) : true}
                          type="submit"
                        >
                          Contribute
                        </Button>
                      ) : (
                        <Alert status="warning" mt={4}>
                          <AlertIcon />
                          <AlertDescription mr={2}>
                            Please Connect Your Wallet to Contribute
                          </AlertDescription>
                        </Alert>
                      )}
                    </Stack>
                  </form>
                </Box>
              </Stack>

              <Stack
                bg={useColorModeValue("white", "black")}
                boxShadow={"lg"}
                rounded={"xl"}
                border={"1px"}
                borderColor={useColorModeValue("white", "gray.700")}
                p={{ base: 4, sm: 6, md: 8 }}
                spacing={4}
              >
                <NextLink href={`/campaign/${id}/withdraw`}>
                  <Button
                    fontFamily={"heading"}
                    w={"full"}
                    bgGradient="linear(to-r, teal.400,green.400)"
                    color={"white"}
                    _hover={{
                      bgGradient: "linear(to-r, teal.400,blue.400)",
                      boxShadow: "xl",
                    }}
                    isDisabled={manager !== connectedAddress || manager == ''}
                  >
                    Withdraw Funds
                  </Button>
                </NextLink>
                <Text fontSize={"sm"}>
                  * You can withdraw funds from the campaign if you are the creator :)
                </Text>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </main>
    </div>
  );
}
