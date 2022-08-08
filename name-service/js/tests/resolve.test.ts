import { test, jest } from "@jest/globals";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { resolve } from "../src/resolve";

jest.setTimeout(5_000);

const connection = new Connection(clusterApiUrl("mainnet-beta"));

test("Resolve domains", async () => {
  // Resolve bonfida.sol
  let domain = "🍍.sol";
  let owner = await resolve(connection, domain);
  expect(owner.toBase58()).toBe("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2");

  domain = "beach";
  owner = await resolve(connection, domain);
  expect(owner.toBase58()).toBe("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2");

  domain = "boston.sol";
  owner = await resolve(connection, domain);
  expect(owner.toBase58()).toBe("78j3JUUd2nrA52Srx2zrEQ8jez7FDqnAETMAVEXDctB7");
});
