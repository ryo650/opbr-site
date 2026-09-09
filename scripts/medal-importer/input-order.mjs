function orderKey(sequence) {
  return `${sequence.number}:${sequence.suffix}`;
}

export function parseImageSequence(file) {
  const match = file.match(/^IMG_(\d+)(?:_(\d+))?\.(?:png|jpe?g)$/i);
  if (!match) return null;
  return {
    number: Number(match[1]),
    suffix: match[2] ? Number(match[2]) : 0,
  };
}

export function resolveInputOrder(items) {
  const allHaveSequence = items.every((item) => item.sequence !== null);
  const uniqueSequences =
    new Set(items.map((item) => item.sequence && orderKey(item.sequence))).size ===
    items.length;

  if (allHaveSequence && uniqueSequences) {
    const ordered = [...items].sort(
      (left, right) =>
        left.sequence.number - right.sequence.number ||
        left.sequence.suffix - right.sequence.suffix ||
        left.file.localeCompare(right.file),
    );
    const warnings = [];

    for (let index = 1; index < ordered.length; index += 1) {
      const previous = ordered[index - 1];
      const current = ordered[index];
      if (
        previous.captureTime &&
        current.captureTime &&
        previous.captureTime >= current.captureTime
      ) {
        warnings.push(
          `${previous.file} (${previous.captureTime}) -> ${current.file} (${current.captureTime})`,
        );
      }
    }

    return { ordered, source: "filename sequence", warnings };
  }

  const allHaveCaptureTime = items.every((item) => item.captureTime);
  if (!allHaveCaptureTime) {
    throw new Error(
      "Filename sequences are unavailable or ambiguous, and not every screenshot has an EXIF capture timestamp",
    );
  }

  const captureTimes = items.map((item) => item.captureTime);
  if (new Set(captureTimes).size !== captureTimes.length) {
    throw new Error(
      "Filename sequences are unavailable or ambiguous, and EXIF capture timestamps are not unique",
    );
  }

  return {
    ordered: [...items].sort(
      (left, right) =>
        left.captureTime.localeCompare(right.captureTime) ||
        left.file.localeCompare(right.file),
    ),
    source: "EXIF DateTimeOriginal",
    warnings: [],
  };
}
