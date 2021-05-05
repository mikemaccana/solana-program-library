import {
  PublicKey,
  TransactionInstruction,
  Connection,
  Account,
  Transaction,
  AccountInfo,
  SystemProgram,
} from "@solana/web3.js";
import assert from "assert";
import BN from "bn.js";
import { createHash } from "crypto";
import { createNameRegistry, getFilteredProgramAccounts, getHashedName, getNameAccountKey, HASH_PREFIX, NAME_SERVICE_PROGRAM_ID, Numberu32, Numberu64, updateNameRegistryData } from ".";
import { createInstruction, deleteInstruction, transferInstruction, updateInstruction } from "./instructions";
import { NameRegistryState} from "./state";

export const TWITTER_VERIFICATION_AUTHORITY = new PublicKey(
  "..."
);

// The address of the name registry that will be a parent to all twitter handle registries,
// it should be owned by the TWITTER_VERIFICATION_AUTHORITY and it's name is irrelevant
export const TWITTER_ROOT_PARENT_KEY = new PublicKey( 
  "..."   
);

// Signed by the authority and the payer 
export async function createVerifiedTwitterRegistry(
  connection: Connection,
  twitter_handle: string,
  verifiedPubkey: PublicKey,
  space: number,      // The space that the user will have to write data into the verified registry
  payerKey: PublicKey
): Promise<TransactionInstruction[]> {

  let hashedTwitterHandle = await getHashedName(twitter_handle);
  let twitterHandleRegistryKey = await getNameAccountKey(hashedTwitterHandle, undefined, TWITTER_ROOT_PARENT_KEY);

  let hashedVerifiedPubkey = await getHashedName(verifiedPubkey.toString());
  let reverseRegistryKey = await getNameAccountKey(hashedVerifiedPubkey, TWITTER_VERIFICATION_AUTHORITY, undefined);

  space += 96; // Accounting for the Registry State Header 

  let instructions = [
    // Create user facing registry
    createInstruction(
      NAME_SERVICE_PROGRAM_ID,
      SystemProgram.programId,
      twitterHandleRegistryKey,
      verifiedPubkey,
      payerKey,
      hashedTwitterHandle,
      new Numberu64(await connection.getMinimumBalanceForRentExemption(space)),
      new Numberu32(space),
      undefined,
      TWITTER_ROOT_PARENT_KEY,
      TWITTER_VERIFICATION_AUTHORITY // Twitter authority acts as owner of the parent for all user-facing registries
    ),
    // Create reverse lookup registry
    createInstruction(
      NAME_SERVICE_PROGRAM_ID,
      SystemProgram.programId,
      reverseRegistryKey,
      verifiedPubkey,  // TODO verify
      payerKey,
      hashedVerifiedPubkey,
      new Numberu64(await connection.getMinimumBalanceForRentExemption(18)),
      new Numberu32(18), // maximum length of a twitter handle
      TWITTER_VERIFICATION_AUTHORITY, // Twitter authority acts as class for all reverse-lookup registries
      undefined,
      undefined,
    ),
    // Write the twitter handle into the reverse lookup registry
    updateInstruction(
      NAME_SERVICE_PROGRAM_ID,
      reverseRegistryKey,
      new Numberu32(0),
      Buffer.from(twitter_handle),
      TWITTER_VERIFICATION_AUTHORITY
    )
  ];

  return instructions
}

