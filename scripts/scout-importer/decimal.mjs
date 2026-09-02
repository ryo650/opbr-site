function pow10(exponent) {
  return 10n ** BigInt(exponent);
}

export function decimal(value) {
  const source = String(value).trim();
  const match = source.match(/^([+-]?)(\d+)(?:\.(\d+))?$/);
  if (!match) {
    throw new Error(`Invalid decimal value: ${value}`);
  }

  const fraction = match[3] ?? "";
  const sign = match[1] === "-" ? -1n : 1n;
  return normalizeDecimal({
    units: sign * BigInt(`${match[2]}${fraction}`),
    scale: fraction.length,
  });
}

export function normalizeDecimal(value) {
  let { units, scale } = value;
  while (scale > 0 && units % 10n === 0n) {
    units /= 10n;
    scale -= 1;
  }
  return { units, scale };
}

function align(left, right) {
  const scale = Math.max(left.scale, right.scale);
  return {
    left: left.units * pow10(scale - left.scale),
    right: right.units * pow10(scale - right.scale),
    scale,
  };
}

export function addDecimal(left, right) {
  const aligned = align(left, right);
  return normalizeDecimal({
    units: aligned.left + aligned.right,
    scale: aligned.scale,
  });
}

export function subtractDecimal(left, right) {
  const aligned = align(left, right);
  return normalizeDecimal({
    units: aligned.left - aligned.right,
    scale: aligned.scale,
  });
}

export function multiplyDecimalByInteger(value, multiplier) {
  if (!Number.isSafeInteger(multiplier)) {
    throw new Error(`Decimal multiplier must be a safe integer: ${multiplier}`);
  }
  return normalizeDecimal({
    units: value.units * BigInt(multiplier),
    scale: value.scale,
  });
}

export function compareDecimal(left, right) {
  const aligned = align(left, right);
  if (aligned.left < aligned.right) return -1;
  if (aligned.left > aligned.right) return 1;
  return 0;
}

export function decimalToString(value) {
  const normalized = normalizeDecimal(value);
  const sign = normalized.units < 0 ? "-" : "";
  const digits = (normalized.units < 0 ? -normalized.units : normalized.units).toString();
  if (normalized.scale === 0) return `${sign}${digits}`;
  const padded = digits.padStart(normalized.scale + 1, "0");
  const integer = padded.slice(0, -normalized.scale);
  const fraction = padded.slice(-normalized.scale);
  return `${sign}${integer}.${fraction}`;
}

export function decimalToNumber(value) {
  return Number(decimalToString(value));
}

export function sumDecimals(values) {
  return values.reduce(
    (total, value) => addDecimal(total, value),
    decimal("0"),
  );
}
