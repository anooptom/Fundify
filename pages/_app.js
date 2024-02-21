import "../styles/globals.css";
import { ChakraProvider, extendTheme,useColorModeValue } from "@chakra-ui/react";
import { UseWalletProvider } from "use-wallet";
import NavBar from "../components/Navbar";
import Footer from "../components/Footer";
import '@fontsource/poppins';
import '@fontsource/inter';

const theme = extendTheme({
  fonts: {
    heading: "Poppins",
    body: "Inter",
  },
  styles:{
    global: () => ({
      body: {
        bg: useColorModeValue("white","black"),
      }
    })
  }
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      {" "}
      <ChakraProvider theme={theme}>
        <UseWalletProvider
          chainId={11155111}
          connectors={{
            walletconnect: {
              rpcUrl:
                "https://sepolia.infura.io/v3/c935c9936531469d9a345c7b4eae2302",
            },
          }}
        >
          <NavBar />
          <Component {...pageProps} />
          <Footer />{" "}
        </UseWalletProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
