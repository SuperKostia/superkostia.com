import { cn } from "@/lib/utils";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "header" | "footer" | "article" | "nav";
  /** `wide` : 1360 px (héros, grilles) ; `default` : 1200 px ; `prose` : 760 px. */
  size?: "wide" | "default" | "prose";
};

/** Colonne centrée avec les marges latérales du site. */
export function Container({ className, as: Tag = "div", size = "default", ...rest }: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        size === "wide" && "max-w-[1360px]",
        size === "default" && "max-w-[1200px]",
        size === "prose" && "max-w-[760px]",
        className,
      )}
      {...rest}
    />
  );
}
