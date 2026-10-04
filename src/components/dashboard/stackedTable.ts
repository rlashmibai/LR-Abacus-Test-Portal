// Class strings that turn an ordinary <table> into a stack of labelled cards
// on small screens, with no change at all above the breakpoint. Put each
// string on the matching element and give every <td> a `data-label` (its
// column heading) - on a phone the <thead> is hidden and that label is
// printed beside each value instead, so nothing needs sideways scrolling.
//
// `md` stacks below 768px (for tables that already fit a tablet); `lg`
// stacks below 1024px (for wide tables, or ones beside the portal sidebar).
// The class names are written out in full so Tailwind can see them.

export const stackedMd = {
  table: "max-md:block max-md:min-w-0",
  head: "max-md:hidden",
  body: "max-md:block max-md:space-y-3 max-md:divide-y-0",
  row: "max-md:block max-md:rounded-xl max-md:bg-paper max-md:p-3.5 max-md:ring-1 max-md:ring-line",
  cell: "max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:py-1 max-md:pr-0 max-md:text-right max-md:before:shrink-0 max-md:before:text-left max-md:before:text-xs max-md:before:font-semibold max-md:before:uppercase max-md:before:tracking-wide max-md:before:text-ink-faint max-md:before:content-[attr(data-label)]",
};

export const stackedLg = {
  table: "max-lg:block max-lg:min-w-0",
  head: "max-lg:hidden",
  body: "max-lg:block max-lg:space-y-3 max-lg:divide-y-0",
  row: "max-lg:block max-lg:rounded-xl max-lg:bg-paper max-lg:p-3.5 max-lg:ring-1 max-lg:ring-line",
  cell: "max-lg:flex max-lg:items-baseline max-lg:justify-between max-lg:gap-4 max-lg:py-1 max-lg:pr-0 max-lg:text-right max-lg:before:shrink-0 max-lg:before:text-left max-lg:before:text-xs max-lg:before:font-semibold max-lg:before:uppercase max-lg:before:tracking-wide max-lg:before:text-ink-faint max-lg:before:content-[attr(data-label)]",
};
