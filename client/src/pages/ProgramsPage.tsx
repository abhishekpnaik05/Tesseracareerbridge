import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ProgramListItemDto, ProgramListResponse, ProgramSort } from "@tesseracareerbridge/shared";
import { PROGRAM_SORTS } from "@tesseracareerbridge/shared";
import { PageMeta } from "../components/seo/PageMeta";
import {
  BottomSheet,
  Button,
  EmptyState,
  ErrorState,
  Field,
  Pagination,
  SearchInput,
  Select,
  Skeleton,
} from "../components/ui";
import { ProgramCard } from "../components/internship";
import { listPublicPrograms, programAvailabilityLabel, programCardProps } from "../lib/programs";

const LIMIT = 12;

type DraftFilters = {
  category: string;
  level: string;
  duration: string;
  availability: string;
  featured: string;
};

function param(value: string | null, fallback = "all") {
  return value && value.trim() ? value : fallback;
}

function isSort(value: string | null): ProgramSort {
  if (value && (PROGRAM_SORTS as readonly string[]).includes(value)) return value as ProgramSort;
  return "featured";
}

function FilterFields({
  idPrefix,
  facets,
  values,
  onChange,
}: {
  idPrefix: string;
  facets: ProgramListResponse["facets"];
  values: DraftFilters;
  onChange: (next: Partial<DraftFilters>) => void;
}) {
  return (
    <>
      <Field label="Category" htmlFor={`${idPrefix}-category`}>
        <Select
          id={`${idPrefix}-category`}
          value={values.category}
          onChange={(e) => onChange({ category: e.target.value })}
        >
          <option value="all">All categories</option>
          {facets.categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Level" htmlFor={`${idPrefix}-level`}>
        <Select id={`${idPrefix}-level`} value={values.level} onChange={(e) => onChange({ level: e.target.value })}>
          <option value="all">All levels</option>
          {facets.levels.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Duration" htmlFor={`${idPrefix}-duration`}>
        <Select
          id={`${idPrefix}-duration`}
          value={values.duration}
          onChange={(e) => onChange({ duration: e.target.value })}
        >
          <option value="all">All durations</option>
          {facets.durations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Availability" htmlFor={`${idPrefix}-availability`}>
        <Select
          id={`${idPrefix}-availability`}
          value={values.availability}
          onChange={(e) => onChange({ availability: e.target.value })}
        >
          <option value="all">All</option>
          {facets.availabilities.map((item) => (
            <option key={item} value={item}>
              {programAvailabilityLabel(item)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Featured" htmlFor={`${idPrefix}-featured`}>
        <Select
          id={`${idPrefix}-featured`}
          value={values.featured}
          onChange={(e) => onChange({ featured: e.target.value })}
        >
          <option value="all">All programs</option>
          <option value="true">Featured only</option>
        </Select>
      </Field>
    </>
  );
}

export function ProgramsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const category = param(searchParams.get("category"));
  const level = param(searchParams.get("level"));
  const duration = param(searchParams.get("duration"));
  const availability = param(searchParams.get("availability"));
  const featured = searchParams.get("featured") === "true" ? "true" : "all";
  const sort = isSort(searchParams.get("sort"));
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [catalog, setCatalog] = useState<ProgramListResponse | null>(null);
  const [featuredItems, setFeaturedItems] = useState<ProgramListItemDto[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [reload, setReload] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<DraftFilters>({
    category,
    level,
    duration,
    availability,
    featured,
  });

  const applied: DraftFilters = useMemo(
    () => ({ category, level, duration, availability, featured }),
    [category, level, duration, availability, featured],
  );

  const filtersActive = Boolean(
    search.trim() ||
      category !== "all" ||
      level !== "all" ||
      duration !== "all" ||
      availability !== "all" ||
      featured === "true",
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput.trim() === search.trim()) return;
      patchParams({ search: searchInput.trim(), page: "1" });
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- patchParams is stable enough via searchParams
  }, [searchInput]);

  function patchParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(next)) {
      const omit =
        !value ||
        value === "all" ||
        (key === "page" && value === "1") ||
        (key === "sort" && value === "featured");
      if (omit) params.delete(key);
      else params.set(key, value);
    }
    setSearchParams(params, { replace: true });
  }

  function applyDraft(next: DraftFilters) {
    patchParams({
      category: next.category,
      level: next.level,
      duration: next.duration,
      availability: next.availability,
      featured: next.featured === "true" ? "true" : "all",
      page: "1",
    });
  }

  function clearFilters() {
    setSearchInput("");
    setSearchParams({}, { replace: true });
  }

  useEffect(() => {
    let active = true;
    setStatus("loading");
    listPublicPrograms({
      search: search.trim() || undefined,
      category,
      level,
      duration,
      availability,
      featured: featured === "true",
      sort,
      page,
      limit: LIMIT,
    })
      .then((data) => {
        if (!active) return;
        setCatalog(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [search, category, level, duration, availability, featured, sort, page, reload]);

  useEffect(() => {
    let active = true;
    listPublicPrograms({ featured: true, sort: "featured", limit: 6 })
      .then((data) => {
        if (!active) return;
        setFeaturedItems(data.items);
      })
      .catch(() => {
        if (!active) return;
        setFeaturedItems([]);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  const facets = catalog?.facets ?? { categories: [], levels: [], durations: [], availabilities: [] };
  const pages = catalog ? Math.max(1, Math.ceil(catalog.total / catalog.pageSize)) : 1;

  return (
    <>
      <PageMeta
        title="TesseraCareerBridge | Internship Programs"
        description="Find a structured internship program that matches your career goals. Search by name, skill, or category."
      />
      <div className="container page-hero">
        <p className="t-label">Programs</p>
        <h1>Find the internship program that matches your career goals.</h1>
        <p className="pub-lead">
          Browse published internships by skill, level, and duration. Each program uses the same day-wise learning
          model. Enrollment processing opens in a later step.
        </p>
      </div>
      <div className="container pub-page-end">
        <div className="program-search">
          <Field label="Search internship programs" htmlFor="program-search">
            <SearchInput
              id="program-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search internship programs..."
              autoComplete="off"
            />
          </Field>
        </div>

        <div className="program-toolbar">
          <Field label="Sort" htmlFor="program-sort">
            <Select
              id="program-sort"
              value={sort}
              onChange={(e) => patchParams({ sort: e.target.value, page: "1" })}
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="duration">Duration</option>
              <option value="name">Name</option>
            </Select>
          </Field>
          <Button
            className="program-filter-trigger"
            variant="secondary"
            type="button"
            onClick={() => {
              setDraft(applied);
              setSheetOpen(true);
            }}
          >
            Filters
          </Button>
        </div>

        <div className="filters filters-desktop">
          <FilterFields
            idPrefix="desk"
            facets={facets}
            values={applied}
            onChange={(next) => applyDraft({ ...applied, ...next })}
          />
        </div>

        <BottomSheet open={sheetOpen} title="Filters" onClose={() => setSheetOpen(false)}>
          <div className="program-sheet-fields">
            <FilterFields idPrefix="sheet" facets={facets} values={draft} onChange={(next) => setDraft({ ...draft, ...next })} />
          </div>
          <div className="program-sheet-actions">
            <Button
              variant="ghost"
              type="button"
              onClick={() =>
                setDraft({ category: "all", level: "all", duration: "all", availability: "all", featured: "all" })
              }
            >
              Clear filters
            </Button>
            <Button variant="secondary" type="button" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                applyDraft(draft);
                setSheetOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </BottomSheet>

        {!filtersActive && featuredItems.length > 0 ? (
          <section className="program-featured" aria-labelledby="featured-heading">
            <h2 id="featured-heading">Featured programs</h2>
            <div className="card-grid">
              {featuredItems.map((program) => (
                <ProgramCard key={program.id} {...programCardProps(program)} />
              ))}
            </div>
          </section>
        ) : null}

        {status === "loading" ? (
          <div className="card-grid" aria-busy="true">
            <Skeleton style={{ height: 280 }} />
            <Skeleton style={{ height: 280 }} />
            <Skeleton style={{ height: 280 }} />
          </div>
        ) : null}

        {status === "error" ? (
          <ErrorState title="Unable to load programs." body="Check your connection and try again.">
            <Button type="button" onClick={() => setReload((n) => n + 1)}>
              Try again
            </Button>
          </ErrorState>
        ) : null}

        {status === "ready" && catalog && catalog.items.length === 0 ? (
          <EmptyState
            title={filtersActive ? "No programs match your filters." : "No programs found."}
            body={
              filtersActive
                ? "Try a different search, clear filters, or browse the full catalog."
                : "Published internship programs will appear here."
            }
          >
            {filtersActive ? (
              <Button type="button" variant="secondary" onClick={clearFilters}>
                Reset filters
              </Button>
            ) : null}
          </EmptyState>
        ) : null}

        {status === "ready" && catalog && catalog.items.length > 0 ? (
          <>
            <h2>All programs</h2>
            <p className="t-caption program-count">
              {catalog.total} program{catalog.total === 1 ? "" : "s"}
            </p>
            <div className="card-grid">
              {catalog.items.map((program) => (
                <ProgramCard key={program.id} {...programCardProps(program)} />
              ))}
            </div>
            {pages > 1 ? (
              <Pagination
                page={catalog.page}
                pages={pages}
                onPrevious={() => patchParams({ page: String(catalog.page - 1) })}
                onNext={() => patchParams({ page: String(catalog.page + 1) })}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </>
  );
}
