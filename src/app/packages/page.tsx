import React from "react";
import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Package, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Packages",
  description: "Open source packages and libraries I've built",
};

interface NpmPackage {
  name: string;
  version: string;
  description: string;
  links: {
    npm: string;
    homepage?: string;
    repository?: string;
  };
  date: string;
  downloads?: number;
}

async function getPackages(): Promise<NpmPackage[]> {
  try {
    const response = await fetch(
      "https://registry.npmjs.org/-/v1/search?text=author:ruijadom&size=250",
      { next: { revalidate: 3600 } } // Revalidate every hour
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch packages");
    }

    const data = await response.json();
    
    return data.objects.map((obj: any) => ({
      name: obj.package.name,
      version: obj.package.version,
      description: obj.package.description || "No description available",
      links: {
        npm: obj.package.links.npm,
        homepage: obj.package.links.homepage,
        repository: obj.package.links.repository,
      },
      date: obj.package.date,
      downloads: obj.package.downloads,
    }));
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <div className="container relative max-w-6xl py-6 lg:py-10">
      <PageHeader
        title="Packages"
        description="Open source packages and libraries I've built and published to npm"
      />
      <hr className="my-8" />

      {packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="mb-4 size-12 text-muted-foreground" />
          <p className="text-muted-foreground">No packages found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="group relative flex flex-col rounded-lg border bg-secondary/50 p-6 transition-all hover:border-primary/50 hover:bg-secondary"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Package className="size-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  v{pkg.version}
                </span>
              </div>

              <p className="mb-4 flex-1 text-sm text-muted-foreground">
                {pkg.description}
              </p>

              <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  <span>
                    {new Date(pkg.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={pkg.links.npm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  npm
                  <ExternalLink className="size-3" />
                </Link>

                {pkg.links.repository && (
                  <Link
                    href={pkg.links.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
                  >
                    Repository
                    <ExternalLink className="size-3" />
                  </Link>
                )}

                {pkg.links.homepage && pkg.links.homepage !== pkg.links.repository && (
                  <Link
                    href={pkg.links.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
                  >
                    Homepage
                    <ExternalLink className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
