import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0x94f8B80b23C8aB2E2d8e167c446cF36e6788Ca6A"
);

export default instance;
