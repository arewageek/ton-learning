import { Cell, contractAddress } from "@ton/core";
import { hex } from "../build/main.compiled.json";
import { getHttpV4Endpoint } from "@orbs-network/ton-access";
import { Address, TonClient4 } from "ton";
import qs from "qs";
import qrcode from "qrcode-terminal";

import dotenv from "dotenv";

dotenv.config();

async function onchainTestScript() {
  // calculating the supposed contract address based on the compiled hex
  const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
  const dataCell = new Cell();
  const address = contractAddress(0, {
    code: codeCell,
    data: dataCell,
  });

  console.log({ address });

  const endpoint = await getHttpV4Endpoint({
    network: process.env.TESTNET ? "testnet" : "mainnet",
  });

  const client4 = new TonClient4({ endpoint });

  const latestBlock = await client4.getLastBlock();
  const status = await client4.getAccount(latestBlock.last.seqno, address);

  // console.log(status);

  if (status.account.state.type != "active") {
    console.log("Contract has not yet been deployed or activated");
    return;
  }

  const link = `https://testnet.tonhub.com/transfer/${address.toString({
    testOnly: process.env.TESTNET ? true : false,
  })}?${qs.stringify({ text: "Transfer token", amount: 0.01 })}`;

  qrcode.generate(link, { small: true }, (code) => console.log(code));

  let lastSenderAddress: Address;

  setInterval(async () => {
    const latestBlock = await client4.getLastBlock();
    const { exitCode, result } = await client4.runMethod(
      latestBlock.last.seqno,
      address,
      "get_latest_sender_address"
    );

    if (exitCode !== 0) {
      console.log("An error occurred while testing the contract onchain");
      return;
    }

    if (result[0].type !== "slice") {
      console.log("Unknow data type retrieved");
      return;
    }

    const latestSender = result[0].cell.beginParse().loadAddress();

    if (
      latestBlock &&
      latestSender.toString() !== lastSenderAddress?.toString()
    ) {
      console.log(
        `New recent sender: ${latestSender.toString({
          testOnly: process.env.TESTNET ? true : false,
        })}`
      );

      lastSenderAddress = latestSender;
    }
  }, 2000);
}

onchainTestScript();
