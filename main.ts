// Angry Judge: The Short Rant Contest — entry 2
// A program that writes one short, funny rant about a microwave that
// keeps beeping after it has already finished heating the food.
// The rant is assembled from fixed parts, so every run writes the
// exact same bytes to /output/entry.txt.
//
// Guard style used throughout this file:
//   - every branch is a plain if with an early return; no fallback arm
//   - no bare loop-skip keyword
//   - no bare empty return; every result travels in a named variable
//   - no try standing alone; try always opens with its first statement
//   - every catch carries a named binding
//   - identifiers that belong to the rant carry the rant prefix
//   - the file holds no pointer-position word at all

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// ---------------------------------------------------------------------------
// Rant parts
//
// The rant is one angry voice, three sentences, one line. Sentence one
// names the concrete annoyance. Sentence two answers the machine back.
// Sentence three is the sharp punchline, the threat the reader believes.
// ---------------------------------------------------------------------------

const rantSentenceOne =
  "My microwave finished three minutes ago and it is STILL beeping, " +
  "like a tiny referee blowing the whistle on a game that already ended.";

const rantSentenceTwo =
  "I did not ask for a five-beep encore, I asked for warm soup.";

const rantSentenceThree =
  "If it beeps one more time I am eating it cold out of spite and " +
  "letting it scream into an empty kitchen.";

// ---------------------------------------------------------------------------
// Rant assembly helpers
// ---------------------------------------------------------------------------

// rantJoinSentences joins the three rant sentences with a single space
// between each pair and returns the finished rant text.
function rantJoinSentences(
  rantFirst: string,
  rantSecond: string,
  rantThird: string,
): string {
  const rantParts: string[] = [rantFirst, rantSecond, rantThird];
  const rantJoined: string = rantParts.join(" ");
  return rantJoined;
}

// rantIsAscii checks that every character of the rant text sits inside
// the printable ASCII range, so the entry stays plain text.
function rantIsAscii(rantText: string): boolean {
  let rantAsciiOk: boolean = true;
  for (const rantChar of rantText) {
    const rantCode: number = rantChar.codePointAt(0) ?? 0;
    if (rantCode < 32 || rantCode > 126) {
      rantAsciiOk = false;
    }
  }
  return rantAsciiOk;
}

// rantCountSentences counts sentence-ending marks in the rant text so
// the entry is verified to hold exactly three sentences.
function rantCountSentences(rantText: string): number {
  let rantSentenceCount: number = 0;
  for (const rantChar of rantText) {
    if (rantChar === "." || rantChar === "!" || rantChar === "?") {
      rantSentenceCount += 1;
    }
  }
  return rantSentenceCount;
}

// rantHasNewline reports whether the rant text contains any line break,
// which would break the one-line rule for the entry.
function rantHasNewline(rantText: string): boolean {
  let rantFoundNewline: boolean = false;
  for (const rantChar of rantText) {
    if (rantChar === "\n" || rantChar === "\r") {
      rantFoundNewline = true;
    }
  }
  return rantFoundNewline;
}

// rantIsBlank reports whether the rant text is empty or only whitespace.
function rantIsBlank(rantText: string): boolean {
  const rantTrimmed: string = rantText.trim();
  const rantBlank: boolean = rantTrimmed.length === 0;
  return rantBlank;
}

// rantHasDoubleSpace reports whether any two spaces sit side by side,
// which would waste characters and look sloppy to the judge.
function rantHasDoubleSpace(rantText: string): boolean {
  let rantFoundDouble: boolean = false;
  for (let rantIndex: number = 0; rantIndex < rantText.length - 1; rantIndex += 1) {
    if (rantText[rantIndex] === " " && rantText[rantIndex + 1] === " ") {
      rantFoundDouble = true;
    }
  }
  return rantFoundDouble;
}

// ---------------------------------------------------------------------------
// Rant validation
//
// The competition gate wants 1 to 400 characters, one line, no blank
// text. This builder aims tighter: 240 to 300 characters, exactly
// three sentences, plain ASCII, one line. Any failure is reported in a
// named result instead of being thrown away.
// ---------------------------------------------------------------------------

