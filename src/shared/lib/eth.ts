/**
 * Decimal ETH helpers. Values travel as decimal strings and are computed as
 * BigInt scaled by 10^18 (wei) to avoid floating point precision loss.
 */
const DECIMALS = 18;
const SCALE = 10n ** BigInt(DECIMALS);
const ETH_PATTERN = /^\d+(\.\d{1,18})?$/;

export type EthString = string;

export const isEthString = (value: unknown): value is EthString =>
  typeof value === "string" && ETH_PATTERN.test(value);

export const toWei = (value: EthString): bigint => {
  if (!isEthString(value)) throw new RangeError("Invalid ETH amount");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * SCALE + BigInt(fraction.padEnd(DECIMALS, "0"));
};

export const fromWei = (wei: bigint): EthString => {
  const negative = wei < 0n;
  const abs = negative ? -wei : wei;
  const whole = abs / SCALE;
  const fraction = (abs % SCALE).toString().padStart(DECIMALS, "0").replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
};

export const addEth = (a: EthString, b: EthString): EthString => fromWei(toWei(a) + toWei(b));
export const subEth = (a: EthString, b: EthString): EthString => fromWei(toWei(a) - toWei(b));

export const mulEthInt = (a: EthString, quantity: number): EthString => {
  if (!Number.isInteger(quantity) || quantity < 0) throw new RangeError("Quantity must be a non-negative integer");
  return fromWei(toWei(a) * BigInt(quantity));
};

/** Percentage in basis points (1% = 100 bps), rounded down. */
export const percentEth = (a: EthString, basisPoints: number): EthString =>
  fromWei((toWei(a) * BigInt(basisPoints)) / 10000n);

export const compareEth = (a: EthString, b: EthString): number => {
  const diff = toWei(a) - toWei(b);
  if (diff === 0n) return 0;
  return diff > 0n ? 1 : -1;
};

/** NFT marketplace price presentation, rounded half-up to `maxFraction` digits. */
export const formatEth = (value: EthString, maxFraction = 2, decimalSeparator = ","): string => {
  const wei = toWei(value);
  const unit = 10n ** BigInt(DECIMALS - maxFraction);
  const rounded = (wei + unit / 2n) / unit;
  const base = 10n ** BigInt(maxFraction);
  const whole = rounded / base;
  if (maxFraction === 0) return `${whole}`;
  return `${whole}${decimalSeparator}${(rounded % base).toString().padStart(maxFraction, "0")}`;
};
