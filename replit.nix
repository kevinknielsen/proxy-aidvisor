
{ pkgs }: {
  deps = [
    pkgs.nodejs_latest
    pkgs.git-filter-repo
    pkgs.git-lfs
    pkgs.nodePackages.pnpm
    pkgs.nodePackages.typescript
  ];
}
