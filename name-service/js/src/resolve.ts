import { Connection, PublicKey } from "@solana/web3.js";
import { getSolRecord } from "./record";
import { getDomainKey } from "./utils";
import { NameRegistryState } from "./state";

export const resolve = async (connection: Connection, domain: string) => {
  const { pubkey } = await getDomainKey(domain);

  const { registry, nftOwner } = await NameRegistryState.retrieve(
    connection,
    pubkey
  );

  if (nftOwner) {
    return nftOwner;
  }

  try {
    const solRecord = await getSolRecord(connection, domain);
    const base58 = solRecord.data?.toString();
    if (!base58) {
      throw new Error("SOL record is not set");
    }
    return new PublicKey(base58);
  } catch (err) {
    console.log(err);
  }

  return registry.owner;
};
