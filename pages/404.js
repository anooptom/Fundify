import {
    Heading,
    useBreakpointValue,
    useColorModeValue,
    Text,
    Button,
    Flex,
    Container,
    SimpleGrid,
    Box,
    Divider,
    Skeleton,
    Img,
    Icon,
    chakra,
    Tooltip,
    Link,
    SkeletonCircle,
    HStack,
    Stack,
    Progress,
  } from "@chakra-ui/react";

export default function Custom404() {
    return (
        <Container py={{ base: "4", md: "12" }} display={"flex"} flexDirection={"column"}  justifyContent={'center'} maxW={"7xl"} alignItems={"center"} minH={"80vh"}>
          {" "}
          <Heading
            textAlign={useBreakpointValue({ base: "center" })}
            fontFamily={"heading"}
            color={useColorModeValue("black", "white")}
            fontSize={"5xl"}
            py={5}
          >
            Error 404{" "}
          </Heading>
          <Text
            textAlign={useBreakpointValue({ base: "center" })}
            fontFamily={"body"}
            color={useColorModeValue("black", "white")}
            py={10}
            fontSize={"lg"}
            maxW={"500px"}
          >
            Looks like you've wandered far into the webpage.            The link you're trying to redirect to deos not exist
          </Text>
        </Container>
    )
  }