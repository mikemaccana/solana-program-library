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
    if (solRecord.data?.length !== 64) {
      throw new Error("Invalid SOL record data");
    }

    if (registry.owner.toBuffer().compare(solRecord.data.slice(32, 64)) !== 0) {
      throw new Error("SOL record owner mismatch");
    }

    return new PublicKey(solRecord.data.slice(0, 32));
  } catch (err) {
    console.log(err);
  }

  return registry.owner;
};
