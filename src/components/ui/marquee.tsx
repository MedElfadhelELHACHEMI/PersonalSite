import { cn } from '@/lib/utils'

export default function Marquee({
  items,
  className,
}: {
  items: string[]
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative flex w-full overflow-x-hidden border-b-2 border-t-2 border-border bg-stone-50 font-base text-text dark:border-darkBorder dark:bg-secondaryBlack dark:text-darkText',
        className,
      )}
    >
      <div className="animate-marquee whitespace-nowrap py-12">
        {items.map((item) => {
          return (
            <span key={item} className="mx-4 text-4xl">
              {item}
            </span>
          )
        })}
      </div>

      <div className="absolute top-0 animate-marquee2 whitespace-nowrap py-12">
        {items.map((item) => {
          return (
            <span key={item} className="mx-4 text-4xl">
              {item}
            </span>
          )
        })}
      </div>

      {/* must have both of these in order to work */}
    </div>
  )
}
