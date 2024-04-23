import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0xcB1e8801998Ecf28dc61722fF5F4B6D65Cef53eF"
);

export default instance;
