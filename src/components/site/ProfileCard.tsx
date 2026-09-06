import photo from "@/assets/jiyul.png";
import photoHover from "@/assets/jiyul-alt.webp";
import { useContent } from "@/lib/content";
import { useCopy } from "@/lib/copy";
import { LocalClock } from "@/components/site/LocalClock";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { LangToggle } from "@/components/site/LangToggle";
import { Editable } from "@/components/site/Editable";
import { useEdit } from "@/lib/edit";
import { useLang } from "@/lib/i18n";
import { emit } from "@/lib/bus";

function Action({
  children,
  primary,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      className={
        "rounded-[3px] px-[10px] py-[5px] font-sans text-[12.5px] transition-colors duration-200 " +
        (primary
          ? "bg-ink text-paper hover:bg-mark"
          : "border border-rule text-soft hover:border-mark/50 hover:text-mark")
      }
    >
      {children}
    </button>
  );
}

/**
 * The masthead. Same information a profile page would carry, laid out for
 * reading rather than for a feed.
 */
export function ProfileCard() {
  const { profile } = useContent();
  const copy = useCopy();
  const lang = useLang();
  const { editing } = useEdit();

  // Whichever script the reader is in leads; the other trails. Both are one
  // value rather than two translations, so both carry a shared path.
  const primary = lang === "ko" ? "shared.profile.hangul" : "shared.profile.name";
  const secondary = lang === "ko" ? "shared.profile.name" : "shared.profile.hangul";
  const nameFor = (path: string) =>
    path === "shared.profile.hangul" ? profile.hangul : profile.name;

  return (
    <header id="top" className="pt-10 sm:pt-14">
      <div
        aria-hidden
        data-print="hide"
        className="h-24 w-full overflow-hidden rounded-[3px] border border-rule bg-panel sm:h-28"
      >
        <div className="hairline-grid h-full w-full" />
      </div>

      <div className="relative -mt-12 flex flex-col gap-4 px-4 sm:-mt-14 sm:flex-row sm:items-end sm:gap-5 sm:px-6">
        {/*
          Two photographs in one frame: the second one comes up while the
          cursor is on it and goes back down on the way out. It is dropped from
          print, where the page is a resume and one face is enough.
        */}
        <div className="group/portrait relative size-[5.5rem] shrink-0 overflow-hidden rounded-[3px] border border-rule bg-paper shadow-[0_8px_24px_-16px_rgba(0,0,0,0.55)] sm:size-[6.5rem]">
          <img
            src={photo}
            alt=""
            width={827}
            height={1063}
            className="size-full object-cover object-top transition-opacity duration-300 group-hover/portrait:opacity-0"
          />
          <img
            src={photoHover}
            alt=""
            aria-hidden
            data-print="hide"
            width={1080}
            height={1440}
            className="absolute inset-0 size-full object-cover object-center opacity-0 transition-opacity duration-300 group-hover/portrait:opacity-100"
          />
        </div>

        <div className="min-w-0 pb-1">
          <h1 className="text-[2.1rem] font-medium leading-none tracking-[-0.01em]">
            <Editable path={primary}>{nameFor(primary)}</Editable>
          </h1>
          <p className="mt-[6px] font-sans text-[13px] text-soft">
            <Editable path={secondary}>{nameFor(secondary)}</Editable> ·{" "}
            <Editable path="profile.location">{profile.location}</Editable>
          </p>
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-2 pb-1 sm:flex" data-print="hide">
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="mt-7 px-4 sm:px-6">
        <Editable as="p" path="profile.lede" className="text-[19px] leading-[1.55]">
          {profile.lede}
        </Editable>
        <Editable as="p" path="profile.intro" className="mt-4">
          {profile.intro}
        </Editable>

        <div className="mt-6 flex flex-wrap items-center gap-2" data-print="hide">
          <Action
            primary
            onClick={() => {
              window.location.href = `mailto:${profile.email}`;
            }}
          >
            {copy.masthead.emailMe}
          </Action>
          <Action
            onClick={() => {
              navigator.clipboard
                ?.writeText(profile.email)
                .then(() => emit("toast", copy.masthead.emailCopied))
                .catch(() => emit("toast", profile.email));
            }}
          >
            {copy.masthead.copyAddress}
          </Action>
          <Action onClick={() => window.open(profile.site.href, "_blank", "noopener,noreferrer")}>
            {profile.site.label} ↗
          </Action>
          <Action onClick={() => window.print()}>{copy.masthead.printResume}</Action>
          <Action onClick={() => emit("palette:open")}>
            <span className="font-mono text-[11px]">⌘K</span>
          </Action>
          <Action primary={editing} onClick={() => emit("edit:toggle")}>
            {editing ? copy.edit.buttonOn : copy.edit.button}
          </Action>
          {/* The pair above the lede is hidden on small screens. */}
          <LangToggle className="sm:hidden" />
        </div>

        <div className="mt-5">
          <LocalClock />
        </div>
      </div>
    </header>
  );
}
