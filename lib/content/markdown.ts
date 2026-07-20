export function assertContinuousHeadingLevels(markdown: string) {
  const levels = [...markdown.matchAll(/^(#{1,6})\s+/gm)].map(
    ([, hashes]) => hashes.length,
  );

  if (levels.length === 0) {
    return;
  }

  if (levels[0] !== 1) {
    throw new Error("Markdown 必须从一级标题开始。");
  }

  for (let index = 1; index < levels.length; index += 1) {
    if (levels[index] > levels[index - 1] + 1) {
      throw new Error("Markdown 标题层级不能跳级。");
    }
  }
}
