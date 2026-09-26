import { describe, expect, it } from "vitest";
import { mergeLyricTimelines } from "../src/utils/mergeLyricTimelines";

describe("mergeLyricTimelines", () => {
  it("should merge with different timestamps, carrying forward values", () => {
    const result = mergeLyricTimelines(
      [
        { time: 0, text: "Hello" },
        { time: 2, text: "World" },
      ],
      [
        { time: 1, text: "你好" },
        { time: 2, text: "世界" },
        { time: 3, text: "!" },
      ],
    );

    expect(result).toEqual([
      { time: 0, text: "Hello" },
      { time: 1, text: "Hello", translation: "你好" },
      { time: 2, text: "World", translation: "世界" },
      { time: 3, text: "World", translation: "!" },
    ]);
  });

  it("should carry forward translation when only original changes", () => {
    const result = mergeLyricTimelines(
      [
        { time: 0, text: "Hello" },
        { time: 2, text: "World" },
      ],
      [{ time: 0, text: "你好" }],
    );

    expect(result).toEqual([
      { time: 0, text: "Hello", translation: "你好" },
      { time: 2, text: "World", translation: "你好" },
    ]);
  });

  it("should carry forward original when only translation changes", () => {
    const result = mergeLyricTimelines(
      [{ time: 0, text: "Hello" }],
      [
        { time: 0, text: "你好" },
        { time: 2, text: "世界" },
      ],
    );

    expect(result).toEqual([
      { time: 0, text: "Hello", translation: "你好" },
      { time: 2, text: "Hello", translation: "世界" },
    ]);
  });

  it("should handle same timestamps correctly", () => {
    const result = mergeLyricTimelines(
      [
        { time: 0, text: "Hello" },
        { time: 1, text: "World" },
      ],
      [
        { time: 0, text: "你好" },
        { time: 1, text: "世界" },
      ],
    );

    expect(result).toEqual([
      { time: 0, text: "Hello", translation: "你好" },
      { time: 1, text: "World", translation: "世界" },
    ]);
  });

  it("should return empty array for empty inputs", () => {
    expect(mergeLyricTimelines([], [])).toEqual([]);
  });

  it("should use empty string for original text when translation precedes first original line", () => {
    const result = mergeLyricTimelines(
      [{ time: 2, text: "World" }],
      [{ time: 0, text: "你好" }],
    );

    expect(result).toEqual([
      { time: 0, text: "", translation: "你好" },
      { time: 2, text: "World", translation: "你好" },
    ]);
  });

  it("should omit translation key when no translation exists", () => {
    const result = mergeLyricTimelines(
      [
        { time: 0, text: "Hello" },
        { time: 1, text: "World" },
      ],
      [],
    );

    expect(result).toEqual([
      { time: 0, text: "Hello" },
      { time: 1, text: "World" },
    ]);
  });
});
