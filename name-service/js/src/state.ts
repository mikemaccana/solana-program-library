import { PublicKey, Connection } from "@solana/web3.js";
import { Schema, deserializeUnchecked } from "@bonfida/borsh-js";

export class NameRegistryState {
  parentName: PublicKey;
  owner: PublicKey;
  class: PublicKey;
  data: Buffer;

  static schema: Schema = new Map([
    [
      NameRegistryState,
      {
        kind: "struct",
        fields: [
          ["parentName", [32]],
          ["owner", [32]],
          ["class", [32]],
          ["data", ["u8"]],
        ],
      },
    ],
  ]);
  constructor(obj: {
    parentName: Buffer;
    owner: Buffer;
    class: Buffer;
    data: Buffer;
  }) {
    this.parentName = new PublicKey(obj.parentName);
    this.owner = new PublicKey(obj.owner);
    this.class = new PublicKey(obj.class);
    this.data = obj.data;
  }

  public static async retrieve(
    connection: Connection,
    nameAccountKey: PublicKey
  ): Promise<NameRegistryState> {
    let nameAccount = await connection.getAccountInfo(
      nameAccountKey,
      "processed"
    );
    if (!nameAccount) {
      throw new Error("Invalid name account provided");
    }

    // let res: NameRegistryState = deserializeUnchecked(
    //   this.schema,
    //   NameRegistryState,
    //   nameAccount.data,

    // );

    const parentName = nameAccount.data?.slice(0, 32);
    const owner = nameAccount.data?.slice(32, 64);
    const className = nameAccount.data?.slice(64, 96);
    const data = nameAccount.data?.slice(96);

    return new NameRegistryState({
      parentName,
      owner,
      class: className,
      data,
    });
  }
}