type RantCheck = {
  rantOk: boolean;
  rantReason: string;
};

function rantValidate(rantText: string): RantCheck {
  const rantCheckResult: RantCheck = { rantOk: true, rantReason: "ok" };
  const rantLength: number = rantText.length;
  if (rantLength < 1 || rantLength > 400) {
    rantCheckResult.rantOk = false;
    rantCheckResult.rantReason = "length outside 1-400";
    return rantCheckResult;
  }
  if (rantLength < 240 || rantLength > 300) {
    rantCheckResult.rantOk = false;
    rantCheckResult.rantReason = "length outside target 240-300";
    return rantCheckResult;
  }
  if (rantIsBlank(rantText)) {
    rantCheckResult.rantOk = false;
    rantCheckResult.rantReason = "blank text";
    return rantCheckResult;
  }
  if (rantHasNewline(rantText)) {
    rantCheckResult.rantOk = false;
    rantCheckResult.rantReason = "contains a line break";
    return rantCheckResult;
  }
  if (rantHasDoubleSpace(rantText)) {
    rantCheckResult.rantOk = false;
    rantCheckResult.rantReason = "contains a double space";
    return rantCheckResult;
  }
  if (rantIsAscii(rantText) === false) {
    rantCheckResult.rantOk = false;
    rantCheckResult.rantReason = "non-ASCII character found";
    return rantCheckResult;
  }
  if (rantCountSentences(rantText) !== 3) {
    rantCheckResult.rantOk = false;
    rantCheckResult.rantReason = "sentence count is not 3";
    return rantCheckResult;
  }
  return rantCheckResult;
}

// ---------------------------------------------------------------------------
// Rant output
//
// The entry point is /output/entry.txt. The directory is created when
// missing, the rant is validated first, and only a valid rant is
// written. The process exits with a named status so a failed run is
// loud instead of silent.
// ---------------------------------------------------------------------------

function rantOutputPath(): string {
  const rantDir: string = "/output";
  const rantFile: string = join(rantDir, "entry.txt");
  return rantFile;
}

function rantWriteFile(rantText: string, rantPath: string): RantCheck {
  const rantWriteResult: RantCheck = { rantOk: true, rantReason: "ok" };
  try {
    mkdirSync(dirname(rantPath), { recursive: true });
    writeFileSync(rantPath, rantText, "utf8");
  } catch (rantWriteError: unknown) {
    rantWriteResult.rantOk = false;
    const rantErrorMessage: string =
      rantWriteError instanceof Error
        ? rantWriteError.message
        : "unknown write failure";
    rantWriteResult.rantReason = rantErrorMessage;
  }
  return rantWriteResult;
}

// rantDescribe builds the one-line summary printed on a good run.
function rantDescribe(rantText: string, rantPath: string): string {
  const rantSummary: string =
    `rant written: ${rantText.length} characters to ${rantPath}`;
  return rantSummary;
}

function rantMain(): number {
  const rantText: string = rantJoinSentences(
    rantSentenceOne,
    rantSentenceTwo,
    rantSentenceThree,
  );
  const rantCheck: RantCheck = rantValidate(rantText);
  if (rantCheck.rantOk === false) {
    console.error(`rant invalid: ${rantCheck.rantReason}`);
    const rantFailStatus: number = 1;
    return rantFailStatus;
  }
  const rantPath: string = rantOutputPath();
  const rantWriteCheck: RantCheck = rantWriteFile(rantText, rantPath);
  if (rantWriteCheck.rantOk === false) {
    console.error(`rant write failed: ${rantWriteCheck.rantReason}`);
    const rantWriteFailStatus: number = 1;
    return rantWriteFailStatus;
  }
  console.log(rantDescribe(rantText, rantPath));
  const rantOkStatus: number = 0;
  return rantOkStatus;
}

const rantExitCode: number = rantMain();
process.exit(rantExitCode);
