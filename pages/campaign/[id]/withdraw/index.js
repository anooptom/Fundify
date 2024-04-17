import React, { useState, useEffect } from "react";
import Head from "next/head";
import NextLink from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { getETHPrice, getWEIPriceInUSD } from "../../../../lib/getETHPrice";
import {
  Heading,
  useColorModeValue,
  Text,
  Button,
  Flex,
  Container,
  Box,
  Spacer,
  InputGroup,
  InputRightAddon,
  Alert,
  AlertIcon,
  AlertDescription,
  Input,
  FormControl,
  FormLabel
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  InfoIcon,
  CheckCircleIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import web3 from "../../../../smart-contract/web3";
import Campaign from "../../../../smart-contract/campaign";
import factory from "../../../../smart-contract/factory";

export async function getServerSideProps({ params }) {
  const campaignId = params.id;
  const campaign = Campaign(campaignId);
  const summary = await campaign.methods.getSummary().call();
  const ETHPrice = await getETHPrice();

  return {
    props: {
      campaignId,
      totalBalance: summary[1],
      balance: summary[2],
      name: summary[5],
      ETHPrice,
      manager: summary[5]
    },
  };
}


export default function Requests({
  campaignId,
  totalBalance,
  balance,
  name,
  ETHPrice,
  manager
}) {
  const { handleSubmit, register, formState, reset, getValues } = useForm({
    mode: "onChange",
  });

  const [connectedAddress, setConnectedAddress] = useState()
  const [withdrawAmount, setWithdrawAmount] = useState();
  const [FundNotAvailable, setFundNotAvailable] = useState(false);
  const campaign = Campaign(campaignId);


  useEffect(() => {
    if (balance == 0) {
      setFundNotAvailable(true);
    }
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
  }, [connectedAddress]);

  async function onSubmit(data) {
    try {
      const campaign = Campaign(campaignId);

      const amountInWei = web3.utils.toWei(data.data, "ether");
      // Call the withdraw function of the smart contract
      await campaign.methods.withdraw(amountInWei).send({
        from: manager,
      });
      console.log("Withdrawal successful!"); // Log success message

    } catch (err) {
      console.error("Error while withdrawing:", err); // Log error
    }
  }

  return (
    <div>
      <Head>
        <title>Withdraw from Campaign</title>
        <meta name="description" content="Create a Withdrawal Request" />
        <link rel="icon" href="/logo.svg" />
      </Head>

      <main>
        <Container px={{ base: "4", md: "12" }} maxW={"7xl"} align={"left"}>
          <Flex flexDirection={{ base: "column", md: "row" }} py={4}>
            <Box py="4">
              <Text fontSize={"lg"} color={"teal.400"}>
                <ArrowBackIcon mr={2} />
                <NextLink href={`/campaign/${campaignId}`}>
                  Back to Campaign
                </NextLink>
              </Text>
            </Box>
            <Spacer />
            <Box py="4">
              Total Contribution Amount :{" "}
              <Text as="span" fontWeight={"bold"} fontSize="lg">
                {balance > 0
                  ? web3.utils.fromWei(totalBalance, "ether")
                  : "No Contributions"}
              </Text>
              <Text
                as="span"
                display={balance > 0 ? "inline" : "none"}
                pr={2}
                fontWeight={"bold"}
                fontSize="lg"
              >
                {" "}
                ETH
              </Text>
              <Text
                as="span"
                display={balance > 0 ? "inline" : "none"}
                fontWeight={"normal"}
                color={useColorModeValue("gray.500", "gray.200")}
              >
                (${getWEIPriceInUSD(ETHPrice, balance)})
              </Text>
            </Box>
          </Flex>
          {FundNotAvailable ? (
            <Alert status="error" my={4}>
              <AlertIcon />
              <AlertDescription>
                The Current Balance of the Campaign is 0, Please Contribute withdraw
              </AlertDescription>
            </Alert>
          ) : null}
        </Container>
        <Container px={{base:"1", md: "12"}} maxW={"7xl"}>
          <Heading
            lineHeight={1.5}
            fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
          >
            Withdraw Campaign Funds
          </Heading>
          <Box py="10">
            <Text>
              Contributor Address: {" " + name}
            </Text>
            
            <Text>
              Avaliable fund to withdraw: {web3.utils.fromWei(balance, "ether")} ETH (${getWEIPriceInUSD(ETHPrice, balance)})
            </Text>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Flex flexDirection={{ base: "column", md: "row" }} py={4}>
                <FormControl>
                  <FormLabel>Withdrawal Amount</FormLabel>
                  <InputGroup>
                    <Input
                      {...register("data", { required: true })}
                      type="number"
                      placeholder="Amount (ETH)"
                      min="0"
                      step="any"
                      required
                    />
                    <InputRightAddon children="ETH" />
                  </InputGroup>
                </FormControl>
              </Flex>
              <Button
                mt={4}
                w={"full"}
                bgGradient="linear(to-r, teal.400,green.400)"
                color={"white"}
                _hover={{
                  bgGradient: "linear(to-r, teal.400,blue.400)",
                  boxShadow: "xl",
                }}
                type="submit"
                isLoading={formState.isSubmitting} // Add isLoading attribute to the Button
                isDisabled={manager !== connectedAddress}
              >
                Withdraw
              </Button>
            </form>
          </Box>
        </Container>
      </main>
    </div>
  );
}
