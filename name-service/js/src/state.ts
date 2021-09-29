import { PublicKey, Connection } from "@solana/web3.js";
import { deserializeUnchecked, serialize, Schema } from "borsh";

export class NameRegistryState {
  parentName: PublicKey;
  owner: PublicKey;
  class: PublicKey;
  data: Buffer;

  static HEADER_LEN = 96;

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

export class TokenData {
  name: string;
  ticker: string;
  mint: Uint8Array;
  decimals: number;
  website?: string;
  logoUri?: string;

  constructor(obj: {
    name: string;
    ticker: string;
    mint: Uint8Array;
    decimals: number;
    website?: string;
    logoUri?: string;
  }) {
    this.name = obj.name;
    this.ticker = obj.ticker;
    this.mint = obj.mint;
    this.decimals = obj.decimals;
    this.website = obj?.website;
    this.logoUri = obj?.logoUri;
  }

  static schema: Schema = new Map([
    [
      TokenData,
      {
        kind: "struct",
        fields: [
          ["name", "string"],
          ["ticker", "string"],
          ["mint", [32]],
          ["decimals", "u8"],
          ["website", { kind: "option", type: "string" }],
          ["logoUri", { kind: "option", type: "string" }],
        ],
      },
    ],
  ]);

  serialize(): Uint8Array {
    return serialize(TokenData.schema, this);
  }
  static deserialize(data: Buffer) {
    return deserializeUnchecked(TokenData.schema, TokenData, data) as TokenData;
  }
}

export class Mint {
  mint: Uint8Array;
  constructor(obj: { mint: Uint8Array }) {
    this.mint = obj.mint;
  }

  static schema: Schema = new Map([
    [
      Mint,
      {
        kind: "struct",
        fields: [["mint", [32]]],
      },
    ],
  ]);

  serialize(): Uint8Array {
    return serialize(Mint.schema, this);
  }
  static deserialize(data: Buffer) {
    return deserializeUnchecked(Mint.schema, Mint, data) as Mint;
  }
}
