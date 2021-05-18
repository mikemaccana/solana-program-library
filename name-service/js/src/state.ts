import { PublicKey, Connection } from "@solana/web3.js";
import { deserializeUnchecked, Schema } from "borsh";

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

    let res: NameRegistryState = deserializeUnchecked(
      this.schema,
      NameRegistryState,
      nameAccount.data
    );

    res.data = nameAccount.data?.slice(96);

    return res;
  }
}
