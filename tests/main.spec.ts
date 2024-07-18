import { Cell, Address, toNano } from "@ton/core";
import { hex } from "../build/main.compiled.json";
import { Blockchain } from "@ton/sandbox";
import { MainContract } from "../wrappers/MainContract";
import "@ton/test-utils";

describe("Main.fc Contract test", function () {
  it("Should successfully increase counter in contract and get address of the most recent sender", async () => {
    const blockchain = await Blockchain.create();
    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];

    const addy = await blockchain.treasury("sender");

    const theMainContract = blockchain.openContract(
      await MainContract.createFromConfig(
        { number: 0, address: addy.address },
        codeCell
      )
    );

    const senderWallet = await blockchain.treasury("sender");
    const sendMessageResult = await theMainContract.sendIncrement(
      senderWallet.getSender(),
      toNano("0.05"),
      1
    );

    expect(sendMessageResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: theMainContract.address,
      success: true,
    });

    const data = await theMainContract.getData();

    expect(data.latest_sender.toString()).toBe(senderWallet.address.toString());
  });
});