// Change the verified pubkey for a given twitter handle
// Signed by the Authority, the verified pubkey and the payer
export async function changeVerifiedPubkey(
  connection: Connection,
  twitter_handle: string,
  currentVerifiedPubkey: PublicKey,
  newVerifiedPubkey: PublicKey,
  payerKey: PublicKey
): Promise<TransactionInstruction[]> {

  let hashedTwitterHandle = await getHashedName(twitter_handle);
  let twitterHandleRegistryKey = await getNameAccountKey(hashedTwitterHandle, undefined, TWITTER_ROOT_PARENT_KEY);

  let currentHashedVerifiedPubkey = await getHashedName(currentVerifiedPubkey.toString());
  let currentReverseRegistryKey = await getNameAccountKey(currentHashedVerifiedPubkey, TWITTER_VERIFICATION_AUTHORITY, undefined);

  let newHashedVerifiedPubkey = await getHashedName(newVerifiedPubkey.toString());
  let newReverseRegistryKey = await getNameAccountKey(newHashedVerifiedPubkey, TWITTER_VERIFICATION_AUTHORITY, undefined);

  let instructions = [
    // Transfer the user-facing registry ownership
    transferInstruction(
      NAME_SERVICE_PROGRAM_ID,
      twitterHandleRegistryKey,
      newVerifiedPubkey,
      currentVerifiedPubkey,
      undefined
    ),
    // Delete the current reverse registry
    deleteInstruction(
      NAME_SERVICE_PROGRAM_ID,
      currentReverseRegistryKey,
      payerKey,
      currentVerifiedPubkey
    ),
    // Create the new reverse lookup registry
    createInstruction(
      NAME_SERVICE_PROGRAM_ID,
      SystemProgram.programId,
      newReverseRegistryKey,
      TWITTER_VERIFICATION_AUTHORITY,
      payerKey,
      newHashedVerifiedPubkey,
      new Numberu64(await connection.getMinimumBalanceForRentExemption(18)),
      new Numberu32(18), // maximum length of a twitter handle
      TWITTER_VERIFICATION_AUTHORITY, // Twitter authority acts as class for all reverse-lookup registries
      undefined,
      undefined,
    ),
    // Write the twitter handle into the new reverse lookup registry
    updateInstruction(
      NAME_SERVICE_PROGRAM_ID,
      newReverseRegistryKey,
      new Numberu32(0),
      Buffer.from(twitter_handle),
      TWITTER_VERIFICATION_AUTHORITY
    )
  ];

  return instructions
}

// // Delete the verified registry for a given twitter handle
// // Signed by the Authority and the verified pubkey
// export async function deleteTwitterRegistry(
//   connection: Connection,
//   twitter_handle: string,
//   verifiedPubkey: PublicKey,
//   payerKey: PublicKey
// ): Promise<TransactionInstruction[]> {

//   let hashedTwitterHandle = await getHashedName(twitter_handle);
//   let twitterHandleRegistryKey = await getNameAccountKey(hashedTwitterHandle, undefined, TWITTER_ROOT_PARENT_KEY);

//   let hashedVerifiedPubkey = await getHashedName(verifiedPubkey.toString());
//   let reverseRegistryKey = await getNameAccountKey(hashedVerifiedPubkey, TWITTER_VERIFICATION_AUTHORITY, undefined);

//   let instructions = [
//     // Delete the user facing registry
//     deleteInstruction(
//       NAME_SERVICE_PROGRAM_ID,
//       twitterHandleRegistryKey,
//       verifiedPubkey,
//       verifiedPubkey
//     ),
//     // Delete the reverse registry
//     deleteInstruction(
//       NAME_SERVICE_PROGRAM_ID,
//       currentReverseRegistryKey,
//       payerKey,
//       TWITTER_VERIFICATION_AUTHORITY
//     ),
//     // Create the new reverse lookup registry
//     createInstruction(
//       NAME_SERVICE_PROGRAM_ID,
//       SystemProgram.programId,
//       newReverseRegistryKey,
//       TWITTER_VERIFICATION_AUTHORITY,
//       payerKey,
//       newHashedVerifiedPubkey,
//       new Numberu64(await connection.getMinimumBalanceForRentExemption(18)),
//       new Numberu32(18), // maximum length of a twitter handle
//       TWITTER_VERIFICATION_AUTHORITY, // Twitter authority acts as class for all reverse-lookup registries
//       undefined,
//       undefined,
//     ),
//     // Write the twitter handle into the new reverse lookup registry
//     updateInstruction(
//       NAME_SERVICE_PROGRAM_ID,
//       newReverseRegistryKey,
//       new Numberu32(0),
//       Buffer.from(twitter_handle),
//       TWITTER_VERIFICATION_AUTHORITY
//     )
//   ];

//   return instructions
// }


export async function getTwitterHandleRegistry(connection: Connection, verifiedPubkey: PublicKey) {
// DOes not give you the name
  const filters = [
    {
      memcmp: {
        offset: 0,
        bytes: TWITTER_ROOT_PARENT_KEY.toBytes(),
      },
    },
    {
      memcmp: {
        offset: 32,
        bytes: verifiedPubkey.toBytes(),
      },
    },
  ];

  let filteredAccounts = await getFilteredProgramAccounts(
    connection,
    NAME_SERVICE_PROGRAM_ID,
    filters
  );
    
  if (filteredAccounts.length > 1) {
    throw "Found more than one twitter handle"
  }

  return filteredAccounts[0].publicKey, filteredAccounts[0].accountInfo.data
}

