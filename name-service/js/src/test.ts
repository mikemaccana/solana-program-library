import { serialize } from "@bonfida/borsh-js";
import { Connection, Account, PublicKey, AccountInfo } from "@solana/web3.js";
import {
  transferNameOwnership,
  updateNameRegistryData,
  createNameRegistry,
  deleteNameRegistry,
} from "./bindings";
import { readFile } from "fs/promises";
import { Numberu64, signAndSendTransactionInstructions } from "./utils";
import { sign } from "tweetnacl";
import { getHashedName, getNameAccountKey, Numberu32 } from ".";
import { NameRegistryState } from "./state";
import {
  createVerifiedTwitterRegistry,
  getTwitterHandle,
  TWITTER_VERIFICATION_AUTHORITY,
} from "./twitter_bindings";

const ENDPOINT = "https://devnet.solana.com/";
// const ENDPOINT = 'https://solana-api.projectserum.com/';

export async function test() {
  let connection = new Connection(ENDPOINT);
  let secretKey = JSON.parse(
    (await readFile("/home/lcchy/.config/solana/id_devnet.json")).toString()
  );
  let adminAccount = new Account(secretKey);

  let root_name = "twitter";

  // let create_instruction = await createVerifiedTwitterRegistry(
  //   connection,
  //   "LongShort_io",
  //   adminAccount.publicKey,
  //   1000,
  //   adminAccount.publicKey
  // );

  // let create_instruction = await createNameRegistry(
  //   connection,
  //   root_name,
  //   1000,
  //   adminAccount.publicKey,
  //   adminAccount.publicKey,
  //   undefined,
  //   adminAccount.publicKey,
  // );

  // console.log(
  //   await signAndSendTransactionInstructions(
  //     connection,
  //     [adminAccount],
  //     adminAccount,
  //     create_instruction
  //   )
  // );

  // let input_data = Buffer.from("Du");
  // let updateInstruction = await updateNameRegistryData(
  //   connection,
  //   root_name,
  //   0,
  //   input_data,
  // );

  // console.log(
  //   await signAndSendTransactionInstructions(
  //     connection,
  //     [adminAccount],
  //     adminAccount,
  //     [updateInstruction]
  //   )
  // );

  // let transferInstruction = await transferNameOwnership(
  //   connection,
  //   root_name,
  //   adminAccount.publicKey,
  //   adminAccount.publicKey,
  // );

  // console.log(
  //   await signAndSendTransactionInstructions(
  //     connection,
  //     [adminAccount],
  //     adminAccount,
  //     [transferInstruction]
  //   )
  // );

  // let deleteInstruction = await deleteNameRegistry(
  //   connection,
  //   root_name,
  //   adminAccount.publicKey
  // );

  // console.log(
  //   await signAndSendTransactionInstructions(
  //     connection,
  //     [adminAccount],
  //     adminAccount,
  //     [deleteInstruction]
  //   )
  // );

  // console.log(await getTwitterHandle(connection, adminAccount.publicKey));
  let hashed_root_name = await getHashedName(root_name);
  let nameAccountKey = await getNameAccountKey(
    hashed_root_name,
    TWITTER_VERIFICATION_AUTHORITY,
    undefined
  );
  console.log(nameAccountKey.toString());
  console.log(
    await await NameRegistryState.retrieve(connection, nameAccountKey)
  );
}

test();
