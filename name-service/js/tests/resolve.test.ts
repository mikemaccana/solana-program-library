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
  expect(owner.toBase58()).toBe("J5TyWD7cozDdehGdjtrAF7sN5SVvqjfNCffKC6EgmRUU");

  domain = "0x108.sol";
  owner = await resolve(connection, domain);
  expect(owner.toBase58()).toBe("CnNHzcp7L4jKiA2Rsca3hZyVwSmoqXaT8wGwzS8WvvB2");
});
